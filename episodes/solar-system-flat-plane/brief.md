# Brief — `solar-system-flat-plane`

> Document status: Stage 1–6 for this episode; results package and all platform covers created on owner request. **No posting, commit or push are authorised.**
> `AGENTS.md` hard rules win; report conflicts, don't silently pick.
> Verdict: **SHIP**, with the owner-approved 150-word long-form exception and the Act 1 shared-premise citation note recorded in §9.

---

## 0. Conventions

**Anchors.** `{word, n}` = the n-th occurrence of `word` in the whole voiceover, case-insensitive, punctuation stripped, hyphenated words = one token. Times come only from `metadata.json → words[]`; never estimate them.

**Act boundaries** come from `acts[]` in `metadata.json`; scene code must not hard-code them.

**Banned strings anywhere on screen:** `TODO(fill in per-episode)`.

**FACTS rule.** Every displayed number comes from `episodes/solar-system-flat-plane/facts.ts`. Scene files contain no digit literals for displayed numbers.

**Token counts from the locked script** (anchors deferred to Stage 5):

| Word | Occurrences in script |
|---|---|
| `plane` | 2 (`flat plane`, `flat lane` is a separate phrase) |
| `planet` / `planets` | 3 (`all eight planets`, `every other planet`, `the planets formed`) |
| `cloud` | 4 (`pulled that cloud`, `the entire cloud`, plus Act 2 subject) |
| `spin` | 3 (`net spin`, `spin faster`, `sideways spin`) |

---

## 1. Narration (source of truth)

The exact text below is in `episodes/solar-system-flat-plane/script.txt`. Voice `en-US-AriaNeural`, rate `+12%`.

```txt
// ACT 1 — THE HOOK
Gravity pulls equally in every direction—so why do all eight planets orbit the Sun on a flat pancake instead of crisscrossing in 3D like electrons around an atom? [src: S3, S5]

// ACT 2 — THE CLOUD
Four and a half billion years ago, our solar system wasn't flat at all. It was a giant, chaotic sphere of gas and dust, tumbling through space with a slight net spin. [src: S1, S3, S4]

// ACT 3 — THE COLLAPSE & COLLISIONS
As gravity pulled that cloud inward, conservation of angular momentum forced it to spin faster. Meanwhile, particles orbiting at wild up-and-down angles kept slamming into each other—canceling out their vertical motion while preserving their shared sideways spin. [src: S2, S3, S6]

// ACT 4 — THE DISK
Over millions of years, that cosmic traffic jam flattened the entire cloud into a razor-thin spinning disk where the planets formed. [src: S1, S2, S4]

// ACT 5 — THE PAYOFF & LOOP
Today, Mercury tilts by just seven degrees, and every other planet sits within three and a half—locked into one flat lane because they all inherited the exact same spin. [src: S1, S3, S5]
```

- Locked word count: **150**. Acts: **29 / 32 / 38 / 21 / 30**.
- `--dry-run` warns `word-count 150 outside 60-75`; this is an owner-supplied replacement, so it is recorded, not silently shortened.
- Stage 3 projection was ≈ **59 s**; measured Stage 6 duration is **52.07 s**. Above the 20–35 s Short gate; the long-form exception was owner-approved in §9.
- Hook style: **visual contradiction / expectation flip** — atom-shell crisscrosses vs one flat disk.
- Viewer question (exact wording from the idea sheet): **"Why do all the planets orbit the Sun in a flat plane instead of crisscrossing in 3D like electrons around an atom?"**
- Pinned-comment hook: **"Oort Cloud comets still come from every direction — why didn't they flatten?"**
- Loop line: **"one flat plane."**

---

## 2. Sources

