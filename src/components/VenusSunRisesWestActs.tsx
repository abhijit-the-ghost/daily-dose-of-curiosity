/* ==================================================================
   WHY THE SUN RISES IN THE WEST ON VENUS
   cosmic series • amber • contradiction-first • endCard false

   Continuous, deterministic SVG world. Every beat time is read from
   episodes/venus-sun-rises-west/scene.json, whose `at` values are exact
   WordBoundary starts from public/audio/venus-sun-rises-west/metadata.json.
   Pure function of t: no Math.random, no setInterval, no CSS infinite,
   no self-clocked animation library. Every displayed number resolves
   from episodes/venus-sun-rises-west/facts.ts.
   ================================================================== */

import { anim, backOut, clamp01, easeInOutCubic, easeOutCubic } from '../motion/anim'
import { FACTS, type FactKey } from '../../episodes/venus-sun-rises-west/facts'
import scene from '../../episodes/venus-sun-rises-west/scene.json'

interface Word { w: string; start: number; end: number }
interface Act { id: string; index: number; label: string; words: Word[] }
export interface Metadata { title: string; totalDuration: number; words: Word[]; actBreakdown: Act[] }
interface Props { t: number; actIndex: number; meta: Metadata | null }

type Beat = {
  at: number
  kind: string
  text?: string
  scale?: number
  to?: [number, number]
  id?: string
  factKeys?: string[]
  suffix?: string
  dur?: number
  ground?: string
}

const BEATS = scene.beats as Beat[]
const P = scene.palette
const FONT_MONO = "ui-monospace, 'Cascadia Mono', Consolas, monospace"
const FONT_DISPLAY = 'Anton, Impact, sans-serif'
const INK = P.ink
const AMBER = P.primary
const COOL = P.secondary

const pick = (pred: (b: Beat) => boolean) => BEATS.find(pred)?.at ?? 0
const T = {
  first: BEATS[0]?.at ?? 0,
  camHero: pick((b) => b.kind === 'camera' && b.scale === 1.6),
  dayStretch: pick((b) => b.id === 'day-stretch'),
  chipOrbit: pick((b) => b.kind === 'chip' && b.text === 'ORBIT SAME WAY'),
  orbitLanes: pick((b) => b.id === 'orbit-lane-pair'),
  camPull: pick((b) => b.kind === 'camera' && b.scale === 1.15),
  matchArrows: pick((b) => b.id === 'matching-orbit-arrows'),
  spinPair: pick((b) => b.id === 'spin-direction-pair'),
  chipSpinBackward: pick((b) => b.kind === 'chip' && b.text === 'SPIN BACKWARD'),
  cool: pick((b) => b.kind === 'palette' && b.ground === 'secondary'),
  chipUpright: pick((b) => b.kind === 'chip' && b.text === 'UPRIGHT TOP'),
  axisUpright: pick((b) => b.id === 'axis-upright'),
  axisFlip: pick((b) => b.id === 'axis-flip'),
  chipTilt: pick((b) => b.kind === 'chip' && b.text === 'FACT:obliquityDeg'),
  camAxis: pick((b) => b.kind === 'camera' && b.scale === 1.45),
  warm: pick((b) => b.kind === 'palette' && b.ground === 'primary'),
  chipTwoForces: pick((b) => b.kind === 'chip' && b.text === 'TWO FORCES'),
  impactField: pick((b) => b.id === 'impact-field'),
  offCenterHit: pick((b) => b.id === 'off-center-hit'),
  chipLikely: pick((b) => b.kind === 'chip' && b.text === 'LIKELY IMPACT'),
  spinRecoil: pick((b) => b.id === 'spin-recoil'),
  question: scene.question?.questionAt ?? pick((b) => b.kind === 'question'),
  tidal: pick((b) => b.id === 'tidal-vectors'),
  atmosphere: pick((b) => b.id === 'atmosphere-shell'),
  chipBrake: pick((b) => b.kind === 'chip' && b.text === 'TIDAL BRAKE'),
  camBrake: pick((b) => b.kind === 'camera' && b.scale === 0.92),
  chipSpinVsYear: pick((b) => b.kind === 'chip' && b.text === 'SPIN VS YEAR'),
  twoClocks: pick((b) => b.id === 'two-clocks'),
  counter: pick((b) => b.kind === 'counter'),
  yearLane: pick((b) => b.id === 'year-lane'),
  crosshair: pick((b) => b.id === 'proof-crosshair'),
  chipVerdict: pick((b) => b.kind === 'chip' && b.text === 'SPIN BEATS YEAR'),
  horizonReturn: pick((b) => b.id === 'west-horizon-return'),
  voidGround: pick((b) => b.kind === 'palette' && b.ground === 'ground'),
  chipSunset: pick((b) => b.kind === 'chip' && b.text === 'FACT:sunsetApproxDays'),
  eastSet: pick((b) => b.id === 'sun-east-set'),
  camReset: pick((b) => b.kind === 'camera' && b.scale === 1.0),
} as const

