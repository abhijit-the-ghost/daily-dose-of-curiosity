/* ==================================================================
   Episode — generic episode shell. Reads episode config from
   episodes/<slug>/scene.json + metadata and wires playback, recorder
   hooks, HUD, captions and (optional) end card; act scenes come from the
   per-episode Acts components registered below.
   ================================================================== */

import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import EndCard from './EndCard'
import Hud from './Hud'
import { HUD_PRESETS } from '../theme/hudPresets'
import KaraokeCaption from './KaraokeCaption'
import { CAPTION_STYLES } from '../theme/captionStyles'
import { buildChunks } from './captionChunks'
import type { SceneConfig } from '../templates/types'
import SpaceSoundActs, { type Metadata as SpaceSoundMetadata } from './SpaceSoundActs'
import MinecraftEdgeActs, { type Metadata as MinecraftEdgeMetadata } from './MinecraftEdgeActs'
import NeverTouchActs, { type Metadata as NeverTouchMetadata } from './NeverTouchActs'
import TouchAndFeelActs from './TouchFeelActs'
import NuclearGandhiActs from './NuclearGandhiActs'
import SunNeverBlackHoleActs from './SunNeverBlackHoleActs'
import EverestVsDeepActs from './EverestVsDeepActs'
import EarthNeverMadeGoldActs from './EarthNeverMadeGoldActs'
import UranusTiltedSidewaysActs from './UranusTiltedSidewaysActs'
import VenusSunRisesWestActs from './VenusSunRisesWestActs'
import FlatPlaneActs from './FlatPlaneActs'

import spaceSoundScene from '../../episodes/space-sound/scene.json'
import minecraftEdgeScene from '../../episodes/minecraft-edge/scene.json'
import neverTouchScene from '../../episodes/never-touch/scene.json'
import touchAndFeelScene from '../../episodes/touch-and-feel/scene.json'
import nuclearGandhiScene from '../../episodes/nuclear-gandhi/scene.json'
import sunNeverBlackHoleScene from '../../episodes/sun-never-black-hole/scene.json'
import everestVsDeepScene from '../../episodes/everest-challenger-deep/scene.json'
import earthNeverMadeGoldScene from '../../episodes/earth-never-made-gold/scene.json'
import uranusTiltedSidewaysScene from '../../episodes/uranus-tilted-sideways/scene.json'
import venusSunRisesWestScene from '../../episodes/venus-sun-rises-west/scene.json'
import flatPlaneScene from '../../episodes/solar-system-flat-plane/scene.json'

type Slug = 'space-sound' | 'minecraft-edge' | 'never-touch' | 'everest-challenger-deep' | 'touch-and-feel' | 'nuclear-gandhi' | 'sun-never-black-hole' | 'earth-never-made-gold' | 'uranus-tilted-sideways' | 'venus-sun-rises-west' | 'solar-system-flat-plane'

type Metadata = SpaceSoundMetadata & MinecraftEdgeMetadata & NeverTouchMetadata

interface EpisodeDefinition {
  scene: SceneConfig
  audioSrc: string
  hudPreset: keyof typeof HUD_PRESETS
  captionStyle: keyof typeof CAPTION_STYLES
  Acts: React.ComponentType<{ t: number; actIndex: number; meta: Metadata | null }>
  /** derive which act the camera/HUD should treat `t` as; defaults to a simple split at act start times */
  actIndexOf: (meta: Metadata | null, t: number) => number
  /** when provided, captions render only while this returns true (e.g. minecraft-edge hides captions during the loop return) */
  captionsVisibleAt?: (meta: Metadata | null, t: number) => boolean
}

const actAt = (meta: Metadata | null, t: number): number => {
  if (!meta) return 0
  const a1 = meta.actBreakdown?.[1]?.words?.[0]?.start ?? 5.5
  const a2 = meta.actBreakdown?.[2]?.words?.[0]?.start ?? 15.7
  return t < a1 ? 0 : t < a2 ? 1 : 2
}

/** venus-sun-rises-west has six measured acts; pick the current one from WordBoundary starts. */
const venusActAt = (meta: Metadata | null, t: number): number => {
  const starts = (meta?.actBreakdown ?? []).map((a) => a.words?.[0]?.start).filter((v): v is number => typeof v === 'number')
  if (!starts.length) return 0
  let idx = 0
  for (let i = 0; i < starts.length; i++) if (t >= starts[i]) idx = i
  return idx
}

/** solar-system-flat-plane has five measured acts; same WordBoundary picker. */
const flatPlaneActAt = (meta: Metadata | null, t: number): number => {
  const starts = (meta?.actBreakdown ?? []).map((a) => a.words?.[0]?.start).filter((v): v is number => typeof v === 'number')
  if (!starts.length) return 0
  let idx = 0
  for (let i = 0; i < starts.length; i++) if (t >= starts[i]) idx = i
  return idx
}

