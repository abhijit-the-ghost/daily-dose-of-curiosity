/* ==================================================================
   SpaceSoundActs — scene content for "Space games lie about sound"
   Pure SVG/JSX 2D · voice-driven anchors · entry from src/components/Episode.tsx.
   The stage wrapper (audio, recorder hooks, HUD, captions, end card)
   lives in Episode.tsx — this file renders ONLY the act SVG + starfield.
   ================================================================== */

import Starfield from './Starfield'
import { STAR_SPECS } from '../theme/starfield'
import { clamp01, easeInOutCubic, easeOutCubic, anim } from '../motion/anim'

interface Word { w: string; start: number; end: number }
interface Act { id: string; index: number; label: string; words: Word[] }
export interface Metadata { title: string; totalDuration: number; words: Word[]; actBreakdown: Act[] }

export interface SpaceSoundActsProps { t: number; actIndex: number; meta: Metadata | null }

/* ---------- cluster points (seeded) ---------- */
const CLUSTER_POINTS = (() => {
  const rand = ((seed: number) => {
    let a = seed >>> 0
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  })(0xcafe)
  return Array.from({ length: 340 }, () => {
    const a = rand() * Math.PI * 2
    const r = Math.pow(rand(), 1.75) * 300
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, size: 0.5 + rand() * 1.8, o: 0.25 + rand() * 0.6 }
  })
})()

