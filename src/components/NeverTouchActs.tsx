/* ==================================================================
   NEVER TOUCH — "You have never touched anything in your life"
   science/everyday series · dark editorial vector · cyan + violet
   SVG/JSX only · voice-driven from public/audio/never-touch/metadata.json
   ================================================================== */

import { CuriosityStickman } from '@shared-assets/brand/CuriosityStickman'
import { clamp01, easeInOutCubic, backOut, anim } from '../motion/anim'

/* ---------- metadata types ---------- */
interface Word { w: string; start: number; end: number }
interface Act { id: string; index: number; label: string; words: Word[] }
export interface Metadata { title: string; totalDuration: number; words: Word[]; actBreakdown: Act[] }

export interface NeverTouchActsProps { t: number; actIndex: number; meta: Metadata | null }

/* ---------- deterministic helpers ---------- */
const TAU = Math.PI * 2

/** zigzag path down a vertical band — pure function of seed */
const zigzag = (x0: number, y0: number, y1: number, amp: number, segments: number, seed: number) => {
  let d = `M ${x0} ${y0}`
  let rand = seed >>> 0
  const rn = () => {
    rand ^= rand << 13; rand ^= rand >>> 17; rand ^= rand << 5
    return ((rand >>> 0) % 1000) / 1000
  }
  const step = (y1 - y0) / segments
  for (let i = 1; i <= segments; i++) {
    const x = x0 + (rn() - 0.5) * 2 * amp
    d += ` L ${x.toFixed(1)} ${(y0 + i * step).toFixed(1)}`
  }
  return d
}
const ZZ_LEFT = zigzag(770, 60, 1560, 18, 26, 1337)
const ZZ_RIGHT = zigzag(830, 60, 1560, 18, 26, 9001)

const FONT_MONO = "ui-monospace, 'Cascadia Mono', Consolas, monospace"
const FONT_DISPLAY = "Anton, Impact, sans-serif"

