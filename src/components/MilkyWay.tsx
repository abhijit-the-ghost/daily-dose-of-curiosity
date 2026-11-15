import { useEffect, useMemo, useRef, useState } from 'react'
import logoUrl from '../../shared-assets/brand/logo-alpha.png'
import { clamp01, easeOutCubic, backOut } from '../motion/anim'
import { COLORS } from '../theme/tokens'
import Starfield from './Starfield'
import { STAR_SPECS } from '../theme/starfield'
import KaraokeCaption from './KaraokeCaption'
import { CAPTION_STYLES } from '../theme/captionStyles'
import { buildChunks } from './captionChunks'
import Hud from './Hud'
import { HUD_PRESETS } from '../theme/hudPresets'

/* ==================================================================
   WHY YOU'VE NEVER SEEN A REAL PHOTO OF THE MILKY WAY
   Daily Dose of Curiosity · 9:16 2D SVG composition (no WebGL)

   Every motion derives from one clock:
     preview → <audio>.currentTime (rAF loop, PLAY button)
     record  → window.__seek(t)     (?record=1, deterministic)
   ================================================================== */

const RECORD = new URLSearchParams(window.location.search).get('record') === '1'
const VOICEOVER = '/audio/milkyway/full_voiceover.mp3'

const smoothstep = (x: number) => {
  const u = clamp01(x)
  return u * u * (3 - 2 * u)
}
/* act boundaries from the voiceover (metadata.json) */
const ACT1_END = 6.02
const ACT2_START = 6.71
const ACT3_START = 13.75
const DURATION = 21.53

