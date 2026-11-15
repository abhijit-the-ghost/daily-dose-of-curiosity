// Everest vs Challenger Deep — single source of truth for every on-screen number.
// Every display string must match its `value` (verified by `bun run verify`).
// `src` is a key into `episodes/everest-challenger-deep/sources.md`.
// `null` = definitional (no source needed — π, exact two, the zero datum).

export const FACTS = {
  everestM:    { value: 8848.86,         display: '8,848.86 m', src: 'kp'   },
  deepM:       { value: 10935,           display: '~10,935 m',  src: 'noaa' },
  gapM:        { value: 10935 - 8848.86, display: '~2,086 m',   src: 'math' }, // 2086.14, rounded on screen
  gapKm:       { value: 2,               display: '≈ 2 km',     src: 'math' }, // round(gapM/1000)
  announceYr:  { value: 2020,            display: '2020',       src: 'kp'   },
  surveyMinM:  { value: 10863,           display: '10,863',     src: 'ed'   },
  surveyMaxM:  { value: 10994,           display: '10,994',     src: 'ed'   },
  seaLevelM:   { value: 0,               display: '0 m',        src: null   }, // datum, definitional
  rulerStepKm: { value: 1,               display: '1 km',       src: null   }, // scale-bar tick, definitional
} as const;

export type FactKey = keyof typeof FACTS;
