# EPISODE BRIEF — "Everest dropped into Challenger Deep"

slug: `everest-challenger-deep` · hook style: "which one wins?" comparison (`hookStyle: question`) · angle: Nepal angle, evergreen

Script locked, 66 words (tags excluded; hyphenated = 1 word). ~25–30 s (hard cap 35 s).

Canvas 1080×1920 @ 30 fps · series existing `cosmic` config (no new series) · `captions: karaoke-dim` (Anton, uppercase, outlined; active word amber) · `endCard: false` (see D1) · design rules from repo `VIDEO_PRODUCTION.md` + `AGENTS.md`.

> **Provenance note.** The project's series bible and the minecraft-edge brief are not fully visible; the design rules are taken from repo docs above. Section order is: conventions → facts → art direction → beat sheet → QA → open decisions → asset needs.

## 0. Conventions

**Anchors.** `{word, n}` = the n-th occurrence of that word in the *whole* voiceover, case-insensitive, punctuation stripped, hyphenated words = 1 token, `Everest's` is its own token. Anchor times come only from `metadata.json → words[]`. Never estimate them. See `docs/conventions.md` for the full rules.

**Beat-internal offsets** (`+0.4 s`) are choreography inside a beat. They are not audio timings.

**Act boundaries** come from `acts[]`: Act 2 starts at `{Everest, 3}`, Act 3 starts at `{the, 3}`.

**Occurrences used**

| Word | Occurrences in script |
|---|---|
| Everest | 1 "Everest," · 2 "Everest into" · 3 "Everest stands" |
| Challenger / Deep | 1 (Act 1) · 2 (Act 2) |
| the | 1 "the deepest" · 2 "the ocean?" · 3 "The gap" · 4 "The ocean wins" |
| about | 1 "stands about" · 2 "plunges about" · 3 "gap is about" · 4 "sit about" |
| two | 1 "two kilometres" (gap) · 2 "sit about two" |
| ocean | 1 "the ocean?" · 2 "The ocean wins" |
| wins | 1 "Which wins" · 2 "ocean wins" |
| twenty | 1 and 2 ("twenty twenty") |
| forty-nine, thirty-five, NOAA, tall, plunges, gap, kilometres, summit, underwater, So | single use unless noted |

## 1. FACTS (single source for every number on screen)

`episodes/everest-challenger-deep/facts.ts` carries the facts; scene code never contains a digit literal for a displayed number. Geometry derives from `value`.

Rules:

- Scene code never contains a digit literal for a displayed number. It renders `FACTS.x.display`.
- Geometry derives from `value`, never from typed pixels.
- The required footnote (§ 2.8) is built from FACTS.
- Source keys: `kp` = Kathmandu Post (Nepal–China joint announcement, 8 Dec 2020) · `noaa` = NOAA Ocean Service · `ed` = EarthDate · `math` = 10,935 − 8,848.86.
- Not on screen: 10,908 m survey value, "±6 m", the 1,000× pressure figure (all unsourced or secondary).
- Banned strings anywhere on screen: `rock height`, `true height`, `exact depth`, `exact`.

## 2. ART DIRECTION

### 2.1 Concept

