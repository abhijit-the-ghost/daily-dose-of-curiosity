/**
 * qa_metrics.mjs — measure a rendered MP4 against INSTRUCTIONS.md §9.1.
 *
 *   bun scripts/qa_metrics.mjs --slug uranus-tilted-sideways
 *   bun scripts/qa_metrics.mjs --video output/my-file.mp4 --out episodes/my-slug/qa.md
 *
 * Prints a PASS/FAIL table. Exit code 0 = every gate passed, 1 = at least one
 * failed. `ffmpeg`/`ffprobe` must be on PATH (verified on this machine 2026-11).
 * No estimates: every number below comes from an actual decode.
 *
 * Note: loudness is read from ebur128's Summary block (the same EBU R128
 * integrated measurement used by loudnorm), and true peak from its TPK row.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  if (i < 0) return fallback
  const v = argv[i + 1]
  return v && !v.startsWith('--') ? v : fallback
}

const SLUG = opt('slug', '')
const VIDEO_ARG = opt('video', '')
const VIDEO = path.resolve(
  ROOT,
  VIDEO_ARG || (SLUG ? path.join('output', `${SLUG}-1080x1920.mp4`) : ''),
)
const OUT = opt('out', '')
/* Owner-approved 1–2 min explainer formats get their own duration band.
   Everything else keeps the §9.1 Short band. */
const DURATION_BANDS = { 'venus-sun-rises-west': [20, 75] }
const [dLo, dHi] = DURATION_BANDS[SLUG] ?? [20, 35]

if (!VIDEO_ARG && !SLUG) {
  console.error('usage: bun scripts/qa_metrics.mjs --slug <slug> | --video <path> [--out <qa.md>]')
  process.exit(2)
}
if (!fs.existsSync(VIDEO)) {
  console.error(`[qa] video not found: ${VIDEO}`)
  process.exit(2)
}

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (r.error) throw new Error(`${cmd}: ${r.error.message}`)
  // metadata=print and ebur128 write to stderr; ffprobe writes to stdout.
  return { code: r.status, text: `${r.stdout ?? ''}\n${r.stderr ?? ''}` }
}

const numbers = (text, re) =>
  [...text.matchAll(re)].map((m) => Number.parseFloat(m[1])).filter(Number.isFinite)
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : 'n/a')

const clampPass = (v, lo, hi) => v >= lo && v <= hi

/* ---------------- measurements ---------------- */
const motionText = run('ffmpeg', [
  '-hide_banner', '-nostats', '-i', VIDEO,
  '-vf', 'fps=15,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG',
  '-f', 'null', '-',
]).text
const motionSamples = numbers(motionText, /lavfi\.signalstats\.YAVG=([-\d.]+)/g)
const motion = mean(motionSamples)
const frozenShare = motionSamples.length
  ? motionSamples.filter((v) => v < 0.05).length / motionSamples.length
  : 1

const lumaText = run('ffmpeg', [
  '-hide_banner', '-nostats', '-i', VIDEO,
  '-vf', 'fps=5,signalstats,metadata=print:key=lavfi.signalstats.YAVG',
  '-f', 'null', '-',
]).text
const lumaSamples = numbers(lumaText, /lavfi\.signalstats\.YAVG=([-\d.]+)/g)
const luma = mean(lumaSamples)
const lumaMin = Math.min(...lumaSamples)
const lumaMax = Math.max(...lumaSamples)

const loudText = run('ffmpeg', [
  '-hide_banner', '-nostats', '-i', VIDEO,
  '-af', 'ebur128=peak=true', '-f', 'null', '-',
]).text
const summaryAt = loudText.lastIndexOf('Integrated loudness:')
const loudTail = summaryAt >= 0 ? loudText.slice(summaryAt) : loudText
const lufs = Number.parseFloat(loudTail.match(/I:\s*([-\d.]+)\s*LUFS/)?.[1] ?? 'NaN')
const peak = Number.parseFloat(loudTail.match(/Peak:\s*([-\d.]+)\s*dBFS/)?.[1] ?? 'NaN')

