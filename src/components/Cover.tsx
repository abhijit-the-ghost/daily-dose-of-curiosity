import logoUrl from '../../shared-assets/brand/logo-alpha.png'

/* ==================================================================
   Episode cover — still art for YouTube (16:9), TikTok (4:3) and
   Instagram (9:16).
   Route: /?cover=<slug>&ratio=16x9|4x3|9x16
   Fixed viewer size; no animation; time-independent.
   ================================================================== */

const COVERS: Record<
  string,
  { kicker: string; title: string[]; accent: string; tagline: string }
> = {
  'space-sound': {
    kicker: '[ GAME PHYSICS // SOUND ]',
    title: ['SPACE GAMES', 'LIE', 'ABOUT SOUND'],
    accent: '#f59e0b',
    tagline: 'Gaming · Science · Verified Facts',
  },
  'minecraft-edge': {
    kicker: '[ GAME PHYSICS // SCALE ]',
    title: ['80 DAYS', 'TO THE EDGE', 'OF MINECRAFT'],
    accent: '#f59e0b',
    tagline: 'Gaming · Science · Verified Facts',
  },
  'never-touch': {
    kicker: '[ PHYSICS // MATTER ]',
    title: ['YOU HAVE', 'NEVER TOUCHED', 'ANYTHING'],
    accent: '#22d3ee',
    tagline: 'Gaming · Science · Verified Facts',
  },
  'everest-challenger-deep': {
    kicker: '[ COSMIC TELEMETRY // EVEREST VS DEEP ]',
    title: ['EVEREST', 'VS', 'THE OCEAN'],
    accent: '#f59e0b',
    tagline: 'Gaming · Science · Verified Facts',
  },
  'touch-and-feel': {
    kicker: '[ PHYSICS // SENSES ]',
    title: ['IF ATOMS', 'NEVER TOUCH', 'HOW DO YOU FEEL?'],
    accent: '#22d3ee',
    tagline: 'Gaming · Science · Verified Facts',
  },
  'nuclear-gandhi': {
    kicker: '[ GAME MYTHS // CIV ]',
    title: ['THE BUG', 'THAT NEVER', 'EXISTED'],
    accent: '#22d3ee',
    tagline: 'Gaming · Science · Verified Facts',
  },
  'sun-never-black-hole': {
    kicker: '[ STELLAR SCIENCE ]',
    title: ['WHY OUR SUN', 'WILL NEVER', 'BE A BLACK HOLE'],
    accent: '#a78bfa',
    tagline: 'Gaming · Science · Verified Facts',
  },
  'earth-never-made-gold': {
    kicker: '[ COSMIC TELEMETRY // GOLD ]',
    title: ['EARTH NEVER', 'MADE ITS', 'OWN GOLD'],
    accent: '#f59e0b',
    tagline: 'Gaming · Science · Verified Facts',
  },
  'uranus-tilted-sideways': {
    kicker: '[ COSMIC TELEMETRY // URANUS ]',
    title: ['URANUS', 'ROLLS ON', 'ITS SIDE'],
    accent: '#f59e0b',
    tagline: 'Cosmic · Science · Verified Facts',
  },
  'venus-sun-rises-west': {
    kicker: '[ COSMIC TELEMETRY // VENUS ]',
    title: ['DAY BEATS', 'YEAR', '243'],
    accent: '#f59e0b',
    tagline: 'Cosmic · Science · Verified Facts',
  },
  'solar-system-flat-plane': {
    kicker: '[ COSMIC TELEMETRY // FLAT PLANE ]',
    title: ['ONE FLAT', 'PLANE', 'NOT ATOMS'],
    accent: '#f59e0b',
    tagline: 'Cosmic · Science · Verified Facts',
  },
  'why-youve-never-seen-a-real-photo-of-the-milky-way': {
    kicker: '[ COSMIC TELEMETRY // MILKY WAY ]',
    title: ['EVERY PHOTO', 'OF OUR GALAXY', 'IS A LIE'],
    accent: '#fbbf24',
    tagline: 'Gaming · Science · Verified Facts',
  },
  'what-happens-when-you-type-a-url': {
    kicker: '[ COSMIC TELEMETRY // THE INTERNET ]',
    title: ['WHAT REALLY', 'HAPPENS WHEN', 'YOU TYPE A URL'],
    accent: '#f59e0b',
    tagline: 'Gaming · Science · Verified Facts',
  },
}

