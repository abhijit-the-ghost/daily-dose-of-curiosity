import type { SceneProps } from '../App'

/* Deterministic animation helpers — everything derives from `t` / `p`. */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)
const backOut = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  const u = clamp01(x) - 1
  return 1 + c3 * u * u * u + c1 * u * u
}

const URL_TEXT = 'google.com'
const IP = '142.250.72.14'

export default function DNSScene({ t, p }: SceneProps) {
  /* ---- phase timeline (proportions of act progress) ---- */
  const typeP = clamp01(p / 0.22)
  const typed = URL_TEXT.slice(0, Math.floor(typeP * (URL_TEXT.length + 1)))
  const caretOn = Math.floor(t * 2.4) % 2 === 0

  const goFlash = p > 0.2 && p < 0.27 ? 1 - (p - 0.2) / 0.07 : 0

  const queryP = easeInOut(clamp01((p - 0.27) / 0.13)) // browser → resolver (down)
  const spinP = clamp01((p - 0.42) / 0.14) // resolver thinking
  const respP = easeInOut(clamp01((p - 0.585) / 0.115)) // resolver → browser (up)
  const ipP = backOut(clamp01((p - 0.72) / 0.15)) // IP answer pop
  const landed = p > 0.93

  const resolverActive = p > 0.38 && p < 0.62
  const resolverGlow = resolverActive ? 0.5 + 0.5 * Math.sin(t * 10) : p >= 0.62 ? 1 : 0.18

  const dotY = (1 - queryP) * 100 // query dot travels downward (percent)
  const respY = respP * 100 // response dot travels upward back

  return (
    <div className="scene" style={{ alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      {/* giant backdrop glyph (behind panels) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          zIndex: -1,
          top: 210,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'var(--mono)',
          fontWeight: 800,
          fontSize: 300,
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: '1.5px rgba(34,211,238,0.16)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        DNS?
      </div>

      <div style={{ fontFamily: 'var(--mono)', fontSize: 22, letterSpacing: 5, color: 'var(--cyan)', marginBottom: 26 }}>
        STEP 1 — ASK THE PHONEBOOK
      </div>

      {/* ================= browser window ================= */}
      <div
        style={{
          width: 880,
          borderRadius: 26,
          border: `1.5px solid ${landed ? 'rgba(52,211,153,0.85)' : 'rgba(139,148,184,0.35)'}`,
          background: 'var(--panel)',
          boxShadow: landed ? '0 0 60px rgba(52,211,153,0.35)' : '0 20px 60px rgba(0,0,0,0.45)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 22px',
            borderBottom: '1px solid rgba(139,148,184,0.2)',
          }}
        >
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: '50%', background: c }} />
          ))}
        </div>

        <div style={{ padding: '30px 34px 34px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: '#070b26',
              border: '1px solid rgba(139,148,184,0.28)',
              borderRadius: 14,
              padding: '18px 22px',
            }}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: 26, color: 'var(--ink-dim)' }}>https://</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 44, color: '#fff', minHeight: 54, whiteSpace: 'pre' }}>
              {typed}
              <span style={{ color: 'var(--cyan)', opacity: caretOn && p < 0.25 ? 1 : 0 }}>▍</span>
            </div>
            <div
              style={{
                marginLeft: 'auto',
                fontFamily: 'var(--mono)',
                fontSize: 20,
                color: '#04140c',
                background: goFlash > 0 ? `rgba(52,211,153,${0.35 + goFlash * 0.65})` : 'rgba(139,148,184,0.25)',
                borderRadius: 10,
                padding: '10px 18px',
                transform: `scale(${1 + goFlash * 0.25})`,
              }}
            >
              ⏎ GO
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              height: 150,
              borderRadius: 14,
              background: '#070b26',
              border: '1px solid rgba(139,148,184,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {landed ? (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 34, color: 'var(--green)' }}>✓ connected to {IP}</div>
            ) : (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 24, color: 'rgba(139,148,184,0.5)' }}>
                page loads after DNS answers…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= query / response lane ================= */}
      <div style={{ position: 'relative', width: 520, height: 150, margin: '4px 0' }}>
        {/* dashed rails */}
        <div style={{ position: 'absolute', left: 60, top: 0, bottom: 0, borderLeft: '2px dashed rgba(139,148,184,0.35)' }} />
        <div style={{ position: 'absolute', right: 60, top: 0, bottom: 0, borderLeft: '2px dashed rgba(139,148,184,0.35)' }} />

        {/* labels */}
        <div
          style={{
            position: 'absolute',
            left: 88,
            top: 18,
            fontFamily: 'var(--mono)',
            fontSize: 19,
            color: 'var(--cyan)',
            opacity: queryP > 0.04 && queryP < 0.98 ? 1 : 0.35,
            transition: 'none',
          }}
        >
          “WHERE IS google.com?”
        </div>
        <div
          style={{
            position: 'absolute',
            right: 88,
            top: 78,
            fontFamily: 'var(--mono)',
            fontSize: 19,
            color: 'var(--green)',
            opacity: respP > 0.04 ? 1 : 0.35,
          }}
        >
          “142.250.72.14”
        </div>

        {/* query dot (down the left rail) */}
        {queryP > 0 && queryP < 1 && (
          <div
            style={{
              position: 'absolute',
              left: 44,
              top: `${dotY}%`,
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--cyan)',
              boxShadow: '0 0 24px 6px rgba(34,211,238,0.7)',
              transform: 'translateY(-50%)',
            }}
          />
        )}
        {/* response dot (up the right rail) */}
        {respP > 0 && respP < 1 && (
          <div
            style={{
              position: 'absolute',
              right: 44,
              bottom: `${respY}%`,
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--green)',
              boxShadow: '0 0 24px 6px rgba(52,211,153,0.7)',
              transform: 'translateY(50%)',
            }}
          />
        )}
      </div>

      {/* ================= resolver ================= */}
      <div
        style={{
          width: 560,
          borderRadius: 24,
          padding: '22px 30px 24px',
          textAlign: 'center',
          background: 'var(--panel-2)',
          border: `1.5px solid rgba(34,211,238,${0.25 + resolverGlow * 0.75})`,
          boxShadow: `0 0 ${30 + resolverGlow * 60}px rgba(34,211,238,${0.15 + resolverGlow * 0.5})`,
        }}
      >
        <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 54, letterSpacing: 10, color: '#a5f3fc' }}>
          DNS
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 17, letterSpacing: 3, color: 'var(--ink-dim)', marginBottom: 14 }}>
          RESOLVER · PHONEBOOK
        </div>
        {/* root → tld → authoritative pipeline dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          {['.', '.com', 'google'].map((label, i) => {
            const on = spinP > (i + 1) / 3.4
            return (
              <div
                key={i}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 16,
                  padding: '8px 14px',
                  borderRadius: 9,
                  border: `1px solid ${on ? 'rgba(52,211,153,0.8)' : 'rgba(139,148,184,0.3)'}`,
                  color: on ? 'var(--green)' : 'var(--ink-dim)',
                  background: on ? 'rgba(52,211,153,0.12)' : 'transparent',
                }}
              >
                {label}
              </div>
            )
          })}
        </div>
      </div>

      {/* ================= IP answer pop ================= */}
      <div
        style={{
          marginTop: 34,
          height: 150,
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          borderRadius: 24,
          border: '1.5px solid rgba(251,191,36,0.75)',
          background: 'rgba(251,191,36,0.10)',
          padding: '0 44px',
          opacity: clamp01((p - 0.7) / 0.08),
          transform: `scale(${0.6 + ipP * 0.4})`,
          boxShadow: '0 0 50px rgba(251,191,36,0.25)',
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            border: '3px solid var(--amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 44,
            color: 'var(--amber)',
            flex: '0 0 auto',
          }}
        >
          ✓
        </div>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 18, letterSpacing: 3, color: 'var(--amber)' }}>
            IP ADDRESS FOUND
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 46, color: '#fff', marginTop: 6 }}>
            {IP}
          </div>
        </div>
      </div>
    </div>
  )
}
