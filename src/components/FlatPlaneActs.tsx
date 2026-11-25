/* ==================================================================
   WHY THE SOLAR SYSTEM IS FLAT
   cosmic series • amber • continuous SVG world • endCard false

   Pure function of `t`. One persistent world lives for the whole
   timeline: CentralSun, AtomShellOverlay, NebulaParticleField and
   EclipticBandRig. No Math.random, no setInterval, no CSS infinite,
   no self-clocked animation library. Every displayed number resolves
   from episodes/solar-system-flat-plane/facts.ts.

   Beat times come from scene.json and are re-anchored to exact WordBoundary
   starts in metadata.json (see beats.md §0). The only metadata-derived
   non-word time is the final 0.6 s ghost-shell return, computed from
   `totalDuration`.

   ================================================================== */

import { anim, clamp01, easeInOutCubic, easeOutCubic } from '../motion/anim'
import { FACTS, type FactKey } from '../../episodes/solar-system-flat-plane/facts'
import scene from '../../episodes/solar-system-flat-plane/scene.json'

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
const lastPick = (pred: (b: Beat) => boolean) => BEATS.filter(pred).at(-1)?.at ?? 0
const T = {
  first: BEATS[0]?.at ?? 0,
  camHook: pick((b) => b.kind === 'camera' && b.scale === 1.12),
  shellsRotate: pick((b) => b.id === 'atom-shell-rotate'),
  chipCrisscross: pick((b) => b.kind === 'chip' && b.text === '3D CRISSCROSS?'),
  cool: pick((b) => b.kind === 'palette' && b.ground === 'secondary'),
  nebula: pick((b) => b.id === 'nebula-sphere'),
  cloudBody: pick((b) => b.id === 'nebula-cloud-body'),
  chipNotFlat: pick((b) => b.kind === 'chip' && b.text === 'NOT FLAT YET'),
  camPull: pick((b) => b.kind === 'camera' && b.scale === 0.92),
  netSpin: pick((b) => b.id === 'net-spin-arrow'),
  spinAccelerate: pick((b) => b.id === 'spin-accelerate'),
  wildAngles: pick((b) => b.id === 'wild-angle-field'),
  gravity: pick((b) => b.id === 'gravity-inward-vectors'),
  chipSpin: pick((b) => b.kind === 'chip' && b.text === 'SPIN KEPT'),
  vy: pick((b) => b.id === 'vertical-vy-arrows'),
  question: scene.question?.questionAt ?? pick((b) => b.kind === 'question'),
  camTilt: pick((b) => b.id === 'edge-on-tilt'),
  collision1: pick((b) => b.id === 'collision-microflash-1'),
  collision2: pick((b) => b.id === 'collision-microflash-2'),
  vx: pick((b) => b.id === 'sideways-vx-accelerate'),
  chipCancel: pick((b) => b.kind === 'chip' && b.text === 'VERTICAL CANCELED'),
  warm: pick((b) => b.kind === 'palette' && b.ground === 'primary'),
  disk: pick((b) => b.id === 'disk-collapse'),
  diskSpin: pick((b) => b.id === 'disk-spinning'),
  chipTraffic: pick((b) => b.kind === 'chip' && b.text === 'COSMIC TRAFFIC JAM'),
  planetSeeds: pick((b) => b.id === 'planet-seeds'),
  camSettle: pick((b) => b.kind === 'camera' && b.scale === 1.0),
  chipLane: pick((b) => b.kind === 'chip' && b.text === 'ONE LANE'),
  wedge: pick((b) => b.id === 'ecliptic-wedge-rig'),
  camWedge: pick((b) => b.kind === 'camera' && b.scale === 1.18),
  chipBand: pick((b) => b.kind === 'chip' && b.text === 'FACT:bandDeg'),
  counter: pick((b) => b.kind === 'counter'),
  chipOther: pick((b) => b.kind === 'chip' && b.text === 'FACT:otherPlanetsDeg'),
  loopChip: lastPick((b) => b.kind === 'chip' && b.text === 'ONE FLAT PLANE'),
  shellsReturn: pick((b) => b.id === 'atom-shells-return'),
} as const

