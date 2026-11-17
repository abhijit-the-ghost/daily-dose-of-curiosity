// nuclear-gandhi — single source of truth for every on-screen number.
// Displayed values come from FACTS (verify gate enforces display⊇value consistency).

export const FACTS = {
  aggressionLowest:  { value: 1,   display: '1',   src: 'sk' },
  democracyReduction:{ value: 2,   display: '2',   src: 'wp' },
  unsignedWrap:      { value: 255, display: '255', src: 'wp' },
  aggressionLevels:  { value: 3,   display: '3',   src: 'sk' },
  civ5BuildNuke:     { value: 12,  display: '12',  src: 'wp' },
  civ5UseNuke:       { value: 12,  display: '12',  src: 'wp' },
} as const

export type FactKey = keyof typeof FACTS
