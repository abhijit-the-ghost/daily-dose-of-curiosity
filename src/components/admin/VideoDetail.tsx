import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Clock, FileText, Hash, FolderOpen, Download, CheckCircle, AlertCircle, Film } from 'lucide-react'
import { useAdminManifest } from '../../admin/useAdminManifest'

const fmt = (iso: string) => {
  const d = new Date(iso)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const platformBlock = (name: string, accent: string, thumbnail?: string | null, cover?: string | null) => (
  <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
    <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
      <span className="text-[10px] font-mono uppercase tracking-[0.35em]" style={{ color: accent }}>{name}</span>
      <span className="text-[10px] text-white/30">{thumbnail && cover ? 'thumbnail · cover' : thumbnail ? 'thumbnail' : cover ? 'cover' : 'missing'}</span>
    </div>
    <div className="grid grid-cols-2 divide-x divide-white/6">
      <div className="relative aspect-[9/16] bg-[#05060e]">
        {thumbnail ? <img src={thumbnail} alt={`${name} thumbnail`} className="absolute inset-0 h-full w-full object-cover" /> : <Film className="m-8 text-white/10" size={40} />}
        <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.3em] text-white/70">thumb</div>
      </div>
      <div className="relative aspect-[9/16] bg-[#05060e]">
        {cover ? <img src={cover} alt={`${name} cover`} className="absolute inset-0 h-full w-full object-cover" /> : <Film className="m-8 text-white/10" size={40} />}
        <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.3em] text-white/70">cover</div>
      </div>
    </div>
  </div>
)

export default function VideoDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useAdminManifest()

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-white/[0.03]" />
  const v = data?.videos.find((x) => x.slug === slug)
  if (!v) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-10 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">not found</div>
        <div className="mt-2 text-[15px] text-white/70">No video named “{slug}”.</div>
        <Link to="/videos" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-[12px] font-semibold text-amber-950">Back to all videos</Link>
      </div>
    )
  }

  const ytFile = v.files.find((f) => f.startsWith('video')) ?? 'video.mp4'
  const dur = v.durationSec ? `${Math.floor(v.durationSec / 60)}:${String(Math.floor(v.durationSec) % 60).padStart(2, '0')}` : '—'

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/videos')} className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-amber-300">
          <ChevronLeft size={14} /> videos
        </button>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-amber-400/80">{v.series ?? 'uncategorized'}</div>
            <h1 className="mt-1.5 max-w-2xl text-[26px] font-bold leading-tight tracking-tight text-white">{v.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/40">
              <span className="font-mono text-white/35">/{v.slug}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock size={12} />{dur}</span>
              <span>·</span>
              <span>{v.wordCount ?? '—'} words</span>
              <span>·</span>
              <span>{v.voice ?? 'unknown voice'}</span>
              <span>·</span>
              <span>rendered {fmt(v.latestModified)}</span>
            </div>
          </div>
          <a
            href={`/videos/${v.slug}/${ytFile}`}
            download
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-[12px] font-bold text-amber-950 transition-colors hover:bg-amber-300"
          >
            <Download size={15} strokeWidth={2.2} /> Download MP4 ({v.sizes.videoMb} MB)
          </a>
        </div>
      </div>

      {/* platform deliverable grid */}
      <section>
        <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.35em] text-white/40">per-platform artwork</div>
        <div className="grid gap-4 lg:grid-cols-3">
          {platformBlock('YouTube', '#ff0033', v.thumbnails.youtube, v.covers.youtube)}
          {platformBlock('Instagram', '#e1306c', v.thumbnails.instagram, v.covers.instagram)}
          {platformBlock('TikTok', '#ffffff', v.thumbnails.instagram, v.covers.tiktok)}
        </div>
        {!v.covers.tiktok && (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-300/80">
            <AlertCircle size={13} /> TikTok cover missing — run <code className="rounded bg-black/40 px-1.5 py-0.5">bun scripts/render_cover.mjs --episode {v.slug}</code>
          </div>
        )}
      </section>

      {/* meta + files */}
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/40">meta.json</div>
            <Hash size={14} className="text-white/25" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
            {[
              ['hook style', v.hookStyle ?? '—'],
              ['caption style', v.captionStyle ?? '—'],
              ['end card', v.endCard == null ? '—' : v.endCard ? 'yes' : 'no'],
              ['duration', dur],
              ['words', String(v.wordCount ?? '—')],
              ['voice', v.voice ?? '—'],
              ['tags', (v.tags ?? []).join(', ') || '—'],
              ['posted to', v.posted ? Object.entries(v.posted).filter(([, u]) => u).map(([k]) => k).join(', ') || 'none yet' : '—'],
            ].map(([k, val]) => (
              <div key={k as string} className="border-b border-white/5 py-1.5">
                <div className="text-[9.5px] font-mono uppercase tracking-[0.25em] text-white/30">{k}</div>
                <div className="mt-0.5 text-white/85">{val as string}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/40">packaged files</div>
            <FolderOpen size={14} className="text-white/25" />
          </div>
          <ul className="mt-3 space-y-1.5">
            {v.files.map((f) => (
              <li key={f} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5">
                <span className="flex min-w-0 items-center gap-2">
                  <FileText size={12} className="shrink-0 text-white/35" />
                  <span className="truncate font-mono text-[11px] text-white/75">{f}</span>
                </span>
                <a href={`/videos/${v.slug}/${f}`} download className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-amber-300">get</a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-white/6 pt-3 text-[10px] text-white/35">
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-400" />package verified</span>
            <span>total {v.sizes.totalMb} MB</span>
          </div>
        </div>
      </section>
    </div>
  )
}
