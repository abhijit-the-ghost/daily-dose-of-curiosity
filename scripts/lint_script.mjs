#!/usr/bin/env node
/**
 * lint_script.mjs — narration-script linter for Daily Dose of Curiosity.
 *
 * Usage (from repo root, bun or node):
 *   bun scripts/lint_script.mjs <slug>            -> episodes/<slug>/script.txt (+ sources.md)
 *   bun scripts/lint_script.mjs path/to/script.txt
 *
 * Options:
 *   --wps <n>          words per second used for time estimates (default 2.9,
 *                      calibrated on solar-system-flat-plane: 150 words / 51.72 s)
 *   --min-sec <n>      target duration floor   (default 60)
 *   --max-sec <n>      target duration ceiling (default 120)
 *   --ending <mode>    question | cta | both | any   (default any)
 *   --max-gap <n>      max seconds between re-hooks (default 18)
 *   --sources <path>   override sources.md location
 *   --strict           unsourced sentences are ERRORs, not WARNs
 *   --json             machine-readable output
 *   --no-color
 *
 * Exit code: 1 if any ERROR, else 0.
 *
 * What this does NOT do: it cannot tell whether a source is real, was opened,
 * or supports the sentence. A human must open every source (AGENTS.md rule).
 * Timing here is an ESTIMATE from word count. Real timing comes only from
 * edge-tts WordBoundary events in metadata.json after generate_audio.py.
 * Heuristic checks are labelled (heuristic) — treat them as prompts to think.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/* ------------------------------ args ------------------------------ */
const argv = process.argv.slice(2)
const opts = {
  wps: 2.9,
  minSec: 60,
  maxSec: 120,
  ending: 'any',
  maxGap: 18,
  sources: null,
  strict: false,
  json: false,
  color: process.stdout.isTTY && !process.env.NO_COLOR,
}
let target = null
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  const next = () => argv[++i]
  if (a === '--wps') opts.wps = Number(next())
  else if (a === '--min-sec') opts.minSec = Number(next())
  else if (a === '--max-sec') opts.maxSec = Number(next())
  else if (a === '--ending') opts.ending = String(next())
  else if (a === '--max-gap') opts.maxGap = Number(next())
  else if (a === '--sources') opts.sources = next()
  else if (a === '--strict') opts.strict = true
  else if (a === '--json') opts.json = true
  else if (a === '--no-color') opts.color = false
  else if (!a.startsWith('--') && !target) target = a
  else {
    console.error(`Unknown option: ${a}`)
    process.exit(2)
  }
}
if (!target) {
  console.error('Usage: bun scripts/lint_script.mjs <slug | path/to/script.txt> [options]')
  process.exit(2)
}
if (!['question', 'cta', 'both', 'any'].includes(opts.ending)) {
  console.error('--ending must be question | cta | both | any')
  process.exit(2)
}

const isPath = /[\\/]/.test(target) || target.endsWith('.txt')
const scriptPath = isPath ? path.resolve(target) : path.join(ROOT, 'episodes', target, 'script.txt')
const sourcesPath = opts.sources
  ? path.resolve(opts.sources)
  : path.join(path.dirname(scriptPath), 'sources.md')

if (!fs.existsSync(scriptPath)) {
  console.error(`script not found: ${scriptPath}`)
  process.exit(2)
}

/* ------------------------------ helpers ------------------------------ */
const C = (code, s) => (opts.color ? `\x1b[${code}m${s}\x1b[0m` : s)
const red = (s) => C(31, s)
const yellow = (s) => C(33, s)
const green = (s) => C(32, s)
const dim = (s) => C(2, s)
const bold = (s) => C(1, s)

const findings = []
const add = (level, code, msg, sentence) => findings.push({ level, code, msg, sentence: sentence ?? null })

const wordsOf = (text) => text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w))
const countWords = (text) => wordsOf(text).length

