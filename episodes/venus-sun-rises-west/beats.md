# Stage 3 output — beat plan, hook stress test, cinematic SVG plan

**Episode:** `venus-sun-rises-west` · **series:** `cosmic` · **accent:** `#F59E0B` · **endCard:** `false`
**Source of truth for the machine-readable timeline:** `episodes/venus-sun-rises-west/scene.json`.
The locked script in `script.txt` was not changed. No audio was generated, no MP4 was rendered, and no binary file was read for this stage.

---

## 0. Timing basis (provisional — not WordBoundary)

The owner replaced the 69-word Short with a **188-word, 6-act explanation**. There is no new manifest yet, so the `at` values below are a **storyboard plan**, not measured word timings.

- Extrapolation: old `69` tokens → `27.02 s` voice at `en-US-AriaNeural / +12%`; `188 / 69 × 27.02 = 73.66 s` + `0.35 s` tail ≈ **74.0 s planned total**.
- Act boundaries are token-weighted from the dry-run counts `[23, 31, 27, 51, 25, 31]`:

| Act | Script content | Planned window (s) | Tokens |
| --- | --- | --- | --- |
| 1 | THE HOOK | 0.00–9.05 | 23 |
| 2 | THE ASSUMPTION | 9.05–21.26 | 31 |
| 3 | THE FLIP | 21.26–31.88 | 27 |
| 4 | TWO FORCES | 31.88–51.96 | 51 |
| 5 | THE PAYOFF | 51.96–61.79 | 25 |
| 6 | THE VIEW | 61.79–74.00 | 31 |

**Handoff rule for Stage 5/2:** after `generate_audio.py` produces the real `metadata.json`, every `at` must be re-anchored to a `WordBoundary` word or `actBreakdown[]` start. Never hand-edit word timings; the table above is only the edit decision list.

---

## 1. Gate 3 result

`INSTRUCTIONS.md` §5 H1 says “≥ 12 beats in ≤ 32 s”. The **≤ 32 s** clause belongs to the old 20–35 s Short. The owner's new decision is 1–2 minutes, so the operative constraint is the **gap ≤ 2.5 s**. That is applied here, not the old absolute runtime.

| Check | Target | Plan | Result |
| --- | --- | --- | --- |
| Beat count | ≥ 12 | **37** | PASS |
| Max gap between beats | ≤ 2.5 s | **2.3 s** (`69.9 → 72.2`) | PASS |
| Final static hold | ≤ 2.0 s target | **1.8 s** (`72.2 → 74.0`) | PASS |
| `counter` / `dots` / `bar` proof beats | exactly 1 | **1** (`55.9`, `counter`) | PASS |
| `question` beats | exactly 1 | **1** (`39.9`) | PASS |
| Question position | 40–60 % of runtime | **53.9 %** | PASS |
| Full-bleed ground flips | ≥ 2 | **3** (`21.9`, `33.9`, `63.9`) | PASS |
| Hero width | ≥ 55 % at least once | camera `1.6` at `1.9 s` → Venus ≈ 89 % of frame width | PASS |
| Text zones | ≤ 3 | badge + one chip/question + phrase captions; chip hidden `55.9–59.9` while proof owns the middle | PASS |
| Frame 1 | subject huge, no fade | `0.0` chip + Venus + west Sun + CW arrow already drawing | PASS |
| Loop | `endCard: false`, last frame ≈ first | last chip `SUN RISES WEST` at `72.2`, camera reset at `69.9`, horizon final state at `65.9` | PASS |

`meta.json` still carries the **old** `durationSec: 27.374` / `wordCount: 69`; those are stale until Stage 2 audio regenerates them. Do not use `meta.json` for this stage's gate.

---

## 2. Beat table

`kind` values are the existing `BeatKind` union. Each row changes **one** thing. “Chip” rows replace the single claim chip; they do not add a second text zone. The two `STATIC chip only` rows render their strings from `facts.ts`, never from a digit literal in scene code.

