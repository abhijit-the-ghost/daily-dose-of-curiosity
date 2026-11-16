# EPISODE BRIEF — "The Touch Illusion (how we feel anything)"

slug: `touch-and-feel` · angle: **A+B merge** (comment-reply hook, mechanism chain) · hook style: question · series: existing `science` config (follow-up to `never-touch`)

Script locked, 71 words (tags excluded; hyphenated = 1 word). ~25–30 s (hard cap 35 s).

Canvas 1080×1920 @ 30 fps · `series: science` · `captions: karaoke-dim` (Anton, uppercase, outlined; active word cyan — follow-up "mater" series accent is cyan) · `endCard: true` (channel default for packaged episodes, owner choice 2026-11).

## 0. Conventions
Clock: preview = `<audio>.currentTime` + rAF; record (`?record=1`) = `window.__seek(t)`.
Anchors `{word, n}` = nth occurrence of that word in the voiceover (case-insensitive, punctuation stripped).
Act boundaries: act 2 = `{electron,1}`/start of mechanism block; act 3 = `{You,2}`/"never feel the table" — derived from `metadata.json → actBreakdown`.
See `docs/conventions.md`.

## 1. FACTS (single source for every number on screen)
`episodes/touch-and-feel/facts.ts`:
- `meissnerHz` — value 40, display `40–60 Hz`, src pmc
- `pacinianHz` — value 100, display `100–300 Hz`, src pmc
- `organs` — FOUR as prose words (not a digit claim on screen)
- "electron repulsion" and "Pauli exclusion principle" used in VO, not ranked on screen.
Banned on screen/VO: `exactly`, `direct contact`, `atoms touch`, `rules the finger`, `fingerprints`.
Atoms never touching atoms at room temperature — Baird (WTAMU) + Live Science + never-touch precedent.

## 2. ART DIRECTION
### 2.1 Concept
One physical story. Cross-section of one fingertip cross-section pressing a flat surface. The camera holds still; only the mechanism changes. No 3D, no raster.

Columns, left view:
- Skin cross-section filling the frame: epidermis top band (light), dermis deeper band (mid), hypodermis bottom (darkest, fatty dots). A stylized fingertip descends from the top edge toward the mid panel; a contact line ("the table") at the bottom of the finger.
- Electron clouds: faint paired circles around the contact point.
- Sensor layer: four end-organ symbols — Merkel (shallow), Meissner (upper dermis), Ruffini (horizontal bar), Pacinian (deep, laminated oval rings).
- Signal path: thin line from the dermis, down to a "NERVE IMPULSE" arrow; captioned as the same pulse the brain receives.

### 2.2 Safe zones (owner-confirmed 2026-11-12)
xMin 60 · xMax 940 (940 chosen interior; 1020 also ok) · yMin 170 · yMax 1536. Captions/HUD above y≈1536 fine.
None of the legible labels may sit below y=1536 or right of x=940.

### 2.3 Coordinate system (derived, never typed)
- `SECTION = { x: 80, y: 620, w: 920, h: 640 }` — skin cross-section block.
- `SURFACE_Y = SECTION.y` (the table line).
- `FINGER_Y = SECTION.y - 140` at rest; animates down to `SECTION.y - 40` at press.
- `DENT_X = 540` center; indent animates 0→46 px with `{Press,1}`.
- Layers drawn: epidermis (rect with wave), dermis (rect), hypodermis (rect + 8 seeded fat cells), four organ ICONS (seeded, pure function of t).
- Frequency tags: small mono chips "MEISSNER 40–60 Hz" · "PACINIAN 100–300 Hz" (after `{Meissner,1}`/`{Pacinian,1}`).

### 2.4 Palette
- Background `#030712` void + radial vignette, house style.
- Skin tones: epidermis `#E7BD8E`-desaturated (`#d6b089`), dermis `#a1622e`-desaturated (`#8a5a3b`), hypodermis `#4a2e1f`; organ accents cyan (`#22D3EE`) since science series; verdict stamp cyan with white knock-out.

### 2.5 Type
Anton (captions + big values) · ui-monospace (HUD/kicker/tags, 15–22 px) · uppercase.

### 2.6 Layers (z-order)
0 vignette/stars · 1 skin bands · 2 dermis depth ramp · 3 organ glyphs (seeded) · 4 electron cloud dots · 5 finger silhouette · 6 dent mask · 7 labels/chips · 8 verdict stamp · 9 HUD/kicker/captions · 10 vignette-end.

### 2.7 HUD
Badge `[ PHYSICS // THE FEEL ]` — cosmic/science series. Kicker `01 // THE QUESTION` → `02 // THE CHAIN` → `03 // THE VERDICT`.