/* ------------------------------ parse ------------------------------ */
// Ignore whole-line comments (# ... or // ...) so briefs can annotate a script file.
const raw = fs
  .readFileSync(scriptPath, 'utf8')
  .replace(/\r\n/g, '\n')
  .split('\n')
  .filter((l) => !/^\s*(#|\/\/)/.test(l))
  .join('\n')

/**
 * Sentence splitter that keeps [src: S1, S2] markers attached to the sentence
 * they belong to, whether the marker sits before or after the final punctuation.
 */
function parseSentences(text) {
  const sentences = []
  let cur = { text: '', src: [] }
  let closed = false
  const flush = () => {
    if (cur.text.trim()) sentences.push({ text: cur.text.trim(), src: cur.src })
    cur = { text: '', src: [] }
    closed = false
  }
  for (const tok of text.split(/(\[src:[^\]]*\])/i)) {
    const m = tok.match(/^\[src:\s*([^\]]*)\]$/i)
    if (m) {
      cur.src.push(...m[1].split(/[,;\s]+/).filter(Boolean))
      continue
    }
    let rest = tok
    while (rest.length) {
      if (closed) {
        const lead = rest.match(/^\s*/)[0]
        if (lead.length === rest.length) break
        flush()
        rest = rest.slice(lead.length)
        continue
      }
      const mm = rest.match(/[.!?]+["'”’)]*(?=\s|$)/)
      if (!mm) {
        cur.text += rest
        break
      }
      const end = mm.index + mm[0].length
      cur.text += rest.slice(0, end)
      rest = rest.slice(end)
      closed = true
    }
  }
  flush()
  return sentences.map((s) => ({ ...s, text: s.text.replace(/\s+/g, ' ') }))
}

const sentences = parseSentences(raw)
if (!sentences.length) {
  console.error('script is empty')
  process.exit(2)
}

let cum = 0
for (const s of sentences) {
  s.words = countWords(s.text)
  s.start = cum / opts.wps
  cum += s.words
  s.isQuestion = /\?["'”’)]*$/.test(s.text)
}
const totalWords = cum
const totalSec = totalWords / opts.wps
const n = sentences.length

/* ------------------------------ vocab ------------------------------ */
const NUMBER_WORDS =
  /\b(zero|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|trillion|half|double|triple|percent)\b/i

const BANNED_OPENERS = [
  /^(so|okay|ok|alright|hey|hi|hello|welcome|today)\b/i,
  /^in this (video|short)\b/i,
  /^let'?s\b/i,
  /^(did you know|have you ever|ever wonder|ever wondered|what if i told you|you won'?t believe|you'?re not going to believe)\b/i,
]
const SOFT_OPENERS = [/^(imagine|picture this|quick question|think about)\b/i]

const GENERIC_PHRASES = [
  'game changer', 'game-changer', 'mind-blowing', 'mind blowing', "you won't believe", 'blow your mind',
  'let that sink in', 'buckle up', 'dive into', 'dive in', "in today's video", 'in this video', 'stay tuned',
  'smash', 'like and subscribe', 'insane', 'crazy', 'literally', 'basically', 'essentially',
  'at the end of the day', "it's important to note", 'fascinating', 'amazing', 'incredible', 'unbelievable',
  'shocking', "here's the thing", 'the truth is',
]

const HOOK_SIGNAL =
  /\?|\b(never|not|no|nothing|none|wrong|lie|lies|myth|actually|isn'?t|aren'?t|wasn'?t|doesn'?t|don'?t|can'?t|won'?t|didn'?t|without|only|why|how|what|which|who|real)\b/i

const PIVOT =
  /\b(but|yet|until|except|instead|however|turns out|which means|that'?s why|here'?s the|so why|wait|and yet)\b/i

const VAGUE_ATTRIBUTION =
  /\b(scientists|experts|studies|researchers|they|people|some say|many)\s+(say|says|claim|claims|show|shows|found|believe|believes|think|thinks)\b/i

/* ------------------------------ HOOK ------------------------------ */
// A two-beat hook ("Drop X into Y. Does Z?") counts as one hook if the second beat is a question.
const hookSpan = sentences[1] && sentences[1].isQuestion && sentences[0].words + sentences[1].words <= 16 ? 2 : 1
const hook = { text: sentences.slice(0, hookSpan).map((s) => s.text).join(' '), words: sentences.slice(0, hookSpan).reduce((a, s) => a + s.words, 0) }
const hookFirst = sentences[0]

if (hook.words > 18) add('ERROR', 'hook-length', `Hook is ${hook.words} words (limit 18, target ≤12-14). Cut it.`, 0)
else if (hook.words > (hookSpan === 2 ? 14 : 12)) add('WARN', 'hook-length', `Hook is ${hook.words} words (target ≤${hookSpan === 2 ? 14 : 12}).`, 0)

const hookSec = hook.words / opts.wps
if (hookSec > 4.5) add('WARN', 'hook-time', `Hook ≈ ${hookSec.toFixed(1)} s spoken; the claim should land inside ~3-4 s.`, 0)

for (const re of BANNED_OPENERS) {
  if (re.test(hookFirst.text)) add('ERROR', 'hook-opener', `Throat-clearing opener: "${hookFirst.text.split(' ').slice(0, 4).join(' ')}…". Start on the claim.`, 0)
}
for (const re of SOFT_OPENERS) {
  if (re.test(hookFirst.text)) add('WARN', 'hook-opener', 'Soft opener ("imagine / picture this…"). Start on the contradiction instead.', 0)
}
if (!HOOK_SIGNAL.test(hook.text)) {
  add('WARN', 'hook-signal', '(heuristic) Hook has no tension signal (negation, "why/how/what", question, myth/real). Does it state a contradiction?', 0)
}

/* ------------------------------ LENGTH / RHYTHM ------------------------------ */
if (totalSec < opts.minSec) add('WARN', 'length', `Estimated ${totalSec.toFixed(0)} s is below the ${opts.minSec}-${opts.maxSec} s target (${totalWords} words).`)
if (totalSec > opts.maxSec) add('WARN', 'length', `Estimated ${totalSec.toFixed(0)} s is above the ${opts.minSec}-${opts.maxSec} s target (${totalWords} words).`)
if (totalSec > 35) {
  add('INFO', 'verify-band', 'Above the locked 20-35 s verify band (45 s long-form override has been used). The 60-120 s band is NOT locked: ask the owner before changing verify limits.')
}

const avg = totalWords / n
if (avg > 15) add('WARN', 'avg-sentence', `Average sentence ${avg.toFixed(1)} words (target ≤14).`)
sentences.forEach((s, i) => {
  if (s.words > 30) add('ERROR', 'sentence-length', `${s.words} words. Split it.`, i)
  else if (s.words > 22) add('WARN', 'sentence-length', `${s.words} words (target ≤22).`, i)
})
if (!sentences.some((s) => s.words <= 5)) add('WARN', 'rhythm', 'No short punch line (≤5 words). Add one at each pivot.')

for (let i = 2; i < n; i++) {
  const f = (k) => sentences[k].text.split(/\s+/)[0].toLowerCase().replace(/[^a-z']/g, '')
  if (f(i) && f(i) === f(i - 1) && f(i) === f(i - 2)) add('WARN', 'rhythm', `Three sentences in a row start with "${f(i)}".`, i)
}

/* ------------------------------ RE-HOOKS ------------------------------ */
const pivotTimes = [0]
sentences.forEach((s, i) => {
  if (i > 0 && (PIVOT.test(s.text) || (s.isQuestion && i < n - 1))) pivotTimes.push(s.start)
})
pivotTimes.push(totalSec)
for (let i = 1; i < pivotTimes.length; i++) {
  const gap = pivotTimes[i] - pivotTimes[i - 1]
  if (gap > opts.maxGap) {
    add('WARN', 'rehook', `(heuristic) ~${gap.toFixed(0)} s with no re-hook ("but / yet / until / which means…" or a question) between ≈${pivotTimes[i - 1].toFixed(0)} s and ≈${pivotTimes[i].toFixed(0)} s.`)
  }
}

/* ------------------------------ NUMBERS / TTS SAFETY ------------------------------ */
sentences.forEach((s, i) => {
  if (/[0-9]/.test(s.text)) add('ERROR', 'digits', 'Digits in narration. Spell numbers out ("eight thousand eight hundred…").', i)
  if (/[%°$€£&@#+=<>]/.test(s.text)) add('ERROR', 'symbols', 'Symbol in narration (% ° $ & etc.). Write the word ("percent", "degrees").', i)
  if (/[;()—–…]|\.\.\./.test(s.text)) add('WARN', 'tts-punct', 'Parenthesis, semicolon, dash or ellipsis: TTS reads these unpredictably. Use plain sentences.', i)
})

const numberSentences = sentences.filter((s) => NUMBER_WORDS.test(s.text)).length
if (numberSentences === 0) add('WARN', 'hero-number', 'No number in the script. The format wants ONE number shown on screen.')
else add('INFO', 'hero-number', `${numberSentences} sentence(s) contain a number word. Format wants ONE hero number; secondary numbers must earn their place.`)

/* ------------------------------ GENERIC / VAGUE ------------------------------ */
sentences.forEach((s, i) => {
  const lower = s.text.toLowerCase()
  for (const p of GENERIC_PHRASES) {
    if (lower.includes(p)) add('WARN', 'generic', `Generic phrase "${p}". Replace with a concrete fact or cut.`, i)
  }
  if (VAGUE_ATTRIBUTION.test(s.text)) add('WARN', 'vague-attribution', 'Vague attribution ("scientists say…"). Name the source or cut the sentence.', i)
})

const qMid = sentences.slice(0, n - 1).filter((s) => s.isQuestion).length
if (qMid > 3) add('WARN', 'questions', `${qMid} questions before the ending. Too many rhetorical questions reads as filler.`)

/* ------------------------------ ENDING ------------------------------ */
const last = sentences[n - 1]
const prev = n > 1 ? sentences[n - 2] : null
const isCta = (s) => /\bfollow\b/i.test(s.text) && s.words <= 8
const lastIsQ = last.isQuestion
const lastIsCta = isCta(last)
const hasQ = lastIsQ || (lastIsCta && prev?.isQuestion)

if (!lastIsQ && !lastIsCta) {
  add('ERROR', 'ending', 'Script must end on a viewer question or a spoken follow CTA ("Follow for more.").', n - 1)
} else {
  if (opts.ending === 'question' && !lastIsQ) add('ERROR', 'ending', '--ending question: last sentence must be the viewer question.', n - 1)
  if (opts.ending === 'cta' && !lastIsCta) add('ERROR', 'ending', '--ending cta: last sentence must be the follow CTA.', n - 1)
  if (opts.ending === 'both' && !(lastIsCta && prev?.isQuestion)) add('ERROR', 'ending', '--ending both: expected a question followed by the follow CTA.', n - 1)
}
if (lastIsCta && last.words > 5) add('WARN', 'cta', `CTA is ${last.words} words. Keep it to ~3-4 ("Follow for more.").`, n - 1)
sentences.slice(0, n - 1).forEach((s, i) => {
  if (isCta(s)) add('WARN', 'cta', 'CTA appears before the end. It belongs in the last sentence only.', i)
  if (/\b(like and subscribe|smash|subscribe)\b/i.test(s.text)) add('WARN', 'cta', 'Engagement-bait CTA. Use the question or "Follow for more."', i)
})
if (hasQ) {
  const q = lastIsQ ? last : prev
  if (!/\b(or|would you|which|rather)\b/i.test(q.text)) {
    add('WARN', 'question-style', '(heuristic) Owner decision D2: default question is a preference / would-you-rather with two real options.', n - 1)
  }
  if (/\b(thoughts|comment below|let me know|what do you think)\b/i.test(q.text)) {
    add('WARN', 'question-style', 'Weak comment prompt ("thoughts?", "what do you think?"). Offer two concrete options.', n - 1)
  }
} else if (lastIsCta) {
  add('INFO', 'ending', 'CTA-only ending. Owner decision D2 set a preference question as the default for the next 3 videos; use CTA-only deliberately as the one variable you are testing.')
}

/* ------------------------------ SOURCES ------------------------------ */
const declared = new Map() // id -> text block
if (fs.existsSync(sourcesPath)) {
  const md = fs.readFileSync(sourcesPath, 'utf8').replace(/\r\n/g, '\n')
  const re = /^[\s>*\-|#]*\**\s*\[?(S\d+)\]?\b/gim
  const hits = [...md.matchAll(re)]
  hits.forEach((h, k) => {
    const id = h[1].toUpperCase()
    const block = md.slice(h.index, k + 1 < hits.length ? hits[k + 1].index : md.length)
    declared.set(id, (declared.get(id) ?? '') + block)
  })
  if (!declared.size) add('WARN', 'sources-file', `No "S#" entries found in ${path.relative(ROOT, sourcesPath)}. Expected lines like "S1 https://…".`)
} else {
  add('WARN', 'sources-file', `sources.md not found at ${path.relative(ROOT, sourcesPath)}; cannot validate S# ids.`)
}

const used = new Set()
sentences.forEach((s, i) => {
  const exempt = s.isQuestion || isCta(s)
  for (const idRaw of s.src) {
    if (!/^S\d+$/i.test(idRaw)) {
      add('ERROR', 'src-format', `Malformed source id "${idRaw}". Use [src: S1] or [src: S1, S2].`, i)
      continue
    }
    const id = idRaw.toUpperCase()
    used.add(id)
    if (declared.size && !declared.has(id)) add('ERROR', 'src-missing', `${id} is cited but not defined in sources.md.`, i)
  }
  if (!exempt && s.src.length === 0) {
    const numeric = NUMBER_WORDS.test(s.text)
    const level = opts.strict || numeric ? 'ERROR' : 'WARN'
    add(level, 'src-coverage', numeric
      ? 'Sentence with a number has no [src: S#]. Every factual sentence needs one.'
      : 'No [src: S#]. If this is a factual claim, source it; if it is a pure transition, keep it claim-free.', i)
  }
})
for (const id of declared.keys()) {
  if (!used.has(id)) add('WARN', 'src-unused', `${id} is defined in sources.md but never cited in the script.`)
  else if (!/https?:\/\//i.test(declared.get(id))) add('WARN', 'src-url', `(heuristic) No URL found for ${id} in sources.md.`)
}
add('INFO', 'human-check', 'The linter cannot verify sources. The owner must open each URL and confirm it supports the sentence.')

/* ------------------------------ REPORT ------------------------------ */
const errors = findings.filter((f) => f.level === 'ERROR')
const warns = findings.filter((f) => f.level === 'WARN')

if (opts.json) {
  console.log(
    JSON.stringify(
      {
        script: scriptPath,
        words: totalWords,
        sentences: n,
        estSeconds: Number(totalSec.toFixed(1)),
        wps: opts.wps,
        errors: errors.length,
        warnings: warns.length,
        sentenceMap: sentences.map((s, i) => ({ i, estStart: Number(s.start.toFixed(1)), words: s.words, src: s.src, text: s.text })),
        findings,
      },
      null,
      2,
    ),
  )
  process.exit(errors.length ? 1 : 0)
}

console.log(bold(`\nScript: ${path.relative(ROOT, scriptPath)}`))
console.log(
  `Words ${totalWords} | Sentences ${n} | Est. ${totalSec.toFixed(1)} s @ ${opts.wps} w/s | Avg ${avg.toFixed(1)} w/sentence | Hook ${hook.words} w (≈${hookSec.toFixed(1)} s)`,
)
console.log(dim('Timing is an estimate. Real timing = WordBoundary events after generate_audio.py.\n'))

console.log(bold('Sentence map'))
sentences.forEach((s, i) => {
  const flags = findings.filter((f) => f.sentence === i && f.level !== 'INFO')
  const mark = flags.some((f) => f.level === 'ERROR') ? red('✖') : flags.length ? yellow('!') : green('✔')
  const src = s.src.length ? s.src.join(',') : s.isQuestion || isCta(s) ? 'n/a' : '—'
  const t = `${s.start.toFixed(0)}s`.padStart(4)
  const preview = s.text.length > 70 ? s.text.slice(0, 67) + '…' : s.text
  console.log(` ${mark} ${String(i + 1).padStart(2)} ${t}  ${String(s.words).padStart(2)}w  ${src.padEnd(8)} ${preview}`)
})

const show = (level, colorFn) => {
  const list = findings.filter((f) => f.level === level)
  if (!list.length) return
  console.log('\n' + colorFn(bold(level + (level === 'INFO' ? '' : 'S'))))
  for (const f of list) {
    const where = f.sentence != null ? `[#${f.sentence + 1}] ` : ''
    console.log(`  ${colorFn('•')} ${where}${f.code}: ${f.msg}`)
  }
}
show('ERROR', red)
show('WARN', yellow)
show('INFO', dim)

console.log(
  '\n' +
    (errors.length
      ? red(bold(`FAIL: ${errors.length} error(s), ${warns.length} warning(s)`))
      : green(bold(`PASS: 0 errors, ${warns.length} warning(s)`))),
)
process.exit(errors.length ? 1 : 0)
