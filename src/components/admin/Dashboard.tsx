import { useNavigate } from 'react-router-dom'
import { Clock, FileText, MousePointer2, SquarePlay, Camera, Music2, FolderOpen, Film, type LucideIcon } from 'lucide-react'
import { useAdminManifest } from '../../admin/useAdminManifest'
import type { ManifestVideo } from '../../admin/types'

const fmtDuration = (s: number | null) => {
  if (s == null) return '—'
  const sec = Math.floor(s)
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
}
const fmtPl = (iso: string) => {
  const d = new Date(iso)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function StatCard({ label, value, hint, Icon, tone }: { label: string; value: string | number; hint?: string; Icon: LucideIcon; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/45">{label}</div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>
      <div className="mt-3 text-[28px] font-bold leading-none tracking-tight text-white">{value}</div>
      {hint && <div className="mt-1.5 text-[11px] text-white/40">{hint}</div>}
    </div>
  )
}

function PlatformPill({ label, Icon, color }: { label: string; Icon: LucideIcon; color: string }) {
  return (
    <span
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
      style={{ color }}
    >
      <Icon size={14} strokeWidth={1.8} />
    </span>
  )
}

function VideoCard({ video }: { video: ManifestVideo }) {
  const navigate = useNavigate()
  const thumb = video.thumbnails.youtube ?? video.thumbnails.instagram ?? video.covers.youtube ?? video.covers.instagram

  return (
    <button
      onClick={() => navigate(`/videos/${video.slug}`)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] text-left transition-all hover:-translate-y-0.5 hover:border-amber-400/35 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#05060e]">
        {thumb ? (
          <img src={thumb} alt={video.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Film size={34} className="text-white/15" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-[9.5px] font-mono uppercase tracking-[0.25em] text-amber-300">
          <Clock size={11} strokeWidth={2.5} />
          {fmtDuration(video.durationSec)}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-[15px] font-bold leading-tight text-white line-clamp-2">{video.title}</div>
          <div className="mt-1.5 flex items-center gap-2">
            <PlatformPill label="YouTube" Icon={SquarePlay} color="#ff0033" />
            <PlatformPill label="Instagram" Icon={Camera} color="#e1306c" />
            <PlatformPill label="TikTok" Icon={Music2} color="#ffffff" />
            <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">{video.series ?? '—'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-mono text-white/40">/{video.slug}</div>
          <div className="mt-0.5 text-[10.5px] text-white/30">{fmtPl(video.latestModified)} · {video.wordCount ?? 0}w</div>
        </div>
        <MousePointer2 size={15} className="shrink-0 text-white/25 transition-colors group-hover:text-amber-400" />
      </div>
    </button>
  )
}

export default function Dashboard() {
  const { data, isLoading, isError, error } = useAdminManifest()

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em]">manifest failed</div>
        <div className="mt-2 text-sm">{(error as Error)?.message ?? 'unknown error'}</div>
        <div className="mt-3 text-[11px] text-red-300/60">Run <code className="rounded bg-black/40 px-2 py-0.5">bun scripts/admin_manifest.mjs</code> and ensure <code>/admin-manifest.json</code> is being served.</div>
      </div>
    )
  }

  const latest = [...data.videos].sort((a, b) => b.latestModified.localeCompare(a.latestModified))
  const next = latest[0]

  return (
    <div className="space-y-7">
      {/* hero strip */}
      <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-amber-400/[0.10] via-[#0b1124] to-[#030712] p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative">
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-amber-400/80">owner console</div>
          <h1 className="mt-2 max-w-2xl text-[32px] font-extrabold leading-[1.08] tracking-tight text-white">
            Ship the next episode,<br /> then read the room.
          </h1>
          <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/55">
            Every render, thumbnail set and source file that ships with the show — in one place.
            Latest first, latest first, latest first.
          </p>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-mono text-white/50">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{data.totals.videos} episodes packaged</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{data.totals.totalResultMb} MB ready to post</span>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="total episodes" value={data.totals.videos} hint="rendered & packaged" Icon={Film} tone="bg-amber-400/15 text-amber-300" />
        <StatCard label="avg duration" value={`${(data.videos.filter(v => v.durationSec).reduce((a, v) => a + (v.durationSec ?? 0), 0) / Math.max(1, data.videos.filter(v => v.durationSec).length)).toFixed(1)}s`} hint="across all renders" Icon={Clock} tone="bg-cyan-400/15 text-cyan-300" />
        <StatCard label="brand assets" value={data.totals.assets} hint="logos · fonts · code" Icon={FolderOpen} tone="bg-violet-400/15 text-violet-300" />
        <StatCard label="caption style" value={data.videos[0]?.captionStyle ?? '—'} hint="latest episode" Icon={FileText} tone="bg-emerald-400/15 text-emerald-300" />
      </div>

      {/* latest videos */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/40">feed</div>
            <h2 className="mt-1 text-[17px] font-semibold text-white">Latest episodes, newest first</h2>
          </div>
          <div className="text-[11px] font-mono text-white/35">{data.videos.length} videos · sorted by mtime</div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((v) => <VideoCard key={v.slug} video={v} />)}
        </div>
      </section>

      {/* next up strip */}
      {next && (
        <section className="flex items-center justify-between rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-400/[0.08] to-transparent px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-amber-950">
              <Film size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400/80">up next to post</div>
              <div className="mt-0.5 text-[14px] font-semibold text-white">{next.title}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35">status</div>
            <div className="mt-0.5 flex items-center gap-2 text-[12px] font-semibold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />packaged</div>
          </div>
        </section>
      )}
    </div>
  )
}
