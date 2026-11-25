# ART_DIRECTION.md — visual design for Daily Dose of Curiosity

Audience: the owner and any AI agent writing an `EPISODE BRIEF` (Chat 3) or an asset pack (Chat 4).
Precedence: `AGENTS.md` §2 wins. If this file conflicts with it, follow `AGENTS.md`.
Reconcile this with `docs/reference-teardown-dexwonders-sun-vs-uranus.md` and the `minecraft-edge` / `solar-system-flat-plane` briefs. Where they differ from this file, the shipped briefs win and this file gets updated.

All pixel and timing values below are **starting values**, not measurements of your current components. Verify against a real render and a real phone.

---

## 0. Hard rules (from AGENTS.md / owner decisions)

- Visuals are a **pure function of `t` (seconds)**. No `Math.random()` outside seeded factories, no CSS `infinite`, no `setInterval`, no animation library with its own clock.
- SVG / JSX / Canvas / CSS only. No three.js. Raster only when necessary, and logged in `shared-assets/LICENSES.md`.
- Canvas 1080×1920 @ 30 fps. **Safe area: x 60-1020, y 170-1536. Nothing below y = 1536.**
- Captions: `captionStyle: "phrase"` (3-word chunks, ~92 px, no dim upcoming words). Must not clip long words. `endCard: false`.
- **One accent color per video.** `series` means visual family (accent + badge), not topic.
- Something meaningful changes every ~2-3 s. No idle wobble.
- Every on-screen number comes from one `FACTS` constant (`facts.ts`). Anchors are `{word, occurrence}` resolved from WordBoundary data. Never hand-edit word times.
- No game art, logos, screenshots or copyrighted characters. Prefer shapes drawn by hand.
- Measured gates (`scripts/qa_metrics.mjs`): motion energy ≥1.5 @ 15 fps, frozen share ≤5%, **mean luma 55-85**, loudness gate, spec rows.

---

## 1. Principles

1. **One idea per beat.** If a beat needs two sentences of explanation, it is two beats.
2. **One visual proof per video.** The proof must work with the sound off.
3. **Continuous world, not slides.** One SVG world; the camera, objects and labels move through it. No fade-in-new-slide transitions.
4. **Hierarchy.** At any instant: one hero, at most two supporting elements, one caption.
5. **Motion is information.** Every movement shows a cause, a change, or a comparison. Decorative motion is cut.
6. **Hold what matters.** The hero number holds still for 2+ s. Movement elsewhere pauses so the eye lands.
7. **Legible on a phone, at arm's length, in a bright room.** Big, high-contrast, few words.

---

## 2. Layout system (1080×1920)

Recurring opening frame (locked): **hero object huge, chip top-left, caption bottom.**

| Zone | y range (start values) | Holds |
|---|---|---|
| Top margin | 0-170 | Empty. Platform UI lives here. |
| Chip | 170-260 | Topic chip / badge, top-left, one line |
| Hero | 300-1200 | The visual proof, the hero object, the number |
| Caption | ~1260-1500 | Phrase captions. Must stay above y = 1536 |
| Bottom margin | 1536-1920 | Empty |

- Keep important elements off the **far right edge** and the bottom third's lower rows (platform buttons and caption overlays sit there; verify on a real device before trusting any exact figure).
- Horizontal margins 60 px. Hero should fill ≥60% of the width in the first two seconds.
- Eye path: chip (top-left) → hero → caption. Don't put a second focal point on the opposite diagonal.
- Use negative space. A cleared region around the hero is how it reads as "important".
- Vertical stacking suits comparisons (tall vs deep, before vs after). Prefer a scale/axis the viewer can read at a glance over side-by-side panels.

---

## 3. Color

**Ground dark, one accent, neutrals.** But note the luma gate: mean luma must be **55-85**. A near-black ground with small bright elements will fail. Keep a lit region (gradient, glow, large light shape) so the average frame isn't too dark. Check with `bun scripts/qa_metrics.mjs --slug <slug>`.

Palette recipe per video (define once in the brief, pass as props, never hard-code in assets):

| Token | Role | Notes |
|---|---|---|
| `ground` | background base | dark, slightly tinted toward the accent hue |
| `ground2` | gradient partner | a few steps lighter than `ground` |
| `ink` | primary text and lines | near-white, not pure `#fff` |
| `muted` | secondary text | ≥4.5:1 contrast against `ground` |
| `accent` | the one highlight | used only for the thing the viewer must look at |
| `accentSoft` | glow / tint | same hue as `accent`, low alpha only |

Starting accents (any one per video): cyan `#2DE2E6`, amber `#FFB020`, violet `#9B7BFF`, green `#3DDC84`. Tune against the luma gate.

