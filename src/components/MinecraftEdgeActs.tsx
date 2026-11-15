/* ==================================================================
   MinecraftEdgeActs — scene content for "How long to walk to the edge
   of Minecraft?"  Pure SVG/JSX 2D · voice-driven · rendered by
   src/components/Episode.tsx.  Wrapper-only concern (audio, recorder
   hooks, HUD, captions) lives there.
   ================================================================== */

import { clamp01, easeInOutCubic, easeInCubic, anim } from '../motion/anim'

/* ---------- FACTS (single source of truth) ---------- */
const FACTS = {
  borderBlocks: 29_999_984,
  walkBlocksPerSec: 4.317,
  sprintBlocksPerSec: 5.612,
  earthCircumferenceKm: 40_075,
  blocksPerMeter: 1,
  metersPerKm: 1000,
} as const

const COLORS = {
  bg: '#030712',
  ink: '#F8FAFC',
  amber: '#F59E0B',
  cyan: '#22D3EE',
  slate: '#475569',
} as const

/* ---------- seeded RNG ---------- */
const mulberry32 = (seed: number) => {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ---------- starfield ---------- */
interface Word { w: string; start: number; end: number }

const STAR_LAYERS = [
  { count: 40, rMax: 0.9, seed: 101 },
  { count: 60, rMax: 1.4, seed: 202 },
  { count: 80, rMax: 1.9, seed: 303 },
] as const
const STARFIELD = STAR_LAYERS.map((l) => {
  const rand = mulberry32(l.seed)
  return Array.from({ length: l.count }, () => ({
    x: rand() * 1080,
    y: rand() * 1600,
    r: 0.5 + rand() * l.rMax,
    o: 0.25 + rand() * 0.65,
    freq: 0.6 + rand() * 1.8,
    phase: rand() * Math.PI * 2,
    cross: rand() > 0.92,
  }))
})

/* ---------- metadata types ---------- */
interface Act { id: string; index: number; label: string; words: Word[] }
export interface Metadata { title: string; totalDuration: number; words: Word[]; actBreakdown: Act[] }

export interface MinecraftEdgeActsProps { t: number; actIndex: number; meta: Metadata | null }

function backOutPulse(x: number): number {
  // smooth triangle-ish pulse: peaks in the middle, returns to 0 at both ends
  if (x <= 0 || x >= 1) return 0
  return Math.sin(x * Math.PI)
}

function MathCard({ y, label, value, unit, opacity, tx, exit }: {
  y: number
  label: string
  value: string
  unit: string
  opacity: number
  tx: number
  exit: number
}) {
  const yPos = y - exit * 210
  const opacityFinal = opacity * (1 - exit)
  if (opacityFinal <= 0.01) return null
  return (
    <g opacity={opacityFinal} transform={`translate(${tx}, ${yPos})`}>
      <rect
        x={120}
        y={0}
        width={840}
        height={196}
        rx={14}
        fill="#0c1324"
        stroke="#334155"
        strokeWidth={1}
      />
      <text
        x={160}
        y={56}
        fill={COLORS.slate}
        fontSize={18}
        fontFamily="ui-monospace, Consolas, monospace"
        letterSpacing={4}
      >
        {label}
      </text>
      <text
        x={160}
        y={140}
        fill={COLORS.amber}
        fontSize={88}
        fontWeight={900}
        fontFamily="Anton, Impact, sans-serif"
        letterSpacing={2}
      >
        {value}
      </text>
      <text
        x={160}
        y={176}
        fill={COLORS.amber}
        fontSize={20}
        opacity={0.75}
        fontFamily="ui-monospace, Consolas, monospace"
        letterSpacing={3}
      >
        {unit}
      </text>
    </g>
  )
}

export default function MinecraftEdgeActs({ t, actIndex, meta }: MinecraftEdgeActsProps) {
  const words = meta?.words ?? []

  /* ---- derived ---- */
  const netSeconds = FACTS.borderBlocks / FACTS.walkBlocksPerSec

  const borderMeters = FACTS.borderBlocks * FACTS.blocksPerMeter
  const borderKm = borderMeters / FACTS.metersPerKm
  const earthKm = FACTS.earthCircumferenceKm
  const amberBarPx = 840 * (borderKm / earthKm)

  const anchorStart = (name: string, occurrence: number): number => {
    const list = words.filter((w) => w.w.toLowerCase() === name.toLowerCase())
    return list[occurrence - 1]?.start ?? 0
  }

  const tEighty = anchorStart('eighty', 1)
  const tNonstop = anchorStart('Nonstop', 1)
  const tBorder = anchorStart('border', 1)
  const tThirty1 = anchorStart('thirty', 1)
  const tFour = anchorStart('four', 1)
  const tSeven = anchorStart('seven', 1)
  const tSprint = anchorStart('Sprint', 1)
  const tSixtyTwo = anchorStart('sixty-two', 1)
  const tFlat = anchorStart('flat', 1)
  const tThirty2 = anchorStart('thirty', 2)
  const tEarth = anchorStart('Earth', 1)
  const tAround = anchorStart('around', 1)

  const tReturn = tAround + 0.55
  const inLoopReturn = t >= tReturn
  const fadeOut = anim(t, tAround, 0.5)
  const returnIn = anim(t, tReturn, 0.45)
  const sceneOpacity = Math.max(1 - fadeOut, returnIn)

  /* during the return, hold the exact frame-0 composition so the Short loops seamlessly */
  const tScene = inLoopReturn ? 0 : t

  /* ---- camera per act ---- */
  const camScale = (() => {
    if (!meta) return 1
    if (inLoopReturn) return 1
    const a0 = meta.actBreakdown[0], a1 = meta.actBreakdown[1], a2 = meta.actBreakdown[2]
    if (actIndex === 0) {
      const p = clamp01((t - a0.words[0].start) / (a0.words[a0.words.length - 1].end - a0.words[0].start))
      return 1 + 0.04 * easeInOutCubic(p)
    }
    if (actIndex === 1) {
      const p = clamp01((t - a1.words[0].start) / (a1.words[a1.words.length - 1].end - a1.words[0].start))
      return 1 + 0.03 * easeInOutCubic(p)
    }
    const p = clamp01((t - a2.words[0].start) / (a2.words[a2.words.length - 1].end - a2.words[0].start))
    return 1 - 0.03 * easeInOutCubic(p)
  })()

  /* ---- act 1 ---- */
  const counterProgress = tScene < tEighty ? clamp01(anim(tScene, 0, tEighty, easeInCubic)) : 1
  const dayCount = Math.floor(1 + 79 * counterProgress)
  const counterPop = tAround > tEighty ? 1 + 0.08 * backOutPulse(clamp01((tScene - tEighty) / 0.3) - 0.5) * 2 : 1
  const scrollBoost = tScene > tNonstop && tScene < tNonstop + 0.68 ? 1.25 : 1
  const groundX = -((tScene * 118 * scrollBoost) % 64)

  /* ---- act 2 card exit ---- */
  const cardsExit = anim(tScene, tBorder, 0.4, easeInOutCubic)
  const revealOp1 = anim(t, tThirty1, 0.42)
  const revealOp2 = anim(t, tFour, 0.42)
  const revealOp3 = anim(t, tSeven, 0.42)
  const secondsCount = Math.floor(netSeconds * clamp01((t - tSeven) / 0.6))

  /* ---- act 3 ---- */
  const cardsSlideOut = anim(t, tSprint, 0.32, easeInOutCubic)
  const chipReveal = anim(t, tSixtyTwo, 0.4)
  const footnoteReveal = anim(t, tFlat, 0.36)
  const barAmberGrow = anim(t, tThirty2, 0.6)
  const barCyanGrow = anim(t, tEarth, 0.6)

  return (
    <>
        {/* starfield */}
        {STARFIELD.map((layer, li) => (
          <svg key={li} width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0" style={{ opacity: sceneOpacity }}>
            {layer.map((s, i) => {
              const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.freq + s.phase))
              if (s.cross) {
                const L = s.r * 5
                return (
                  <g key={i} opacity={twinkle} stroke="#e8edff" strokeWidth={Math.max(1, s.r * 0.55)} strokeLinecap="round">
                    <line x1={s.x - L} y1={s.y} x2={s.x + L} y2={s.y} />
                    <line x1={s.x} y1={s.y - L} x2={s.x} y2={s.y + L} />
                    <circle cx={s.x} cy={s.y} r={s.r * 0.85} fill="#fff" stroke="none" />
                  </g>
                )
              }
              return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e8edff" opacity={twinkle} />
            })}
          </svg>
        ))}

        {/* ========= SCENE SVG ========= */}
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0" style={{ opacity: sceneOpacity }}>
          <g transform={`translate(540, 960) scale(${camScale}) translate(-540, -960)`}>
            {/* ===== ACT 1 — THE QUESTION ===== */}
            {actIndex === 0 && (
              <>
                {/* parallax hills */}
                <g transform={`translate(${groundX * 0.35}, 0)`} opacity={1 - 0.6 * easeInCubic(cardsExit)}>
                  <polygon points="0,1095 180,940 360,1095" fill={COLORS.slate} opacity="0.55" />
                  <polygon points="170,1095 360,870 550,1095" fill={COLORS.slate} opacity="0.45" />
                  <polygon points="370,1095 540,1010 710,1095" fill={COLORS.slate} opacity="0.6" />
                  <polygon points="560,1095 750,900 940,1095" fill={COLORS.slate} opacity="0.45" />
                  <polygon points="780,1095 950,990 1120,1095" fill={COLORS.slate} opacity="0.55" />
                </g>

                {/* day counter */}
                <g className="absolute" opacity={1 - cardsExit * 0.85} style={{ transform: `translate(0, ${-cardsExit * 36}px)` }}>
                  <text
                    x="540"
                    y="390"
                    textAnchor="middle"
                    fill={COLORS.amber}
                    fontSize="144"
                    fontWeight={800}
                    fontFamily="ui-monospace, 'Cascadia Mono', Consolas, monospace"
                    letterSpacing="-2"
                    opacity={1 - (t === 0 ? 0 : cardsExit * 0.85)}
                    style={{
                      transform: `scale(${counterPop})`,
                      transformOrigin: '540px 390px',
                      textShadow: '0 0 28px rgba(245, 158, 11, 0.32)',
                    }}
                  >
                    DAY {String(dayCount).padStart(2, '0')}
                  </text>
                  {/* counter label — no invention; brief specifies only DAY xx, keep it minimal */}
                </g>

                {/* ground scroll tiles */}
                <g transform={`translate(${groundX}, 0)`} opacity={1 - cardsExit}>
                  {Array.from({ length: 40 }).map((_, i) => (
                    <rect
                      key={i}
                      x={i * 64}
                      y={1340}
                      width={62}
                      height={190}
                      fill={i % 2 === 0 ? '#1a1128' : '#231331'}
                      stroke="#2b1738"
                      strokeWidth={2}
                    />
                  ))}
                </g>

                {/* character walking in place — ~290 px tall, feet on the ground band */}
                <g
                  transform={`translate(310, 1300) scale(2.05, 2.05)`}
                  opacity={1 - cardsExit}
                >
                  {/* head */}
                  <rect x={-22} y={-86} width={44} height={38} rx={4} fill={COLORS.amber} stroke={COLORS.bg} strokeWidth={3} />
                  {/* eyes */}
                  <rect x={-10} y={-68} width={6} height={7} fill={COLORS.bg} />
                  <rect x={4} y={-68} width={6} height={7} fill={COLORS.bg} />
                  {/* torso */}
                  <rect x={-18} y={-47} width={36} height={34} rx={3} fill={COLORS.amber} stroke={COLORS.bg} strokeWidth={3} />
                  {/* legs — alternating */}
                  <rect x={-16} y={-11} width={13} height={34} rx={3} fill={COLORS.amber} stroke={COLORS.bg} strokeWidth={3}
                    style={{ transform: `translateY(${Math.sin(tScene * 10) * 3}px)`, transformOrigin: '-10px 0' }} />
                  <rect x={3} y={-11} width={13} height={34} rx={3} fill={COLORS.amber} stroke={COLORS.bg} strokeWidth={3}
                    style={{ transform: `translateY(${Math.sin(tScene * 10 + Math.PI) * 3}px)`, transformOrigin: '10px 0' }} />
                </g>
              </>
            )}

            {/* ===== ACT 2 — THE MATH ===== */}
            {actIndex === 1 && (
              <>
                {/* cards stack */}
                <MathCard
                  y={420}
                  label="BORDER DISTANCE FROM CENTER"
                  value="29,999,984"
                  unit="BLOCKS"
                  opacity={revealOp1}
                  tx={-24 * (1 - revealOp1)}
                  exit={cardsSlideOut}
                />
                <MathCard
                  y={700}
                  label="WALKING SPEED"
                  value="4.317"
                  unit="BLOCKS/S"
                  opacity={revealOp2}
                  tx={24 * (1 - revealOp2)}
                  exit={cardsSlideOut}
                />
                <MathCard
                  y={980}
                  label="TIME TO WALK"
                  value={`≈ ${(secondsCount / 1_000_000).toFixed(2)}`}
                  unit="MILLION SECONDS"
                  opacity={revealOp3}
                  tx={-24 * (1 - revealOp3)}
                  exit={cardsSlideOut}
                />
                {/* ÷ and = centered BETWEEN cards */}
                <g opacity={revealOp2 * (1 - cardsSlideOut)} fontFamily="ui-monospace, 'Cascadia Mono', Consolas, monospace" fontWeight={900} fill={COLORS.amber}>
                  <text x="540" y="662" textAnchor="middle" fontSize="56">÷</text>
                </g>
                <g opacity={revealOp3 * (1 - cardsSlideOut)} fontFamily="ui-monospace, 'Cascadia Mono', Consolas, monospace" fontWeight={900} fill={COLORS.amber}>
                  <text x="540" y="942" textAnchor="middle" fontSize="56">=</text>
                </g>
              </>
            )}

            {/* ===== ACT 3 — THE SCALE ===== */}
            {actIndex === 2 && (
              <>
                {/* chip: sprint equivalent */}
                <g opacity={chipReveal * (1 - cardsSlideOut * 0)} transform={`translate(0, ${-24 * (1 - chipReveal) - cardsSlideOut * 42}px)`}>
                  <rect x="180" y="496" width="720" height="86" rx="10" fill={COLORS.slate} stroke={COLORS.amber} strokeWidth={2} />
                  <text x="540" y="530" textAnchor="middle" fill={COLORS.amber} fontSize="24" fontWeight={800} letterSpacing="3" fontFamily="ui-monospace, Consolas, monospace">
                    SPRINT 5.612 BLOCKS/S
                  </text>
                  <text x="540" y="565" textAnchor="middle" fill={COLORS.ink} fontSize="22" letterSpacing="4" fontFamily="ui-monospace, Consolas, monospace">
                    ≈ 62 DAYS
                  </text>
                </g>

                {/* footnote assumptions */}
                <text x="540" y="1124" textAnchor="middle" fill={COLORS.slate} fontSize="17" letterSpacing="3" fontFamily="ui-monospace, Consolas, monospace" opacity={footnoteReveal * (1 - cardsSlideOut * 0)}>
                  JAVA EDITION · FLAT GROUND · NONSTOP · 1 BLOCK = 1 M
                </text>

                {/* bar track */}
                <rect x="120" y="672" width="840" height="60" rx="6" fill="#0e1626" stroke={COLORS.slate} strokeWidth={1} opacity={barAmberGrow * (1 - cardsSlideOut * 0)} />
                <rect x="120" y="836" width="840" height="60" rx="6" fill="#0e1626" stroke={COLORS.cyan} strokeWidth={1} opacity={barCyanGrow * (1 - cardsSlideOut * 0)} />

                {/* bars */}
                <rect x="120" y="672" width={amberBarPx * barAmberGrow} height="60" rx="6" fill={COLORS.amber} />
                <rect x="120" y="836" width={840 * barCyanGrow} height="60" rx="6" fill={COLORS.cyan} />

                {/* labels */}
                <text x="120" y="642" fill={COLORS.amber} fontSize="20" fontFamily="ui-monospace, Consolas, monospace" letterSpacing="3" opacity={barAmberGrow}>
                  MINECRAFT BORDER ≈ 30,000 KM
                </text>
                <text x="120" y="808" fill={COLORS.cyan} fontSize="20" fontFamily="ui-monospace, Consolas, monospace" letterSpacing="3" opacity={barCyanGrow}>
                  EARTH'S CIRCUMFERENCE ≈ 40,000 KM
                </text>
              </>
            )}
          </g>
        </svg>
    </>
  )
}
