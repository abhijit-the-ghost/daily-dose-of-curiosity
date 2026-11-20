# Daily Dose of Curiosity — programmatic vertical videos

Channel: **Daily Dose of Curiosity** — gaming · science · verified facts.
Format: short-form (YouTube Shorts / Instagram Reels / TikTok / Facebook Reels),
9:16 1080×1920, generated with code: **React + deterministic scenes**, **free neural TTS**
(edge-tts, no API key), **2D SVG composition**, **Tailwind CSS v4**, and **puppeteer + ffmpeg**
for frame-capture encoding. (SVG / Canvas / CSS only — no 3D engine.)

## Documentation — where everything lives

| Doc | What it covers |
|---|---|
| [`docs/pipeline.md`](docs/pipeline.md) | **Prompt → finished MP4** — the full step-by-step, with the exact commands and file paths (generate → voice → render → verify → package) |
| [`VIDEO_PRODUCTION.md`](VIDEO_PRODUCTION.md) | The playbook — rules, conventions and structure of the episode format |
| [`AGENTS.md`](AGENTS.md) | Episode law for the agent — one idea, sourcing rules, hard gates, the anti-goals |
| [`docs/brief-template.md`](docs/brief-template.md) | The episode brief format — facts, art direction, beat sheet, QA checklist |
| [`docs/conventions.md`](docs/conventions.md) | Anchors (`{word, occurrence}`), the FACTS rule, safe-zone, source-marker rule, HUD layers |
| [`docs/determinism.md`](docs/determinism.md) | Every run's determinism status — framemd5 log, known jitter, gate decisions |
| [`docs/risks.md`](docs/risks.md) | Known risks — edge-tts's unofficial endpoint, platform policy, voice fragility |
| [`docs/url-explainer-sources.md`](docs/url-explainer-sources.md) | Source list for the legacy URL-explainer episode |
| [`LICENSE`](LICENSE) | MIT |
| [`shared-assets/LICENSES.md`](shared-assets/LICENSES.md) | Every external asset, its author and license (OFL fonts, Curiosity artwork) |

## Episodes shipped

| # | Slug | Hook | Facts |
|---|------|------|------|
| 1 | `milkyway` | "Why You've Never Seen a Real Photo of the Milky Way" | legacy, no per-claim tags yet (see `episodes/milkyway/sources.md`) |
| 2 | `url-explainer` | "What actually happens when you type a URL?" | legacy, multi-file manifest (see `docs/url-explainer-sources.md`) |
| 3 | `space-sound` | "Space games make explosions loud — real space gives you silence." | `episodes/space-sound/sources.md` |
| 4 | `minecraft-edge` | "How long to walk to the edge of Minecraft?" | `episodes/minecraft-edge/sources.md` |
| 5 | `never-touch` | "You have never touched anything in your life." | `episodes/never-touch/sources.md` |
| 6 | `everest-challenger-deep` | "Which wins: Everest, or the deepest hole in the ocean?" | `episodes/everest-challenger-deep/sources.md` |
| 7 | `touch-and-feel` | "Someone asked: if atoms never touch, how do you feel a table?" | `episodes/touch-and-feel/sources.md` |
| 8 | `nuclear-gandhi` | "The most famous game bug never existed." | `episodes/nuclear-gandhi/sources.md` |
| 9 | `sun-never-black-hole` | "Why our Sun will never become a black hole." | `episodes/sun-never-black-hole/sources.md` |

Source of truth for scripts: `episodes/<slug>/script.txt` · Scene choreography:
`episodes/<slug>/scene.json` · Audio timeline: `public/audio/<slug>/metadata.json`
(generated — never hand-edited) · Sources: `episodes/<slug>/sources.md`.
Ready-to-post packages live under `results/videos/<slug>/` — **gitignored on purpose**;
`results/` is treated as disposable output, not source.

For the full chain (prompt → MP4) see [`docs/pipeline.md`](docs/pipeline.md);
for the rules behind it see [`AGENTS.md`](AGENTS.md) and
[`VIDEO_PRODUCTION.md`](VIDEO_PRODUCTION.md).

## Pipeline

| Step | Command | Output |
| --- | --- | --- |
| 1. Voiceover | `bun run generate:<slug>` | `public/audio/<slug>/full_voiceover.mp3` + `metadata.json` |
| 2. Design the scene | edit `src/components/<Slug>Acts.tsx` | SVG/JSX per act |
| 3. Preview | `bun run dev` | interactive stage at `http://localhost:5173/episode?episode=<slug>` |
| 4. Frame check | `bun run shot "0.5,10,20" --episode <slug>` | PNGs at exact timestamps |
| 5. Verify anchors | `bun run verify <slug>` | pass/fail table; fails on missing/ambiguous anchors or banned strings |
| 6. Render | `bun run render -- --episode <slug>` | `output/<slug>-1080x1920.mp4` |
| 7. Package | copy `output/<slug>-1080x1920.mp4` → `results/videos/<slug>/` (sha256 verified) | ready-to-post MP4 |
| 8. Write `about.txt` | captions per platform + `meta.json` | `about.txt` + `meta.json` in the package |

`bun run shot` and `bun run render` spawn vite themselves — no manual dev server needed.

## How it works

1. **`scripts/generate_audio.py`** — unified edge-tts generator (uv-managed CPython;
   `en-US-AriaNeural`). Reads `episodes/<slug>/script.txt` + `scene.json`, writes
   `public/audio/<slug>/metadata.json` (fps, totalDuration, WordBoundary per-word
   `start`/`end`, act boundaries derived from per-act token counts — never hand-tuned).
   Each act block starts with a `// ACT N` marker; facts that need on-screen display
   must live in `episodes/<slug>/facts.ts` as a single `FACTS` constant and be
   derived from it in scene code (no stray digit literals).