Rules:
- The accent marks **meaning**: the hero number, the changing quantity, the key edge. If everything is accent, nothing is.
- A second hue is a violation. Use tints and shades of the accent, or neutrals. (Warning/"wrong" states: use `ink` + a strikethrough or shake, not a red.)
- Same accent = same meaning throughout a video.
- Rotate accents across videos so the feed doesn't look like one video, but keep the structure identical (that is the series identity).

---

## 4. Typography

- At most **two typefaces**: one display face (hero numbers, chips) and the caption face already in the repo. Use fonts that exist in `shared-assets`; do not load fonts from the web, and generated assets must not embed fonts.
- Max **three text sizes on screen at once.**

| Role | Start size | Notes |
|---|---|---|
| Hero number | 200-320 px | tabular figures, holds 2+ s |
| Phrase caption | ~92 px | locked style, 3-word chunks |
| Chip / label | 36-48 px | nothing readable under 36 px |
| Unit / footnote | 36 px | assumption footnote, lowest priority |

- Labels are ≤3 words. If a label needs a sentence, the visual is wrong.
- Numbers on screen are digits from `FACTS`; the narration spells them out.
- Never put text over a busy region without a scrim or clear space.

---

## 5. Motion language (deterministic)

All motion is `f(t)`. Keep easing in one shared file so every episode feels the same.

**Easing:** ease-out for entrances (things arrive and settle), ease-in-out for camera moves, no linear except constant-speed scales (e.g. a ruler sweeping). Springs must be closed-form damped oscillations, not simulated.

| Move | Start duration | Notes |
|---|---|---|
| Entrance | 0.25-0.40 s | ease-out, slight overshoot only on the hero |
| Stagger step | 60-90 ms | between sibling elements |
| Camera move | 1.5-3.0 s | ease-in-out, scale and translate a world group |
| Punch-in on an impact | ~120 ms in, ~300 ms settle | scale 1.00 → ~1.06 → 1.00 |
| Number reveal | count-up 0.6-1.0 s, then hold ≥2 s | |
| Parallax | 2-4 depth layers | far layers move 20-40% of near layers |

- **Shake** must be seeded: derive it from a hash of a quantized `t`, never `Math.random()`.
- **Anchoring:** the visual change *lands* on its anchored word. Start the entrance roughly 150-250 ms earlier so it lands on the word (heuristic; confirm on a render). SFX hit on the word.
- **Rhythm:** alternate fast beats with one slow, held beat. A video where everything moves at the same pace reads as flat.
- **No idle motion.** If it isn't communicating something, it holds still. The motion gate rewards purposeful change, not constant wobble.
- **Loop:** with `endCard: false`, design the last beat to return the hero to the opening state, so the final frame loops into frame 1 (the reference episode ends byte-identical to frame 1).

---

## 6. Depth and finish

- Gradient ground (`ground` → `ground2`), never flat fill.
- Soft glow only on the accent element. Blur filters are expensive in frame-by-frame capture; use them sparingly and check render time.
- Vignette and seeded film grain (seed per frame) already exist in the stage; don't stack extra global filters.
- Layer order: ground → far parallax → hero → labels → chip/caption. Drop shadows on the hero help it separate from the ground.
- If luma is too low, raise the ground gradient or add a light region before adding more glow.

---

## 7. The visual proof

Pick one type per video. It must be understandable with sound off.

| Type | Use when | Example |
|---|---|---|
| Scale comparison | one thing is larger than another | tall vs deep |
| Cross-section | something hidden inside | layers, pressure |
| Number line / axis | where a value sits among others | angle, distance |
| Mechanism diagram | cause → effect in three steps | repulsion, spin-up |
| Before / after morph | a belief vs reality | flat vs spherical |
| Counter / clock | a rate over time | travel time |

Rules:
- If it claims scale, **draw it to scale**. If it can't be, say so on screen in the footnote.
- Name every simplification on screen ("Everest shown at sea-level height").
- Every number from `FACTS`; every comparison uses the same unit on both sides.
- One thing changes per beat so the viewer knows where to look.

---

## 8. Episode brief template (Chat 3 output)

Reconcile this with the existing `minecraft-edge` brief; keep their structure where it differs.

