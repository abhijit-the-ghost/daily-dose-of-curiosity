# Daily Dose of Curiosity — Video Production Playbook

> The goal of this project: **programmatic, fact-checked short-form videos for
> YouTube Shorts / Instagram Reels / TikTok — generated 100% from code.**
> No editing software, no stock footage, no screen recording by hand.

Channel niche: **gaming · science · verified facts**, framed so every claim carries its source.
Target format: **9:16 vertical, 1080×1920, ~20–60 s**, one idea per video, captions always on.

---

## The goal, in one sentence

Type a script in → a finished, upload-ready `results/videos/<topic>/{video.mp4, about.txt}` comes out — deterministic, repeatable, and branded consistently.

## What every video must be

1. **Vertical 9:16, 1080×1920**, dark background, readable captions over everything (Anton, uppercase, outlined).
2. **Word-synced karaoke captions** — the spoken word pops neon (orange on dark), earlier words stay white, upcoming words stay dim.
3. **A 3-act structure** (hook → escalation → payoff) in ~20–35 s with one twist per act.
4. **Fact-checkable claims only.** Every fact gets a source; risky claims get hedged framing ("legend", "likely", "most scientists consider…") or dropped.
5. **Channel identity baked in**: wordmark, badge, same lower third, same end-of-video follow CTA pattern.
6. **Reproducible**: same source + same TTS bytes → byte-identical MP4 (true for frames, verified 2026-11; edge-tts re-synthesis is not guaranteed byte-stable).

## Hard technical rules

- **Determinism**: the entire visual stage is a pure function of `time` (seconds). No `Math.random()` outside seeded factories, no CSS `infinite` animations, no `setInterval`. Animations read `t` every frame via rAF (preview: `<audio>.currentTime`; record: `window.__seek`).
- **One clock**: preview mode = HTML5 `<audio>` + `requestAnimationFrame`. Record mode (`?record=1`) = `window.__seek(t)` from Puppeteer, one screenshot per frame @ 30 fps. No shared wall-clock state between the two paths.
- **No raster assets unless necessary.** Visuals are SVG/JSX/Canvas/CSS. Textures only from CC0/OFL sources, logged in `shared-assets/LICENSES.md`.
- **Fonts** (self-hosted, OFL): Anton (karaoke captions), Pirata One (end card brand line), `ui-monospace` for telemetry text.
- **Tailwind CSS v4** via `@tailwindcss/vite`; arbitrary-value classes welcome; keep layout declarative and deterministic. No three.js (2D SVG composition only).
- **Audio is the timeline**: `full_voiceover.mp3` (edge-tts, `en-US-AriaNeural`) is the clock of the video. Word timings come from edge-tts `WordBoundary` events → `metadata.json` → captions.
- **Audio mixing happens in ffmpeg**: act MP3s at manifest offsets (`adelay` + `amix`) if multi-act; single voiceover = one input, padded with `apad=whole_dur=` so `-shortest` doesn't trim the tail.
- **Quality gate**: never ship without probing the final MP4 (`ffmpeg -i` → Duration + streams) and decoding ≥2 frames at different timestamps to visually verify.

---

## Steps to create a new video (repeatable checklist)

### 1 — Pick the topic, write the script
- One idea. ~60–75 words. Three acts:
  - **Act 1 — The Lie / the hook** (curiosity gap, 4–5 s)
  - **Act 2 — The Scale Problem / escalation** (the "wait, what?" moment, 6–8 s)
  - **Act 3 — Reality Check / payoff** (twist, 6–8 s)
- Write claims as you would defend them in public. Hedge anything uncertain.
- Voice: `en-US-AriaNeural`, rate ~`+12%`; if the result runs long, trim words — never rush past content.

### 2 — Fact-check (before any visuals)
- Every factual sentence gets a source (Britannica, NASA, RFC, peer-reviewed, Oxford Companion…).
- Record them — they go into `about.txt` under `Sources`.
- If a claim can't survive scrutiny, reframe it as legend/opinion or cut it.

### 3 — Voiceover + metadata
```bash
# from repo root; uv manages a private, fully-featured python (never the Store stub)
uv run --with edge-tts,mutagen python scripts/generate_audio.py <episode>     # or: bun run generate:<episode>
# e.g.: bun run generate:milkyway · bun run generate:space-sound · bun run generate:minecraft-edge
```
This produces `public/audio/<episode>/full_voiceover.mp3` + `metadata.json`
(`fps`, `totalDuration`, `acts[]`, `words[]` with per-word `start`/`end`).
Word timings drive the captions — **do not estimate them by hand**.
Act boundaries are derived from the token counts of each `// ACT` block (never hand-tuned).

### 4 — Build the component
- Fixed `h-[1920px] w-[1080px]` stage (`.stage` pattern in `src/App.tsx`), bg `#030712` (deep space) or per topic.
- Parallax starfield: 2–3 seeded SVG star layers, different speeds — `translateY = (t * speed) % layerHeight`.
- One hero visual (SVG centerpiece). Movement via `t`-derived transforms only.
- **HUD**: `pointer-events-none absolute inset-0 z-10`:
  - top-left cyan badge `[ COSMIC TELEMETRY // <TOPIC> ]` + timecode `TC mm:ss:ff` right
  - lower-third act kicker: `01 // ACT TITLE` in mono, colored per act
  - kinetic captions: Anton, uppercase, outlined; active word amber/orange with glow + backOut pop
  - bottom progress bar tracking `audio.currentTime / audio.duration` (or seek time in record mode)
