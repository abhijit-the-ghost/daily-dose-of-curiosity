/* ==================================================================
   SUN — "Why our Sun will never become a black hole"
   star-scale series · ember-over-void editorial · violet + ember-orange
   SVG/JSX only · voice-driven from public/audio/sun-never-black-hole/metadata.json
   ================================================================== */

import { FACTS } from '../../episodes/sun-never-black-hole/facts'
import { clamp01, easeInOutCubic, easeOutCubic, anim, backOut } from '../motion/anim'

interface Word { w: string; start: number; end: number }
interface Act { id: string; index: number; label: string; words: Word[] }
export interface Metadata { title: string; totalDuration: number; words: Word[]; actBreakdown: Act[] }

export interface SunNeverBlackHoleActsProps { t: number; actIndex: number; meta: Metadata | null }

const INK   = '#F8FAFC'
const VIOLET = '#A78BFA'
const AMBER = '#F59E0B'
const FONT_MONO    = "ui-monospace, 'Cascadia Mono', Consolas, monospace"
const FONT_DISPLAY = "Anton, Impact, sans-serif"

export default function SunNeverBlackHoleActs({ t, meta }: SunNeverBlackHoleActsProps) {
  const words = meta?.words ?? []
  const find = (name: string, occ = 1) => {
    const hits = words.filter((w) => w.w.toLowerCase() === name.toLowerCase())
    return hits[occ - 1]?.start ?? 0
  }

  const tHole2       = find('hole', 2)    // 11.31
  const tBarely      = find('barely', 1)  // 17.46
  const tGiant       = find('giant', 1)   // 22.81
  const tSheds       = find('sheds', 1)   // 25.44
  const tWhite       = find('white', 1)   // 29.64
  const tWhisper     = find('whisper', 1) // 38.95

  /* timeline phase factors */
  const sunIn         = anim(t, 0.1, 0.8)
  /* waterfall entry — title card whipped in from below, accelerating cascade,
     binary opacity on arrival (never fade), anchor travels furthest */
  const casc = (start: number, dur: number, off: number) => {
    const local = clamp01((t - start) / dur)
    const e = 1 - Math.pow(1 - local, 4) // power4.out
    return { y: off * (1 - e), o: local <= 0.02 ? 0 : 1, local }
  }
  const cEyebrow = casc(0.32, 0.34, 30)   // light — snaps
  const cLine1   = casc(0.405, 0.4, 46)   // gaps shrink across the cascade
  const cLine2   = casc(0.485, 0.4, 46)
  const cAnchor  = casc(0.552, 0.48, 62)  // anchor — longest + furthest
  const anchorS  = 0.94 + 0.06 * (1 - Math.pow(1 - cAnchor.local, 3))
  const ladderIn      = anim(t, tHole2, 0.6)
  const giantP        = clamp01((t - tGiant) / 1.1)
  const giantDone     = easeInOutCubic(giantP)
  const ladderFade    = 1 - clamp01((t - tGiant) / 0.8)
  const barFill1      = easeOutCubic(clamp01((t - tHole2) / 0.55))
  const barFill2      = easeOutCubic(clamp01((t - tHole2 - 0.12) / 0.55))
  const nebulaP       = clamp01((t - tSheds) / 1.3)
  const whiteCrash    = clamp01((t - (tWhite + 0.4)) / 1.0)
  const whiteDone     = easeInOutCubic(whiteCrash)
  const stampLocal   = clamp01((t - tWhisper) / 0.4)
  const stampIn       = backOut(stampLocal)
  const stampShake    = Math.pow(1 - stampLocal, 2) * 14 * Math.sin((t - tWhisper) * 48)

  /* camera — one slow dolly-in over the whole piece (ease-in-out, origin at the Sun),
     plus a decaying punch on the stamp slam. */
  const D          = meta?.totalDuration ?? 43.088
  const camP       = easeInOutCubic(clamp01(t / (D - 0.5)))
  const camPunch   = Math.sin(stampLocal * Math.PI) * 0.022
  const camScale   = (0.94 + 0.09 * camP) * (1 + camPunch)
  const camY       = 16 * (1 - camP)
  const farShift   = Math.sin(t * 0.055 + 1.2) * 9    /* bg starfield drift — Ambient */
  const nearShift  = Math.sin(t * 0.075 + 3.1) * 15   /* fg starfield drift — Primary */

  /* Sun disc size/color — yellow main-sequence → red giant → white dwarf.
     Breathe: a slow ±1.8% ambient pulse (deterministic sin, recorder-safe). */
  const breathe   = 1 + 0.018 * Math.sin(t * 0.9)
  const baseRadius = 168
  const redGiantRadius = 300
  const whiteRadius = 24
  const sunY = 820
  const radius =
    (t < tGiant ? baseRadius * (1 - 0.25 * easeOutCubic(clamp01((t - tBarely) / 0.4))) :
    t < tWhite ? baseRadius + (redGiantRadius - baseRadius) * giantDone :
    redGiantRadius + (whiteRadius - redGiantRadius) * whiteDone) * breathe

  /* Sun disc fill */
  const sunColorStops: { offset: number; color: string; opacity?: number }[] =
    t < tGiant + 0.4
      ? [ { offset: 0, color: '#FDE68A' }, { offset: 0.42, color: '#FBBF24' }, { offset: 0.78, color: '#F97316', opacity: 0.95 }, { offset: 1, color: '#F43F5E', opacity: 0 } ]
      : t < tWhite + 0.6
        ? [ { offset: 0, color: '#FFF7ED' }, { offset: 0.35, color: '#FB923C' }, { offset: 0.72, color: '#EF4444', opacity: 0.95 }, { offset: 1, color: '#7F1D1D', opacity: 0 } ]
        : [ { offset: 0, color: '#FFFFFF' }, { offset: 0.6, color: '#E2E8F0' }, { offset: 1, color: '#94A3B8', opacity: 0 } ]
  const sunFillStops = sunColorStops.map((s) => ({ ...s, opacity: s.opacity ?? 1 }))

  /* orbiting companions — Mercury/Venus ride dotted orbits during acts 1–3, then are swallowed */
  const mercuryAngle = t * ((Math.PI * 2) / 4.6) + 2.1
  const venusAngle   = t * ((Math.PI * 2) / 7.8) + 4.4
  const R_MERC = 250, SQUASH = 0.62
  const R_VEN  = 330
  const mercX = 540 + Math.cos(mercuryAngle) * R_MERC
  const mercY = sunY + Math.sin(mercuryAngle) * R_MERC * SQUASH
  const venX  = 540 + Math.cos(venusAngle) * R_VEN
  const venY  = sunY + Math.sin(venusAngle) * R_VEN * SQUASH
  const orbitFade = giantDone <= 0.12 ? 1 : clamp01(1 - (giantDone - 0.12) / 0.76)
  const planetLabelFade = clamp01(1 - giantDone * 1.6)

  /* seeded stars */
  const stars = Array.from({ length: 46 }).map((_, i) => {
    const sx = (((i * 2654435761) >>> 0) / 4294967295) * 1080
    const sy = (((i * 2246822519) >>> 0) / 4294967295) * 880
    const r  = 0.5 + (((i * 3266489917) >>> 0) / 4294967295) * 1.5
    const o  = 0.25 + (((i * 374761393) >>> 0) / 4294967295) * 0.6
    const tw = 0.6 + 0.4 * Math.sin(t * (0.55 + (i % 6) * 0.33) + i * 1.9)
    return { key: i, sx, sy, r, o: o * tw }
  })

  return (
    <>
      {/* backdrop */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(820px 620px at 50% 8%, rgba(167,139,250,0.10), transparent 60%), radial-gradient(760px 700px at 25% 88%, rgba(239,80,40,0.06), transparent 55%), #030712' }} />

      <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0">
        <defs>
          <radialGradient id="sunGrad">
            {sunFillStops.map((s, i) => (
              <stop key={i} offset={`${(s.offset * 100).toFixed(1)}%`} stopColor={s.color} stopOpacity={s.opacity} />
            ))}
          </radialGradient>
          <radialGradient id="whiteDwarfGrad">
            <stop offset="0%"  stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E0E7FF" />
            <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.2" />
          </radialGradient>
          <radialGradient id="warmBloom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.5" />
            <stop offset="38%" stopColor="#F59E0B" stopOpacity="0.18" />
            <stop offset="75%" stopColor="#F43F5E" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="coolBloom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="45%" stopColor="#E0E7FF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="streakGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0" />
            <stop offset="32%" stopColor="#FDE68A" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="68%" stopColor="#FDE68A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="vignetteGrad" cx="50%" cy="46%" r="78%">
            <stop offset="52%" stopColor="#020611" stopOpacity="0" />
            <stop offset="82%" stopColor="#020611" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#020611" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="dustGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
          </radialGradient>
          <filter id="grainF" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* camera — single dolly-in, ease-in-out (cuts at origin of the frame) */}
        <g transform={`translate(540, ${(820 + camY).toFixed(2)}) scale(${camScale.toFixed(5)}) translate(-540, -820)`}>

        {/* parallax starfield — far (Ambient) and near (Primary) drift at different rates */}
        <g transform={`translate(${farShift.toFixed(2)}, 0)`}>
          {stars.filter((_, i) => i % 2 === 0).map((s) => <circle key={s.key} cx={s.sx} cy={s.sy} r={s.r * 0.8} fill={INK} opacity={s.o * 0.7} />)}
        </g>
        <g transform={`translate(${nearShift.toFixed(2)}, 0)`}>
          {stars.filter((_, i) => i % 2 === 1).map((s) => <circle key={s.key} cx={s.sx} cy={s.sy} r={s.r} fill={INK} opacity={s.o} />)}
        </g>

        {/* rising ember shimmer — seeded heat drifting up off the star (acts ≤2) */}
        {orbitFade > 0 && (
          <g opacity={0.8 * orbitFade}>
            {Array.from({ length: 14 }).map((_, i) => {
              const period = 6.5 + (i % 4) * 1.7
              const phase = ((((t / period) + i * 0.37) % 1) + 1) % 1
              const x = 540 + Math.sin(i * 2.39996) * (170 + (i % 5) * 48) + Math.sin(t * 1.2 + i * 2.4) * 10
              const y = 1120 - phase * 560
              const o = Math.sin(Math.PI * phase) * 0.75
              const r = 1.5 + (i % 3) * 0.9
              return <circle key={i} cx={x} cy={y} r={r} fill={i % 4 === 0 ? '#FDE68A' : '#F59E0B'} opacity={o} />
            })}
          </g>
        )}

        {/* bloom — warm core while main-sequence, cooling to an ember-white at the end */}
        <circle cx="540" cy={sunY} r={radius * 2.7} fill="url(#warmBloom)" opacity={0.55 * (1 - whiteDone)} />
        <circle cx="540" cy={sunY} r={radius * 2.5} fill="url(#coolBloom)" opacity={0.5 * whiteDone} />

        {/* ==== Sun disc ==== */}
        <g opacity={sunIn} transform={`translate(540, ${sunY})`}>
          {/* solar prominences — limb arcs that lick outward (act ≤2) */}
          {giantDone < 0.35 && (
            <g stroke="#FDBA74" strokeWidth="3" fill="none" strokeLinecap="round" opacity={0.85 * (1 - clamp01(giantDone / 0.35))}>
              {Array.from({ length: 5 }).map((_, k) => {
                const a = (k * Math.PI * 2) / 5 + 0.55
                const sweep = 0.16 + 0.03 * Math.sin(t * 2.1 + k * 1.35)
                const tipR = radius + 22 + 15 * Math.sin(t * 2.15 + k * 2.13)
                const tipx = Math.cos(a + 0.12 * Math.sin(t * 1.6 + k * 2.1)) * tipR
                const tipy = Math.sin(a + 0.12 * Math.sin(t * 1.6 + k * 2.1)) * tipR
                const bx1 = Math.cos(a - sweep) * radius
                const by1 = Math.sin(a - sweep) * radius
                const bx2 = Math.cos(a + sweep) * radius
                const by2 = Math.sin(a + sweep) * radius
                return (
                  <path
                    key={k}
                    d={`M ${bx1.toFixed(1)} ${by1.toFixed(1)} Q ${tipx.toFixed(1)} ${tipy.toFixed(1)} ${bx2.toFixed(1)} ${by2.toFixed(1)}`}
                    opacity={0.5 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2.4 + k * 1.7))}
                  />
                )
              })}
            </g>
          )}
          <circle r={radius} fill="url(#sunGrad)" stroke="rgba(251,191,36,0.35)" strokeWidth="2" strokeOpacity={1 - whiteDone * 0.9} />
          {/* halo */}
          <circle r={radius * 1.12} fill="none" stroke="#FBBF24" strokeWidth="1.5" opacity={0.18 * (1 - whiteDone * 0.9)} />
        </g>

        {/* anamorphic streak — slow-breathing horizontal lens flare through the core */}
        <rect x="70" y={sunY - 3} width="940" height="6" fill="url(#streakGrad)" opacity={0.17 + 0.06 * Math.sin(t * 0.6)} transform={`rotate(-7 540 ${sunY})`} />

        {/* dotted orbits + orbiting Mercury/Venus — fade as the red giant swallows them */}
        {orbitFade > 0 && (
          <g opacity={orbitFade}>
            <ellipse cx="540" cy={sunY} rx={R_MERC} ry={R_MERC * SQUASH} fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 7" opacity="0.22" />
            <ellipse cx="540" cy={sunY} rx={R_VEN} ry={R_VEN * SQUASH} fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 7" opacity="0.18" />
            <circle cx={venX} cy={venY} r="14" fill="#9CA3AF" stroke="#0b1220" strokeWidth="1.5" />
            <text x={venX} y={venY - 22} textAnchor="middle" fill="#D4D4D8" fontSize="13" fontFamily={FONT_MONO} letterSpacing="3" opacity={planetLabelFade}>VENUS</text>
            <circle cx={mercX} cy={mercY} r="9" fill="#9CA3AF" stroke="#0b1220" strokeWidth="1.5" />
            <text x={mercX} y={mercY - 18} textAnchor="middle" fill="#D4D4D8" fontSize="12" fontFamily={FONT_MONO} letterSpacing="3" opacity={planetLabelFade}>MERCURY</text>
          </g>
        )}

        {/* planetary nebula burst rings + ejecta particles */}
        {nebulaP > 0 && (
          <g opacity={1 - nebulaP * 0.8}>
            <circle cx="540" cy={sunY} r={80 + nebulaP * 470} fill="none" stroke="#FCA5A5" strokeWidth="3" opacity={(1 - nebulaP) * 0.7} />
            <circle cx="540" cy={sunY} r={30 + nebulaP * 280} fill="none" stroke="#FED7AA" strokeWidth="2" opacity={(1 - nebulaP * 0.9) * 0.55} />
            {Array.from({ length: 18 }).map((_, i) => {
              const a = i * 2.39996 + 0.3
              const d = nebulaP * (170 + (i % 5) * 58)
              const o = Math.max(0, 0.9 - nebulaP * 1.0)
              return (
                <circle
                  key={i}
                  cx={540 + Math.cos(a) * d}
                  cy={sunY + Math.sin(a) * d * 0.82}
                  r={2 + (i % 3)}
                  fill={i % 4 === 0 ? '#FED7AA' : '#FCA5A5'}
                  opacity={o}
                />
              )
            })}
          </g>
        )}

        {/* ========== TITLE — waterfall-entry cascade from below ========== */}
        <g opacity={cEyebrow.o} transform={`translate(0, ${cEyebrow.y.toFixed(2)})`}>
          <text x="540" y="240" textAnchor="middle" fill={INK} fontSize="17" fontFamily={FONT_MONO} letterSpacing="5" opacity="0.7">STELLAR SCIENCE</text>
        </g>
        <g opacity={cLine1.o} transform={`translate(0, ${cLine1.y.toFixed(2)})`}>
          <text x="540" y="315" textAnchor="middle" fill={INK} fontSize="72" fontFamily={FONT_DISPLAY} letterSpacing="2">THE SUN WILL</text>
        </g>
        <g opacity={cLine2.o} transform={`translate(0, ${cLine2.y.toFixed(2)})`}>
          <text x="540" y="397" textAnchor="middle" fill={INK} fontSize="72" fontFamily={FONT_DISPLAY} letterSpacing="2">NEVER BECOME</text>
        </g>
        <g opacity={cAnchor.o} transform={`translate(540, 479) scale(${anchorS.toFixed(4)}) translate(-540, -479) translate(0, ${cAnchor.y.toFixed(2)})`}>
          <text x="540" y="479" textAnchor="middle" fill={VIOLET} fontSize="72" fontFamily={FONT_DISPLAY} letterSpacing="2">A BLACK HOLE.</text>
        </g>

        {/* ========== TOV LADDER (slides up from right) ========== */}
        <g opacity={ladderIn * ladderFade} transform={`translate(${60 * (1 - ladderIn)}, 0)`}>
          <text x="60" y="1078" fill={VIOLET} fontSize="14" fontFamily={FONT_MONO} letterSpacing="4">MASS BAR · WHAT COLLAPSES INTO A BLACK HOLE</text>

          {/* THIS STAR bar — value to the right of the bar */}
          <rect x="60" y="1104" width={260 * barFill1} height="48" fill="#1a1030" stroke={VIOLET} strokeWidth="2" rx="4" />
          <text x="75" y="1137" fill={INK} fontSize="20" fontFamily={FONT_DISPLAY} letterSpacing="1" opacity={barFill1}>THIS STAR</text>
          <text x="344" y="1138" fill={INK} fontSize="26" fontFamily={FONT_DISPLAY} letterSpacing="1" opacity={barFill1}>{FACTS.sunMass.display}</text>

          {/* needed bar — value right-aligned inside */}
          <rect x="60" y="1180" width={880 * barFill2} height="48" fill="#2a0a1a" stroke={AMBER} strokeWidth="2" rx="4" />
          <text x="75" y="1213" fill={INK} fontSize="20" fontFamily={FONT_DISPLAY} letterSpacing="1" opacity={barFill2}>REQUIRED</text>
          <text x="915" y="1213" textAnchor="end" fill="#FDE68A" fontSize="19" fontFamily={FONT_MONO} letterSpacing="1" opacity={barFill2}>
            {FACTS.tovMin.display} – {FACTS.tovMax.display}
          </text>
        </g>

        {/* ========== WHITE DWARF LABEL & stamp ========== */}
        {whiteDone > 0.6 && (
          <g opacity={(whiteDone - 0.6) / 0.4}>
            <rect x="60" y="1328" width="236" height="58" fill="#0b1220" stroke={INK} strokeWidth="2" rx="6" />
            <text x="78" y="1366" fill={INK} fontSize="17" fontFamily={FONT_MONO} letterSpacing="3">WHITE DWARF</text>
          </g>
        )}

        {/* impact shockwave rings — bloom out from behind the stamp on the slam */}
        {stampLocal > 0.02 && stampLocal < 1 && (
          <g fill="none" strokeLinecap="round">
            <circle cx="540" cy="1465" r={40 + stampLocal * 380} stroke="#A78BFA" strokeWidth="4" opacity={Math.pow(1 - stampLocal, 1.6) * 0.65} />
            <circle cx="540" cy="1465" r={10 + stampLocal * 230} stroke="#DDD6FE" strokeWidth="2" opacity={Math.pow(1 - stampLocal, 1.6) * 0.45} />
          </g>
        )}

        {/* ========== STAMP ========== */}
        <g opacity={stampIn} transform={`translate(${540 + stampShake}, 1465) scale(${0.62 + 0.38 * stampIn})`} style={{ transformOrigin: '540px 1465px' }}>
          <rect x="-460" y="-64" width="920" height="128" fill="#030712" stroke={VIOLET} strokeWidth="5" />
          <rect x="-444" y="-46" width="888" height="92" fill="#030712" stroke={VIOLET} strokeWidth="2" />
          <text x="0" y="13" textAnchor="middle" fill={VIOLET} fontSize="30" fontFamily={FONT_DISPLAY} letterSpacing="3">A WHITE DWARF. NEVER A BLACK HOLE.</text>
        </g>

        {/* foreground dust — 2 out-of-focus motes drifting slowly, Primary depth cue */}
        {Array.from({ length: 2 }).map((_, i) => {
          const speed = 26 + i * 22
          const span = 1500
          const x = 1180 - (((t * speed + i * 640) % span) + span) % span
          const y = 300 + i * 640 + Math.sin(t * 0.45 + i * 2.2) * 34
          const r = 66 + i * 42
          return <circle key={i} cx={x} cy={y} r={r} fill="url(#dustGrad)" opacity="0.07" />
        })}
        </g>
        {/* end camera */}

        {/* grade — vignette + deterministic film grain (not camera-scaled) */}
        <rect width="1080" height="1920" fill="url(#vignetteGrad)" />
        <rect width="1080" height="1920" filter="url(#grainF)" opacity="0.055" />
      </svg>
    </>
  )
}
