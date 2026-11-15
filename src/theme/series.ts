/* ==================================================================
   Daily Dose of Curiosity — series configuration
   One series per video (see AGENTS.md niche rule). Each series defines
   its badge text and single accent; kicker labels themselves stay
   per-episode in the scene components.
   ================================================================== */

export type SeriesKey = 'cosmic' | 'game-physics'

export interface Series {
  key: SeriesKey
  /** shown top-left in HUD, e.g. "[ COSMIC TELEMETRY ]" */
  badge: string
  /** primary accent — HUD, headlines, active caption glyph */
  accent: string
  /** accent used for glow/highlight behind text */
  accentBright: string
}

export const SERIES: Record<SeriesKey, Series> = {
  cosmic: {
    key: 'cosmic',
    badge: 'COSMIC TELEMETRY',
    accent: '#f59e0b',
    accentBright: '#fbbf24',
  },
  'game-physics': {
    key: 'game-physics',
    badge: 'GAME PHYSICS',
    accent: '#F59E0B',
    accentBright: '#F59E0B',
  },
} as const

/** kicker line format shared by every episode: "01 // THE LIE" */
export const kicker = (index: number, label: string): string =>
  `${String(index).padStart(2, '0')} // ${label.toUpperCase()}`