/* ---------------- seeded rng (stable across renders/frames) ---------------- */
const lcg = (seed: number) => {
  let s = seed >>> 0 || 0x9e3779b9
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/* ---------------- metadata types ---------------- */
interface Word { w: string; start: number; end: number }
interface Act { id: string; index: number; label: string; caption: string; start: number; end: number; words: Word[] }
interface Metadata { title: string; fps: number; totalDuration: number; acts: Act[]; words: Word[] }

/** split narration into caption lines at natural pauses (>0.32s), ≤6 words */
/* ================= galaxy (top-down spiral, vector) ================= */

const galaxyRand = lcg(777)
const DUST = Array.from({ length: 64 }, () => {
  const a = galaxyRand() * Math.PI * 2
  const r = 34 + galaxyRand() * 138
  return { a, r, size: 0.8 + galaxyRand() * 2.3, o: 0.15 + galaxyRand() * 0.4 }
})

function spiralPoints(phase: number): string {
  const pts: string[] = []
  for (let th = 0.4; th <= Math.PI * 3.35; th += 0.075) {
    const r = 11 * Math.exp(0.235 * th)
    if (r > 185) break
    const x = Math.cos(th + phase) * r
    const y = Math.sin(th + phase) * r
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return pts.join(' ')
}
const ARM_A = spiralPoints(0)
const ARM_B = spiralPoints(Math.PI)

function Galaxy({ t }: { t: number }) {
  const scale = 1 - 0.38 * smoothstep((t - 7.4) / 2.4)
  const rotation = t * 14
  const corePulse = 0.75 + 0.25 * Math.sin(t * 2.1)
  const dim = t > 12 ? 1 - 0.35 * smoothstep((t - 13) / 1.4) : 1

  return (
    <g transform={`translate(540, 660) scale(${scale})`} opacity={dim}>
      {/* halo */}
      <circle r={250} fill="url(#haloGrad)" opacity={0.8} />
      <circle r={150} fill="url(#haloGrad2)" opacity={0.9} />
      {/* spiral arms (3 stacked strokes per arm for tapered glow) */}
      <g transform={`rotate(${rotation})`}>
        <polyline points={ARM_A} fill="none" stroke="url(#armGrad)" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
        <polyline points={ARM_A} fill="none" stroke="url(#armGrad)" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
        <polyline points={ARM_A} fill="none" stroke="#dbeafe" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
        <polyline points={ARM_B} fill="none" stroke="url(#armGrad)" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
        <polyline points={ARM_B} fill="none" stroke="url(#armGrad)" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
        <polyline points={ARM_B} fill="none" stroke="#fce7f3" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
        {/* dust lanes */}
        {DUST.map((d, i) => (
          <circle
            key={i}
            cx={Math.cos(d.a) * d.r}
            cy={Math.sin(d.a) * d.r}
            r={d.size}
            fill="#c4b5fd"
            opacity={d.o}
          />
        ))}
        {/* core — blue → magenta gradient nodes */}
        <circle r={64} fill="#ec4899" opacity={0.42 * corePulse} filter="url(#blur18)" />
        <circle r={36} fill="#3b82f6" opacity={0.85} filter="url(#blur8)" />
        <circle r={14} fill="#ffffff" opacity={0.95} />
      </g>
    </g>
  )
}

/* ================= Voyager scale line (acts 2 → 3) ================= */

function ScaleLine({ t }: { t: number }) {
  if (t < ACT2_START + 0.6) return null
  const reveal = easeOutCubic((t - ACT2_START - 0.6) / 0.8)
  const focus = t > ACT3_START ? smoothstep((t - ACT3_START) / 1.2) : 0 // act 3: highlight probe

  const lineY = 1335
  const x0 = 130
  const x1 = 950
  const probeX = x0 + 7 // ~0.0026 ly on a 0–26,000 ly ruler → invisible; shown pinned w/ callout

  return (
    <g transform={`translate(0, ${(1 - reveal) * 60})`} opacity={reveal}>
      <line x1={x0} y1={lineY} x2={x1} y2={lineY} stroke="rgba(148,184,226,0.5)" strokeWidth={2} />
      {/* ruler ticks + labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const x = x0 + (x1 - x0) * f
        const ly = Math.round(26000 * f)
        return (
          <g key={i}>
            <line x1={x} y1={lineY - 8} x2={x} y2={lineY + 8} stroke="rgba(148,184,226,0.6)" strokeWidth={2} />
            <text x={x} y={lineY + 32} textAnchor="middle" fill="rgba(174,194,232,0.72)" fontSize={17} fontFamily="ui-monospace, Consolas, monospace">
              {ly === 0 ? 'SOL' : `${(ly / 1000).toFixed(0)}k`}
            </text>
          </g>
        )
      })}


      {/* probe — pinned pixel + halo + callout line to magnified tag */}
      <circle cx={probeX + 26} cy={lineY} r={focus > 0 ? 5 + 2.4 * Math.sin(t * 5.2) : 5} fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.9))' }} />
      <circle cx={probeX + 26} cy={lineY} r={10 + (focus > 0 ? 3 * Math.sin(t * 5.2) : 0)} fill="none" stroke="#f59e0b" strokeWidth={1.4} opacity={0.5 + 0.4 * Math.sin(t * 5.2)} />
      <line x1={probeX + 26} y1={lineY} x2={probeX + 130} y2={lineY - 66} stroke="#f59e0b" strokeWidth={1.4} opacity={0.85} />
      <rect x={probeX + 128} y={lineY - 88} width={268} height={44} rx={7} fill="rgba(9,12,28,0.92)" stroke="#f59e0b" strokeOpacity={0.7} />
      <text x={probeX + 142} y={lineY - 60} fill="#fbbf24" fontSize={20} fontWeight={700} fontFamily="ui-monospace, Consolas, monospace">
        VOYAGER 1 · 0.0026 ly
      </text>
    </g>
  )
}

/* ================= act overlays ================= */