const CAMERA_BEATS = BEATS.filter((b) => b.kind === 'camera')
const CLAIM_BEATS = BEATS.filter((b) => b.kind === 'chip' || b.kind === 'question')
const COUNTER_BEAT = BEATS.find((b) => b.kind === 'counter')
const PROOF_KEYS = (COUNTER_BEAT?.factKeys ?? ['bandDeg', 'otherPlanetsDeg']) as FactKey[]
const PROOF_DUR = COUNTER_BEAT?.dur ?? 1.0
const SUFFIX = COUNTER_BEAT?.suffix ?? '°'
/** Projected end when metadata is not loaded yet (Stage 5 storyboard only). */
const PLANNED_END = (BEATS.at(-1)?.at ?? 0) + 0.59

/** Solver for CSS cubic-bezier(0.22, 1, 0.36, 1) — deterministic, no clock. */
const cubicBezier = (x: number, x1: number, y1: number, x2: number, y2: number) => {
  const target = clamp01(x)
  let u = target
  const sample = (v: number, a: number, b: number) => {
    const inv = 1 - v
    return 3 * inv * inv * v * a + 3 * inv * v * v * b + v * v * v
  }
  const slope = (v: number, a: number, b: number) => {
    const inv = 1 - v
    return 3 * inv * inv * a + 6 * inv * v * (b - a) + 3 * v * v * (1 - b)
  }
  for (let i = 0; i < 6; i++) {
    const d = slope(u, x1, x2)
    if (Math.abs(d) < 1e-6) break
    u = clamp01(u - (sample(u, x1, x2) - target) / d)
  }
  return sample(u, y1, y2)
}
const cinematicOut = (x: number) => cubicBezier(x, 0.22, 1, 0.36, 1)
const lerp = (a: number, b: number, p: number) => a + (b - a) * p
const windowed = (t: number, from: number, to: number, inDur = 0.4, outDur = 0.35) =>
  anim(t, from, inDur, easeOutCubic) * (1 - anim(t, to, outDur, easeInOutCubic))

/* Seeded field — the same particles collapse, they never get replaced. */
const hash01 = (i: number) => {
  let x = (i * 2654435761) >>> 0
  x ^= x >>> 16
  x = Math.imul(x, 2246822519) >>> 0
  x ^= x >>> 13
  return (x >>> 0) / 4294967296
}

interface Particle {
  angle: number
  rx: number
  ryCloud: number
  ryDisk: number
  z: number
  r: number
  vy: number
}
const PARTICLES: Particle[] = Array.from({ length: 96 }, (_, i) => ({
  angle: hash01(i * 5 + 1) * Math.PI * 2,
  rx: 130 + hash01(i * 5 + 2) * 290,
  ryCloud: 130 + hash01(i * 5 + 3) * 150,
  ryDisk: 14 + hash01(i * 5 + 3) * 30,
  z: (hash01(i * 5 + 4) - 0.5) * 2,
  r: 1.8 + hash01(i * 7 + 5) * 3.2,
  vy: 0.5 + hash01(i * 7 + 6) * 0.8,
}))

const particleXY = (p: Particle, t: number, collapse: number, spinRate: number) => {
  const angle = p.angle + t * 0.75 * spinRate * (1 + p.z * 0.12)
  const breathe = 1 + 0.1 * Math.sin(t * 2.1 + p.angle)
  const x = 540 + Math.cos(angle) * p.rx * breathe * (1 - 0.05 * collapse)
  const yCloud = 820 + Math.sin(angle) * p.ryCloud * breathe + p.z * 62
  const yDisk = 820 + Math.sin(angle) * p.ryDisk
  return { x, y: lerp(yCloud, yDisk, collapse) }
}