const CAMERA_BEATS = BEATS.filter((b) => b.kind === 'camera')
const CLAIM_BEATS = BEATS.filter((b) => b.kind === 'chip' || b.kind === 'question')
const COUNTER_BEAT = BEATS.find((b) => b.kind === 'counter')
const PROOF_KEYS = (COUNTER_BEAT?.factKeys ?? ['spinDays', 'orbitDays']) as FactKey[]
const PROOF_SUFFIX = COUNTER_BEAT?.suffix ?? 'EARTH DAYS'

/* Seeded star field — deterministic, no Math.random(). */
const hash01 = (i: number) => {
  let x = (i * 2654435761) >>> 0
  x ^= x >>> 16
  x = Math.imul(x, 2246822519) >>> 0
  x ^= x >>> 13
  return (x >>> 0) / 4294967296
}
const STARS = Array.from({ length: 92 }, (_, i) => ({
  x: hash01(i * 3 + 1) * 1080,
  y: hash01(i * 3 + 2) * 1700,
  r: 0.45 + hash01(i * 3 + 3) * 2.1,
  tw: 1.1 + hash01(i * 7 + 9) * 2.6,
  ph: hash01(i * 11 + 5) * Math.PI * 2,
}))

/** Appear over `inDur`, hold, then leave over `outDur`. Both ends are pure t. */
const windowed = (t: number, from: number, to: number, inDur = 0.4, outDur = 0.35) =>
  anim(t, from, inDur, easeOutCubic) * (1 - anim(t, to, outDur, easeInOutCubic))

