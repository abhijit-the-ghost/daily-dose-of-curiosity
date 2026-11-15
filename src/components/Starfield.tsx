/* ==================================================================
   Starfield — seeded parallax starfield (3 depth layers by default).
   Same shape as MilkyWay.tsx / SpaceSound.tsx (identical pixel output
   when given the same configuration). MinecraftEdge uses its own static
   variant and is deliberately NOT migrated.
   ================================================================== */

import { useMemo } from 'react'
import { clamp01 } from '../motion/anim'

export interface StarLayerSpec {
  count: number
  /** downward scroll speed in px/s (0 = static) */
  speed: number
  rMax: number
  /** opacity = base + amp * sin(t * freq + phase), clamped to [0, 1] */
  baseMin: number
  baseSpan: number
  ampMin: number
  ampSpan: number
  freqMin: number
  freqSpan: number
  /** rand() above this → cross sparkle star */
  crossAbove: number
  seed: number
}

export type StarfieldPRNG = 'lcg' | 'mulberry32'

interface Star { x: number; y: number; r: number; base: number; amp: number; freq: number; phase: number; cross: boolean }

const lcg = (seed: number) => {
  let s = seed >>> 0 || 0x9e3779b9
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const mulberry32 = (seed: number) => {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PRNGS: Record<StarfieldPRNG, (seed: number) => () => number> = { lcg, mulberry32 }

export function makeLayers(specs: readonly StarLayerSpec[], prng: StarfieldPRNG): Star[][] {
  return specs.map((l) => {
    const rand = PRNGS[prng](l.seed)
    const stars: Star[] = []
    for (let i = 0; i < l.count; i++) {
      // call order must match each episode's original generator — do not reorder
      if (prng === 'lcg') {
        const y = rand() * 1920
        const base = l.baseMin + rand() * l.baseSpan
        const x = rand() * 1080
        const r = 0.5 + rand() * l.rMax
        const amp = l.ampMin + rand() * l.ampSpan
        const freq = l.freqMin + rand() * l.freqSpan
        const phase = rand() * Math.PI * 2
        const cross = rand() > l.crossAbove
        stars.push({ x, y, r, base, amp, freq, phase, cross }, { ...{ x, y, r, base, amp, freq, phase, cross }, y: y + 1920 })
      } else {
        const y = rand() * 1920
        const x = rand() * 1080
        const r = 0.5 + rand() * l.rMax
        const base = l.baseMin + rand() * l.baseSpan
        const amp = l.ampMin + rand() * l.ampSpan
        const freq = l.freqMin + rand() * l.freqSpan
        const phase = rand() * Math.PI * 2
        const cross = rand() > l.crossAbove
        stars.push({ x, y, r, base, amp, freq, phase, cross }, { ...{ x, y, r, base, amp, freq, phase, cross }, y: y + 1920 })
      }
    }
    return stars
  })
}

/** milkyway / space-sound presets (match their current pixel output exactly) */
export const STAR_SPECS = {
  milkyway: [
    { count: 44, speed: 12, rMax: 1.3, baseMin: 0.28, baseSpan: 0.34, ampMin: 0.18, ampSpan: 0.32, freqMin: 0.9, freqSpan: 2.4, crossAbove: 0.88, seed: 11 },
    { count: 62, speed: 26, rMax: 1.8, baseMin: 0.42, baseSpan: 0.38, ampMin: 0.18, ampSpan: 0.32, freqMin: 0.9, freqSpan: 2.4, crossAbove: 0.88, seed: 29 },
    { count: 86, speed: 48, rMax: 2.4, baseMin: 0.6,  baseSpan: 0.4,  ampMin: 0.18, ampSpan: 0.32, freqMin: 0.9, freqSpan: 2.4, crossAbove: 0.88, seed: 47 },
  ] as const,
  spaceSound: [
    { count: 44, speed: 11, rMax: 1.2, baseMin: 0.35, baseSpan: 0.5, ampMin: 0.22, ampSpan: 0.42, freqMin: 0.9, freqSpan: 2.4, crossAbove: 0.88, seed: 11 },
    { count: 62, speed: 23, rMax: 1.7, baseMin: 0.35, baseSpan: 0.5, ampMin: 0.22, ampSpan: 0.42, freqMin: 0.9, freqSpan: 2.4, crossAbove: 0.88, seed: 29 },
    { count: 86, speed: 44, rMax: 2.3, baseMin: 0.35, baseSpan: 0.5, ampMin: 0.22, ampSpan: 0.42, freqMin: 0.9, freqSpan: 2.4, crossAbove: 0.88, seed: 47 },
  ] as const,
} as const

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
