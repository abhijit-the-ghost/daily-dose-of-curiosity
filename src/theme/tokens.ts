/* ==================================================================
   Daily Dose of Curiosity — design tokens
   AGENTS.md §4 layout · Tailwind classes stay as-is; these tokens exist
   for values the components hard-code today (bg, accent, safe zone),
   so every episode reads from one source of truth.
   ================================================================== */

export const CANVAS = { width: 1080, height: 1920 } as const

/** owner-confirmed 2026-11-12: nothing below y 1536, captions inside x 60–1020 */
export const SAFE = { xMin: 60, xMax: 1020, yMin: 170, yMax: 1536 } as const

export const COLORS = {
  /** near-black void background for every episode */
  bg: '#030712',
  /** primary ink */
  ink: '#F8FAFC',
  /** secondary text on dark */
  inkDim: 'rgba(248,250,252,0.45)',
  /** muted slate — labels, footnotes */
  slate: '#475569',
  /** dim star/caption */
  star: '#e8edff',
  /** white glints */
  white: '#ffffff',
} as const

export const TYPE = {
  /** Anton — big caption words, display numbers */
  display: "Anton, Impact, sans-serif",
  /** ui-monospace — telemetry, HUD, metadata */
  mono: "ui-monospace, 'Cascadia Mono', Consolas, monospace",
  /** Pirata One — brand tagline lockup only */
  brand: "'Pirata One', Georgia, serif",
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

export const MOTION = {
  /** entrances: 0.35–0.5 s, easeOutCubic, ~24 px slide + fade */
  entranceDuration: 0.35,
  entranceSlidePx: 24,
  /** list stagger ≈ 80 ms */
  staggerSec: 0.08,
  /** ambient drift: 2–4 % scale across the video */
  ambientScaleFrom: 1.0,
  ambientScaleTo: 1.03,
  /** something on screen changes every ~2–3 s */
  changeEverySec: 2.5,
  /** no motion longer than 1 s except ambient drift */
  maxMotionSec: 1.0,
} as const

export const FPS = 30 as const
