/**
 * verify.ts — per-episode QA gate.
 *
 * Usage:
 *   bun run verify <slug>            verify one episode
 *   bun run verify                   verify every episode that has scene.json
 *
 * Checks:
 *   1. Anchors — every {word, occurrence} required by scene.json resolves in
 *      words[]; no silent missing or ambiguous occurrences.
 *   2. FACTS display strings match Facts.value round-trips (everest-challenger-deep only,
 *      via a direct TS import).
 *   3. Banned strings (per-episode, see BANNED map) — absent from script.txt.
 *   4. Tails — 60–75 words, 20–35 s duration.
 *   5. MP4 spec (when output/<slug>-1080x1920.mp4 exists) — codec/res/fps/pix
 *      format/sample rate/duration/faststart, per INSTRUCTIONS.md §9.1.
 *   6. Decoded stills at 1 s and 3 s into output/.verify/ for human review.
 *
 * Exit code 0 = pass, 1 = any failure.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const BANNED: Record<string, string[]> = {
  'everest-challenger-deep': ['rock height', 'true height', 'exact depth', 'exact'],
}

// Per-format override for word-count and duration bands. Formats introduced this session:
//   long-form-45 (`star-scale` series, 45 s cap, ~100–125 words)
//   explainer-75 (owner-approved 1–2 min, 6 acts, ~188 script tokens / 183 WordBoundary words)
const FORMAT_LIMITS: Record<string, { words: [number, number]; seconds: [number, number] }> = {
  'sun-never-black-hole': { words: [80, 125], seconds: [20, 45] },
  'venus-sun-rises-west': { words: [170, 200], seconds: [20, 75] },
  // owner-approved 5-act long-form replacement; 150 words / 52.07 s measured from metadata
  'solar-system-flat-plane': { words: [140, 160], seconds: [45, 60] },
}

const readJSON = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8')) as unknown
const exists = (p: string) => fs.existsSync(p)

interface MetadataWord { w: string; start: number; end: number }
interface MetadataDoc { words?: MetadataWord[]; totalDuration?: number }
interface SceneDoc { anchors?: Record<string, number[]> }

const wordsFor = (metadata: MetadataDoc | null | undefined): MetadataWord[] => metadata?.words ?? []

const lower = (s: string) => s.toLowerCase().trim()

const findAll = (words: { w: string }[], needle: string) =>
  words.filter((w) => lower(w.w) === lower(needle))

const checkAnchors = (slug: string, scene: SceneDoc, metadata: MetadataDoc | null) => {
  const issues: string[] = []
  const anchors: Record<string, number[]> = scene?.anchors ?? {}
  if (Object.keys(anchors).length === 0) {
    // anchors are only required for episodes that use beat anchoring; others skip
    return { issues: [], rows: [] }
  }
  const words = wordsFor(metadata)
  const rows: { word: string; occ: number; status: string }[] = []
  for (const [word, occurrences] of Object.entries(anchors)) {
    for (const occ of occurrences) {
      const hits = findAll(words, word)
      const status = hits.length >= occ ? 'ok' : hits.length === 0 ? 'MISSING' : `AMBIGUOUS (only ${hits.length} occurrence(s))`
      const row = { word, occ, status }
      rows.push(row)
      if (status !== 'ok') issues.push(`anchor {${word}, ${occ}}: ${status}`)
    }
  }
  return { issues, rows }
}

const checkTails = (slug: string, words: unknown[], duration: number) => {
  const issues: string[] = []
  const cfg = FORMAT_LIMITS[slug] ?? { words: [60, 75], seconds: [20, 35] }
  const [wMin, wMax] = cfg.words
  const [sMin, sMax] = cfg.seconds
  if (words.length < wMin) issues.push(`word-count ${words.length} < ${wMin}`)
  if (words.length > wMax) issues.push(`word-count ${words.length} > ${wMax}`)
  if (duration < sMin) issues.push(`duration ${duration.toFixed(2)}s < ${sMin}s`)
  if (duration > sMax) issues.push(`duration ${duration.toFixed(2)}s > ${sMax}s`)
  return issues
}

const checkBanned = (slug: string, scriptRaw: string) => {
  const banned = BANNED[slug] ?? []
  const lowerScript = scriptRaw.toLowerCase()
  return banned.filter((s) => lowerScript.includes(s.toLowerCase())).map((s) => `banned string «${s}» present in script`)
}

const checkFacts = async (slug: string): Promise<string[]> => {
  if (slug !== 'everest-challenger-deep') return []
  const mod = await import(path.join(ROOT, 'episodes', slug, 'facts.ts'))
  const FACTS = mod?.FACTS ?? mod?.default ?? null
  if (!FACTS) return ['facts.ts did not export FACTS']
  const issues: string[] = []
  for (const [k, v] of Object.entries(FACTS) as [string, { value: number; display: string }][]) {
    if (typeof v?.value !== 'number' || typeof v?.display !== 'string') { issues.push(`FACTS.${k}: invalid shape`); continue }
    const digits = v.display.replace(/[^\d]/g, '')
    const valDigits = String(Math.trunc(Math.abs(v.value))).replace(/[^\d]/g, '')
    const approx = String(Math.round(Math.abs(v.value)))
    // digits in display should include the value (or the value's rounded whole part)
    if (!digits.includes(valDigits) && !digits.includes(approx) && !digits.includes(String(Math.round(v.value)))) {
      issues.push(`FACTS.${k}: display «${v.display}» does not contain its value ${v.value}`)
    }
  }
  return issues
}

/** INSTRUCTIONS.md §9.1 spec row. Skipped (not failed) when there is no render yet. */
const checkVideoSpec = (slug: string): { issues: string[]; skipped: boolean; summary?: string } => {
  const video = path.join(ROOT, 'output', `${slug}-1080x1920.mp4`)
  if (!exists(video)) return { issues: [], skipped: true }
  const probe = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,sample_rate',
    '-show_entries', 'format=duration',
    '-of', 'json', video,
  ], { encoding: 'utf8' })
  if (probe.error || probe.status !== 0) {
    return { issues: [`ffprobe failed: ${probe.error?.message ?? `exit ${probe.status}`}`], skipped: false }
  }
  let doc: { streams?: Record<string, string | number>[]; format?: { duration?: string } }
  try { doc = JSON.parse(probe.stdout) } catch {
    return { issues: ['ffprobe output was not JSON'], skipped: false }
  }
  const streams = doc.streams ?? []
  const v = streams.find((s) => s.codec_type === 'video') ?? {}
  const a = streams.find((s) => s.codec_type === 'audio') ?? {}
  const duration = Number.parseFloat(doc.format?.duration ?? 'NaN')
  const [, sMax] = (FORMAT_LIMITS[slug] ?? { words: [60, 75], seconds: [20, 35] }).seconds
  const sMin = 20
  const issues: string[] = []
  const expect = (actual: unknown, wanted: unknown, label: string) => {
    if (actual !== wanted) issues.push(`${label}: ${String(actual)} ≠ ${String(wanted)}`)
  }
  expect(v.codec_name, 'h264', 'video codec')
  expect(v.width, 1080, 'width')
  expect(v.height, 1920, 'height')
  expect(v.r_frame_rate, '30/1', 'fps')
  expect(v.pix_fmt, 'yuv420p', 'pixel format')
  expect(a.codec_name, 'aac', 'audio codec')
  expect(a.sample_rate, '48000', 'sample rate')
  if (!Number.isFinite(duration) || duration < sMin || duration > sMax) {
    issues.push(`duration ${duration} outside ${sMin}–${sMax} s`)
  }
  const trace = spawnSync('ffmpeg', ['-v', 'trace', '-i', video, '-frames:v', '1', '-f', 'null', '-'], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  })
  const atoms = [...`${trace.stdout ?? ''}\n${trace.stderr ?? ''}`.matchAll(/type:'(moov|mdat)'[^\n]*?sz:\s*\d+\s+(\d+)/g)]
  const moov = atoms.find((m) => m[1] === 'moov')
  const mdat = atoms.find((m) => m[1] === 'mdat')
  if (!moov || !mdat) issues.push('faststart: moov/mdat atoms not found')
  else if (Number(moov[2]) >= Number(mdat[2])) issues.push('faststart: moov is not before mdat')

  return {
    issues,
    skipped: false,
    summary: `${v.codec_name} ${v.width}×${v.height} ${v.r_frame_rate} ${v.pix_fmt} / ${a.codec_name} ${a.sample_rate} Hz, ${duration.toFixed(2)}s, ${moov && mdat && Number(moov[2]) < Number(mdat[2]) ? 'faststart' : 'NO faststart'}`,
  }
}

