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
 *
 * Exit code 0 = pass, 1 = any failure.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const BANNED: Record<string, string[]> = {
  'everest-challenger-deep': ['rock height', 'true height', 'exact depth', 'exact'],
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

const checkTails = (words: unknown[], duration: number) => {
  const issues: string[] = []
  if (words.length < 60) issues.push(`word-count ${words.length} < 60`)
  if (words.length > 75) issues.push(`word-count ${words.length} > 75`)
  if (duration < 20) issues.push(`duration ${duration.toFixed(2)}s < 20s`)
  if (duration > 35) issues.push(`duration ${duration.toFixed(2)}s > 35s`)
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
    failures.push(...checkTails(words, metadata?.totalDuration ?? 0))
    // Banned strings
    failures.push(...checkBanned(slug, script))
    // FACTS
    failures.push(...(await checkFacts(slug)))
    // Anchors
    const { issues, rows } = checkAnchors(slug, scene, metadata)
    failures.push(...issues)

    const status = failures.length === 0 ? 'PASS' : 'FAIL'
    if (status === 'FAIL') anyFailed = true
    console.log(`\n[${status}] ${slug}  (${words.length} words, ${(metadata?.totalDuration ?? 0).toFixed(2)}s)`)
    for (const r of rows.slice(0, 24)) console.log(`    anchor {${r.word}, ${r.occ}}  →  ${r.status}`)
    if (rows.length > 24) console.log(`    … +${rows.length - 24} more`)
    for (const f of failures) console.log(`    ✗ ${f}`)
  }
  process.exit(anyFailed ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(1) })