function VenusGlobe({
  x, y, r, spin, axisDeg, arrowProgress, sweepDeg, glow = 0.34, cool = false,
}: {
  x: number; y: number; r: number; spin: number; axisDeg: number
  arrowProgress: number; sweepDeg: number; glow?: number; cool?: boolean
}) {
  const id = `${Math.round(x)}-${Math.round(y)}-${Math.round(r)}-${cool ? 'c' : 'v'}`
  const hi = cool ? '#DBEAFE' : '#FDE68A'
  const mid = cool ? COOL : AMBER
  const lo = cool ? '#1E3A8A' : '#7C2D12'
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={r * 1.5} fill={mid} opacity={glow * 0.35} />
      <defs>
        <radialGradient id={`body-${id}`} cx="34%" cy="30%" r="70%">
          <stop offset="0%" stopColor={hi} />
          <stop offset="46%" stopColor={mid} />
          <stop offset="100%" stopColor={lo} />
        </radialGradient>
        <clipPath id={`clip-${id}`}><circle r={r} /></clipPath>
      </defs>
      <g transform={`rotate(${axisDeg.toFixed(2)})`}>
        <circle r={r} fill={`url(#body-${id})`} />
        <g clipPath={`url(#clip-${id})`}>
          <ellipse cx={-r * 0.18} cy={-r * 0.2} rx={r * 1.05} ry={r * 0.5} fill="rgba(255,255,255,0.10)" />
          {/* cloud bands travel with the spin — the sunlit surface moves, not a static texture */}
          {[-0.52, -0.26, 0, 0.27, 0.52].map((by, i) => {
            const bandTravel = Math.sin(spin * 0.55 + i * 1.3) * r * 0.32
            return (
              <g key={i} transform={`translate(${bandTravel.toFixed(2)},0)`}>
                <ellipse
                  cx={0}
                  cy={by * r}
                  rx={r * (1.32 - Math.abs(by) * 0.2)}
                  ry={r * 0.075}
                  fill={i % 2 === 0 ? 'rgba(255,255,255,0.13)' : 'rgba(2,6,23,0.13)'}
                />
              </g>
            )
          })}
          <ellipse cx={r * 0.2} cy={r * 0.36} rx={r * 0.9} ry={r * 0.42} fill="rgba(2,6,23,0.12)" />
        </g>
        {/* sunlight terminator: rotates with the planet, so the frame always changes */}
        <g clipPath={`url(#clip-${id})`} transform={`rotate(${sweepDeg.toFixed(2)})`}>
          <path
            d={`M 0 0 L 0 ${-r * 1.5} A ${r * 1.5} ${r * 1.5} 0 0 1 ${r * 1.2} ${-r * 0.9} Z`}
            fill="url(#venus-terminator)"
          />
        </g>
        <circle r={r} fill="none" stroke={hi} strokeWidth="2.5" opacity="0.55" />
      </g>

      {/* clockwise spin arrow, drawn on from frame 1 */}
      <g opacity={arrowProgress}>
        <path
          d={`M ${-r * 1.12} ${-r * 0.35} A ${r * 1.18} ${r * 1.18} 0 1 1 ${-r * 0.72} ${r * 0.92}`}
          fill="none"
          stroke={mid}
          strokeWidth={Math.max(5, r * 0.035)}
          strokeLinecap="round"
          markerEnd="url(#venus-arrow-head)"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 * (1 - clamp01(arrowProgress))}
        />
      </g>
    </g>
  )
}