- Recorder hooks mandatory: `window.__seek(t)`, `window.__ready = true` after manifest load, `window.__committedFrame = time` after every committed render, and `document.getElementById('root').setAttribute('data-rendering-complete', 'true')` at the end.
- Route it in `src/App.tsx`: default episode → new video; `?episode=<id>` for the rest.
- **Brand end card** — `src/components/EndCard.tsx` is the shared component. It renders the dark scrim + logo + Pirata One "DAILY DOSE / CURIOSITY" gradient lockup + `GAMING · SCIENCE · VERIFIED FACTS` + violet `+ FOLLOW` pill + deterministic (seeded) confetti, driven by `t` + `duration`. Used at the video tail (final ~2.6 s of `totalDuration`).
- **Still covers** — `src/components/Cover.tsx` is the shared still-artwork component (no animation). Route it via `/?cover=<slug>&ratio=16x9|9x16`. `bun run cover --episode <slug>` renders both to `results/videos/<slug>/cover_youtube.png` (1280×720) and `results/videos/<slug>/cover_instagram.png` (1080×1920). Add new episodes to the `COVERS` map at the top of the component.

### 5 — Preview & iterate
```bash
bun run dev                 # localhost:5173 — full stage, PLAY/scrub
bun run shot "1,5,9,14,19"  # headless PNGs at exact timestamps
```
- Check word pop sync against the waveform, caption overflow at long words, cut timing at act boundaries.
- Iterate until every frame survives a 1-second glance.

### 6 — Render
```bash
bun run render              # full episode: output/<episode>-1080x1920.mp4
bun run render:smoke        # first ~3 s only, sanity check
```
- Produces H.264 High + yuv420p + AAC 48 kHz, `+faststart`, 1080×1920 @ 30 fps.
- Internally: vite build → vite preview on an ephemeral `127.0.0.1` port → puppeteer @ 1080×1920 → `__seek` + `waitForFunction(__committedFrame === t)` → screenshot → ffmpeg encode.

### 7 — Package & ship
```
results/videos/<topic_slug>/
  video.mp4      ← copy of output/<episode>-1080x1920.mp4 (hash-verified)
  about.txt      ← platform captions + hashtags + Sources + posting notes
```
- `about.txt` = 3 ready-to-post caption blocks (YouTube Shorts / Reels / TikTok), each tuned for its platform, plus a `SOURCES` section transcribing the step-2 research, plus posting notes (thumbnail frame suggestion, #Shorts rule, hashtag strategy).
- Open the MP4 in the player and watch it end-to-end before calling it done.

### 8 — QA gate (before marking ready)
- [ ] `ffprobe`-style probe: `Duration`, both streams, 1080×1920, 30 fps, ~20–60 s.
- [ ] Decoded frames at ≥2 timestamps look correct (browser, captions, HUD).
- [ ] Captions don't clip long words; no overlapping text/HUD collisions.
- [ ] `results/` copy is hash-identical to `output/`.
- [ ] `about.txt` sources actually cover every on-screen claim.

---

## Project layout

```
public/audio/<slug>/     voiceover + metadata.json per episode (do not hand-edit)
shared-assets/brand/     channel logo + OFL fonts
shared-assets/LICENSES.md every external asset and its license
scripts/generate_audio.py         unified voiceover + metadata (slot: bun run generate:<slug>)
scripts/generate_url_explainer_audio.py  url-explainer legacy voiceover (multi-file manifest)
scripts/render_video.mjs  frame capture + encode (bun)
scripts/dev_shot.mjs      headless frame screenshots
src/App.tsx               stage + episode router (?episode=)
src/components/           episode scenes: DNSScene / RoutingScene / ServerScene (URL ep)
src/components/<Ep>.tsx   self-contained new episodes (MilkyWay, …)
results/videos/<topic>/   ready-to-post packages
frames/  output/          gitignored render working dirs
```

## Hard-won gotchas (do not relearn these)

| Problem | Cause | Fix |
|---|---|---|
| Vite boots in 300 s | Tailwind auto-scanning `results/` binaries + `node_modules` | `@source "../src/**/*.{tsx,ts,css}";` + `@source "../index.html";` in `index.css` |
| vite `pnpm/bun` intermittent startup timeout | IPv4/IPv6 localhost mismatch + stale strictPort | bind `--host 127.0.0.1`, ephemeral port (`net.listen(0)`), 75 s deadline |
| ffmpeg output 191 MB | per-frame white-noise grain | 3 pre-seeded noise plates cycled at 12 fps; mid-gray band |
| `-shortest` cuts the end card | mixed audio shorter than video | `apad=whole_dur=<total>` after `amix` |
| Karaoke sync drift | estimated timestamps | only trust edge-tts `WordBoundary` events |
| `uv` isolates Python | Store-app `python.exe` stub blocks | `uv run --with edge-tts,mutagen python …` (uv manages a private CPython) |
| `bun add` package skipped its postinstall | bun security default | run the package's `install.js` manually (e.g. ffmpeg-static) |
| vite hangs ~300 s at "ready in" | stale `node_modules/.vite-*` lock folder from an interrupted vite | `Remove-Item -Recurse -Force node_modules\.vite*` then retry |

## Command cheat sheet

```bash
bun run dev                                                      # preview
bun run shot "1,5,9,14,19"                                       # exact-time PNGs
bun run render                                                   # full video
bun run render:smoke                                             # sanity check
bun run generate:audio milkyway                                  # regenerate ONE episode's audio
bunx tsc -b                                                      # type gate
```
