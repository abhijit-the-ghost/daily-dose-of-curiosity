/* ==================================================================
   KaraokeCaption â€” karaoke-dim captions: past = white, active = accent,
   upcoming = dim. Word boundaries come from WordBoundary events.
   `buildChunks()` lives in ./captionChunks; shared by every episode.
   NOTE: all Tailwind values below must be LITERAL â€” Tailwind scans source
   text statically, so per-instance classes are passed as full strings.
   ================================================================== */

import { clamp01, easeOutCubic } from '../motion/anim'

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
  /** literal text-shadow utility incl brackets â€” active word */
  activeShadowClass: string
  /** literal text-shadow utility incl brackets â€” idle words (tone of the shadow, incl color) */
  idleShadowClass: string
  /** how long a finished chunk lingers after its last word ends */
  holdSec?: number
  /** easing applied to the active word's 0â†’1 entrance progress */
  wordEase?: WordEase
  /** entrance duration of the active word (seconds) */
  wordDurationSec?: number
  /** e.g. 'text-amber-400' â€” literal class per episode (Tailwind static scan) */
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

