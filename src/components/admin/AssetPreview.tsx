import { createElement, type ComponentType, useEffect, useState } from 'react'
import { X, ExternalLink, Loader2, AlertTriangle } from 'lucide-react'
import { marked } from 'marked'
import type { ManifestAsset } from '../../admin/types'
import { CuriosityStickman, type SkeletonPose } from '@shared-assets/brand/CuriosityStickman'

const FONT_SPECIMEN = 'AaBbCcDdEeFfGg 0123456789 — “The quick brown fox jumps over the lazy dog” — Daily Dose of Curiosity'
const isImage = (ext: string) => ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'avif'].includes(ext)
const isFont = (ext: string) => ['ttf', 'otf', 'woff2', 'woff'].includes(ext)

/* Live renderers for JSX assets — what the shipped component actually looks like */
const StickmanLivePreview = () => {
  const poses: { label: string; pose: SkeletonPose }[] = [
    { label: 'DEFAULT', pose: {} },
    { label: 'TALKING', pose: { mouthOpen: 0.8, leftShoulder: 40, rightShoulder: -40 } },
    { label: 'PRESENTING', pose: { headTilt: 10, leftShoulder: -55, rightShoulder: -55, leftElbow: -20, rightElbow: 20 } },
    { label: 'WALKING', pose: { torsoLean: 4, leftHip: 25, rightHip: -25, leftKnee: 30, rightKnee: 10, leftShoulder: -25, rightShoulder: 25 } },
  ]
  return (
    <div className="flex flex-col items-center gap-6 bg-[#05060e] p-8">
      <div className="flex items-center gap-2 self-start rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> runtime render — not a static image
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {poses.map(({ label, pose }) => (
          <figure key={label} className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="flex h-[280px] items-end justify-center">
              <CuriosityStickman pose={pose} className="h-full w-auto" />
            </div>
            <figcaption className="font-mono text-[9px] uppercase tracking-[0.35em] text-amber-400/70">{label}</figcaption>
          </figure>
        ))}
      </div>
      <div className="text-[11px] text-white/35">Default SVG viewBox 0 0 400 560 · stroke #e4e4e7 · face glow logo head</div>
    </div>
  )
}
const JSX_PREVIEWS: Record<string, ComponentType> = {
  'brand/CuriosityStickman.tsx': StickmanLivePreview,
}