| tag | URL | Supports | Status |
|---|---|---|---|
| S1 | https://science.nasa.gov/solar-system/solar-system-facts/ | eight planets; cloud collapsed into a spinning disk; Oort Cloud context | owner-opened / confirmed 2026-11-25 |
| S2 | https://science.nasa.gov/exoplanets/how-do-planets-form/ | dust in a donut-shaped disk; collisions; “scientists think / likely” hedge | owner-opened / confirmed 2026-11-25 (replaces the 404 URL) |
| S3 | https://science.nasa.gov/learn/basics-of-space-flight/chapter1-1/ | planets orbit in or near one plane (ecliptic); angular momentum; Oort Cloud context | owner-opened / confirmed 2026-11-25 |
| S4 | https://www.britannica.com/science/solar-nebula | nebula pulled together by gravity and flattened into a spinning disk | owner-opened / confirmed 2026-11-25 |
| S5 | https://kids.britannica.com/students/article/planet/276448 | all eight planets in one plane; `~7°` Mercury; `~3.5°` all others | owner-opened / confirmed 2026-11-25 |
| S6 | https://cosmicopia.gsfc.nasa.gov/qa_plan.html | cloud collapse, angular momentum, collisions damp random velocities | owner-opened / confirmed 2026-11-25 |

Full quotes and claim mapping are in `sources.md`. No recalled or invented citation is present. The Stage 1 marker set S1–S6 is unchanged by the Stage 3 script replacement.

---

## 3. FACTS

```ts
export const FACTS = {
  bandDeg: { value: 7, display: '~7° BAND', src: 'S5' },
  otherPlanetsDeg: { value: 3.5, display: '~3.5° / OTHER PLANETS', src: 'S5' },
} as const;
```

**Owner override (2026-11-25):** the playbook default is one displayed number. The owner explicitly chose to show both `~7°` and `~3.5°`; `~7°` remains the primary wedge, `~3.5°` is the supporting comparison. Both are sourced to S5 and both live in `facts.ts`.

---

## 4. Art direction (Stage 3 direction; Stage 5 builds it)

### 4.1 Concept

One persistent SVG world: `CentralSun`, `AtomShellOverlay` at 0°/60°/120°, `NebulaParticleField` with `vy` arrows damping while `vx` accelerates, and `EclipticBandRig` reading both facts values. No disconnected fading scenes.

### 4.2 Canvas and safe zones

1080 × 1920. Owner-confirmed safe zone `x 60 → 1020`, `y 170 → 1536`. Nothing legible sits outside it.

### 4.3 Coordinate system

Geometry derives from `FACTS`: wedge angles from `bandDeg.value` and `otherPlanetsDeg.value`; no typed display-number literals in scene files.

### 4.4 Palette

Series: **`cosmic`**. One accent only: amber `#F59E0B`. Secondary `#60A5FA` only for the before-state. HUD badge text: `COSMIC TELEMETRY`.

### 4.5 Type

- **Anton**: captions (uppercase) and the proof numerals.
- **ui-monospace**: HUD, kicker, tags, sub-labels.
- **Pirata One**: brand lockup only, if kept.

### 4.6 Layers (z-order, bottom → top)

Background → particle field / shells / disk → velocity vectors → wedge → HUD/kicker → captions.

### 4.7 HUD / kicker / captions

`captionStyle: "phrase"`, 1–3 words per chunk, no grey upcoming words. HUD badge `[ COSMIC TELEMETRY // FLAT PLANE ]`. No timecode for the loop.

### 4.8 Motion

Entrances 0.35–0.5 s `easeOutCubic`, ~24 px slide + fade; stagger ~80 ms; camera pushes `1.0 → 1.12` Act 1, `→ 0.92` Act 2, edge-on tilt `0° → 78°` Act 3, `→ 1.18` Act 5; ambient drift 2–4 %; visual beat ≤ 2.3 s; ghost atom shells return in the final 0.6 s. All motion must be a pure function of `t`.

### 4.9 Do not

No logo intro, raster assets, 3D library, second accent, `Math.random()` outside seeded factories, or CSS transitions inside video scenes.

