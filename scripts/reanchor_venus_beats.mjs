/**
 * reanchor_venus_beats.mjs — one-off, explicit beat-sheet re-anchor for
 * episodes/venus-sun-rises-west.
 *
 * Reads the generated WordBoundary manifest and writes three text artifacts:
 *   episodes/<slug>/scene.json   beats[] + anchors + question.questionAt
 *   episodes/<slug>/meta.json    measured duration/word count/questionAt
 *   episodes/<slug>/sfx.json     SFX events on exact word starts
 *
 * No MP3/PNG/MP4 bytes are read. Only metadata.json (text) is consumed.
 * Run after generate_audio.py, never before: there is no timing fallback.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SLUG = 'venus-sun-rises-west'
const EP = path.join(ROOT, 'episodes', SLUG)
const MANIFEST = path.join(ROOT, 'public', 'audio', SLUG, 'metadata.json')
const meta = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
const words = meta.words

if (!words?.length) throw new Error('no WordBoundary words in manifest — refusing to estimate timings')

/** index into metadata.words[]; `at` is always that word's exact start. */
const SPECS = [
  { i: 0, kind: 'chip', text: 'SUN RISES WEST', note: 'frame 1 = content: huge Venus, west horizon, CW arrow drawing on; anchor word On' },
  { i: 7, kind: 'camera', scale: 1.6, to: [0.5, 0.46], note: 'hero passes 55% of frame width; anchor word west' },
  { i: 17, kind: 'shape', id: 'day-stretch', note: '"lasts" — day length stretches as a shape, not a second number' },
  { i: 22, kind: 'chip', text: 'SPIN OUTLASTS YEAR', note: '"year" — hook contradiction part 2, no numeral' },
  { i: 25, kind: 'chip', text: 'ORBIT SAME WAY', note: '"assume" — kill the orbits-backward belief first' },
  { i: 32, kind: 'chip', text: 'NOT BACKWARD', note: '"backward" — explicit denial before the same-direction proof' },
  { i: 33, kind: 'shape', id: 'orbit-lane-pair', note: '"It" — Venus and Earth orbit lanes appear' },
  { i: 35, kind: 'camera', scale: 1.15, to: [0.5, 0.5], note: '"It travels" — pull back from the push-in' },
  { i: 43, kind: 'shape', id: 'matching-orbit-arrows', note: '"same" — both orbit arrows draw CCW together' },
  { i: 48, kind: 'shape', id: 'spin-direction-pair', note: '"backward" — Earth CCW vs Venus CW spin arrows' },
  { i: 51, kind: 'chip', text: 'SPIN BACKWARD', note: '"spin" — claim lands on the spoken word' },
  { i: 52, kind: 'palette', ground: 'secondary', note: '"While" — full-bleed ground flip #1, cool #60A5FA' },
  { i: 56, kind: 'chip', text: 'UPRIGHT TOP', note: '"planet" — reference state before the flip; no Uranus number' },
  { i: 61, kind: 'shape', id: 'axis-upright', note: '"upright" — dashed upright axis through Venus' },
  { i: 65, kind: 'shape', id: 'axis-flip', note: '"flipped" — axis rotates to the retrograde convention' },
  { i: 71, kind: 'chip', text: 'FACT:obliquityDeg', note: '"177-degree" — STATIC chip: resolves FACTS.obliquityDeg.display; not the proof' },
  { i: 72, kind: 'camera', scale: 1.45, to: [0.5, 0.42], note: '"tilt" — push into the axis so the flip is a camera move' },
  { i: 77, kind: 'palette', ground: 'primary', note: '"slow" — full-bleed ground flip #2, amber #F59E0B' },
  { i: 81, kind: 'chip', text: 'TWO FORCES', note: '"two" — hedge frame for the mechanism' },
  { i: 86, kind: 'shape', id: 'impact-field', note: '"cosmic" — off-center impact field enters' },
  { i: 88, kind: 'shape', id: 'off-center-hit', note: '"First" — protoplanet dot hits off-center' },
  { i: 93, kind: 'chip', text: 'LIKELY IMPACT', note: '"slammed" — hedge stays in the chip; never a settled-cause claim' },
  { i: 98, kind: 'shape', id: 'spin-recoil', note: '"knocking" — recoil tips the spin' },
  { i: 103, kind: 'question', text: 'EAST OR WEST, WHICH SUNRISE?', note: '"Then" — one question at 58.6% of runtime; replaces the claim chip' },
  { i: 109, kind: 'shape', id: 'tidal-vectors', note: '"Sun’s" — gravity arrows pull on the atmosphere' },
  { i: 114, kind: 'shape', id: 'atmosphere-shell', note: '"thick" — CO2 shell wraps Venus; pressure shown as geometry, not a second number' },
  { i: 120, kind: 'chip', text: 'TIDAL BRAKE', note: '"slow-motion" — mechanism chip, no numeral' },
  { i: 124, kind: 'camera', scale: 0.92, to: [0.5, 0.5], note: '"reversed" — pull back during the brake' },
  { i: 128, kind: 'chip', text: 'SPIN VS YEAR', note: '"That" — claim chip before the proof; hidden during the panel' },
  { i: 134, kind: 'shape', id: 'two-clocks', note: '"one" — paired clock rails appear' },
  { i: 140, kind: 'counter', factKeys: ['spinDays', 'orbitDays'], suffix: 'EARTH DAYS', dur: 1.2, note: '"243" — THE ONE visual proof; no second counter/dots/bar' },
  { i: 143, kind: 'shape', id: 'year-lane', note: '"while" — year rail stays visible as the spin rail passes it' },
  { i: 152, kind: 'shape', id: 'proof-crosshair', note: '"225" — crosshair pins the crossing; still one proof' },
  { i: 153, kind: 'chip', text: 'SPIN BEATS YEAR', note: '"Meaning" — verdict chip returns after the proof panel exits' },
  { i: 163, kind: 'shape', id: 'west-horizon-return', note: '"rise" — Act 1 horizon and Sun return at their final loop state' },
  { i: 166, kind: 'palette', ground: 'ground', note: '"west" — full-bleed return to void ground; prepares the loop frame' },
  { i: 169, kind: 'chip', text: 'FACT:sunsetApproxDays', note: '"nearly" — STATIC chip: resolves FACTS.sunsetApproxDays.display; not a counted proof' },
  { i: 174, kind: 'shape', id: 'sun-east-set', note: '"sunset" — Sun dips below the RIGHT/east horizon; completes the west-rise mirror' },
  { i: 178, kind: 'camera', scale: 1.0, to: [0.5, 0.5], note: '"spin" — camera geometry locked back to frame 1' },
  { i: 182, kind: 'chip', text: 'SUN RISES WEST', note: '"year" — loop chip identical to t=first; 1.5 s tail cuts to frame 1' },
]

