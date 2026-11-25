# AGENTS.md — Daily Dose of Curiosity: codebase refactor & production system

> Instructions for the coding agent (OpenCode). Read this whole file before touching code.
> Owner: Ghost (Abhijit Guragain). Runtime/package manager: **bun** (never npm/pnpm/yarn unless told).
> Language: **TypeScript (strict)**. UI: React + Tailwind CSS v4. Windows 11 dev machine (PowerShell).

---

## 0. How to work (read first)

1. **Inspect before changing.** Read `src/`, `scripts/`, `public/audio/`, `results/`, `package.json`. Summarize what actually exists before proposing anything. If this file contradicts the code, say so and ask; do not guess.
2. **One phase at a time.** Do the tasks in a phase, run its gates, report results, **stop and wait for approval** before starting the next phase.
3. **No speculative abstractions.** Only extract a template, helper, or config when at least two existing episodes need it. If you are unsure whether something is over-engineering, don't build it and list it under "Deferred".
4. **Never break an existing episode.** Before any refactor, render it and keep its baseline (see Phase 0). A refactor must produce visually identical frames.
5. **Verify, don't assert.** "Done" means a command was run and its output shown (type check, render, probe, frame check). Don't claim success from reading code.
6. **Keep changes small and reviewable.** One concern per commit. Explain *what changed, why, tradeoffs, and how to verify by experiment*.
7. **Ask when blocked** instead of working around hard rules in section 2.

---

## 1. Goal

A **faceless short-form explainer channel** (YouTube Shorts first, then Reels/TikTok) run as a side project with low maintenance:

- Input: a script (`script.txt`) + a small scene config.
- Output: `results/videos/<slug>/{video.mp4, about.txt, meta.json}`, 9:16, 1080×1920, 30 fps, ~20–35 s, branded consistently, captions always on.
- A working **feedback loop**: every posted video has recorded stats, and every new video changes **one** variable so we learn what works.
- Posting automation comes **last**, only after enough videos are posted manually (Phase 7).

Channel niche (decision pending with owner, default to this until told otherwise): **one niche, one recurring format** — science/gaming-physics explainers with sourced claims. Do not add topic categories.

---

## 2. Hard rules (carry over; do not violate)

- **Determinism:** the visual stage is a pure function of `t` (seconds). No `Math.random()` outside seeded factories, no CSS `infinite` animations, no `setInterval`, no animation libraries that own their own clock (including Motion) **inside video scenes**. Motion is fine in non-video UI only.
- **One clock:** preview = `<audio>.currentTime` + `requestAnimationFrame`. Record (`?record=1`) = `window.__seek(t)` from Puppeteer. No shared wall-clock state.
- **Recorder hooks stay intact:** `window.__seek(t)`, `window.__ready = true`, `window.__committedFrame = time`, and `#root[data-rendering-complete="true"]` at the end.
- **Audio is the timeline:** `full_voiceover.mp3` from edge-tts; word timings come only from `WordBoundary` events in `metadata.json`. Never estimate or hand-edit timings.
- **ffmpeg audio:** single voiceover padded with `apad=whole_dur=<total>` so `-shortest` doesn't cut the tail.
- **Output spec:** H.264 High, yuv420p, AAC 48 kHz, `+faststart`, 1080×1920 @ 30 fps.
- **Visuals:** SVG/JSX/Canvas/CSS. No three.js. Raster assets only when necessary and logged (section 8).
- **Tailwind v4** via `@tailwindcss/vite`. Keep `@source "../src/**/*.{tsx,ts,css}"` and `@source "../index.html"` in `index.css`. Make sure `results/`, `frames/`, `output/` are in `.gitignore`.
- **Quality gate:** never call a video done without probing the final MP4 and decoding frames at ≥2 timestamps.
- **Type gate:** `bunx tsc -b` must pass after every phase.

---

## 3. Diagnosis: what is wrong today

Status legend: **done** = implemented & verified · **open** = still outstanding · **deferred** = acknowledged, intentionally not doing it yet.