```
EPISODE BRIEF — <slug>
1. Concept: belief → contradiction → mechanism → ONE number → viewer question
2. Angle: what this version shows that the usual version doesn't
3. Art direction
   - Accent + palette tokens (ground, ground2, ink, muted, accent, accentSoft)
   - Type: hero number size, chip text, display face
   - Visual proof type + one-sentence description
   - Camera plan: start framing → moves → end framing (must loop to frame 1)
   - Opening frame (0-2 s): hero object, chip text, caption position
4. Beat sheet (≥12 beats)
   # | anchor {word, occurrence} | narration | visual change | camera | SFX tier | on-screen text
5. Number reveal: FACTS key, digits shown, hold duration, comparison shown
6. Assumptions footnote text
7. Cover: which frame, hero + ≤4 words, 7-surface check
8. ASSET NEEDS (below)
9. Risks: render cost (filters, node count), safe-area risks, luma risk
```

**ASSET NEEDS** table: `name | what it shows | size in px | props | needed at which anchor`.

---

## 9. Asset specs (Chat 4 output)

Per asset: TSX/SVG, untested until rendered, plus a description of the look at **t = 0** and at the **end**.

- `viewBox` given. No external references. No fonts. No images.
- Colors from props only (`ground`, `ink`, `accent`, …).
- Typed props. A `t` prop wherever it animates.
- No SMIL, no CSS animation. Under ~3 KB each.
- Hand-drawn shapes preferred over third-party art. Any library or CC0 asset: give license + page URL, mark "I must verify the license", log it in `LICENSES.md`.

Skeleton (untested):

```tsx
type Props = { t: number; ink: string; accent: string }

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3)

export function ScaleBar({ t, ink, accent }: Props) {
  const p = easeOutCubic((t - 0.1) / 0.6)   // entrance, starts at 0.1 s
  return (
    <svg viewBox="0 0 200 600" width={200} height={600} role="img" aria-label="scale bar">
      <line x1="100" y1="580" x2="100" y2={580 - 520 * p} stroke={ink} strokeWidth={6} strokeLinecap="round" />
      <circle cx="100" cy={580 - 520 * p} r={14} fill={accent} />
    </svg>
  )
}
```

---

## 10. Anti-patterns

- Slideshow cuts or fade-ins between "scenes".
- A second accent hue, or a rainbow gradient.
- Hero smaller than ~half the width, or centered and static for 4+ s.
- Text walls, labels over 3 words, text under 36 px.
- Motion that doesn't carry meaning (floating, wobbling, constant parallax).
- The number appears and disappears in under 2 s.
- Everything the same size and weight.
- Elements below y = 1536, or captions clipped.
- Generic space/neon stock look with no specific proof.
- A scale visual that isn't to scale and doesn't say so.

---

## 11. Review checklist (before render, then after)

**Before render:** palette tokens defined; proof type chosen; ≥12 beats with anchors; every number in `FACTS`; footnote written; last beat returns to opening state.

**Stills:** `bun scripts/dev_shot.mjs 0.5,3,9,14,22 --episode <slug>`. For each still:
- Mute test: does the frame still make sense?
- Thumbnail test: shrink to ~200 px wide. Is the hero readable?
- One accent only? One hero? Captions inside the safe area?

**After render:** `bun scripts/qa_metrics.mjs --slug <slug>` and `bun run verify <slug>`. Then watch it **on a phone**, sound on, once through, and note the first place your attention drifts. That is the next fix.

**Cover:** seven targets. One hero + ≤4 words, readable in the profile-grid crop.

---

## 12. Agent prompt for art direction (paste this)

```
You are the art director for the Daily Dose of Curiosity pipeline.
Read AGENTS.md, INSTRUCTIONS.md, SCRIPT_GUIDE.md and ART_DIRECTION.md first.
AGENTS.md §2 wins. Read docs/reference-teardown-dexwonders-sun-vs-uranus.md and
the solar-system-flat-plane / minecraft-edge briefs for the established structure.

INPUTS: locked script.txt, sources.md, facts.ts, metadata.json (WordBoundary).

DELIVER an EPISODE BRIEF (Chat 3 only, no code):
- accent + palette tokens, type plan, ONE visual proof (and why it works muted)
- ≥12 beats, each with anchor {word, occurrence}, visual change, camera, SFX tier, on-screen text
- number reveal (FACTS key, hold ≥2 s), assumptions footnote, cover plan
- loop plan: last beat returns to the opening state
- ASSET NEEDS: name | what it shows | size in px | props | anchor
- risks: render cost, safe-area, mean luma (gate 55-85)

RULES: deterministic, pure function of t; SVG/JSX only; one accent; safe area
x 60-1020, y 170-1536; every on-screen number from FACTS; no copyrighted art.
Do not invent facts or sources. Do not commit, push or post.
```

---

## 13. Limits of this guide

It is written from your pipeline docs and README, not from your component code. Zone coordinates, font sizes and durations are starting values to tune on real renders. Anything about platform overlays is unverified: check on real devices. What actually holds attention on your audience is unknown until you have post data (`stats.csv`).
