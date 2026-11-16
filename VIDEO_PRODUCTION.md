# Daily Dose of Curiosity — Video Production Playbook

> The goal of this project: **programmatic, fact-checked short-form videos for
> YouTube Shorts / Instagram Reels / TikTok / Facebook Reels — generated 100% from code.**
> No editing software, no stock footage, no screen recording by hand.
>
> → For a line-by-line "from the prompt to the finished MP4" walkthrough of every script,
>   hook, and artifact involved, see `docs/pipeline.md`.

Channel niche: **gaming · science · verified facts**, framed so every claim carries its source.
Target format: **9:16 vertical, 1080×1920, 20–35 s**, one idea per video, captions always on.

---

## The goal, in one sentence

Type a script in → a finished, upload-ready `results/videos/<slug>/{video.mp4, about.txt, meta.json}` comes out — deterministic, repeatable, and branded consistently.

## What every video must be

1. **Vertical 9:16, 1080×1920**, dark background, readable captions over everything (Anton, uppercase, outlined).
2. **Word-synced karaoke captions** — the spoken word pops, earlier words stay white, upcoming words stay dim.
3. **A 3-act structure** (hook → escalation → payoff) in the 20–35 s range, one idea, with act boundaries derived from the word stream.
4. **Fact-checkable claims only.** Every fact gets a source; risky claims get hedged framing ("legend", "likely", "most scientists consider…") or dropped.
5. **Channel identity baked in**: wordmark, badge, same lower third, same end-of-video follow CTA when `endCard: true`.
6. **Reproducible**: same source + same TTS bytes → byte-identical MP4 (verified 2026-11 for frames on the current build; edge-tts re-synthesis is **not** guaranteed byte-stable).

## Hard technical rules

- **Determinism**: the entire visual stage is a pure function of `time` (seconds). No `Math.random()` outside seeded factories, no CSS `infinite` animations, no `setInterval`. Animations read `t` every frame via rAF (preview: `<audio>.currentTime`; record: `window.__seek`).
- **One clock**: preview mode = HTML5 `<audio>` + `requestAnimationFrame`. Record mode (`/episode?record=1`) = `window.__seek(t)` from Puppeteer, one screenshot per frame @ 30 fps. No shared wall-clock state between the two paths.
- **No raster assets unless necessary.** Visuals are SVG/JSX/Canvas/CSS. Textures only from CC0/OFL sources, logged in `shared-assets/LICENSES.md`.
- **Fonts** (self-hosted, OFL): Anton (karaoke captions), Pirata One (brand/end card), `ui-monospace` for telemetry text.
- **Tailwind CSS v4** via `@tailwindcss/vite`; arbitrary-value classes welcome; keep layout declarative and deterministic. No three.js.
- **Audio is the timeline**: `full_voiceover.mp3` (edge-tts, `en-US-AriaNeural`) is the clock of the video. Word timings come from edge-tts `WordBoundary` events → `metadata.json` → captions.
- **Audio mixing happens in ffmpeg**: single voiceover = one input, padded with `apad=whole_dur=` so `-shortest` doesn't trim the tail.
- **Source of truth**: `episodes/<slug>/script.txt` → tokens → act boundaries (`metadata.json`). Never hand-tune timings. Never skip generation (`bun run generate:<slug> --force` regenerates from scratch).
- **Quality gate**: never ship without probing the final MP4 (`ffmpeg -i` → Duration + streams) and decoding ≥2 frames at different timestamps to visually verify.

## Steps to create a new video (repeatable checklist)

### 1 — Pick the topic, write the script
- One idea. ~60–75 words. Three acts.
- Write claims as you would defend them in public. Hedge anything uncertain.
- Voice: `en-US-AriaNeural`, rate ~`+12%`; if the result runs long, trim words — never rush past content.
- Mark every claim with `[src: <marker>]` — see `docs/conventions.md`.

### 2 — Fact-check (before any visuals)
- Every factual sentence gets a source (Britannica, NASA, RFC, peer-reviewed, Oxford Companion…).
- **Do not write the marker's target URL until a human has opened it** (or it is a .gov / .org page already opened in your session and read). Links that were never opened must not ship.
- Paste the verified sources into `episodes/<slug>/sources.md` mirroring the markers. This file, not `results/…`, is what cloners read.
- If a claim can't survive scrutiny, reframe it as legend/opinion or cut it.