---

## 5. Beat sheet

`scene.json` now carries **36 WordBoundary-anchored beats** (Stage 3 planned 31), max gap **2.5 s**, exactly one `counter` proof at the wedge, exactly one `question` at **58.7 %**, two full-bleed ground flips at **7.405 s / 35.670 s**, `endCard: false`, loop chip at **48.594 s** and the ghost-shell return derived from `totalDuration - 0.6` (**51.470–52.070 s**). `beats.md` retains the original storyboard table as an edit decision record.

---

## 6. Density and budget check

- Locked word count **150**, outside the 60–75 Short gate by owner replacement; measured **52.07 s** duration.
- Measured act windows: **0.10–8.68 / 9.45–18.66 / 19.44–33.56 / 34.33–40.97 / 41.74–50.91 s**.
- Longest re-anchored beat gap: **2.5 s**, over the 2.3 s planning target; it is an intentional sustained shot, not silence. Stage 6 measures the actual audio silence below.
- Stage 5 implemented the beat plan in `src/components/FlatPlaneActs.tsx`; the code reads every `at` from `scene.json` and derives both wedge angles from `facts.ts`.

---

## 7. QA gate (on top of the repo QA gate)

- [x] `bunx tsc -b` passes (Stage 3, Stage 5 and Stage 6 re-anchor).
- [x] No digit literals for displayed numbers in scene files (both angles read from `facts.ts`; the moving counter interpolates `FACTS.value`).
- [x] Banned strings absent from narration + visible text.
- [x] Every anchor in the beat sheet resolves in `words[]` — 36 beat and 11 SFX anchors from the 150 `WordBoundary` words.
- [x] Geometry derives from FACTS (`bandDeg.value` / `otherPlanetsDeg.value` drive the wedge).
- [x] Captions never clip long words: longest script token `crisscrossing` measures 522 px at 92 px Anton inside the 984 px caption width.
- [x] Nothing legible sits below y = 1536 or right of x = 1020: DOM check at 16 timestamps found 0 unsafe zones; badge moved to x82/y180, chip to y287.
- [x] Long-form duration exception confirmed by measured 150 words / 52.07 s.
- [x] Stage 6 full render: `output/solar-system-flat-plane-1080x1920.mp4` (1562 frames, 52.07 s, 9.3 MB), H.264 High/yuv420p + AAC 48 kHz, `+faststart`.
- [x] Silence gate: 0 silence events at `noise=-35dB:d=0.12` → 0.00 % silence, max gap 0.000 s (gate ≤10 % / ≤0.45 s).
- [x] Loudness gate: final MP4 measures **−14.0 LUFS** integrated, true peak −1.4 dBFS, LRA 2.2 LU (gate −14 ±0.5 LUFS).
- [x] `bun run verify solar-system-flat-plane` passes: 150 words / 52.07 s, spec/faststart, all anchors, decoded stills at t=1 s and t=3 s.
- [x] Stage 6 loop check: dev-shot PNGs at t=0 and t=`totalDuration` are byte-identical (same SHA-256); world snaps to frame 1 before the cut.
- [x] Packaged to `results/videos/solar-system-flat-plane/` after the owner asked why it was not in `results/`: `video.mp4` SHA-256 verified identical to the render, `meta.json`, a three-platform `about.txt` with all S1–S6 URLs, and platform covers for Facebook, Instagram/Reels, TikTok and YouTube (plus Shorts 2×, profile grid, feed, and 16:9 thumbnail). Posting is not authorised.

---

## 8. The 12 grill answers (Stage 1 output, updated for the 5-act script)

