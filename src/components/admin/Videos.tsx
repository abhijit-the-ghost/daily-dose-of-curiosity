import { useNavigate } from 'react-router-dom'
import { Clock, Search, Filter, X, SquarePlay, Camera, Music2, Film, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAdminManifest } from '../../admin/useAdminManifest'
import type { ManifestVideo } from '../../admin/types'

const fmt = (s: number | null) => {
  if (s == null) return '—'
  const m = Math.floor(s / 60), sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}
const fmtP = (iso: string) => {
  const d = new Date(iso)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function Row({ v }: { v: ManifestVideo }) {
  const navigate = useNavigate()
  const thumb = v.thumbnails.youtube ?? v.thumbnails.instagram ?? v.covers.youtube ?? v.covers.instagram

  return (
    <button
      onClick={() => navigate(`/videos/${v.slug}`)}
      className="group grid grid-cols-[120px_1fr_auto] items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-left transition-colors hover:border-amber-400/35 hover:bg-white/[0.05]"
    >
      <div className="h-[84px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-[#05060e]">
        {thumb ? <img src={thumb} alt={v.title} className="h-full w-full object-cover" loading="lazy" /> : <Film size={22} className="m-6 text-white/15" />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.22em] text-amber-300">{v.series ?? 'uncategorized'}</span>
          <span className="text-[10px] font-mono text-white/30">/{v.slug}</span>
        </div>
        <div className="mt-1.5 line-clamp-2 text-[14px] font-semibold leading-snug text-white">{v.title}</div>
        <div className="mt-1.5 flex items-center gap-3 text-[10.5px] text-white/40">
          <span className="flex items-center gap-1"><Clock size={11} />{fmt(v.durationSec)}</span>
          <span>{v.wordCount ?? '—'} words</span>
          <span>{v.captionStyle ?? 'no captions'}</span>
          <span>{fmtP(v.latestModified)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 pr-2 text-white/35">
        <div className="flex items-center gap-1"><SquarePlay size={13} className="text-[#ff0033]" /><Camera size={13} className="text-[#e1306c]" /><Music2 size={13} className="text-white/80" /></div>
        <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:text-amber-400" />
      </div>
    </button>
  )
}

type SortKey = 'latest' | 'duration' | 'words'

export default function Videos() {
  const { data, isLoading } = useAdminManifest()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('latest')

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    let out = data.videos.filter((v) =>
      !q || `${v.slug} ${v.title} ${v.series ?? ''} ${(v.tags ?? []).join(' ')}`.toLowerCase().includes(q),
    )
    if (sort === 'latest') out = [...out].sort((a, b) => b.latestModified.localeCompare(a.latestModified))
    if (sort === 'duration') out = [...out].sort((a, b) => (b.durationSec ?? 0) - (a.durationSec ?? 0))
    if (sort === 'words') out = [...out].sort((a, b) => (b.wordCount ?? 0) - (a.wordCount ?? 0))
    return out
  }, [data, query, sort])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/40">archive</div>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-white">All videos</h1>
          <p className="mt-1 max-w-md text-[12px] leading-relaxed text-white/45">Every MP4 we have ever packaged. Click any row to see the full asset set, meta and about files.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 focus-within:border-amber-400/40">
            <Search size={15} className="text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, slug, tag…"
              className="w-48 bg-transparent text-[12.5px] text-white placeholder-white/30 outline-none"
            />
            {query && <button onClick={() => setQuery('')}><X size={14} className="text-white/40 hover:text-white" /></button>}
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
            <Filter size={13} className="ml-2 text-white/35" />
            {(['latest', 'duration', 'words'] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                className={`rounded-lg px-3 py-1.5 text-[10.5px] font-mono uppercase tracking-[0.2em] transition-colors ${
                  sort === k ? 'bg-amber-400 text-amber-950' : 'text-white/45 hover:text-white'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.03]" />
      ) : (
        <div className="grid gap-3">
          {filtered.map((v) => <Row key={v.slug} v={v} />)}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-14 text-center text-[12px] text-white/35">No video matches “{query}”.</div>
          )}
        </div>
      )}
    </div>
  )
}