function Stamp({ t }: { t: number }) {
  if (t < 0.45 || t > ACT1_END + 0.7) return null
  const inK = backOut((t - 0.45) / 0.4)
  const outK = clamp01((t - ACT1_END - 0.15) / 0.55)
  const opacity = clamp01(1 - outK)
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      style={{ opacity }}
    >
      <div
        style={{
          transform: `rotate(-9deg) scale(${(0.55 + inK * 0.45).toFixed(3)})`,
          border: '7px double #ef4444',
          borderRadius: 10,
          padding: '26px 44px',
          color: '#ef4444',
          fontFamily: "ui-monospace, 'Cascadia Mono', Consolas, monospace",
          fontWeight: 800,
          fontSize: 54,
          lineHeight: 1.06,
          letterSpacing: 5,
          textAlign: 'center',
          background: 'rgba(12,5,9,0.28)',
          textShadow: '0 0 26px rgba(239,68,68,0.5)',
          boxShadow: 'inset 0 0 60px rgba(239,68,68,0.18), 0 0 80px rgba(239,68,68,0.25)',
        }}
      >
        ILLUSTRATION
        <br />
        <span style={{ fontSize: 34, letterSpacing: 8 }}>/ ARTIST CONCEPT</span>
      </div>
    </div>
  )
}

function TelemetryCard({ t }: { t: number }) {
  if (t < ACT2_START + 0.4 || t > ACT3_START + 0.9) return null
  const inK = easeOutCubic((t - ACT2_START - 0.4) / 0.65)
  const outK = clamp01((t - ACT3_START + 0.35) / 0.8)
  const x = (1 - inK) * 1120
  const opacity = 1 - outK
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ right: -40, bottom: 700, width: 560, transform: `translateX(${x.toFixed(1)}px)`, opacity }}
    >
      <div
        style={{
          borderLeft: '5px solid #f59e0b',
          background: 'linear-gradient(160deg, rgba(10,14,32,0.94), rgba(6,9,22,0.94))',
          padding: '22px 26px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 0 40px rgba(59,130,246,0.07)',
        }}
      >
        <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 15, letterSpacing: 4, color: 'rgba(148,184,226,0.65)' }}>
          TELEMETRY // SOL SYSTEM
        </div>
        <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 21, color: '#8db8ff', marginTop: 10 }}>
          DISTANCE FROM CORE
        </div>
        <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontWeight: 800, fontSize: 46, color: '#f59e0b', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
          26,000 <span style={{ fontSize: 22 }}>LY</span>
        </div>
        <div style={{ borderTop: '1px solid rgba(148,184,226,0.18)', marginTop: 12, paddingTop: 10 }}>
          <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 16, color: 'rgba(174,194,232,0.85)' }}>
            ORION ARM · LOCAL SPUR
          </div>
          <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 16, color: 'rgba(174,194,232,0.85)', marginTop: 4 }}>
            FARTHEST PROBE: ~25 BILLION MI
          </div>
        </div>
      </div>
    </div>
  )
}

function VoyagerTag({ t }: { t: number }) {
  if (t < ACT3_START + 0.25) return null
  const k = backOut((t - ACT3_START - 0.25) / 0.55)
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: 96, top: 880, transform: `scale(${k.toFixed(3)})`, transformOrigin: 'left center', opacity: clamp01(k) }}
    >
      <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 17, letterSpacing: 3, color: '#34d399' }}>
        ▸ SUBJECT LOCK
      </div>
      <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 30, fontWeight: 800, color: '#e8edff', marginTop: 4 }}>
        VOYAGER 1
      </div>
      <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 17, color: 'rgba(174,194,232,0.75)', marginTop: 2 }}>
        45 YRS · 15.25 BILLION MI
      </div>
    </div>
  )
}

const CONFETTI = Array.from({ length: 44 }, (_, i) => i)
const BRAND_PALETTE = ['#b794d8', '#3aa9fc', '#f5f0ff', '#fbbf24', '#c084fc']

