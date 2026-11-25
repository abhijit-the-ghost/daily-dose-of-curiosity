/* ==================================================================
   WHY URANUS ROLLS AROUND THE SUN ON ITS SIDE
   "Counterintuitive but defensible" — cosmic series • amber
   3 acts • endCard false • seamless loop back to Act 1 hook frame
   Detailed SVG Uranus (bands, glow, thin rings) • deterministic by t
   Audio/metadata: public/audio/uranus-tilted-sideways/metadata.json
   ================================================================== */

import { anim, backOut, clamp01, easeInOutCubic, easeOutCubic } from '../motion/anim'

interface Word { w: string; start: number; end: number }
interface Act { id: string; index: number; label: string; words: Word[] }
export interface Metadata { title: string; totalDuration: number; words: Word[]; actBreakdown: Act[] }
export interface UranusTiltedSidewaysActsProps { t: number; actIndex: number; meta: Metadata | null }

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

const STARS = Array.from({ length: 96 }, (_, i) => ({
  x: hash01(i * 3 + 1) * 1080,
  y: hash01(i * 3 + 2) * 1700,
  r: 0.45 + hash01(i * 3 + 3) * 2.3,
  tw: 0.45 + hash01(i * 7 + 9) * 2.1,
  ph: hash01(i * 11 + 5) * Math.PI * 2,
}))

const DEBRIS = Array.from({ length: 36 }, (_, i) => ({
  a: hash01(i + 31) * Math.PI * 2,
  d: 90 + hash01(i + 61) * 430,
  s: 1.8 + hash01(i + 91) * 6.2,
  sp: 0.35 + hash01(i + 121) * 1.2,
}))

function UranusPlanet({ x, y, r, tilt, spin, ringAlpha = 0.9, glow = 0.2, showAxis = true }: {
  x: number; y: number; r: number; tilt: number; spin: number; ringAlpha?: number; glow?: number; showAxis?: boolean
}) {
  const bands = [-0.46, -0.24, -0.03, 0.18, 0.38]
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt})`}>
      <circle r={r * 2.1} fill="rgba(103,232,249,0.10)" opacity={glow} />
      <defs>
        <radialGradient id={`uBody-${x}-${y}-${r}`} cx="34%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#DFFFFF" />
          <stop offset="38%" stopColor="#9AEAF5" />
          <stop offset="72%" stopColor="#5CCDDD" />
          <stop offset="100%" stopColor="#1A667B" />
        </radialGradient>
        <clipPath id={`uClip-${x}-${y}-${r}`}><circle r={r} /></clipPath>
      </defs>
      <circle r={r} fill={`url(#uBody-${x}-${y}-${r})`} />
      <g clipPath={`url(#uClip-${x}-${y}-${r})`}>
        <ellipse cx={-r * 0.15} cy={-r * 0.18} rx={r * 1.1} ry={r * 0.55} fill="rgba(255,255,255,0.10)" />
        {bands.map((by, i) => (
          <ellipse
            key={i}
            cx={Math.sin(spin * 0.3 + i) * r * 0.08}
            cy={by * r}
            rx={r * (1.03 - Math.abs(by) * 0.22)}
            ry={r * 0.085}
            fill={i % 2 === 0 ? 'rgba(236,254,255,0.12)' : 'rgba(8,47,73,0.08)'}
          />
        ))}
        <ellipse cx={r * 0.15} cy={r * 0.35} rx={r * 0.95} ry={r * 0.45} fill="rgba(2,6,23,0.10)" />
        {/* subtle storms */}
        <ellipse cx={r * 0.28} cy={-r * 0.05} rx={r * 0.14} ry={r * 0.05} fill="rgba(255,255,255,0.09)" />
        <ellipse cx={-r * 0.25} cy={r * 0.22} rx={r * 0.11} ry={r * 0.04} fill="rgba(255,255,255,0.06)" />
      </g>
      <circle r={r} fill="none" stroke="rgba(236,254,255,0.22)" strokeWidth="2.5" />
      {/* thin rings - Uranus has faint rings, keep subtle */}
      <g opacity={ringAlpha}>
        <ellipse rx={r * 1.75} ry={r * 0.28} fill="none" stroke="rgba(248,250,252,0.24)" strokeWidth="6" />
        <ellipse rx={r * 1.62} ry={r * 0.24} fill="none" stroke="rgba(253,230,138,0.22)" strokeWidth="2.5" />
        <ellipse rx={r * 1.9} ry={r * 0.32} fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth="1.8" />
      </g>
      {showAxis && (
        <>
          <line x1="0" y1={-r * 1.55} x2="0" y2={r * 1.55} stroke="rgba(248,250,252,0.72)" strokeWidth="3" strokeDasharray="8 10" />
          <circle cy={-r * 1.55} r="5.5" fill={INK} />
          <circle cy={r * 1.55} r="5.5" fill={INK} />
        </>
      )}
    </g>
  )
}

