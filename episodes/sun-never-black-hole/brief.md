# EPISODE BRIEF — "Why our Sun will never become a black hole"

slug: `sun-never-black-hole` · angle: **not-massive-enough (mass bar, one morph)** · hook style: claim/contradiction · series: NEW `star-scale` (STELLAR SCIENCE, violet #A78BFA)

Script locked, ~105 words. 45 s (hard cap for this format).

Canvas 1080×1920 @ 30 fps · `series: star-scale` · `captions: karaoke-dim` · `endCard: true` (owner house default).
**Act labels hidden on screen** — the episode is one continuous morph, not chaptered;
4 acts exist only in `script.txt` for VO token split; HUD kicker `bottomClass: 'hidden'` suppresses act labels.

## 0. Conventions
Clock: preview = `<audio>.currentTime` + rAF; record (`?record=1`) = `window.__seek(t)` from Puppeteer.
Anchors `{word, n}` = nth occurrence of that word in the whole voiceover (case-insensitive, punctuation stripped).
Act boundaries derive from metadata.json actBreakdown. See `docs/conventions.md`.

## 1. FACTS (single source for every number on screen)
`episodes/sun-never-black-hole/facts.ts`:
- `sunAge` — value 4.6, display `4.6 billion years` [src: nasa]
- `sunRemaining` — value 5, display `5 billion years` [src: nasa]
- `sunMass` — value 1, display `1 solar mass` [src: nasa]
- `tovMin` — value 2.2, display `2.2 M☉` [src: kb]
- `tovMax` — value 2.9, display `2.9 M☉` [src: kb]
Banned on screen/VO: `exactly`, `exact`, `certainly`, `never won't`.
"Not even close" allowed only as a qualitative compare — no precise ratio on screen.

## 2. ART DIRECTION
### 2.1 Concept
One continuous Sun morph; HUD overlays only numbers (age/mass/TOV) at beats.
No camera movement — one focal point (the star) on the vertical power line; reading bottom-to-top
is disabled (9:16 vertical, English left-to-right captions). Background: full-frame starfield.

### 2.2 Safe zones (owner-confirmed 2026-11-12)
xMin 60 · xMax 1020 · yMin 170 · yMax 1536.

### 2.3 Coordinate system (derived, never typed)
- Sun disc hero: center (540, 300), radius expands/shrinks with `t`.
- TOV ladder: y≈630–860, two bars ("1 M☉" small; "2.2–2.9 M☉" big).
- Planetary nebula ring: radius up to 340 px at t≈17 s.
- White dwarf: radius ~18 px at t≈26 s onward; display label chip "WHITE DWARF".
Anchors drawn at the beat times listed in §3.

### 2.4 Palette & Type
Window violet `#A78BFA` → accent white `#F8FAFC`; mild alpha for glow fields;
the Sun drawn as a radial-gradient disc (yellow-white core → orange limb → magenta corona).

### 2.5 Layers (z-order)
0 void/nebula backdrop · 1 starfield · 2 Sun disc/morphing · 3 planetary nebula ring · 4 ladder/panels · 5 stamp · 6 crosshair-safe HUD (hidden kicker) · 7 captions

### 2.6 HUD
Badge `[ STELLAR SCIENCE ]` · kicker HIDDEN (kickerBottomClass 'hidden' in starScale preset).

### 2.7 Captions
Karaoke-dim — existing component; new preset `starScale` (violet active).

### 2.8 Motion
Acts enter 0.3–0.5 s ease-out; the Sun disc scale-pulses slowly (ambient 1.00→1.02);
panels slide in with 80 ms stagger; no motion >1 s except ambient drift.
Seeded factory for all stars — never Math.random().

### 2.9 Anchors (feed from metadata, not hard time)
tod 1.1 `{Sun, 1}` title reveal · `{black, 1}` mass bar start · `{collapse, 1}` ladder pops ·
`{Sun, 3}` red-giant growth start · `{white, 1}` dwarf ember drop-in · `{sun, 5}` stamp slam verify list will confirm

### 2.10 Do-not
No false precision ("the Sun will explode in 5,013 million years").
No Planet Nine reference — off-topic. No entropy aside. No camera zooms.
Acts do not exist visually for the viewer (HUD kicker HIDDEN).

## 3. BEAT SHEET
| ID | Anchor | On screen | Motion | Facts |
|---|---|---|---|---|
| 1.1 | t = 0 / `{Sun,1}` | Sun disc blazes center + HUD | t=0 ambient | |
| 1.2 | `{never,1}` | Title wipes in: "THE SUN WILL NEVER BE A BLACK HOLE" | wipe 0.45 | |
| 2.1 | `{hole,1}` | TOV ladder slides in from right | 0.5 snap | tovMin, tovMax |
| 2.2 | `{causes,1}` | mass compare: 1 vs 2.2, 2.9 bar | fill 0.6 stagger 80 ms | sunMass, tovMin/max |
| 3.1 | `{evolve,1}` | Sun balloons 30× into red-giant | 1.5 s morph | |
| 3.2 | `{giant,1}` | Mercury/Venus char-orange dots consumed | 0.4 fade | |
| 3.3 | `{layers,1}` | Planetary nebula ring drifts outward | 1.5 s drift | |
| 4.1 | `{tiny,1}` | White dwarf opal sphere drops in | 0.5 pop | |
| 4.2 | `{sun,end}` | Stamp: "A WHITE DWARF. NEVER A BLACK HOLE." | stamp 0.35 | |

## 4. Density and budget check
Beats act 1 = 2 · act 2 = 2 · act 3 = 3 · act 4 = 2 → one new beat every ~3 s.
Estimated act windows: act 1 ≈ 0.1–6 s · act 2 ≈ 6–19 s · act 3 ≈ 19–30 s · act 4 ≈ 30–44 s.
Script ~105 tokens (100–125 allowed for this format). Total 45 s — 20 s held end card = 6 s.
Verify: tails {min:20, max:45} and words {min:60, max:125} passed override for this slug.

## 5. QA gate
- [ ] `bunx tsc -b` passes
- [ ] No digit literals in the scene (FACTS only: 4.6 / 5 / 1 / 2.2 / 2.9)
- [ ] No unsourced claims on screen
- [ ] `/record=1` preview smoke pass
- [ ] Phrase "never a black hole" appears exactly once visually (act 4 stamp, not act 1)
- [ ] Kicker text hidden in HUD top-of-kicker position

## 6. Open decisions and risks
- D1 endCard TRUE (owner default). D2 star-scale series created with signoff (owner asked for it).
- D3 No Nature-sky-style "other stars do make BHs" reference — off script.
- D4 TOV 2.2–2.9 range shown as "2.2–2.9" (never "about 3") — the range, verbatim from Kalogera & Baym.
- D5 Sun expands & sheds in 5 b years — NASA confirmed; "5 billion years" label only.

## 7. Asset needs
All drawn in code — no licenses entries.
- `StarDisc` (gradient disc, radius prop, color ramp prop)
- `LadderBars` (two overlays with values only)
- `NebulaRing` (cosine-alpha ring expanding)
- `WhiteDwarf` (small opal circle w/ radial gloss)
- `Facts` module + `geometry` helpers
