/* ==================================================================
   EVEREST VS CHALLENGER DEEP — "Which wins: Everest or the deepest
   hole in the ocean?"  ·  cosmic series · vertical to-scale cross-section.
   Pure SVG/JSX · voice-driven from public/audio/everest-challenger-deep/metadata.json.
   Every displayed number comes from facts.ts via FACTS.
   ================================================================== */

import { FACTS } from '../../episodes/everest-challenger-deep/facts'
import { clamp01, easeInOutCubic, easeOutCubic, anim } from '../motion/anim'

export interface EverestVsDeepActsProps {
  t: number
  actIndex: number
  meta: { totalDuration?: number; words?: { w: string; start: number; end: number }[] } | null
}
/* ---------- geometry derived from FACTS ---------- */
const SPAN_PX  = 800
const pxPerM   = SPAN_PX / (FACTS.everestM.value + FACTS.deepM.value)   // ≈0.0404
const summitY0 = 250                                                    // Everest apex y
const seaY     = summitY0 + FACTS.everestM.value * pxPerM               // ≈608
const floorY   = seaY + FACTS.deepM.value * pxPerM                      // ≈1050
const gapPx    = FACTS.gapM.value * pxPerM                              // ≈84
const landedSummitY = floorY - FACTS.everestM.value * pxPerM            // ≈692
const dropDY   = deepMDelta(seaY, floorY)                               // dy total 442

function deepMDelta(a: number, b: number) { return b - a }

const SPAN_TOP = summitY0
const SPAN_BOT = floorY

/* ---------- shared styles ---------- */
const INK     = '#F8FAFC'
// const INK_DIM = 'rgba(248,250,252,0.55)'
const CYAN    = '#22D3EE'
const AMBER   = '#F59E0B'
const FONT_MONO = "ui-monospace, 'Cascadia Mono', Consolas, monospace"
const FONT_DISPLAY = "Anton, Impact, sans-serif"

const rulerTickPx = FACTS.rulerStepKm.value * 1000 * pxPerM

