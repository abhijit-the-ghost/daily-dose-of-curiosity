/* ==================================================================
   Scene schema — AGENTS.md Phase 3
   scene.json per episode → parsed into SceneConfig.
   `custom` remains the escape hatch: the act's content renders from the
   episode's own component. Templates land only when ≥2 episodes use one.

   INSTRUCTIONS.md §5 adds the beat timeline, palette and cover fields.
   They are optional so every existing episode keeps its exact config.
   ================================================================== */

export type ActTemplate = 'scaleCompare' | 'timeline' | 'diagram' | 'custom'

export type ActConfig = {
  /** e.g. '01 // THE CLAIM' — rendered by the shared HUD */
  kicker: string
  /** hex colour for the kicker line — optional, falls back from theme tokens */
  kickerColor?: string
  template: ActTemplate
  props?: Record<string, unknown>
  /** optional override; default derived from words[] */
  startSec?: number
}

export type BeatKind =
  | 'chip'
  | 'camera'
  | 'shape'
  | 'counter'
  | 'palette'
  | 'question'
  | 'dots'
  | 'bar'

/** One visual change on the master timeline. `at` is a planned stage second. */
export type Beat = {
  at: number
  kind: BeatKind
  text?: string
  /** camera target zoom; `to` is the focal point in normalized [x, y] */
  scale?: number
  to?: [number, number]
  /** shape id, e.g. 'earth-disc' */
  id?: string
  /** keys into the episode's facts.ts — never literal displayed numbers */
  factKeys?: string[]
  suffix?: string
  dur?: number
  /** palette role, e.g. 'primary' | 'secondary' */
  ground?: string
  strikeAt?: number
  count?: number
  label?: string
  value?: number
  /** authoring note; not rendered */
  note?: string
}

export type ScenePalette = {
  ground: string
  groundAlt: string
  primary: string
  secondary: string
  ink: string
}

export type SceneQuestion = {
  text: string
  questionAt: number
  pinnedComment: string
  ctaStyle: 'question' | string
}

export type SceneConfig = {
  /** key into theme/series.ts */
  series: string
  title: string
  /** 3 acts */
  acts: ActConfig[]
  /** default false — the Short loops back to frame 0 by default */
  endCard: boolean
  slug?: string
  voice?: string
  rate?: string
  tail?: number
  endCardRationale?: string
  captionStyle?: string
  coverTitle?: string
  palette?: ScenePalette
  question?: SceneQuestion
  beats?: Beat[]
}