### 3 — Voiceover + metadata
```bash
# from repo root; uv manages a private, fully-featured python (never the Store stub)
uv run --with edge-tts,mutagen python scripts/generate_audio.py <slug>    # or: bun run generate:<slug>
# e.g.: bun run generate:milkyway · bun run generate:space-sound · bun run generate:minecraft-edge · bun run generate:never-touch · bun run generate:everest-challenger-deep · bun run generate:touch-and-feel
```
This produces `public/audio/<slug>/full_voiceover.mp3` + `metadata.json`
(`fps`, `totalDuration`, `acts[]`, `words[]` with per-word `start`/`end`).
Word timings drive the captions — **do not estimate them by hand**.
Act boundaries are derived from the token counts of each `// ACT` block (never hand-tuned).
Out-of-range word counts (<60 or >75) or >35s durations will warn on stderr — fix the script, never the tokens.

### 4 — Build the component
- Fixed `h-[1920px] w-[1080px]` stage, bg `#030712` (or per topic; the adopted palette is dark).
- Route every episode in `src/App.tsx` (`?episode=<slug>`).
- Scenes must render the pointer-events-none HUD and the kicker lines per `scene.json`.
- All on-screen numbers come from `episodes/<slug>/facts.ts` (or are constants in
  `episodes/<slug>/script.txt` that are also checked there). No magic literals in scene code.
- **Recorder hooks mandatory**: `window.__seek(t)`, `window.__ready = true` after manifest load,
  `window.__committedFrame = time` after every committed render, and
  `document.getElementById('root')?.setAttribute('data-rendering-complete', 'true')` at the end.
- **Shared primitives** (`src/components/Starfield.tsx`, `KaraokeCaption.tsx`, `Hud.tsx`,
  `captionChunks.ts`, `src/motion/anim.ts`) are used by every episode — do not duplicate them.
- **End card**: `src/components/EndCard.tsx`. `endCard` defaults **false** in
  `scripts/generate_audio.py` (AGENTS.md Phase 5). The 4 current packages are `endCard: true`
  (documented, owner-opted-in); new episodes must make a deliberate choice and record it in
  `episodes/<slug>/scene.json` and `meta.json`. Loop-back-to-frame-0 is the only default that
  serves platform Loop behavior on Shorts.
- **Still covers**: `src/components/Cover.tsx` — `/?cover=<slug>&ratio=16x9|4x3|9x16`.
  `bun run cover --episode <slug>` renders all three (`cover_youtube.png`, `cover_tiktok.png`,
  `cover_instagram.png`). Add new episodes to the `COVERS` map at the top of the component.

### 5 — Preview & iterate
```bash
bun run dev                 # localhost:5173/episode?episode=<slug>
bun run shot "0.5,10,20" --episode <slug>   # headless PNGs at exact timestamps
```
- Check word pop sync against the waveform, caption overflow at long words, cut timing at act boundaries.
- Iterate until every frame survives a 1-second glance.

### 6 — Render
```bash
bun run render -- --episode <slug>   # full episode: output/<slug>-1080x1920.mp4
bun run render:smoke                # first ~90 frames only (default episode), sanity check
```
- Produces H.264 High + yuv420p + AAC 48 kHz, `+faststart`, 1080×1920 @ 30 fps.
- Internally: vite build → vite preview on an ephemeral `127.0.0.1` port → puppeteer @ 1080×1920 → `__seek` + `waitForFunction(__committedFrame === t)` → screenshot → ffmpeg encode.

### 7 — Package & ship
```
results/videos/<slug>/
  video.mp4      ← copy of output/<slug>-1080x1920.mp4 (sha256-verified)
  about.txt      ← platform captions + hashtags + Sources + posting notes
  meta.json      ← presence/hook/captionStyle/endCard/durationSec/wordCount/posted URLs
```
`results/` is **gitignored**. The packaged copy is identical to `output/<slug>-1080x1920.mp4`
(verify with `Get-FileHash` before you post).
The sources live in `episodes/<slug>/sources.md`, not in `about.txt` only.
`about.txt` = per-platform caption blocks (YouTube Shorts / Instagram Reels / TikTok / Facebook Reels), each with its own tone and hashtag density, plus posting notes.