function SmallPlanet({ x, y, r, color, tilt, label }: { x: number; y: number; r: number; color: string; tilt: number; label: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={r * 1.5} fill={color} opacity="0.08" />
      <g transform={`rotate(${tilt})`}>
        <circle r={r} fill={color} />
        <circle r={r} fill="none" stroke="rgba(248,250,252,0.18)" strokeWidth="1.8" />
        <line x1="0" y1={-r * 1.45} x2="0" y2={r * 1.45} stroke="rgba(248,250,252,0.35)" strokeWidth="2" strokeDasharray="5 7" />
      </g>
      <text y={r + 34} textAnchor="middle" fill={DIM} fontSize="18" fontFamily={FONT_MONO} letterSpacing="2">{label}</text>
    </g>
  )
}

export default function UranusTiltedSidewaysActs({ t, actIndex, meta }: UranusTiltedSidewaysActsProps) {
  const words = meta?.words ?? []
  const find = (name: string, occ = 1) => {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    const hits = words.filter((w) => w.w.toLowerCase().replace(/[^a-z0-9]/g, '') === key)
    return hits[occ - 1]?.start ?? 999
  }

  const a1 = meta?.actBreakdown?.[0]?.words?.[0]?.start ?? 0.1
  const a2 = meta?.actBreakdown?.[1]?.words?.[0]?.start ?? 7.0
  const a3 = meta?.actBreakdown?.[2]?.words?.[0]?.start ?? 14.0
  const end = meta?.totalDuration ?? 30

  const tUranus = find('uranus', 1)
  const tSide = find('side', 1)
  const tCrashing = find('crashing', 1)
  const tKnocked = find('knocked', 1)
  const t42a = find('42', 1)
  const t42b = find('42', 2)

  const tWildest = find('wildest', 1)

  const hookIn = anim(t, a1, 0.22)
  const uranusIn = anim(t, Math.min(tUranus, a1 + 0.9), 0.45, easeOutCubic)
  const sidePunch = anim(t, Math.min(tSide, a1 + 2.1), 0.3, backOut)

  const act2In = anim(t, a2, 0.28)
  const crashingIn = anim(t, Math.min(tCrashing, a2 + 1.4), 0.45)
  const impactP = anim(t, Math.min(tKnocked, a2 + 2.8), 0.85, easeInOutCubic)
  const knockedP = anim(t, Math.min(tKnocked, a2 + 3.1), 1.1, easeOutCubic)

  const act3In = anim(t, a3, 0.28)
  const sun42 = anim(t, Math.min(t42a, a3 + 1.0), 0.35, backOut)
  const dark42 = anim(t, Math.min(t42b, a3 + 2.1), 0.35, backOut)
  const wildest = anim(t, Math.min(tWildest, a3 + 4.0), 0.35)

  const loopFade = clamp01((t - (end - 0.5)) / 0.5)
  const showAct1 = actIndex === 0 || loopFade > 0
  const showAct2 = actIndex === 1 && loopFade < 1
  const showAct3 = actIndex === 2 && loopFade < 1
  const a1Op = actIndex === 0 ? 1 : loopFade
  const a2Op = actIndex === 1 ? 1 - loopFade : 0
  const a3Op = actIndex === 2 ? 1 - loopFade : 0

  const cam = 1.01 + 0.01 * Math.sin(t * 0.22)
  const punch = actIndex === 0 ? 1 + (1 - clamp01((t - a1) / 0.18)) * 0.03 : 1
  const rollTilt = 90 + Math.sin(t * 0.5) * 2.2
  const spin = t * 22
  const tipped = 18 + 74 * easeOutCubic(knockedP)

  return (
    <>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(1050px 900px at 50% 30%, rgba(245,158,11,0.11), transparent 62%), radial-gradient(760px 720px at 50% 76%, rgba(103,232,249,0.07), transparent 70%), #030712' }} />
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0">
        <defs>
          <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.95" />
            <stop offset="45%" stopColor={AMBER} stopOpacity="0.65" />
            <stop offset="100%" stopColor={AMBER} stopOpacity="0" />
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        <g transform={`translate(540,960) scale(${cam * punch}) translate(-540,-960)`}>
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#E2E8F0" opacity={0.18 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph))} />
          ))}

          {showAct1 && (
            <g opacity={hookIn * a1Op}>
              {/* Sun */}
              <g transform="translate(540,470)">
                <circle r="150" fill="url(#sunG)" opacity="0.42" />
                <circle r="54" fill={AMBER} filter="url(#glow)" />
                <circle r="54" fill="none" stroke={AMBER_BRIGHT} strokeWidth="3" opacity="0.85" />
              </g>

              {/* Other planets upright */}
              <SmallPlanet x={220} y={770} r={24} color="#94A3B8" tilt={8 + t * 25} label="MERCURY" />
              <SmallPlanet x={385} y={700} r={30} color="#FCA5A5" tilt={-6 + t * 20} label="VENUS" />
              <SmallPlanet x={680} y={700} r={32} color="#60A5FA" tilt={23 + t * 22} label="EARTH" />
              <SmallPlanet x={855} y={770} r={27} color="#FDBA74" tilt={25 + t * 24} label="MARS" />

              {/* Uranus hero */}
              <g opacity={uranusIn}>
                <UranusPlanet x={540} y={1125} r={112} tilt={rollTilt} spin={spin} ringAlpha={0.95} glow={0.28} />
                <text x="540" y="1305" textAnchor="middle" fill={AMBER_BRIGHT} fontSize="34" fontFamily={FONT_MONO} letterSpacing="5">URANUS</text>
              </g>

              <g transform={`translate(0 ${(1 - sidePunch) * 24})`}>
                <text x="540" y="1445" textAnchor="middle" fill={INK} fontSize="72" fontFamily={FONT_DISPLAY} letterSpacing="1" opacity={0.95}>EVERY PLANET SPINS</text>
                <text x="540" y="1528" textAnchor="middle" fill={AMBER} fontSize="82" fontFamily={FONT_DISPLAY} letterSpacing="1" opacity={sidePunch}>URANUS ROLLS SIDEWAYS</text>
              </g>
            </g>
          )}

          {showAct2 && (
            <g opacity={act2In * a2Op}>
              <g transform="translate(540,760)">
                <circle r="320" fill="rgba(245,158,11,0.03)" stroke="rgba(245,158,11,0.1)" />
                {DEBRIS.map((d, i) => {
                  const a = d.a + t * 0.16 * d.sp
                  const dd = d.d * (0.85 + 0.15 * Math.sin(t * 0.32 + i))
                  return <circle key={i} cx={Math.cos(a) * dd} cy={Math.sin(a) * dd * 0.4} r={d.s} fill={i % 6 === 0 ? AMBER_BRIGHT : '#94A3B8'} opacity={0.25 + 0.5 * hash01(i + 7)} />
                })}

                <UranusPlanet x={0} y={40} r={96} tilt={tipped} spin={t * 16} ringAlpha={0.85} glow={0.2} />

                {/* Impactors */}
                <g opacity={1 - clamp01(impactP * 1.1)}>
                  <g transform={`translate(${-360 + impactP * 320}, ${-170 + impactP * 150})`}>
                    <circle r="38" fill="#CBD5E1" />
                    <circle r="38" fill="none" stroke="#F8FAFC" strokeWidth="3" opacity="0.5" />
                  </g>
                  <g transform={`translate(${330 - impactP * 290}, ${180 - impactP * 140})`}>
                    <circle r="26" fill="#94A3B8" />
                  </g>
                </g>
                {impactP > 0.45 && impactP < 1.05 && (
                  <circle r={30 + (impactP - 0.45) * 280} fill="none" stroke={AMBER} strokeWidth={10 * (1 - clamp01((impactP - 0.45) / 0.6))} opacity={0.85 * (1 - clamp01((impactP - 0.45) / 0.6))} />
                )}
              </g>

              <g opacity={crashingIn}>
                <rect x="230" y="1150" width="620" height="66" rx="12" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.45)" />
                <text x="540" y="1192" textAnchor="middle" fill={AMBER_BRIGHT} fontSize="28" fontFamily={FONT_MONO} letterSpacing="3">GIANT IMPACTS // LEADING MODEL</text>
              </g>
              <text x="540" y="1300" textAnchor="middle" fill={INK} fontSize="62" fontFamily={FONT_DISPLAY} letterSpacing="1" opacity={knockedP}>LIKELY KNOCKED OVER</text>
              <text x="540" y="1348" textAnchor="middle" fill={DIM} fontSize="20" fontFamily={FONT_MONO} letterSpacing="2" opacity={knockedP * 0.9}>Astronomers think — not directly observed</text>
            </g>
          )}

          {showAct3 && (
            <g opacity={act3In * a3Op}>
              <g transform="translate(540,760)">
                <circle cx="-360" cy="0" r="54" fill={AMBER} filter="url(#glow)" />
                <circle cx="-360" cy="0" r="160" fill="url(#sunG)" opacity="0.35" />
                {Array.from({ length: 8 }, (_, i) => {
                  const yy = -140 + i * 40
                  return <line key={i} x1="-290" y1={yy * 0.45} x2={-130} y2={yy} stroke="rgba(253,230,138,0.24)" strokeWidth="4" strokeLinecap="round" />
                })}

                <UranusPlanet x={0} y={0} r={116} tilt={90} spin={t * 10} ringAlpha={0.9} glow={0.22} />
                {/* day/night overlay on tilted pole orientation */}
                <g transform="rotate(90)">
                  <clipPath id="uDayClip"><circle r="116" /></clipPath>
                  <g clipPath="url(#uDayClip)">
                    <rect x="-116" y="-116" width="116" height="232" fill="rgba(253,230,138,0.16)" />
                    <rect x="0" y="-116" width="116" height="232" fill="rgba(2,6,23,0.24)" />
                  </g>
                </g>
              </g>

              <g opacity={sun42}>
                <rect x="130" y="1125" width="380" height="80" rx="12" fill="rgba(245,158,11,0.14)" stroke="rgba(245,158,11,0.5)" />
                <text x="320" y="1162" textAnchor="middle" fill={AMBER_BRIGHT} fontSize="40" fontFamily={FONT_DISPLAY}>~42 YEARS</text>
                <text x="320" y="1192" textAnchor="middle" fill={DIM} fontSize="17" fontFamily={FONT_MONO} letterSpacing="2">SUNLIGHT</text>
              </g>
              <g opacity={dark42}>
                <rect x="570" y="1125" width="380" height="80" rx="12" fill="rgba(59,130,246,0.12)" stroke="rgba(147,197,253,0.4)" />
                <text x="760" y="1162" textAnchor="middle" fill="#BFDBFE" fontSize="40" fontFamily={FONT_DISPLAY}>~42 YEARS</text>
                <text x="760" y="1192" textAnchor="middle" fill={DIM} fontSize="17" fontFamily={FONT_MONO} letterSpacing="2">DARKNESS</text>
              </g>

              <text x="540" y="1310" textAnchor="middle" fill={INK} fontSize="64" fontFamily={FONT_DISPLAY} letterSpacing="1" opacity={wildest}>WILDEST SEASONS</text>
              <text x="540" y="1358" textAnchor="middle" fill={DIM} fontSize="20" fontFamily={FONT_MONO} letterSpacing="2" opacity={wildest * 0.9}>97.77° tilt makes Uranus extreme</text>
            </g>
          )}
        </g>
      </svg>
    </>
  )
}