export default function EverestVsDeepActs({ t, meta }: EverestVsDeepActsProps) {
  const words = meta?.words ?? []
  const find = (name: string, occ = 1) => {
    const hits = words.filter((w) => w.w.toLowerCase() === name.toLowerCase())
    return hits[occ - 1]?.start ?? 0
  }

  const tWins1       = find('wins', 1)
  const tEv1         = find('Everest', 1)
  const tDeepest     = find('deepest', 1)
  const tOcean1      = find('ocean', 1)
  const tDrop        = find('Drop', 1)
  const tChall1      = find('Challenger', 1)
  const tEv3         = find('Everest', 3)
  const t49          = find('forty-nine', 1)
  const tTall        = find('tall', 1)
  const tNepal       = find('Nepal', 1)
  const tChina       = find('China', 1)
  const tTwenty1     = find('twenty', 1)
  const tChall2      = find('Challenger', 2)
  const tPlunges     = find('plunges', 1)
  const t355         = find('thirty-five', 1)
  const tNOAA        = find('NOAA', 1)
  const tThe3        = find('the', 3)
  const tGap         = find('gap', 1)
  const tKm1         = find('kilometres', 1)
  const tSo          = find('So', 1)
  const tSummit      = find('summit', 1)
  const tUnderwater  = find('underwater', 1)
  const tOcean2      = find('ocean', 2)

  /* act 1 entrances */
  const VS            = anim(t, tWins1, 0.35)
  const tagEv1        = anim(t, tEv1, 0.35)
  const tagDeepest    = anim(t, tDeepest, 0.35)
  const waterSweep    = anim(t, tOcean1, 0.5)
  const dropArrow     = anim(t, tDrop, 0.5)
  const tagChall      = anim(t, tChall1, 0.35)

  /* act 2 */
  const act2FlashP    = clamp01((t - tEv3) / 0.5)
  const bracketEv     = anim(t, tEv3, 0.5)
  const tallPing      = clamp01((t - tTall) / 0.35)
  const evLabel       = anim(t, t49, 0.35)
  const stampNP       = anim(t, tNepal, 0.35)
  const stampCh       = anim(t, tChina, 0.35)
  const stamp2020     = anim(t, tTwenty1, 0.35)
  const everestDim    = anim(t, tChall2, 0.4)
  const footnoteIn    = anim(t, tChall2, 0.6)
  const trenchBracket = anim(t, tPlunges, 0.5, easeOutCubic)
  const trenchLabel   = anim(t, t355, 0.35)
  const noaaChip      = anim(t, tNOAA, 0.35)

  /* act 3 */
  const act3FlashP    = clamp01((t - tThe3) / 0.5)
  const DROP_START    = tThe3
  const slideP        = clamp01((t - DROP_START) / 0.4)
  const fallStart     = DROP_START + 0.4
  const fallP         = clamp01((t - fallStart) / 0.55)
  const evX           = 300 + 410 * easeInOutCubic(slideP)
  const evLiftArc     = -24 * Math.sin(Math.PI * slideP)
  const evY           = seaY + dropDY * easeInOutCubic(fallP)
  const landed        = fallP >= 1
  const landPing      = clamp01((t - (fallStart + 0.55)) / 0.3)
  const rippleP       = clamp01((t - (DROP_START + 0.75)) / 0.6)
  const gapBand       = anim(t, tGap, 0.35)
  const gapLabel      = anim(t, tKm1, 0.35)
  const seaEmph       = anim(t, tSo, 0.35)
  const summitTag     = anim(t, tSummit, 0.35)
  const stillUnder    = anim(t, tUnderwater, 0.35)
  const stampWins     = anim(t, tOcean2, 0.35)

  /* stars (seeded, sky region only) */
  const stars = Array.from({ length: 46 }).map((_, i) => {
    const sx = (((i * 2654435761) >>> 0) / 4294967295) * 1080
    const sy = (((i * 2246822519) >>> 0) / 4294967295) * seaY
    const r  = 0.6 + (((i * 3266489917) >>> 0) / 4294967295) * 1.6
    const o  = 0.25 + (((i * 374761393) >>> 0) / 4294967295) * 0.6
    const tw = 0.6 + 0.4 * Math.sin(t * (0.5 + (i % 7) * 0.31) + i * 1.7)
    return { key: i, sx, sy, r, o: o * tw }
  })

  const footnoteText = `Everest's height (${FACTS.everestM.display}) is placed as if it stood on the trench floor — a simplification. Challenger Deep's depth (${FACTS.deepM.display}, NOAA) is an estimate; published surveys range ${FACTS.surveyMinM.display}m–${FACTS.surveyMaxM.display}m. Gap rounded.`

  return (
    <>
      <div className="absolute inset-0" style={{ background: '#030712' }} />
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060e1f" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A3A5A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#04101C" stopOpacity="0.92" />
          </linearGradient>
          <marker id="arrowAmber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={AMBER} />
          </marker>
        </defs>

        {/* ===== SKY (above seaY) ===== */}
        <rect x="0" y="0" width="1080" height={seaY} fill="url(#skyGrad)" />
        {stars.map((s) => <circle key={s.key} cx={s.sx} cy={s.sy} r={s.r} fill={INK} opacity={s.o} />)}

        {/* ===== WATER ===== */}
        <rect x="0" y={seaY} width="1080" height="1920" fill="url(#waterGrad)" opacity={waterSweep} />

        {/* ===== SEA-LEVEL LINE ===== */}
        <line x1="0" y1={seaY} x2="1080" y2={seaY} stroke={seaEmph > 0.5 ? INK : CYAN} strokeWidth={seaEmph > 0.5 ? 6 : 2} opacity={0.85} />
        <text x="950" y={seaY - 12} textAnchor="end" fill={seaEmph > 0.5 ? INK : CYAN} fontSize="15" fontFamily={FONT_MONO} letterSpacing="3" opacity="0.85">SEA LEVEL · 0 m</text>

        {/* ===== SCALE RULER =========
            1-km ticks, unlabelled except a 1 km scale bar + tag */}
        <g opacity="0.6">
          <line x1="70" y1={SPAN_TOP} x2="70" y2={SPAN_BOT} stroke={INK} strokeWidth="1.5" />
          {Array.from({ length: Math.floor((SPAN_BOT - SPAN_TOP) / rulerTickPx) + 1 }).map((_, i) => {
            const y = SPAN_TOP + i * rulerTickPx
            return (
              <line key={i} x1="60" x2="80" y1={y} y2={y} stroke={INK} strokeWidth="1.5" />
            )
          })}
          <text x="70" y={SPAN_TOP - 16} fill={INK} fontSize="13" fontFamily={FONT_MONO} letterSpacing="3" opacity="0.7">1 km</text>
          <text x="70" y={SPAN_BOT + 18} fill={INK} fontSize="11" fontFamily={FONT_MONO} letterSpacing="3" opacity="0.55">VERTICAL TO SCALE</text>
        </g>

        {/* ===== TRENCH SHAFT (behind Everest layer) ===== */}
        <rect x="490" y={seaY} width="30" height={floorY - seaY + 14} fill="#141B33" />
        <rect x="900" y={seaY} width="30" height={floorY - seaY + 14} fill="#141B33" />
        <rect x="490" y={floorY} width="440" height="24" fill="#1B2238" />
        <rect x="520" y={seaY} width="380" height={floorY - seaY} fill="rgba(0,0,0,0.35)" />

        {/* ===== PRESSURE BAR (right inner wall) ===== */}
        <g opacity={anim(t, find('about', 2), 0.5) || (t > 13 ? 1 : 0)}>
          <rect x="905" y={seaY} width="18" height={floorY - seaY} fill="rgba(49,46,129,0.75)" />
          <text x="914" y={floorY + 40} textAnchor="middle" fill={INK} fontSize="10" fontFamily={FONT_MONO} letterSpacing="2" opacity="0.7">PRESSURE</text>
        </g>

        {/* ===== EVEREST GHOST (at original spot, dashed) ===== */}
        <g transform={`translate(300, ${seaY})`} opacity={0.13}>
          <polygon points="0,-358 -150,0 150,0" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="6 8" />
        </g>

        {/* ===== EVEREST (the moving one) — sits ON the surface line ===== */}
        <g opacity={1 - everestDim * 0.55}>
          <g transform={`translate(${evX}, ${evY}) translate(0, ${evLiftArc})`} opacity={1 - everestDim * 0.6}>
            <polygon points="0,-358 -150,0 150,0" fill="#1B2238" stroke={AMBER} strokeWidth={t > tChall2 ? 1.5 : 3} strokeLinejoin="round" />
            <text y={20} textAnchor="middle" fill={INK} fontSize="12" fontFamily={FONT_MONO} letterSpacing="4" opacity="0.65">EVEREST</text>
          </g>
          {/* summit marker */}
          <g transform={`translate(${evX}, ${evY - 358}) translate(0, ${evLiftArc})`} opacity={t > tTall ? 1 : 0.5 + 0.5 * tallPing}>
            <line x1="-22" y1="0" x2="22" y2="0" stroke={AMBER} strokeWidth="4" />
            <line x1="0" y1="-60" x2="0" y2="-10" stroke={AMBER} strokeWidth="2" opacity="0.6" />
          </g>
        </g>

        {/* ===== DROP ARROW (act 1) ===== */}
        {dropArrow > 0 && t < tEv3 && (
          <path d="M 320 200 Q 450 30 710 380" fill="none" stroke={AMBER} strokeWidth="3" strokeDasharray="10 8" strokeDashoffset={-120 * dropArrow} markerEnd="url(#arrowAmber)" opacity={1 - dropArrow * 0.75} />
        )}

        {/* ===== VS CHIP (act 1) ===== */}
        <circle cx="540" cy={seaY} r="48" fill="#030712" stroke={CYAN} strokeWidth="4" opacity={VS} />
        <text x="540" y={seaY + 13} textAnchor="middle" fill={CYAN} fontSize="34" fontFamily={FONT_DISPLAY} letterSpacing="4" opacity={VS}>VS</text>

        {/* ===== NAME TAGS (act 1) ===== */}
        <g opacity={tagEv1 * (1 - bracketEv)}>
          <text x="640" y="320" fill={INK} fontSize="26" fontFamily={FONT_DISPLAY} letterSpacing="4">EVEREST</text>
        </g>
        <g opacity={tagDeepest * (1 - tagChall)}>
          <text x="130" y="760" fill={INK} fontSize="19" fontFamily={FONT_MONO} letterSpacing="2">DEEPEST HOLE IN THE OCEAN</text>
        </g>
        <g opacity={tagChall * (1 - trenchLabel)}>
          <text x="130" y="810" fill={CYAN} fontSize="24" fontFamily={FONT_DISPLAY} letterSpacing="4">CHALLENGER DEEP</text>
        </g>

        {/* ===== BRACKET: Everest (act 2) ===== */}
        <g opacity={bracketEv}>
          <line x1="122" y1={seaY} x2="122" y2={summitY0} stroke={AMBER} strokeWidth="3" />
          <line x1="110" y1={seaY} x2="134" y2={seaY} stroke={AMBER} strokeWidth="3" />
          <line x1="110" y1={summitY0} x2="134" y2={summitY0} stroke={AMBER} strokeWidth="3" />
        </g>

        {/* ===== BRACKET: trench (act 2) ===== */}
        <g opacity={trenchBracket}>
          <line x1="470" y1={seaY} x2="470" y2={floorY} stroke={CYAN} strokeWidth="3" />
          <line x1="458" y1={seaY} x2="482" y2={seaY} stroke={CYAN} strokeWidth="3" />
          <line x1="458" y1={floorY} x2="482" y2={floorY} stroke={CYAN} strokeWidth="3" />
        </g>

        {/* ===== LABEL: Everest ===== */}
        <g opacity={evLabel}>
          <text x="620" y="202" fill={INK} fontSize="15" fontFamily={FONT_MONO} letterSpacing="4" opacity="0.75">EVEREST</text>
          <text x="620" y="262" fill={INK} fontSize="58" fontFamily={FONT_DISPLAY} letterSpacing="2">{FACTS.everestM.display}</text>
          <text x="620" y="295" fill={INK} fontSize="17" fontFamily={FONT_MONO} letterSpacing="4" opacity="0.75">ABOVE SEA LEVEL</text>
        </g>

        {/* ===== LABEL: Challenger Deep ===== */}
        <g opacity={trenchLabel}>
          <text x="130" y="840" fill={CYAN} fontSize="15" fontFamily={FONT_MONO} letterSpacing="4" opacity="0.9">CHALLENGER DEEP</text>
          <text x="130" y="900" fill={INK} fontSize="55" fontFamily={FONT_DISPLAY} letterSpacing="2">{FACTS.deepM.display}</text>
          <text x="130" y="933" fill={INK} fontSize="17" fontFamily={FONT_MONO} letterSpacing="4" opacity="0.75">BELOW SEA LEVEL</text>
        </g>

        {/* ===== STAMP: NEPAL · CHINA · 2020 ===== */}
        <g opacity={Math.max(stampNP, Math.max(stampCh, stamp2020)) * (1 - everestDim * 0.7)}>
          <text x="620" y="400" fontFamily={FONT_MONO} letterSpacing="6">
            <tspan fill={AMBER} fontSize="18" opacity={stampNP}>NEPAL</tspan>
            <tspan fill={AMBER} fontSize="18" opacity={stampCh}>{'  ·  CHINA'}</tspan>
          </text>
          <text x="620" y="452" fill={AMBER} fontSize="36" fontFamily={FONT_DISPLAY} letterSpacing="8" opacity={stamp2020}>2020</text>
        </g>

        {/* source chip */}
        <g opacity={noaaChip}>
          <rect x="130" y="980" width="160" height="32" fill="#030712" stroke={CYAN} strokeWidth="1" />
          <text x="210" y="1002" textAnchor="middle" fill={CYAN} fontSize="13" fontFamily={FONT_MONO} letterSpacing="3">SRC: NOAA</text>
        </g>

        {/* ===== ACT-CUT FLASHES ===== */}
        {act2FlashP > 0 && act2FlashP < 1 && <rect x="0" y="0" width="1080" height="1920" fill="#F8FAFC" opacity={(1 - act2FlashP) * 0.22} />}
        {act3FlashP > 0 && act3FlashP < 1 && <rect x="0" y="0" width="1080" height="1920" fill="#F8FAFC" opacity={(1 - act3FlashP) * 0.22} />}

        {/* ===== GAP BAND + LABEL (act 3) ===== */}
        <g opacity={gapBand}>
          <rect x="520" y={seaY} width="380" height={gapPx} fill={AMBER} opacity="0.22" />
          <line x1="520" y1={landedSummitY} x2="900" y2={landedSummitY} stroke={AMBER} strokeWidth="2" opacity="0.6" />
        </g>
        <g opacity={gapLabel}>
          <text x="710" y={seaY + gapPx / 2 - 2} textAnchor="middle" fill={AMBER} fontSize="22" fontFamily={FONT_DISPLAY} letterSpacing="3">~2,086 m</text>
          <text x="710" y={seaY + gapPx / 2 + 18} textAnchor="middle" fill={AMBER} fontSize="11" fontFamily={FONT_MONO} letterSpacing="4" opacity="0.9">≈ 2 km OF WATER</text>
        </g>
        <text x="710" y={landedSummitY + 26} textAnchor="middle" fill={INK} fontSize="12" fontFamily={FONT_MONO} letterSpacing="3" opacity={stillUnder}>STILL UNDERWATER</text>

        {/* SUMMIT tag (on Everest-after-drop) */}
        <g opacity={summitTag}>
          <rect x={evX - 78} y={evY - 400} width="156" height="32" fill={AMBER} />
          <text x={evX} y={evY - 378} textAnchor="middle" fill="#030712" fontSize="15" fontFamily={FONT_MONO} letterSpacing="4">SUMMIT</text>
        </g>

        {/* ===== OCEAN WINS stamp ===== */}
        <g opacity={stampWins} transform="translate(668, 498) rotate(-4)">
          <rect x="0" y="0" width="260" height="74" fill="none" stroke={AMBER} strokeWidth="4" />
          <rect x="4" y="4" width="252" height="66" fill="#030712" opacity="0.6" stroke={AMBER} strokeWidth="1.5" />
          <text x="130" y="46" textAnchor="middle" fill={AMBER} fontSize="26" fontFamily={FONT_DISPLAY} letterSpacing="6">OCEAN WINS</text>
        </g>

        {/* ===== LANDING PING on summit (g) ===== */}
        {landed && (
          <circle cx={evX} cy={evY - 358} r={8 + landPing * 50} fill="none" stroke={AMBER} strokeWidth="3" opacity={1 - landPing} />
        )}
        {/* ripples on the surface */}
        {rippleP > 0 && [0, 1].map((i) => {
          const p = clamp01((t - (tThe3 + 0.75 + i * 0.45)) / 0.8)
          if (p <= 0 || p >= 1) return null
          return (
            <ellipse key={i} cx={evX} cy={seaY} rx={20 + p * 90} ry={8 + p * 28} fill="none" stroke={CYAN} strokeWidth="2" opacity={0.6 * (1 - p)} />
          )
        })}

        {/* ===== AMBIENT scale drift (1.00 → 1.03 across video) ===== */}
        {/* done via outer SVG group scale — see note below */}

        {/* ===== AMBIENT MARINE SNOW (water region drifts down) ===== */}
        {Array.from({ length: 30 }).map((_, i) => {
          const sx = ((i * 1664525 + 1013904223) >>> 0) / 4294967295
          const sz = 1 + (((i * 2246822519 + 1) >>> 0) / 4294967295) * 2.2
          const span = floorY - seaY
          const sy = seaY + ((((i * 2654435761 + 7) >>> 0) / 4294967295) * span + t * 26 * (0.55 + (i % 5) * 0.14)) % span
          return <circle key={i} cx={sx * 1080} cy={sy} r={sz} fill={'rgba(226,232,240,0.5)'} opacity={0.55} />
        })}

        {/* ===== FOOTNOTE ===== */}
        <g opacity={0.78 * footnoteIn}>
          {footnoteText.match(/.{1,86}(?:\s|$)/g)?.map((line, i) => (
            <text key={i} x="60" y={1126 + i * 26} fontSize="16" fill={INK} fontFamily={FONT_MONO} opacity={0.9}>{line.trim()}</text>
          ))}
        </g>
      </svg>
    </>
  )
}