### 8 — QA gate (before marking ready)
- [ ] Probe output: `ffmpeg -i output/<slug>-1080x1920.mp4` → `Duration` (20–35 s), both streams, 1080×1920, 30 fps.
- [ ] Decoded frames at ≥2 timestamps (use `bun run shot "0,mid"`) look correct (browser, captions, HUD).
- [ ] Captions don't clip long words; no overlapping text/HUD collisions.
- [ ] `results/` copy hash matches `output/`.
- [ ] `episodes/<slug>/sources.md` lists every claim that appears in the episode (mirror of `[src:]` markers).
- [ ] `bun run verify <slug>` passes.
- [ ] EPISODE shows in `/videos` after `bun scripts/admin_manifest.mjs`.

---

## Project layout

```
episodes/<slug>/         per-episode source of truth (script.txt · scene.json · facts.ts · sources.md · meta.json)
public/audio/<slug>/     voiceover + metadata.json (do not hand-edit)
shared-assets/brand/     channel logo, OFL fonts, Curiosity stickman (original artwork)
shared-assets/LICENSES.md every external asset and its license
src/theme/               design tokens (safe zone × 60–1020 / y 170–1536) · series config
src/motion/              anim.ts (clamp01, easeOutCubic, easeInOutCubic, easeInCubic, backOut, anim) · README
src/components/          Episode.tsx · <Slug>Acts.tsx · shared primitives
src/templates/types.ts   ActConfig / SceneConfig schema
scripts/generate_audio.py         unified voiceover + metadata (bun run generate:<slug>)
scripts/generate_url_explainer_audio.py  LEGACY URL-explainer (not new work — do not extend)
scripts/render_video.mjs  frame capture + encode
scripts/dev_shot.mjs      headless frame screenshots
scripts/verify.ts         anchor presence + banned-strings check
results/videos/<slug>/   ready-to-post packages (gitignored)
frames/   output/        render working dirs (gitignored)
```

## Hard-won gotchas (do not relearn these)

| Problem | Cause | Fix |
|---|---|---|
| Vite boots in 300 s | Tailwind auto-scanning `results/` binaries + `node_modules` | `@source "../src/**/*.{tsx,ts,css}";` + `@source "../index.html";` in `index.css` |
| vite `pnpm/bun` intermittent startup timeout | IPv4/IPv6 localhost mismatch + stale strictPort | bind `--host 127.0.0.1`, ephemeral port (`net.listen(0)`), generous deadline |
| ffmpeg output 191 MB | per-frame white-noise grain | 3 pre-seeded noise plates cycled at 12 fps; mid-gray band |
| `-shortest` cuts the end card | mixed audio shorter than video | `apad=whole_dur=<total>` precedes any `amix`; remember `-shortest` is not used on single voiceover |
| Karaoke sync drift | estimated timestamps | only trust edge-tts `WordBoundary` events |
| `uv` isolates Python | Store-app `python.exe` stub blocks | `uv run --with edge-tts,mutagen python …` (uv manages a private CPython) |
| `bun add` package skipped its postinstall | bun security default | run the package's `install.js` manually (e.g. `ffmpeg-static`) |
| vite hangs ~300 s at "ready in" | stale `node_modules/.vite-*` lock folder | `Remove-Item -Recurse -Force node_modules\.vite*` then retry |

## Command cheat sheet

```bash
bun run dev                                                  # preview (opens / — studio dashboard; use /episode?episode=<slug> for a stage)
bun run shot "1,5,9,14,19" --episode <slug>                  # exact-time PNGs
bun run render -- --episode <slug>                           # full video
bun run render:smoke                                         # sanity check (90 frames)
bun run verify <slug>                                        # anchor + banned-string gate
bun run generate:<slug>                                      # regenerate ONE episode's audio
bunx tsc -b                                                  # type gate
bun run lint                                                 # eslint
```
