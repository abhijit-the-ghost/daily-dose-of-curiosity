import { useMemo, useState } from 'react'
import { Search, X, Image, FileText, Type, CodeXml, Archive, HardDrive, CalendarClock, CheckCircle, Eye } from 'lucide-react'
import { useAdminManifest } from '../../admin/useAdminManifest'
import type { ManifestAsset } from '../../admin/types'
import AssetPreview from './AssetPreview'

const isImage = (ext: string) => ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)
const iconFor = (ext: string) => {
  if (isImage(ext)) return Image
  if (ext === 'tsx' || ext === 'ts' || ext === 'js' || ext === 'mjs') return CodeXml
  if (ext === 'ttf' || ext === 'otf' || ext === 'woff2') return Type
  if (ext === 'md') return FileText
  if (ext === 'json') return FileText
  return Archive
}
const fmtKb = (kb: number) => kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
const fmtP = (iso: string) => {
  const d = new Date(iso)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export default function Assets() {
  const { data, isLoading } = useAdminManifest()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'images' | 'fonts' | 'code' | 'docs'>('all')
  const [selected, setSelected] = useState<ManifestAsset | null>(null)

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.assets.filter((a) => {
      if (q && !a.path.toLowerCase().includes(q)) return false
      if (filter === 'images') return isImage(a.ext)
      if (filter === 'fonts') return ['ttf', 'otf', 'woff2'].includes(a.ext)
      if (filter === 'code') return ['tsx', 'ts', 'js', 'mjs', 'css', 'html', 'json'].includes(a.ext)
      if (filter === 'docs') return ['md', 'txt'].includes(a.ext)
      return true
    })
  }, [data, query, filter])

  const totalKb = data?.assets.reduce((acc, a) => acc + a.sizeKb, 0) ?? 0

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/40">brand kit</div>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-white">Shared assets</h1>
          <p className="mt-1 max-w-md text-[12px] text-white/45">Everything in <code className="rounded bg-black/40 px-1.5 py-0.5 text-[11px]">shared-assets/</code> — logos, fonts, the stickman, licences. Click any asset for full-size view.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 focus-within:border-amber-400/40">
            <Search size={15} className="text-white/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search asset…" className="w-44 bg-transparent text-[12.5px] text-white placeholder-white/30 outline-none" />
            {query && <button onClick={() => setQuery('')}><X size={14} className="text-white/40 hover:text-white" /></button>}
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
            {([['all', 'All'], ['images', 'Images'], ['fonts', 'Fonts'], ['code', 'Code'], ['docs', 'Docs']] as const).map(([k, label]) => (
              <button key={k} onClick={() => setFilter(k)} className={`rounded-lg px-3 py-1.5 text-[10.5px] font-mono uppercase tracking-[0.2em] transition-colors ${filter === k ? 'bg-amber-400 text-amber-950' : 'text-white/45 hover:text-white'}`}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* summary chips */}
      <div className="flex flex-wrap gap-3 text-[11px] text-white/55">
        <span className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5"><Archive size={12} className="text-violet-300" />{data?.assets.length ?? 0} files</span>
        <span className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5"><HardDrive size={12} className="text-cyan-300" />{fmtKb(totalKb)}</span>
        <span className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5"><CalendarClock size={12} className="text-amber-300" />synced {data ? fmtP(data.generatedAt) : '…'}</span>
        <span className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/5 px-4 py-1.5 text-emerald-300"><CheckCircle size={12} />LICENSES.md logs every asset</span>
      </div>

      {/* grid */}
      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.03]" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => {
            const Icon = iconFor(a.ext)
            return (
              <button
                key={a.path}
                onClick={() => setSelected(a)}
                className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] text-left transition-all hover:-translate-y-0.5 hover:border-amber-400/30"
              >
                <div className="flex h-36 items-center justify-center bg-[#05060e]">
                  {isImage(a.ext)
                    ? <img src={a.url} alt={a.name} className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    : <Icon size={44} strokeWidth={1.3} className="text-white/15 transition-colors group-hover:text-amber-300/60" />}
                </div>
                <div className="border-t border-white/6 px-4 py-3">
                  <div className="truncate font-mono text-[11.5px] text-white/85" title={a.path}>{a.path}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-white/35">
                    <span>{a.ext.toUpperCase() || 'FILE'} · {fmtKb(a.sizeKb)}</span>
                    <span className="flex items-center gap-1 text-white/30 transition-colors group-hover:text-amber-300"><Eye size={12} />preview</span>
                  </div>
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && <div className="col-span-full rounded-2xl border border-white/8 py-14 text-center text-[12px] text-white/35">No asset matches.</div>}
        </div>
      )}

      {selected && <AssetPreview asset={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
