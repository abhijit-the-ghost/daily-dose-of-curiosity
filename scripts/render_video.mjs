/**
 * render_video.mjs — turn the React stage into a final MP4 for Shorts/Reels/TikTok.
 *
 * Pipeline:
 *   1. vite build + vite preview   (production bundle, no HMR)
 *   2. puppeteer at exactly 1080x1920 — for every frame: window.__seek(t),
 *      wait for the committed-render signal, screenshot
 *   3. ffmpeg (ffmpeg-static) — JPEG frames + the act MP3s (delayed to their
 *      manifest positions, mixed) → H.264/AAC MP4 with faststart
 *
 * Usage:
 *   bun scripts/render_video.mjs                 # full render
 *   bun scripts/render_video.mjs --max-frames 90 # smoke test (first frames only)
 *   bun scripts/render_video.mjs --keep-frames   # don't delete frames/ afterwards
 *   bun scripts/render_video.mjs --preset slow --crf 16
 */
import { spawn } from 'node:child_process'
import net from 'node:net'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import ffmpegPath from 'ffmpeg-static'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FRAMES_DIR = path.join(ROOT, 'frames')
const OUT_DIR = path.join(ROOT, 'output')

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}
const EPISODE = opt('episode', 'milkyway')
const defaultManifest =
  {
    milkyway: 'public/audio/milkyway/metadata.json',
    'url-explainer': 'public/audio/manifest.json',
    'space-sound': 'public/audio/space-sound/metadata.json',
    'minecraft-edge': 'public/audio/minecraft-edge/metadata.json',
  }[EPISODE] ?? `public/audio/${EPISODE}/metadata.json`
const MANIFEST_PATH = path.join(
  ROOT,
  opt(
    'manifest',
    defaultManifest,
  ),
)
const AUDIO_DIR = path.join(ROOT, 'public', 'audio')
const EPISODE_AUDIO_DIR = fs.existsSync(path.join(AUDIO_DIR, EPISODE))
  ? path.join(AUDIO_DIR, EPISODE)
  : AUDIO_DIR

const getFreePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.once('error', reject)
    srv.listen(0, () => {
      const port = srv.address().port
      srv.close(() => resolve(port))
    })
  })
const PREVIEW_PORT = await getFreePort()

