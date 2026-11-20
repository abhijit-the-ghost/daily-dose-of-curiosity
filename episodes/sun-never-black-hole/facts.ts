// sun-never-black-hole — single source of truth for every on-screen number.
// All displayed digits route through FACTS (verify gate enforces display⊇value digits).

export const FACTS = {
  sunAge: { value: 4.6, display: '4.6 billion years', src: 'nasa' },
  sunRemaining: { value: 5, display: '5 billion years', src: 'nasa' },
  sunMass: { value: 1, display: '1 solar mass', src: 'nasa' },
  tovMin: { value: 2.2, display: '2.2 M☉', src: 'kb' },
  tovMax: { value: 2.9, display: '2.9 M☉', src: 'kb' },
} as const

export type FactKey = keyof typeof FACTS
