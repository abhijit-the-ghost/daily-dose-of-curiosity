/* ==================================================================
   Starfield — seeded parallax starfield component.
   Pure math + presets live in src/theme/starfield.ts.
   ================================================================== */

import { useMemo } from 'react'
import { clamp01 } from '../motion/anim'
import { makeLayers, type Star, type StarLayerSpec, type StarfieldPRNG } from '../theme/starfield'

export function StarLayer({ t, index, stars, spec }: {
  t: number
  index: number
  stars: Star[][]
  spec: readonly StarLayerSpec[]
}) {
  const layer = spec[index]
  const offset = (t * layer.speed) % 1920
  const tw = (s: Star) => clamp01(s.base + s.amp * Math.sin(t * s.freq + s.phase))

  return (
    <svg
      width="1080"
      height="3840"
      viewBox="0 0 1080 3840"
      className="absolute left-0"
      style={{ top: -offset }}
    >
      {stars[index].map((s, i) => {
        const o = tw(s)
        if (s.cross) {
          const L = s.r * 5
          return (
            <g key={i} opacity={o} stroke="#e8edff" strokeWidth={Math.max(1, s.r * 0.55)} strokeLinecap="round">
              <line x1={s.x - L} y1={s.y} x2={s.x + L} y2={s.y} />
              <line x1={s.x} y1={s.y - L} x2={s.x} y2={s.y + L} />
              <circle cx={s.x} cy={s.y} r={s.r * 0.9} fill="#fff" stroke="none" />
            </g>
          )
        }
        return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e8edff" opacity={o} />
      })}
    </svg>
  )
}

export default function Starfield({ t, layers, prng }: { t: number; layers: readonly StarLayerSpec[]; prng: StarfieldPRNG }) {
  const stars = useMemo(() => makeLayers(layers, prng), [layers, prng])
  return (
    <>
      {layers.map((_, i) => (
        <StarLayer key={i} t={t} index={i} stars={stars} spec={layers} />
      ))}
    </>
  )
}
