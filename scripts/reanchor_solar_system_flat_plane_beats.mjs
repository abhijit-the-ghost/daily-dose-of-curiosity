/**
 * reanchor_solar_system_flat_plane_beats.mjs — one-off, explicit beat/SFX
 * re-anchor for solar-system-flat-plane after real WordBoundary metadata exists.
 *
 * Reads only public/audio/solar-system-flat-plane/metadata.json (text) and
 * writes three text artifacts:
 *   episodes/solar-system-flat-plane/scene.json  beats[] + anchors + questionAt
 *   episodes/solar-system-flat-plane/meta.json   measured duration/word count
 *   episodes/solar-system-flat-plane/sfx.json    SFX on exact word starts
 *
 * No MP3/PNG/MP4 bytes are read and no timings are estimated.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SLUG = 'solar-system-flat-plane'
const EP = path.join(ROOT, 'episodes', SLUG)
const MANIFEST = path.join(ROOT, 'public', 'audio', SLUG, 'metadata.json')
const meta = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
const words = meta.words

if (!words?.length) throw new Error('no WordBoundary words in manifest — refusing to estimate timings')

/** `i` is an exact index into metadata.words[]; `at` is always that word's start. */
const SPECS = [
  { i: 0, kind: 'chip', text: 'ONE FLAT PLANE', note: 'Frame 1 already has content: crossed atom shells + flat amber disk' },
  { i: 6, kind: 'camera', scale: 1.12, to: [0.5, 0.44], note: 'Act 1 push; hero disk passes 55% of frame width' },
  { i: 14, kind: 'shape', id: 'atom-shell-rotate', note: 'Dashed shells rotate through 0/60/120 degrees' },
  { i: 21, kind: 'chip', text: '3D CRISSCROSS?', note: 'Hook contradiction swaps chip; false atom model only' },
  { i: 25, kind: 'palette', ground: 'secondary', note: 'Full-bleed ground flip #1; cool before-state' },
  { i: 29, kind: 'shape', id: 'nebula-sphere', note: 'Atom shells dissolve into a chaotic sphere' },
  { i: 38, kind: 'chip', text: 'NOT FLAT YET', note: 'Act 2 claim chip; sphere state' },
  { i: 43, kind: 'camera', scale: 0.92, to: [0.5, 0.5], note: 'Act 2 pull-back; room for the whole cloud' },
  { i: 49, kind: 'shape', id: 'nebula-cloud-body', note: 'Cloud body gains definition; no new label' },
  { i: 58, kind: 'shape', id: 'net-spin-arrow', note: 'Slight net spin arrow appears' },
  { i: 63, kind: 'shape', id: 'gravity-inward-vectors', note: 'Inward gravity vectors appear; no new label' },
  { i: 69, kind: 'chip', text: 'SPIN KEPT', note: 'Angular momentum claim lands as chip' },
  { i: 71, kind: 'shape', id: 'spin-accelerate', note: 'Particle spin rate begins to climb' },
  { i: 76, kind: 'shape', id: 'wild-angle-field', note: 'Faint wild-angle field appears before the collision ticks' },
  { i: 81, kind: 'shape', id: 'vertical-vy-arrows', note: 'Wild vertical velocity arrows become explicit' },
  { i: 84, kind: 'shape', id: 'collision-microflash-1', note: 'Collision tick 1; vertical arrow damps' },
  { i: 88, kind: 'shape', id: 'collision-microflash-2', note: 'Collision tick 2; another vertical arrow damps' },
  { i: 89, kind: 'question', text: 'WHY ONE FLAT PLANE?', note: 'The one on-screen question at 58.7% of measured runtime' },
  { i: 93, kind: 'camera', id: 'edge-on-tilt', scale: 1.05, to: [0.5, 0.42], note: 'Act 3 camera begins edge-on tilt from level to near-side-on' },
  { i: 97, kind: 'shape', id: 'sideways-vx-accelerate', note: 'Shared sideways spin accelerates while vertical motion falls' },
  { i: 98, kind: 'chip', text: 'VERTICAL CANCELED', note: 'Mechanism chip; hedge stays in narration' },
  { i: 103, kind: 'palette', ground: 'primary', note: 'Full-bleed ground flip #2; amber result state' },
  { i: 107, kind: 'shape', id: 'disk-collapse', note: 'Cloud flattens into the persistent ecliptic disk' },
  { i: 109, kind: 'chip', text: 'COSMIC TRAFFIC JAM', note: 'Act 4 mechanism chip' },
  { i: 114, kind: 'shape', id: 'disk-spinning', note: 'Flattened disk visibly gains a second rotation rail' },
  { i: 118, kind: 'shape', id: 'planet-seeds', note: 'Planets condense inside the disk' },
  { i: 119, kind: 'camera', scale: 1.0, to: [0.5, 0.5], note: 'Camera settles before the payoff push' },
  { i: 120, kind: 'chip', text: 'ONE LANE', note: 'Act 5 claim chip before the wedge' },
  { i: 121, kind: 'shape', id: 'ecliptic-wedge-rig', note: 'Edge-on inclination wedge enters; geometry derives from facts.ts' },
  { i: 122, kind: 'camera', scale: 1.18, to: [0.5, 0.46], note: 'Push into the inclination wedge' },
  { i: 124, kind: 'chip', text: 'FACT:bandDeg', note: 'Static chip; renders FACTS.bandDeg.display; telemetry click 1' },
  { i: 126, kind: 'counter', factKeys: ['bandDeg', 'otherPlanetsDeg'], suffix: '°', dur: 1.0, label: 'TILT BAND', note: 'The one visual proof: wedge morphs between the facts values; chip hidden' },
  { i: 133, kind: 'chip', text: 'FACT:otherPlanetsDeg', note: 'Static chip; renders FACTS.otherPlanetsDeg.display; telemetry click 2' },
  { i: 141, kind: 'camera', id: 'edge-on-return', scale: 1.0, to: [0.5, 0.5], note: 'Loop line: level camera returns to frame-1 geometry' },
  { i: 142, kind: 'chip', text: 'ONE FLAT PLANE', note: 'Loop chip identical to t=first' },
  { i: 149, kind: 'shape', id: 'atom-shells-return', note: 'Beat lands on the last word; ghost opacity is drawn from end-0.6s' },
]