export default function VenusSunRisesWestActs({ t, meta }: Props) {
  const end = meta?.totalDuration ?? 66.398
  /* Snap only the last ~2 frames so the cut lands on the frame-1 pose. */
  const stageT = t >= end - 0.08 ? 0 : t
  const ambient = 1 + 0.025 * Math.sin(Math.PI * clamp01(t / end))

  /* Sequential camera beats: each target eases in over 0.8 s. */
  let camScale = 1
  let focusY = 0.5
  for (const b of CAMERA_BEATS) {
    const p = anim(t, b.at, 0.8, easeInOutCubic)
    camScale += ((b.scale ?? 1) - camScale) * p
    focusY += ((b.to?.[1] ?? 0.5) - focusY) * p
  }
  camScale *= ambient
  const focusPx = focusY * 1920

  /* Ground is a beat: cool for the tilt, amber for the two forces, void for the loop. */
  const coolOn = anim(t, T.cool, 0.45, easeInOutCubic) * (1 - anim(t, T.warm, 0.45, easeInOutCubic))
  const warmOn = anim(t, T.warm, 0.45, easeInOutCubic) * (1 - anim(t, T.voidGround, 0.45, easeInOutCubic))

  /* The single claim/question chip. Hidden while the proof owns the middle. */
  const chipKey = t < T.first ? 0 : t
  const activeChip = CLAIM_BEATS.filter((b) => b.at <= chipKey).at(-1) ?? CLAIM_BEATS[0]
  const rawChip = activeChip?.text ?? 'SUN RISES WEST'
  const chipText = rawChip.startsWith('FACT:')
    ? FACTS[rawChip.slice(5) as FactKey].display
    : rawChip
  const chipHidden = t >= T.counter && t < T.chipVerdict
  const chipPop = t === 0 ? 1 : backOut(anim(t, activeChip?.at ?? 0, 0.35))
  const chipOpacity = clamp01(anim(t, activeChip?.at ?? 0, 0.3, easeOutCubic) + (t === 0 ? 1 : 0))

  /* World states. Each shape is tied to one beat and leaves on a later beat. */
  const spin = stageT * 4
  const arrowDraw = 0.35 + 0.65 * anim(t, T.first, 0.6, easeOutCubic)
  const horizonOp = clamp01((1 - anim(t, T.cool, 0.4, easeInOutCubic)) + anim(t, T.horizonReturn, 0.5, easeOutCubic))
  const sunRise = 0.35 + 0.65 * anim(t, T.first, 0.7, easeOutCubic)
  const dayOp = windowed(t, T.dayStretch, T.chipOrbit, 0.4, 0.4)
  const dayStretch = 1 + 0.38 * anim(t, T.dayStretch, 0.9, easeOutCubic)
  const orbitOp = windowed(t, T.orbitLanes, T.chipSpinBackward + 0.2, 0.45, 0.4)
  const arrowPairOp = windowed(t, T.matchArrows, T.spinPair + 0.2, 0.45, 0.35)
  const spinPairOp = windowed(t, T.spinPair, T.cool, 0.45, 0.4)
  const axisOp = windowed(t, T.axisUpright, T.warm, 0.5, 0.4)
  const axisFlip = anim(t, T.axisFlip, 0.8, easeInOutCubic)
  const impactOp = windowed(t, T.impactField, T.chipLikely + 0.4, 0.45, 0.4)
  const hitOp = windowed(t, T.offCenterHit, T.chipLikely + 0.4, 0.4, 0.4)
  const recoilOp = windowed(t, T.spinRecoil, T.question, 0.45, 0.35)
  const tidalOp = windowed(t, T.tidal, T.chipBrake + 0.5, 0.45, 0.4)
  const shellOp = windowed(t, T.atmosphere, T.chipVerdict, 0.5, 0.4)
  const eastSetOp = windowed(t, T.eastSet, T.camReset, 0.6, 0.35)

  /* THE ONE visual proof — a paired race from facts.ts, never a second counter. */
  const proofIn = anim(t, T.counter, 0.35, easeOutCubic)
  const proofOut = anim(t, T.chipVerdict - 0.25, 0.3, easeInOutCubic)
  const proofOp = proofIn * (1 - proofOut)
  const railsOp = windowed(t, T.twoClocks, T.chipVerdict, 0.45, 0.35)
  const crosshairOp = windowed(t, T.crosshair, T.chipVerdict, 0.35, 0.35)
  const race = anim(t, T.counter, COUNTER_BEAT?.dur ?? 1.2, easeOutCubic)
  const spinFact = FACTS[PROOF_KEYS[0] ?? 'spinDays']
  const orbitFact = FACTS[PROOF_KEYS[1] ?? 'orbitDays']
  const spinNow = Math.round(spinFact.value * race)
  const orbitNow = Math.round(orbitFact.value * race)
  const barMax = spinFact.value
  const spinBarW = 552 * (spinNow / barMax)
  const orbitBarW = 552 * (orbitNow / barMax)
  const crossX = 140 + 552 * (orbitFact.value / barMax)
  const heroOp = 1 - 0.82 * proofOp

  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(1050px 820px at 50% 34%, ${AMBER}1F, transparent 62%),` +
            `radial-gradient(760px 700px at 50% 82%, ${COOL}14, transparent 70%),` +
            `${P.groundAlt}`,
        }}
      />
      <div className="absolute inset-0" style={{ background: P.ground, opacity: 0.6 }} />
      <div className="absolute inset-0" style={{ background: COOL, opacity: coolOn * 0.42 }} />
      <div className="absolute inset-0" style={{ background: AMBER, opacity: warmOn * 0.34 }} />

      <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0">
        <defs>
          <marker id="venus-arrow-head" markerWidth="14" markerHeight="14" refX="11" refY="7" orient="auto">
            <path d="M 0 0 L 14 7 L 0 14 z" fill={AMBER} />
          </marker>
          <marker id="venus-cool-head" markerWidth="14" markerHeight="14" refX="11" refY="7" orient="auto">
            <path d="M 0 0 L 14 7 L 0 14 z" fill={COOL} />
          </marker>
          <radialGradient id="venus-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="42%" stopColor={AMBER} />
            <stop offset="100%" stopColor={AMBER} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="venus-terminator" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0" />
            <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.5" />
          </linearGradient>
          <filter id="venus-glow"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        <g transform={`translate(540,${focusPx.toFixed(2)}) scale(${camScale.toFixed(4)}) translate(-540,${-focusPx.toFixed(2)})`}>
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill={INK}
              opacity={0.14 + 0.42 * (0.5 + 0.5 * Math.sin(stageT * s.tw + s.ph))}
            />
          ))}

          {/* HERO — already on screen and huge at t = 0 */}
          <g opacity={heroOp}>
            <circle
              cx={540} cy={820} r={372} fill="none" stroke={AMBER} strokeWidth="3"
              strokeDasharray="14 26" opacity="0.22"
              transform={`rotate(${(stageT * 18).toFixed(2)} 540 820)`}
            />
            <VenusGlobe
              x={540} y={820} r={300} spin={spin}
              axisDeg={-7 + 7 * axisFlip}
              arrowProgress={arrowDraw} sweepDeg={stageT * 40} glow={0.34}
            />

            {/* west horizon + Sun rising on the LEFT */}
            <g opacity={horizonOp}>
              <line x1={60} x2={1020} y1={1180} y2={1180} stroke={INK} strokeWidth="2" opacity={0.22 + sunRise * 0.3} />
              <g transform={`translate(190,${(1180 - 128 * sunRise).toFixed(2)})`} opacity={0.35 + 0.65 * sunRise}>
                <circle r="112" fill="url(#venus-sun)" opacity="0.75" />
                <circle r="42" fill={AMBER} filter="url(#venus-glow)" />
              </g>
              <path
                d="M 96 1180 Q 190 1010 296 1180"
                fill="none" stroke={AMBER} strokeWidth="5" strokeLinecap="round"
                opacity={0.25 + 0.6 * sunRise}
                pathLength={100} strokeDasharray="100"
                strokeDashoffset={100 * (1 - sunRise)}
              />
              <text x={96} y={1222} fill={AMBER} fontSize="26" fontFamily={FONT_MONO} letterSpacing="6" opacity={0.75}>WEST</text>
            </g>

            {/* day-stretch: a long day arc overtaking a short orbit arc — shape only */}
            <g opacity={dayOp} transform="translate(540,820)">
              <ellipse rx={330 * dayStretch} ry={250 * dayStretch} fill="none" stroke={AMBER} strokeWidth="5" opacity="0.7" />
              <ellipse rx={330} ry={250} fill="none" stroke={COOL} strokeWidth="4" strokeDasharray="8 10" opacity="0.55" />
            </g>
          </g>

          {/* ORBIT LANES — Venus and Earth travel the SAME way */}
          <g opacity={orbitOp}>
            <path d="M 150 1240 Q 540 1090 930 1240" fill="none" stroke={COOL} strokeWidth="5" strokeLinecap="round" opacity="0.85" />
            <path d="M 150 1300 Q 540 1150 930 1300" fill="none" stroke={AMBER} strokeWidth="5" strokeLinecap="round" opacity="0.85" />
            <g opacity={arrowPairOp}>
              <path d="M 810 1112 Q 868 1134 900 1180" fill="none" stroke={COOL} strokeWidth="6" strokeLinecap="round" markerEnd="url(#venus-cool-head)" />
              <path d="M 810 1180 Q 868 1202 900 1248" fill="none" stroke={AMBER} strokeWidth="6" strokeLinecap="round" markerEnd="url(#venus-arrow-head)" />
            </g>
            {/* spin-direction pair: Earth CCW vs Venus CW */}
            <g opacity={spinPairOp}>
              <g transform="translate(300,1420)">
                <circle r={58} fill={COOL} opacity="0.2" />
                <path d="M -46 -30 A 56 56 0 0 1 46 -30" fill="none" stroke={COOL} strokeWidth="6" strokeLinecap="round" markerEnd="url(#venus-cool-head)" />
              </g>
              <g transform="translate(780,1420)">
                <circle r={58} fill={AMBER} opacity="0.18" />
                <path d="M -46 -30 A 56 56 0 0 0 46 -30" fill="none" stroke={AMBER} strokeWidth="6" strokeLinecap="round" markerEnd="url(#venus-arrow-head)" />
              </g>
            </g>
          </g>

          {/* AXIS — upright reference flips to the retrograde convention */}
          <g opacity={axisOp} transform="translate(540,820)">
            <line x1="0" y1={-430} x2="0" y2={430} stroke={INK} strokeWidth="4" strokeDasharray="12 14" opacity="0.72" />
            <g transform={`rotate(${(-178 * axisFlip).toFixed(2)})`}>
              <line x1="0" y1={-430} x2="0" y2={430} stroke={AMBER} strokeWidth="6" opacity="0.92" />
              <path d="M -18 -404 L 0 -446 L 18 -404 z" fill={AMBER} />
            </g>
            <circle cy={-430} r="8" fill={INK} />
            <circle cy={430} r="8" fill={INK} />
          </g>

          {/* TWO FORCES — off-center hit, then atmospheric tidal brake */}
          <g opacity={impactOp}>
            <circle cx={540} cy={820} r={318} fill="none" stroke={INK} strokeWidth="2" strokeDasharray="10 12" opacity="0.24" />
            <g transform={`translate(${(540 - 210 * (1 - anim(t, T.offCenterHit, 0.6, easeOutCubic))).toFixed(1)},760)`}>
              <circle r="26" fill={COOL} opacity="0.9" />
            </g>
            <g opacity={hitOp}>
              <path d="M 300 760 L 470 790" fill="none" stroke={COOL} strokeWidth="8" strokeLinecap="round" markerEnd="url(#venus-cool-head)" opacity="0.8" />
              <path d="M 620 790 Q 760 880 880 830" fill="none" stroke={AMBER} strokeWidth="8" strokeLinecap="round" markerEnd="url(#venus-arrow-head)" opacity="0.75" />
            </g>
            <g opacity={recoilOp}>
              <path d={`M ${-rArrow()} -40 A ${rArrow()} ${rArrow()} 0 1 0 ${-rArrow() * 0.72} ${rArrow() * 0.92}`}
                fill="none" stroke={AMBER} strokeWidth="7" strokeLinecap="round" markerEnd="url(#venus-arrow-head)"
                transform="translate(540,820)" />
            </g>
          </g>

          <g opacity={tidalOp}>
            <path d="M 150 700 L 350 780" fill="none" stroke={COOL} strokeWidth="8" strokeLinecap="round" markerEnd="url(#venus-cool-head)" opacity="0.7" />
            <path d="M 930 700 L 730 780" fill="none" stroke={COOL} strokeWidth="8" strokeLinecap="round" markerEnd="url(#venus-cool-head)" opacity="0.7" />
          </g>
          <g opacity={shellOp}>
            <circle cx={540} cy={820} r={332} fill="none" stroke={COOL} strokeWidth="18" opacity="0.28" />
            <circle cx={540} cy={820} r={352} fill="none" stroke={COOL} strokeWidth="3" strokeDasharray="4 12" opacity="0.45" />
          </g>

          {/* west-rise mirror: Sun dips below the RIGHT/east horizon */}
          <g opacity={eastSetOp}>
            <line x1={60} x2={1020} y1={1240} y2={1240} stroke={INK} strokeWidth="2" opacity="0.3" />
            <g transform={`translate(890,${(1240 - 96 * (1 - anim(t, T.eastSet, 0.7, easeOutCubic))).toFixed(2)})`}>
              <circle r="104" fill="url(#venus-sun)" opacity="0.7" />
              <circle r="38" fill={AMBER} filter="url(#venus-glow)" />
            </g>
            <text x={1020} y={1282} textAnchor="end" fill={AMBER} fontSize="26" fontFamily={FONT_MONO} letterSpacing="6" opacity="0.75">EAST</text>
          </g>

          {/* Proof rails + the ONE counter/bar race */}
          <g opacity={railsOp}>
            <rect x={108} y={1060} width={864} height={300} rx={18} fill="rgba(3,7,18,0.82)" stroke={AMBER} strokeWidth="3" opacity="0.92" />
            <text x={140} y={1122} fill={INK} fontSize="26" fontFamily={FONT_MONO} letterSpacing="4">{PROOF_SUFFIX}</text>
          </g>
          <g opacity={proofOp}>
            <rect x={140} y={1160} width={552} height={26} rx={13} fill="rgba(245,158,11,0.12)" />
            <rect x={140} y={1160} width={spinBarW.toFixed(1)} height={26} rx={13} fill={AMBER} />
            <rect x={140} y={1250} width={552} height={26} rx={13} fill="rgba(96,165,250,0.12)" />
            <rect x={140} y={1250} width={orbitBarW.toFixed(1)} height={26} rx={13} fill={COOL} />
            <text x={140} y={1238} fill={INK} fontSize="64" fontFamily={FONT_DISPLAY}>{spinNow}</text>
            <text x={140} y={1328} fill={INK} fontSize="64" fontFamily={FONT_DISPLAY}>{orbitNow}</text>
            <text x={940} y={1122} textAnchor="end" fill={AMBER} fontSize="24" fontFamily={FONT_MONO} letterSpacing="2">{spinFact.display}</text>
            <text x={940} y={1320} textAnchor="end" fill={COOL} fontSize="24" fontFamily={FONT_MONO} letterSpacing="2">{orbitFact.display}</text>
            <line x1={crossX.toFixed(1)} x2={crossX.toFixed(1)} y1={1146} y2={1294} stroke={INK} strokeWidth="2" strokeDasharray="6 8" opacity="0.5" />
          </g>
          <g opacity={crosshairOp} transform={`translate(${crossX.toFixed(1)},1240)`}>
            <circle r="34" fill="none" stroke={AMBER} strokeWidth="4" />
            <line x1={-52} x2={52} y1="0" y2="0" stroke={AMBER} strokeWidth="2" />
            <line x1="0" x2="0" y1={-52} y2={52} stroke={AMBER} strokeWidth="2" />
          </g>
        </g>
      </svg>

      {/* ONE claim/question chip: badge + this + phrase captions = 3 text zones. */}
      {!chipHidden && (
        <div
          className="pointer-events-none absolute left-[60px] top-[170px] flex h-[86px] w-[960px] items-center overflow-hidden rounded-[14px] border px-[28px]"
          style={{
            borderColor: AMBER,
            background: 'rgba(3,7,18,0.84)',
            opacity: chipOpacity,
            transform: `translateY(${((1 - chipPop) * 24).toFixed(2)}px)`,
          }}
        >
          <span className="mr-[18px] inline-block h-[12px] w-[12px] rounded-full" style={{ background: AMBER, boxShadow: `0 0 12px ${AMBER}` }} />
          <span
            className="font-block uppercase"
            style={{
              fontFamily: chipText.length > 20 ? FONT_MONO : FONT_DISPLAY,
              fontSize: chipText.length > 20 ? 38 : 48,
              letterSpacing: chipText.length > 20 ? 2 : 1,
              color: rawChip.startsWith('FACT:') ? INK : AMBER,
              whiteSpace: 'nowrap',
            }}
          >
            {chipText}
          </span>
        </div>
      )}
    </>
  )
}

/** radius of the recoil spin arrow (kept local so no displayed number is a literal) */
function rArrow() {
  return 300 * 1.05
}