| # | Problem | Why it matters | Fixed in | Status (2026-11) |
|---|---------|----------------|----------|------------------|
| 1 | Goal says "script in → MP4 out", but each episode is a hand-built component + a per-episode audio script | Not scalable; each video costs hours | Phases 2–3 | **done** (Phase 2 unified, Phase 3 generic shell + all three current episodes wired through it) |
| 2 | Hardcoded look/text: `COSMIC TELEMETRY` badge, "The Lie / Scale Problem / Reality Check" act names | Template is overfit to the MilkyWay episode | Phase 1 | **done** (`src/components/Hud.tsx`, `HUD_PRESETS`, kicker derived from `scene.json`; `src/theme/series.ts`) |
| 3 | No theme tokens or motion rules | Inconsistent look, ad-hoc animation | Phase 1 | **done** (`src/theme/tokens.ts`, `series.ts`, `src/motion/README.md`) |
| 4 | `generate_<episode>_audio.py` copied per episode; Python invoked via PowerShell workaround | Duplicated code; symptom fix instead of root-cause fix | Phase 2 | **done** (`scripts/generate_audio.py`, `uv run --with edge-tts,mutagen`; per-episode generators deleted) |
| 5 | QA checklist is manual | Easy to skip, slow | Phase 4 | **done (verify side)** — `scripts/verify.ts` now checks anchors, banned strings, MP4 spec/faststart and decodes two PNGs; `scripts/qa_metrics.mjs` prints the §9 gate. `package.ts` remains open |
| 6 | Captions dim all upcoming words; branded end card adds dead time at the end | Likely hurts readability and retention (test, don't assume) | Phase 5 | **partial** — `phrase` style implemented and gate-checked; existing episodes remain on their legacy styles and `endCard: true` by explicit owner choice |
| 7 | No post-publish measurement or iteration step | Can't learn what works | Phase 6 | **open** |
| 8 | "Byte-for-byte reproducible" claim is unproven | Online TTS + Puppeteer + x264 may not give identical bytes | Phase 0 | **done** — frames are byte-identical for milkyway & minecraft-edge; space-sound is SSIM ≈ 0.999 gate instead (see `docs/determinism.md`) |
| 9 | Act timings (4–5 + 6–8 + 6–8 s) don't add up to the stated 20–35 s | Contradictory spec | Phase 2 (config) | **done** — spec is now 20–35 s everywhere; no fixed per-act seconds; act boundaries derive from token counts |

---

## 4. Target repository layout

Keep existing paths working during migration. New/changed items marked `(new)`.

```
episodes/                         (new)  one folder per video
  <slug>/
    script.txt                    narration text (source of truth)
    scene.json                    series, template per act, kicker text, accent overrides
    meta.json                     hook, hookStyle, series, durationSec, captionStyle, endCard, posted URLs
    stats.json                    manual/imported analytics snapshots
src/
  theme/                          (new)
    tokens.ts                     palettes, type scale, spacing, motion constants
    series.ts                     per-series config (badge text, accent, kicker style)
  motion/                         (new)
    anim.ts                       pure-function motion helpers
  templates/                      (new)  reusable scene templates (extract from ≥2 episodes)
  components/                     existing episode components until migrated
  App.tsx                         stage + episode router (?episode=)
scripts/
  generate_audio.(ts|py)          (new)  single script: episodes/<slug>/script.txt -> audio + metadata.json
  render_video.mjs                existing
  dev_shot.mjs                    existing
  verify.ts                       (new)  automated QA gate
  package.ts                      (new)  copies output -> results/, writes meta.json + about.txt skeleton
  stats.ts                        (new)  appends stats, prints weekly comparison
shared-assets/
  brand/
  LICENSES.md                     every external asset + license
results/videos/<slug>/            ready-to-post package (gitignored)
```

---

## 5. Phases

### Phase 0 — Baseline & audit (no behavior change)

Tasks:
- Inspect and report: current episodes, components, scripts, `package.json` scripts, what runs on `bun run dev|shot|render`.
- Add/verify `.gitignore` for `results/`, `frames/`, `output/`, `node_modules/.vite*`.
- Render each existing episode once. Save per-episode baseline: `ffprobe` summary and `ffmpeg -i video.mp4 -f framemd5 baseline.framemd5` (store under `baselines/`, gitignored if large).
- **Determinism test:** render the same episode twice and compare the `framemd5` outputs and the file `sha256`. Report whether frames are identical and whether bytes are identical. Update docs to say only what is actually true.
- Fix the Python invocation root cause: document using a real Python install (or `uv`/`py -3`) and turning off Windows "App execution aliases" for the Store stub. Don't ship workarounds as the standard path.

Gate: baselines exist, determinism report written to `docs/determinism.md`, `bunx tsc -b` passes.

### Phase 1 — Theme tokens, series config, motion helpers

Tasks:
- Create `src/theme/tokens.ts`: background, text, one accent per series, type scale (Anton captions, Pirata One brand line only if kept, `ui-monospace` telemetry), spacing, safe margins for 1080×1920 (keep captions/HUD away from the bottom ~20 % and right edge where platform UI overlaps; **confirmed with the owner 2026-11-12**: `xMin 60, xMax 1020, yMin 170, yMax 1536` — nothing below y=1536, captions inside that box).
- Create `src/theme/series.ts`: each series defines badge text (replace hardcoded `COSMIC TELEMETRY`), accent, kicker format. Start with **one** series that reproduces MilkyWay exactly. Add a second only when the owner asks.
- Create `src/motion/anim.ts`:

```ts
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
/** progress 0..1 of an animation that starts at `start` and lasts `dur` seconds */
export const anim = (t: number, start: number, dur: number, ease = easeOutCubic) =>
  ease(clamp01((t - start) / dur));
```

- Motion rules (put in `src/motion/README.md` and follow them):
  - Entrances 0.35–0.5 s, easeOutCubic, ~24 px slide + fade.
  - Stagger list items ~80 ms.
  - Ambient drift only: a 2–4% scale or slow parallax across the whole video.
  - Something on screen changes every ~2–3 s.
  - One accent color per video. No motion longer than 1 s except ambient drift.
- Migrate the MilkyWay episode to tokens + `anim` without changing its look.

Gate: MilkyWay frames at 5 timestamps match its Phase 0 baseline (visually identical; report any diff). `bunx tsc -b` passes.

### Phase 2 — One audio pipeline, episode folders, timing config

Tasks:
- Replace per-episode audio scripts with one `scripts/generate_audio` that takes a slug: reads `episodes/<slug>/script.txt`, writes `public/audio/<slug>/full_voiceover.mp3` + `metadata.json` (`fps`, `totalDuration`, `acts[]`, `words[]` with `start`/`end`).
- Voice: `en-US-AriaNeural`, rate configurable (default `+12%`). Voice and rate come from config, not hardcoded.
- Confirm `WordBoundary` events actually arrive with the installed `edge-tts` version. If they don't, **stop and report**; do not fall back to estimated timings.
- Define act timing in config and make the spec consistent: target total 20–35 s, ~60–75 words. Add a check that warns when word count or duration is out of range.
- Move existing episodes into `episodes/<slug>/` with `script.txt` and `scene.json`. Keep old routes working (`?episode=<id>`).

Risk note for the owner (do not act on it, just record in `docs/risks.md`): `edge-tts` uses an unofficial Microsoft endpoint. It can break and its commercial-use status is unclear. List alternatives to evaluate later, don't switch now.

Gate: regenerating audio for MilkyWay from `episodes/milkyway/script.txt` gives valid `metadata.json`; render smoke (`bun run render:smoke`) passes.

### Phase 3 — Scene schema and reusable templates

Do this only after Phases 1–2 are approved.

Tasks:
- Look at the existing episodes (DNS, Routing, Server, MilkyWay). List which visual patterns repeat (e.g. scale-compare, step/timeline, diagram). **Only patterns used by ≥2 episodes become templates.** Report the list and wait for approval.
- Define the schema in `src/templates/types.ts`:

```ts
export type ActConfig = {
  kicker: string;                 // e.g. "01 // THE HOOK"
  template: 'scaleCompare' | 'timeline' | 'diagram' | 'custom';
  props?: Record<string, unknown>;
  startSec?: number;              // optional override; default derived from words[]
};

export type SceneConfig = {
  series: string;                 // key into theme/series.ts
  title: string;
  acts: ActConfig[];              // 3 acts
  endCard: boolean;               // default false (see Phase 5)
};
```

- Implement a generic `<Episode slug />` component that reads `scene.json` + `metadata.json`, renders HUD, captions and templates. Keep `custom` as an escape hatch so one-off visuals still work.
- Migrate episodes one at a time. Do not delete a legacy component until its migrated version matches baseline frames.

Gate: at least two episodes render through the generic `<Episode>`; frames match baselines. **Status 2026-11: done** — all three episodes (`space-sound`, `minecraft-edge`, `never-touch`) render through the generic `<Episode>`; minecraft-edge framemd5 identical, space-sound SSIM ≈ 0.999. Current focus is `milkyway` → keep bespoke until owner approves.

### Phase 4 — Automated verification and packaging

Tasks:
- `scripts/verify.ts` (`bun run verify <slug>`): runs `ffprobe` on the final MP4 and fails if any of these are wrong: 1080×1920, 30 fps, H.264 + yuv420p, AAC 48 kHz, has video and audio streams, duration within 20–35 s (configurable up to 60 s), `faststart` (moov before mdat). Also decode frames at ≥2 timestamps to PNGs for human review. Print a pass/fail table.
- `scripts/package.ts` (`bun run package <slug>`): copies `output/<slug>-1080x1920.mp4` to `results/videos/<slug>/video.mp4`, verifies sha256 match, writes `meta.json` (see section 7) and an `about.txt` skeleton with 3 caption blocks (YouTube Shorts / Reels / TikTok) and a `SOURCES` section pulled from `script.txt` annotations (`[src: URL]` markers). Missing sources = packaging fails.
- Source rule: every factual sentence in `script.txt` carries a `[src: …]` marker that points to a page the **human** has opened and confirmed. The agent must never invent or "recall" sources.

Gate: `bun run verify milkyway` passes on a good file and fails on a deliberately broken one (test both). **Status 2026-11-25: verify side delivered** — anchors, banned strings, MP4 spec (1080×1920 / 30 fps / H.264+yuv420p / AAC 48 kHz / duration, with the 45 s long-form override) and `faststart` all checked; t=1 s and t=3 s PNGs decoded into `output/.verify/`. Good file passed, deliberately broken file failed. `scripts/qa_metrics.mjs` covers the §9.1 numeric gate. `framemd5` stays in `docs/determinism.md`; `package.ts` (sha256-verified copy + meta.json + about.txt skeleton + missing-sources gate) is still open.

### Phase 5 — Caption and ending experiments (config flags, not hardcoded)

Tasks:
- Add caption styles selectable per episode in `scene.json` / `meta.json`:
  - `karaoke-dim` (current: active orange, past white, upcoming dim)
  - `phrase` (shows the current 3–5 words only; active word highlighted)
- Add `endCard` flag (default **false**). When false, the final line should hold briefly and the video ends cleanly so the Short loops.
- Record chosen options in `meta.json` so results can be compared later.
- Do not declare either style "better". The feedback loop decides.

Gate: both styles render; captions never clip long words (test with the longest word in the script) and don't collide with HUD. **Status 2026-11-25: style implemented, adoption still experimental** — `CAPTION_STYLES.phrase` renders 3-word chunks at 92 px with no dim upcoming words; a temporary swap on `uranus-tilted-sideways` was DOM-checked at 10 timestamps (inside x 60–1020 / y ≤1536) and smoke-rendered, then reverted. Existing episodes remain on their legacy styles; `endCard` still defaults `false` in code/config but every packaged episode was explicitly shipped with `endCard: true` by owner opt-in. No style is declared better without post data.

### Phase 6 — Feedback loop

Tasks:
- `meta.json` is written at package time (section 7). `stats.json` is appended after posting.
- `bun run stats add <slug>`: prompts for/accepts numbers from Studio (views, average % viewed, swiped-away %, 3-second hold if available) and stores them with a timestamp. Take snapshots at about 48 h and 7 days.
- `bun run stats report`: prints a comparison table of the last N videos (default 7) grouped by the variable that changed, plus a reminder: **change one variable per video** (hook style, caption style, length, or end card).
- Optional, later: read-only pull from the YouTube Analytics API (OAuth). Only after the manual loop has run for a while.

Gate: report runs with ≥2 sample stats entries and prints a readable table.

### Phase 7 — Posting automation (BLOCKED until ≥10 videos posted manually)

Do **not** start until the owner confirms 10+ manually posted videos and reviewed stats.

Notes to verify against current official docs before writing code (do not rely on this list):
- YouTube Data API `videos.insert` needs OAuth (`youtube.upload`). Projects that haven't passed Google's compliance audit have uploads forced to **private**. Plan: upload as private → owner publishes/schedules in Studio, and apply for the audit only if it proves worthwhile. Check current daily upload quota; documentation and third-party articles disagree.
- Instagram Reels and TikTok have their own posting APIs with account-type and approval requirements. Check current docs before building.
- Keep posting as a separate script/module. A failed upload must never affect rendering.

---

## 6. Content rules for scripts (for any agent-generated drafts)

- One idea per video. ~60–75 words. Three acts: hook (curiosity gap) → escalation ("wait, what?") → payoff (twist or reality check).
- First frame already shows content. No logo intro.
- Claims must be defensible. Hedge uncertain claims ("likely", "most scientists consider…") or cut them.
- Do not invent facts, numbers, or citations. If a claim lacks a human-verified source, flag it instead of including it.
- Add original framing or a point of view; avoid generic list-of-facts scripts (platform policy risk on mass-produced, templated content — the owner will verify current policy wording).
- Any realistic-looking synthetic imagery or voices may need platform disclosure; flag to the owner rather than deciding.

---

## 7. Data formats

`episodes/<slug>/meta.json`:

```json
{
  "slug": "milkyway",
  "series": "cosmic",
  "hook": "text of the first line",
  "hookStyle": "question | claim | contradiction | number",
  "captionStyle": "karaoke-dim | phrase",
  "endCard": false,
  "durationSec": 0,
  "wordCount": 0,
  "posted": { "youtube": null, "instagram": null, "tiktok": null }
}
```

`episodes/<slug>/stats.json`: array of snapshots:

```json
[
  { "capturedAt": "ISO-8601", "platform": "youtube", "afterHours": 48,
    "views": 0, "avgViewPct": 0, "swipedAwayPct": 0, "hold3sPct": null }
]
```

Fields may be `null` when the platform doesn't show them.

---

## 8. Asset policy

- Fonts via npm (`bun add @fontsource/<name>`), OFL only. Currently Anton, Pirata One.
- Icons: Lucide or Phosphor (MIT) as SVG/React.
- Images: only if needed. NASA media (check each item), Wikimedia Commons (license varies per file), Openverse (CC0 filter).
- SFX: Freesound CC0 only. Music: only sources with a clear, recorded license.
- **Every external asset is logged in `shared-assets/LICENSES.md`** with source URL, license, author, and date added. Don't add an asset without that entry.
- Bun itself has no asset catalog. Assets come from packages or downloaded files committed under `shared-assets/` (or `public/`).

---

## 9. Commands (keep these working)

```bash
bun run dev                      # preview at localhost:5173
bun run shot "1,5,9,14,19"       # headless PNGs at exact timestamps
bun run render                   # full episode -> output/<episode>-1080x1920.mp4
bun run render:smoke             # first ~3 s sanity check
bun run cover -- --episode <slug> # seven cover targets + legacy aliases
bun run bed                      # regenerate the deterministic music bed WAV
bun run sfx                      # regenerate the synthesized SFX WAVs
bun run qa -- --slug <slug>      # §9.1 measured gate table (or --video <path>)
bun run verify <slug>            # (Phase 4) anchors + spec/faststart + decoded stills
bun run package <slug>           # (Phase 4, still open) results/ package + meta.json + about.txt
bun run stats add <slug>         # (Phase 6)
bun run stats report             # (Phase 6)
bunx tsc -b                      # type gate
```

If vite hangs for ~300 s at "ready in": delete stale `node_modules/.vite*` (PowerShell: `Remove-Item -Recurse -Force node_modules\.vite*`).
If a `bun add` package's postinstall is skipped (bun's security default), run that package's install script manually.