/* ---------------- args ---------------- */
const MAX_FRAMES = Number(opt('max-frames', '0')) || Infinity
const KEEP_FRAMES = flag('keep-frames')
const PRESET = opt('preset', 'medium')
const CRF = opt('crf', '18')
const OUT_NAME = opt('out', `${EPISODE}-1080x1920.mp4`)
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`
const RECORD_URL = `${PREVIEW_URL}/episode?record=1${EPISODE !== 'milkyway' ? `&episode=${EPISODE}` : ''}`

const log = (...args) => console.log('[render]', ...args)

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'] })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))))
  })

const main = async () => {
  /* ---------------- 0. manifest ---------------- */
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`manifest not found at ${MANIFEST_PATH}\n   expected ${'public/audio/' + EPISODE + '/metadata.json'} (or pass --manifest <path>)`)
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
  const { width, height, fps, totalDuration } = manifest
  const totalFrames = Math.round(totalDuration * fps)
  const frameCount = Math.min(totalFrames, MAX_FRAMES)
  log(`"${manifest.title}" — ${totalDuration.toFixed(2)}s, ${width}x${height} @${fps}fps`)
  log(`${frameCount} frames to capture${MAX_FRAMES !== Infinity ? ' (smoke test)' : ''}`)

  /* ---------------- 1. build + preview ---------------- */
  log('building production bundle…')
  await run(process.execPath, [path.join(ROOT, 'node_modules/vite/bin/vite.js'), 'build'])

  log(`starting preview server on :${PREVIEW_PORT}…`)
  const vite = spawn(
    process.execPath,
    [path.join(ROOT, 'node_modules/vite/bin/vite.js'), 'preview', '--port', String(PREVIEW_PORT), '--strictPort', '--host', '127.0.0.1'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
  )
  vite.stderr.on('data', (d) => process.stderr.write(d))
  vite.stdout.on('data', (d) => process.stdout.write(d))

  const waitForServer = async () => {
    const deadline = Date.now() + 180_000
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${PREVIEW_URL}/`)
        if (res.ok) return
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 400))
    }
    throw new Error(`vite preview server did not start within 180s (check port ${PREVIEW_PORT})`)
  }

  try {
    await waitForServer()

    /* ---------------- 2. frame capture ---------------- */
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true })
    fs.mkdirSync(FRAMES_DIR, { recursive: true })

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // deterministic raster output — SwiftShader software rendering
        '--disable-gpu',
        `--window-size=${width},${height}`,
      ],
    })
    const page = await browser.newPage()
    await page.setViewport({ width, height, deviceScaleFactor: 1 })
    await page.goto(RECORD_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await page.waitForFunction('window.__ready === true', { timeout: 30_000 })

    const t0 = Date.now()
    for (let i = 0; i < frameCount; i++) {
      const t = i / fps
      await page.evaluate((tt) => window.__seek?.(tt), t)
      await page.waitForFunction((tt) => window.__committedFrame === tt, {}, t)
      const file = path.join(FRAMES_DIR, `frame_${String(i + 1).padStart(6, '0')}.jpg`)
      await page.screenshot({ path: file, type: 'jpeg', quality: 92 })
      if ((i + 1) % 60 === 0 || i + 1 === frameCount) {
        const pct = (((i + 1) / frameCount) * 100).toFixed(1)
        const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
        log(`frames ${i + 1}/${frameCount} (${pct}%)  ${elapsed}s elapsed`)
      }
    }
    await browser.close()

    /* ---------------- 3. encode ---------------- */
    fs.mkdirSync(OUT_DIR, { recursive: true })
    const outPath = path.join(OUT_DIR, OUT_NAME)
    const framePattern = path.join(FRAMES_DIR, 'frame_%06d.jpg')

    // mix the act MP3s at their manifest positions (preroll included), pad with
    // silence to the full timeline so -shortest doesn't trim the end-card tail
    const delays = manifest.acts.map((a) => Math.round(a.start * 1000))
    const filter =
      manifest.acts.map((_, i) => `[${i + 1}:a]adelay=${delays[i]}:all=1[a${i}]`).join(';') +
      `;${manifest.acts.map((_, i) => `[a${i}]`).join('')}amix=inputs=${manifest.acts.length}:normalize=0,apad=whole_dur=${totalDuration}[aout]`

    const ffmpegArgs = [
      '-y',
      '-thread_queue_size', '512',
      '-framerate', String(fps),
      '-i', framePattern,
      ...manifest.acts.flatMap((a) => ['-i', path.join(EPISODE_AUDIO_DIR, a.file)]),
      '-filter_complex', filter,
      '-map', '0:v:0',
      '-map', '[aout]',
      '-c:v', 'libx264',
      '-preset', PRESET,
      '-crf', CRF,
      '-pix_fmt', 'yuv420p',
      '-profile:v', 'high',
      '-level', '4.0',
      '-r', String(fps),
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '48000',
      '-ac', '2',
      '-movflags', '+faststart',
      '-shortest',
      outPath,
    ]

    log('encoding MP4 (libx264)…')
    await run(ffmpegPath, ffmpegArgs)

    const sizeMB = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1)
    log(`done → ${outPath}  (${sizeMB} MB)`)

    if (!KEEP_FRAMES) {
      fs.rmSync(FRAMES_DIR, { recursive: true, force: true })
      log('frames/ cleaned up (use --keep-frames to keep them)')
    } else {
      log(`frames kept in ${FRAMES_DIR}`)
    }
  } finally {
    vite.kill()
  }
}

main().catch((err) => {
  console.error('[render] FAILED:', err instanceof Error ? err.message : err)
  console.error('frames/ kept for inspection (if any)')
  process.exit(1)
})
