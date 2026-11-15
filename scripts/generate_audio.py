#!/usr/bin/env python3
"""
generate_audio.py - unified narration generator for every episode.

Reads   episodes/<slug>/script.txt  (// ACT N markers delimit acts; [src: ...] stripped)
Reads   episodes/<slug>/scene.json  (optional: title, series, voice, rate, tail, anchors)
Writes  public/audio/<slug>/full_voiceover.mp3
        public/audio/<slug>/metadata.json

Act boundaries are derived from the word token counts of each act block — never
hand-tuned. If the spoken word stream disagrees with the token counts, the act
split falls back to thirds and a warning is printed (fail loud, not silently wrong).

Usage:
  uv run --with edge-tts,mutagen python scripts/generate_audio.py <slug>           # generate if missing
  uv run --with edge-tts,mutagen python scripts/generate_audio.py <slug> --force   # regenerate
  uv run --with edge-tts,mutagen python scripts/generate_audio.py <slug> --dry-run # parse-check only, no TTS
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULTS = {
    "voice": "en-US-AriaNeural",
    "rate": "+12%",
    "tail": 2.0,
    "width": 1080,
    "height": 1920,
    "fps": 30,
}

COMMENT_RE = None
SRC_RE = None
WORDS_RE = None

import re
COMMENT_RE = re.compile(r"^\s*//.*$", re.MULTILINE)
SRC_RE = re.compile(r"\[src:[^\]]*\]")
WORDS_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9\-']*")
ACT_MARKER_RE = re.compile(r"^//\s*ACT\s*\d+.*$", re.MULTILINE)


def token_count(text: str) -> int:
    return len(WORDS_RE.findall(text))


def load_clean_script(raw: str):
    """Split on `// ACT N` markers; return (full_text, acts:list[str], labels:list[str])."""
    # normalize line endings so ^\s*// works regardless of file origin
    raw = raw.replace("\r\n", "\n")
    parts = re.split(r"(?m)(^//\s*ACT\s*\d+.*$)", raw)
    # parts: [preamble, marker1, body1, marker2, body2, ...]
    acts = []
    labels = []
    i = 1
    while i + 1 <= len(parts) - 1:
        marker = parts[i].strip()
        body = parts[i + 1] if i + 1 < len(parts) else ""
        body = SRC_RE.sub("", body)
        body = COMMENT_RE.sub("", body)
        body = re.sub(r"\s+", " ", body).strip()
        if body:
            acts.append(body)
            labels.append(marker)
        i += 2
    if not acts:
        # no ACT markers: single act with the whole cleaned script
        body = SRC_RE.sub("", raw)
        body = COMMENT_RE.sub("", body)
        body = re.sub(r"\s+", " ", body).strip()
        acts.append(body)
        labels.append("FULL VOICEOVER")
    return " ".join(acts), acts, labels


async def synth_episode(slug: str, args) -> int:
    ep_dir = ROOT / "episodes" / slug
    script_path = ep_dir / "script.txt"
    scene_path = ep_dir / "scene.json"

    if not script_path.exists():
        print(f"[FAIL] episodes/{slug}/script.txt not found — create it first.", file=sys.stderr)
        return 2

    scene = {}
    if scene_path.exists():
        scene = json.loads(scene_path.read_text(encoding="utf-8"))

    voice = scene.get("voice", DEFAULTS["voice"])
    rate = scene.get("rate", DEFAULTS["rate"])
    tail = float(scene.get("tail", DEFAULTS["tail"]))
    title = scene.get("title", slug)
    series = scene.get("series")

    out_dir = ROOT / "public" / "audio" / slug
    if args.out:
        out_dir = Path(args.out)
    out_mp3 = out_dir / "full_voiceover.mp3"
    metadata_path = out_dir / "metadata.json"

    full_text, acts, labels = load_clean_script(script_path.read_text(encoding="utf-8"))
    counts = [token_count(a) for a in acts]
    total_tokens = token_count(full_text)

    if not 60 <= total_tokens <= 75:
        print(f"[warn] word-count {total_tokens} outside 60-75 — report it, do not silently adjust the script.", file=sys.stderr)
    else:
        print(f"[check] word-count {total_tokens} OK ({len(acts)} act(s), {counts} tokens)")

    # anchor requirements (validated post-synthesis)
    anchors_req = scene.get("anchors", {})  # { "word": [1, 2], ... }

    if args.dry_run:
        print(f"[dry ] {len(full_text)} chars, {len(acts)} act(s), voice={voice} rate={rate} tail={tail}")
        for idx, (lbl, act_text) in enumerate(zip(labels, acts), start=1):
            print(f"[dry ] act {idx}: {lbl}  ({token_count(act_text)} tokens)")
        return 0

    if out_mp3.exists() and metadata_path.exists() and not args.force:
        print(f"[skip] {out_mp3} exists — pass --force to regenerate")
        return 0

    out_dir.mkdir(parents=True, exist_ok=True)

    import edge_tts

    print(f"[tts ] {out_mp3.name} voice={voice} rate={rate}")
    communicate = edge_tts.Communicate(full_text, voice, rate=rate, boundary="WordBoundary")

    words = []
    audio_bytes = 0
    with open(out_mp3, "wb") as f:
        async for chunk in communicate.stream():
            t = chunk.get("type", "unknown")
            if t == "audio":
                f.write(chunk["data"])
                audio_bytes += len(chunk["data"])
            elif t == "WordBoundary":
                start = chunk["offset"] / 1e7
                end = (chunk["offset"] + chunk["duration"]) / 1e7
                words.append({"w": chunk["text"], "start": round(start, 3), "end": round(end, 3)})

    print(f"[tts ] wrote {audio_bytes} bytes, {len(words)} WordBoundary words")
    if not words:
        print("[FAIL] edge-tts returned zero WordBoundary words — refusing to fall back to estimated timings.", file=sys.stderr)
        return 2

    from mutagen.mp3 import MP3

    duration = round(MP3(out_mp3).info.length, 3)
    if not 20 <= duration <= 60:
        print(f"[warn] voiceover duration {duration:.2f}s outside 20-60s — report to owner.", file=sys.stderr)
    print(f"[tts ] duration {duration:.2f}s")

    # ------- act boundaries from token counts of the script ---------
    splits: list[int] = []
    if len(acts) > 1:
        cumulative = 0
        for count in counts[:-1]:
            cumulative += count
            splits.append(cumulative - 1)
        if splits and splits[-1] >= len(words) - 1:
            third = len(words) // len(acts)
            splits = [third * (i + 1) - 1 for i in range(len(acts) - 1)]
            print("[warn] token-count act split exceeded word stream; falling back to even splits", file=sys.stderr)

    act_words: list[list[dict]] = []
    prev = 0
    for s in splits:
        act_words.append(words[prev:s + 1])
        prev = s + 1
    act_words.append(words[prev:])

    act_payload = []
    for idx, w in enumerate(act_words):
        act_payload.append(
            {
                "id": f"act{idx + 1}",
                "index": idx + 1,
                "label": labels[idx] if idx < len(labels) else f"ACT {idx + 1}",
                "caption": labels[idx] if idx < len(labels) else f"ACT {idx + 1}",
                "file": "full_voiceover.mp3",
                "duration": round(w[-1]["end"] - w[0]["start"], 3),
                "start": w[0]["start"],
                "end": w[-1]["end"],
                "words": w,
            }
        )

    print("\n[acts]")
    for a in act_payload:
        print(f"  {a['label']}: {a['start']:.2f}s -> {a['end']:.2f}s  ({len(a['words'])} words)")

    # ------- anchor validation (optional; from scene.json) ---------
    anchor_results = {}
    if anchors_req:
        print("\n[anchors]")
        lower_words = [w["w"].lower() for w in words]
        all_ok = True
        for name, occurrences in anchors_req.items():
            key = name.lower()
            hits = [i for i, w in enumerate(lower_words) if w == key]
            for occ in occurrences:
                if len(hits) < occ:
                    print(f"  {key:<12} (occ {occ}): MISSING (only {len(hits)} occurrence(s))")
                    all_ok = False
                    continue
                idx = hits[occ - 1]
                rkey = f"{key}_{occ}"
                anchor_results[rkey] = {
                    "ok": True,
                    "name": key,
                    "occurrence": occ,
                    "index": idx,
                    "start": words[idx]["start"],
                    "end": words[idx]["end"],
                }
                print(f"  {rkey:<12} idx={idx:2d} start={words[idx]['start']:.3f}s word={words[idx]['w']!r}")
        if not all_ok:
            print("\n[FAIL] one or more anchors missing — beat sheet cannot be applied.", file=sys.stderr)
            return 2

    total_duration = round(duration + tail, 3)
    metadata = {
        "title": title,
        "series": series,
        "width": DEFAULTS["width"],
        "height": DEFAULTS["height"],
        "fps": DEFAULTS["fps"],
        "voice": voice,
        "rate": rate,
        "preroll": 0.0,
        "gap": 0.0,
        "tail": tail,
        "acts": [
            {
                "id": "full",
                "index": 1,
                "label": "FULL VOICEOVER",
                "caption": title,
                "file": "full_voiceover.mp3",
                "duration": duration,
                "start": 0.0,
                "end": duration,
                "words": words,
            }
        ],
        "actBreakdown": act_payload,
        "words": words,
        **({"anchors": anchor_results} if anchor_results else {}),
        "totalDuration": total_duration,
    }
    metadata_path.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print(f"\n[manifest] {metadata_path}  (totalDuration {total_duration}s)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slug", help="episode slug, e.g. milkyway, space-sound, minecraft-edge")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--dry-run", action="store_true", help="parse and validate only; do not synthesize")
    parser.add_argument("--out", default=None, help="override output dir (for non-destructive validation runs)")
    args = parser.parse_args()
    return asyncio.run(synth_episode(args.slug.strip(), args))


if __name__ == "__main__":
    sys.exit(main())