const mcActAt = (meta: Metadata | null, t: number): number => {
  if (!meta) return 0
  const w = meta.words
  const tAround = w.filter((x) => x.w.toLowerCase() === 'around')[0]?.start ?? 25.5
  if (t >= tAround + 0.55) return 0
  const a1 = meta.actBreakdown?.[1]?.words?.[0]?.start ?? 7.14
  const a2 = meta.actBreakdown?.[2]?.words?.[0]?.start ?? 16.51
  return t < a1 ? 0 : t < a2 ? 1 : 2
}
const mcCaptionsVisible = (meta: Metadata | null, t: number): boolean => {
  if (!meta) return true
  const w = meta.words
  const tAround = w.filter((x) => x.w.toLowerCase() === 'around')[0]?.start ?? 25.5
  return t < tAround + 0.55
}

const REGISTRY: Record<Slug, EpisodeDefinition> = {
  'space-sound': {
    scene: spaceSoundScene as SceneConfig,
    audioSrc: '/audio/space-sound/full_voiceover.mp3',
    hudPreset: 'spaceSound',
    captionStyle: 'spaceSound',
    Acts: SpaceSoundActs as never,
    actIndexOf: actAt,
  },
  'minecraft-edge': {
    scene: minecraftEdgeScene as SceneConfig,
    audioSrc: '/audio/minecraft-edge/full_voiceover.mp3',
    hudPreset: 'minecraftEdge',
    captionStyle: 'minecraftEdge',
    Acts: MinecraftEdgeActs as never,
    actIndexOf: mcActAt,
    captionsVisibleAt: mcCaptionsVisible,
  },
  'never-touch': {
    scene: neverTouchScene as SceneConfig,
    audioSrc: '/audio/never-touch/full_voiceover.mp3',
    hudPreset: 'neverTouch',
    captionStyle: 'neverTouch',
    Acts: NeverTouchActs as never,
    actIndexOf: actAt,
  },
  'everest-challenger-deep': {
    scene: everestVsDeepScene as SceneConfig,
    audioSrc: '/audio/everest-challenger-deep/full_voiceover.mp3',
    hudPreset: 'everestVsDeep',
    captionStyle: 'everestVsDeep',
    Acts: EverestVsDeepActs as never,
    actIndexOf: actAt,
  },
  'touch-and-feel': {
    scene: touchAndFeelScene as SceneConfig,
    audioSrc: '/audio/touch-and-feel/full_voiceover.mp3',
    hudPreset: 'touchAndFeel',
    captionStyle: 'touchAndFeel',
    Acts: TouchAndFeelActs as never,
    actIndexOf: actAt,
  },
  'nuclear-gandhi': {
    scene: nuclearGandhiScene as SceneConfig,
    audioSrc: '/audio/nuclear-gandhi/full_voiceover.mp3',
    hudPreset: 'nuclearGandhi',
    captionStyle: 'nuclearGandhi',
    Acts: NuclearGandhiActs as never,
    actIndexOf: actAt,
  },
  'sun-never-black-hole': {
    scene: sunNeverBlackHoleScene as SceneConfig,
    audioSrc: '/audio/sun-never-black-hole/full_voiceover.mp3',
    hudPreset: 'starScale',
    captionStyle: 'starScale',
    Acts: SunNeverBlackHoleActs as never,
    actIndexOf: actAt,
  },
  'earth-never-made-gold': {
    scene: earthNeverMadeGoldScene as SceneConfig,
    audioSrc: '/audio/earth-never-made-gold/full_voiceover.mp3',
    hudPreset: 'earthNeverMadeGold',
    captionStyle: 'earthNeverMadeGold',
    Acts: EarthNeverMadeGoldActs as never,
    actIndexOf: actAt,
  },
  'uranus-tilted-sideways': {
    scene: uranusTiltedSidewaysScene as SceneConfig,
    audioSrc: '/audio/uranus-tilted-sideways/full_voiceover.mp3',
    hudPreset: 'uranusTiltedSideways',
    captionStyle: 'uranusTiltedSideways',
    Acts: UranusTiltedSidewaysActs as never,
    actIndexOf: actAt,
  },
  'venus-sun-rises-west': {
    scene: venusSunRisesWestScene as SceneConfig,
    audioSrc: '/audio/venus-sun-rises-west/full_voiceover.mp3',
    hudPreset: 'venusSunRisesWest',
    captionStyle: 'phrase',
    Acts: VenusSunRisesWestActs as never,
    actIndexOf: venusActAt,
  },
  'solar-system-flat-plane': {
    scene: flatPlaneScene as SceneConfig,
    audioSrc: '/audio/solar-system-flat-plane/full_voiceover.mp3',
    hudPreset: 'solarSystemFlatPlane',
    captionStyle: 'phrase',
    Acts: FlatPlaneActs as never,
    actIndexOf: flatPlaneActAt,
  },
}

