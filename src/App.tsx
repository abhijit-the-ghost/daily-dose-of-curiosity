import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './components/admin/Dashboard'
import Videos from './components/admin/Videos'
import VideoDetail from './components/admin/VideoDetail'
import Assets from './components/admin/Assets'
import DNSScene from './components/DNSScene'
import RoutingScene from './components/RoutingScene'
import ServerScene from './components/ServerScene'
import MilkyWay from './components/MilkyWay'
import Episode from './components/Episode'
import Cover from './components/Cover'
import Thumbnail from './components/Thumbnail'


/* ------------------------------------------------------------------
   Internet Shorts — 9:16 canvas & audio sync controller.

   The stage is a pure function of `time` (seconds). Nothing inside
   the .stage reads the wall clock, so `window.__seek(t)` renders the
   exact same frame every time. Two modes:

     preview (default)  – Play/Pause/scrub, acts play through <audio>
     record  (?record=1)– no chrome, no audio; an external harness
                          (scripts/render_video.mjs) drives __seek()
------------------------------------------------------------------ */

interface ActWord {
  w: string
  start: number
  end: number
}

interface Act {
  id: string
  index: number
  label: string
  caption: string
  file: string
  duration: number
  start: number
  end: number
  words: ActWord[]
}

interface Manifest {
  title: string
  width: number
  height: number
  fps: number
  totalDuration: number
  acts: Act[]
}

declare global {
  interface Window {
    __seek?: (t: number) => void
    __ready?: boolean
    /** set to `time` in an effect that runs after every committed render — the recorder awaits it */
    __committedFrame?: number
  }
}

const RECORD = new URLSearchParams(window.location.search).get('record') === '1'
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const backOut = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  const u = clamp01(x) - 1
  return 1 + c3 * u * u * u + c1 * u * u
}

interface KaraokeWord {
  w: string
  absStart: number
  absEnd: number
}

interface KaraokeChunk {
  words: KaraokeWord[]
  start: number
  end: number
}

function sceneFor(actId: string, props: SceneProps) {
  switch (actId) {
    case 'dns':
      return <DNSScene {...props} />
    case 'routing':
      return <RoutingScene {...props} />
    case 'server':
      return <ServerScene {...props} />
    default:
      return null
  }
}

export interface SceneProps {
  /** seconds since this act started */
  t: number
  /** act progress, 0..1 */
  p: number
  /** absolute timeline seconds */
  time: number
}

