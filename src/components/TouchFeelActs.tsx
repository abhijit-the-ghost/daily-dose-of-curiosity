/* ==================================================================
   TOUCH AND FEEL — "If atoms never touch, how do you feel a table?"
   science series · cross-section of a fingertip pressing a surface
   SVG/JSX only · voice-driven from public/audio/touch-and-feel/metadata.json
   ================================================================== */

import { FACTS } from '../../episodes/touch-and-feel/facts'
import { clamp01, easeInOutCubic, easeOutCubic, anim, backOut } from '../motion/anim'

/* ---------- metadata types ---------- */
interface Word { w: string; start: number; end: number }
interface Act { id: string; index: number; label: string; words: Word[] }
export interface Metadata { title: string; totalDuration: number; words: Word[]; actBreakdown: Act[] }

export interface TouchAndFeelActsProps { t: number; actIndex: number; meta: Metadata | null }

const INK = '#F8FAFC'
const CYAN = '#22D3EE'
const AMBER = '#F59E0B'
const FONT_MONO = "ui-monospace, 'Cascadia Mono', Consolas, monospace"
const FONT_DISPLAY = "Anton, Impact, sans-serif"

/* ---------- skin cross-section geometry ---------- */
const SECTION_X = 80
const SECTION_W = 920
const SURFACE_Y = 880
const EPI_BOT = 1080
const DER_BOT = 1320
const HYPO_BOT = 1445
const FINGER_CX = 540

