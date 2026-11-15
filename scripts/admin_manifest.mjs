/**
 * admin_manifest.mjs — scan results/videos + shared-assets + output/ and write
 * public/admin-manifest.json for the admin dashboard.
 *
 *   bun scripts/admin_manifest.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RESULTS = path.join(ROOT, 'results', 'videos')
const ASSETS = path.join(ROOT, 'shared-assets')
const OUT = path.join(ROOT, 'public', 'admin-manifest.json')

const kb = (n) => Math.round(n / 1024)
const mb = (n) => (n / (1024 * 1024)).toFixed(2)
const metaOf = (dir) => {
  const p = path.join(dir, 'meta.json')
  if (!fs.existsSync(p)) return null
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null }
}
const firstLine = (p) => {
  try {
    const s = fs.readFileSync(p, 'utf8')
    const m = s.match(/^"([^"]+)"/m)
    return m ? m[1] : s.split('\n').find((l) => l.trim())?.trim() ?? null
  } catch { return null }
}
const headline = (slug, meta) => {
  if (meta?.hook) return meta.hook
  const about = path.join(RESULTS, slug, 'about.txt')
  const line = firstLine(about)
  if (line && line.startsWith('"') ) return line.replace(/"/g, '')
  return slug
}

const slugs = [...new Set(
  fs.readdirSync(RESULTS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name),
)]

const videos = slugs.map((slug) => {
  const dir = path.join(RESULTS, slug)
  const meta = metaOf(dir)
  const files = fs.readdirSync(dir)
  const stat = (f) => { try { const st = fs.statSync(path.join(dir, f)); return st.size } catch { return 0 } }
  const latest = Math.max(...files.map((f) => fs.statSync(path.join(dir, f)).mtimeMs), 0)
  return {
    slug,
    title: headline(slug, meta),
    series: meta?.series ?? null,
    hookStyle: meta?.hookStyle ?? null,
    captionStyle: meta?.captionStyle ?? null,
    endCard: meta?.endCard ?? null,
    durationSec: meta?.durationSec ?? null,
    wordCount: meta?.wordCount ?? null,
    voice: meta?.voice ?? null,
    tags: meta?.tags ?? [],
    posted: meta?.posted ?? null,
    latestModified: new Date(latest).toISOString(),
    sizes: {
      videoMb: Number(mb(stat('video.mp4'))),
      totalMb: Number((files.reduce((acc, f) => acc + stat(f), 0) / (1024 * 1024)).toFixed(2)),
    },
    files: files.map((f) => f),
    thumbnails: {
      youtube: files.includes('thumbnail_youtube.png') ? `/videos/${slug}/thumbnail_youtube.png` : null,
      instagram: files.includes('thumbnail_instagram.png') ? `/videos/${slug}/thumbnail_instagram.png` : null,
    },
    covers: {
      youtube: files.includes('cover_youtube.png') ? `/videos/${slug}/cover_youtube.png` : null,
      tiktok: files.includes('cover_tiktok.png') ? `/videos/${slug}/cover_tiktok.png` : null,
      instagram: files.includes('cover_instagram.png') ? `/videos/${slug}/cover_instagram.png` : null,
    },
  }
}).sort((a, b) => b.latestModified.localeCompare(a.latestModified))

/** copy media into public so vite serves them at /videos/<slug>/... */
const publicVideos = path.join(ROOT, 'public', 'videos')
fs.rmSync(publicVideos, { recursive: true, force: true })
for (const slug of slugs) {
  const src = path.join(RESULTS, slug)
  const dst = path.join(publicVideos, slug)
  fs.mkdirSync(dst, { recursive: true })
  for (const f of fs.readdirSync(src)) fs.copyFileSync(path.join(src, f), path.join(dst, f))
}

/** copy shared-assets into public/shared-media so the admin gallery can serve
 *  them without shadowing the source tree (Vite serves public/ raw). */
const publicAssets = path.join(ROOT, 'public', 'shared-media')
fs.rmSync(publicAssets, { recursive: true, force: true })
const copyRecursive = (src, dst) => {
  fs.mkdirSync(dst, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dst, entry.name)
    if (entry.isDirectory()) copyRecursive(s, d)
    else fs.copyFileSync(s, d)
  }
}
copyRecursive(ASSETS, publicAssets)

/** shared-assets listing, recursive, with file type + size */
const walk = (dir, base = '') => {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const rel = base ? `${base}/${entry.name}` : entry.name
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) { out.push(...walk(full, rel)); continue }
    const st = fs.statSync(full)
    out.push({
      path: rel,
      name: entry.name,
      ext: path.extname(entry.name).slice(1).toLowerCase(),
      sizeKb: kb(st.size),
      modified: st.mtime.toISOString(),
      url: `/shared-media/${rel.split(path.sep).join('/')}`,
    })
  }
  return out
}
const assets = walk(ASSETS).sort((a, b) => a.path.localeCompare(b.path))

fs.writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  totals: {
    videos: videos.length,
    assets: assets.length,
    totalResultMb: Number(videos.reduce((a, v) => a + v.sizes.totalMb, 0).toFixed(1)),
  },
  videos,
  assets,
}, null, 2))
console.log(`[manifest] ${videos.length} videos, ${assets.length} assets → ${path.relative(ROOT, OUT)}`)
