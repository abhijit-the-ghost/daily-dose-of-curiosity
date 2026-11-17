/* ==================================================================
   NUCLEAR GANDHI — "The bug that never existed"
   game-physics series · retro-pixel HUD · amber + cyan
   SVG/JSX only · voice-driven from public/audio/nuclear-gandhi/metadata.json
   ================================================================== */

import { FACTS } from '../../episodes/nuclear-gandhi/facts'
import { clamp01, anim, backOut } from '../motion/anim'

interface Word { w: string; start: number; end: number }
interface Act { id: string; index: number; label: string; words: Word[] }
export interface Metadata { title: string; totalDuration: number; words: Word[]; actBreakdown: Act[] }

export interface NuclearGandhiActsProps { t: number; actIndex: number; meta: Metadata | null }

const INK   = '#F8FAFC'
const CYAN  = '#22D3EE'
const AMBER = '#F59E0B'
const GREY  = '#64748B'
const FONT_MONO    = "ui-monospace, 'Cascadia Mono', Consolas, monospace"
const FONT_DISPLAY = "Anton, Impact, sans-serif"

export default function NuclearGandhiActs({ t, meta }: NuclearGandhiActsProps) {
  const words = meta?.words ?? []
  const find = (name: string, occ = 1) => {
    const hits = words.filter((w) => w.w.toLowerCase() === name.toLowerCase())
    return hits[occ - 1]?.start ?? 0
  }

  const tGandhi1    = find("Gandhi's", 1)     // 2.980
  const tDemocracy  = find('democracy', 1)    // 4.442
  const tWraps      = find('wraps', 1)        // 6.451
  const tMeier      = find('Meier', 1)        // 11.473
  const tReynolds   = find('Reynolds', 1)      // 19.107
  const tCiv3       = find('CIV', 2)           // 23.471 (CIV V's designer)
  const tBug1       = find('bug', 1)           // 1.077
  const tBug2       = find('bug', 2)           // 29.007

  const act1Out     = 1 - anim(t, tMeier + 0.1, 0.4)
  const act3In      = anim(t, tCiv3 + 0.1, 0.4)

  const titleL1 = anim(t, tBug1, 0.5) * act1Out
  const titleL2 = anim(t, tBug1 + 0.18, 0.5) * act1Out
  const titleL3 = anim(t, tBug1 + 0.36, 0.5) * act1Out
  const titleIn = anim(t, tBug1, 0.4) * act1Out
  const avatarIn = anim(t, tGandhi1 - 0.4, 0.5) * act1Out
  const demoP       = anim(t, tDemocracy, 0.3) * act1Out
  const wrapsP      = clamp01((t - tWraps) / 0.45) * act1Out
  const quoteM      = anim(t, tMeier, 0.4) * (1 - anim(t, tCiv3 + 0.1, 0.4))
  const quoteR      = anim(t, tReynolds, 0.4) * (1 - anim(t, tCiv3 + 0.1, 0.4))
  const civReveal   = anim(t, tCiv3, 0.5) * act3In
  const stampSlam   = backOut(clamp01((t - tBug2) / 0.45))

  /* seeded ambient stars */
  const stars = Array.from({ length: 44 }).map((_, i) => {
    const sx = (((i * 2654435761) >>> 0) / 4294967295) * 1080
    const sy = (((i * 2246822519) >>> 0) / 4294967295) * 860
    const r  = 0.5 + (((i * 3266489917) >>> 0) / 4294967295) * 1.5
    const o  = 0.22 + (((i * 374761393) >>> 0) / 4294967295) * 0.6
    const tw = 0.6 + 0.4 * Math.sin(t * (0.55 + (i % 6) * 0.33) + i * 1.9)
    return { key: i, sx, sy, r, o: o * tw }
  })

  return (
    <>
      {/* backdrop */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(800px 640px at 78% -6%, rgba(34,211,238,0.07), transparent 58%), radial-gradient(760px 700px at 18% 88%, rgba(245,158,11,0.05), transparent 60%), #030712' }} />

      <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0">
        <defs>
          <radialGradient id="cyanGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="quoteCard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1220" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#050a18" stopOpacity="0.96" />
          </linearGradient>
        </defs>

        {stars.map((s) => <circle key={s.key} cx={s.sx} cy={s.sy} r={s.r} fill={INK} opacity={s.o} />)}

        {/* ============ ACT 1 — THE MYTH ============ */}
        <g>
          <text x="540" y="222" fill={INK} fontSize="22" fontFamily={FONT_MONO} letterSpacing="6" opacity={titleL1 * 0.6}>ACT 01 // THE MYTH</text>
          <text x="540" y="352" textAnchor="middle" fill={INK} fontSize="66" fontFamily={FONT_DISPLAY} letterSpacing="2" opacity={titleL1}>THE MOST FAMOUS</text>
          <text x="540" y="432" textAnchor="middle" fill={INK} fontSize="66" fontFamily={FONT_DISPLAY} letterSpacing="2" opacity={titleL2}>GAME BUG</text>
          <text x="540" y="512" textAnchor="middle" fill={AMBER} fontSize="66" fontFamily={FONT_DISPLAY} letterSpacing="2" opacity={titleL3}>NEVER EXISTED</text>
        </g>

        {/* Gandhi avatar (act 1) */}
        <g transform="translate(795, 980)" opacity={avatarIn}>
          <circle r="112" fill="#0b1220" stroke={CYAN} strokeWidth={3} />
          <circle cx="0" cy="0" r="92" fill="#f0c8a2" stroke="#0f172a" strokeWidth="2" />
          <path d="M -78 -32 Q -48 -100 0 -102 Q 55 -100 82 -30 Q 48 -84 0 -84 Q -50 -84 -78 -32 Z" fill="#1f2937" />
          <circle cx="-30" cy="-12" r="7.5" fill="#0f172a" />
          <circle cx="30" cy="-12" r="7.5" fill="#0f172a" />
          <path d="M -40 20 Q -18 33 0 32 Q 20 33 42 18" fill="none" stroke="#0f172a" strokeWidth="3.8" strokeLinecap="round" />
          <circle cx="0" cy="-34" r="8.5" fill="#c2410c" />
        </g>

        {/* progression panel (act 1) */}
        <g opacity={titleIn}>
          <text x="70" y="870" fill={CYAN} fontSize="15" fontFamily={FONT_MONO} letterSpacing="4">THE MYTH</text>

          <text x="70" y="975" fill={INK} fontSize="22" fontFamily={FONT_MONO} letterSpacing="2">
            AGGRESSION = <tspan fill={AMBER} fontSize="54" fontFamily={FONT_DISPLAY} letterSpacing="2">{FACTS.aggressionLowest.display}</tspan>
          </text>

          <text x="70" y="1093" fill={INK} fontSize="22" fontFamily={FONT_MONO} letterSpacing="2" opacity={demoP}>
            (− DEMOCRACY DIP <tspan fill={AMBER} fontSize="54" fontFamily={FONT_DISPLAY} letterSpacing="2">{FACTS.democracyReduction.display}</tspan>)
          </text>

          <line x1="70" y1="1145" x2="290" y2="1145" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" opacity={demoP} />

          <g opacity={wrapsP}>
            <text x="70" y="1206" fill={INK} fontSize="19" fontFamily={FONT_MONO} letterSpacing="4">UNSIGNED WRAP TO</text>
            <text x="70" y="1336" fill={AMBER} fontSize="130" fontFamily={FONT_DISPLAY} letterSpacing="2">{FACTS.unsignedWrap.display}</text>
          </g>
        </g>

        {/* ============ ACT 2 — THE DEBUNK ============ */}
        <g opacity={quoteM}>
          <rect x="60" y="560" width="960" height="225" rx="14" fill="url(#quoteCard)" stroke={CYAN} strokeWidth="2.3" />
          <text x="95" y="615" fill={CYAN} fontSize="15" fontFamily={FONT_MONO} letterSpacing="4">SID MEIER</text>
          <text x="95" y="705" fill={INK} fontSize="48" fontFamily={FONT_DISPLAY} letterSpacing="1">SIGNED INTS BY DEFAULT</text>
          <text x="95" y="755" fill={GREY} fontSize="16" fontFamily={FONT_MONO} letterSpacing="2">C AND C++ DON'T WRAP OVERFLOW.</text>
        </g>

        <g opacity={quoteR}>
          <rect x="60" y="850" width="960" height="215" rx="14" fill="url(#quoteCard)" stroke={AMBER} strokeWidth="2" />
          <text x="95" y="905" fill={AMBER} fontSize="15" fontFamily={FONT_MONO} letterSpacing="4">BRIAN REYNOLDS · CIV II</text>
          <text x="95" y="990" fill={INK} fontSize="42" fontFamily={FONT_DISPLAY} letterSpacing="1">THREE LEVELS ONLY</text>
          <text x="95" y="1034" fill={GREY} fontSize="16" fontFamily={FONT_MONO} letterSpacing="2">255 WOULD PERFORM IDENTICALLY TO {FACTS.aggressionLevels.display} — THE MAXIMUM.</text>
        </g>

        {/* ============ ACT 3 — THE TRUTH ============ */}
        <g opacity={civReveal} transform={`translate(0, ${30 * (1 - civReveal)})`}>
          <rect x="60" y="400" width="960" height="560" rx="16" fill="url(#quoteCard)" stroke={CYAN} strokeWidth="2.3" />
          <text x="95" y="460" fill={CYAN} fontSize="17" fontFamily={FONT_MONO} letterSpacing="4">CIV V · ON PURPOSE</text>

          {/* pixel-art Gandhi tile */}
          <g transform="translate(285, 755) scale(2.6)">
            <rect x="-38" y="-46" width="76" height="76" fill="#d6b089" stroke="#0f172a" strokeWidth="2" />
            <rect x="-24" y="-12" width="48" height="52" fill="#e5d7c8" />
            <rect x="-22" y="4" width="10" height="10" fill="#0f172a" />
            <rect x="-4" y="4" width="10" height="10" fill="#0f172a" />
            <rect x="14" y="4" width="10" height="10" fill="#0f172a" />
            <rect x="-34" y="-34" width="68" height="9" fill="#1f2937" />
            <rect x="-14" y="-18" width="28" height="6" fill="#1f2937" />
            <rect x="-2" y="-22" width="4" height="4" fill="#c2410c" />
          </g>
          <text x="95" y="930" fill={INK} fontSize="12" fontFamily={FONT_MONO} letterSpacing="3" opacity="0.65">
            DESIGNER: JON SHAFER
          </text>

          {/* numerals panel */}
          <line x1="470" y1="440" x2="470" y2="920" stroke="#1e293b" strokeWidth="2" />
          <text x="520" y="540" fill={INK} fontSize="17" fontFamily={FONT_MONO} letterSpacing="4">BUILD NUKE</text>
          <text x="520" y="640" fill={AMBER} fontSize="108" fontFamily={FONT_DISPLAY} letterSpacing="2">{FACTS.civ5BuildNuke.display}</text>
          <text x="520" y="752" fill={INK} fontSize="17" fontFamily={FONT_MONO} letterSpacing="4">USE NUKE</text>
          <text x="520" y="852" fill={AMBER} fontSize="108" fontFamily={FONT_DISPLAY} letterSpacing="2">{FACTS.civ5UseNuke.display}</text>
        </g>

        {/* stamp drops in act 3 */}
        <g opacity={stampSlam} transform={`translate(540, 1310) scale(${0.62 + 0.38 * stampSlam})`} style={{ transformOrigin: '540px 1310px' }}>
          <rect x="-390" y="-80" width="780" height="160" fill="#030712" stroke={CYAN} strokeWidth="8" />
          <rect x="-372" y="-62" width="744" height="124" fill="#030712" stroke={CYAN} strokeWidth="2.5" />
          <text x="0" y="20" textAnchor="middle" fill={CYAN} fontSize="86" fontFamily={FONT_DISPLAY} letterSpacing="12">NO BUG</text>
        </g>
      </svg>
    </>
  )
}
