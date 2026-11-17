# EPISODE BRIEF — "Nuclear Gandhi — the bug that never existed"

slug: `nuclear-gandhi` · angle: **myth-check (Civilization)** · hook style: claim/contradiction ("the most famous game bug never existed") · series: `game-physics` (existing config)

Script locked, ~73 words. ~25–30 s (hard cap 35 s).

Canvas 1080×1920 @ 30 fps · `series: game-physics` · `captions: karaoke-dim` · `endCard: true` (house default for packaged episodes).

## 0. Conventions
Clock: preview = `<audio>.currentTime` + rAF; record (`?record=1`) = `window.__seek(t)` from Puppeteer.
Anchors `{word, n}` = nth occurrence of that word in the whole voiceover (case-insensitive, punctuation stripped).
Act boundaries: act 2 starts at `{Sid, 1}`; act 3 at `{Civilization, 2}` / `{Then, 1}` — derived from metadata.json actBreakdown. See `docs/conventions.md`.

## 1. FACTS (single source for every number on screen)
`episodes/nuclear-gandhi/facts.ts`:
- `aggressionLowest` — value 1 (Gandhi's aggression rating) [src: sk, wp]
- `democracyReduction` — value 2 (democracy reduces AI aggression by 2) [src: wp, kk, sk]
- `unsignedWrap` — value 255 (unsigned 8-bit wrap of −1) [src: sk, wp, kk]
- `aggressionLevels` — value 3 (Reynolds: only three levels in Civ 1) [src: sk]
- `civ5BuildNuke` / `civ5UseNuke` — value 12 each (max value; Shafer set deliberately as a joke) [src: wp]
Banned strings on screen or in VO: `exactly`, `direct`, `rock`, `true aggression`, `bug fix`.
No decimal precision claims anywhere. No "8-bit" on screen — the script never states the byte width,
because the byte width itself could not be independently verified this session (Wikipedia says 8-bit;
Brian Reynolds says there was no unsigned variable in that code at all).

## 2. ART DIRECTION
### 2.1 Concept
One argument. Three beats: bait the myth → disprove it with the people who wrote the code → reveal the gag.
Composition: a dark editorial HUD; giant typewriter-style numerals (Anton, pixel-ish vibe) for the numbers — 1 → 1 − 2 → 255 glitching; Steely "NO BUG" stamp at the end.
Gandhi avatar: drawn in code as a simple head-and-shoulders silhouette with a forehead tilak (inoffensive, obviously stylized — no copyrighted art).

### 2.2 Safe zones (owner-confirmed 2026-11-12)
xMin 60 · xMax 1020 (production export uses xMax 940 as before) · yMin 170 · yMax 1536.

### 2.3 Coordinate system (derived, never typed)
- `ATOM.y = 430` — the "1 − 2 = 255" numeral stack, centred.
- `GANDHI = { cx: 200, cy: 720 }` (act 1), moves to `{ cx: 880, cy: 720 }` in act 2 to make room for Sid-Meier-style quote card.
- `STAMP.y = 1240` — the "NO BUG" stamp lands there in act 3.
- Layers drawn: background starfield → HUD → numerals → avatar → quote card → stamp.

### 2.4 Palette
- Background `#030712`
- Accent cyan `#22D3EE`
- Amber `#F59E0B` for the "255 glitch" figure
- Ink `#F8FAFC`

### 2.5 Type
Anton (captions + big numerals) · ui-monospace (HUD/numbers, 18–26 px) · uppercase.

### 2.6 Layers (z-order)
0 void + starfield · 1 bevel grid/TEEL privacy bars · 2 FALSE-BUG legend headline · 3 numerals stack · 4 avatar SVG · 5 quote cards · 6 stamp ("CIV BUG?  NO.") · 7 HUD/kicker/captions · 8 EndCard.

### 2.7 HUD
Badge `[ GAME MYTHS // CIV ]` · kickers `01 // THE MYTH` → `02 // THE DEBUNK` → `03 // THE TRUTH`.

### 2.8 Captions
Karaoke-dim — existing component + new preset `nuclearGandhi` (cyan active, Anton).

### 2.9 Motion
Entrances 0.35 s easeOutCubic; glitch bursts use a seeded PRNG with fixed seed → deterministic.
Stamp lands with 0.3 s easeOutCubic slam + 6 px overshoot along y.
Ambient: slow scanline sweep + subtle starfield drift. No CSS infinite animations.

### 2.10 Do-not
- No copyrighted Civilization logo/art anywhere — use generic pixel-game silhouettes.
- No claim that "Harvard teaches this" (unverified this session).
- No claim that "coder died/recanted" — stay with what Reynolds/Meier actually said.
- No Bertrand Russell–style hand-waving about what "the bug" looked like inside the executable.
- All facts through `FACTS.*.display` — display == value or verify fails.
- No debunking via "America is wrong" framing — this is a code myth, keep it technical.

## 3. BEAT SHEET
| ID | Anchor | On screen | Motion | Facts |
|---|---|---|---|---|
| 1.1 | t = 0 / `{Gandhi,1}` | Title "THE MOST FAMOUS GAME BUG NEVER EXISTED" stagger-reveal | 0.35 s easeOutCubic | |
| 1.2 | `{aggression,1}` | Numerical stack: "1" pops amber | pop 0.25 | aggressionLowest [sk] |
| 1.3 | `{democracy,1}` | "− 2" slides in next to it | slide 0.3 | democracyReduction [wp] |
| 1.4 | `{wraps,1}` | "255" glitches in over the pair | glitch 0.4 PRNG | unsignedWrap [wp] |
| 2.1 | `{Meier,1}` | Quote card slides up: "Signed ints by default. Government never changed aggression." | slide 0.35 | Meier via wp |
| 2.2 | `{Reynolds,1}` | Quote card slides up: "Three aggression levels, highest was 10." | slide 0.35 stagger 0.2 | Reynolds via sk |
| 3.1 | `{Civilization,2}` | CIV V pixel-grid appears: "12 / 12 — on purpose." | pop 0.35 | civ5BuildNuke, civ5UseNuke [wp] |
| 3.2 | `{never,2}` | Stamp drops: "BUG: NO." | stamp 0.3 | |

## 4. Density and budget check
Beats: act 1 = 4 · act 2 = 3 · act 3 = 2 → one new beat every ~2 s. Estimated act windows: act 1 ≈ 0.1–6 s · act 2 ≈ 6–13 s · act 3 ≈ 13–21 s. Script is 73 tokens.

## 5. QA gate
- [ ] `bunx tsc -b` passes
- [ ] No digit literals for displayed numbers in scene files; all from FACTS (`1`, `2`, `255`, `3`, `12`, `12`)
- [ ] Banned strings absent from script/VO text (`rock`, `true`, `exact`, `political`)
- [ ] `/s/ nuclear-gandhi` end-to-end: tsc → verify → shot → double render → package
- [ ] `about.txt` sources cover bw (sci) + wp (wiki) + kk (kotaku); human confirmation flagged before posting
- [ ] End card: TRUE (house owner default)

## 6. Open decisions and risks
- D1 endCard: TRUE (owner default for packaged episodes).
- D2 Series badge: `[ GAME MYTHS // CIV ]` — HUD preset added to `HUD_PRESETS` and `CAPTION_STYLES` (`nuclearGandhi`).
- D3 No 8-bit claim on screen — not verified this session and irrelevant to the argument.
- D4 Hip hop of "game bug" framing: treat as a code-myth segment — do not imply Civilization's designers were incompetent.
- D5 Sources that could not be opened this session (gamingbible 410, Meier's memoir full text): record exactly what was opened where.
- D6 Remotion border: this episode uses the same SVG/JSX renderer pipeline as every other episode on this channel; do not introduce Remotion even though the topic is "gaming".

## 7. Asset needs
All drawn in code — no `LICENSES.md` entries needed.
- `GandhiAvatar` (circle head + tilak dot + shoulders path — generic) · `GridGlitch` (PRNG) · `QuoteCard` · `NoBugStamp` · `AlphaBlinker` (scanline bar).
