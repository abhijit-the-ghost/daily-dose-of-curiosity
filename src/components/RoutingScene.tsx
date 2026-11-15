import type { SceneProps } from '../App'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)

/* Node waypoints — also used as the motion path, keep in sync. */
const PATH = 'M140 30 L824 175 L156 315 L788 450 L226 625 L622 800'

const NODES = [
  { x: 140, y: 30, label: 'YOU', sub: 'your laptop', icon: '◉' },
  { x: 824, y: 175, label: 'ROUTER', sub: 'home wi-fi', icon: '▤' },
  { x: 156, y: 315, label: 'ISP', sub: 'your provider', icon: '◈' },
  { x: 788, y: 450, label: 'IXP', sub: 'exchange point', icon: '◆' },
  { x: 226, y: 625, label: 'CABLE', sub: 'undersea fiber', icon: '≋' },
  { x: 622, y: 800, label: 'GOOGLE', sub: 'data center', icon: '⬢' },
] as const

const SEGMENTS = NODES.length - 1
const nodeFraction = (i: number) => i / SEGMENTS

export default function RoutingScene({ p }: SceneProps) {
  const u = easeInOut(clamp01(p / 0.82)) // packet journey, holds at the end
  const arrived = p > 0.86
  const statsP = clamp01(p / 0.78)

  const km = Math.round(statsP * 14200)
  const hops = Math.round(statsP * 8)
  const ms = Math.round(statsP * 82)

  return (
    <div className="scene" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 22, letterSpacing: 5, color: 'var(--magenta)' }}>
        STEP 2 — ACROSS THE GLOBE
      </div>
      <div style={{ fontSize: 23, color: 'var(--ink-dim)', marginTop: 8, marginBottom: 14 }}>
        your packet hops router → router → router…
      </div>

      {/* ================= map / packet highway ================= */}
      <div style={{ position: 'relative', width: 960, height: 850 }}>
        <svg
          viewBox="0 0 960 840"
          width="960"
          height="840"
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* undersea cable wavy line, decorative */}
          <path
            d="M788 450 C 620 505, 420 545, 226 625"
            fill="none"
            stroke="rgba(34,211,238,0.28)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="2 26"
          />
          {/* base route */}
          <path
            d={PATH}
            fill="none"
            stroke="rgba(139,148,184,0.35)"
            strokeWidth="6"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="4 18"
          />
          {/* traced neon progress */}
          <path
            d={PATH}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset={100 * (1 - u)}
            style={{ filter: 'drop-shadow(0 0 10px rgba(244,114,182,0.65))' }}
          />
          <defs>
            <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="55%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
        </svg>

        {/* moving packet + ghost trail (deterministic, driven by p) */}
        {[0.028, 0].map((ghost, gi) => {
          const d = Math.max(0, u - ghost)
          if (d <= 0.001) return null
          const isTrail = gi === 0
          return (
            <div
              key={gi}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                offsetPath: `path('${PATH}')`,
                offsetDistance: `${d * 100}%`,
                width: isTrail ? 22 : 46,
                height: isTrail ? 22 : 46,
                marginLeft: isTrail ? -11 : -23,
                marginTop: isTrail ? -11 : -23,
                borderRadius: '50%',
                background: isTrail ? 'rgba(244,114,182,0.45)' : '#ffffff',
                boxShadow: isTrail
                  ? '0 0 18px 6px rgba(244,114,182,0.4)'
                  : '0 0 30px 10px rgba(244,114,182,0.85)',
              }}
            />
          )
        })}

        {/* nodes */}
        {NODES.map((node, i) => {
          const active = u >= nodeFraction(i) - 0.02
          const isGoal = i === NODES.length - 1
          return (
            <div
              key={node.label}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)',
                width: isGoal ? 190 : 168,
                padding: '14px 10px 12px',
                borderRadius: 20,
                textAlign: 'center',
                background: active ? 'rgba(244,114,182,0.16)' : 'var(--panel)',
                border: `1.5px solid ${active ? 'rgba(244,114,182,0.85)' : 'rgba(139,148,184,0.35)'}`,
                boxShadow: active ? '0 0 34px rgba(244,114,182,0.4)' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1,
                  color: active ? '#ffd7ea' : 'rgba(139,148,184,0.55)',
                  fontFamily: 'var(--mono)',
                }}
              >
                {node.icon}
              </div>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontWeight: 700,
                  fontSize: 21,
                  letterSpacing: 2,
                  color: active ? '#fff' : 'var(--ink-dim)',
                  marginTop: 8,
                }}
              >
                {node.label}
              </div>
              <div style={{ fontSize: 15, color: 'var(--ink-dim)', marginTop: 2 }}>{node.sub}</div>
            </div>
          )
        })}

        {/* arrival flash */}
        {arrived && (
          <div
            style={{
              position: 'absolute',
              left: 622,
              top: 800,
              transform: 'translate(-50%, -50%)',
              width: 260,
              height: 260,
              borderRadius: '50%',
              border: '2px solid rgba(244,114,182,0.6)',
              opacity: clamp01((p - 0.86) / 0.1) * 0.9,
            }}
          />
        )}
      </div>

      {/* ================= live stat tiles ================= */}
      <div style={{ display: 'flex', gap: 22, marginTop: 6 }}>
        {[
          { label: 'DISTANCE', value: km.toLocaleString('en-US'), unit: 'km' },
          { label: 'HOPS', value: String(hops), unit: 'routers' },
          { label: 'LATENCY', value: String(ms), unit: 'ms' },
        ].map(({ label, value, unit }) => (
          <div
            key={label}
            style={{
              width: 282,
              borderRadius: 20,
              border: '1px solid rgba(139,148,184,0.3)',
              background: 'var(--panel)',
              padding: '18px 10px 16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: 15, letterSpacing: 3, color: 'var(--ink-dim)' }}>
              {label}
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontWeight: 800,
                fontSize: 52,
                color: '#fff',
                marginTop: 6,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value}
              <span style={{ fontSize: 20, color: 'var(--magenta)', marginLeft: 8 }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