| t (s) | Act | Kind | One change | Script anchor | SVG primitive / text-zone rule |
| --- | --- | --- | --- | --- | --- |
| 0.0 | 1 | chip | `SUN RISES WEST` | “Sun rises in the west” (S1, S4) | `WestHorizonSun` + `VenusGlobe` + CW arrow draw-on already live; badge + this chip + captions only |
| 1.9 | 1 | camera | scale `1.0 → 1.6`, focus `[0.5, 0.46]` | hook holds | single camera group; hero > 55 % width |
| 3.9 | 1 | shape | `sun-west-arc` completes | “rises in the west” (S1) | Sun arc stroke draw-on; no new label |
| 5.9 | 1 | chip | `SPIN OUTLASTS YEAR` | “a single day lasts longer than an entire year” (S1, S3) | claim chip swap, no numeral |
| 7.9 | 1 | camera | scale `1.6 → 1.15` | handoff to Act 2 | pull back to make room for lanes |
| 9.9 | 2 | chip | `ORBIT SAME WAY` | “It travels around the Sun in the exact same direction as Earth” (S1, S4, S6) | claim chip swap |
| 11.9 | 2 | shape | `earth-orbit-lane` | Earth reference (S4) | cool `#60A5FA` lane draws in |
| 13.9 | 2 | shape | `venus-orbit-lane` | “It doesn't [orbit backward]” (S4) | amber lane draws in on same side/direction |
| 15.9 | 2 | shape | `matching-orbit-arrows` | same-direction claim (S1, S4) | both arrows draw CCW together |
| 17.9 | 2 | shape | `spin-direction-pair` | “What's backward is its spin” (S1, S4) | Earth CCW vs Venus CW spin arrows; shape only |
| 19.9 | 2 | chip | `SPIN BACKWARD` | same line (S1, S4) | claim chip lands; no extra label |
| 21.9 | 3 | palette | ground → `secondary` (`#60A5FA`) | “flipped nearly upside down” (S3, S4) | **ground flip #1**, full bleed |
| 23.9 | 3 | chip | `UPRIGHT TOP` | “almost every other planet spins counter-clockwise like an upright top” (S4) | claim chip; no Uranus number shown |
| 25.9 | 3 | shape | `axis-upright` | upright reference (S4) | dashed axis through Venus |
| 27.9 | 3 | camera | scale `1.15 → 1.45`, focus `[0.5, 0.42]` | tilt reveal | push into the axis; motion, not a slide |
| 29.9 | 3 | shape | `axis-flip` | “177-degree tilt” (S3 `177.36`, S4 `177.3`) | axis rotates to retrograde convention; no number here |
| 31.9 | 3 | chip | `177.36° TILT` | same claim (S3) | **STATIC chip only**: render `FACTS.obliquityDeg.display`; not the proof |
| 33.9 | 4 | palette | ground → `primary` (`#F59E0B`) | “two forces pulled off this cosmic flip” (S4, S5) | **ground flip #2**, full bleed amber |
| 35.9 | 4 | shape | `impactor-approach` | “a massive protoplanet likely slammed into young Venus off-center” (S4) | off-center dot enters; hedge stays in chip/narration |
| 37.9 | 4 | shape | `off-center-hit` | “knocking its spin off balance” (S4) | impact vector + recoil |
| 39.9 | 4 | question | `EAST OR WEST, WHICH SUNRISE?` | comment prompt, 53.9 % | question **replaces** the claim chip; still one chip zone |
| 41.9 | 4 | chip | `LIKELY IMPACT` | “Scientists think … likely” (S4, S5) | hedge returns as claim chip after the question |
| 43.9 | 4 | shape | `atmosphere-shell` | “Venus's thick, crushing atmosphere” (S1, S3) | CO₂ shell wraps globe; pressure shown as geometry, not a second number |
| 45.9 | 4 | shape | `tidal-vectors` | “the Sun's gravity tugged …” (S5) | Sun-gravity arrows pull on shell |
| 47.9 | 4 | chip | `TIDAL BRAKE` | “acting like a slow-motion brake” (S5) | mechanism chip, no numeral |
| 49.9 | 4 | shape | `brake-spin-slow` | “eventually reversed its rotation” (S5) | CW arrow speed decreases as pure function of `t` |
| 51.9 | 4 | shape | `spin-reversed` | same line (S5) | arrow settles CW; no cut into Act 5 |
| 53.9 | 5 | chip | `SPIN VS YEAR` | “one full spin … while a full trip around the Sun” (S1, S3) | claim chip; about to hide for proof |
| 55.9 | 5 | counter | `spinDays` vs `orbitDays`, `dur 1.8` | “243 Earth days … just 225” (S1, S3) | **THE ONE visual proof**; paired bar/count from `facts.ts`; chip hidden |
| 57.9 | 5 | shape | `proof-crosshair` | crossing point | pins the moment the spin bar passes the year bar; still one proof |
| 59.9 | 5 | chip | `SPIN BEATS YEAR` | verdict (S1, S3) | claim chip returns after proof panel exits |
| 61.9 | 5 | camera | scale `1.25`, focus `[0.5, 0.45]` | handoff to Act 6 | push into crossing, then camera returns |
| 63.9 | 6 | palette | ground → `ground` (`#05070F`) | “Meaning if you stood on Venus…” (S1) | **ground flip #3**, return to void |
| 65.9 | 6 | shape | `west-horizon-return` | “watch the Sun rise in the west” (S1) | Act 1 horizon + Sun reappear at final loop state |
| 67.9 | 6 | chip | `~58 DAYS / SUNSET` | “wait nearly two months just for sunset” (S3: `116.75 / 2`) | **STATIC chip only**: render `FACTS.sunsetApproxDays.display`; not a counted proof |
| 69.9 | 6 | camera | scale `1.0`, focus `[0.5, 0.5]` | loop line | camera geometry locked to frame 1 |
| 72.2 | 6 | chip | `SUN RISES WEST` | “one full spin outlasts its entire year” (S1, S3) | chip identical to `t=0`; last 1.8 s holds, then cuts to frame 1 |