1. **Belief → shift.** Before: planets orbit in 3D atom-style shells. After: one spinning cloud collapsed, angular momentum kept the sideways spin, collisions canceled vertical motion, and all eight planets inherited one plane.
2. **Contradiction, one line.** "Gravity pulls every way, yet all eight planets stay in one flat lane."
3. **Number, visual.** Owner chose two displayed numbers: primary `~7°` band and supporting `~3.5°` for every other planet. Both are drawn as an edge-on wedge from `facts.ts`; one `counter` beat is the sole moving proof.
4. **Mute test.** Frame 1: crossed dashed shells beside/over one flat amber disk, with a wedge. The conflict reads without words.
5. **Counter-argument.** The atom diagram is a false mental model, not a claim about real electrons; narration does not describe electron physics. Oort Cloud comets are the comment-hook exception (S1/S3).
6. **Source.** S1–S6 above, unchanged by the script replacement.
7. **Comment argument.** "But Oort Cloud comets come from every direction — why didn't they flatten?"
8. **Second-best moment.** Vertical `vy` arrows collide and damp while sideways `vx` survives.
9. **Loop.** Final line "one flat plane" restates frame 1; ghost shells return in the last 0.6 s.
10. **One idea.** Yes — orbital flattening only. Pluto, Uranus' tilt and Venus' spin are out of scope. Now 5 acts / 150 words by owner replacement.
11. **Existing episode repeat.** None. `uranus-tilted-sideways` covers spin-axis tilt; `venus-sun-rises-west` covers spin direction; `space-sound` covers sound in plasma.
12. **Ship test.** Frame 1: crossed shells + huge flat disk + wedge. A stranger with sound off sees the contradiction immediately.

---

## 9. Open decisions and risks

- **Long-form exception:** owner-approved; measured 150 words / 52.07 s, inside the 45–60 s verify band.
- **Act 1 citation note:** the supplied marker `[src: S3, S5]` is preserved exactly. `sources.md` does not carry an explicit isotropic-gravity quote; flag before packaging if a direct citation is required.
- Stage 6 audio, re-anchoring, SFX synthesis, full render, measurement gates, results packaging and platform covers are done; posting remains outside this stage.
- No caption style or end-card experiment result is claimed; `captionStyle: "phrase"` and `endCard: false` are this episode's recorded, untested defaults.
- Stage 5 frame gate (provisional storyboard times, metadata absent): 31 beats / max gap 2.1 s; 28/28 two-second sampled frame pairs differ (mean `DiffY` 2.83); final snapped frame is byte-identical to frame 1 (same PNG SHA-256 and framemd5). DOM text-zone check found at most 2 scene zones plus phrase captions = 3, with 0 safe-zone violations.
- No posting is authorised.

---

## 10. Asset needs

All visuals are SVG/JSX/CSS drawn in code. Stage 6 generated seven new deterministic SFX WAVs with `scripts/synth_sfx.py` alongside the two legacy assets; all nine are logged in `shared-assets/LICENSES.md` as original work. No raster asset is planned.

---

## 11. Phase A audio polish — v2 only

Owner-approved review response, scoped to this episode only:

- Added `sub_drop_v2.wav`, `sub_thump_v2.wav`, `disk_collapse_v2.wav` with 2nd/3rd harmonic partials so the pitch survives phone speakers (100–300 Hz carrier band). The nine v1 filenames are untouched, so legacy episodes cannot drift.
- `sfx.json` uses `sub_thump_v2.wav` and `disk_collapse_v2.wav`, raises repeated tick/click gains from −22/−24 dB to −18 dB, and adds deterministic `rate` values (0.94–1.06) to repeated events.
- `scene.json` enables `voiceProcess: true` (highpass 80 Hz, light compressor, +2 dB at 3.5 kHz before `adelay`) and `bedGainDb: -2` for the audibility A/B.
- `qa_metrics.mjs` recognises this episode's 20–75 s long-form band.
- No new tools were installed; only existing `numpy`, `ffmpeg`, and `ffprobe` are used.

The verified v1 package remains in `results/videos/solar-system-flat-plane/`. Phase A outputs are written to a separate v2 package.
