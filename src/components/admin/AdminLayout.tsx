import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Sparkles, LayoutDashboard, Film, FolderOpen } from 'lucide-react'
import { useAdminManifest } from '../../admin/useAdminManifest'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/videos', label: 'Videos', icon: Film, end: false },
  { to: '/assets', label: 'Assets', icon: FolderOpen, end: false },
]

const fmtTime = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminLayout() {
  const loc = useLocation()
  const { data: manifest } = useAdminManifest()

  return (
    <div className="flex min-h-screen bg-[#030712] text-white">
      {/* sidebar */}
      <aside className="sticky top-0 h-screen w-[248px] shrink-0 border-r border-white/8 bg-[#060a18] flex flex-col px-5 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_22px_rgba(245,158,11,0.35)]">
            <Sparkles size={20} strokeWidth={2.2} className="text-amber-950" />
          </div>
          <div>
            <div className="font-brand text-[19px] leading-none tracking-[0.14em] text-[#f5f0ff]">DAILY DOSE</div>
            <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.4em] text-amber-400/85">studio</div>
          </div>
        </div>

        <nav className="mt-10 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-300'
                    : 'text-white/55 hover:bg-white/[0.04] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? 'text-amber-400' : 'text-white/45 group-hover:text-amber-300'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">pipeline</div>
          <div className="mt-2 text-[12.5px] font-semibold text-white/85">{manifest?.totals.videos ?? '—'} episodes packaged</div>
          <div className="mt-1 text-[11px] leading-snug text-white/45">
            {manifest?.totals.totalResultMb ?? 0} MB of ready-to-post MP4s across 3 platforms
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-white/35">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            manifest {manifest ? `synced · ${fmtTime(manifest.generatedAt)}` : 'loading…'}
          </div>
        </div>
      </aside>

      {/* content */}
      <main className="flex-1 px-8 py-7">
        <div className="mb-6 flex items-center justify-between border-b border-white/6 pb-4">
          <div className="text-[10.5px] font-mono uppercase tracking-[0.35em] text-white/35">
            {loc.pathname.replace(/^\//, '').replace(/\//g, ' · ') || 'dashboard'}
          </div>
          <div className="flex items-center gap-3 text-[10.5px] font-mono uppercase tracking-[0.2em] text-white/40">
            <span>DAILY DOSE OF CURIOSITY</span>
            <span className="hidden sm:inline text-white/20">/</span>
            <span className="hidden sm:inline text-amber-400/80">pipeline 2026-11</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