2. **`src/App.tsx`** — episode router (`?episode=<slug>`; default `milkyway`) plus
   `/`, `/videos`, `/videos/:slug`, `/assets` for the studio dashboard (see below).
   `/episode?record=1&episode=<slug>` is the deterministic record surface.
3. **`src/components/Episode.tsx`** — the generic shell. Reads `scene.json` +
   `metadata.json`, drives recorder hooks (`__seek`, `__ready`, `__committedFrame`,
   `data-rendering-complete`), preview scale, kicker text/colors from `scene.json`,
   caption hold-out windows, and delegates the act SVG to the per-episode `Acts`
   component registered in `REGISTRY`.
4. **`src/components/{SpaceSoundActs,MinecraftEdgeActs,NeverTouchActs,EverestVsDeepActs,TouchFeelActs,NuclearGandhiActs,SunNeverBlackHoleActs}.tsx`** —
   per-episode scene implementations. `custom` template acts today; shared primitives
   live in `src/components/Starfield.tsx`, `KaraokeCaption.tsx`, `Hud.tsx`, `anim`.
5. **`scripts/render_video.mjs`** — vite build → preview → puppeteer @ 1080×1920.
   For every frame: `__seek(t)` → wait for `__committedFrame === t` → JPEG. ffmpeg
   (`ffmpeg-static`) mixes the voiceover and encodes H.264 High + yuv420p + AAC 48 kHz,
   `+faststart`, 1080×1920 @ 30 fps.
6. **`scripts/verify.ts`** — fails if any anchor in an episode's `scene.json` /
   `brief.md` is missing or ambiguous in `metadata.json`, and if any banned string
   from the per-episode list appears in `script.txt`. Run it before every render.
7. **`scripts/admin_manifest.mjs`** — generator for the studio dashboard
   (`public/admin-manifest.json`, gitignored).

## Project layout

```
episodes/<slug>/           per-episode source (script.txt, scene.json, facts.ts, sources.md, meta.json)
src/theme/                 tokens.ts (canvas + owner-confirmed safe zone) · series.ts (cosmic/game-physics)
src/motion/                anim.ts (clamp01/easeOutCubic/easeInOutCubic/anim) · README.md (motion rules)
src/components/            Episode.tsx (generic shell) · <Slug>Acts.tsx (per-episode scene)
src/components/Starfield.tsx, KaraokeCaption.tsx, Hud.tsx, EndCard.tsx — shared primitives
src/templates/types.ts     ActConfig / SceneConfig schema (`custom` | `scaleCompare` | `timeline` | `diagram`)
public/audio/<slug>/       generated voiceover + metadata.json (do not hand-edit)
scripts/                   generate_audio.py · render_video.mjs · dev_shot.mjs · verify.ts · admin_manifest.mjs
docs/                      pipeline (prompt→MP4) · conventions · brief-template · determinism · risks · url-explainer-sources
results/videos/<slug>/     ready-to-post package (gitignored — disposable)
output/  frames/           render working dirs (gitignored)
shared-assets/brand/       channel logo, OFL fonts, Curiosity stickman (original artwork)
```

## Verification and determinism

`bunx tsc -b` is the type gate. Record-time frames are byte-identical across
runs of the same build (verified for `milkyway` and `minecraft-edge`; see
`docs/determinism.md`). `space-sound` passes an SSIM ≈ 0.999 gate instead of
byte-exact due to an Act 3 raster jitter that predates the refactor
(also documented in `docs/determinism.md`).

## Studio dashboard

Not an episode — a separate surface in this repo for owner use.
`/` → overview · `/videos` → all videos (search, sort) · `/videos/:slug` → detail
with per-platform artwork, meta.json breakdown and MP4 download · `/assets` → the
`shared-assets/` kit with image/font/markdown/JSX previews. Regenerate with
`bun scripts/admin_manifest.mjs`. Built with react-router-dom, TanStack Query,
lucide-react. See `AGENTS.md` anti-goals note for why it's treated as an accepted
exception to the "no dashboards" rule.

## Customizing / contributing a new episode

Follow [`docs/pipeline.md`](docs/pipeline.md) end-to-end; the short version:

1. `episodes/<slug>/script.txt` (with `[src: …]` markers per `docs/conventions.md`),
   `scene.json`, `facts.ts`, `sources.md`, `brief.md` (see `docs/brief-template.md`).
2. `bun run generate:<slug>` → `public/audio/<slug>/metadata.json`.
3. `bun run verify <slug>` — must pass before anything renders.
4. Register the `<Slug>Acts` component in `src/components/Episode.tsx` (`REGISTRY`),
   add route in `src/App.tsx`, add `HUD_PRESETS`/`CAPTION_STYLES` entries.
5. `bun run dev` — iterate with `bun run shot "0.5,10,20" --episode <slug>`.
6. `bun run render -- --episode <slug>` → `output/<slug>-1080x1920.mp4` → probe + package
   into `results/videos/<slug>/`.

See `docs/brief-template.md` for the episode brief shape and `docs/conventions.md`
for the anchor / FACTS rules.

## Source-marker rule (every [src:] must be human-opened)

`[src: x]` in a script means "a human opened URL x and verified every claim it covers."
Links that were never opened cannot be shipped. Harvest the marked sources into
`episodes/<slug>/sources.md` before declaring an episode ready; update it whenever
a claim changes.

## Not included (yet)

Auto-upload to Shorts / Reels / TikTok — planned as Phase 7, blocked until the
manual analytics loop (Phase 6) has been running for a while. See `AGENTS.md`
and `docs/risks.md`.