/* ================= brand end card (final 2 s) ================= */
function EndCard({ t }: { t: number }) {
  const endP = backOut((t - 20.88) / 0.5) // pop over ~0.5s right as the voiceover ends
  const confettiP = clamp01((t - 20.7) / 2.3)
  const opacity = clamp01((t - 20.88) / 0.32)
  if (opacity <= 0.005) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-3"
      style={{
        background: 'rgba(4,5,16,0.97)',
        opacity,
        transform: `scale(${(0.88 + endP * 0.12).toFixed(4)})`,
      }}
    >
      {/* channel logo — black bg melts into the scrim */}
      <img
        src={logoUrl}
        alt="Daily Dose of Curiosity"
        className="mb-1 h-[225px] w-[225px] object-contain"
        style={{ mixBlendMode: 'screen' }}
      />

      <div className="font-brand" style={{ fontSize: 64, lineHeight: 1.05, color: '#f5f0ff', letterSpacing: 6 }}>
        DAILY DOSE
      </div>
      <div
        className="font-brand"
        style={{
          fontSize: 158,
          lineHeight: 1.0,
          letterSpacing: 10,
          background: 'linear-gradient(180deg, #f0e6ff 0%, #b794d8 52%, #3aa9fc 130%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: 'drop-shadow(0 6px 30px rgba(183, 148, 216, 0.35))',
        }}
      >
        CURIOSITY
      </div>

      <div style={{ width: 240, height: 4, background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }} />

      <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 19, letterSpacing: 5, color: 'var(--amber, #fbbf24)', marginTop: 2 }}>
        GAMING · SCIENCE · VERIFIED FACTS
      </div>
      <div style={{ fontSize: 18, color: 'var(--ink-dim, #8b93b8)', letterSpacing: 0.5 }}>
        every claim sourced · links in the description
      </div>

      <div
        style={{
          marginTop: 14,
          fontFamily: "ui-monospace, Consolas, monospace",
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 4,
          color: '#ffffff',
          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          border: '1px solid rgba(183, 148, 216, 0.7)',
          borderRadius: 999,
          padding: '17px 60px',
          boxShadow: '0 0 46px rgba(124, 58, 237, 0.55)',
        }}
      >
        + FOLLOW
      </div>
      <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 15, color: 'rgba(232, 236, 255, 0.5)', letterSpacing: 2 }}>
        A NEW CURIOSITY EVERY DAY
      </div>

      {/* deterministic confetti (same recipe as the other episode) */}
      {confettiP > 0 &&
        CONFETTI.map((i) => {
          const left = (i * 29.7 + 13) % 100
          const size = 12 + (i % 4) * 7
          const o = (i * 37.3) % 100
          const fall = (confettiP * 148 + o) % 158 - 12
          const rot = (i * 97 + t * 160 * (i % 2 === 0 ? 1 : -1)) % 360
          return (
            <div
              key={i}
              aria-hidden
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${fall}%`,
                width: size,
                height: size * 0.45,
                background: BRAND_PALETTE[i % BRAND_PALETTE.length],
                transform: `rotate(${rot}deg)`,
                opacity: 0.95,
                borderRadius: 2,
              }}
            />
          )
        })}
    </div>
  )
}

/* ================= HUD chrome ================= */

function actMeta(t: number) {
  if (t < ACT1_END) return { index: '01', title: 'THE LIE', tone: 'text-cyan-300', bar: 'bg-cyan-400' }
  if (t < ACT3_START) return { index: '02', title: 'THE SCALE PROBLEM', tone: 'text-amber-300', bar: 'bg-amber-400' }
  return { index: '03', title: 'VOYAGER 1 REALITY CHECK', tone: 'text-emerald-300', bar: 'bg-emerald-400' }
}


/* ================= root component ================= */

export default function MilkyWay() {
  const [meta, setMeta] = useState<Metadata | null>(null)
  const [time, setTime] = useState(0)
  const [scale, setScale] = useState(1)
  const [playing, setPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const rafRef = useRef(0)
  const forcedTimeRef = useRef<number | null>(null)

  const chunks = useMemo(() => (meta ? buildChunks(meta.words) : []), [meta])
  const duration = meta?.totalDuration ?? DURATION

  /* load metadata (single source of truth) */
  useEffect(() => {
    let alive = true
    fetch('/audio/milkyway/metadata.json')
      .then((r) => r.json())
      .then((m: Metadata) => {
        if (!alive) return
        setMeta(m)
        window.__ready = true
      })
      .catch((err) => console.error('metadata.json failed', err))
    return () => {
      alive = false
    }
  }, [])

  /* recorder hooks */
  useEffect(() => {
    window.__seek = (t: number) => {
      forcedTimeRef.current = Math.max(0, t)
      setTime(Math.max(0, t))
    }
    window.__ready = true
    return () => {
      delete window.__seek
    }
  }, [])

  useEffect(() => {
    window.__committedFrame = time
  }, [time])

  useEffect(() => {
    if (time >= duration) {
      document.getElementById('root')?.setAttribute('data-rendering-complete', 'true')
    }
  }, [time, duration])

  /* master clock */
  useEffect(() => {
    if (!RECORD) return
    const tick = () => {
      const t = forcedTimeRef.current
      if (t !== null) setTime(t)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    if (!playing) return
    const tick = () => {
      const audio = audioRef.current
      if (audio) setTime(audio.currentTime)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing])

  useEffect(() => {
    if (RECORD) return
    const compute = () => setScale(Math.min(window.innerWidth / 1080, window.innerHeight / 1920) * 0.96)
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  const t = time

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#020409] flex items-center justify-center">
      {!RECORD && (
        <button
          onClick={() => {
            const audio = audioRef.current
            if (!audio) return
            if (playing) {
              audio.pause()
              setPlaying(false)
            } else {
              if (audio.ended) audio.currentTime = 0
              void audio.play().catch(() => {})
              setPlaying(true)
            }
          }}
          className="fixed bottom-6 left-6 z-50 rounded-full border border-cyan-400/60 bg-cyan-400/10 px-6 py-3 font-mono text-sm font-bold tracking-[0.25em] text-cyan-300 backdrop-blur transition-colors hover:bg-cyan-400/20"
        >
          {playing ? '❚❚ PAUSE' : '▶ PLAY VOICEOVER'}
        </button>
      )}

      <audio
        ref={audioRef}
        src={VOICEOVER}
        preload="auto"
        onEnded={() => {
          setPlaying(false)
          document.getElementById('root')?.setAttribute('data-rendering-complete', 'true')
        }}
      />

      {/* 9:16 stage */}
      <div
        className="relative h-[1920px] w-[1080px] shrink-0 overflow-hidden"
        style={RECORD ? { background: COLORS.bg } : { background: COLORS.bg, transform: `scale(${scale})` }}
      >
        <svg width="1080" height="1920" viewBox="0 0 1080 1920" className="absolute inset-0">
          <defs>
            <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="45%" stopColor="#6366f1" stopOpacity="0.18" />
              <stop offset="100%" stopColor={COLORS.bg} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="haloGrad2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="armGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="180" y2="180">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="35%" stopColor="#3b82f6" />
              <stop offset="70%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="blur8" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="blur18" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="17" />
            </filter>
          </defs>

          {/* parallax starfield — 3 depth layers, drifting downward */}
          <Starfield t={t} layers={STAR_SPECS.milkyway} prng="lcg" />

          {/* galaxy centerpiece */}
          <Galaxy t={t} />

          {/* voyager scale ruler + probe */}
          <ScaleLine t={t} />
        </svg>

        {/* act overlays */}
        <Stamp t={t} />
        <TelemetryCard t={t} />
        <VoyagerTag t={t} />

        {/* HUD + captions */}
        {meta && (
          <>
            <Hud
              {...HUD_PRESETS.milkyway}
              t={t}
              duration={meta.totalDuration}
              kickerLabel={(() => {
                const a = actMeta(t)
                return `${a.index} // ${a.title}`
              })()}
              kickerToneClass={actMeta(t).tone}
              kickerBarClass={actMeta(t).bar}
            />
            <KaraokeCaption {...CAPTION_STYLES.milkyway} t={t} chunks={chunks} />
          </>
        )}

        {/* brand end card — same lockup as the other episode */}
        <EndCard t={t} />
      </div>
    </div>
  )
}
