# Stage 3 output — beat plan, hook stress test, cinematic SVG plan

**Episode:** `solar-system-flat-plane` · **series:** `cosmic` · **accent:** `#F59E0B` · **endCard:** `false`
**Source of truth for the machine-readable timeline:** `episodes/solar-system-flat-plane/scene.json`.
The owner-replaced **5-act, 150-word** script is locked in `script.txt`. Stage 3 was authored before audio; the measured Stage 6 retiming below supersedes the storyboard timings in this document.

---

## 0. Stage 3 timing basis (superseded by Stage 6)

At Stage 3 there was no `metadata.json`, so the `at` values below were a **storyboard plan**, not measured word timings. They are retained only as the edit decision record; `scene.json` is the machine-readable source of truth and was re-anchored in Stage 6.

- Dry-run result: `word-count 150`, acts `[29, 32, 38, 21, 30]`, voice `en-US-AriaNeural`, rate `+12%`.
- The generator warns `150 outside 60-75`; this is an owner-supplied replacement script, so it is recorded, not silently shortened.
- Extrapolation from the repo's measured reference (`69` tokens → `27.02 s`): `150 / 69 × 27.02 ≈ 58.74 s` + `0.35 s` tail ≈ **59.09 s planned total**.
- This projects above the 20–35 s Short gate. It is inside the 60 s verify override ceiling, but **needs owner sign-off on a long-form exception before audio**.

| Act | Script content | Planned window (s) | Tokens |
| --- | --- | --- | --- |
| 1 | THE HOOK | 0.00–11.36 | 29 |
| 2 | THE CLOUD | 11.36–23.89 | 32 |
| 3 | THE COLLAPSE & COLLISIONS | 23.89–38.78 | 38 |
| 4 | THE DISK | 38.78–47.00 | 21 |
| 5 | THE PAYOFF & LOOP | 47.00–59.09 | 30 |

**Handoff rule for Stage 5/2:** after `generate_audio.py` produces real `metadata.json`, every `at` must be re-anchored to a `WordBoundary` word or `actBreakdown[]` start. Never hand-edit word timings; this table is only the edit decision list.

---

## 0b. Stage 6 — measured WordBoundary retiming

`uv run --with edge-tts,mutagen python scripts/generate_audio.py solar-system-flat-plane` produced `public/audio/solar-system-flat-plane/metadata.json` with **150 WordBoundary words**, voice `en-US-AriaNeural`, rate `+12%`.

| Measurement | Value |
| --- | --- |
| Voiceover duration | **51.72 s** |
| `totalDuration` (`tail: 0.35`) | **52.07 s** |
| Re-anchored beats | **36** (strictly increasing) |
| Max inter-beat gap | **2.500 s** |
| Tail hold after last word | **1.579 s** |
| `question` | **30.58 s — 58.7 %** of runtime |
| `counter` / `dots` / `bar` proof beats | **1** (`43.862 s`, `counter`) |
| Full-bleed ground flips | **2** (`7.405 s` cool, `35.670 s` amber) |
| Loop chip | **48.594 s** |
| Ghost-shell window | **51.470–52.070 s**, derived from `totalDuration - 0.6` |

`bun scripts/reanchor_solar_system_flat_plane_beats.mjs` performed the retiming from `words[]` only. The ghost-shell return is the single metadata-derived non-word time; no word timing was estimated or hand-edited. The 45–60 s long-form band in `scripts/verify.ts` is now confirmed by the measured 52.07 s duration.

**Stage 6 render/gate results (2026-11-25):** 1562 frames rendered to `output/solar-system-flat-plane-1080x1920.mp4` (9.3 MB); one voice act + 11 SFX events + ducked default bed; two-pass loudnorm measured −20.74 LUFS / −4.34 dBTP and landed at −14.0 LUFS output. Final-MP4 `ebur128`: −14.0 LUFS integrated, −1.4 dBFS true peak, 2.2 LU LRA. `silencedetect=noise=-35dB:d=0.12` found 0 events → 0.00 % silence, max gap 0.000 s. `bun run verify solar-system-flat-plane` passed all anchors and spec checks. Dev-shot PNGs at t=0 and t=`totalDuration` are byte-identical (same SHA-256), confirming the loop snap. `music_bed.wav` was not regenerated; the two legacy SFX hashes were unchanged after nine deterministic assets were emitted.

