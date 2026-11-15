#!/usr/bin/env python3
"""
generate_audio.py - Free neural TTS narration for the Internet Shorts video.

Uses edge-tts (Microsoft Edge's free neural voices, no API key required).

Outputs:
  public/audio/act1_dns.mp3
  public/audio/act2_routing.mp3
  public/audio/act3_server.mp3
  public/audio/manifest.json   <- consumed by src/App.tsx and scripts/render_video.mjs

The manifest is the single source of truth for the video timeline:
the React stage is rendered deterministically from `t` (seconds), so audio
durations measured here define every scene boundary in the final MP4.

Usage:
  python scripts/generate_audio.py            # generate missing acts, keep existing
  python scripts/generate_audio.py --force    # regenerate everything
  python scripts/generate_audio.py --voice en-US-GuyNeural
"""

import argparse
import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "public" / "audio"
MANIFEST_PATH = AUDIO_DIR / "manifest.json"

# ---------------------------------------------------------------------------
# Timeline constants (seconds)
# ---------------------------------------------------------------------------
PREROLL = 0.4   # silence before act 1 starts (lets the hook pop in)
GAP = 0.6       # breathing room between acts
TAIL = 1.6      # hold on the end card after the last act finishes

DEFAULT_VOICE = "en-US-AriaNeural"   # neutral female; alt: en-US-GuyNeural
DEFAULT_RATE = "+12%"   # keeps total runtime just under the 60s Shorts ceiling

# ---------------------------------------------------------------------------
# Narration script: "What actually happens when you type a URL?"
# ---------------------------------------------------------------------------
ACTS = [
    {
        "id": "dns",
        "index": 1,
        "file": "act1_dns.mp3",
        "label": "ACT 1",
        "caption": "DNS — the internet's phonebook",
        "text": (
            "You type google dot com and hit enter. But your computer has no idea "
            "where google dot com actually lives. So first, it asks the DNS — think "
            "of it as the internet's phonebook — and the DNS answers with an IP address: "
            "142 dot 250 dot 72 dot 14. Now your computer finally knows where to go."
        ),
    },
    {
        "id": "routing",
        "index": 2,
        "file": "act2_routing.mp3",
        "label": "ACT 2",
        "caption": "Routing — across the globe in milliseconds",
        "text": (
            "Next, your request hits the road. It travels from your laptop, to your "
            "router, to your internet provider — then across massive backbone cables, "
            "some buried under the ocean floor. Bouncing through country after country, "
            "router after router... until it reaches Google's data center."
        ),
    },
    {
        "id": "server",
        "index": 3,
        "file": "act3_server.mp3",
        "label": "ACT 3",
        "caption": "Server — and back in a blink",
        "text": (
            "The server receives your request, whips up the page — HTML, CSS, JavaScript, "
            "images — and sends everything back in tiny packets, right along the same path. "
            "Your browser stitches them all together... and boom. google dot com loads in "
            "under a second. Follow for more byte-sized internet."
        ),
    },
]


def mp3_duration_seconds(path: Path) -> float:
    """Duration via mutagen."""
    from mutagen.mp3 import MP3

    return round(MP3(path).info.length, 3)


async def synth_act(act: dict, voice: str, rate: str) -> tuple[Path, list[dict]]:
    """Stream-synthesize one act MP3 and capture word-level boundary timings.

    Returns (output path, words) where words are relative seconds:
    [{"w": "You", "start": 0.095, "end": 0.430}, ...]
    """
    import edge_tts

    out = AUDIO_DIR / act["file"]
    communicate = edge_tts.Communicate(act["text"], voice, rate=rate, boundary="WordBoundary")

    words: list[dict] = []
    with open(out, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 1e7
                end = (chunk["offset"] + chunk["duration"]) / 1e7
                words.append({"w": chunk["text"], "start": round(start, 3), "end": round(end, 3)})

    return out, words


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--voice", default=DEFAULT_VOICE, help=f"edge-tts voice (default: {DEFAULT_VOICE})")
    parser.add_argument("--rate", default=DEFAULT_RATE, help='Speaking rate, e.g. "+10%%" or "-5%%"')
    parser.add_argument("--force", action="store_true", help="Regenerate audio even if files exist")
    args = parser.parse_args()

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    # 1) Synthesize (skip existing unless --force). Word timings are cached in
    #    <id>_words.json next to the MP3 so re-runs stay offline.
    for act in ACTS:
        out = AUDIO_DIR / act["file"]
        words_path = AUDIO_DIR / f"{act['id']}_words.json"
        if out.exists() and not args.force:
            print(f"[skip] {act['file']} exists ({out.stat().st_size / 1024:.0f} KB) - use --force to regenerate")
            if words_path.exists():
                act["_words"] = json.loads(words_path.read_text(encoding="utf-8"))
            else:
                act["_words"] = []
                print(f"[warn] no cached word timings for {act['id']} — run with --force to enable karaoke")
            continue
        print(f"[tts ] {act['file']}  voice={args.voice} rate={args.rate}")
        try:
            _, words = await synth_act(act, args.voice, args.rate)
            act["_words"] = words
            words_path.write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
            print(f"[tts ]   {len(words)} words captured")
        except Exception as exc:  # network / service errors
            print(f"[FAIL] edge-tts could not generate {act['file']}: {exc}", file=sys.stderr)
            print("       edge-tts needs network access to Microsoft's speech endpoint.", file=sys.stderr)
            return 1

    # 2) Measure durations and build the timeline
    cursor = PREROLL
    manifest_acts = []
    for act in ACTS:
        path = AUDIO_DIR / act["file"]
        duration = mp3_duration_seconds(path)
        start = round(cursor, 3)
        end = round(cursor + duration, 3)
        manifest_acts.append(
            {
                "id": act["id"],
                "index": act["index"],
                "label": act["label"],
                "caption": act["caption"],
                "file": act["file"],
                "duration": duration,
                "start": start,
                "end": end,
                "words": act.get("_words", []),
            }
        )
        word_note = f", {len(act.get('_words', []))} words" if act.get("_words") else ", NO word timings"
        print(f"[time] {act['id']:>7}: {duration:6.2f}s   (start {start:.2f}s -> end {end:.2f}s){word_note}")
        cursor = end + GAP

    total = round(cursor - GAP + TAIL, 3)  # replace trailing gap with the end-card tail

    manifest = {
        "title": "What actually happens when you type a URL?",
        "width": 1080,
        "height": 1920,
        "fps": 30,
        "voice": args.voice,
        "rate": args.rate,
        "preroll": PREROLL,
        "gap": GAP,
        "tail": TAIL,
        "acts": manifest_acts,
        "totalDuration": total,
    }

    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"[manifest] {MANIFEST_PATH}")
    print(f"[total ] {total:.2f}s  ({int(total * manifest['fps'])} frames @ {manifest['fps']}fps)")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