export default function AssetPreview({ asset, onClose }: { asset: ManifestAsset; onClose: () => void }) {
  const [fontName, setFontName] = useState<string | null>(null)
  const [fontError, setFontError] = useState(false)
  const [text, setText] = useState<string | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [textError, setTextError] = useState(false)

  /* load the font into the document so the specimen can use it */
  useEffect(() => {
    if (!isFont(asset.ext)) return
    const name = `asset-font-${asset.name.replace(/[^a-z0-9]/gi, '')}`
    const font = new FontFace(name, `url("${asset.url}")`)
    let cancelled = false
    font.load()
      .then((loaded) => { if (!cancelled) { document.fonts.add(loaded); setFontName(name) } })
      .catch(() => { if (!cancelled) setFontError(true) })
    return () => { cancelled = true }
  }, [asset])

  /* fetch text/markdown/code content */
  useEffect(() => {
    if (isImage(asset.ext) || isFont(asset.ext) || JSX_PREVIEWS[asset.path]) return
    const controller = new AbortController()
    let cancelled = false
    fetch(asset.url, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text() })
      .then((t) => {
        if (cancelled) return
        setText(t)
        if (asset.ext === 'md') {
          marked.setOptions({ gfm: true, breaks: true })
          setHtml(marked.parse(t) as string)
        } else {
          setHtml(null)
        }
      })
      .catch(() => { if (!cancelled) setTextError(true) })
    return () => { cancelled = true; controller.abort() }
  }, [asset])

  /* close on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isMd = asset.ext === 'md'
  const isCode = ['tsx', 'ts', 'js', 'mjs', 'css', 'html', 'json'].includes(asset.ext)
  const LivePreview = JSX_PREVIEWS[asset.path]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={asset.name}
    >
      <div
        className="relative flex h-full max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#060a18] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <header className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-3">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">shared-assets / {asset.path}</div>
            <div className="mt-0.5 truncate text-[13px] font-semibold text-white/85">{asset.name} · {asset.sizeKb >= 1024 ? `${(asset.sizeKb / 1024).toFixed(1)} MB` : `${asset.sizeKb} KB`}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={asset.url} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/60 transition-colors hover:border-amber-400/40 hover:text-amber-300" title="open raw file">
              <ExternalLink size={15} />
            </a>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/60 transition-colors hover:border-red-400/40 hover:text-red-300" title="close (Esc)">
              <X size={17} />
            </button>
          </div>
        </header>

        {/* body */}
        <div className="min-h-0 flex-1 overflow-auto">
          {/* images */}
          {isImage(asset.ext) && (
            <div className="flex h-full items-center justify-center bg-[#05060e] p-6">
              <img src={asset.url} alt={asset.name} className="max-h-full max-w-full object-contain" />
            </div>
          )}

          {/* fonts */}
          {isFont(asset.ext) && (
            <div className="flex flex-col gap-6 bg-[#05060e] p-8">
              {fontError ? (
                <div className="flex items-center gap-3 rounded-xl border border-red-400/25 bg-red-400/5 p-4 text-[13px] text-red-300">
                  <AlertTriangle size={18} /> Could not load this font file.
                </div>
              ) : !fontName ? (
                <div className="flex items-center gap-3 p-6 text-[13px] text-white/50"><Loader2 size={18} className="animate-spin" /> Loading font…</div>
              ) : (
                <>
                  <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-amber-400/70">glyph specimen</div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6" style={{ fontFamily: fontName }}>
                    <div className="text-[64px] leading-[1.15] text-[#f5f0ff]">{FONT_SPECIMEN}</div>
                    <hr className="my-5 border-white/8" />
                    <div className="text-[13px] font-mono uppercase tracking-[0.3em] text-white/35">weights × sizes</div>
                    {[28, 44, 76, 120].map((size) => (
                      <div key={size} className="mt-3 text-[#f5f0ff]" style={{ fontSize: size }}>
                        Curiosity 0123
                      </div>
                    ))}
                    <hr className="my-5 border-white/8" />
                    <div className="text-[12px] font-mono uppercase tracking-[0.3em] text-white/35">the quick brown fox jumps · {asset.name}</div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* markdown */}
          {isMd && (
            <div className="bg-[#05060e] p-6 md:p-10">
              {textError ? (
                <div className="flex items-center gap-3 rounded-xl border border-red-400/25 bg-red-400/5 p-4 text-[13px] text-red-300">
                  <AlertTriangle size={18} /> Could not read this file.
                </div>
              ) : !html ? (
                <div className="flex items-center gap-3 p-6 text-[13px] text-white/50"><Loader2 size={18} className="animate-spin" /> Loading…</div>
              ) : (
                <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
              )}
            </div>
          )}

          {/* live JSX render — show the component, not the source */}
          {LivePreview && (
            <div className="bg-[#05060e]">
              {createElement(LivePreview)}
            </div>
          )}

          {/* code / json / css — monospace text */}
          {!LivePreview && isCode && (
            <div className="bg-[#05060e] p-6 md:p-8">
              {textError ? (
                <div className="flex items-center gap-3 rounded-xl border border-red-400/25 bg-red-400/5 p-4 text-[13px] text-red-300">
                  <AlertTriangle size={18} /> Could not read this file.
                </div>
              ) : text === null ? (
                <div className="flex items-center gap-3 p-6 text-[13px] text-white/50"><Loader2 size={18} className="animate-spin" /> Loading…</div>
              ) : (
                <pre className="overflow-x-auto rounded-2xl border border-white/8 bg-[#0c1324] p-6 font-mono text-[12px] leading-[1.65] text-[#e2e8f0]">{text}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
