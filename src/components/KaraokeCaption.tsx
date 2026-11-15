/* ==================================================================
   KaraokeCaption — karaoke-dim captions: past = white, active = accent,
   upcoming = dim. Word boundaries come from WordBoundary events.
   `buildChunks()` lives in ./captionChunks; shared by every episode.
   NOTE: all Tailwind values below must be LITERAL — Tailwind scans source
   text statically, so per-instance classes are passed as full strings.
   ================================================================== */

import { clamp01, easeOutCubic, backOut } from '../motion/anim'

type WordEase = (x: number) => number

export interface KaraokeWord { w: string; start: number; end: number }
export interface CaptionChunk { words: KaraokeWord[]; start: number; end: number }

export default function KaraokeCaption({
  t,
  chunks,
  bottomClass,
  pxClass = 'px-14',
  fontSizeClass,
  activeShadowClass,
  idleShadowClass,
  holdSec = 0.55,
  wordEase = easeOutCubic,
  wordDurationSec = 0.22,
  activeTextClass = 'text-amber-400',
}: {
  t: number
  chunks: CaptionChunk[]
  /** e.g. 'bottom-[136px]' */
  bottomClass: string
  pxClass?: 'px-12' | 'px-14'
  /** e.g. 'text-[54px]' */
  fontSizeClass: string
  /** literal text-shadow utility incl brackets — active word */
  activeShadowClass: string
  /** literal text-shadow utility incl brackets — idle words (tone of the shadow, incl color) */
  idleShadowClass: string
  /** how long a finished chunk lingers after its last word ends */
  holdSec?: number
  /** easing applied to the active word's 0→1 entrance progress */
  wordEase?: WordEase
  /** entrance duration of the active word (seconds) */
  wordDurationSec?: number
  /** e.g. 'text-amber-400' — literal class per episode (Tailwind static scan) */
  activeTextClass?: string
}) {
  let active: CaptionChunk | null = null
  for (let i = chunks.length - 1; i >= 0; i--) {
    const c = chunks[i]
    if (t >= c.start - 0.03) {
      active = t <= c.end + holdSec ? c : null
      break
    }
  }
  if (!active) return null

  return (
    <div className={`pointer-events-none absolute inset-x-0 ${bottomClass} z-10 ${pxClass} text-center`}>
      <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 leading-[0.98]">
        {active.words.map((w, i) => {
          const done = t >= w.end
          const isActive = !done && t >= w.start
          if (isActive) {
            const local = clamp01((t - w.start) / wordDurationSec)
            const scale = 0.62 + wordEase(local) * 0.48
            return (
              <span
                key={i}
                className={`font-block ${fontSizeClass} uppercase ${activeTextClass} ${activeShadowClass}`}
                style={{ transform: `scale(${scale.toFixed(3)}) translateY(${((1 - local) * 7).toFixed(2)}px)` }}
              >
                {w.w.toUpperCase()}
              </span>
            )
          }
          return (
            <span
              key={i}
              className={`font-block ${fontSizeClass} uppercase ${idleShadowClass} ${done ? 'text-white' : 'text-white/30'}`}
            >
              {w.w.toUpperCase()}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** per-episode literal preset — guarantees Tailwind picks up every class */
export const CAPTION_STYLES = {
  milkyway: {
    bottomClass: 'bottom-[150px]',
    pxClass: 'px-12' as const,
    fontSizeClass: 'text-[56px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#241202,2px_-2px_0_#241202,-2px_2px_0_#241202,2px_2px_0_#241202,0_0_34px_rgba(251,191,36,0.55)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#060a18,2px_-2px_0_#060a18,-2px_2px_0_#060a18,2px_2px_0_#060a18,0_8px_24px_rgba(0,0,0,0.9)]',
    holdSec: 0.65,
    wordEase: backOut,
    wordDurationSec: 0.24,
  },
  spaceSound: {
    bottomClass: 'bottom-[136px]',
    pxClass: 'px-12' as const,
    fontSizeClass: 'text-[54px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#241202,2px_-2px_0_#241202,-2px_2px_0_#241202,2px_2px_0_#241202,0_0_30px_rgba(251,191,36,0.55)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#070a14,2px_-2px_0_#070a14,-2px_2px_0_#070a14,2px_2px_0_#070a14,0_8px_24px_rgba(0,0,0,0.9)]',
    holdSec: 0.6,
  },
  minecraftEdge: {
    bottomClass: 'bottom-[140px]',
    pxClass: 'px-14' as const,
    fontSizeClass: 'text-[56px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#241202,2px_-2px_0_#241202,-2px_2px_0_#241202,2px_2px_0_#241202,0_0_30px_rgba(251,191,36,0.55)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#050a18,2px_-2px_0_#050a18,-2px_2px_0_#050a18,2px_2px_0_#050a18,0_8px_24px_rgba(0,0,0,0.9)]',
    holdSec: 0.55,
    wordEase: easeOutCubic,
    wordDurationSec: 0.22,
  },
  neverTouch: {
    bottomClass: 'bottom-[140px]',
    pxClass: 'px-14' as const,
    fontSizeClass: 'text-[56px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#2497ab,2px_-2px_0_#2497ab,-2px_2px_0_#2497ab,2px_2px_0_#2497ab,0_0_30px_rgba(34,211,238,0.6)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#050a18,2px_-2px_0_#050a18,-2px_2px_0_#050a18,2px_2px_0_#050a18,0_8px_24px_rgba(0,0,0,0.9)]',
    activeTextClass: 'text-cyan-300',
    holdSec: 0.55,
    wordEase: easeOutCubic,
    wordDurationSec: 0.22,
  },
  everestVsDeep: {
    bottomClass: 'bottom-[140px]',
    pxClass: 'px-14' as const,
    fontSizeClass: 'text-[56px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#241202,2px_-2px_0_#241202,-2px_2px_0_#241202,2px_2px_0_#241202,0_0_30px_rgba(251,191,36,0.55)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#060a18,2px_-2px_0_#060a18,-2px_2px_0_#060a18,2px_2px_0_#060a18,0_8px_24px_rgba(0,0,0,0.9)]',
    activeTextClass: 'text-amber-400',
    holdSec: 0.55,
    wordEase: easeOutCubic,
    wordDurationSec: 0.22,
  },
} as const
