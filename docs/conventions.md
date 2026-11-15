# Conventions

Hard rules every episode, scene and asset must follow. If something here contradicts `AGENTS.md`, `AGENTS.md` wins; report the conflict, don't silently pick.

## Anchors

**Anchor syntax.** `{word, n}` = the *n-th* occurrence of `word` in the whole voiceover, matched case-insensitively, punctuation stripped, hyphenated words = **one** token, possessives (`Everest's`) are their own token.

- Anchor times come **only** from edge-tts `WordBoundary` events, via `public/audio/<slug>/metadata.json → words[]`. Never estimate them from the transcript.
- **Beat-internal offsets** (`+0.4s`) are choreography inside a beat — they describe how long a motion takes. They are **not** audio timings.
- The build can — and must — fail if an anchor is missing or ambiguous. `bun run verify <slug>` implements the check.

**Want Act N start times?** Derive them from `metadata.json.actBreakdown`, not from `scene.json`. Act boundaries are computed from the number of tokens in each `//`-delimited act block.

**Occurrences for the Everest episode:** see `episodes/everest-challenger-deep/brief.md` §0.

## The FACTS rule

**Every displayed number on screen comes from `episodes/<slug>/facts.ts`.**

Scene files never contain a digit literal for a displayed number. They render `FACTS.x.display`. Geometry (sizes, positions, ratios) derives from `FACTS.x.value`, never from hand-typed pixels.

If you catch a literal in a scene file, move it into `facts.ts` or derive it. The brief grep: `rg '[0-9]' src/components/Everest*` — any hit is a code-review stop sign (units like `0.5` for easings are excepted; displayed-unit literals are not).

`facts.ts` layout:

```ts
export const FACTS = {
  everestM: { value: 8848.86, display: '8,848.86 m', src: 'kp' },
  // …
} as const;
```

Rules:

- `display` strings must match `value` (checked by `bun run verify`).
- `src` is a key into the episode's source list (see below). `null` means definitional (pi, exactly 2, etc.).
- No stray factors-of-ten "because it looks nicer". The number is what the source says.

## Safe zones (1080 × 1920)

Owner-confirmed 2026-11-12:

| Zone | Rect | Holds |
|---|---|---|
| Safe area | x 60 → 1020, y 170 → 1536 | everything legible (text, kicker, captions, HUD) |
| Reserved | x > 1020, y > 1536 | decoration only (progress bar, grain, grade) |

Exemptions: zero (TACTICS]) — nothing you must read sits outside the safe area, ever.

## Source-marker rule

**Every claim in `script.txt` carries a `[src: …]` marker.** The marker is either:

- a key from `episodes/<slug>/sources.md` (preferred — keeps scripts readable), or
- a literal URL (acceptable but makes the script noisy; avoid when > 4 markers per sentence).

Packaging fails when `sources.md` is missing markers referenced by the script. **A human must have opened and confirmed every listed URL** before the episode is marked ready. The agent must never invent or "recall" a source from memory; if a fact lacks a source, it is flagged, not included.

## Scene schema

`episodes/<slug>/scene.json` (consumed by `src/Episode.tsx`):

```json
{
  "series": "cosmic|game-physics",
  "title": "…",
  "acts": [
    { "kicker": "01 // THE HOOK", "template": "custom|scaleCompare|timeline|diagram", "props": {}, "startSec": 0 }
  ],
  "endCard": false
}
```

`template: "custom"` escapes hatch. `scaleCompare`/`timeline`/`diagram` are reserved for Phase-3 templates; nothing may reference them yet without owner approval.
