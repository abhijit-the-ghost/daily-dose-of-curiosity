/**
 * render_cover.mjs — render still artwork for YouTube (16:9) and Instagram (9:16).
 *
 *   bun scripts/render_cover.mjs --episode space-sound
 *
 * Produces:
 *   results/videos/<slug>/cover_youtube.png      1280 ×  720
 *   results/videos/<slug>/cover_instagram.png   1080 × 1920
 *
 * NOTE : Run only after `node_modules/.vite*` has been cleared (or vite is
 * already warm). The optimizer startup on this machine is non-deterministic
 * otherwise.
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
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], { stdio: ['ignore', 'pipe', 'pipe'] })
server.stdout.on('data', (d) => process.stderr.write(`[vite-out] ${d}`))
server.stderr.on('data', (d) => process.stderr.write(`[vite-err] ${d}`))
server.on('error', (e) => console.error('[cover] spawn error:', e))

const waitForServer = async () => {
  const deadline = Date.now() + 400_000
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/cover?cover=${EPISODE}&ratio=16x9`)
      if (res.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('vite did not start within 400s')
}
await waitForServer()

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()

const targets = [
  { name: 'cover_youtube.png', ratio: '16x9', width: 1280, height: 720 },
  { name: 'cover_tiktok.png', ratio: '4x3', width: 1440, height: 1080 },
  { name: 'cover_instagram.png', ratio: '9x16', width: 1080, height: 1920 },
]

for (const { name, ratio, width, height } of targets) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await page.goto(`http://127.0.0.1:${PORT}/cover?cover=${EPISODE}&ratio=${ratio}`, {
    waitUntil: 'networkidle0',
    timeout: 30_000,
  })
  await new Promise((r) => setTimeout(r, 1200))
  const outPath = path.join(OUT_DIR, name)
  await page.screenshot({ path: outPath, type: 'png' })
  console.log(`[cover] ${outPath}`)
}

await browser.close()
server.kill()
process.exit(0)