const beats = SPECS.map(({ i, ...beat }) => ({
  ...beat,
  at: words[i].start,
  note: `${beat.note} [WordBoundary #${i}: ${JSON.stringify(words[i].w)} @ ${words[i].start.toFixed(3)}s]`,
}))

if (!beats.every((b, i) => i === 0 || b.at > beats[i - 1].at)) {
  throw new Error('re-anchored beats are not strictly increasing')
}

/** occurrence map for verify.ts: word -> 1-based indices used as anchors */
const anchors = {}
const seen = new Set()
for (const { i } of SPECS) {
  const key = words[i].w.toLowerCase()
  const occ = words.slice(0, i + 1).filter((w) => w.w.toLowerCase() === key).length
  const arr = anchors[key] ?? (anchors[key] = [])
  if (!seen.has(`${key}:${occ}`)) { arr.push(occ); seen.add(`${key}:${occ}`) }
}

const scenePath = path.join(EP, 'scene.json')
const scene = JSON.parse(fs.readFileSync(scenePath, 'utf8'))
const questionBeat = beats.find((b) => b.kind === 'question')
scene.beats = beats
scene.anchors = anchors
scene.question = {
  ...scene.question,
  questionAt: questionBeat.at,
}
fs.writeFileSync(scenePath, JSON.stringify(scene, null, 2) + '\n')

