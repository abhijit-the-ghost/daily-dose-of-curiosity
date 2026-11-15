import logoUrl from '../../shared-assets/brand/logo-alpha.png'
import type { SceneProps } from '../App'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const backOut = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  const u = clamp01(x) - 1
  return 1 + c3 * u * u * u + c1 * u * u
}

const PAGE_CHIPS = ['HTML', 'CSS', 'JS', 'IMG'] as const
const STREAM_CHIPS = ['HTML', 'CSS', 'JS'] as const
const CONFETTI = Array.from({ length: 44 }, (_, i) => i)
const PALETTE = ['#b794d8', '#3aa9fc', '#f5f0ff', '#fbbf24', '#c084fc']

export default function ServerScene({ t, p }: SceneProps) {
  /* ---- phases ---- */
  const recvP = clamp01(p / 0.16) // request flies into the rack
  const buildP = clamp01((p - 0.17) / 0.36) // page assembly
  const streamP = clamp01((p - 0.55) / 0.22) // packets fly back to the browser
  const fillP = clamp01((p - 0.6) / 0.24) // browser skeleton fills
  const doneP = backOut(clamp01((p - 0.8) / 0.09)) // "0.8s" pop
  const confettiP = clamp01((p - 0.82) / 0.18)
  const endP = backOut(clamp01((p - 0.945) / 0.05)) // end card (only during the tail)

  const buildingDots = '.'.repeat(Math.floor(t * 1.7) % 4)
  const received = recvP >= 1

  return (
    <div className="scene" style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 22, letterSpacing: 5, color: 'var(--amber)' }}>
        STEP 3 — THE SERVER ANSWERS
      </div>
      <div style={{ fontSize: 23, color: 'var(--ink-dim)', marginTop: -6 }}>
        every request gets a response — fast
      </div>

      {/* incoming request line */}
      <div
        style={{
          width: 760,
          fontFamily: 'var(--mono)',
          fontSize: 22,
          color: 'var(--green)',
          background: '#070b26',
          border: '1px solid rgba(52,211,153,0.35)',
          borderRadius: 14,
          padding: '14px 20px',
          marginBottom: 26,
          opacity: recvP > 0.03 ? 1 : 0.25,
        }}
      >
        <span style={{ color: 'var(--ink-dim)' }}>REQUEST → </span>
        {'GET / HTTP/1.1'.slice(0, Math.floor(recvP * 16))}
        {received && <span style={{ color: 'var(--green)' }}>   ✓ 200 OK</span>}
      </div>

      {/* ============ rack (left)  +  browser mock (right) ============ */}
      <div style={{ display: 'flex', gap: 22, alignItems: 'stretch' }}>
        {/* server rack */}
        <div
          style={{
            width: 442,
            borderRadius: 24,
            border: '1.5px solid rgba(251,191,36,0.4)',
            background: 'var(--panel)',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 20, letterSpacing: 3, color: '#fde68a' }}>
              SERVER RACK
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 15, color: 'var(--ink-dim)' }}>us-east1</div>
          </div>

          {[0, 1, 2].map((row) => (
            <div
              key={row}
              style={{
                height: 112,
                borderRadius: 14,
                border: '1px solid rgba(139,148,184,0.3)',
                background: 'var(--panel-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 18px',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink-dim)' }}>UNIT {row + 1}</div>
                <div style={{ width: 180, height: 10, borderRadius: 999, background: 'rgba(139,148,184,0.3)', marginTop: 10 }}>
                  <div style={{ width: `${55 + Math.sin(t * 1.4 + row * 1.9) * 30 + 30}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#fbbf24,#f472b6)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[0, 1, 2].map((led) => {
                  const on = Math.floor(t * 2.6 + row * 1.7 + led * 0.9) % 2 === 0
                  return (
                    <div
                      key={led}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: on ? '#34d399' : 'rgba(52,211,153,0.18)',
                        boxShadow: on ? '0 0 10px rgba(52,211,153,0.8)' : 'none',
                      }}
                    />
                  )
                })}
              </div>
            </div>
          ))}

          {/* file assembly chips */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 2, height: 64 }}>
            {PAGE_CHIPS.map((chip, i) => {
              const on = buildP > (i + 0.55) / PAGE_CHIPS.length
              const s = on ? 0.4 + 0.6 * backOut(clamp01((buildP - i / PAGE_CHIPS.length) / 0.22)) : 0.4
              return (
                <div
                  key={chip}
                  style={{
                    alignSelf: 'center',
                    fontFamily: 'var(--mono)',
                    fontWeight: 700,
                    fontSize: 22,
                    padding: '10px 18px',
                    borderRadius: 12,
                    border: `1px solid ${on ? 'rgba(251,191,36,0.8)' : 'rgba(139,148,184,0.3)'}`,
                    color: on ? '#ffedb0' : 'var(--ink-dim)',
                    background: on ? 'rgba(251,191,36,0.14)' : 'transparent',
                    transform: `scale(${s})`,
                    opacity: on ? 1 : 0.4,
                  }}
                >
                  {chip}
                </div>
              )
            })}
          </div>
        </div>

        {/* response stream lane */}
        <div style={{ position: 'relative', width: 60 }}>
          <div style={{ position: 'absolute', left: '50%', top: 30, bottom: 30, borderLeft: '2px dashed rgba(139,148,184,0.35)' }} />
          {STREAM_CHIPS.map((chip, i) => {
            const local = clamp01((streamP - i * 0.18) / 0.55)
            if (local <= 0 || local >= 1) return null
            return (
              <div
                key={chip}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: `${8 + i * 40}%`,
                  transform: `translate(-50%, ${local * 320 - 20}px)`,
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'var(--cyan)',
                  color: '#032730',
                  boxShadow: '0 0 14px rgba(34,211,238,0.7)',
                }}
              >
                {chip}
              </div>
            )
          })}
        </div>

        {/* browser mock */}
        <div
          style={{
            width: 388,
            borderRadius: 24,
            border: `1.5px solid ${fillP > 0.95 ? 'rgba(52,211,153,0.8)' : 'rgba(139,148,184,0.35)'}`,
            background: 'var(--panel)',
            overflow: 'hidden',
            boxShadow: fillP > 0.95 ? '0 0 45px rgba(52,211,153,0.3)' : 'none',
          }}
        >
          <div style={{ display: 'flex', gap: 8, padding: '14px 16px', borderBottom: '1px solid rgba(139,148,184,0.2)' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
            <div
              style={{
                marginLeft: 10,
                flex: 1,
                fontFamily: 'var(--mono)',
                fontSize: 14,
                color: 'var(--ink-dim)',
                background: '#070b26',
                borderRadius: 8,
                padding: '5px 10px',
              }}
            >
              google.com
            </div>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* hero block */}
            <div
              style={{
                height: 150,
                borderRadius: 12,
                background: `linear-gradient(120deg, rgba(34,211,238,${0.15 + fillP * 0.85}), rgba(244,114,182,${0.15 + fillP * 0.85}))`,
                border: '1px solid rgba(139,148,184,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--mono)',
                fontSize: 30,
                fontWeight: 800,
                color: fillP > 0.5 ? '#fff' : 'rgba(232,236,255,0.35)',
                letterSpacing: 1,
              }}
            >
              Google
            </div>
            {/* skeleton bars */}
            {[
              { w: 0.85, ph: 0.58 },
              { w: 0.68, ph: 0.68 },
              { w: 0.78, ph: 0.78 },
            ].map(({ w, ph }, i) => (
              <div
                key={i}
                style={{
                  height: 20,
                  borderRadius: 999,
                  width: `${100 * w * clamp01((fillP - (ph - 0.58)) / 0.35)}%`,
                  minWidth: fillP > ph - 0.58 ? 30 : 0,
                  background: 'rgba(232,236,255,0.82)',
                  opacity: fillP > ph - 0.58 ? 1 : 0.12,
                }}
              />
            ))}
            {/* search button appears last */}
            <div
              style={{
                alignSelf: 'flex-start',
                marginTop: 4,
                fontFamily: 'var(--mono)',
                fontSize: 17,
                color: '#04140c',
                background: 'var(--green)',
                borderRadius: 10,
                padding: '10px 26px',
                opacity: clamp01((fillP - 0.72) / 0.25),
                transform: `scale(${0.7 + 0.3 * backOut(clamp01((fillP - 0.72) / 0.25))})`,
              }}
            >
              SEARCH
            </div>
          </div>
        </div>
      </div>

      {/* status line */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 24, marginTop: 30, height: 34, color: fillP > 0.92 ? 'var(--green)' : 'var(--amber)' }}>
        {streamP <= 0 && buildP < 1 ? `assembling page${buildingDots}` : fillP <= 0.92 ? 'streaming packets home…' : '✓ fully rendered'}
      </div>

      {/* ============ the big 0.8s ============ */}
      <div
        style={{
          marginTop: 8,
          height: 150,
          display: 'flex',
          alignItems: 'baseline',
          gap: 22,
          opacity: clamp01((p - 0.78) / 0.06),
          transform: `scale(${0.5 + doneP * 0.5})`,
        }}
      >
        <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 120, color: '#fff', lineHeight: 1 }}>
          0.8<span style={{ fontSize: 54, color: 'var(--amber)' }}>s</span>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 22, letterSpacing: 3, color: 'var(--ink-dim)' }}>
          TYPING →
          <br />
          RENDERED
        </div>
      </div>

      {/* ============ deterministic confetti (final act of the video) ============ */}
      {confettiP > 0 &&
        CONFETTI.map((i) => {
          const left = (i * 29.7 + 13) % 100
          const size = 12 + (i % 4) * 7
          const o = (i * 37.3) % 100
          const fall = (confettiP * 148 + o) % 158 - 12
          const rot = (i * 97 + t * 160 * (i % 2 === 0 ? 1 : -1)) % 360
          return (
            <div
              key={i}
              aria-hidden
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${fall}%`,
                width: size,
                height: size * 0.45,
                background: PALETTE[i % PALETTE.length],
                transform: `rotate(${rot}deg)`,
                opacity: 0.95,
                zIndex: 7,
                borderRadius: 2,
              }}
            />
          )
        })}

      {/* ============ end card — Daily Dose of Curiosity ============ */}
      {endP > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 6,
            background: 'rgba(4,5,16,0.94)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            opacity: clamp01((p - 0.945) / 0.035),
            transform: `scale(${0.85 + endP * 0.15})`,
          }}
        >
          {/* channel logo — black background melts into the scrim */}
          <img
            src={logoUrl}
            alt="Daily Dose of Curiosity"
            style={{
              width: 225,
              height: 225,
              objectFit: 'contain',
              mixBlendMode: 'screen',
              marginBottom: -6,
            }}
          />

          <div className="font-brand" style={{ fontSize: 64, lineHeight: 1.05, color: '#f5f0ff', letterSpacing: 6 }}>
            DAILY DOSE
          </div>
          <div
            className="font-brand"
            style={{
              fontSize: 158,
              lineHeight: 1.0,
              letterSpacing: 10,
              background: 'linear-gradient(180deg, #f0e6ff 0%, #b794d8 52%, #3aa9fc 130%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 6px 30px rgba(183, 148, 216, 0.35))',
            }}
          >
            CURIOSITY
          </div>

          <div style={{ width: 240, height: 4, background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }} />

          <div style={{ fontFamily: 'var(--mono)', fontSize: 19, letterSpacing: 5, color: 'var(--amber)', marginTop: 2 }}>
            GAMING · SCIENCE · VERIFIED FACTS
          </div>
          <div style={{ fontSize: 18, color: 'var(--ink-dim)', letterSpacing: 0.5 }}>
            every claim sourced · links in the description
          </div>

          <div
            style={{
              marginTop: 12,
              fontFamily: 'var(--mono)',
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 3,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              border: '1px solid rgba(183, 148, 216, 0.7)',
              borderRadius: 999,
              padding: '17px 58px',
              boxShadow: '0 0 46px rgba(124, 58, 237, 0.55)',
            }}
          >
            + FOLLOW
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 15, color: 'rgba(232,236,255,0.5)', letterSpacing: 2 }}>
            A NEW CURIOSITY EVERY DAY
          </div>
        </div>
      )}
    </div>
  )
}
