import logoUrl from '../../shared-assets/brand/logo-alpha.png'

/* ==================================================================
   EndCard — shared brand end card for Daily Dose of Curiosity.
   Pure function of `t` (seconds), safe for both real-time and
   ?record=1 deterministic capture.

   Usage:
     {showEndCard && <EndCard t={t} duration={totalDuration} />}
   ================================================================== */

const PALETTE = ['#b794d8', '#3aa9fc', '#f5f0ff', '#fbbf24', '#c084fc']

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const backOut = (x: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  const u = clamp01(x) - 1
  return 1 + c3 * u * u * u + c1 * u * u
}

export default function EndCard({ t, duration }: { t: number; duration: number }) {
  // end card occupies the final ~2.6 seconds — fades in + holds to duration
  const START = duration - 2.6
  const local = clamp01((t - START) / 0.55)
  const pop = backOut(clamp01((t - START) / 0.7))
  const endFade = endFadeOf(t, duration)

  if (local <= 0) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-3"
      style={{
        background: 'rgba(4,5,16,0.94)',
        opacity: local,
        transform: `scale(${(0.88 + pop * 0.12).toFixed(4)})`,
      }}
    >
      {/* channel logo — dark bg melts into the scrim */}
      <img
        src={logoUrl}
        alt="Daily Dose of Curiosity"
        className="mb-1 object-contain mix-blend-screen"
        style={{ width: 212, height: 212 }}
      />

      <div className="font-brand" style={{ fontSize: 62, lineHeight: 1.05, color: '#f5f0ff', letterSpacing: 6 }}>
        DAILY DOSE
      </div>
      <div
        className="font-brand"
        style={{
          fontSize: 154,
          lineHeight: 1.0,
          letterSpacing: 10,
          background: 'linear-gradient(180deg, #f0e6ff 0%, #b794d8 52%, #3aa9fc 130%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: 'drop-shadow(0 6px 30px rgba(183, 148, 216, 0.35))',
        }}
      >
        CURIOSITY
      </div>

      <div style={{ width: 240, height: 4, background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }} />

      <div
        className="font-mono"
        style={{ fontSize: 19, letterSpacing: 5, color: 'var(--amber, #fbbf24)', marginTop: 2 }}
      >
        GAMING · SCIENCE · VERIFIED FACTS
      </div>
      <div style={{ fontSize: 18, color: '#8b93b8', letterSpacing: 0.5 }}>
        every claim sourced · links in the description
      </div>

      <div
        className="font-mono"
        style={{
          marginTop: 14,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 4,
          color: '#ffffff',
          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          border: '1px solid rgba(183, 148, 216, 0.7)',
          borderRadius: 999,
          padding: '17px 60px',
          boxShadow: '0 0 46px rgba(124, 58, 237, 0.55)',
        }}
      >
        + FOLLOW
      </div>
      <div className="font-mono" style={{ fontSize: 15, color: 'rgba(232, 236, 255, 0.5)', letterSpacing: 2 }}>
        A NEW CURIOSITY EVERY DAY
      </div>

      {/* deterministic confetti */}
      {Array.from({ length: 48 }).map((_, i) => {
        const left = (i * 29.7 + 13) % 100
        const size = 12 + (i % 4) * 7
        const o = (i * 37.3) % 100
        const fall = (endFade * 148 + o) % 158 - 12
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
              borderRadius: 2,
            }}
          />
        )
      })}
    </div>
  )
}

function endFadeOf(t: number, duration: number): number {
  // smooth opacity ramp over the last second — stays 1 until the very end
  const a = clamp01((t - (duration - 2.7)) / 0.7)
  const b = 1 - clamp01((t - (duration - 0.4)) / 0.4)
  return Math.min(a, b)
}