export default function SpaceSoundActs({ t, actIndex, meta }: SpaceSoundActsProps) {
  const words = meta?.words ?? []

  /* ---- derived anchor times (seconds, absolute) ---- */
  const getWord = (w: string) => words.find((x) => x.w.toLowerCase() === w.toLowerCase())
  const ex = getWord('explosions')?.start ?? -1
  const realT = getWord('Real')?.start ?? -1
  const soundT = getWord('Sound')?.start ?? -1
  const spaceT = words.length ? (words.filter((w) => w.w === 'Space').map((w) => w.start).find((s) => s > 5) ?? -1) : -1
  const deadT = getWord('Dead')?.start ?? -1
  const twistT = getWord('twist')?.start ?? -1
  const chandraT = getWord('Chandra')?.start ?? -1
  const bFlatT = getWord('B-flat')?.start ?? -1
  const octaveT = getWord('fifty-seven')?.start ?? -1

  /* ---- camera per act ---- */
  const camScale = (() => {
    if (words.length === 0) return 1
    const acts = meta!.actBreakdown
    const a0 = acts[0]; const a1 = acts[1]; const a2 = acts[2]
    if (actIndex === 0) {
      const p = clamp01((t - a0.words[0].start) / (a0.words[a0.words.length - 1].end - a0.words[0].start))
      return 1 + 0.06 * easeInOutCubic(p)
    }
    if (actIndex === 1) {
      const p = clamp01((t - a1.words[0].start) / (a1.words[a1.words.length - 1].end - a1.words[0].start))
      return 1.35 - 0.35 * easeInOutCubic(p)
    }
    const p = clamp01((t - a2.words[0].start) / (a2.words[a2.words.length - 1].end - a2.words[0].start))
    return 1.0 - 0.15 * easeInOutCubic(p)
  })()

  const groupOpacity = 1

  return (
    <>
        {/* starfield */}
        <div className="absolute inset-0" style={{ opacity: groupOpacity }}>
          <Starfield t={t} layers={STAR_SPECS.spaceSound} prng="mulberry32" />
        </div>

        {/* scene svg */}
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0" style={{ opacity: groupOpacity }}>
          <defs>
            <radialGradient id="clusterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#22d3ee" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blastGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g transform={`translate(540,720) scale(${camScale}) translate(-540,-720)`}>
            {/* ========= ACT 1 ========= */}
            {actIndex === 0 && (
              <>
                {ex > 0 && t >= ex && t < ex + 1.2 ? (
                  <>
                    {/* blast glow */}
                    <circle cx="540" cy="720" r="210" fill="url(#blastGlow)" opacity={1 - clamp01((t - ex) / 1.2)} />
                    {/* expanding amber shockwave */}
                    {t - ex < 0.95 && (
                      <circle cx="540" cy="720" r={34 + 430 * easeOutCubic(clamp01((t - ex) / 0.9))} stroke="#f59e0b" strokeWidth={7} fill="none" opacity={0.9 * (1 - clamp01((t - ex - 0.55) / 0.65))} />
                    )}
                    {/* white flash — first ~4 frames */}
                    {t - ex < 0.14 && <rect x="0" y="0" width="1080" height="1920" fill="#ffffff" opacity={0.6 * (1 - (t - ex) / 0.14)} />}
                    {/* waveform bars — kill on 'Real' */}
                    {Array.from({ length: 48 }).map((_, i) => {
                      const x = 180 + (i * 720) / 47
                      const collapse = realT > 0 ? clamp01((t - realT) / 0.45) : 0
                      const envelope = Math.max(0.02, 1 - collapse)
                      const h = (24 + 96 * Math.abs(Math.sin((t - ex) * 9.2 + i * 1.61))) * envelope + 2
                      return <rect key={i} x={x - 4.5} y={720 - h / 2} width={8.6} height={h} rx={2} fill="#f59e0b" opacity={0.35 + envelope * 0.65} />
                    })}
                  </>
                ) : (
                  <>
                    {/* ship crosses screen before the blast */}
                    {ex > 0 && t >= ex + 0.9 ? (
                      <rect x="180" y="716" width="720" height="3" fill="#475569" opacity={0.9} />
                    ) : (
                      <g transform={`translate(${-160 + 1400 * easeOutCubic(clamp01(t / (ex > 0 ? ex : 4.75)))},720)`}>
                        <path d="M 0 -22 L 16 16 L 0 10 L -16 16 Z" fill="#fde047" stroke="#1a1a2e" strokeWidth="2.4" strokeLinejoin="round" />
                        <circle cx="0" cy="1" r="4.2" fill="#22d3ee" stroke="#1a1a2e" strokeWidth="1.6" />
                      </g>
                    )}
                  </>
                )}
              </>
            )}

            {/* ========= ACT 2 ========= */}
            {actIndex === 1 && (
              <>
                {/* ~60 matter dots in a loose grid */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const row = Math.floor(i / 20)
                  const col = i % 20
                  const baseX = 140 + col * 44 + row * 18
                  const baseY = 640 + row * 44
                  // compression pulse travels left→right
                  const pulse = soundT > 0 ? Math.exp(-Math.pow((t - soundT - col * 0.038) * 2.1, 2)) : 0
                  const fade = spaceT > 0 ? clamp01((spaceT + 1.1 - t) / 1.1) : 1
                  const colorMix = pulse
                  return (
                    <circle
                      key={i}
                      cx={baseX}
                      cy={baseY}
                      r={(4.5 + pulse * 2.8) * (0.65 + fade * 0.35)}
                      fill={colorMix > 0.55 ? '#a5f3fc' : '#22d3ee'}
                      opacity={0.3 + pulse * 0.6}
                    />
                  )
                })}
                {/* SOLID / LIQUID / GAS pop in */}
                {['solid', 'liquid', 'gas'].map((word, i) => {
                  const w = words.find((x) => x.w.toLowerCase() === word)
                  const appear = w ? anim(t, w.start + i * 0.08, 0.34) : 0
                  if (appear <= 0.01) return null
                  return (
                    <g key={word} opacity={appear} transform={`translate(0,${(1 - appear) * 16})`}>
                      <rect x={140 + i * 280} y={440} width={178} height={40} rx={7} fill="#0f172a" stroke="#22d3ee" strokeOpacity={0.55} />
                      <text x={229 + i * 280} y={466} textAnchor="middle" fill="#22d3ee" fontSize={19} fontWeight={700} fontFamily="ui-monospace, Consolas, monospace" letterSpacing={3}>
                        {word.toUpperCase()}
                      </text>
                    </g>
                  )
                })}
                {/* DEAD SPACE 2 lower-third */}
                {deadT > 0 && (
                  <g opacity={anim(t, deadT, 0.4)}>
                    <rect x="215" y="1085" width="650" height="108" rx={10} fill="#0b1220" stroke="#22d3ee" strokeOpacity={0.55} />
                    <circle cx="285" cy="1128" r="19" fill="none" stroke="#94a3b8" strokeWidth={3} />
                    <rect x="266" y="1151" width="38" height="22" rx={3} fill="none" stroke="#94a3b8" strokeWidth={3} />
                    <text x="325" y="1130" fill="#e2e8f0" fontSize={24} fontWeight={700} fontFamily="ui-monospace, Consolas, monospace" letterSpacing={2}>DEAD SPACE 2</text>
                    <text x="325" y="1159" fill="#94a3b8" fontSize={15} fontFamily="ui-monospace, Consolas, monospace" letterSpacing={1}>(2011) · NEARLY SILENT OUTSIDE</text>
                  </g>
                )}
              </>
            )}

            {/* ========= ACT 3 ========= */}
            {actIndex === 2 && (
              <>
                {/* cluster glow + seeded points */}
                <g opacity={anim(t, twistT, 1.15)}>
                  {CLUSTER_POINTS.map((p, i) => (
                    <circle key={i} cx={540 + p.x} cy={640 + p.y} r={p.size} fill="#a5f3fc" opacity={p.o * (0.7 + 0.3 * Math.sin(t * 0.9 + i * 1.73))} />
                  ))}
                  <circle cx="540" cy="640" r="150" fill="url(#clusterGlow)" opacity={0.8} />
                </g>
                {twistT > 0 && (
                  <g opacity={anim(t, twistT + 0.3, 0.5)}>
                    <text x="540" y="415" textAnchor="middle" fill="#e8edff" fontSize="30" fontWeight={700} fontFamily="ui-monospace, Consolas, monospace" letterSpacing={10}>GALAXY CLUSTER</text>
                  </g>
                )}
                {/* ripple rings from Chandra anchor */}
                {chandraT > 0 && Array.from({ length: 4 }).map((_, i) => {
                  const prog = clamp01((t - chandraT - i * 0.55) / 2.3)
                  return (
                    <circle
                      key={i}
                      cx="540"
                      cy="640"
                      r={36 + prog * 430}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth={5 * (1 - prog) + 1.4}
                      opacity={prog === 0 ? 0 : 0.85 * (1 - prog)}
                    />
                  )
                })}
                {chandraT > 0 && (
                  <g opacity={anim(t, chandraT + 0.42, 0.45)}>
                    <text x="540" y="845" textAnchor="middle" fill="#67e8f9" fontSize="17" fontFamily="ui-monospace, Consolas, monospace" letterSpacing={2}>
                      PERSEUS CLUSTER · ~250 MILLION LIGHT-YEARS
                    </text>
                  </g>
                )}
                {/* B-flat tag */}
                {bFlatT > 0 && (
                  <g opacity={anim(t, bFlatT + 0.3, 0.4)}>
                    <rect x="360" y="880" width="360" height="46" rx={8} fill="#0b1220" stroke="#22d3ee" strokeOpacity={0.85} />
                    <text x="540" y="910" textAnchor="middle" fill="#a5f3fc" fontSize="21" fontWeight={700} fontFamily="ui-monospace, Consolas, monospace" letterSpacing={3}>
                      B♭ · 57 OCTAVES BELOW MIDDLE C
                    </text>
                  </g>
                )}
                {/* 7-vs-57 scale compare */}
                {octaveT > 0 && (
                  <g opacity={anim(t, octaveT + 0.3, 0.5)}>
                    <rect x="160" y="1122" width={190 * easeOutCubic(clamp01((t - octaveT - 0.3) / 0.6))} height="22" fill="#22d3ee" opacity={0.85} rx={4} />
                    <text x="160" y="1167" fill="#94a3b8" fontSize="14" fontFamily="ui-monospace, Consolas, monospace" letterSpacing={2}>PIANO ≈ 7 OCTAVES</text>
                    <rect x="160" y="1226" width={680 * easeOutCubic(clamp01((t - octaveT - 0.7) / 0.8)) + 360} height="22" fill="#22d3ee" opacity={0.95} rx={4} />
                    <text x="160" y="1272" fill="#a5f3fc" fontSize="14" fontWeight={700} fontFamily="ui-monospace, Consolas, monospace" letterSpacing={2}>57 OCTAVES →</text>
                  </g>
                )}
              </>
            )}
          </g>
        </svg>
    </>
  )
}
