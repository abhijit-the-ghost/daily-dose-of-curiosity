/* ==================================================================
   Hud — the full episode HUD shell: corner brackets (optional), badge +
   timecode top bar, divider line, act kicker bottom, bottom watermark
   + progress bar. Every literal Tailwind class is inline (static scan).
   Per-episode look comes from props; see `HUD_PRESETS` for the three
   current episodes' exact class output.
   ================================================================== */

import { clamp01 } from '../motion/anim'

export interface HudProps {
  t: number
  duration: number
  /** e.g. "[ GAME PHYSICS // SCALE ]" (brackets included) */
  badgeText: string
  /** "01 // THE LIE" */
  kickerLabel: string
  /** what color accent the top bar uses ('cyan' | 'amber') */
  accent: 'cyan' | 'amber'
  /** milkyway used the cyan corner brackets; minecraft-edge has none; space-sound has them */
  cornerBrackets: boolean
  /** milkyway passes its act chip classes… */
  kickerToneClass?: string
  kickerBarClass?: string
  /** …the other two pass hex (rendered inline) */
  kickerAccentHex?: string
  kickerBottomClass: string
  pbBottomClass: 'pb-7' | 'pb-8'
  /** literal gradient utility, e.g. 'from-amber-400 via-yellow-300 to-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.55)]' */
  progressGradientClass: string
  /** when false, the top-left dot renders at full opacity with no pulse animation */
  pulseDot?: boolean
}

export default function Hud({
  t,
  duration,
  badgeText,
  kickerLabel,
  accent,
  cornerBrackets,
  kickerToneClass,
  kickerBarClass,
  kickerAccentHex,
  kickerBottomClass,
  pbBottomClass,
  progressGradientClass,
  pulseDot = true,
}: HudProps) {
  const tcS = Math.floor(t)
  const tcF = Math.floor((t - tcS) * 30)
  const progress = (clamp01(t / duration) * 100).toFixed(2)
  const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 4.4))

  const dotClass = accent === 'cyan'
    ? 'bg-cyan-400'
    : 'bg-amber-400'
  const dotShadowStyle = accent === 'cyan'
    ? { boxShadow: '0 0 12px rgba(34,211,238,0.9)' }
    : { boxShadow: '0 0 12px rgba(245,158,11,0.85)' }
  const badgeClass = accent === 'cyan' ? 'text-cyan-300/90' : 'text-amber-300/90'
  const dividerClass = accent === 'cyan'
    ? 'via-cyan-400/45'
    : 'via-amber-400/45'
  const cornerClass = accent === 'cyan'
    ? 'border-cyan-400/55'
    : 'border-amber-400/55'

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      {cornerBrackets && (
        <>
          <div className={`absolute h-10 w-10 border-l-2 border-t-2 ${cornerClass}`} style={{ left: 26, top: 26 }} />
          <div className={`absolute h-10 w-10 border-r-2 border-t-2 ${cornerClass}`} style={{ right: 26, top: 26 }} />
          <div className={`absolute h-10 w-10 border-l-2 border-b-2 ${cornerClass}`} style={{ left: 26, bottom: 26 }} />
          <div className={`absolute h-10 w-10 border-r-2 border-b-2 ${cornerClass}`} style={{ right: 26, bottom: 26 }} />
        </>
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-8 pt-8">
        <div className="flex items-center gap-3">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotClass}`} style={pulseDot ? { opacity: pulse, ...dotShadowStyle } : dotShadowStyle} />
          <span className={`font-mono text-[12px] font-semibold tracking-[0.26em] ${badgeClass}`}>{badgeText}</span>
        </div>
        <div className="font-mono text-[12px] tracking-[0.2em] text-white/45">TC 00:00:{String(tcS).padStart(2, '0')}:{String(tcF).padStart(2, '0')}</div>
      </div>
      <div className={`absolute inset-x-8 top-[66px] h-px bg-gradient-to-r from-transparent ${dividerClass} to-transparent`} />

      <div className={`absolute ${kickerBottomClass} left-0 right-0 px-14`}>
        <div className="flex items-center gap-3">
          <span
            className={`h-[3px] w-10 ${kickerBarClass ?? ''}`}
            style={kickerBarClass ? undefined : { background: kickerAccentHex }}
          />
          <span
            className={`font-mono text-[13px] font-bold tracking-[0.32em] ${kickerToneClass ?? ''}`}
            style={kickerToneClass ? undefined : { color: kickerAccentHex }}
          >
            {kickerLabel}
          </span>
        </div>
      </div>

      <div className={`absolute inset-x-0 bottom-0 px-8 ${pbBottomClass}`}>
        <div className="mb-2 flex items-end justify-between font-mono text-[12px] tracking-[0.18em] text-white/50">
          <span>DAILY DOSE <span className="text-amber-400">OF CURIOSITY</span></span>
          <span>{String(tcS).padStart(2, '0')}s <span className="text-white/25">/ {Math.floor(duration)}s</span></span>
        </div>
        <div className="h-[5px] w-full overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full bg-gradient-to-r ${progressGradientClass}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

/** per-episode literal presets — Tailwind picks up every class */
export const HUD_PRESETS = {
  milkyway: {
    accent: 'cyan' as const,
    cornerBrackets: true,
    badgeText: '[ COSMIC TELEMETRY // MILKY WAY ]',
    kickerBottomClass: 'bottom-[290px]',
    pbBottomClass: 'pb-8' as const,
    progressGradientClass:
      'from-cyan-400 via-sky-300 to-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.55)]',
  },
  spaceSound: {
    accent: 'cyan' as const,
    cornerBrackets: true,
    badgeText: '[ GAME PHYSICS // SOUND ]',
    kickerBottomClass: 'bottom-[312px]',
    pbBottomClass: 'pb-7' as const,
    progressGradientClass:
      'from-amber-400 via-yellow-300 to-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.55)]',
  },
  minecraftEdge: {
    accent: 'amber' as const,
    cornerBrackets: false,
    badgeText: '[ GAME PHYSICS // SCALE ]',
    kickerBottomClass: 'bottom-[312px]',
    pbBottomClass: 'pb-7' as const,
    progressGradientClass:
      'from-amber-400 via-orange-300 to-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.55)]',
    pulseDot: false,
  },
  neverTouch: {
    accent: 'cyan' as const,
    cornerBrackets: true,
    badgeText: '[ PHYSICS // MATTER ]',
    kickerBottomClass: 'bottom-[312px]',
    pbBottomClass: 'pb-7' as const,
    progressGradientClass:
      'from-cyan-400 via-violet-400 to-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.55)]',
  },
  everestVsDeep: {
    accent: 'cyan' as const,
    cornerBrackets: true,
    badgeText: '[ COSMIC TELEMETRY // EVEREST VS DEEP ]',
    kickerBottomClass: 'bottom-[312px]',
    pbBottomClass: 'pb-7' as const,
    progressGradientClass:
      'from-amber-400 via-orange-400 to-yellow-200 shadow-[0_0_14px_rgba(245,158,11,0.55)]',
  },
} as const