const metaPath = path.join(EP, 'meta.json')
const oldMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
fs.writeFileSync(metaPath, JSON.stringify({
  ...oldMeta,
  durationSec: meta.totalDuration,
  wordCount: words.length,
  scriptTokenCount: oldMeta.wordCount,
  wordCountSource: 'WordBoundary',
  longFormException: `confirmed: ${meta.totalDuration.toFixed(2)}s inside the owner-approved 45–60s band`,
  question: scene.question.text,
  questionAt: questionBeat.at,
  questionPct: Number((questionBeat.at / meta.totalDuration * 100).toFixed(1)),
  pinnedComment: scene.question.pinnedComment,
  ctaStyle: 'question',
  voice: meta.voice,
  voiceRate: meta.rate,
  manifest: `public/audio/${SLUG}/metadata.json`,
}, null, 2) + '\n')

const sfxAt = (i) => words[i].start
const sfxPath = path.join(EP, 'sfx.json')
fs.writeFileSync(sfxPath, JSON.stringify({
  comment: 'SFX for solar-system-flat-plane, anchored to exact WordBoundary starts. Synthesized in repo by scripts/synth_sfx.py; no downloads.',
  events: [
    { t: sfxAt(0), file: 'glass_chime.wav', gainDb: -16, anchor: 'Gravity', cue: 'Frame-1 split reveal', status: 'synthesized' },
    { t: sfxAt(0), file: 'sub_thump.wav', gainDb: -12, anchor: 'Gravity', cue: 'Frame-1 weight', status: 'synthesized' },
    { t: sfxAt(39), file: 'airy_swell.wav', gainDb: -18, anchor: "wasn't", cue: 'Atom-to-nebula dissolve', status: 'synthesized' },
    { t: sfxAt(74), file: 'spin_up_hum.wav', gainDb: -20, anchor: 'spin', cue: 'Angular-momentum spin-up', params: { fromHz: 80, toHz: 160, dur: 3.2 }, status: 'synthesized' },
    { t: sfxAt(84), file: 'collision_tick.wav', gainDb: -22, anchor: 'slamming', cue: 'Collision tick 1 / vertical arrow damps', status: 'synthesized' },
    { t: sfxAt(88), file: 'collision_tick.wav', gainDb: -22, anchor: 'canceling', cue: 'Collision tick 2 / vertical arrow damps', status: 'synthesized' },
    { t: sfxAt(91), file: 'collision_tick.wav', gainDb: -22, anchor: 'vertical', cue: 'Collision tick 3 / vx survives', status: 'synthesized' },
    { t: sfxAt(97), file: 'collision_tick.wav', gainDb: -24, anchor: 'sideways', cue: 'Collision tick 4 / disk plane locks', status: 'synthesized' },
    { t: sfxAt(107), file: 'disk_collapse.wav', gainDb: -14, anchor: 'flattened', cue: 'Disk-collapse bass settle', status: 'synthesized' },
    { t: sfxAt(124), file: 'telemetry_click.wav', gainDb: -24, anchor: 'just', cue: 'Telemetry click 1 on FACTS.bandDeg chip', status: 'synthesized' },
    { t: sfxAt(133), file: 'telemetry_click.wav', gainDb: -24, anchor: 'three', cue: 'Telemetry click 2 on FACTS.otherPlanetsDeg chip', status: 'synthesized' },
  ],
}, null, 2) + '\n')

const gaps = beats.slice(1).map((b, i) => b.at - beats[i].at)
const tail = meta.totalDuration - beats.at(-1).at
console.log(JSON.stringify({
  beats: beats.length,
  words: words.length,
  totalDuration: meta.totalDuration,
  maxGap: Math.max(...gaps, tail).toFixed(3),
  tailHold: tail.toFixed(3),
  questionAt: questionBeat.at,
  questionPct: Number((questionBeat.at / meta.totalDuration * 100).toFixed(1)),
  anchorWords: Object.keys(anchors).length,
  sfxEvents: 11,
}, null, 2))