**Proof discipline:** `177.36° TILT` and `~58 DAYS / SUNSET` are static chips, not the single proof. The only number the viewer watches *change* is the `55.9 s` paired race. No `dots` or `bar` beat exists elsewhere.

---

## 3. Hook stress test — first 3 seconds, sound off

This is a **paper stress test on the planned timeline**, not a rendered-frame test (render was forbidden for Stage 3).

1. **What is on frame 1?** A huge Venus globe already fills the frame; the Sun is breaking the **left/west** horizon; a clockwise arrow is drawing on; the chip reads `SUN RISES WEST`. The contradiction is visible before any caption finishes.
2. **Reason to stay past second 3?** At `1.9 s` the camera pushes the hero to ~89 % of frame width and the wrong-way arrow keeps turning; at `3.9 s` the Sun completes the west-rise arc. The reason to stay is motion, not another line of text.
3. **Does it read as a slide or diagram?** No title card, no fade from black, no badge + kicker + headline + subline stack. One world, one camera, one claim chip.
4. **Bigger hero or more text?** Bigger hero. The `1.9 s` camera beat buys more 3-second hold than a fourth label would.

**Verdict: PASS on paper.** The three swaps ranked by expected 3-second-hold gain are already in the plan:

1. CW arrow stroke draw-on beginning at `t=0` — beat `0.0`/`1.9`.
2. Sun arc completing by `3.9 s` — beat `3.9`.
3. Hero camera `1.6` by `1.9 s` — beat `1.9`.

---

## 4. Cinematic SVG plan across all 6 acts

### 4.1 Continuous world (replaces three fading act groups)

One persistent set of SVG objects lives for the whole timeline:

- `VenusGlobe` — textured disc with seeded cloud bands, axis rig, CW arrow; never removed.
- `WestHorizonSun` — amber Sun + horizon line + rise arc; leaves Act 1, returns at `65.9` as the loop anchor.
- `OrbitLane` / `SpinArrow` — cool Earth reference and amber Venus, drawn as shapes, not labels.
- `AxisRig` — upright dashed line rotates into the retrograde line at `29.9`.
- `ImpactVector`, `AtmosphereShell`, `TidalArrow` — the two-force mechanism, all hedged by chips.
- `ProofRace` — the sole counter/bar panel at `55.9`.

