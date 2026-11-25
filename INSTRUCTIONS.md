# INSTRUCTIONS.md — Daily Dose of Curiosity · idea → posted video

> **What this file is.** The operating playbook an AI agent follows *after* an idea has been grilled.
> It assumes `AGENTS.md` is already read and obeyed. Where the two disagree, **AGENTS.md §2 Hard rules
> win** (determinism, one clock, recorder hooks, output spec, type gate).
>
> **What this file is not.** Not a style moodboard and not a wishlist. Every rule below is either a
> platform requirement, a number measured from a reference video that outperforms us, or a
> repo-internal contract. If a number is a target rather than a platform fact, it is marked **[target]**.

---

## 0. Precedence & reading order

1. `AGENTS.md` — hard rules (determinism, one clock, recorder hooks, ffmpeg audio, output spec, type gate).
2. `INSTRUCTIONS.md` (this file) — the pipeline, the hook spec, the gates.
3. `SCRIPT_GUIDE.md` — narration drafting rules, length table, and `lint_script.mjs` contract.
4. `ART_DIRECTION.md` — visual brief, asset-spec, safe-area, and one-accent rules.
5. `docs/conventions.md`, `docs/pipeline.md`, `docs/determinism.md` — implementation detail.
6. `docs/reference-teardown-dexwonders-sun-vs-uranus.md` — the evidence behind §5 and §6.

If you are unsure whether something is allowed, read AGENTS.md §11 Anti-goals before you write code.

### 0.1 Owner decisions — locked 2026-11-25

These are decided. Do not re-litigate them in a session; if one needs to change, the owner changes it
here first.

| # | Decision | Consequence for the build |
|---|---|---|
| D1 | **Music bed is synthesized in code** (`scripts/synth_bed.py`, same pattern as `synth_sfx.py`) | deterministic, no licence trail, no downloads. Bed is a repo artifact |
| D2 | **Default comment question = preference / would-you-rather** for the next 3 videos | §12.2 pattern 1 is the default; other patterns are experiments |
| D3 | **Post everywhere, same day:** TikTok + YouTube Shorts + Instagram Reels + Facebook Reels | every cover surface in §10.1 is mandatory, not optional. 9:16 is the primary artboard |
| D4 | **Topics are open** — not locked to `cosmic` | ⚠️ this overrides `AGENTS.md` §1 ("one niche, one recurring format… Do not add topic categories"). See §0.2 for how to keep it safe |
| D5 | **No performance baseline yet** (Uranus posted 2026-11-25, no data) | §9 targets stay reference-derived; retune after 3 posts (see §9.3) |

### 0.2 What D4 means in practice — open topics, locked format

Opening the topic list is a real retention risk: the algorithm learns from *who* watches, and a
different audience every video resets that learning. The mitigation is to keep the **format** rigid
while the **subject** varies:

- The format is always: *belief → contradiction → mechanism → one number → one question*.
- The visual system is always: dark ground, one accent, chips + captions + one visual proof.
- The opening 2 seconds always look the same (hero object huge, chip top-left, caption bottom).
- Only the *thing on screen* and the accent hue change.

So: `series` stops meaning "topic" and starts meaning "visual family" (accent + badge text). Adding a
topic is free; adding a new *visual* family is not — that requires an owner decision, because it
breaks visual consistency in the feed.

---

## 1. What actually exists — the only commands you may assume

Do not invent a script. If a step has no command, §16 says what to add.

| Stage | Command (real, in `package.json` or `scripts/`) | Notes |
|---|---|---|
| Preview | `bun run dev` → `localhost:5173` | `?episode=<slug>`, `?record=1` |
| Stills | `bun scripts/dev_shot.mjs 0.5,3,9,14,22 --episode <slug>` | writes PNGs to `frames/` |
| Audio | `uv run --with edge-tts,mutagen python scripts/generate_audio.py <slug> [--force] [--dry-run]` | reads `episodes/<slug>/scene.json` + `script.txt` |
| Manifest check | `uv run --with edge-tts,mutagen python scripts/generate_audio.py <slug> --dry-run` | parse + word count + duration check, no TTS |
| Script lint | `bun scripts/lint_script.mjs <slug> [--strict] [--ending question \| cta \| both]` | `SCRIPT_GUIDE.md` checks: structure, sources, digits, hooks, re-hooks, ending |
| Smoke render | `bun scripts/render_video.mjs --episode <slug> --max-frames 90` | first ~3 s |
| Full render | `bun scripts/render_video.mjs --episode <slug> [--crf 16] [--preset slow]` | → `output/<slug>-1080x1920.mp4`; ducked bed + two-pass loudnorm are **on by default** |
| Audio-only render opts | `--no-bed`, `--no-loudnorm`, `--bed-gain <dB>`, `--pre-limit` | for A/B tests and legacy reproduction; default bed gain `-8 dB`; `--pre-limit` adds a light limiter before two-pass loudnorm for peak-heavy mixes |
| Verify | `bun run verify <slug>` | anchors + banned strings + MP4 spec / faststart + two decoded PNGs in `output/.verify/` (spec rows skip when no render exists) |
| QA metrics | `bun scripts/qa_metrics.mjs --slug <slug> [--out episodes/<slug>/qa.md]` | §9.1 table, exit 1 on any fail; use `--video <path>` for non-canonical test renders |
| Covers | `bun scripts/render_cover.mjs --episode <slug>` | seven targets (§10.1) + legacy aliases |
| Thumbs | `bun scripts/render_thumb.mjs --episode <slug>` | `thumbnail_youtube.png`, `thumbnail_instagram.png` |
| SFX (synthesize) | `bun run sfx` | `sub_drop.wav`, `riser.wav` — zero licence risk |
| Music bed (synthesize) | `bun run bed` | `shared-assets/sfx/music_bed.wav`, deterministic; regenerate only if the recipe changes |
| Reference capture | `yt-dlp -f "bv*+ba/b" <url> -o ref.mp4` | for teardowns only, never republish |
| Type gate | `bunx tsc -b` | must pass before any "done" |
| Analyse a file | `ffmpeg` / `ffprobe` (on PATH) | §9 gate commands |

