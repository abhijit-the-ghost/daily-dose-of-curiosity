# Episode brief — template

Copy this into `episodes/<slug>/brief.md`. Fill TODOs. Delete sections that don't apply.
Section order is intentional and is derived from the structure used in `episodes/minecraft-edge/` and `episodes/everest-challenger-deep/`.

> For the coding agent (OpenCode). Follow this brief literally. `AGENTS.md` hard rules win; report conflicts, don't silently pick.
> Do not change, add or "improve" any claim, number, or line of narration. If you think something is wrong, stop and ask.

---

## 0. Conventions

**Anchors.** `{word, n}` = the n-th occurrence of `word` in the whole voiceover, case-insensitive, punctuation stripped, hyphenated words = one token. Times come only from `metadata.json → words[]`; never estimate them. See `docs/conventions.md` for the full rules.

**Act boundaries** come from `acts[]` in `metadata.json`; scene code should not hard-code them.

**Banned strings anywhere on screen:** `TODO(fill in per-episode)`.

**FACTS rule.** Every displayed number comes from `episodes/<slug>/facts.ts`. Scene files contain no digit literals for displayed numbers (see `docs/conventions.md`).

**Occurrences used** — fill in after writing the locked narration (copy token list here):

| Word | Occurrences in script |
|---|---|
| (example) Everest | 1 (right) · 2 (check) · … |

---

## 1. Narration (source of truth)

Write exactly this to `episodes/<slug>/script.txt`. Markers are stripped before TTS. Word timings come only from `metadata.json`.

```
// ACT 1 — THE HOOK
TODO: narration \
```

- Voice `en-US-AriaNeural`, rate `+12%`. Word count must land in 60–75 for a ~25–35 s Short; if outside, stop and report — never patch the text.
- Listen for odd reads of awkward tokens; if wrong, use a one-to-one `pronunciations` map (same token count, TTS input only).

---

## 2. Sources

Only pages actually retrieved (never recalled) are listed. A human opens and confirms each before publishing.

| tag | URL | Supports | Status |
|---|---|---|---|
| S1 | … | … | NEEDS HUMAN CONFIRMATION |

---

## 3. FACTS

`episodes/<slug>/facts.ts` — single source of truth for every displayed number:

```ts
export const FACTS = {
  // TODO
} as const;
```

Scene code never contains a digit literal for a displayed number. Geometry derives from `value`, never from typed pixels.

---

## 4. Art direction

### 4.1 Concept

One honest, to-scale cross-section / shot / panel. First frame already shows the contender(s).

### 4.2 Canvas and safe zones

Uses the owner-confirmed safe zone: `x 60 → 1020`, `y 170 → 1536`. Nothing legible sits outside it.

### 4.3 Coordinate system

Derived from `FACTS`; no typed pixels. Layout constants list here.

### 4.4 Palette

One accent per video. Amber = game/real world, cyan = real world, violet = …
List the hex values actually used in this episode.

### 4.5 Type

- **Anton**: captions (uppercase, outlined) and big values.
- **ui-monospace**: HUD, kicker, tags, sub-labels.
- **Pirata One**: brand lockup only (if used).

### 4.6 Layers (z-order, bottom → top)

Fill in for this episode.

### 4.7 HUD / kicker / captions

Values from `scene.json` + `HUD_PRESETS` / `CAPTION_STYLES`.

### 4.8 Motion

- Entrance: 0.35–0.5 s `easeOutCubic`, ~24 px slide + fade.
- Stagger: ~80 ms.
- Ambient drift: 2–4 % scale or parallax across the video.
- Something changes every ~2–3 s.
- No motion longer than 1 s (except ambient drift).
- All motion is a pure function of `t` via `anim()` / seeded factories.

### 4.9 Do not

- No logo intro. No raster assets. No 3D. No second accent.
- No `Math.random()` outside seeded factories. No CSS transitions inside video scenes.
- Don't improvise facts, don't "round" friendly numbers.

---

## 5. Beat sheet

| ID | Anchor | On screen | Motion | Purpose · FACTS |
|---|---|---|---|---|
| 1.0 | `{…}` | … | … | … |
| … | … | … | … | … |

---

## 6. Density and budget check

Estimated act windows: … Act boundaries come from `metadata.json`, not from the writer's guess.

Longest quiet stretch between changes: … s (rule: something changes every 2–3 s).

Estimated build effort: … h.

---

## 7. QA gate (on top of the repo QA gate)

- [ ] `bunx tsc -b` passes.
- [ ] No digit literals for displayed numbers in scene files.
- [ ] Banned strings absent from narration + visible text.
- [ ] Every anchor in the beat sheet resolves in `words[]`.
- [ ] Geometry derives from FACTS (checks: `…`).
- [ ] Frames (`bun run shot`) at: `{…}`, `{…}`, `{…}`.
- [ ] Captions never clip long words.
- [ ] Nothing legible sits below y = 1536 or right of x = 1020.
- [ ] Duration 20–35 s. `ffprobe` and ≥ 2 decoded frames pass.
- [ ] `bun run verify <slug>` passes.
- [ ] `about.txt` covers every on-screen claim.

---

## 8. Open decisions and risks

List what is deliberately unresolved, what needs an owner call, what could bite.

## 9. Asset needs

All assets are SVG/JSX/CSS drawn in code by default — no new `LICENSES.md` entry unless something raster is added.

| name | what it shows | size in px | props it takes | needed at which anchor |
|---|---|---|---|---|
| … | … | … | … | … |