type RatioId = '16x9' | '4x3' | '9x16'

const LAYOUT: Record<RatioId, {
  W: number
  H: number
  kickerFont: number
  lineFont: number
  gap: number
  bar: { left: number; top: number; h: number; w: number }
  lineAbove: number
  chip: { left: number; top: number }
  titleTop: number
  titleLeft: number
  titleRight: number
  tagline: { left: number; bottom: number; fontSize: number; letterSpacing: number }
  brand: { left?: number; right?: number; bottom: number; logo: number; nameLinePx: number; word2Px: number; gap: number }
  water: { right: number; top: number; fontSize: number }
}> = {
  '16x9': {
    W: 1280, H: 720,
    kickerFont: 18, lineFont: 104, gap: 54,
    bar: { left: -260, top: 420, h: 72, w: 1850 }, lineAbove: 524,
    chip: { left: 64, top: 52 },
    titleTop: 128, titleLeft: 64, titleRight: 64,
    tagline: { left: 64, bottom: 150, fontSize: 16, letterSpacing: 4 },
    brand: { right: 64, bottom: 24, logo: 74, nameLinePx: 52, word2Px: 52, gap: 22 },
    water: { right: 22, top: 60, fontSize: 11 },
  },
  '4x3': {
    W: 1440, H: 1080,
    kickerFont: 20, lineFont: 132, gap: 88,
    bar: { left: -260, top: 640, h: 80, w: 1970 }, lineAbove: 750,
    chip: { left: 72, top: 72 },
    titleTop: 200, titleLeft: 72, titleRight: 72,
    tagline: { left: 72, bottom: 225, fontSize: 20, letterSpacing: 4 },
    brand: { right: 72, bottom: 60, logo: 98, nameLinePx: 66, word2Px: 66, gap: 24 },
    water: { right: 24, top: 72, fontSize: 12 },
  },
  '9x16': {
    W: 1080, H: 1920,
    kickerFont: 22, lineFont: 132, gap: 128,
    bar: { left: -260, top: 980, h: 96, w: 1750 }, lineAbove: 1130,
    chip: { left: 72, top: 120 },
    titleTop: 260, titleLeft: 60, titleRight: 60,
    tagline: { left: 72, bottom: 430, fontSize: 26, letterSpacing: 4 },
    brand: { left: 72, bottom: 160, logo: 110, nameLinePx: 78, word2Px: 78, gap: 26 },
    water: { right: 18, top: 120, fontSize: 14 },
  },
}