One honest, to-scale cross-section. A single vertical scale (metres) is shared by both contenders, with the sea-level line as the datum. Everest stands on the datum on the left. The ocean "shaft" (the water column down to Challenger Deep's floor) sits on the right. The viewer first sees the contest, then the two measurements as equal-scale brackets, then the drop. Everest ends up inside the shaft with its summit still below the surface line.

Hook discipline: Act 1 states the experiment (arrow) but never shows the result. The result is shown only in Act 3.

Diagram note: vertical scale is true, horizontal is not. Everest's silhouette is stylised and the shaft is a cutaway of the water column, not a seabed profile. A small mono tag in the ruler header says `VERTICAL TO SCALE`.

### 2.2 Canvas and safe zones

Owner confirmed safe zones 2026-11-12 (`xMin 60, xMax 1020 → 940`, `yMin 170, yMax 1536`). Right ~140 px and bottom ~20% are reserved for platform UI.

| Zone | Rect (x, y, w, h) | Holds |
|---|---|---|
| Safe area | 60, 120 → 940, 1536 | everything that must be read |
| Z1 HUD | 60, 120, 880, 70 | cyan badge left, `TC mm:ss:ff` right (right edge x=940) |
| Z2 Diagram | 60, 200, 880, 870 | ruler, Everest, shaft, brackets, labels, stamps |
| Z3 Footnote | 60, 1090, 880, 170 | required footnote (5 lines) |
| Z4 Kicker | 60, 1290, 880, 36 | `01 // THE QUESTION` etc. |
| Z5 Captions | 60, 1340, 880, 190 | karaoke captions, max 2 lines |
| Reserved | y > 1536, x > 940 | decoration only (progress bar, grade) |

### 2.3 Coordinate system (derived, never typed)

```
SPAN_PX  = 800                               // diagram height inside Z2 (250 → 1050)
pxPerM   = SPAN_PX / (everestM + deepM)      // ≈ 0.040436 px/m  (1 km ≈ 40.4 px)
summitY0 = 250
seaY     = summitY0 + everestM * pxPerM      // ≈ 607.8
floorY   = seaY + deepM * pxPerM             // = 1050
dropDY   = deepM * pxPerM                    // ≈ 442.2
landedSummitY = floorY - everestM * pxPerM   // ≈ 692.2  (= seaY + gapM*pxPerM)
gapPx    = gapM * pxPerM                     // ≈ 84.4
```

Columns:

| Element | x |
|---|---|
| Ruler | 60–100 |
| Everest bracket | x = 122 |
| Everest silhouette | centre 300, base 300 px wide (x 150–450) |
| Trench bracket | x = 470, from `seaY` to `floorY` |
| Shaft walls | left 490–520, right 900–930 |
| Shaft interior | x 520–900 (380 wide, centre 710) |
| Pressure bar | x 905–925, on the right wall, `seaY`→`floorY` |

Free areas used for labels:

- Empty water left of the shaft (x 100–440, below `seaY`) holds the trench label and the gap label.
- Empty sky right of Everest (x 480–900, above `seaY`) holds the Everest label and stamps.

Drop vector: `dx = 710 − 300 = +410 px`, `dy = +dropDY ≈ +442 px`. Everest's base (300 wide) fits the shaft interior (380 wide) with ~40 px clearance per side.

### 2.4 Palette

Sky / bg `#030712` · Water `#0A3A5A` @ 55% at the surface → `#04101C` @ 90% at the floor · Ink `#F8FAFC` · Ink-dim `#F8FAFC` @ 55% · Accent amber (capactive-word colour) · HUD badge cyan. **One accent per video.**

### 2.5 Type

**Anton**: captions (uppercase, outlined) and big values (52–56 px). **ui-monospace**: HUD, kicker, tags, sub-labels (20–24 px), footnote (26 px / 34 px line-height). Stamp style: existing stamp overlay.

### 2.6 Layers (z-order, bottom → top)

0 sky + seeded starfield (sky region only) · 1 water gradient + marine-snow drift (water region) · 2 shaft walls, floor slab, pressure bar · 3 sea-level line + label · 4 ghost Everest · 5 Everest (moves) · 6 gap band · 7 brackets, leaders, arrow · 8 labels, tags, chips, stamps · 9 footnote · 10 HUD, kicker, captions · 11 grade (vignette, seeded grain, white flash at act cuts).

### 2.7 HUD

Badge `[ COSMIC TELEMETRY // EVEREST VS DEEP ]`. Kicker: `01 // THE QUESTION` · `02 // THE NUMBERS` · `03 // THE VERDICT`. Progress bar + timecode as in other episodes.

### 2.8 Captions and footnote

- Captions: existing component. Long-word check for `FORTY-NINE`, `THIRTY-FIVE`, `KILOMETRES`, `UNDERWATER`.
- Footnote (required, verbatim, built from FACTS), rendered at 26 px mono ink at 75%, fades in at `{Challenger, 2}` and stays to the end.

### 2.9 Motion

Entrance 0.35 s `easeOutCubic`, 24 px slide + fade. Stagger 80 ms. Drop (hero motion, total 0.95 s): x-slide 0.4 s `easeInOutCubic` with a 24 px arc lift, then fall 0.55 s `easeInOutCubic` starting at +0.4 s so the base never crosses the wall tops. Pulse 0.35 s, scale 1 → 1.08 → 1. Ambient only: whole-diagram scale 1.00 → 1.03 across the video + slow starfield + marine-snow drift. All motion is a pure function of `t` through `anim()`; ripples and particles use seeded factories. No motion longer than 1 s (other than ambient drift).

### 2.10 Do not

No logo intro. No raster assets. No 3D. No second accent. No pressure number. No Nepal flag drawn from memory. No camera zoom. No `Math.random()` outside seeded factories.

## 3. BEAT SHEET

| ID | Anchor | On screen | Motion | Purpose · FACTS |
|---|---|---|---|---|
| 1.0 | t = 0 / `{Which,1}` | Full diagram already visible, unlabelled | none (ambient) | First frame shows both contenders. No intro. `seaLevelM`, `rulerStepKm` |
| 1.1 | `{wins,1}` | `VS` chip on the sea-level line between the columns | entrance 0.35 s | Frames the contest. |
| 1.2 | `{Everest,1}` | Left tag `EVEREST` | entrance 0.35 s | Names contender 1 |
| 1.3 | `{deepest,1}` | Right tag `DEEPEST HOLE IN THE OCEAN` | entrance 0.35 s | Names contender 2 unannotated |
| 1.4 | `{ocean,1}` | Water gradient sweeps down revealing floor | 0.5 s sweep | Ties word to image, shows shaft extent |
| 1.5 | `{Drop,1}` | Amber dashed arc arrow from Everest's summit over the surface to the shaft top | draw-on 0.5 s | States the experiment. No result shown |
| 1.6 | `{Everest,2}` | Everest lifts 16 px and settles | 0.35 s | Anticipation |
| 1.7 | `{Challenger,1}` | Right tag cross-fades to `CHALLENGER DEEP` | 0.35 s | Names the real contender |
| 2.0 | `{Everest,3}` | Act-cut white flash. Kicker → `02 // THE NUMBERS`. Arrow fades. Everest bracket grows seaY→summit | flash + bracket 0.5 s | Switches to measurement |
| 2.1 | `{tall,1}` | Summit marker pings at the peak | pulse 0.35 s | The endpoint of the measurement |
| 2.2 | `{forty-nine,1}` | Label: `EVEREST` / `8,848.86 m` / `ABOVE SEA LEVEL` | entrance 0.35 s | The number lands. `everestM` [kp] |
| 2.3 | `{Nepal,1}` | Stamp token `NEPAL` | slam 0.35 s | Nepal angle |
| 2.4 | `{China,1}` | Token `· CHINA` joins the stamp | 0.35 s | Joint announcement |
| 2.5 | `{twenty,1}` | Token `2020` completes the stamp | 0.35 s | `announceYr` [kp] |
| 2.6 | `{Challenger,2}` | Everest dims to 55%. Stamp fades. Footnote fades in. Water label slot gets `CHALLENGER DEEP` | 0.4 s | Shift of focus. Gives footnote ≥ 12 s on screen |
| 2.7 | `{plunges,1}` | Trench bracket drops from `seaY` to `floorY` | 0.5 s easeOutCubic | Shows depth length on the same scale |
| 2.8 | `{about,2}` | Pressure bar fades in with tag `PRESSURE` | 0.5 s | Conveys hostile deep, no figure |
| 2.9 | `{thirty-five,1}` | Label: `CHALLENGER DEEP` / `~10,935 m` / `BELOW SEA LEVEL` | entrance 0.35 s | `deepM` [noaa] |
| 2.10 | `{NOAA,1}` | Chip `SRC: NOAA` under the trench label | entrance 0.35 s | |
| 3.0 | `{the,3}` | Act-cut flash. Kicker → `03 // THE VERDICT`. Everest back to 100%. Ghost stays. Solid Everest slides right + falls into shaft | drop 0.95 s | Performs the thought experiment out loud |
| 3.0b | drop + 0.75 s | Two seeded ripple rings at the surface at the shaft centre | 0.6 s | Sells the entry |
| 3.1 | `{two,1}` | Gap band fills from the line to the landed summit. Gap bracket on the shaft's left wall. Landing ping | band 0.35 s | Shows the gap. `gapM` |
| 3.2 | `{kilometres,1}` | `~2,086 m` / `≈ 2 km` with leader to band | entrance 0.35 s | Spoken "two kilometres" gets the exact-ish figure. `gapM`, `gapKm` [math] |
| 3.3 | `{So,1}` | Sea-level line thickens to 6 px, brightens to ink | 0.35 s | Surface is the judge |
| 3.4 | `{summit,1}` | `SUMMIT` tag and ping on the landed summit marker | pulse 0.35 s | Pins the object |
| 3.5 | `{underwater,1}` | Text `STILL UNDERWATER` inside the band | entrance 0.35 s | Says the verdict visually |
| 3.6 | `{two,2}` | Gap label pulses | pulse 0.35 s | |
| 3.7 | `{ocean,2}` | Stamp `OCEAN WINS` slams in, shaft gets amber edge glow | slam 0.35 s | Verdict |
| 3.8 | `{wins,2}` | Stamp border flashes once | 0.35 s | Lands the final word |
| 3.H | audio end + 1.0 s | Hold. No end card (D1). Static except ambient drift. | none | Clean ending so the Short loops |

## 4. Density and budget check

Beat-start counts: Act 1 has 8, Act 2 has 11, Act 3 has 10, → a change every 1–2 s. Estimated act windows: Act 1 ≈ 6 s, Act 2 ≈ 13.5 s, Act 3 ≈ 8 s. Longest quiet stretch between `{China,1}` and `{Challenger,2}`: ~3 s. Estimated build effort: 2–3 h.

## 5. QA gate (this episode, on top of the repo QA gate)

- [ ] `bunx tsc -b` passes.
- [ ] No digit literals for displayed numbers in the scene files. Every displayed number comes from `FACTS`. `display` strings match `value`.
- [ ] Banned strings absent (`rock height`, `true height`, `exact depth`, `exact`).
- [ ] Every anchor in § 3 resolves in `words[]`. The build fails if any anchor is missing or ambiguous.
- [ ] Geometry: `landedSummitY − seaY = gapPx ± 1 px`; Everest and trench bracket lengths are in the ratio `8,848.86 : 10,935`.
- [ ] Frames at: `{forty-nine,1}+0.5 s`, `{thirty-five,1}+0.5 s`, `{kilometres,1}+0.5 s`, end hold.
- [ ] Footnote: all numbers present, ≥ 12 s on screen, readable at phone size.
- [ ] Captions never clip `FORTY-NINE`, `THIRTY-FIVE`, `KILOMETRES`, `UNDERWATER`.
- [ ] Nothing legible sits below y = 1536 or right of x = 940 (safe x = 60 → 940).
- [ ] Duration 20–35 s. `bun run verify everest-challenger-deep` passes.
- [ ] `about.txt` sources cover `kp`, `noaa`, `ed`, `math`.

## 6. Open decisions and risks

**Decisions needed** — D1 End card (assumed `false`; see AGENTS.md Phase 5). D2 Safe zones (confirmed 2026-11-12). D3 Badge prefix `COSMIC TELEMETRY` (kept). D4 Pressure scale omitted. D5 precision — `8,848.86` on screen is fine even though narration rounds.

**Risks** — datum mismatch (footnote covers it) · competing depth figures (`~10,935 m` labelled approximate) · weak source for "2.1 km" (screen uses `~2,086 m` computed from the two published figures) · NOAA via snippet only — a human opens the page before publishing.

## 7. ASSET NEEDS

All drawn in code — no new `LICENSES.md` entries. `~` marks values derived from `pxPerM`.

| name | what it shows | size in px | props it takes | needed at which anchor |
|---|---|---|---|---|
| `SkyWaterBackdrop` | Sky above the line, water gradient below | 1080×1920 | `seaY`, `floorY`, `sweep`, `t` | t=0 / `{Which,1}`; sweep at `{ocean,1}` |
| `ParticleLayers` | Starfield + marine snow | 1080×1920 | `seed`, `region`, `t` | t=0 |
| `ScaleRuler` | Vertical ruler + 1 km tick + `VERTICAL TO SCALE` tag | 40×800 | `pxPerM`, `t` | t=0 |
| `SeaLevelLine` | Surface line + label | 880×6 | `y`, `emphasis`, `t` | t=0; emphasis `{So,1}` |
| `EverestSilhouette` | Stylised peak (also ghost layer) | 300×~358 | `x`, `y`, `lift`, `dim`, `ghost`, `t` | t=0; drop `{the,3}` |
| `TrenchShaft` | Cutaway water column + floor + walls | 440×~462 | `highlight`, `t` | t=0; highlight `{ocean,2}` |
| `VsChip` | `VS` circle | 96×96 | `popT` | `{wins,1}` |
| `NameTag` | Contender tag (text cross-fade) | 340×64 | `text`, `side`, `popT`, `swapT`, `fadeT` | `{Everest,1}`; `{deepest,1}`; swap `{Challenger,1}`; fade `{Everest,3}` |
| `DropArrow` | Amber dashed arc, Everest → shaft | 420×140 | `progress`, `fadeT` | `{Drop,1}`; fade `{Everest,3}` |
| `MeasureBracket` | Vertical bracket (Everest / trench / gap) | 24×len~358/442/84 | `lengthPx`, `dir`, `progress`, `emphasis` | `{Everest,3}`; `{plunges,1}`; `{two,1}` |
| `MeasureLabel` | Title/value/sub-label block | 300×110 | `title`, `factKey`, `leaderTo`, `popT`, `dim`, `pulseT` | `{forty-nine,1}`; `{thirty-five,1}`; `{kilometres,1}`; pulse `{two,2}` |
| `SummitMarker` | Amber tick + leader + ping | 140×60 | `x`, `y`, `pingT`, `tag` | `{tall,1}`; follows Everest; ping/tag `{summit,1}` |
| `StampOverlay` (reuse) | `NEPAL · CHINA · 2020` staged, `OCEAN WINS` | 380×100 | `tokens[]`, `popTimes[]`, `flashT`, `fadeT` | `{Nepal,1}`, `{China,1}`, `{twenty,1}`; `{Challenger,2}`; `{ocean,2}` flash `{wins,2}` |
| `SourceChip` | `SRC: NOAA` | 200×48 | `text`, `popT` | `{NOAA,1}` |
| `PressureBar` | Gradient strip + `PRESSURE` tag (no numbers) | 20×~442 + tag | `progress`, `t` | `{about,2}` |
| `GapBand` | Translucent amber slice between surface and landed summit | 380×~84 | `progress`, `textT` | `{two,1}`; text `{underwater,1}` |
| `Ripples` | Two seeded ripple rings on the surface line | 300×60 | `seed`, `startT` | drop + 0.75 s (anchor `{the,3}`) |
| `LandingPing` | Amber ring on the landed summit | 120×120 | `startT`, `x`, `y` | drop end (anchor `{the,3}` + 0.95 s) |
| `Footnote` | Required footnote, built from FACTS | 880×170 | `text`, `fadeT` | `{Challenger,2}` |
| `FACTS` + `geometry` helpers | Constant + derived px values | n/a | n/a | before t=0 |