Per-episode `scene.json` may set `voiceProcess: true` (light voice EQ/compression before
`adelay`, so WordBoundary timing is unchanged) and `bedGainDb` (default −8). SFX events in
`sfx.json` may set `rate` for deterministic pitch variation; v2 `*_v2.wav` assets add
phone-band harmonics without touching legacy filenames.

**Still not present** (do not pretend they exist): `bun run package`, `bun run stats`,
`scripts/package.ts`, `scripts/stats.ts`. Package manually to §11.1 until those land.
QA metrics, the synthesized bed, the `phrase` caption style, and the 2160×3840 Shorts cover
are implemented — see §16 for verified status.

---

## 2. The pipeline, end to end

```
IDEA
 └─1─ Grill it (skill: grilling) .................. gate: survives 12 questions
 └─2─ Brief + script + sources ..................... gate: every claim has [src: S#]
 └─3─ Hook spec locked ............................. gate: beat list ≥ 12 beats
 └─4─ Palette + type + cover layout locked ......... gate: dark base + 2 accent notes
 └─5─ Build scene (code) ........................... gate: no state > 2.0 s, tsc passes
 └─6─ Audio: voice + bed + SFX + loudness .......... gate: −14 LUFS, silence ≤ 10 %
 └─7─ Render + measure ............................. gate: §9 table all PASS
 └─8─ Covers for 7 targets ......................... gate: crop-safe at 3:4 and 4:5
 └─9─ Package, post, engage ........................ gate: pinned question live
```

Each stage writes its decision into `episodes/<slug>/` so the next agent (or you in three weeks)
can see *why* the video looks the way it does.

---

## 3. Stage 1 — Grill the idea before you write a word

Run the **`grilling` skill** on the idea. Do not build until all 12 have a written answer. The point
is to kill weak ideas in 10 minutes instead of after a 3-hour render.

### 3.1 The 12 questions (ask verbatim, in this order)

1. **What does the viewer believe before this video, and what do they believe after?** If both
   sentences are the same, there is no video.