export default function TouchAndFeelActs({ t, meta }: TouchAndFeelActsProps) {
  const words = meta?.words ?? []
  const find = (name: string, occ = 1) => {
    const hits = words.filter((w) => w.w.toLowerCase() === name.toLowerCase())
    return hits[occ - 1]?.start ?? 0
  }

  const tSomeone     = find('Someone', 1)     // 0.095
  const tAtoms       = find('atoms', 1)       // 1.121
  const tAtoms2      = find('atoms', 2)       // 28.471
  const tPress       = find('Press', 1)       // 5.424
  const tElectron    = find('Electron', 1)    // 6.741
  const tMechanically = find('mechanically', 1) // 10.837
  const tMerkel      = find('Merkel', 1)      // 15.134
  const tMeissner    = find('Meissner', 1)    // 15.725
  const tPacinian    = find('Pacinian', 1)    // 16.909
  const tYou         = find('You', 2)         // 24.431

  /* ---------- phase opacities / curves ---------- */
  const reveal        = anim(t, tAtoms + 0.1, 0.5)               // skin section scales up
  const commentIn     = anim(t, tSomeone, 0.35)
  const questionIn    = anim(t, tAtoms, 0.4)
  const pushP         = clamp01((t - (tPress + 0.15)) / 0.9)     // finger presses in 0.9s
  const dentDeep      = 46 * easeInOutCubic(pushP)                // px the skin dents
  const repelGlow     = anim(t, tElectron, 0.4) * (1 - 0.35 * clamp01((t - (tElectron + 1.4)) / 1.2)) // fades back later
  const ePush         = easeOutCubic(clamp01((t - (tElectron + 0.1)) / 0.5)) // electrons push apart
  const channelGlow   = anim(t, tMechanically, 0.45)
  const signalP       = clamp01((t - (tMechanically + 0.25)) / 0.7)
  const organsIn      = anim(t, tMerkel, 0.3)                     // 4 glyphs staggered inside
  const meissnerChip  = anim(t, tMeissner + 0.15, 0.3)
  const pacinianChip  = anim(t, tPacinian + 0.15, 0.3)
  const verdictIn     = anim(t, tYou, 0.35)                       // stamp slams
  const act1Flash     = clamp01((t - tPress) / 0.35)
  const act3Flash     = clamp01((t - tYou) / 0.35)

  const epidermisPath = (() => {
    const d = dentDeep
    return `M ${SECTION_X} ${SURFACE_Y} L ${SECTION_X + 190} ${SURFACE_Y} Q ${FINGER_CX - 60} ${SURFACE_Y + 2 * d}, ${FINGER_CX} ${SURFACE_Y + d} Q ${FINGER_CX + 60} ${SURFACE_Y + 2 * d}, ${SECTION_X + SECTION_W - 190} ${SURFACE_Y} L ${SECTION_X + SECTION_W} ${SURFACE_Y} L ${SECTION_X + SECTION_W} ${EPI_BOT} L ${SECTION_X} ${EPI_BOT} Z`
  })()

  const FINGER_TOP = 600
  const FINGER_W_HALF = 85

  /* deterministic seeded stars (sky band only) */
  const stars = Array.from({ length: 42 }).map((_, i) => {
    const sx = (((i * 2654435761) >>> 0) / 4294967295) * 1080
    const sy = (((i * 2246822519) >>> 0) / 4294967295) * 480
    const r  = 0.5 + (((i * 3266489917) >>> 0) / 4294967295) * 1.5
    const o  = 0.2 + (((i * 374761393) >>> 0) / 4294967295) * 0.6
    const tw = 0.6 + 0.4 * Math.sin(t * (0.55 + (i % 6) * 0.33) + i * 1.9)
    return { key: i, sx, sy, r, o: o * tw }
  })

  /* seeded fat cells (hypodermis) */
  const fatCells = Array.from({ length: 8 }).map((_, i) => {
    const fx = SECTION_X + 40 + ((i * 631 + 290) * 13) % (SECTION_W - 80)
    const fy = HYPO_BOT - 14 - ((i * 37) % 40)
    const fr = 9 + ((i * 17) % 14)
    return { key: i, fx, fy, fr }
  })

  return (
    <>
      {/* backdrop */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(820px 640px at 50% -6%, rgba(34,211,238,0.07), transparent 55%), radial-gradient(760px 760px at 18% 88%, rgba(34,211,238,0.045), transparent 60%), #030712' }} />

      <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0">
        <defs>
          <radialGradient id="repelGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FB923C" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#F59E0F" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="epiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d9b08a" />
            <stop offset="100%" stopColor="#c9a179" />
          </linearGradient>
          <linearGradient id="dermGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a5a3b" />
            <stop offset="100%" stopColor="#6e452c" />
          </linearGradient>
          <linearGradient id="hypoGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#452a1c" />
            <stop offset="100%" stopColor="#2a1810" />
          </linearGradient>
        </defs>

        {/* stars behind everything */}
        {stars.map((s) => <circle key={s.key} cx={s.sx} cy={s.sy} r={s.r} fill={INK} opacity={s.o} />)}

        {/* ============ ACT 1 — the comment + the question ============ */}
        <g opacity={commentIn} transform={`translate(${-40 * (1 - commentIn)}, 0)`}>
          <rect x="60" y="150" width="470" height="118" rx="18" fill="#0b1220" stroke="#1e293b" strokeWidth="2" />
          <rect x="86" y="172" width="54" height="54" rx="27" fill="#1e293b" />
          <text x="113" y="207" textAnchor="middle" fill={INK} fontSize="22" fontFamily={FONT_DISPLAY}>?</text>
          <text x="152" y="192" fill={INK} fontSize="15" fontFamily={FONT_MONO} letterSpacing="1" opacity="0.9">u/curious_commenter</text>
          <text x="152" y="216" fill={INK} fontSize="15" fontFamily={FONT_MONO} opacity="0.72">
            wait, if atoms
          </text>
          <text x="152" y="240" fill={INK} fontSize="15" fontFamily={FONT_MONO} opacity="0.72">
            never touch, how do we feel anything?
          </text>
        </g>

        <g opacity={questionIn}>
          <text x="540" y="288" textAnchor="middle" fill={INK} fontSize="14" fontFamily={FONT_MONO} letterSpacing="5" opacity="0.65">SOMEONE ASKED</text>
          <text x="540" y="386" textAnchor="middle" fill={INK} fontSize="50" fontFamily={FONT_DISPLAY} letterSpacing="2">IF ATOMS</text>
          <text x="540" y="452" textAnchor="middle" fill={INK} fontSize="50" fontFamily={FONT_DISPLAY} letterSpacing="2">NEVER TOUCH,</text>
          <text x="540" y="518" textAnchor="middle" fill={CYAN} fontSize="50" fontFamily={FONT_DISPLAY} letterSpacing="2">HOW DO YOU FEEL?</text>
        </g>

        {/* ============ SKIN SECTION (reveals) ============ */}
        <g opacity={reveal} transform={`translate(0, ${30 * (1 - reveal)}) scale(${0.96 + 0.04 * reveal})`} style={{ transformOrigin: '540px 1120px' }}>
          {/* dermis */}
          <rect x={SECTION_X} y={EPI_BOT} width={SECTION_W} height={DER_BOT - EPI_BOT} fill="url(#dermGrad)" />
          {/* epidermis with the dent */}
          <path d={epidermisPath} fill="url(#epiGrad)" stroke="#2b1a10" strokeWidth="1.5" />
          {/* hypodermis */}
          <rect x={SECTION_X} y={DER_BOT} width={SECTION_W} height={HYPO_BOT - DER_BOT} fill="url(#hypoGrad)" />
          {fatCells.map((f) => <ellipse key={f.key} cx={f.fx} cy={f.fy} rx={f.fr} ry={f.fr * 0.8} fill="#3a2418" opacity="0.85" stroke="#5a3826" strokeWidth="1.4" />)}
          {/* layer captions */}
          <text x={SECTION_X + 4} y={SURFACE_Y + 165} fill="#1f120a" fontSize="13" fontFamily={FONT_MONO} letterSpacing="3" opacity="0.9">EPIDERMIS</text>
          <text x={SECTION_X + 4} y={1262} fill="#281508" fontSize="13" fontFamily={FONT_MONO} letterSpacing="3" opacity="0.9">DERMIS</text>
          <text x={SECTION_X + 4} y={HYPO_BOT - 8} fill="#1d120c" fontSize="13" fontFamily={FONT_MONO} letterSpacing="3" opacity="0.95">HYPODERMIS</text>

          {/* contact glow */}
          <ellipse cx={FINGER_CX} cy={SURFACE_Y + dentDeep / 2} rx={150 + 60 * pushP} ry={26 + 14 * pushP} fill="url(#repelGlow)" opacity={pushP} />

          {/* ============ ELECTRON CLOUDS (pairs) ============ */}
          <g opacity="0.9">
            <circle cx={FINGER_CX - 110 - 30 * ePush} cy={SURFACE_Y - 6} r="26" fill="none" stroke={AMBER} strokeWidth="2.4" opacity={repelGlow} strokeDasharray="4 6" />
            <circle cx={FINGER_CX + 110 + 30 * ePush} cy={SURFACE_Y - 6} r="26" fill="none" stroke={AMBER} strokeWidth="2.4" opacity={repelGlow} strokeDasharray="4 6" />
            <circle cx={FINGER_CX - 110 - 30 * ePush} cy={SURFACE_Y - 6} r="4" fill={AMBER} opacity={repelGlow} />
            <circle cx={FINGER_CX + 110 + 30 * ePush} cy={SURFACE_Y - 6} r="4" fill={AMBER} opacity={repelGlow} />
          </g>
          {/* repulsion tag (left of the finger, off the finger) */}
          <text x="370" y={SURFACE_Y - 262} textAnchor="end" fill={AMBER} fontSize="17" fontFamily={FONT_MONO} letterSpacing="4" opacity={repelGlow}>ELECTRON</text>
          <text x="370" y={SURFACE_Y - 238} textAnchor="end" fill={AMBER} fontSize="17" fontFamily={FONT_MONO} letterSpacing="4" opacity={repelGlow}>REPULSION</text>

          {/* ============ THE FINGER ============ */}
          <g transform={`translate(0, ${46 * easeInOutCubic(clamp01((t - (tPress + 0.15)) / 0.9))})`}>
            <path d={`M ${FINGER_CX - FINGER_W_HALF} ${FINGER_TOP} L ${FINGER_CX - FINGER_W_HALF} ${SURFACE_Y - 90} Q ${FINGER_CX - FINGER_W_HALF} ${SURFACE_Y + 20} ${FINGER_CX} ${SURFACE_Y + 14} Q ${FINGER_CX + FINGER_W_HALF} ${SURFACE_Y + 20} ${FINGER_CX + FINGER_W_HALF} ${SURFACE_Y - 90} L ${FINGER_CX + FINGER_W_HALF} ${FINGER_TOP} Z`}
              fill="#c98d5f" stroke="#5a3016" strokeWidth="3" />
            {/* soft vertical highlight */}
            <rect x={FINGER_CX - 36} y={FINGER_TOP + 30} width="72" height="150" rx="30" fill="#e0b38c" opacity="0.5" />
          </g>

          {/* ============ END ORGANS (staggered pop) ============ */}
          {/* Merkel — shallow upper lip of dermis */}
          <g opacity={organsIn} transform={`translate(150, 1115)`}>
            <circle r="13" fill="#0b1220" stroke={CYAN} strokeWidth={2.5 + channelGlow * 2} />
            <circle r="5" fill={CYAN} opacity={0.4 + 0.6 * channelGlow} />
            <text x="0" y="34" textAnchor="middle" fill={INK} fontSize="12" fontFamily={FONT_MONO} letterSpacing="2">MERKEL</text>
          </g>
          {/* Meissner — upper dermis */}
          <g opacity={clamp01(organsIn * 1.4 - 0.4)} transform={`translate(410, 1212)`}>
            <ellipse rx="14" ry="24" fill="#0b1220" stroke={CYAN} strokeWidth={2.5 + channelGlow * 2} />
            <line x1="-6" y1="-10" x2="-6" y2="10" stroke={CYAN} strokeWidth="1.6" opacity="0.8" />
            <line x1="0"  y1="-11" x2="0"  y2="11" stroke={CYAN} strokeWidth="1.6" opacity="0.8" />
            <line x1="6"  y1="-10" x2="6"  y2="10" stroke={CYAN} strokeWidth="1.6" opacity="0.8" />
            <text x="0" y="42" textAnchor="middle" fill={INK} fontSize="12" fontFamily={FONT_MONO} letterSpacing="2">MEISSNER</text>
          </g>
          {/* Ruffini — mid dermis, horizontal */}
          <g opacity={clamp01(organsIn * 1.4 - 0.8)} transform={`translate(700, 1236)`}>
            <rect x="-34" y="-7" width="68" height="14" rx="7" fill="#0b1220" stroke={CYAN} strokeWidth={2.5 + channelGlow * 2} />
            <line x1="-42" y1="0" x2="-34" y2="0" stroke={CYAN} strokeWidth="1.6" />
            <line x1="34"  y1="0" x2="42"  y2="0" stroke={CYAN} strokeWidth="1.6" />
            <text x="0" y="32" textAnchor="middle" fill={INK} fontSize="12" fontFamily={FONT_MONO} letterSpacing="2">RUFFINI</text>
          </g>
          {/* Pacinian — deep dermis, laminated */}
          <g opacity={clamp01(organsIn * 1.4 - 1.2)} transform={`translate(884, 1316)`}>
            <ellipse rx="27" ry="17" fill="#0b1220" stroke={CYAN} strokeWidth={2.5 + channelGlow * 2} />
            <ellipse rx="17" ry="10.5" fill="none" stroke={CYAN} strokeWidth="1.6" opacity="0.85" />
            <ellipse rx="7.5" ry="5" fill="none" stroke={CYAN} strokeWidth="1.3" opacity="0.7" />
            <text x="0" y="36" textAnchor="middle" fill={INK} fontSize="12" fontFamily={FONT_MONO} letterSpacing="2">PACINIAN</text>
          </g>

          {/* mechanically-gated channels OPEN tag */}
          <text x={FINGER_CX + 130} y="1134" textAnchor="middle" fill={CYAN} fontSize="13" fontFamily={FONT_MONO} letterSpacing="3" opacity={channelGlow}>MECHANICALLY GATED</text>
          <text x={FINGER_CX + 130} y="1154" textAnchor="middle" fill={CYAN} fontSize="13" fontFamily={FONT_MONO} letterSpacing="3" opacity={channelGlow}>CHANNELS OPEN</text>

          {/* ============ frequency chips ============ */}
          <g opacity={meissnerChip}>
            <rect x="250" y="1310" width="240" height="52" fill="#030712" stroke={CYAN} strokeWidth="1.6" rx="6" />
            <text x="270" y="1342" fill={CYAN} fontSize="19" fontFamily={FONT_DISPLAY} letterSpacing="2">MEISSNER</text>
            <text x="382" y="1342" fill={INK} fontSize="19" fontFamily={FONT_MONO} letterSpacing="1">{FACTS.meissnerHz.display}</text>
          </g>
          <g opacity={pacinianChip}>
            <rect x="560" y="1310" width="250" height="52" fill="#030712" stroke={CYAN} strokeWidth="1.6" rx="6" />
            <text x="580" y="1342" fill={CYAN} fontSize="19" fontFamily={FONT_DISPLAY} letterSpacing="2">PACINIAN</text>
            <text x="702" y="1342" fill={INK} fontSize="19" fontFamily={FONT_MONO} letterSpacing="1">{FACTS.pacinianHz.display}</text>
          </g>

          {/* ============ signal trace ============ */}
          {signalP > 0 && (
            <path d="M 540 1420 L 540 1500 L 880 1500" fill="none" stroke={CYAN} strokeWidth="4" strokeDasharray="1000" strokeDashoffset={1000 - 1000 * easeInOutCubic(signalP)} opacity={0.85} />
          )}
          <text x="882" y="1518" fill={CYAN} fontSize="14" fontFamily={FONT_MONO} letterSpacing="3" opacity={signalP}>SIGNAL</text>

          {/* ============ verdict stamp (left of finger) ============ */}
          <g opacity={verdictIn} transform={`translate(95, 745) scale(${0.82 + 0.18 * backOut(verdictIn)})`} style={{ transformOrigin: '95px 745px' }}>
            <text x="0" y="0" fill={INK} fontSize="45" fontFamily={FONT_DISPLAY} letterSpacing="3">YOU FEEL</text>
            <text x="0" y="66" fill={CYAN} fontSize="45" fontFamily={FONT_DISPLAY} letterSpacing="3">THE PUSH.</text>
          </g>
        </g>

        {/* act-cut flashes */}
        {act1Flash > 0 && act1Flash < 1 && <rect x="0" y="0" width="1080" height="1920" fill="#F8FAFC" opacity={(1 - act1Flash) * 0.18} />}
        {act3Flash > 0 && act3Flash < 1 && <rect x="0" y="0" width="1080" height="1920" fill="#F8FAFC" opacity={(1 - act3Flash) * 0.18} />}
      </svg>

      {/* silent act-2 caption accent line */}
      {t > tAtoms2 - 1 && t < 33.128 && <div className="absolute" style={{ left: 0, top: 723, width: 1080 * clamp01(1 - (t - tAtoms2 + 1)), height: 3, background: 'linear-gradient(90deg, transparent, #22D3EE, transparent)', opacity: 0.6 }} />}
    </>
  )
}
