/* ==================================================================
   Solar system: why the planets orbit in a flat plane — facts
   Single source of truth for every NUMBER shown on screen.
   Scene code never contains a digit literal for a displayed number.

   Owner decision 2026-11-25: show BOTH numbers. `~7°` is the primary
   band (Mercury's maximum inclination); `~3.5°` is the supporting
   comparison for every other planet. Both come from S5 and must be
   drawn as measurement geometry, not typed into scene files.

   The atom-shell picture in the hook is a false mental model only.
   No electron physics is claimed in the narration.
   ================================================================== */

export const FACTS = {
  // S5 — Britannica "Planet": Mercury is inclined about 7 degrees.
  bandDeg: { value: 7, display: '~7° BAND', src: 'S5' },
  // S5 — Britannica "Planet": all other planets within about 3.5 degrees.
  otherPlanetsDeg: { value: 3.5, display: '~3.5° / OTHER PLANETS', src: 'S5' },
} as const

export type FactKey = keyof typeof FACTS