/** Decode two timestamps to PNG for human review (Phase 4 gate). */
const decodeFrames = (slug: string): { issues: string[]; paths: string[]; skipped: boolean } => {
  const video = path.join(ROOT, 'output', `${slug}-1080x1920.mp4`)
  if (!exists(video)) return { issues: [], paths: [], skipped: true }
  const dir = path.join(ROOT, 'output', '.verify')
  fs.mkdirSync(dir, { recursive: true })
  const paths = [1, 3].map((t) => {
    const out = path.join(dir, `${slug}-t${t}s.png`)
    const r = spawnSync('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-ss', String(t), '-i', video, '-frames:v', '1', out,
    ], { encoding: 'utf8' })
    if (r.error || r.status !== 0 || !exists(out) || fs.statSync(out).size === 0) {
      return { out, error: `decode at ${t}s failed: ${r.error?.message ?? `exit ${r.status}`}` }
    }
    return { out, error: null }
  })
  return {
    issues: paths.filter((p) => p.error).map((p) => p.error!),
    paths: paths.map((p) => p.out),
    skipped: false,
  }
}

const main = async () => {
  const arg = process.argv[2]
  const episodesDir = path.join(ROOT, 'episodes')
  const slugs = arg ? [arg] : fs.readdirSync(episodesDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)

  let anyFailed = false
  for (const slug of slugs) {
    const scenePath = path.join(episodesDir, slug, 'scene.json')
    const scriptPath = path.join(episodesDir, slug, 'script.txt')
    const metaPath = path.join(ROOT, 'public', 'audio', slug, 'metadata.json')
    if (!exists(scenePath) || !exists(scriptPath)) { console.log(`[skip] ${slug} — missing scene.json or script.txt`); continue }
    const scene = readJSON(scenePath) as SceneDoc
    const script = fs.readFileSync(scriptPath, 'utf8')
    const metadata = exists(metaPath) ? (readJSON(metaPath) as MetadataDoc) : null
    const words = metadata ? wordsFor(metadata) : []
    const failures: string[] = []

    // Tails
    failures.push(...checkTails(slug, words, metadata?.totalDuration ?? 0))
    // Banned strings
    failures.push(...checkBanned(slug, script))
    // FACTS
    failures.push(...(await checkFacts(slug)))
    // Anchors
    const { issues, rows } = checkAnchors(slug, scene, metadata)
    failures.push(...issues)
    // MP4 spec + decoded stills (only when a render exists)
    const videoCheck = checkVideoSpec(slug)
    failures.push(...videoCheck.issues)
    const frameCheck = decodeFrames(slug)
    failures.push(...frameCheck.issues)

    const status = failures.length === 0 ? 'PASS' : 'FAIL'
    if (status === 'FAIL') anyFailed = true
    console.log(`\n[${status}] ${slug}  (${words.length} words, ${(metadata?.totalDuration ?? 0).toFixed(2)}s)`)
    if (videoCheck.skipped) console.log('    video spec: SKIP (no output/<slug>-1080x1920.mp4)')
    else if (videoCheck.summary) console.log(`    video spec: ${videoCheck.summary}`)
    if (frameCheck.skipped) console.log('    decoded stills: SKIP')
    else if (!frameCheck.issues.length) console.log(`    decoded stills: ${frameCheck.paths.map((p) => path.relative(ROOT, p)).join(', ')}`)
    for (const r of rows.slice(0, 24)) console.log(`    anchor {${r.word}, ${r.occ}}  →  ${r.status}`)
    if (rows.length > 24) console.log(`    … +${rows.length - 24} more`)
    for (const f of failures) console.log(`    ✗ ${f}`)
  }
  process.exit(anyFailed ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(1) })