const beats = SPECS.map(({ i, ...beat }) => ({
  ...beat,
  at: words[i].start,
  note: `${beat.note} [WordBoundary #${i}: ${JSON.stringify(words[i].w)} @ ${words[i].start.toFixed(3)}s]`,
}))

if (!beats.every((b, i) => i === 0 || b.at > beats[i - 1].at)) {
  throw new Error('re-anchored beats are not strictly increasing')
}

/** occurrence map for verify.ts: word -> 1-based indices that were used as anchors */
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
scene.beats = beats
scene.anchors = anchors
scene.question = {
  ...scene.question,
  questionAt: beats.find((b) => b.kind === 'question').at,
}
fs.writeFileSync(scenePath, JSON.stringify(scene, null, 2) + '\n')

const questionBeat = beats.find((b) => b.kind === 'question')
const metaPath = path.join(EP, 'meta.json')
const oldMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
fs.writeFileSync(metaPath, JSON.stringify({
  ...oldMeta,
  hook: 'On Venus, the Sun rises in the west and sets in the east—and a single day lasts longer than an entire year.',
  hookStyle: 'contradiction',
  captionStyle: 'phrase',
  endCard: false,
  durationSec: meta.totalDuration,
  wordCount: words.length,
  scriptTokenCount: 188,
  wordCountSource: 'WordBoundary',
  manifest: `public/audio/${SLUG}/metadata.json`,
  question: scene.question.text,
  questionAt: questionBeat.at,
  pinnedComment: scene.question.pinnedComment,
  ctaStyle: 'question',
  voice: meta.voice,
  voiceRate: meta.rate,
}, null, 2) + '\n')

const sfxPath = path.join(EP, 'sfx.json')
const sfxAt = (i) => words[i].start
fs.writeFileSync(sfxPath, JSON.stringify({
  comment: 'SFX for venus-sun-rises-west, anchored to exact WordBoundary starts. Synthesized in repo; no downloads.',
  events: [
    { t: sfxAt(0), file: 'sub_drop.wav', gainDb: -14, anchor: 'On' },
    { t: sfxAt(48), file: 'riser.wav', gainDb: -18, anchor: 'backward' },
    { t: sfxAt(103), file: 'riser.wav', gainDb: -18, anchor: 'Then' },
    { t: sfxAt(120), file: 'riser.wav', gainDb: -18, anchor: 'slow-motion' },
    { t: sfxAt(140), file: 'sub_drop.wav', gainDb: -12, anchor: '243' },
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
  questionPct: (questionBeat.at / meta.totalDuration * 100).toFixed(1),
  anchorWords: Object.keys(anchors).length,
}, null, 2))