const silenceText = run('ffmpeg', [
  '-hide_banner', '-nostats', '-i', VIDEO,
  '-af', 'silencedetect=n=-35dB:d=0.25', '-f', 'null', '-',
]).text
const gaps = []
for (const m of silenceText.matchAll(/silence_duration:\s*([\d.]+)/g)) {
  const d = Number.parseFloat(m[1])
  if (Number.isFinite(d)) gaps.push(d)
}
// A trailing silence may have a start but no end; count it up to EOF below.
const starts = [...silenceText.matchAll(/silence_start:\s*([\d.]+)/g)].map((m) => Number.parseFloat(m[1]))
if (starts.length > gaps.length) gaps.push(Math.max(0, Number(opt('duration', '0')) - starts.at(-1)))
const silenceTotal = gaps.reduce((a, b) => a + b, 0)
const maxGap = Math.max(0, ...gaps)

const probeText = run('ffprobe', [
  '-v', 'error',
  '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels',
  '-show_entries', 'format=duration',
  '-of', 'json', VIDEO,
]).text
let probe = {}
try { probe = JSON.parse(probeText.slice(0, probeText.lastIndexOf('}') + 1)) } catch { /* reported below */ }
const streams = Array.isArray(probe?.streams) ? probe.streams : []
const v = streams.find((s) => s.codec_type === 'video') ?? {}
const a = streams.find((s) => s.codec_type === 'audio') ?? {}
const duration = Number.parseFloat(probe?.format?.duration ?? 'NaN')

/* ---------------- gates ---------------- */
const rows = []
const row = (metric, measured, pass, threshold) => rows.push({ metric, measured, pass, threshold })

row('Motion energy', fmt(motion), motion >= 1.5, '≥ 1.5 @ fps=15')
row('Frozen share', `${fmt(frozenShare * 100, 1)} %`, frozenShare <= 0.05, '≤ 5 %')
row('Mean luma', `${fmt(luma, 1)}  (${fmt(lumaMin, 0)}–${fmt(lumaMax, 0)})`, clampPass(luma, 55, 85), '55–85')
row('Loudness', `${fmt(lufs, 1)} LUFS / ${fmt(peak, 1)} dBTP`, clampPass(lufs, -14.5, -13.5) && peak <= -1.0, '−14 ± 0.5 LUFS, ≤ −1.0 dBTP')
row('Silence', `${fmt((silenceTotal / Math.max(duration, 1)) * 100, 1)} % / max ${fmt(maxGap)} s`,
  silenceTotal / Math.max(duration, 1) <= 0.10 && maxGap <= 0.45, '≤ 10 %, gap ≤ 0.45 s')
row('Spec', `${v.codec_name ?? '?'} ${v.width ?? '?'}×${v.height ?? '?'} ${v.r_frame_rate ?? '?'} ${v.pix_fmt ?? '?'} / ${a.codec_name ?? '?'} ${a.sample_rate ?? '?'} Hz`,
  v.codec_name === 'h264' && v.width === 1080 && v.height === 1920 && v.r_frame_rate === '30/1' &&
  v.pix_fmt === 'yuv420p' && a.codec_name === 'aac' && a.sample_rate === '48000',
  'h264 1080×1920 30/1 yuv420p / aac 48 kHz')
row('Duration', `${fmt(duration)} s`, clampPass(duration, dLo, dHi), `${dLo}–${dHi} s`)

/* ---------------- report ---------------- */
const md = [
  `## QA metrics — ${path.relative(ROOT, VIDEO)}`,
  '',
  '| Metric | Measured | PASS | Threshold |',
  '|---|---|---|---|',
  ...rows.map((r) => `| ${r.metric} | ${r.measured} | ${r.pass ? '✅ PASS' : '❌ FAIL'} | ${r.threshold} |`),
  '',
  `Cap size / text zones / loop need stills: \`bun scripts/dev_shot.mjs 0,2,4,7,10,13,16,19,22,25,28 --episode ${SLUG || '<slug>'}\`.`,
  '',
].join('\n')

console.log(md)
if (OUT) {
  const outPath = path.resolve(ROOT, OUT)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, md, 'utf8')
  console.log(`[qa] wrote ${outPath}`)
}
process.exit(rows.every((r) => r.pass) ? 0 : 1)