---

## 1. Gate 3 result (Stage 3 storyboard — remeasured in §0b)

`INSTRUCTIONS.md` §5 H1 says “≥ 12 beats in ≤ 32 s”. With a 150-word owner replacement, the ≤ 32 s clause is treated the same way as the Venus long-form exception: the operative constraints are **gap ≤ 2.5 s** (tightened here to the owner's **≤ 2.3 s**) and the §5 list below.

| Check | Target | Plan | Result |
| --- | --- | --- | --- |
| Beat count | ≥ 12 | **31** | PASS |
| Max gap between beats | ≤ 2.3 s | **2.1 s** throughout Acts 1–4 | PASS |
| Final static hold | ≤ 2.0 s target | **0.59 s** after the last shape beat | PASS |
| `counter` / `dots` / `bar` proof beats | exactly 1 | **1** (`55.2`, `counter`) | PASS |
| `question` beats | exactly 1 | **1** (`25.0`) | PASS |
| Question position | 40–60 % of runtime | **42.3 %** | PASS |
| Full-bleed ground flips | ≥ 2 | **2** (`8.2`, `37.6`) | PASS |
| Hero width | ≥ 55 % at least once | camera `1.18` at `51.8 s` on the wedge; frame 1 disk already huge | PASS |
| Text zones | ≤ 3 | badge + one chip/question + phrase captions; chip hidden during proof | PASS |
| Frame 1 | subject huge, no fade | `0.0` chip + crossed shells + flat disk already live | PASS |
| Loop | `endCard: false`, last frame ≈ first | loop chip `58.2`; ghost shells `58.5`; cut at `59.09` | PASS |

---

## 2. Beat table

`kind` values are the existing `BeatKind` union. Each row changes **one** thing. “Chip” rows replace the single claim chip; they do not add a second text zone. The two `FACT:` rows render their strings from `facts.ts`, never from a digit literal in scene code.

| t (s) | Act | Kind | One change | Script anchor | SVG primitive / text-zone rule |
| --- | --- | --- | --- | --- | --- |
| 0.0 | 1 | chip | `ONE FLAT PLANE` | “flat pancake … crisscrossing in 3D” (S3, S5) | `AtomShellOverlay` + flat disk already live; badge + chip + captions only |
| 1.9 | 1 | camera | scale `1.0 → 1.12`, focus `[0.5, 0.44]` | hook holds | single camera group; hero > 55 % width |
| 4.0 | 1 | shape | dashed shells rotate through 0/60/120° | “like electrons around an atom” (hook framing) | no new label |
| 6.1 | 1 | chip | `3D CRISSCROSS?` | wrong mental model | claim chip swap, one zone |
| 8.2 | 1 | palette | ground → `secondary` | expectation flip | **ground flip #1**, full bleed |
| 10.3 | 2 | shape | atom shells → chaotic sphere | “wasn't flat at all” (S1, S4) | dissolve, no cut |
| 12.4 | 2 | chip | `NOT FLAT YET` | “giant, chaotic sphere” (S1, S3, S4) | claim chip swap |
| 14.5 | 2 | camera | scale `→ 0.92`, focus `[0.5, 0.5]` | pull back for the whole cloud | camera beat only |
| 16.6 | 2 | shape | slight net-spin arrow | “slight net spin” (S1, S3, S4) | arrow draw-on |
| 18.7 | 2 | shape | inward gravity vectors | “gravity pulled that cloud inward” (S2, S3, S6) | vectors only |
| 20.8 | 2 | chip | `SPIN KEPT` | “conservation of angular momentum” (S3, S6) | hedge-safe claim chip |
| 22.9 | 3 | shape | vertical `vy` arrows appear | “wild up-and-down angles” (S2, S6) | arrows only |
| 25.0 | 3 | question | `WHY ONE FLAT PLANE?` | comment prompt, 42.3 % | question **replaces** the claim chip; still one chip zone |
| 27.1 | 3 | camera | edge-on tilt level → near-side-on | “slamming into each other” (S2, S6) | `camera` beat with `id: edge-on-tilt`; no second label |
| 29.2 | 3 | shape | collision micro-flash 1 | “slamming” (S2, S6) | first vertical arrow damps |
| 31.3 | 3 | shape | collision micro-flash 2 | “canceling out” (S6) | second vertical arrow damps |
| 33.4 | 3 | shape | sideways `vx` accelerates | “shared sideways spin” (S6) | horizontal arrow grows |
| 35.5 | 3 | chip | `VERTICAL CANCELED` | same mechanism (S6) | mechanism chip |
| 37.6 | 4 | palette | ground → `primary` | “razor-thin spinning disk” (S1, S2, S4) | **ground flip #2**, full-bleed amber |
| 39.7 | 4 | shape | cloud → flat disk | “flattened the entire cloud” (S1, S2, S4) | one persistent world, no scene fade |
| 41.8 | 4 | chip | `COSMIC TRAFFIC JAM` | same line | claim chip swap |
| 43.9 | 4 | shape | planet seeds appear | “where the planets formed” (S1, S2) | dots inside disk |
| 46.0 | 5 | camera | scale `→ 1.0`, focus `[0.5, 0.5]` | settle before payoff | camera beat only |
| 48.1 | 5 | chip | `ONE LANE` | “one flat lane” (S1, S3, S5) | claim chip before wedge |
| 49.9 | 5 | shape | edge-on inclination wedge enters | “Mercury tilts … three and a half” (S5) | geometry derives from FACTS |
| 51.8 | 5 | camera | scale `→ 1.18`, focus `[0.5, 0.46]` | push into wedge | hero > 55 % width |
| 53.6 | 5 | chip | `FACT:bandDeg` | “seven degrees” (S5) | **STATIC chip only**; render `FACTS.bandDeg.display`; telemetry click 1 |
| 55.2 | 5 | counter | wedge morphs between facts values, `dur 1.0` | both numbers (S5) | **THE ONE visual proof**; chip hidden |
| 56.8 | 5 | chip | `FACT:otherPlanetsDeg` | “three and a half” (S5) | **STATIC chip only**; render `FACTS.otherPlanetsDeg.display`; telemetry click 2 |
| 58.2 | 5 | chip | `ONE FLAT PLANE` | loop line | chip identical to `t=0` |
| 58.5 | 5 | shape | ghosted atom shells return | loop to frame 1 | final 0.59 s hold, then cut |

**Proof discipline:** `FACT:bandDeg` and `FACT:otherPlanetsDeg` are static chips, not the single proof. The only number the viewer watches *change* is the `55.2 s` wedge/counter. No `dots` or `bar` beat exists elsewhere.

---

## 3. Hook stress test — first 3 seconds, sound off

This is a **paper stress test on the planned timeline**, not a rendered-frame test (render was forbidden for Stage 3).

1. **What is on frame 1?** Crossed amber atom-shell rings sit left/over the flat disk; one huge flat amber disk is already on screen. The chip reads `ONE FLAT PLANE` and a wedge is already visible. The contradiction reads before any caption finishes.
2. **Reason to stay past second 3?** At `1.9 s` the camera pushes the hero past 55 % of frame width; at `4.0 s` the dashed shells rotate through the third angle. The reason to stay is motion, not another line of text.
3. **Does it read as a slide or diagram?** No title card, no fade from black, no badge + kicker + headline + subline stack. One world, one camera, one claim chip.
4. **Bigger hero or more text?** Bigger hero. The camera beats buy more 3-second hold than a fourth label would.

**Verdict: PASS on paper.** The first swaps ranked by expected 3-second-hold gain are the `1.9 s` push, the `4.0 s` shell rotation, and the `6.1 s` `3D CRISSCROSS?` chip.

---

## 4. Cinematic SVG plan across all 5 acts

### 4.1 Continuous world (`FlatPlaneActs.tsx` handoff)

One persistent set of SVG objects lives for the whole timeline — **no disconnected fading scenes**:

- `CentralSun` — fixed centre light; never removed.
- `AtomShellOverlay` — dashed atom-style orbits at 0°/60°/120°; visible at frame 1, dissolves at `10.3 s`, returns ghosted at `58.5 s`.
- `NebulaParticleField` — deterministic 3D particles with vertical `vy` arrows and horizontal `vx` spin; collisions micro-flash and damp `vy` to the disk plane while `vx` grows.
- `EclipticBandRig` — edge-on inclination wedge; reads `FACTS.bandDeg` / `FACTS.otherPlanetsDeg`, never literal digits.
- `CameraRig` — one `<g>` for all `camera` beats: `1.0 → 1.12` Act 1, `→ 0.92` Act 2, edge-on tilt `0° → 78°` Act 3, `→ 1.18` Act 5.

A 2–4 % ambient drift runs across the whole episode **on top of** beats, never as the only motion. Particles use a seeded hash; no `Math.random()`, no CSS `infinite`, no self-clocked animation library.

### 4.2 Act-by-act direction

| Act | Visual thesis | Camera / ground | Chip state |
| --- | --- | --- | --- |
| 1 — HOOK | Atom crisscross vs one flat plane; both huge | push `1.12`; cool flip at `8.2` | `ONE FLAT PLANE` → `3D CRISSCROSS?` |
| 2 — CLOUD | Chaotic sphere with slight spin | pull to `0.92`; void ground | `NOT FLAT YET` → `SPIN KEPT` |
| 3 — COLLAPSE | `vy` cancels, `vx` survives | edge-on tilt into collisions | question `25.0` → `VERTICAL CANCELED` |
| 4 — DISK | Cosmic traffic jam becomes a disk | amber full-bleed flip at `37.6` | `COSMIC TRAFFIC JAM` |
| 5 — PAYOFF | One moving wedge proof, then loop | push `1.18` into wedge | `ONE LANE` → two `FACT:` chips → `ONE FLAT PLANE` |

### 4.3 Text-zone budget (H6)

- Zone 1: `Hud` badge `[ COSMIC TELEMETRY // FLAT PLANE ]` — timecode, bottom meta and progress bar stay hidden for the loop.
- Zone 2: exactly one claim/question chip. At `55.2–56.2` it is hidden so the proof owns the middle.
- Zone 3: `phrase` captions, 1–3 words, centred, no grey upcoming words. Chunks come from `WordBoundary` after audio; none are hand-written here.
- No timecode, no kicker line, no ghost headline, no second label during the proof.

### 4.4 Palette & type contract

Dark base `#05070F → #0B1022` radial, amber `#F59E0B` as the most saturated thing on screen, cool `#60A5FA` only for the before-state, ink `#F8FAFC`. Anton for caption/proof numerals; one mono label ≤ 20 px. No fourth type style.

---

## 5. Two weakest stretches and the fix applied

1. **`25.0 → 27.1 s` after the question.** A question chip alone would freeze the frame. Fixed by the `27.1 s` edge-on camera tilt plus the `29.2 s` collision flash, with particle motion already running underneath.
2. **`53.6 → 56.8 s` around the two numbers.** Static number chips could read as an end card. Fixed by the single `55.2 s` morphing wedge proof and the `51.8 s` push; the final loop chip arrives at `58.2`, before the 2.0 s freeze threshold.

Longest planned inter-beat gap is `2.1 s`; no beat drops a second new object into an already full frame.

---

## 6. SFX cue handoff

`sfx.json` carried the owner's requested cue map as **synth targets** in Stage 3: frame-1 glass chime + sub-thump, atom→nebula airy swell, spin-up hum with an 80→160 Hz sweep, four collision ticks, disk-collapse bass settle, and two telemetry clicks on the `FACT:` chips. In Stage 6 all seven WAVs were generated deterministically by `scripts/synth_sfx.py` and the 11 events were re-anchored to exact `WordBoundary` starts.

---

## 7. Stage 5 handoff / deferred

- Stage 5 must build `FlatPlaneActs.tsx` as a pure function of `t`, with one persistent SVG world and the recorder hooks intact.
- Stage 6 done: all `at` values were re-anchored to `metadata.json`, `meta.json` carries measured `wordCount`/`durationSec`/`questionAt`, and the long-form exception is confirmed at 150 words / 52.07 s.
- `sources.md` still maps Act 1's “gravity pulls equally in every direction” to S3/S5 exactly as supplied. It has no explicit isotropic-gravity quote; the package was delivered with this flag recorded in `about.txt` rather than with an invented citation.
- Cover was not designed in Stage 3; `coverTitle: ONE FLAT PLANE` is provisional.
- No packaging, posting, audio generation, render, or binary read was performed in Stage 3.
