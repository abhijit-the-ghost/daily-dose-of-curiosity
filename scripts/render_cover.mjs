/**
 * render_cover.mjs — one 1080×1920 master, then platform crops (INSTRUCTIONS.md §10).
 *
 *   bun scripts/render_cover.mjs --episode uranus-tilted-sideways
 *
 * Produces in results/videos/<slug>/:
 *   cover_tiktok_1080x1920.png    1080 × 1920  9:16  master (TikTok)
 *   cover_reels_1080x1920.png     1080 × 1920  9:16  same artboard (Instagram)
 *   cover_fb_1080x1920.png        1080 × 1920  9:16  same artboard (Facebook)
 *   cover_shorts_2160x3840.png    2160 × 3840  9:16  2× master (Shorts custom thumb)
 *   cover_grid_1080x1440.png      1080 × 1440  3:4   centre crop y=240 (profile grids)
 *   cover_feed_1080x1350.png      1080 × 1350  4:5   centre crop y=285 (feeds)
 *   thumbnail_youtube_1280x720.png 1280 × 720 16:9  long-form only
 *
 * Legacy names (cover_tiktok.png / cover_instagram.png / cover_youtube.png) are
 * copied too, so the Studio manifest keeps working during the migration. A
 * `cover_facebook.png` alias is also written so every requested platform has
 * an obvious, discoverable filename.
 *
 * NOTE: run only after node_modules/.vite* has been cleared (or vite is warm).
 */
import net from 'node:net'
import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const argv = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  if (i < 0) return fallback
  const v = argv[i + 1]
  return v && !v.startsWith('--') ? v : fallback
}
const EPISODE = opt('episode', 'space-sound')
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'results', 'videos', EPISODE)
fs.mkdirSync(OUT_DIR, { recursive: true })

const getFreePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.once('error', reject)
    srv.listen(0, () => {
      const port = srv.address().port
      srv.close(() => resolve(port))
    })
  })

const PORT = await getFreePort()
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] })
server.stdout.on('data', (d) => process.stderr.write(`[vite-out] ${d}`))
server.stderr.on('data', (d) => process.stderr.write(`[vite-err] ${d}`))

const waitForServer = async () => {
  const deadline = Date.now() + 400_000
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/cover?cover=${EPISODE}&ratio=9x16`)
      if (res.ok) return
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('vite did not start within 400s')
}

const pngSize = (file) => {
  const fd = fs.openSync(file, 'r')
  const head = Buffer.alloc(24)
  fs.readSync(fd, head, 0, 24, 0)
  fs.closeSync(fd)
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) }
}

try {
  await waitForServer()
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  })

  try {
    const page = await browser.newPage()
    const load = async (ratio, scale = 1, w = 1080, h = 1920) => {
      await page.setViewport({ width: w, height: h, deviceScaleFactor: scale })
      await page.goto(`http://127.0.0.1:${PORT}/cover?cover=${EPISODE}&ratio=${ratio}`, {
        waitUntil: 'networkidle0',
        timeout: 30_000,
      })
      await new Promise((r) => setTimeout(r, 600))
    }
    const shot = async (name, expectedW, expectedH, clip) => {
      const outPath = path.join(OUT_DIR, name)
      await page.screenshot({ path: outPath, type: 'png', ...(clip ? { clip } : {}) })
      const got = pngSize(outPath)
      if (got.width !== expectedW || got.height !== expectedH) {
        throw new Error(`[cover] ${name}: expected ${expectedW}×${expectedH}, got ${got.width}×${got.height}`)
      }
      console.log(`[cover] ${outPath}  ${got.width}×${got.height}`)
    }

    /* ---- the master frame and its platform copies ---- */
    await load('9x16')
    await shot('cover_tiktok_1080x1920.png', 1080, 1920)
    fs.copyFileSync(path.join(OUT_DIR, 'cover_tiktok_1080x1920.png'), path.join(OUT_DIR, 'cover_reels_1080x1920.png'))
    fs.copyFileSync(path.join(OUT_DIR, 'cover_tiktok_1080x1920.png'), path.join(OUT_DIR, 'cover_fb_1080x1920.png'))
    console.log('[cover] cover_reels_1080x1920.png  (copy of master)')
    console.log('[cover] cover_fb_1080x1920.png      (copy of master)')

    /* ---- real crops from the master; title band y 240–1680 survives both ---- */
    await shot('cover_grid_1080x1440.png', 1080, 1440, { x: 0, y: 240, width: 1080, height: 1440 })
    await shot('cover_feed_1080x1350.png', 1080, 1350, { x: 0, y: 285, width: 1080, height: 1350 })

    /* ---- 2× master for the YPP-gated Shorts custom thumbnail ---- */
    await load('9x16', 2)
    await shot('cover_shorts_2160x3840.png', 2160, 3840)

    /* ---- long-form thumbnail ---- */
    await load('16x9', 1, 1280, 720)
    await shot('thumbnail_youtube_1280x720.png', 1280, 720)

    /* ---- legacy aliases for the existing Studio manifest ---- */
    fs.copyFileSync(path.join(OUT_DIR, 'cover_tiktok_1080x1920.png'), path.join(OUT_DIR, 'cover_tiktok.png'))
    fs.copyFileSync(path.join(OUT_DIR, 'cover_tiktok_1080x1920.png'), path.join(OUT_DIR, 'cover_instagram.png'))
    fs.copyFileSync(path.join(OUT_DIR, 'cover_fb_1080x1920.png'), path.join(OUT_DIR, 'cover_facebook.png'))
    fs.copyFileSync(path.join(OUT_DIR, 'thumbnail_youtube_1280x720.png'), path.join(OUT_DIR, 'cover_youtube.png'))
    console.log('[cover] aliases written (cover_tiktok / cover_instagram / cover_facebook / cover_youtube)')
  } finally {
    await browser.close()
  }
} finally {
  server.kill()
}