One camera `<g>` applies the `camera` beats with `easeInOutCubic` (0.5–0.9 s). A 2–4 % ambient drift runs across the whole episode **on top of** beats, never as the only motion. Star field uses the existing seeded hash; no `Math.random()`, no CSS `infinite`, no self-clocked animation library.

### 4.2 Act-by-act direction

| Act | Visual thesis | Camera / ground | Chip state |
| --- | --- | --- | --- |
| 1 — HOOK | Wrong sunrise as a picture; Venus huge | push `1.6`, then pull `1.15`; void ground | `SUN RISES WEST` → `SPIN OUTLASTS YEAR` |
| 2 — ASSUMPTION | Same orbit, opposite spin | steady medium; cool full-bleed flip at `21.9` | `ORBIT SAME WAY` → `SPIN BACKWARD` |
| 3 — FLIP | Upright top → nearly upside-down axis | push `1.45` into the axis | `UPRIGHT TOP` → `177.36° TILT` (static from `FACTS`) |
| 4 — TWO FORCES | Off-center hit, then atmospheric brake | amber full-bleed flip at `33.9`; brake arrow slows | question at `39.9` → `LIKELY IMPACT` → `TIDAL BRAKE` |
| 5 — PAYOFF | One moving number: spin race beats year race | push `1.25` into crossing; chip hidden during proof | `SPIN VS YEAR` → hidden → `SPIN BEATS YEAR` |
| 6 — VIEW | Return to the Act 1 west horizon | void ground at `63.9`; camera `1.0` at `69.9` | `~58 DAYS / SUNSET` → `SUN RISES WEST` |

### 4.3 Text-zone budget (H6)

- Zone 1: `Hud` badge `[ COSMIC TELEMETRY // VENUS ]` — timecode, bottom meta and progress bar stay hidden for the loop.
- Zone 2: exactly one claim/question chip. At `55.9–59.9` it is hidden so the proof panel owns the middle.
- Zone 3: `phrase` captions, 1–3 words, centred, no grey upcoming words. Chunks come from `WordBoundary` after audio; none are hand-written here.
- No timecode, no kicker line, no ghost headline, no second label during the proof.

### 4.4 Palette & type contract (Stage 4 already locked in `scene.json`)

Dark base `#05070F → #0B1022` radial, amber `#F59E0B` as the most saturated thing on screen, cool `#60A5FA` only for the Earth/"before" reference, ink `#F8FAFC`. Anton for caption/proof numerals; one mono label ≤ 20 px. No fourth type style.

---

## 5. Two weakest stretches and the fix applied

1. **`39.9 → 43.9 s` after the question.** A question chip alone would freeze the frame. Fixed by the `41.9 s` `LIKELY IMPACT` chip swap plus the `43.9 s` atmosphere-shell shape, with the brake arrow already moving continuously underneath.
2. **`67.9 → 72.2 s` on the `~58 DAYS / SUNSET` chip.** A static number chip could read as an end card. Fixed by the `69.9 s` camera lock and `72.2 s` chip swap back to `SUN RISES WEST`; the final 1.8 s hold is below the 2.0 s freeze target and the last frame equals frame 1.

Longest planned inter-beat gap is `2.3 s`; no beat drops a second new object into an already full frame.

---

## 6. Stage 5 handoff / deferred

- The current `src/components/VenusSunRisesWestActs.tsx` is still the **old 27.374 s** scene. It will not match these beats. Do not preview or render it as if it were the new episode; Stage 5 rewrites it as a pure `t` function.
- After audio generation: re-anchor all `at` values to `metadata.json`, update `meta.json` `durationSec`/`wordCount`/`questionAt`, and confirm the 1–2 min duration override in `verify`/QA (current 60 s warning and 20–35 s verify gate will otherwise fail).
- `sfx.json` still holds the old 27 s four-event map; Stage 6 rebuilds it for the 74 s timeline.
- `coverTitle: DAY BEATS YEAR 243` remains the Stage 4 string; Stage 4 may revisit `SPIN` wording, but no cover work was done here.
- No packaging, posting, audio generation, render, or binary read was performed in Stage 3.