export default function Cover() {
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('cover') ?? 'space-sound'
  const raw = (params.get('ratio') ?? '16x9') as RatioId
  const ratio = raw === '4x3' || raw === '9x16' ? raw : '16x9'
  const L = LAYOUT[ratio]
  const data = COVERS[slug] ?? COVERS['space-sound']

  return (
    <div
      className="relative overflow-hidden"
      style={{
        position: 'absolute',
        width: L.W,
        height: L.H,
        background:
          'radial-gradient(1100px 620px at 50% -10%, rgba(56,189,248,0.30), transparent 58%),' +
          'radial-gradient(800px 620px at -18% 112%, rgba(217,70,239,0.32), transparent 58%),' +
          'radial-gradient(780px 520px at 128% 66%, rgba(34,211,238,0.20), transparent 58%),' +
          '#030712',
      }}
    >
      {/* dot grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(139,148,184,0.28) 1.4px, transparent 1.4px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 95% 88% at 50% 45%, black 34%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 95% 88% at 50% 45%, black 34%, transparent 78%)',
        }}
      />

      {/* diagonal brand bar */}
      <div
        style={{
          position: 'absolute',
          left: L.bar.left,
          top: L.bar.top,
          height: L.bar.h,
          width: L.bar.w,
          background: `linear-gradient(90deg, ${data.accent} 0%, #f472b6 44%, #3aa9fc 100%)`,
          transform: 'rotate(-14deg)',
          boxShadow: '0 14px 60px rgba(0,0,0,0.45)',
        }}
      />
      {/* thin accent line above the bar */}
      <div
        style={{
          position: 'absolute',
          left: -260,
          top: L.lineAbove,
          height: 3,
          width: L.bar.w,
          background: 'rgba(232,236,255,0.72)',
          transform: 'rotate(-14deg)',
        }}
      />

      {/* kicker chip */}
      <div
        style={{
          position: 'absolute',
          left: L.chip.left,
          top: L.chip.top,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 20px',
          borderRadius: 999,
          border: '1px solid rgba(34,211,238,0.55)',
          background: 'rgba(6,10,30,0.78)',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: '#22d3ee',
            boxShadow: '0 0 14px rgba(34,211,238,0.9)',
          }}
        />
        <span
          className="font-mono"
          style={{
            fontSize: L.kickerFont,
            letterSpacing: 3,
            color: '#a5f3fc',
            fontWeight: 700,
          }}
        >
          {data.kicker}
        </span>
      </div>

      {/* main title */}
      <div
        style={{
          position: 'absolute',
          left: L.titleLeft,
          top: L.titleTop,
          right: L.titleRight,
        }}
      >
        {data.title.map((line, i) => (
          <div
            key={i}
            className="font-block"
            style={{
              fontSize: L.lineFont,
              lineHeight: 0.98,
              letterSpacing: 2,
              color: i === 1 ? data.accent : '#f5f0ff',
              textShadow: '0 6px 40px rgba(0,0,0,0.85)',
              textTransform: 'uppercase',
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* tagline */}
      <div
        className="font-mono"
        style={{
          position: 'absolute',
          left: L.tagline.left,
          bottom: L.tagline.bottom,
          fontSize: L.tagline.fontSize,
          letterSpacing: L.tagline.letterSpacing,
          color: 'rgba(232,236,255,0.78)',
        }}
      >
        {data.tagline}
      </div>

      {/* brand block bottom — logo + wordmark */}
      <div
        style={{
          position: 'absolute',
          left: L.brand.left,
          right: L.brand.right,
          bottom: L.brand.bottom,
          display: 'flex',
          alignItems: 'center',
          gap: L.brand.gap,
        }}
      >
        <img
          src={logoUrl}
          alt="Daily Dose of Curiosity"
          style={{
            width: L.brand.logo,
            height: L.brand.logo,
            objectFit: 'contain',
            mixBlendMode: 'screen',
          }}
        />
        <div>
          <div
            className="font-brand"
            style={{
              fontSize: L.brand.nameLinePx,
              lineHeight: 1.05,
              color: '#f5f0ff',
              letterSpacing: 3,
            }}
          >
            DAILY DOSE
          </div>
          <div
            className="font-brand"
            style={{
              fontSize: L.brand.word2Px,
              lineHeight: 0.95,
              letterSpacing: 6,
              background: 'linear-gradient(180deg, #f0e6ff 0%, #b794d8 52%, #3aa9fc 130%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            CURIOSITY
          </div>
        </div>
      </div>

      {/* right-edge watermark vertical text */}
      <div
        className="font-mono"
        style={{
          position: 'absolute',
          right: L.water.right,
          top: L.water.top,
          writingMode: 'vertical-rl',
          fontSize: L.water.fontSize,
          letterSpacing: 5,
          color: 'rgba(232,236,255,0.38)',
        }}
      >
        DAILYDOSEOFCURIOSITY · EPISODE 01
      </div>
    </div>
  )
}