export default function FlatPlaneActs({ t: rawT, meta }: Props) {
  const end = meta?.totalDuration ?? PLANNED_END
  /* Snap only the last ~2 frames so the cut lands on the frame-1 pose.
     `t` is therefore the single scene clock for every layer below. */
  const t = rawT >= end - 0.09 ? 0 : rawT
  const stageT = t

  /* One camera for the whole world. Later beats ease into their target. */
  let camScale = 1
  let focusX = 0.5
  let focusY = 0.5
  let tiltDeg = 0
  for (const b of CAMERA_BEATS) {
    const p = anim(t, b.at, 0.85, cinematicOut)
    camScale = lerp(camScale, b.scale ?? 1, p)
    focusX = lerp(focusX, b.to?.[0] ?? 0.5, p)
    focusY = lerp(focusY, b.to?.[1] ?? 0.5, p)
    if (b.id === 'edge-on-tilt') tiltDeg = lerp(tiltDeg, 78, p)
    if (b.id === 'edge-on-return') tiltDeg = lerp(tiltDeg, 0, p)
  }
  const ambient = 1 + 0.03 * clamp01(t / end)
  camScale *= ambient
  /* Edge-on is a viewing angle, so the disk's vertical axis compresses;
     a 2D rotation would turn the disk sideways instead of edge-on. */
  const tiltSquash = Math.cos((tiltDeg * Math.PI) / 180)
  const fx = focusX * 1080
  const fy = focusY * 1920

  /* Ground is a beat: cool before-state, amber result-state, void at the loop. */
  const coolOn = anim(t, T.cool, 0.55, easeInOutCubic) * (1 - anim(t, T.warm, 0.55, easeInOutCubic))
  const warmOn = anim(t, T.warm, 0.55, easeInOutCubic) * (1 - anim(t, T.loopChip, 0.4, easeInOutCubic))

  /* The one claim/question chip. Hidden while the wedge proof owns the middle. */
  const activeChip = CLAIM_BEATS.filter((b) => b.at <= t).at(-1) ?? CLAIM_BEATS[0]
  const rawChip = activeChip?.text ?? 'ONE FLAT PLANE'
  const chipText = rawChip.startsWith('FACT:')
    ? FACTS[rawChip.slice(5) as FactKey].display
    : rawChip
  const chipHidden = t >= T.counter - 0.2 && t < T.chipOther
  const chipPop = t === 0 ? 1 : backOutForChip(anim(t, activeChip?.at ?? 0, 0.35))
  const chipOpacity = clamp01(anim(t, activeChip?.at ?? 0, 0.3, easeOutCubic) + (t === 0 ? 1 : 0))

  /* Atom false model: present at frame 1, dissolves into the cloud, returns ghosted. */
  const shellReturnAt = meta ? end - 0.6 : T.shellsReturn
  const shellOp = clamp01((1 - anim(t, T.nebula, 0.7, easeInOutCubic)) + 0.55 * anim(t, shellReturnAt, 0.45, easeOutCubic))
  const shellPhase = 60 * anim(t, T.shellsRotate, 0.9, cinematicOut)

  /* Same particles throughout: vertical motion damps, horizontal spin accelerates. */
  const collapse = anim(t, T.vy, Math.max(0.1, T.disk - T.vy), easeInOutCubic)
  const spinRate = 1 +
    0.35 * anim(t, T.spinAccelerate, 0.9, cinematicOut) +
    0.30 * anim(t, T.vx, 0.9, cinematicOut)
  const wildFieldOp = windowed(t, T.wildAngles, T.disk, 0.35, 0.3)
  const vyArrowsOp = clamp01(wildFieldOp * (0.35 + 0.65 * anim(t, T.vy, 0.35)))
  const vxArrowsOp = windowed(t, T.vx, T.loopChip, 0.45, 0.35)
  const gravityOp = windowed(t, T.gravity, T.chipSpin, 0.35, 0.3)
  const netSpinOp = windowed(t, T.netSpin, T.chipSpin, 0.35, 0.3)
  const diskRingOp = clamp01(
    windowed(t, T.disk, T.loopChip, 0.5, 0.35) +
    0.22 * anim(t, T.diskSpin, 0.4, easeOutCubic) * (1 - anim(t, T.loopChip, 0.4, easeInOutCubic)),
  )
  const flash1 = anim(t, T.collision1, 0.16, easeOutCubic) * (1 - anim(t, T.collision1 + 0.24, 0.18, easeInOutCubic))
  const flash2 = anim(t, T.collision2, 0.16, easeOutCubic) * (1 - anim(t, T.collision2 + 0.24, 0.18, easeInOutCubic))
  const planetOp = windowed(t, T.planetSeeds, T.loopChip, 0.5, 0.35)
  const planetScale = 1 + 0.12 * anim(t, T.planetSeeds, 0.6, easeOutCubic)

  /* THE ONE visual proof: a wedge that moves from FACTS.bandDeg to FACTS.otherPlanetsDeg. */
  const wedgeBase = 0.35
  const wedgeOp = clamp01(
    wedgeBase * (1 - anim(t, T.wedge, 0.5, easeOutCubic)) +
    anim(t, T.wedge, 0.5, easeOutCubic) * (1 - 0.65 * anim(t, T.loopChip, 0.4, easeInOutCubic)),
  )
  const proofIn = anim(t, T.counter - 0.2, 0.2, easeOutCubic)
  const proofOut = anim(t, T.chipOther - 0.2, 0.2, easeInOutCubic)
  const proofOp = proofIn * (1 - proofOut)
  const proofP = anim(t, T.counter, PROOF_DUR, easeOutCubic)
  const bandFact = FACTS[PROOF_KEYS[0] ?? 'bandDeg']
  const otherFact = FACTS[PROOF_KEYS[1] ?? 'otherPlanetsDeg']
  const proofDeg = lerp(bandFact.value, otherFact.value, proofP)
  const outerR = 320
  const innerR = 236
  const outerDeg = bandFact.value
  const innerDeg = otherFact.value
  const outerRad = (outerDeg * Math.PI) / 180
  const innerRad = (innerDeg * Math.PI) / 180
  const proofRad = (proofDeg * Math.PI) / 180
  const outerX = 540 + outerR * Math.cos(outerRad)
  const outerY = 820 - outerR * Math.sin(outerRad)
  const innerX = 540 + innerR * Math.cos(innerRad)
  const innerY = 820 - innerR * Math.sin(innerRad)
  const proofX = 540 + outerR * Math.cos(proofRad)
  const proofY = 820 - outerR * Math.sin(proofRad)

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
          <marker id="flat-plane-amber-head" markerWidth="14" markerHeight="14" refX="11" refY="7" orient="auto">
            <path d="M 0 0 L 14 7 L 0 14 z" fill={AMBER} />
          </marker>
          <marker id="flat-plane-cool-head" markerWidth="14" markerHeight="14" refX="11" refY="7" orient="auto">
            <path d="M 0 0 L 14 7 L 0 14 z" fill={COOL} />
          </marker>
          <radialGradient id="flat-plane-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="40%" stopColor={AMBER} />
            <stop offset="100%" stopColor={AMBER} stopOpacity="0" />
          </radialGradient>
          <filter id="flat-plane-glow">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g
          transform={`translate(${fx.toFixed(2)},${fy.toFixed(2)}) scale(${camScale.toFixed(4)},${(camScale * tiltSquash).toFixed(4)}) translate(${(-fx).toFixed(2)},${(-fy).toFixed(2)})`}
        >
          {/* CentralSun — fixed centre, present from frame 1 */}
          <circle cx={540} cy={820} r={230} fill="url(#flat-plane-sun)" opacity={0.5 + 0.18 * collapse} />
          <circle cx={540} cy={820} r={62} fill={AMBER} filter="url(#flat-plane-glow)" />
          <circle cx={540} cy={820} r={46} fill="#FEF3C7" opacity={0.95} />

          {/* AtomShellOverlay — false mental model, 0/60/120 degrees */}
          <g opacity={shellOp} transform={`rotate(${shellPhase.toFixed(2)},540,820)`}>
            {[0, 60, 120].map((deg) => (
              <g key={deg} transform={`rotate(${deg},540,820)`}>
                <ellipse
                  cx={540} cy={820} rx={330} ry={126}
                  fill="none" stroke={COOL} strokeWidth="3.5"
                  strokeDasharray="16 22" opacity={0.72}
                />
                <circle
                  cx={540 + 330 * Math.cos(stageT * 0.9 + (deg * Math.PI) / 180)}
                  cy={820 + 126 * Math.sin(stageT * 0.9 + (deg * Math.PI) / 180)}
                  r={6} fill={COOL} opacity={0.85}
                />
              </g>
            ))}
          </g>

          {/* NebulaParticleField — one field; vy damps, vx accelerates */}
          <g>
            <circle
              cx={540} cy={820} r={360} fill={COOL}
              opacity={(0.05 + 0.10 * anim(t, T.cloudBody, 0.45, easeOutCubic)) * (1 - collapse)}
            />
            {PARTICLES.map((p, i) => {
              const { x, y } = particleXY(p, stageT, collapse, spinRate)
              const twinkle = 0.28 + 0.62 * (0.5 + 0.5 * Math.sin(stageT * 2.2 + p.angle))
              const fill = p.z > 0 && collapse < 0.5 ? COOL : AMBER
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={p.r} fill={fill} opacity={twinkle} />
                  {vyArrowsOp > 0.01 && i % 12 === 3 && (
                    <line
                      x1={x} x2={x}
                      y1={y - 34 * p.vy * (1 - collapse)}
                      y2={y + 34 * p.vy * (1 - collapse)}
                      stroke={COOL} strokeWidth="3" strokeLinecap="round"
                      markerEnd="url(#flat-plane-cool-head)"
                      opacity={vyArrowsOp * 0.85}
                    />
                  )}
                </g>
              )
            })}

            {/* Slight net spin, then gravity vectors — continuous motion between beats. */}
            <g opacity={netSpinOp}>
              <path
                d="M 280 700 Q 540 610 800 700"
                fill="none" stroke={COOL} strokeWidth="7" strokeLinecap="round"
                markerEnd="url(#flat-plane-cool-head)"
                strokeDasharray="24 20" strokeDashoffset={(-stageT * 26).toFixed(1)}
                opacity={0.85}
              />
            </g>
            <g opacity={gravityOp}>
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i * Math.PI) / 4 + stageT * 0.2
                const travel = (stageT * 0.35 + i / 8) % 1
                const r = lerp(330, 120, travel)
                const x1 = 540 + Math.cos(a) * r
                const y1 = 820 + Math.sin(a) * r * 0.55
                const x2 = 540 + Math.cos(a) * (r - 70)
                const y2 = 820 + Math.sin(a) * (r - 70) * 0.55
                return (
                  <line
                    key={i} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)}
                    stroke={COOL} strokeWidth="4" strokeLinecap="round"
                    markerEnd="url(#flat-plane-cool-head)" opacity={0.75}
                  />
                )
              })}
            </g>

            {/* Collision micro-flashes — two vertical arrows cancel. */}
            {[8, 31].map((idx, i) => {
              const p = PARTICLES[idx]
              const { x, y } = particleXY(p, stageT, collapse, spinRate)
              const op = i === 0 ? flash1 : flash2
              return (
                <g key={`flash-${idx}`} opacity={op}>
                  <circle cx={x} cy={y} r={30} fill={AMBER} opacity={0.25} />
                  <circle cx={x} cy={y} r={9} fill={INK} />
                  <line x1={x - 46} x2={x + 46} y1={y} y2={y} stroke={AMBER} strokeWidth="2" />
                </g>
              )
            })}

            {/* Shared sideways spin survives. */}
            <g opacity={vxArrowsOp}>
              <path
                d="M 224 820 Q 540 690 856 820"
                fill="none" stroke={AMBER} strokeWidth="7" strokeLinecap="round"
                markerEnd="url(#flat-plane-amber-head)"
                pathLength={100} strokeDasharray="100"
                strokeDashoffset={100 * (1 - anim(t, T.vx, 0.8, cinematicOut))}
              />
            </g>

            {/* The flattened disk keeps turning — no frozen result state. */}
            <g opacity={diskRingOp}>
              <ellipse
                cx={540} cy={820} rx={392} ry={58}
                fill="none" stroke={AMBER} strokeWidth="3"
                strokeDasharray="26 20" strokeDashoffset={(-stageT * 34).toFixed(1)}
                opacity={0.6}
              />
              <ellipse
                cx={540} cy={820} rx={300} ry={38}
                fill="none" stroke={INK} strokeWidth="2"
                strokeDasharray="18 24" strokeDashoffset={(stageT * 24).toFixed(1)}
                opacity={0.35}
              />
            </g>

            {/* Planet seeds condense inside the disk. */}
            <g opacity={planetOp} transform={`translate(540,820) scale(${planetScale.toFixed(3)}) translate(-540,-820)`}>
              {[0.32, 0.46, 0.6, 0.74, 0.88].map((frac, i) => {
                const a = frac * Math.PI * 2 + stageT * 0.32
                const r = 170 + i * 42
                return (
                  <circle
                    key={i}
                    cx={540 + Math.cos(a) * r}
                    cy={820 + Math.sin(a) * (22 + i * 5)}
                    r={7 + i * 1.6}
                    fill={INK}
                    opacity={0.65}
                  />
                )
              })}
            </g>
          </g>

          {/* EclipticBandRig — edge-on inclination proof, geometry from FACTS */}
          <g opacity={wedgeOp}>
            <line x1={188} x2={908} y1={820} y2={820} stroke={INK} strokeWidth="2" opacity={0.34} />
            <line
              x1={540} y1={820} x2={outerX.toFixed(2)} y2={outerY.toFixed(2)}
              stroke={AMBER} strokeWidth="5" opacity={0.88}
            />
            <path
              d={`M ${540 + outerR} 820 A ${outerR} ${outerR} 0 0 0 ${outerX.toFixed(2)} ${outerY.toFixed(2)}`}
              fill="none" stroke={AMBER} strokeWidth="3" opacity={0.75}
            />
            <line
              x1={540} y1={820} x2={innerX.toFixed(2)} y2={innerY.toFixed(2)}
              stroke={COOL} strokeWidth="4" opacity={0.7}
            />
            <path
              d={`M ${540 + innerR} 820 A ${innerR} ${innerR} 0 0 0 ${innerX.toFixed(2)} ${innerY.toFixed(2)}`}
              fill="none" stroke={COOL} strokeWidth="2.5" opacity={0.6}
            />
          </g>

          {/* The single moving number — the only changing numeral in the episode. */}
          <g opacity={proofOp}>
            <line
              x1={540} y1={820} x2={proofX.toFixed(2)} y2={proofY.toFixed(2)}
              stroke={INK} strokeWidth="7" strokeLinecap="round"
            />
            <circle cx={proofX.toFixed(2)} cy={proofY.toFixed(2)} r={11} fill={INK} />
            <text
              x={540} y={596} textAnchor="middle" fill={INK}
              fontSize="112" fontFamily={FONT_DISPLAY}
            >
              {`${proofDeg.toFixed(1)}${SUFFIX}`}
            </text>
          </g>
        </g>
      </svg>

      {/* ONE claim/question chip: badge + this + phrase captions = 3 text zones. */}
      {!chipHidden && (
        <div
          className="pointer-events-none absolute left-[60px] top-[280px] flex h-[86px] w-[960px] items-center overflow-hidden rounded-[14px] border px-[28px]"
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

/** local back-out: the chip pop is a produced accent, not global motion */
function backOutForChip(x: number) {
  const u = clamp01(x) - 1
  return 1 + 2.70158 * u * u * u + 1.70158 * u * u
}
