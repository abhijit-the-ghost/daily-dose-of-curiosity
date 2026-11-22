/* ==================================================================
   EARTH NEVER MADE ITS OWN GOLD — "Earth is a collector, not a forge"
   cosmic series • amber • 3 acts • endCard false (loops to hook)
   SVG/JSX only • deterministic pure function of t
   Audio/metadata: public/audio/earth-never-made-gold/metadata.json
   ================================================================== */

import { anim, backOut, clamp01, easeInOutCubic, easeOutCubic } from '../motion/anim'

interface Word { w: string; start: number; end: number }
interface Act { id: string; index: number; label: string; words: Word[] }
export interface Metadata { title: string; totalDuration: number; words: Word[]; actBreakdown: Act[] }
export interface EarthNeverMadeGoldActsProps { t: number; actIndex: number; meta: Metadata | null }

const FONT_MONO = "ui-monospace, 'Cascadia Mono', Consolas, monospace"
const FONT_DISPLAY = "Anton, Impact, sans-serif"
const AMBER = '#F59E0B'
const AMBER_BRIGHT = '#FCD34D'
const INK = '#F8FAFC'
const DIM = '#94A3B8'

const hash01 = (i: number) => {
  let x = (i * 2654435761) >>> 0
  x ^= x >>> 16
  x = Math.imul(x, 2246822519) >>> 0
  x ^= x >>> 13
  return (x >>> 0) / 4294967296
}

const STARS = Array.from({ length: 84 }, (_, i) => ({
  x: hash01(i * 3 + 1) * 1080,
  y: hash01(i * 3 + 2) * 1660,
  r: 0.55 + hash01(i * 3 + 3) * 2.1,
  tw: 0.55 + hash01(i * 7 + 9) * 2.0,
  ph: hash01(i * 11 + 5) * Math.PI * 2,
}))

const RING_PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const ang = (i / 28) * Math.PI * 2
  return {
    ang,
    rad: 76 + hash01(i + 101) * 16,
    dx: Math.cos(ang) * (90 + hash01(i + 201) * 190),
    dy: -130 - hash01(i + 301) * 360,
    s: 2.8 + hash01(i + 401) * 5.4,
  }
})

const EJECTA = Array.from({ length: 40 }, (_, i) => ({
  a: -Math.PI * 0.9 + hash01(i + 31) * Math.PI * 1.8,
  dist: 110 + hash01(i + 61) * 440,
  size: 2.0 + hash01(i + 91) * 5.6,
  delay: hash01(i + 121) * 0.22,
}))

const METEORS = Array.from({ length: 10 }, (_, i) => ({
  x: 170 + hash01(i + 501) * 780,
  y: -140 - hash01(i + 601) * 450,
  tx: 330 + hash01(i + 701) * 420,
  ty: 835 + hash01(i + 801) * 330,
  d: 0.07 * i,
}))

const DUST = Array.from({ length: 24 }, (_, i) => ({
  x: 80 + hash01(i + 901) * 920,
  y: 240 + hash01(i + 1001) * 1260,
  r: 24 + hash01(i + 1101) * 80,
  o: 0.015 + hash01(i + 1201) * 0.03,
}))