export default function Episode({ slug }: { slug: Slug }) {
  const def = REGISTRY[slug]
  const [meta, setMeta] = useState<Metadata | null>(null)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [scale, setScale] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)
  const rafRef = useRef(0)
  const forcedTimeRef = useRef<number | null>(null)

  /* Caption styles can opt into shorter chunks + no grey upcoming words.
     Defaults 6/true reproduce the legacy karaoke behaviour exactly. */
  const captionStyle = useMemo(
    () => ({ maxWords: 6, dimUpcoming: true, ...CAPTION_STYLES[def.captionStyle] }),
    [def.captionStyle],
  )
  const { maxWords: captionMaxWords, ...captionProps } = captionStyle

  const chunks = useMemo(() => {
    const w = meta?.words ?? []
    return w.length ? buildChunks(w, captionMaxWords) : []
  }, [meta, captionMaxWords])
  const totalDuration = meta?.totalDuration ?? 28.78
  const actIndex = def.actIndexOf(meta, time)

  const isRecord = new URLSearchParams(window.location.search).get('record') === '1'

  /* ---- metadata fetch ---- */
  useEffect(() => {
    let alive = true
    fetch(`/audio/${slug}/metadata.json`)
      .then((r) => r.json())
      .then((m: Metadata) => {
        if (!alive) return
        setMeta(m)
        window.__ready = true
      })
      .catch((err) => console.error(`${slug} metadata failed`, err))
    return () => { alive = false }
  }, [slug])

  /* ---- recorder hooks ---- */
  useEffect(() => {
    window.__seek = (t: number) => { forcedTimeRef.current = Math.max(0, t); setTime(Math.max(0, t)) }
    window.__ready = true
    return () => { delete window.__seek }
  }, [])

  useEffect(() => { window.__committedFrame = time }, [time])

  useEffect(() => {
    if (time >= totalDuration) {
      document.getElementById('root')?.setAttribute('data-rendering-complete', 'true')
    }
  }, [time, totalDuration])

  useEffect(() => {
    if (!isRecord) return
    const tick = () => {
      const t = forcedTimeRef.current
      if (t !== null) setTime(t)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isRecord])

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
    if (isRecord) return
    const compute = () => setScale(Math.min(window.innerWidth / 1080, window.innerHeight / 1920) * 0.96)
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [isRecord])

  const kicker = def.scene.acts[Math.min(def.scene.acts.length - 1, actIndex)]
  const captionsVisible = def.captionsVisibleAt ? def.captionsVisibleAt(meta, time) : true

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#020409] flex items-center justify-center">
      {!isRecord && (
        <button
          onClick={() => {
            const audio = audioRef.current
            if (!audio) return
            if (playing) { audio.pause(); setPlaying(false) } else {
              if (audio.ended) audio.currentTime = 0
              void audio.play().catch(() => {})
              setPlaying(true)
            }
          }}
          className="fixed bottom-6 left-6 z-50 rounded-full border border-amber-400/60 bg-amber-400/10 px-6 py-3 font-mono text-sm font-bold tracking-[0.25em] text-amber-300 backdrop-blur transition-colors hover:bg-amber-400/20"
        >
          {playing ? '❚❚ PAUSE' : '▶ PLAY VOICEOVER'}
        </button>
      )}

      <audio
        ref={audioRef}
        src={def.audioSrc}
        preload="auto"
        onEnded={() => { setPlaying(false); document.getElementById('root')?.setAttribute('data-rendering-complete', 'true') }}
      />

      <div className="relative h-[1920px] w-[1080px] shrink-0 overflow-hidden bg-[#030712]" style={isRecord ? undefined : { transform: `scale(${scale})` }}>
        <def.Acts t={time} actIndex={actIndex} meta={meta} />

        <Hud
          {...HUD_PRESETS[def.hudPreset]}
          t={time}
          duration={totalDuration}
          kickerLabel={kicker?.kicker ?? ''}
          kickerAccentHex={kicker?.kickerColor}
        />

        {captionsVisible && <KaraokeCaption {...captionProps} t={time} chunks={chunks} />}

        {def.scene.endCard && <EndCard t={time} duration={totalDuration} />}
      </div>
    </div>
  )
}
