/* ==================================================================
   Daily Dose of Curiosity — pure-function motion helpers
   AGENTS.md Phase 1 spec. No randomness, no clocks — `t` is the only input.
   ================================================================== */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3)
/** same easeOutCubic but applied to progress-input semantics used by count-ups */
export const easeInCubic = (x: number) => Math.pow(clamp01(x), 3)
export const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
/** progress 0..1 of an animation that starts at `start` and lasts `dur` seconds */
export const anim = (t: number, start: number, dur: number, ease = easeOutCubic) =>
  ease(clamp01((t - start) / dur))
/** back-out easing — overshoots then settles; used for the kinetic caption pop */
export const backOut = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  const u = clamp01(x) - 1
  return 1 + c3 * u * u * u + c1 * u * u
}
