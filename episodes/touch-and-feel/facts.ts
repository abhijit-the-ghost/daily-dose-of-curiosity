// touch-and-feel — single source of truth for every on-screen number.
// `src` is a key into sources.md. All displayed numbers route through FACTS
// (verify gate enforces display↔value consistency).

export const FACTS = {
  meissnerHz: { value: 40,  display: '40–60 Hz',   src: 'pmc' },
  pacinianHz: { value: 100, display: '100–300 Hz', src: 'pmc' },
} as const;

export type FactKey = keyof typeof FACTS;
