/* ==================================================================
   Scene schema — AGENTS.md Phase 3
   scene.json per episode → parsed into SceneConfig.
   `custom` remains the escape hatch: the act's content renders from the
   episode's own component. Templates land only when ≥2 episodes use one.
   ================================================================== */

export type ActTemplate = 'scaleCompare' | 'timeline' | 'diagram' | 'custom'

export type ActConfig = {
  /** e.g. '01 // THE CLAIM' — rendered by the shared HUD */
  kicker: string
  /** hex color for the kicker line + label */
  kickerColor: string
  template: ActTemplate
  props?: Record<string, unknown>
  /** optional override; default derived from words[] */
  startSec?: number
}

export type SceneConfig = {
  /** key into theme/series.ts */
  series: string
  title: string
  /** 3 acts */
  acts: ActConfig[]
  /** default false — the Short loops back to frame 0 by default */
  endCard: boolean
}