---

## 10. Definition of done (per phase)

- Commands in the phase's gate were run and their output shown.
- `bunx tsc -b` passes.
- Existing episodes still render; frames match the Phase 0 baseline unless the owner approved a visual change.
- Docs updated (`README`, `docs/`), with only claims that were verified.
- A short report: what changed, why, tradeoffs, how the owner can verify by experiment, and a "Deferred" list.

## 11. Anti-goals (do NOT do these)

- Don't build a video editor UI, a CMS, a database server, or a dashboard. Files and scripts are enough. **(Owner-accepted exception 2026-11)** A minimal "Daily Dose Studio" dashboard lives in `src/components/admin/` (`/`, `/videos`, `/videos/:slug`, `/assets`) for the owner to browse packages and brand assets — built on react-router-dom + TanStack Query. It is NOT a video editor, NOT a CMS, NOT a SaaS. Any feature beyond browsing/preview/downloading packages there is out of scope and requires explicit written approval.
- Don't switch frameworks (e.g. to Remotion) or the TTS engine without a written proposal and owner approval.
- Don't add posting automation before Phase 7 conditions are met.
- Don't add more series, themes, or templates "for later".
- Don't optimize render speed or file size until a real bottleneck is measured.
- Don't use Motion (or any self-clocked animation library) inside video scenes.
- Don't fabricate sources, stats, or platform API details. If unsure, say so and cite what must be checked.