### 2.8 Captions
Karaoke-dim (existing component + new preset `touchAndFeel`, cyan active) — house minimum 45 px, max 2 lines.

### 2.9 Motion
Entrances 0.35 s easeOutCubic, 24 px + fade. Stamp "sound of nothing" convention: stamp slams with scale 1.08→1. Ambient: slow starfield, seeded grain. No motion >1 s other than ambient. All motion pure functions of t.

### 2.10 Do-not
No logo intro. No 3D. No raster assets. No pressure numbers. No fingerprint-bump motion, no claims that fingerprints improve grip (forbidden in this episode). No Pauli/electrostatic ratio claims.

## 3. BEAT SHEET
| ID | Anchor | On screen | Motion | Facts |
|---|---|---|---|---|
| 1.0 | t=0 / `{Someone,1}` | Full scene pre-positioned, comment bubble indents from left | none (ambient) | |
| 1.1 | `{atoms,1}` | Big Q line fades in top: "IF ATOMS NEVER TOUCH, HOW DO YOU FEEL?" | fade+settle 0.35 | |
| 1.2 | `{atoms,2}` | Skin section scale scale-in (1.00→1.015 ambient) | | |
| 1.3 | `{Press,1}` | Finger descends, skin dents inward, Electron cloud paired dots push apart | press 0.55 s | electron repulsion (ls/wtamu) |
| 2.1 | `{electron,1}` | Arcs/bipolar glow around contact; tag "ELECTRON REPULSION" | glow pulse 0.35 | ls |
| 2.2 | `{mechanically,1}` | Channels glow — 4 organ icons light up (Merkel, Meissner, Ruffini, Pacinian) labeled | pop 0.35 staggered 80 ms | openstax, pmc |
| 2.3 | `{Merkel,1}` | 4-organ banner sweeps under the section | 0.4 snap | openstax/pmc |
| 2.4 | `{Meissner,1}` | Chip: `MEISSNER 40–60 Hz` | chip pop | pmc |
| 2.5 | `{Pacinian,1}` | Chip: `PACINIAN 100–300 Hz` | chip pop | pmc |
| 2.6 | `{never,1}`(?) — see file | Signal arrow runs from dermis to "NERVE IMPULSE" tag | trace 0.7 s | openstax |
| 3.0 | `{You,2}` | Big stamp: `YOU FEEL THE PUSH.` drifts in, sits ~8 px below dermis bottom | stamp 0.35 | |
| 3.1 | steady state | Finger still pressed; organ glows stay lit; end card fades in at end (owner default) | ambient only | |

## 4. Density and budget check
Beats: act 1 = 4, act 2 = 8, act 3 = 2 → every ~2 s a change. Act windows: act 1 ≈ 0.1–5 s, act 2 ≈ 5–17 s, act 3 ≈ 17–26 s. Estimated build: 2–3 h.

## 5. QA gate
- [ ] `bunx tsc -b` passes.
- [ ] No digit literals for displayed numbers in scene files; all from FACTS (`40–60 Hz`, `100–300 Hz`).
- [ ] Banned strings absent from script/VO text: `rock height`, `true height`, `exact depth`, `exact` (universal) + none of the banned mechanism claims.
- [ ] Every anchor resolves in `words[]`; verify passes.
- [ ] Long-word/clip check: `MECHANICALLY`, `"mechanoreceptor"`? — VO uses touch words only; karaoke chips show short.
- [ ] Duration 20–35 s, words 60–75, `bun run verify touch-and-feel` passes.
- [ ] Frames: shots at act starts + content beats; compare against never-touch conventions.
- [ ] `about.txt` covers source list; sources human-opened before posting.
- [ ] endCard: TRUE (house default).

## 6. Open decisions and risks
- D1 endCard TRUE (owner default for packaged episodes).
- D2 Safe zones as confirmed 2026-11-12.
- D3 Science series accent cyan, badge kept as `[ PHYSICS // SENSES ]`.
- RISK: "What exactly is felt at contact?" — answered only at level OpenStax supports: mechanical deformation → mechanically gated ion channels → neural signal. No deeper transduction details claimed. Baird/LS give atomic repulsion — never-touch precedent covers that too.
- RISK: frequency chips could be confused with "Pacinian = 100–300, Meissner = 40–60" — kept paired, labeled by name.

## 7. Asset needs
All drawn in code — no `LICENSES.md` entries needed.
- `Fingertip` (path, simple leather/dark tone) · `SkinSection` (bands, waves, seeded organ glyphs) · `ElectronCloud` (paired dots) · `WordsAnchor` plan · `SignalTrace` (stroke-dash animation) · `Stamp` (`YOU FEEL THE PUSH.`) · `FrequencyChip` × 2 · `OrganIcon` × 4 · `Facts` module.