export default function EarthNeverMadeGoldActs({ t, actIndex, meta }: EarthNeverMadeGoldActsProps) {
  const words = meta?.words ?? []
  const find = (name: string, occ = 1) => {
    const key = name.toLowerCase()
    const hits = words.filter((w) => w.w.toLowerCase().replace(/[^a-z0-9]/g, '') === key)
    return hits[occ - 1]?.start ?? 999
  }

  const a1 = meta?.actBreakdown?.[0]?.words?.[0]?.start ?? 0.1
  const a2 = meta?.actBreakdown?.[1]?.words?.[0]?.start ?? 6.0
  const a3 = meta?.actBreakdown?.[2]?.words?.[0]?.start ?? 14.5
  const end = meta?.totalDuration ?? 30

  const tNever = find('never', 1)
  const tForge = find('forge', 1)
  const tCollects1 = find('collects', 1)
  const tBorn = find('born', 1)
  const tCollided = find('collided', 1)
  const tKilonova = find('kilonova', 1)
  const tSank = find('sank', 1)
  const tCore = find('core', 1)
  const tMine = find('mine', 1)
  const tMeteorites = find('meteorites', 1)
  const tCollects2 = find('collects', 2)

  const hookIn = anim(t, a1, 0.22)
  const neverPunch = anim(t, Math.min(tNever, a1 + 0.55), 0.28, backOut)
  const forgeIn = anim(t, Math.min(tForge, a1 + 1.7), 0.32)
  const collects1In = anim(t, Math.min(tCollects1, a1 + 3.0), 0.34)
  const ringPulse = 0.72 + 0.28 * Math.sin(t * 2.4)
  const ringDrift = anim(t, a1 + 0.15, 1.3, easeOutCubic)

  const act2In = anim(t, a2, 0.28)
  const collideP = anim(t, Math.min(tCollided, a2 + 2.6), 0.75, easeInOutCubic)
  const blastP = anim(t, Math.min(tCollided, a2 + 2.7) + 0.35, 0.95, easeOutCubic)
  const kilonovaIn = anim(t, Math.min(tKilonova, a2 + 3.2), 0.3)
  const bornIn = anim(t, Math.min(tBorn, a2 + 0.2), 0.3)

  const act3In = anim(t, a3, 0.28)
  const sinkP = anim(t, Math.min(tSank, a3 + 1.0), 1.5, easeInOutCubic)
  const mineIn = anim(t, Math.min(tMine, a3 + 2.8), 0.35)
  const meteorP = anim(t, Math.min(tMeteorites, a3 + 3.2), 1.35, easeOutCubic)
  const finalIn = anim(t, Math.min(tCollects2, end - 4.2), 0.35)
  const loopHold = clamp01((t - (end - 3.1)) / 0.5)
  // EndCard covers ~end-2.6s..end-0.4s; reveal the hook frame in the last 0.4s for a seamless loop.
  const loopFadeToHook = clamp01((t - (end - 0.4)) / 0.4)

  const cam = actIndex === 0
    ? 1.015 + 0.02 * easeInOutCubic(clamp01((t - a1) / Math.max(0.1, a2 - a1)))
    : actIndex === 1
      ? 1.03 - 0.015 * easeInOutCubic(clamp01((t - a2) / Math.max(0.1, a3 - a2)))
      : 1.015 - 0.01 * easeInOutCubic(clamp01((t - a3) / Math.max(0.1, end - a3)))
  const punch = actIndex === 0 ? 1 + (1 - clamp01((t - a1) / 0.18)) * 0.035 : 1

  const showAct1 = actIndex === 0 || loopFadeToHook > 0
  const showAct2 = actIndex === 1 && loopFadeToHook < 1
  const showAct3 = actIndex === 2 && loopFadeToHook < 1
  const act1Opacity = actIndex === 0 ? 1 : loopFadeToHook
  const act3Opacity = actIndex === 2 ? 1 - loopFadeToHook * 0.92 : 0

  return (
    <>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(1000px 900px at 50% 32%, rgba(245,158,11,0.10), transparent 62%), radial-gradient(700px 700px at 50% 72%, rgba(251,191,36,0.05), transparent 70%), #030712' }} />
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0">
        <defs>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.95" />
            <stop offset="45%" stopColor={AMBER} stopOpacity="0.55" />
            <stop offset="100%" stopColor={AMBER} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#EA580C" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7C2D12" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="earthCut" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="55%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="softGlow"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        <g transform={`translate(540,960) scale(${cam * punch}) translate(-540,-960)`}>
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#E2E8F0" opacity={0.22 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph))} />
          ))}
          {DUST.map((d, i) => (
            <circle key={`d-${i}`} cx={d.x} cy={d.y + Math.sin(t * 0.25 + i) * 8} r={d.r} fill="#FCD34D" opacity={d.o} />
          ))}

          {showAct1 && (
            <g opacity={hookIn * act1Opacity}>
              <text x="540" y="338" textAnchor="middle" fill={DIM} fontSize="22" fontFamily={FONT_MONO} letterSpacing="6" opacity={anim(t < a2 ? t : a1 + 0.3, a1 + 0.05, 0.25)}>
                ORIGIN TRACE // Au
              </text>

              <g transform="translate(540,730)">
                <circle r={185 * ringPulse} fill="url(#goldGlow)" opacity={0.32} />
                <ellipse cx="0" cy="22" rx="156" ry="54" fill="none" stroke="#92400E" strokeWidth="30" opacity="0.32" />
                <ellipse cx="0" cy="0" rx="156" ry="54" fill="none" stroke={AMBER} strokeWidth="25" />
                <ellipse cx="0" cy="-2" rx="156" ry="54" fill="none" stroke={AMBER_BRIGHT} strokeWidth="4.5" opacity="0.85" />
                <ellipse cx="0" cy="19" rx="120" ry="36" fill="none" stroke="rgba(3,7,18,0.45)" strokeWidth="11" />
                {RING_PARTICLES.map((p, i) => {
                  const pp = clamp01((ringDrift - i * 0.012) / 0.75)
                  const e = easeOutCubic(pp)
                  const x = Math.cos(p.ang) * p.rad + p.dx * e
                  const y = Math.sin(p.ang) * p.rad * 0.35 + p.dy * e
                  return <circle key={i} cx={x} cy={y} r={p.s * (1 - e * 0.35)} fill={AMBER_BRIGHT} opacity={0.12 + 0.88 * (1 - e * 0.8)} />
                })}
              </g>

              <g opacity={anim(t < a2 ? t : a1 + 1, Math.min(tNever, a1 + 0.45), 0.12)} transform={`translate(0 ${ (1 - neverPunch) * 28 })`}>
                <text x="540" y="1088" textAnchor="middle" fill={INK} fontSize="92" fontFamily={FONT_DISPLAY} letterSpacing="2">NEVER MADE</text>
                <text x="540" y="1180" textAnchor="middle" fill={AMBER} fontSize="92" fontFamily={FONT_DISPLAY} letterSpacing="2">ON EARTH</text>
              </g>

              <g opacity={forgeIn * (actIndex === 0 ? 1 : 0)}>
                <rect x="250" y="1240" width="580" height="60" rx="12" fill="rgba(148,163,184,0.10)" stroke="rgba(148,163,184,0.28)" />
                <text x="540" y="1279" textAnchor="middle" fill={INK} fontSize="28" fontFamily={FONT_MONO} letterSpacing="3">OUR PLANET CAN'T FORGE IT</text>
              </g>

              <g opacity={(actIndex === 0 ? collects1In : 1) * act1Opacity}>
                <rect x="265" y="1318" width="550" height="64" rx="12" fill="rgba(245,158,11,0.14)" stroke="rgba(245,158,11,0.5)" />
                <text x="540" y="1361" textAnchor="middle" fill={AMBER_BRIGHT} fontSize="30" fontFamily={FONT_MONO} letterSpacing="4">IT ONLY COLLECTS IT</text>
              </g>
            </g>
          )}

          {showAct2 && (
            <g opacity={act2In}>
              <text x="540" y="290" textAnchor="middle" fill={DIM} fontSize="20" fontFamily={FONT_MONO} letterSpacing="5" opacity={bornIn}>HEAVY ELEMENT FORGE</text>
              <g transform="translate(540,740)">
                {(() => {
                  const d = 230 * (1 - easeInOutCubic(collideP))
                  const ang = t * 2.5 * (1 + collideP * 2.4)
                  const x1 = Math.cos(ang) * d
                  const y1 = Math.sin(ang) * d * 0.45
                  const x2 = -x1
                  const y2 = -y1
                  const merged = collideP > 0.92
                  return (
                    <>
                      <circle r={95 + blastP * 230} fill="url(#goldGlow)" opacity={blastP * 0.78} />
                      {!merged && (
                        <>
                          <circle cx={x1} cy={y1} r="36" fill="#CBD5E1" />
                          <circle cx={x1} cy={y1} r="36" fill="none" stroke="#F8FAFC" strokeWidth="4" />
                          <circle cx={x2} cy={y2} r="34" fill="#94A3B8" />
                          <circle cx={x2} cy={y2} r="34" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                        </>
                      )}
                      {merged && <circle r={28 + blastP * 22} fill="#F8FAFC" opacity={1 - blastP * 0.22} filter="url(#softGlow)" />}
                      {blastP > 0 && blastP < 1 && <circle r={45 + blastP * 380} fill="none" stroke={AMBER} strokeWidth={9 * (1 - blastP)} opacity={0.85 * (1 - blastP)} />}
                      {EJECTA.map((p, i) => {
                        const ep = clamp01((blastP - p.delay) / 0.8)
                        const ee = easeOutCubic(ep)
                        const px = Math.cos(p.a) * p.dist * ee
                        const py = Math.sin(p.a) * p.dist * ee * 0.72
                        return <circle key={i} cx={px} cy={py} r={p.size * (1 - ee * 0.35)} fill={i % 4 === 0 ? AMBER_BRIGHT : AMBER} opacity={ep > 0 ? 0.92 * (1 - ee * 0.65) : 0} />
                      })}
                      {blastP > 0.18 && (
                        <text x="0" y="8" textAnchor="middle" fill={AMBER_BRIGHT} fontSize="42" fontFamily={FONT_MONO} fontWeight="700" opacity={clamp01((blastP - 0.18) / 0.2) * (1 - clamp01((blastP - 0.86) / 0.14))}>Au</text>
                      )}
                    </>
                  )
                })()}
              </g>

              <g opacity={kilonovaIn}>
                <rect x="265" y="1145" width="550" height="62" rx="12" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.45)" />
                <text x="540" y="1185" textAnchor="middle" fill={AMBER_BRIGHT} fontSize="27" fontFamily={FONT_MONO} letterSpacing="3">KILONOVA // MOST LIKELY SOURCE</text>
                <text x="540" y="1252" textAnchor="middle" fill={DIM} fontSize="18" fontFamily={FONT_MONO} letterSpacing="2" opacity="0.88">heavy elements blasted into space</text>
              </g>
            </g>
          )}

          {showAct3 && (
            <g opacity={act3In * act3Opacity}>
              <g transform="translate(540,760)">
                <circle r="282" fill="url(#earthCut)" stroke="#334155" strokeWidth="4" />
                <clipPath id="earthClip"><circle r="278" /></clipPath>
                <g clipPath="url(#earthClip)">
                  <rect x="-280" y="-280" width="560" height="280" fill="#0B1220" />
                  <rect x="-280" y="0" width="560" height="280" fill="#111827" />
                  <circle r="186" fill="#1F2937" opacity="0.95" />
                  <circle r="106" fill="url(#coreGlow)" />
                  <circle r="106" fill="#7C2D12" opacity="0.5" />
                  <path d="M -280 -40 C -120 -70, -20 10, 120 -30 C 190 -50, 240 -20, 280 -35 L 280 -280 L -280 -280 Z" fill="#020617" opacity="0.22" />
                </g>
                <line x1="0" y1="-282" x2="0" y2="282" stroke="rgba(148,163,184,0.32)" strokeWidth="2" />
                <line x1="-282" y1="0" x2="282" y2="0" stroke="rgba(148,163,184,0.16)" strokeWidth="2" />

                {Array.from({ length: 14 }, (_, i) => {
                  const x = -170 + (i % 7) * 55
                  const startY = -170 + Math.floor(i / 7) * 55
                  const sp = clamp01((sinkP - i * 0.03) / 0.9)
                  const y = startY + sp * (120 - startY)
                  const toCore = clamp01((y - 20) / 90)
                  return <circle key={i} cx={x} cy={y} r={5.5} fill={AMBER_BRIGHT} opacity={(1 - toCore * 0.68) * anim(t, a3 + 0.2, 0.3)} />
                })}

                <text x="-132" y="-212" fill={DIM} fontSize="18" fontFamily={FONT_MONO} letterSpacing="3" opacity={anim(t, a3 + 0.15, 0.3)}>CRUST</text>
                <text x="-132" y="152" fill="#FDBA74" fontSize="18" fontFamily={FONT_MONO} letterSpacing="3" opacity={anim(t, Math.min(tCore, a3 + 1.7), 0.3)}>CORE</text>
                <g opacity={anim(t, Math.min(tSank, a3 + 1.0), 0.35)}>
                  <text x="150" y="-120" textAnchor="middle" fill={AMBER} fontSize="24" fontFamily={FONT_MONO} letterSpacing="2">MOST SANK</text>
                  <path d="M 150 -105 L 150 -40" stroke={AMBER} strokeWidth="4" markerEnd="url(#arrowDown)" />
                </g>

                {METEORS.map((m, i) => {
                  const mp = clamp01((meteorP - m.d) / 0.28)
                  const x = m.x - 540 + (m.tx - m.x) * easeOutCubic(mp)
                  const y = m.y - 760 + (m.ty - m.y) * easeOutCubic(mp)
                  const landed = mp >= 1
                  return (
                    <g key={i} opacity={mp > 0 ? 1 : 0}>
                      {!landed ? (
                        <>
                          <line x1={x - (m.tx - m.x) * 0.08} y1={y - (m.ty - m.y) * 0.08} x2={x} y2={y} stroke={AMBER_BRIGHT} strokeWidth="4" strokeLinecap="round" />
                          <circle cx={x} cy={y} r="5" fill={AMBER_BRIGHT} />
                        </>
                      ) : (
                        <circle cx={m.tx - 540} cy={m.ty - 760} r="4.6" fill={AMBER} opacity={0.92} />
                      )}
                    </g>
                  )
                })}
              </g>

              <g opacity={mineIn}>
                <rect x="210" y="1130" width="660" height="68" rx="12" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.45)" />
                <text x="540" y="1174" textAnchor="middle" fill={AMBER_BRIGHT} fontSize="28" fontFamily={FONT_MONO} letterSpacing="3">GOLD WE MINE: LIKELY DELIVERED LATER</text>
              </g>

              <g opacity={finalIn}>
                <text x="540" y="1278" textAnchor="middle" fill={INK} fontSize="56" fontFamily={FONT_DISPLAY} letterSpacing="2" opacity={0.96}>COLLECTED, NOT FORGED</text>
                <text x="540" y="1332" textAnchor="middle" fill={DIM} fontSize="20" fontFamily={FONT_MONO} letterSpacing="3" opacity={0.9 - loopHold * 0.45}>Earth collects it.</text>
              </g>
            </g>
          )}

          <defs>
            <marker id="arrowDown" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 0 L 10 0 L 5 10 z" fill={AMBER} />
            </marker>
          </defs>
        </g>
      </svg>
    </>
  )
}