/* ================================================================ */
export default function NeverTouchActs({ t, actIndex, meta }: NeverTouchActsProps) {
  const words = meta?.words ?? []

  const find = (name: string, occ = 1) => {
    const hits = words.filter((w) => w.w.toLowerCase() === name.toLowerCase())
    return hits[occ - 1]?.start ?? 0
  }
  const tTouched = find('touched', 1)          // 3.772
  const tAtoms = find('Atoms', 1)              // 6.551
  const tEmpty = find('empty', 1)              // 7.466
  const tPress = find('presses', 1)            // 9.632
  const tPush = find('push', 1)                // 11.897
  const tEM = find('electromagnetic', 1)       // 13.181
  const tPauli = find('Pauli', 1)              // 14.877
  const tIdentical = find('Identical', 1)      // 17.042
  const tRepel = find('repel', 1)              // 18.415
  const tHovering = find('hovering', 1)        // 23.594

  /* anchors */
  const a1Start = meta?.actBreakdown?.[0]?.words?.[0]?.start ?? 0.1
  const a2Start = meta?.actBreakdown?.[1]?.words?.[0]?.start ?? 6.55
  const a3Start = meta?.actBreakdown?.[2]?.words?.[0]?.start ?? 17.04

  /* ---------- ACT 1 — THE HOOK ---------- */
  const handStart = a1Start + 0.35
  const handTravelEnd = tTouched - 0.15
  const handP = clamp01((t - handStart) / (handTravelEnd - handStart))
  const handEase = easeInOutCubic(handP)
  const handX = 210 + handEase * 470           // 210 → 680
  const handBob = Math.sin(t * 2.1) * 6 * (1 - handEase)
  const barrierOn = t >= tTouched
  const barrierP = anim(t, tTouched, 0.18)
  const sparkP = clamp01((t - tTouched) / 0.6)  // spark flash 0..1
  const recoilP = anim(t, tTouched + 0.05, 0.45, easeInOutCubic)
  const recoilX = -60 * recoilP
  const glowPulse = barrierOn ? 0.55 + 0.45 * Math.sin(t * 9 - 1.2) : 0
  const hookWordP = [anim(t, a1Start, 0.36), anim(t, a1Start + 0.22, 0.36), anim(t, a1Start + 0.44, 0.36, backOut)]

  /* ---------- ACT 2 — THE SCIENCE ---------- */
  const zoomP = easeInOutCubic(clamp01((t - tAtoms) / 1.1))
  const atomEnter = easeInOutCubic(anim(t, tAtoms + 0.2, 0.9))
  const electronOrbit = t
  // after "presses a wall", the electron clouds pulse hot and the repulsion fires
  const pressP = clamp01((t - tPress) / 1.4)
  const cloudPulse = pressP > 0 && pressP < 1 ? 1 + 0.06 * Math.sin(t * 14) : 1
  const cloudRepel = anim(t, tPush, 0.3)
  const arcP = anim(t, tPush + 0.15, 0.22)
  const emLabelP = anim(t, tEM, 0.4)
  const pauliLabelP = anim(t, tPauli, 0.4)
  const camScale2 = 1 + 0.045 * zoomP
  const flashP = clamp01((t - tPush) / 0.5)     // brief full-screen white flash
  const emptyStencilP = anim(t, tEmpty + 0.3, 0.5)

  /* ---------- ACT 3 — THE PAYOFF ---------- */
  const payoffIn = anim(t, a3Start, 0.4)
  const chargesP = anim(t, tIdentical, 0.34)
  const repelP = anim(t, tRepel, 0.4)
  const hoverWordP = anim(t, tHovering, 0.4, backOut)
  const energyWave = t
  const mouthPulse = 0.65 + 0.35 * Math.abs(Math.sin(t * 2.6))

  const camScale = (() => {
    if (actIndex === 0) {
      const p = clamp01((t - a1Start) / (a2Start - a1Start))
      return 1 + 0.035 * easeInOutCubic(p)
    }
    if (actIndex === 1) return camScale2
    const p = clamp01((t - a3Start) / Math.max(0.1, (meta?.totalDuration ?? 26) - a3Start))
    return 1.06 - 0.06 * easeInOutCubic(p)
  })()

  return (
    <>
      {/* starfield backdrop + dot grid */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(720px 900px at 68% 40%, rgba(34,211,238,0.055), transparent 62%), radial-gradient(600px 700px at 22% 78%, rgba(167,139,250,0.07), transparent 60%), #030712' }} />
      <svg className="absolute inset-0" width="1080" height="1920" viewBox="0 0 1080 1920" aria-hidden>
        {Array.from({ length: 60 }).map((_, i) => {
          const rx = ((i * 2654435761) >>> 0) / 4294967295
          const ry = ((i * 2246822519) >>> 0) / 4294967295
          const rr = 0.6 + (((i * 3266489917) >>> 0) / 4294967295) * 1.5
          const o = 0.15 + (((i * 374761393) >>> 0) / 4294967295) * 0.5
          const tw = 0.55 + 0.45 * Math.sin(t * (0.6 + (i % 5) * 0.33) + i * 1.7)
          return <circle key={i} cx={rx * 1080} cy={ry * 1560} r={rr} fill="#e8edff" opacity={o * tw} />
        })}
      </svg>

      <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="1" />
            <stop offset="35%" stopColor="#a78bfa" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <filter id="neonCyan" x="-80%" y="-30%" width="260%" height="160%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="neonViolet" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g transform={`translate(540,960) scale(${camScale}) translate(-540,-960)`}>

          {/* ========= ACT 1 — THE HOOK ========= */}
          {actIndex === 0 && (
            <>
              {/* giant type — three stacked lines */}
              <g fontFamily={FONT_DISPLAY} fontWeight={400}>
                <text x="70" y="430" fontSize="118" fill="#F8FAFC" opacity={hookWordP[0]} transform={`translate(${-60 * (1 - hookWordP[0])},0)`} letterSpacing={2}>YOU HAVE</text>
                <text x="70" y="552" fontSize="150" fill="#22D3EE" opacity={hookWordP[1]} transform={`translate(${-60 * (1 - hookWordP[1])},0)`} letterSpacing={2} filter="url(#neonCyan)">NEVER.</text>
              </g>

              {/* wall on the right — flat vector bricks */}
              <g>
                <rect x="820" y="0" width="260" height="1560" fill="#0F1B33" />
                <rect x="820" y="0" width="10" height="1560" fill="#1E2D4F" />
                {/* mortar lines + bricks */}
                {Array.from({ length: 14 }).map((_, i) => {
                  const y = 60 + i * 112
                  return (
                    <g key={i}>
                      <rect x="820" y={y} width="260" height="4" fill="#0a1120" />
                      {[0, 1, 2].map((j) => {
                        const off = i % 2 === 0 ? 0 : 44
                        const x = 830 + j * 88 + off
                        return <rect key={j} x={x} y={y + 6} width="80" height="100" fill="#142142" stroke="#0a1120" strokeWidth="2" />
                      })}
                    </g>
                  )
                })}
                {/* cyan rim light facing the hand */}
                <rect x="820" y="0" width="6" height="1560" fill="#22D3EE" opacity={barrierOn ? 0.5 + glowPulse * 0.5 : 0} />
              </g>

              {/* telemetry readout */}
              <text x="70" y="700" fontSize="19" fill="#475569" fontFamily={FONT_MONO} letterSpacing="3" opacity={anim(t, a1Start + 0.5, 0.4)}>
                // QUERY: have you ever touched something?
              </text>
              <text x="70" y="726" fontSize="19" fill={barrierOn ? '#22D3EE' : '#475569'} fontFamily={FONT_MONO} letterSpacing="3" opacity={anim(t, a1Start + 0.65, 0.4)}>
                {barrierOn ? '// RESULT: REPULSION. ∞ N' : '// RESULT: 0.0000 m FROM SURFACE'}
              </text>

              {/* hand reaching in — cartoon glove, whiteboard style */}
              <g transform={`translate(${handX + recoilX}, 940) rotate(${-8 * handEase}) translate(0, ${handBob})`} opacity={anim(t, handStart - 0.1, 0.3)}>
                {/* motion streaks */}
                {[0, 1, 2].map((i) => (
                  <line key={i} x1={-150 - i * 34} y1={-18 + i * 18} x2={-95 - i * 30} y2={-18 + i * 18}
                    stroke="#F8FAFC" strokeWidth={5 - i} opacity={0.35 - i * 0.12} strokeLinecap="round" />
                ))}
                {/* arm */}
                <rect x="-190" y="-26" width="110" height="52" rx="26" fill="#CBD5E1" stroke="#0F172A" strokeWidth="5" />
                {/* palm */}
                <path d="M -80 -40 L 20 -40 Q 66 -40 66 0 Q 66 40 20 40 L -80 40 Q -96 16 -96 0 Q -96 -16 -80 -40 Z"
                  fill="#F1F5F9" stroke="#0F172A" strokeWidth="6" strokeLinejoin="round" />
                {/* fingers — 4 capsules pointing right */}
                {[[0, -24, 52], [10, -8, 66], [10, 8, 60], [0, 24, 46]].map(([fx, fy, fl], i) => (
                  <rect key={i} x={60 + fx * 0.2} y={fy - 11} width={fl} height={22} rx={11}
                    fill="#F1F5F9" stroke="#0F172A" strokeWidth="5" transform={`rotate(${i === 1 ? -6 : i === 2 ? 6 : 0}, 60, ${fy})`} />
                ))}
                {/* thumb */}
                <rect x="18" y="30" width="64" height="22" rx="11" fill="#F1F5F9" stroke="#0F172A" strokeWidth="5" transform="rotate(32, 18, 30)" />
              </g>

              {/* barrier barrier + spark */}
              {barrierOn && (
                <g opacity={barrierP} filter="url(#neonCyan)">
                  <path d={ZZ_LEFT} stroke="#22D3EE" strokeWidth="7" fill="none" opacity={0.9} />
                  <path d={ZZ_RIGHT} stroke="#67E8F9" strokeWidth="4" fill="none" opacity={0.8} />
                  <rect x="770" y="60" width="60" height="1500" fill="#22D3EE" opacity={0.10 + glowPulse * 0.14} />
                </g>
              )}
              {/* spark burst at contact point */}
              {sparkP > 0 && sparkP < 1 && (
                <g transform="translate(770, 940)" opacity={1 - sparkP}>
                  {Array.from({ length: 10 }).map((_, i) => {
                    const ang = (i / 10) * TAU + 0.3
                    const len = 30 + sparkP * 120 * (i % 3 === 0 ? 1.5 : 1)
                    return (
                      <line key={i} x1={Math.cos(ang) * 14} y1={Math.sin(ang) * 14}
                        x2={Math.cos(ang) * len} y2={Math.sin(ang) * len}
                        stroke={i % 3 === 0 ? '#FDE047' : '#22D3EE'} strokeWidth={i % 3 === 0 ? 6 : 4} strokeLinecap="round" />
                    )
                  })}
                </g>
              )}
            </>
          )}

          {/* ========= ACT 2 — THE SCIENCE ========= */}
          {actIndex === 1 && (
            <>
              {/* "99.999% EMPTY" stencil */}
              <text x="540" y="330" textAnchor="middle" fontSize="30" fill="#94a3b8" fontFamily={FONT_MONO} letterSpacing="14" opacity={emptyStencilP}>
                MATTER IS ~99.999% EMPTY SPACE
              </text>

              {/* two atoms entering from off-screen, facing each other */}
              {([
                { cx: 280, cy: 720, key: 'hand', label: 'HAND ATOM', labelY: 1160, off: -460 },
                { cx: 800, cy: 720, key: 'wall', label: 'WALL ATOM', labelY: 1160, off: 460 },
              ]).map((atom) => (
                <g key={atom.key} opacity={atomEnter} transform={`translate(${(1 - atomEnter) * atom.off}, 0)`}>
                  {/* shells */}
                  {[215, 135].map((r, i) => (
                    <circle key={i} cx={atom.cx} cy={atom.cy} r={r * cloudPulse} fill="none" stroke={pressP > 0 ? '#67E8F9' : '#22D3EE'} strokeWidth={2.5} strokeDasharray="8 10" opacity={pressP > 0 ? 0.85 : 0.55} />
                  ))}
                  {/* nucleus */}
                  <circle cx={atom.cx} cy={atom.cy} r={62} fill="url(#coreGlow)" />
                  <circle cx={atom.cx} cy={atom.cy} r={36} fill="#A78BFA" stroke="#7C3AED" strokeWidth={3} />
                  {/* electrons orbiting — deterministic */}
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const ring = (i < 2 ? 215 : 135) * cloudPulse
                    const speed = i < 2 ? 0.9 : 1.4
                    const ang = electronOrbit * speed + (i * TAU) / (i < 2 ? 2 : 4)
                    return (
                      <circle key={i} cx={atom.cx + Math.cos(ang) * ring} cy={atom.cy + Math.sin(ang) * ring}
                        r={14} fill="#22D3EE" stroke="#0E7490" strokeWidth={2} />
                    )
                  })}
                  <text x={atom.cx} y={atom.labelY} textAnchor="middle" fontSize="20" fill="#64748b" fontFamily={FONT_MONO} letterSpacing="6">{atom.label}</text>
                </g>
              ))}

              {/* the violent repulsion arc between the electron clouds */}
              {arcP > 0 && (
                <g opacity={arcP} filter="url(#neonViolet)">
                  <path d="M 480 760 L 505 700 L 530 800 L 552 715 L 575 805 L 600 720 L 620 760" stroke="#C4B5FD" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                  <path d="M 480 760 L 512 742 L 540 782 L 572 738 L 600 780 L 630 748" stroke="#8B5CF6" strokeWidth="4" fill="none" opacity="0.85" />
                </g>
              )}
              {/* brief full-screen flash on the push */}
              {flashP > 0 && flashP < 1 && (
                <rect x="0" y="0" width="1080" height="1920" fill="#EDE9FE" opacity={(1 - flashP) * 0.22} />
              )}
              {/* force arrows pushing apart — pointing AWAY from each atom */}
              {cloudRepel > 0.01 && (
                <g opacity={cloudRepel}>
                  <line x1={240 - cloudRepel * 30} y1="720" x2={100 - cloudRepel * 30} y2="720" stroke="#22D3EE" strokeWidth="7" strokeLinecap="round" />
                  <polygon points={`${78 - cloudRepel * 30},720 ${110 - cloudRepel * 30},704 ${110 - cloudRepel * 30},736`} fill="#22D3EE" />
                  <line x1={840 + cloudRepel * 30} y1="720" x2={980 + cloudRepel * 30} y2="720" stroke="#22D3EE" strokeWidth="7" strokeLinecap="round" />
                  <polygon points={`${1002 + cloudRepel * 30},720 ${970 + cloudRepel * 30},704 ${970 + cloudRepel * 30},736`} fill="#22D3EE" />
                </g>
              )}

              {/* force labels */}
              <text x="540" y="1280" textAnchor="middle" fontSize="34" fill="#A78BFA" fontFamily={FONT_MONO} fontWeight={700} letterSpacing="4" opacity={emLabelP} filter="url(#neonViolet)">
                ELECTROMAGNETIC REPULSION
              </text>
              <text x="540" y="1336" textAnchor="middle" fontSize="34" fill="#67E8F9" fontFamily={FONT_MONO} fontWeight={700} letterSpacing="4" opacity={pauliLabelP} filter="url(#neonCyan)">
                PAULI EXCLUSION PRINCIPLE
              </text>
              <text x="540" y="1395" textAnchor="middle" fontSize="15" fill="#475569" fontFamily={FONT_MONO} letterSpacing="3" opacity={pauliLabelP}>
                // both laws refuse to let the atoms overlap
              </text>
            </>
          )}

          {/* ========= ACT 3 — THE PAYOFF ========= */}
          {actIndex === 2 && (
            <>
              {/* wavy "energy field" lines under the stickman */}
              {[0, 1].map((i) => {
                const yBase = 880 + i * 78
                const amp = 15 - i * 6
                const phase = energyWave * (1.2 + i * 0.5)
                let d = `M 60 ${yBase}`
                for (let x = 60; x <= 1020; x += 24) {
                  d += ` L ${x} ${(yBase + Math.sin((x / 1080) * TAU * 3 + phase) * amp).toFixed(1)}`
                }
                return <path key={i} d={d} fill="none" stroke={i === 0 ? '#22D3EE' : '#A78BFA'} strokeWidth={i === 0 ? 6 : 4} opacity={0.55 - i * 0.2} strokeLinecap="round" />
              })}

              {/* stickman — looking down at hovering hands, bigger to anchor the frame */}
              <svg x={255} y={118} width={570} height={798} viewBox="0 0 400 560" opacity={payoffIn}>
                <CuriosityStickman
                  pose={{
                    headTilt: 14,
                    torsoLean: -6,
                    leftShoulder: 55,
                    rightShoulder: -55,
                    leftElbow: -18,
                    rightElbow: 18,
                    leftHip: 8,
                    rightHip: -8,
                    leftKnee: 4,
                    rightKnee: 4,
                    mouthOpen: mouthPulse,
                  }}
                />
              </svg>
              {/* staggered payoff text — stacked tight under the waves */}
              <text x="540" y="1082" textAnchor="middle" fontSize="22" fill="#94a3b8" fontFamily={FONT_MONO} letterSpacing="6" opacity={chargesP}>
                IDENTICAL NEGATIVE CHARGES
              </text>
              <text x="540" y="1130" textAnchor="middle" fontSize="26" fill="#e8edff" fontFamily={FONT_MONO} letterSpacing="6" opacity={repelP}>
                CANNOT MEET. EVER.
              </text>

              <text x="540" y="1310" textAnchor="middle" fontSize="164" fill="#22D3EE" fontFamily={FONT_DISPLAY} letterSpacing={4}
                opacity={hoverWordP} transform={`translate(0, ${26 * (1 - hoverWordP)})`} filter="url(#neonCyan)">
                HOVERING.
              </text>
              <text x="540" y="1375" textAnchor="middle" fontSize="19" fill="#A78BFA" fontFamily={FONT_MONO} letterSpacing="4" opacity={anim(t, tHovering + 0.5, 0.4)}>
                ON A MICROSCOPIC CUSHION OF ENERGY
              </text>
            </>
          )}
        </g>
      </svg>
    </>
  )
}
