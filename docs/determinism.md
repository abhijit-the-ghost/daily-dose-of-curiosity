# Determinism report — video pipeline

Date: 2026-11-11, updated 2026-11-12
Owner: Ghost (Abhijit Guragain)

## 2026-11-14 — minecraft-edge rebuilt with end card

`episodes/minecraft-edge/scene.json`: `endCard: false → true`. The episode now closes
with the branded end card (logo + "DAILY DOSE / CURIOSITY" + tagline + `+ FOLLOW`),
matching `milkyway` and `space-sound`. Packaged artifact regenerated
(`results/videos/minecraft-edge/video.mp4`, sha256 `6736EE1F052F964F20916208D73B67CB59E2C24ACB0C081DF8F3212CF2A1A4ED`).
The previous "byte-identical to package" property no longer holds — intentional change.

## 2026-11-12 (evening) — space-sound act-3 raster jitter

**Finding:** Act-3 pixels of `space-sound` are not bit-identical across consecutive
builds in the current environment (diffs start at frame 495, t ≈ 16.5 s, and persist
into act 3's nebula zone + caption text edges). Per-pixel deltas: ~0.25 % of pixels,
SSIM ≈ 0.99999, PSNR ≈ 58 dB — visually indistinguishable.

**Not caused by Phase 3 refactoring.** Verified by rebuilding with every migrated
primitive reverted to its inline form (captions, starfield, HUD, one at a time and
fully reverted): the same class of drift persisted. Frames before frame 495 are byte-
identical across every build regardless.

**How far this is pinned down:**
- m.o not related to vite (consecutive builds emit identical bundle hashes)
- frames 0–494 byte-identical across all builds tested
- milkyway and minecraft-edge render byte-identically across runs in the same environment (and match their packaged artifacts exactly)
- this episode has never before been double-rendered for verification (only single-render baselines), so the jitter window cannot be dated beyond "predates Phase 3, present today"
- act 3's SVG (340 seeded cluster dots, radial-gradient nebula, the #22d3ee ripple rings) is the region affected

**Open question resolved:** owner chose to accept the SSIM gate for `space-sound`
(frames visually identical, not byte-identical); byte-exact framemd5 remains mandatory
for `milkyway` and `minecraft-edge`.

## Phase 3 (scene schema + generic `<Episode>`) — 2026-11-12

**Built**
- `src/templates/types.ts`: `ActConfig { kicker, kickerColor, template, props?, startSec? }`, `SceneConfig { series, title, acts[3], endCard }` — exactly per AGENTS.md.
- `src/components/Episode.tsx`: generic shell — recorder hooks (`__seek`/`__ready`/`__committedFrame`/`data-rendering-complete`), audio element, preview scaling, kicker from `scene.json`, HUD + captions + optional end card; act rendering supplied per episode via `REGISTRY`; `actIndexOf` + `captionsVisibleAt` hooks for per-episode timing semantics (minecraft-edge flips to act 1 during the loop return and hides captions there).
- episodes' `scene.json` extended with `endCard` + per-act kicker text/colors (single source of truth).
- Shared primitives used by all three migrated episodes: `Starfield.tsx` (config-driven; milkyway=lcg, space-sound=mulberry32), `KaraokeCaption.tsx` + `captionChunks.ts`, `Hud.tsx` (amber/cyan accent presets, optional corner brackets, per-episode padding/gradient/kicker classes, `pulseDot` toggle for minecraft-edge's static dot).
- Act-scoped content extracted to `SpaceSoundActs.tsx` and `MinecraftEdgeActs.tsx` (starfield + scene SVG; no wrapper leakage).

**Verified**
- minecraft-edge (`?episode=minecraft-edge` → generic Episode): render is **byte-identical** to the packaged artifact (sha256 A37832BE…, framemd5 identical) across builds — including the loop return and anchor beats.
- space-sound (`?episode=space-sound` → generic Episode): **SSIM 0.999715 / PSNR 59 dB** vs the packaged artifact — pass under the accepted SSIM gate; frames retain the known sub-LSB act-3 jitter (see block above), not introduced by this phase.
- MilkyWay (Phase-1 migration, same primitives): **framemd5 identical** to its pre-migration baseline.
- `bunx tsc -b` exits 0.

**Not done**
- `<Episode>` not applied to MilkyWay or UrlExplainer yet (MilkyWay migration tracked next; UrlExplainer needs its own bespoke path rewritten first).
- `scaleCompare`/`timeline`/`diagram` templates defined in schema but have zero conforming episodes → intentionally unpopulated; `custom` remains the escape hatch everywhere.

## Phase 1 (theme tokens, series config, motion helpers) — 2026-11-12

- Captured a FRESH milkyway baseline (current deterministic build, framemd5) BEFORE migrating.
- MilkyWay.tsx migrated to `src/motion/anim.ts` + `src/theme/tokens.ts` + `src/theme/series.ts`:
  - local `clamp01` / `easeOutCubic` removed; shared helpers imported.
  - badge text now `SERIES.cosmic.badge` (renders identical string).
  - `bg-[#030712]` → `style={{ background: COLORS.bg }}`; gradient stop likewise `COLORS.bg`.
- Post-migration render vs baseline: **framemd5 identical AND MP4 sha256 identical** (FDA8255774...).
- New files: `src/theme/tokens.ts` (canvas, safe zone x 60–1020 / y 170–1536, colors, type,
  spacing, motion consts), `src/theme/series.ts` (cosmic + game-physics, amber accents,
  shared kicker helper), `src/motion/anim.ts` (clamp01, easeOutCubic, easeInOutCubic, anim),
  `src/motion/README.md` (motion rules)

> **2026-11-12 update — the milkyway framemd5 baseline is STALE.**
> The end card (logo lockup, `+ FOLLOW` pill, confetti — `src/components/EndCard.tsx`)
> landed after the phase-0 baseline was captured. Current milkyway frames are
> **not** identical to the November 11 `framemd5_run{1,2}.txt` files. The old files
> were archived as `baselines/milkyway/framemd5_pre_brand_run{1,2}.txt` and
> `baselines/milkyway/sha256_pre_brand_run{1,2}.txt`.
> The freshly captured `framemd5_run{1,2}.txt` (today) are an exact match across two
> back-to-back renders, and so are the MP4 sha256s — determinism of the *current*
> build is still proven, but do not compare today's output to the pre-brand baseline.

## Summary

Both episodes are now **frame-identical and byte-identical** across back-to-back renders.

| Episode | framemd5 run1 == run2 | sha256 run1 == run2 | Duration / streams |
|---|---|---|---|
| `milkyway` | yes | yes (`7597823F ...`) | 23.53s · 1080x1920 · 30 fps · H.264 High · yuv420p · AAC 48k stereo |
| `url-explainer` | yes (0 / 1783 video-frame lines) | yes (`825E94B2 ...`) | 59.46s · 1080x1920 · 30 fps · H.264 High · yuv420p · AAC 48k stereo |

Fix: `playwright`-style wait for double r-AF was NOT sufficient; forcing SwiftShader
via `--disable-gpu` in puppeteer's launch is what eliminated sub-pixel raster jitter
from the capture path. Both episodes switched to that setting.

## What was tested

1. Each existing episode rendered twice (2 separate `bun run render` invocations, same tree).
2. `-f framemd5` on the MP4 (hashes every frame, video + audio) → `baselines/<slug>/`.
3. `Get-FileHash … -Algorithm SHA256` on the MP4 → byte-level check.
4. `ffmpeg -i` stream summary → `baselines/<slug>/ffprobe_summary_run*.txt`.

## Findings

**Before `--disable-gpu` (i.e. before this fix):**
- `milkyway`: deterministic (both runs byte-identical).
- `url-explainer`: NOT deterministic — 81 of 1783 video frames differ; audio packets identical.
  Divergence starts at frame 1702 (t = 56.73 s, act 3). The code itself was pure:
  React renders from `t` only; nothing time-based besides seek. URL episode's heavier
  glow/fill layers exceeded what the GPU compositor could rasterize consistently across
  sessions.
- After adding double-rAF wait: worse (453/1783 diffs) — reverted.

**After `--disable-gpu` (current state):**
- `milkyway`: frame-identical and byte-identical. (Pixels change vs GPU-produced runs.)
  

## What is NOT proven by this report

- Fresh-machine reproduction (clean checkout, empty npm cache).
- Cross-machine reproduction (different chrome/SwiftShader versions).
- Fresh edge-tts re-synthesis (voice model versions can change; word timings are whatever
  the service happens to emit at that moment).

## Operational notes

- `.gitignore` covers `frames/`, `output/`, `results/`, `node_modules/.vite*`, `baselines/`.
- Python invocation migrated to `uv run --with edge-tts,mutagen python …` (uv 0.13.7 manages
  its own Python). The Windows Store `python.exe` stub is no longer used.
- Re-verify determinism with `bun run render` × 2 after any code change; do not assume.