function EpisodePreview() {
  const params = new URLSearchParams(window.location.search)
  const episode = params.get('episode') ?? 'milkyway'
  if (episode === 'url-explainer') return <UrlExplainer />
  if (episode === 'space-sound') return <Episode slug="space-sound" />
  if (episode === 'minecraft-edge') return <Episode slug="minecraft-edge" />
  if (episode === 'never-touch') return <Episode slug="never-touch" />
  if (episode === 'everest-challenger-deep') return <Episode slug="everest-challenger-deep" />
  if (episode === 'touch-and-feel') return <Episode slug="touch-and-feel" />
  if (episode === 'nuclear-gandhi') return <Episode slug="nuclear-gandhi" />
  return <MilkyWay />
}

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="videos" element={<Videos />} />
        <Route path="videos/:slug" element={<VideoDetail />} />
        <Route path="assets" element={<Assets />} />
      </Route>
      <Route path="episode" element={<EpisodePreview />} />
      <Route path="cover" element={<Cover />} />
      <Route path="thumb" element={<Thumbnail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function UrlExplainer() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [scale, setScale] = useState(1)

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  const rafRef = useRef(0)
  const clockRef = useRef({ base: 0, t0: 0 })
  const grainRef = useRef<HTMLCanvasElement>(null)
  const grainPatternsRef = useRef<HTMLCanvasElement[]>([])

  const pauseAllAudio = useCallback(() => {
    for (const a of Object.values(audioRefs.current)) a?.pause()
  }, [])

  /* ---- load manifest (single source of truth for the timeline) ---- */
  useEffect(() => {
    let alive = true
    fetch('/audio/manifest.json')
      .then((r) => r.json())
      .then((m: Manifest) => {
        if (!alive) return
        setManifest(m)
        window.__ready = true
      })
      .catch((err) => console.error('manifest load failed', err))
    return () => {
      alive = false
    }
  }, [])

  /* ---- external seek hook for the recorder ---- */
  useEffect(() => {
    window.__seek = (t: number) => {
      setPlaying(false)
      pauseAllAudio()
      setTime(Math.max(0, t))
    }
    return () => {
      delete window.__seek
    }
  }, [pauseAllAudio])

  /* ---- fit the 1080x1920 stage into the window (preview only) ---- */
  useEffect(() => {
    if (RECORD) return
    const compute = () =>
      setScale(Math.min(window.innerWidth / 1080, window.innerHeight / 1920) * 0.96)
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  /* ---- preview playback engine: rAF clock + <audio> sync ---- */
  useEffect(() => {
    if (!playing || !manifest) return
    clockRef.current = { base: time, t0: performance.now() }

    const tick = () => {
      const { base, t0 } = clockRef.current
      const t = Math.min(base + (performance.now() - t0) / 1000, manifest.totalDuration)
      setTime(t)

      for (const act of manifest.acts) {
        const audio = audioRefs.current[act.id]
        if (!audio) continue
        const inside = t >= act.start && t < act.end
        if (inside) {
          const local = t - act.start
          if (audio.paused) {
            audio.currentTime = local
            void audio.play().catch(() => {})
          } else if (Math.abs(audio.currentTime - local) > 0.35) {
            audio.currentTime = local
          }
        } else if (!audio.paused) {
          audio.pause()
        }
      }

      if (t >= manifest.totalDuration) {
        setPlaying(false)
        pauseAllAudio()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, manifest])

  /* ---- signal to the recorder that the stage for `time` has committed ---- */
  useEffect(() => {
    window.__committedFrame = time
  }, [time])

  /* ---- film grain: THREE pre-seeded noise plates cycled at 12fps.
       (Compression-friendly: the encoder sees only 3 unique frames of noise
        instead of 1784, which keeps the file small. Still looks animated.) ---- */
  useEffect(() => {
    if (grainPatternsRef.current.length > 0) return
    const w = 216
    const h = 384
    const patterns: HTMLCanvasElement[] = []
    for (let p = 0; p < 3; p++) {
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const ctx = off.getContext('2d')!
      const img = ctx.createImageData(w, h)
      let seed = (0x9e3779b9 ^ (p * 2654435761)) >>> 0
      const data = img.data
      for (let i = 0; i < data.length; i += 4) {
        seed = (seed * 1664525 + 1013904223) >>> 0
        const v = 96 + ((seed >>> 24) % 96) // mid-gray band: subtle grain, not white noise
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
      patterns.push(off)
    }
    grainPatternsRef.current = patterns
  }, [])

  useEffect(() => {
    const canvas = grainRef.current
    const ctx = canvas?.getContext('2d')
    const patterns = grainPatternsRef.current
    if (!canvas || !ctx || patterns.length === 0) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(patterns[Math.floor(time * 12) % patterns.length], 0, 0)
  }, [time])

  /* ---- karaoke chunks: split narration into caption lines at natural
       pauses (>0.3s silence) with a 6-word ceiling ---- */
  const karaokeChunks = useMemo<KaraokeChunk[]>(() => {
    if (!manifest) return []
    const chunks: KaraokeChunk[] = []
    for (const act of manifest.acts) {
      let cur: KaraokeChunk | null = null
      let prevEnd = act.start // small initial offset is fine (<0.3s gap)
      for (const w of act.words) {
        const absStart = act.start + w.start
        const absEnd = act.start + w.end
        const gap = absStart - prevEnd
        if (!cur || gap > 0.3 || cur.words.length >= 6) {
          cur = { words: [], start: absStart, end: absEnd }
          chunks.push(cur)
        }
        cur.words.push({ w: w.w, absStart, absEnd })
        cur.end = absEnd
        prevEnd = absEnd
      }
    }
    return chunks
  }, [manifest])

  if (!manifest) {
    return (
      <div className="viewport" data-record={RECORD ? '1' : '0'}>
        <div style={{ fontFamily: 'monospace', color: '#8b93b8' }}>loading manifest…</div>
      </div>
    )
  }

  const { acts, totalDuration } = manifest

  /* ---- which act is on screen? gaps show the *next* act at p=0 ---- */
  let currentAct = acts[0]
  for (const act of acts) if (time >= act.start) currentAct = act
  const actT = Math.max(0, time - currentAct.start)
  const actP = clamp01(actT / currentAct.duration)
  const ended = time >= acts[acts.length - 1].end

  const sceneProps: SceneProps = { t: actT, p: actP, time }

  /* ---- act-cut flash: quick white dip on scene boundaries ---- */
  let flashOpacity = 0
  for (const a of acts.slice(1)) {
    const d = Math.abs(time - a.start)
    if (d < 0.14) flashOpacity = Math.max(flashOpacity, Math.pow(1 - d / 0.14, 2) * 0.85)
  }

  /* ---- karaoke caption: the chunk containing the word being spoken ---- */
  let activeChunk: KaraokeChunk | null = null
  for (let i = karaokeChunks.length - 1; i >= 0; i--) {
    const c = karaokeChunks[i]
    if (time >= c.start - 0.03) {
      activeChunk = time <= c.end + 0.6 && !ended ? c : null
      break
    }
  }

  return (
    <div className="viewport" data-record={RECORD ? '1' : '0'}>
      {!RECORD && (
        <>
          <div className="preview-bar">
            <span>DAILY DOSE OF CURIOSITY</span>
            <span>·</span>
            <span>{manifest.title}</span>
          </div>
          <div className="preview-controls">
            <button onClick={() => setPlaying((v) => !v)}>{playing ? 'PAUSE' : 'PLAY'}</button>
            <button
              onClick={() => {
                setPlaying(false)
                pauseAllAudio()
                setTime(0)
              }}
            >
              RESET
            </button>
            <input
              type="range"
              min={0}
              max={totalDuration}
              step={0.01}
              value={time}
              onChange={(e) => {
                setPlaying(false)
                pauseAllAudio()
                setTime(Number(e.target.value))
              }}
            />
            <span className="tc">
              {time.toFixed(2)}s / {totalDuration.toFixed(2)}s
            </span>
          </div>
        </>
      )}

      <div className="stage stage-grade" style={RECORD ? undefined : { transform: `scale(${scale})` }}>
        {/* scenes */}
        <div style={{ position: 'absolute', inset: 0 }}>{sceneFor(currentAct.id, sceneProps)}</div>

        {/* HUD: channel watermark + progress (act numbers removed) */}
        <div className="hud">
          <div className="hud-row" style={{ justifyContent: 'center' }}>
            <div className="watermark" style={{ fontSize: 23, letterSpacing: 4, color: 'rgba(232, 236, 255, 0.55)' }}>
              DAILY DOSE OF CURIOSITY
            </div>
          </div>
          <div className="progress">
            <i style={{ width: `${(clamp01(time / totalDuration) * 100).toFixed(2)}%` }} />
          </div>
        </div>

        {/* karaoke caption — current word highlighted, pops on change */}
        {activeChunk && (
          <div className="karaoke">
            <div className="karaoke-line">
              {activeChunk.words.map((w, i) => {
                const isDone = time >= w.absEnd
                const isActive = !isDone && time >= w.absStart
                if (isActive) {
                  const local = clamp01((time - w.absStart) / 0.24)
                  const scale = 0.62 + backOut(local) * 0.48
                  return (
                    <span
                      key={i}
                      className="karaoke-word active"
                      style={{ transform: `scale(${scale.toFixed(3)}) translateY(${((1 - local) * 7).toFixed(2)}px)` }}
                    >
                      {w.w.toUpperCase()}
                    </span>
                  )
                }
                if (isDone) {
                  return (
                    <span key={i} className="karaoke-word done">
                      {w.w.toUpperCase()}
                    </span>
                  )
                }
                return (
                  <span key={i} className="karaoke-word">
                    {w.w.toUpperCase()}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* cinematic grade: vignette + deterministic grain + act-cut flash */}
        <div className="vignette" />
        <canvas ref={grainRef} className="grain" width={216} height={384} />
        <div className="act-flash" style={{ opacity: flashOpacity }} />

        {/* act audio elements (preview mode only) */}
        {!RECORD &&
          acts.map((act) => (
            <audio
              key={act.id}
              preload="auto"
              ref={(el) => {
                audioRefs.current[act.id] = el
              }}
              src={`/audio/${act.file}`}
            />
          ))}
      </div>
    </div>
  )
}