2. **State the contradiction in one line without jargon.** ("Every planet spins upright — one
   doesn't.") If it needs a second sentence, it is two videos.
3. **What is the one number the viewer will see?** Not "42 years" in a label — a number that moves,
   fills, or compares on screen.
4. **Can we show it without words?** Describe the picture that proves claim 3 with the audio muted.
5. **What is the strongest counter-argument, and is the video honest about it?** (e.g. "Astronomers
   think a giant impact *likely* knocked Uranus over.") Hedges stay in the script.
6. **Where does the claim come from?** Name the source *now*. No source → no video. Never recall.
7. **Why would someone argue with this in the comments?** If nothing, it will get no comments.
   Find the debatable edge (not a factual error — a genuine "wait, really?").
8. **What is the second-best moment?** The one after the hook. If the video is only good for 3
   seconds, it is not a video.
9. **Can it loop?** Does the last line point back at the first?
10. **Is this one idea or three?** Cut to one. 55–75 words.
11. **What existing episode does this repeat?** If it duplicates one, kill it or find the new angle.
12. **Ship test:** if a stranger saw this in the feed with the sound off, would they stop? Answer in
    one sentence describing the *frame*, not the topic.

### 3.2 Grill output → `episodes/<slug>/brief.md`

Use `docs/brief-template.md`. It must contain: the belief shift, the contradiction line, the number,
the mute-test picture, the counter-argument, sources, the comment hook, the loop line, word budget.

**Gate 1:** `brief.md` exists and question 3 has a *visual* answer, not a text answer.

---

## 4. Stage 2 — Script, sources, facts

> Longer narration scripts use `SCRIPT_GUIDE.md` §1–2 and `bun scripts/lint_script.mjs <slug>`.
> The 55–75 word / 20–35 s figures in this section remain the **legacy short-form** baseline;
> do not apply them to a 60–120 s episode without owner approval.

### 4.1 Script shape (55–75 words, 3 acts, ~24–32 s)

| Act | Words | Job | Must contain |
|---|---|---|---|
| Hook | 10–20 | Break a belief in the first 2 s | the contradiction, stated plainly |
| Escalation | 20–30 | The "wait, what?" | the mechanism, hedged if it is a model |
| Payoff | 15–25 | The number, then the loop line | the number + a line that restates the hook |

Write it as **comma-linked clauses**, not 5 short sentences. Short sentences are what create the
0.9 s dead-air gaps between lines (§8). Fragments are fine on screen, not in the narration.

### 4.2 Hard content rules

- Every factual sentence carries `[src: S#]`; `episodes/<slug>/sources.md` maps `S#` → URL you opened.
- Never invent a number, date, or citation. If a number is uncertain, hedge in the script and say so
  in `brief.md`.
- Numeric claims that appear **on screen** must also live in `episodes/<slug>/facts.ts`
  (`{ value, display, src }`) — `bun run verify <slug>` cross-checks these.
- Ban filler openers: "Did you know", "In this video", "Let's find out", "Here's the thing".
- No unsourced superlatives ("the most extreme thing in the universe").

### 4.3 The one question the video asks the viewer

Decide it here, not at the end. It lives in `meta.json` as `question`, and it must be answerable in
under 2 seconds by a stranger. See §12 for the exact patterns and the legal line.

**Gate 2:** `script.txt` + `sources.md` + `facts.ts` exist; `--dry-run` prints word count 55–75 and
duration 20–35 s.

---

## 5. Stage 3 — The hook spec (non-negotiable)

These thresholds come from measuring a reference that beats our retention. The evidence file is
`docs/reference-teardown-dexwonders-sun-vs-uranus.md`. Treat them as build constraints, not advice.

| # | Rule | Threshold | Checked by |
|---|---|---|---|
| H1 | **Beat list, not acts.** Every beat changes exactly one of: claim chip text, ground colour, camera scale, a number, a shape. | ≥ 12 beats in ≤ 32 s; gap between beats ≤ 2.5 s | manual timeline in `scene.json` |
| H2 | **No frozen state.** Composition must not sit unchanged. | longest hold ≤ 2.0 s **[target]** | `qa_metrics` freeze pass |
| H3 | **Frame energy.** Motion, not drift. | mean frame-diff ≥ 1.5 at `fps=15` **[target]** | §9 cmd 3 |
| H4 | **Scale.** The hero object must get big. | ≥ 55 % of frame width at least once; average ≥ 35 % | stills |
| H5 | **Ground flip.** Background is a beat. | ≥ 2 full-bleed colour changes | stills |
| H6 | **≤ 3 text zones** on screen at once (chip / number / caption). No timecode, no badge + kicker + headline + subline + caption stack. | ≤ 3 | stills |
| H7 | **Captions.** 1–3 words per chunk, centred, no grey upcoming words. | cap height ≥ 6 % of frame width (≥ 65 px at 1080) | stills |
| H8 | **One visual proof.** A number the viewer watches change (counter / dot grid / bar / measure line). | exactly 1 per episode | stills |
| H9 | **Hook at 0.0 s.** The subject is already on screen and already huge. No logo, no fade-from-black. | first frame has content | still 0.0 |
| H10 | **Loop.** Last line restates the hook; last frame ≈ first frame. | `endCard: false` | manual |
| H11 | **Answer in the middle.** The comment question is asked on screen around 40–60 % of runtime. | 1 question | stills + `meta.json` |

### 5.1 Beat timeline in `scene.json`

Add to the schema (coordinate with `src/templates/types.ts`):

```jsonc
"beats": [
  { "at": 0.0,  "kind": "chip",    "text": "TINY?", "strikeAt": 2.6 },
  { "at": 2.8,  "kind": "camera",  "scale": 1.0, "to": [0.5, 0.45] },
  { "at": 4.4,  "kind": "counter", "to": 42, "suffix": "yrs", "dur": 1.1 },
  { "at": 6.2,  "kind": "chip",    "text": "42 YEARS OF DARK" },
  { "at": 8.0,  "kind": "palette", "ground": "ice" },
  { "at": 9.8,  "kind": "dots",    "count": 84, "label": "EARTH YEARS PER ORBIT" },
  { "at": 11.6, "kind": "camera",  "scale": 2.1, "to": [0.5, 0.38] },
  { "at": 13.4, "kind": "bar",     "value": 0.5, "label": "OF ITS ORBIT IN SUNLIGHT" },
  { "at": 15.2, "kind": "chip",    "text": "AND MIRRORED" },
  { "at": 17.0, "kind": "palette", "ground": "amber" },
  { "at": 18.8, "kind": "counter", "to": 97.77, "suffix": "°", "dur": 0.9 },
  { "at": 20.6, "kind": "camera",  "scale": 1.0, "to": [0.5, 0.5] },
  { "at": 22.4, "kind": "question","text": "WOULD YOU SKIP 42 YEARS OF DARK?" },
  { "at": 24.2, "kind": "chip",    "text": "STILL NOT THE WEIRDEST" }
]
```

Rules for the list: strictly increasing `at`, one change per beat, and the last beat must land on the
loop line so the frame can cut back to 0.0 s without a visual jump.

**Gate 3:** beat count ≥ 12, max gap ≤ 2.5 s, exactly 1 `counter`/`dots`/`bar`, exactly 1 `question`.

---

## 6. Stage 4 — Colour & type: dark base, vibrant notes

Direction (owner, 2026-11-25): **keep the dark base, add vibrant colour notes.** Dark alone reads as
"unfinished"; dark + one saturated accent + one clean secondary reads as "produced". Current Uranus
frame sits at mean luma 33 with a 12-level range — that is the failure mode to avoid.

### 6.1 Palette contract

| Role | Rule | Example (cosmic) |
|---|---|---|
| Ground | very dark, but **not flat black** — keep a subtle radial or gradient so banding cannot show | `#05070F` → `#0B1022` radial |
| Ground beat | at least 2 full-bleed accent grounds during the video | amber `#F59E0B` at 85 % fill, ice `#67E8F9` |
| Primary accent | 1 per episode, saturated, reserved for the *claim* and the number | amber / ice / violet |
| Secondary | cool counterpart, used only for "before/other" states | `#60A5FA` |
| Ink | near-white, never pure `#FFF` on large areas | `#F8FAFC` |
| Contrast | text vs ground ≥ 7:1; never grey upcoming words | — |
| Chroma | accent must be the **most saturated** thing on screen | — |
| Dim text | max 55 % opacity, min 2 uses per frame | — |

Direction per **visual family** (already in `src/theme/series.ts`): `cosmic` = amber on void,
`game-physics` = green on void, `star-scale` = violet on void. Per D4 the *topic* is free, but these
three families are the only palettes. Pick the family that fits the subject; do not invent a fourth.
If a subject fits none of them, it is the wrong subject for now.

### 6.2 Type contract

- **Display:** Anton for the 1–3 word caption and the giant ghost number. Cap height ≥ 65 px at 1080.
- **Numbers:** the display face, tabular, no letterspacing, always with the unit as a smaller suffix.
- **Labels:** one mono, ≤ 20 px, ≤ 4 words, uppercase, letterspaced **only** when ≤ 3 words.
- **Never:** mono micro-caps as the *primary* sentence on screen. That is the "dashboard" voice and it
  is why the current captions read as instrumentation, not story.
- Max 3 type styles per frame (display / number / label). If you need a fourth, remove one.

### 6.3 Cover layout locked here

Cover is designed in this stage, not after the render, because the cover title and the video's claim
must be the same words. See §10 for surfaces and crops.

**Gate 4:** `scene.json.palette` + `scene.json.coverTitle` (3–5 words, one number) exist.

---

## 7. Stage 5 — Build the scene (code contract)

### 7.1 Non-negotiables (from AGENTS.md §2)

- Stage is a pure function of `t`. No `Math.random()` outside seeded factories, no `setInterval`, no
  CSS `infinite`, no Motion / self-clocked libraries inside scenes.
- Recorder hooks stay intact: `window.__seek(t)`, `window.__ready`, `window.__committedFrame`,
  `#root[data-rendering-complete]`.
- Safe box: `x 60–1020`, `y 170–1536`. Nothing below y 1536. Captions inside that box.
- 1080×1920 @ 30 fps.

### 7.2 Motion rules (repo constants in `src/theme/tokens.ts`)

| Element | Rule |
|---|---|
| Entrance | 0.35–0.5 s, `easeOutCubic`, ~24 px slide + fade |
| Stagger | 80 ms between list items |
| Camera | per-beat `scale`/`translate` with `easeInOutCubic`, 0.5–0.9 s. Never a global `sin()` wobble as the *only* motion |
| Ambient drift | 2–4 % over the whole video, **on top of** beats, never instead of them |
| Max motion duration | 1 s per element except ambient drift |
| Pop / number / strike | `backOut` 0.35 s — these are the "produced" accents |

### 7.3 Primitives to build once and reuse

Put them in `src/templates/primitives/` (create it on second use, per AGENTS.md §0.3):

| Primitive | Signature sketch | Reproduces |
|---|---|---|
| `<Counter>` | `to, from, at, dur, suffix, format` | the rolling 1,300,000 |
| `<DotGrid>` | `count, cols, revealAt, stagger, dotR` | 1.3 M Earths |
| `<ProportionBar>` | `value, label, at` | 99.8 % of mass |
| `<MeasureLine>` | `from, to, label` | 100 Earths wide |
| `<ClaimChip>` | `text, strikeAt` / `swapAt` | `GIANT?` → struck |
| `<FullBleed>` | `ground, bleed` | sun interior / red supergiant |
| `<Camera>` | `at, scale, to, ease` | the continuous zoom |
| `<GhostType>` | `text, opacity` | giant background `1.3M` |
| `<Grain>` | `intensity, seed` | dither over dark gradients |

### 7.4 Registration checklist — every file a new episode touches

Missing any one of these is the usual cause of "render works but the cover is blank".

1. `episodes/<slug>/script.txt`
2. `episodes/<slug>/scene.json` — series, title, voice, rate, tail, endCard, beats, palette
3. `episodes/<slug>/meta.json` — hook, hookStyle, captionStyle, endCard, question, durationSec, wordCount, posted
4. `episodes/<slug>/sources.md`
5. `episodes/<slug>/facts.ts` — every on-screen number
6. `episodes/<slug>/sfx.json` — `{ "events": [{ "t", "file", "gainDb" }] }`
7. `src/components/<Name>Acts.tsx` — the scene, pure `t`
8. `src/components/Episode.tsx` — `import` scene, extend `Slug` union, add `REGISTRY` entry
9. `src/App.tsx` — `if (episode === '<slug>') return <Episode slug="<slug>" />`
10. `src/theme/captionStyles.ts` — add a style key
11. `src/theme/hudPresets.ts` — add a preset key
12. `src/components/Cover.tsx` — add the cover entry
13. `src/components/Thumbnail.tsx` — add the thumb variant
14. `public/audio/<slug>/` — generated, not hand-made
15. `package.json` — optional `generate:<slug>` convenience script

**Gate 5:** `bunx tsc -b` passes; `bun scripts/dev_shot.mjs 0,1,3,6,9,12,15,18,21,24,27 --episode <slug>`
shows a *different* frame every 1.5–2.5 s and ≤ 3 text zones in each.

---

## 8. Stage 6 — Sound

The current episode is −20.6 LUFS with 7.8 s of true silence (29 % of runtime). That is the single
biggest "amateur" signal in the file.

| Element | Rule | Target |
|---|---|---|
| Voice | `en-US-AriaNeural`, `+12%` (configurable in `scene.json`) | unchanged |
| Pauses | write comma-linked clauses; set `tail` ≤ 0.4 s | **silence ≤ 10 % of runtime, no gap > 0.45 s** |
| Music bed | `scripts/synth_bed.py` — dark drone / pulse, −30 to −26 dB under voice, ducked (D1) | continuous from 0 to end **[target]** |
| SFX | 3–6 events: hit on the hook frame, tick on number landings, riser into the payoff, sub-drop on the number | ≤ −12 dB vs voice |
| End | no dead tail; loop on the last word | `tail: 0.35` |
| Loudness | two-pass `loudnorm` | **−14 LUFS integrated, ≤ −1.0 dBTP** |

SFX sources: prefer `scripts/synth_sfx.py` (deterministic, own work, zero licence risk). Extend it
rather than downloading. If you download, CC0 only and log it (§13).

`sfx.json` beat map to aim for:

```jsonc
{ "events": [
  { "t": 0.05,  "file": "sub_drop.wav", "gainDb": -14 },  // hook frame
  { "t": 4.40,  "file": "riser.wav",    "gainDb": -18 },  // into the first number
  { "t": 9.80,  "file": "sub_drop.wav", "gainDb": -12 },  // number lands
  { "t": 18.80, "file": "riser.wav",    "gainDb": -18 }
] }
```

**Gate 6:** `silencedetect` shows ≤ 10 % silence and max gap ≤ 0.45 s; `ebur128` shows
−14 ± 0.5 LUFS. Measure the full timeline: a `--max-frames 90` smoke MP4 truncates
`loudnorm` to ~3 s, so its summary is not the episode's loudness. On peak-heavy mixes
where two-pass loudnorm falls back to dynamic and overshoots, render with `--pre-limit`;
the opt-in limiter leaves other episodes unchanged.

---

## 9. Stage 7 — Render, then measure. Never eyeball "quality".

Run the gate. Paste the numbers into `episodes/<slug>/qa.md`. Do not claim "looks good".

### 9.1 The gate table

| Metric | Command | PASS | Uranus today (benchmark of failure) | Reference |
|---|---|---|---|---|
| Motion energy | `ffmpeg -i f.mp4 -vf "fps=15,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null -` | **≥ 1.5** | 0.47 ❌ | 2.17 |
| Frozen share | same command, share of samples `< 0.05` | **≤ 5 %** | 18 % ❌ | 0 % |
| Mean luma | `ffmpeg -i f.mp4 -vf "fps=5,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null -` | **55–85** | 33.5 ❌ | 73.2 |
| Loudness | `ffmpeg -i f.mp4 -af ebur128 -f null -` | **−14 ± 0.5 LUFS** | −20.6 ❌ | −15.2 |
| Silence | `ffmpeg -i f.mp4 -af "silencedetect=n=-35dB:d=0.25" -f null -` | **≤ 10 %, gap ≤ 0.45 s** | 29 %, 1.45 s ❌ | 2.6 % |
| Spec | `ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate -of default=nw=1 f.mp4` | 1080×1920, 30/1, h264, yuv420p, 48 kHz AAC | ✅ | (576×1024) |
| Duration | `ffprobe -v error -show_entries format=duration -of csv=p=0 f.mp4` | 20–35 s | 26.8 ✅ | 29.4 |
| Caption size | stills at 5 timestamps | cap height ≥ 65 px | ~44 px ❌ | ~82 px |
| Text zones | stills at 5 timestamps | ≤ 3 | 5 ❌ | 2 |
| Loop | last frame vs first frame | visually matched | end card kills it ❌ | matched |
| Automated gate | `bun scripts/qa_metrics.mjs --slug <slug>` | exit 0 | exits 1 (motion/luma/captions) | — |

The first seven numeric rows are measured by `scripts/qa_metrics.mjs`; caption size, text zones
and loop still need human eyes on `dev_shot` stills. The script has no "good enough" override —
a written exception in `qa.md` is the only accepted waiver (Gate 7).

### 9.2 Also run

- `bun scripts/qa_metrics.mjs --slug <slug> --out episodes/<slug>/qa.md` — writes the measured table;
  pass `--video output/<test-file>.mp4` when validating a non-canonical render.
- `bun run verify <slug>` — anchors + banned strings + MP4 spec / faststart.
- Decode ≥ 2 frames to PNG and *look* at them (`bun scripts/dev_shot.mjs ...`) — the numbers can pass
  on a video that is ugly, they cannot catch taste.
- `bunx tsc -b`.

**Gate 7:** every row PASS or an explicit, written exception in `qa.md` ("luma 48, accepted because the
episode is intentionally a night scene — see brief.md").

### 9.3 Retuning the targets (D5)

There is no baseline yet (Uranus posted 2026-11-25). So the PASS columns above are set from the
reference video, which is the right starting guess and the wrong long-term answer.

After **3 posted videos**, replace the right-hand columns with your own numbers:

| Data point | Where | Used for |
|---|---|---|
| avg % viewed | TikTok Studio / YT Analytics / IG insights | the one metric every change is judged on |
| 3-second hold | TikTok / YT Shorts | tells you if the hook spec (H9) is working |
| swiped-away % | TikTok | tells you if the beat density (H1/H2) is working |
| rewatch / loop rate | IG + TikTok | tells you if `endCard: false` (H10) is working |

Only then do you know which of the §9 targets is too strict. Until then: do not weaken a target
because a video "looks fine" — the whole point is that it looked fine to you and got skipped.

---

## 10. Stage 8 — Covers for every surface

### 10.1 Surface matrix (checked 2026-11)

Because of **D3 (post everywhere, same day)** every row below is mandatory on every episode.

| Surface | File | Size | Ratio | Notes |
|---|---|---|---|---|
| TikTok cover | `cover_tiktok_1080x1920.png` | 1080×1920 | 9:16 | profile grid crops top+bottom (TikTok publishes no ratio) |
| Instagram Reels cover | `cover_reels_1080x1920.png` | 1080×1920 | 9:16 | profile grid crops to 3:4 |
| Facebook Reels cover | `cover_fb_1080x1920.png` | 1080×1920 | 9:16 | same artboard as IG/TikTok; FB feed shows a 4:5 crop |
| YouTube Shorts cover (custom) | `cover_shorts_2160x3840.png` | 2160×3840 | 9:16 | custom Shorts thumbnail is YPP-gated; else pick a frame |
| **Grid preview (IG + TikTok + FB)** | `cover_grid_1080x1440.png` | 1080×1440 | 3:4 | **this is what your profile actually looks like** |
| Feed crop preview (Shorts Home / FB feed) | `cover_feed_1080x1350.png` | 1080×1350 | 4:5 | Shorts can appear 4:5 on Home/Explore; FB feed too |
| YouTube long-form thumb | `thumbnail_youtube_1280x720.png` | 1280×720 | 16:9 | min 1280 wide, ≤ 2 MB — needed only when a long-form cut exists |

The four vertical covers are the **same 1080×1920 artboard**. Do not re-design per platform: one
master, platform-specific crops as *previews*, so a grid tile can never surprise you after posting.

`render_cover.mjs` was corrected on 2026-11-25: the old 1440×1080 (4:3) target was removed, and
the seven targets above are now emitted and size-checked on every run. `cover_reels_*` and
`cover_fb_*` are byte-identical copies of the 1080×1920 master; grid/feed are real crops, not
rescales. Legacy `cover_tiktok.png` / `cover_instagram.png` / `cover_youtube.png` aliases remain
for the Studio manifest.

### 10.2 One master frame, then crops

Design **one** 1080×1920 master and derive everything from it:

- Title inside `y 240–1680` (the 3:4 band that survives the grid crop).
- Title x ≤ 900 (right rail of feed buttons).
- Keep the top 270 px and the bottom 672 px free of text (Meta's Reels safe margins ≈ 14 % top /
  35 % bottom / 6 % sides → 270 px / 672 px / 65 px on a 1080×1920 frame).
- Title = `scene.json.coverTitle`: **3–5 words, one number, zero punctuation.**
- One visual: the hero object or the number. Never both plus a label.
- Contrast ≥ 7:1; accent used once.

### 10.3 Cover QA

Render, then open all seven and check:
1. Readable at 20 % zoom (grid tile size).
2. The 3:4 crop still contains the whole title.
3. The 4:5 crop still contains the whole title.
4. The title does not repeat the video title verbatim (different words = two chances to land).
5. No platform UI collision (right rail, bottom caption).

**Gate 8:** seven files exist with the exact names/sizes above, and both the 3:4 and 4:5 crops are
legible.

---

## 11. Stage 9 — Package, post, engage

### 11.1 Package layout (this is the contract; `package.ts` is not built yet)

```
results/videos/<slug>/
  video.mp4
  cover_shorts_2160x3840.png
  cover_reels_1080x1920.png
  cover_tiktok_1080x1920.png
  cover_fb_1080x1920.png
  cover_grid_1080x1440.png
  cover_feed_1080x1350.png
  thumbnail_youtube_1280x720.png   # only when a long-form cut exists
  about.txt          # 4 caption blocks: TikTok / Reels / Shorts / Facebook + SOURCES
  meta.json          # hook, hookStyle, question, captionStyle, endCard, durationSec, wordCount, posted
  qa.md              # the §9 table with real numbers
```

### 11.2 Per-platform copy rules

| Platform | Caption length | First line | Hashtags | Disclosure |
|---|---|---|---|---|
| TikTok | 1–2 sentences + sources | the contradiction | 3–5 | say "AI narration" if synthetic |
| Instagram Reels | 1–2 sentences + sources | the question | 3–5 | same |
| Facebook Reels | 1–2 sentences + sources | the question | 0–3 | same |
| YouTube Shorts | 1–2 sentences + sources | the contradiction, ≤ 90 chars | 3–5 | same |

Same video, same covers, four caption files. Do **not** re-edit the video per platform — the only
per-platform work is text and the cover crop preview.

`sources.md` is copied into `about.txt` under a `SOURCES` heading. Missing sources = do not post.

---

## 12. The engagement layer — questions that earn comments

Comments are not decoration; they change distribution. But **explicit engagement bait** ("comment
YES if…", "like for part 2") is a policy risk on TikTok and reads as spam. What works is a genuine
open question the viewer can answer in two seconds.

### 12.1 The rules

1. **One question per video.** Two questions = none answered.
2. **Asked twice:** on screen at 40–60 % of runtime (a chip/caption beat), and as the **last caption
   line** which holds for ≥ 1.2 s.
3. **Answerable in < 2 s** and in ≤ 10 words.
4. **Answerable without research** — opinion, prediction, or personal preference, never trivia.
5. **On-topic**, so the comment text reinforces the topic signal.
6. **Never a yes/no you can't argue with.** "Would you rather…", "what would you…", "which one…".
7. **Pin the question as the first comment** — it doubles as a second impression of the hook.
8. **Reply to the first ~10 comments within an hour.** Replies are engagement too, and they seed the
   thread the algorithm reads.
9. **Like instruction, only if it earns it:** "save this" for reference-style claims, "follow" only
   when there is a literal next episode in the same series. No begging.

### 12.2 Patterns for this niche

**Default per D2:** the *preference / would-you-rather* pattern. Use it for the next 3 videos; treat
the others as one-variable experiments, not as variety for its own sake.

| Pattern | Template | Why it works |
|---|---|---|
| **Preference — DEFAULT** | "42 years of dark, or 42 of light — which would break you?" | binary, instant, arguable |
| Prediction | "Guess before the number lands: bigger or smaller?" | makes them watch to the end |
| Challenge | "Name a weirder planet. I'll wait." | invites the smart-alecks = free reach |
| Personal stake | "Would you move there for one sunrise?" | low-effort reply |
| Correction invite | "If a number's wrong, tell me — I check every one." | honest, and corrections are high-signal comments |

### 12.3 Where the like comes from

- The **loop** is the like machine: if the last frame cuts to the first, viewers watch twice and the
  rewatch signal does more than a CTA. This is why `endCard: false`.
- One "save-worthy" element per video: a number, a comparison, or a checklist frame. People save
  reference, not vibes.

### 12.4 Recorded in `meta.json`

```jsonc
"question": "42 years of dark, or 42 of light — which would break you?",
"questionAt": 22.4,
"pinnedComment": "42 years of sunlight, then 42 of darkness. Which half would break you first?",
"ctaStyle": "question"
```

---

## 13. Asset sourcing — free, licensed, logged

**Preference order: code-generated → npm package → CC0/downloaded.**

| Need | Source | Licence | Rule |
|---|---|---|---|
| SFX | `scripts/synth_sfx.py` (repo) | own work | default choice |
| Music bed | `bun run bed` → `scripts/synth_bed.py` (implemented; original code) | original work | deterministic 48 s WAV; ducked −8 dB by default |
| Icons | `lucide-react` (installed) | ISC | already a dependency |
| Fonts | `shared-assets/brand/fonts` (Anton, Pirata One) or `@fontsource/<name>` | OFL | never a random TTF from the web |
| Space imagery | NASA Image and Video Library, ESA/Hubble (CC BY 4.0) | check **each** item | attribution in `about.txt` if CC BY |
| General imagery | Wikimedia Commons (per-file licence), Openverse filtered to CC0 | varies | verify per file |
| Reference footage | `yt-dlp` for **teardown only** | — | never republish, never re-upload |
| Stock video | not needed | — | all visuals are code (AGENTS.md §2) |

**Every external asset gets a line in `shared-assets/LICENSES.md`**: source URL, licence, author,
date added. No entry → no asset. This is a hard rule from AGENTS.md §8.

---

## 14. Why people skip — the anti-pattern list

Check the render against this list before uploading. Each one is a measured failure in the Uranus
episode, not a hunch.

| Anti-pattern | Symptom on screen | Fix |
|---|---|---|
| Frozen composition | same picture 4–6 s, only captions move | beat list (§5) |
| Tiny hero | subject is 20 % of frame width in a sea of black | scale beats, ≥ 55 % at least once |
| Dark-on-dark | mean luma < 40, 12-level range | ground beat + accent note (§6) |
| Text stack | 5 labels competing | ≤ 3 zones |
| Sentence captions | 6-word line at 44 px | 1–3 words at ≥ 65 px |
| Karaoke dim | grey upcoming words | `phrase` style |
| Dead air | 29 % silence, 1.45 s tail | bed + comma clauses + `tail 0.35` |
| Quiet mix | −20.6 LUFS | −14 LUFS |
| Explain, don't show | numbers as labels, never as motion | one visual proof |
| No contradiction | "here's a fact about X" | hook spec question 2 |
| End card | logo + confetti kills loop | `endCard: false` |
| Decorative chrome | timecode, badge that never changes | replace with the claim chip |

---

## 15. Definition of done

- [ ] `brief.md` answers all 12 grill questions.
- [ ] `script.txt` 55–75 words, every claim has `[src: S#]`, `sources.md` complete.
- [ ] `facts.ts` matches every on-screen number.
- [ ] `scene.json` has ≥ 12 beats, 1 visual proof, 1 question, ≤ 2.5 s gaps.
- [ ] `bunx tsc -b` passes.
- [ ] §9 gate table: all PASS (or written exception in `qa.md`).
- [ ] `bun run verify <slug>` passes.
- [ ] seven cover targets, correct sizes, 3:4 **and** 4:5 crops legible.
- [ ] `meta.json` has `question`, `questionAt`, `pinnedComment`, `captionStyle`, `endCard: false`.
- [ ] four caption blocks in `about.txt` (TikTok / Reels / Shorts / Facebook), sources included.
- [ ] One variable changed vs the previous video, and it is written down.

---

## 16. Known gaps — build these before they bite

| Gap | Status 2026-11-25 | Evidence / next step |
|---|---|---|
| No QA metrics script | **Done** | `scripts/qa_metrics.mjs`; `bun scripts/qa_metrics.mjs --video output/uranus-pipeline-test.mp4` printed the §9 table and exited 1 on visual fails. |
| No loudness normalization | **Done** | `render_video.mjs` mixes to WAV, measures, then two-pass `loudnorm` at `I=-14:TP=-1.5`. Test render measured −14.1 LUFS / −1.0 dBTP. |
| No music bed | **Done** | `bun run bed` → `shared-assets/sfx/music_bed.wav`; same recipe re-run gave byte-identical SHA256. Render ducks it under voice/SFX. |
| `cover_tiktok` is 1440×1080 **4:3** | **Done** | `render_cover.mjs` emits all seven §10.1 targets with hard size checks. |
| No 2160×3840 Shorts cover | **Done** | `cover_shorts_2160x3840.png` captured at `deviceScaleFactor: 2`. |
| No 1080×1440 grid preview | **Done** | `cover_grid_1080x1440.png` cropped from `y=240` of the master. |
| No Facebook cover target | **Done** | `cover_fb_1080x1920.png` written with the master. |
| No 4:5 feed preview | **Done** | `cover_feed_1080x1350.png` cropped from `y=285` of the master. |
| No `phrase` caption style | **Done** | `CAPTION_STYLES.phrase` + `buildChunks(words, 3)` + `dimUpcoming: false`; gate-checked at 10 timestamps (92 px, ≤3 words, inside x 60–1020 / y ≤1536, no dim upcoming) and smoke-rendered. Legacy styles default to 6 words / dim upcoming, so baselines are unchanged. |
| No `package.ts` / `stats.ts` | **Open** | AGENTS.md Phase 4/6; package manually to §11.1 until built. |
| `verify.ts` has no ffprobe | **Done** | `bun run verify <slug>` checks h264/1080×1920/30 fps/yuv420p/AAC 48 kHz/duration/faststart (honours the 45 s long-form override) and decodes t=1 s / t=3 s PNGs; deliberately broken file failed, all 10 canonical renders passed. |
| Episode-level visual gates | **Open for each new idea** | The pipeline measures motion/luma/frozen; it cannot fix a weak scene. Write exceptions in `qa.md` or change beats, not thresholds. |

---

## 17. Decisions log

Answered by the owner 2026-11-25, recorded in §0.1:

| Question | Answer |
|---|---|
| Music bed source? | **Synthesized in code** (D1) — `scripts/synth_bed.py` |
| Default comment question style? | **Preference / would-you-rather** (D2) |
| Posting order? | **All four, same day** — TikTok, YouTube Shorts, Instagram Reels, Facebook Reels (D3) |
| One niche? | **No — topics open, format locked** (D4, and see §0.2 for the risk + mitigation) |
| Baseline numbers? | **None yet** — retune §9 after 3 posts (D5) |

### Still open (will not block the next video)

1. **Voice:** keep `en-US-AriaNeural +12%`, or test one alternate voice as a single-variable
   experiment? Default until told otherwise: keep it.
2. **Cover title vs video title:** same words, or deliberately different? Default: different — two
   chances to land, per §10.3 point 3.
3. **First-post day:** whether all four platforms ship within the same hour (favours algorithmic
   clustering) or spread across the day. Default: same hour.
4. **Facebook page:** does a Page already exist for daily posting, or is it a personal profile?
   Reels reach differs; this needs checking in the FB composer, not guessing.

Anything not listed here is *not* a blocker — pick the default in this document and write the
assumption into `episodes/<slug>/brief.md`.

---

## 18. The 30-second version (for a fresh agent)

> Read AGENTS.md, then this file. Take the idea through the `grilling` skill until question 3 has a
> *visual* answer. Write 55–75 words with sources. Lock ≥ 12 beats where each beat changes one thing,
> make the hero big, flip the ground colour twice, one number that moves, ≤ 3 text zones, 1–3 word
> captions. Voice + ducked bed + 3–6 SFX at −14 LUFS with ≤ 10 % silence. Render, then run the §9
> gate — numbers, not vibes. Render seven cover targets from one 1080×1920 master, checking the 3:4
> and 4:5 crops. End on a would-you-rather a stranger can answer in two seconds, no end card, loop on
> the last word, then post the same file to TikTok, Shorts, Reels and FB the same day.
