/* ==================================================================
   Why Uranus Rolls Around the Sun on Its Side — facts
   On-screen numeric/text claims must trace here or to [src:] in script.txt.
   Hedged model claims ("likely knocked...") stay in script/visual labels.
   ================================================================== */

export const FACTS = {
  // S1 — NASA Uranus Facts
  axialTiltDeg: { value: 97.77, display: '97.77° TILT', src: 'S1' },
  orbitYears: { value: 84, display: '84 EARTH YEARS', src: 'S1' },
  longSeasonYears: { value: 42, display: '42 YEARS', src: 'S1' },
  quarterYearDarkWinter: { value: 21, display: '21-YEAR DARK WINTER', src: 'S1' },
} as const

export type FactKey = keyof typeof FACTS
