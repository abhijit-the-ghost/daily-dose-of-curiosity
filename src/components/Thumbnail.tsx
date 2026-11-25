import logoUrl from '../../shared-assets/brand/logo-alpha.png'
import { CuriosityStickman } from '@shared-assets/brand/CuriosityStickman'
import { FACTS } from '../../episodes/everest-challenger-deep/facts'
import { FACTS as VENUS_FACTS } from '../../episodes/venus-sun-rises-west/facts'

/* ==================================================================
   Thumbnail — still still for YouTube / Instagram cover frames.
   Route: /?thumb=<slug>&ratio=9x16|16x9
   Cinematic, code-rendered (no image gen model available here).
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

/**
 * deterministic seeded PRNG (mulberry32)
 */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Star { x: number; y: number; r: number; o: number; cross: boolean }
const STARS: Star[] = (() => {
  const rand = mulberry32(0xC0FFEE)
  const out: Star[] = []
  for (let i = 0; i < 70; i++) {
    out.push({
      x: rand() * 100,
      y: rand() * 100,
      r: rand() > 0.88 ? 0.4 + rand() * 0.55 : 0.12 + rand() * 0.3,
      o: 0.3 + rand() * 0.65,
      cross: rand() > 0.88,
    })
  }
  return out
})()

function StarField() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      {STARS.map((s, i) =>
        s.cross ? (
          <g key={i} opacity={s.o} stroke="#e8edff" strokeWidth={0.28} strokeLinecap="round">
            <line x1={s.x - s.r * 1.2} y1={s.y} x2={s.x + s.r * 1.2} y2={s.y} />
            <line x1={s.x} y1={s.y - s.r * 1.2} x2={s.x} y2={s.y + s.r * 1.2} />
            <circle cx={s.x} cy={s.y} r={s.r * 0.7} fill="#fff" stroke="none" />
          </g>
        ) : (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e8edff" opacity={s.o} />
        ),
      )}
    </svg>
  )
}

function MinecraftScene({ ratio }: { ratio: '9x16' | '16x9' }) {
  const is169 = ratio === '16x9'
  const vb = is169 ? '0 0 1280 720' : '0 0 1080 1920'

  // blocky hero: body + head + leg (unit = one pixel-block)
  const u = is169 ? 26 : 33
  const px = (n: number) => n * u

  // origin: feet baseline
  const ox = is169 ? 1005 : 790
  const base = is169 ? 625 : 1705 // y of the ground band top

  const blocks: { x: number; y: number; w: number; h: number; fill: string }[] = [
    // legs (alternating walk pose)
    { x: -0.62, y: -1.8, w: 0.9, h: 1.8, fill: '#b45309' },
    { x: 0.15, y: -1.3, w: 0.9, h: 1.3, fill: '#92400e' },
    // torso
    { x: -0.85, y: -3.7, w: 1.85, h: 2.1, fill: '#f59e0b' },
    { x: -0.85, y: -3.7, w: 0.5, h: 2.1, fill: '#d97706' },
    // head
    { x: -0.8, y: -5.1, w: 1.75, h: 1.5, fill: '#f59e0b' },
    { x: -0.8, y: -5.1, w: 0.45, h: 1.5, fill: '#d97706' },
    // eyes
    { x: -0.32, y: -4.4, w: 0.28, h: 0.34, fill: '#030712' },
    { x: 0.34, y: -4.4, w: 0.28, h: 0.34, fill: '#030712' },
  ]

  // blocky ground tiles
  const tile: { x: number; y: number; fill: string }[] = []
  const tileW = 2.6 * u
  for (let row = 0; row < 2; row++) {
    for (let col = -9; col < 15; col++) {
      tile.push({
        x: col * tileW + (row % 2 ? tileW / 2 : 0),
        y: (row + 0.02) * u * (is169 ? 1.35 : 1.35),
        fill: col % 3 === 0 ? '#1a1128' : col % 3 === 1 ? '#231331' : '#120b1d',
      })
    }
  }

  return (
    <>
      {/* deep void + warm amber horizon glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(950px 620px at 96% 88%, rgba(245,158,11,0.34), transparent 58%),' +
            'radial-gradient(700px 600px at -8% 100%, rgba(139,92,246,0.16), transparent 62%),' +
            'radial-gradient(900px 620px at 30% -12%, rgba(56,189,248,0.14), transparent 55%),' +
            '#030712',
        }}
      />
      {/* starfield */}
      <StarField />

      <svg viewBox={vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="warmGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#92400e" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#030712" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* warm halo behind the block */}
        <rect x={is169 ? 760 : 180} y={is169 ? -40 : 1120} width={is169 ? 520 : 720} height={is169 ? 800 : 860} fill="url(#warmGlow)" opacity="0.9" />

        {/* ground tiles */}
        {tile.map((t, i) => (
          <rect
            key={i}
            x={t.x}
            y={base + t.y}
            width={tileW - 4}
            height={u * 1.6}
            fill={t.fill}
            stroke="#2b1738"
            strokeWidth={2.5}
          />
        ))}

        {/* blocky character */}
        <g transform={`translate(${ox}, ${base})`}>
          {blocks.map((b, i) => (
            <rect
              key={i}
              x={px(b.x)}
              y={px(b.y)}
              width={px(b.w)}
              height={px(b.h)}
              fill={b.fill}
              shapeRendering="crispEdges"
            />
          ))}
        </g>
      </svg>
    </>
  )
}

/* ------- never-touch scene: stickman hovering in front of a neon barrier ------- */
const zig = (x: number, y0: number, y1: number, amp: number, steps: number, seed: number) => {
  let d = `M ${x} ${y0}`
  let s = seed >>> 0
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return (s & 0xffff) / 0xffff }
  for (let i = 1; i <= steps; i++) {
    const y = y0 + (y1 - y0) * (i / steps)
    d += ` L ${(x + (rnd() - 0.5) * amp).toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}
const wave = (y0: number, amp: number, freq: number, phase: number, x0 = 0, x1 = 1080) => {
  let d = `M ${x0} ${y0}`
  for (let x = x0; x <= x1; x += 24) {
    d += ` L ${x} ${(y0 + Math.sin((x / x1) * Math.PI * 2 * freq + phase) * amp).toFixed(1)}`
  }
  return d
}

function NeverTouchScene({ ratio }: { ratio: '9x16' | '16x9' }) {
  const is169 = ratio === '16x9'
  const vb = is169 ? '0 0 1280 720' : '0 0 1080 1920'
  const ox = is169 ? 990 : 790     // stickman center-right, leaving room for the title on the left
  const base = is169 ? 640 : 1540
  const stickScale = is169 ? 0.52 : 0.82

  return (
    <>
      {/* deep void + cyan/violet aura */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(900px 620px at 50% -10%, rgba(34,211,238,0.24), transparent 58%),' +
            'radial-gradient(720px 620px at -6% 108%, rgba(167,139,250,0.22), transparent 62%),' +
            'radial-gradient(820px 520px at 112% 70%, rgba(34,211,238,0.2), transparent 58%),' +
            '#030712',
        }}
      />
      <StarField />
      <svg viewBox={vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <filter id="ntGlow" x="-80%" y="-20%" width="260%" height="140%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* neon barrier on the right */}
        <path d={zig(is169 ? 1180 : 940, -40, is169 ? 760 : 1960, is169 ? 70 : 84, is169 ? 12 : 18, 42)}
          stroke="#22D3EE" strokeWidth={is169 ? 8 : 11} fill="none" opacity="0.95" filter="url(#ntGlow)" strokeLinejoin="round" strokeLinecap="round" />
        <path d={zig(is169 ? 1236 : 1005, -40, is169 ? 760 : 1960, is169 ? 46 : 62, is169 ? 12 : 18, 137)}
          stroke="#67E8F9" strokeWidth={is169 ? 3.5 : 5} fill="none" opacity="0.8" />

        {/* energy waves under him */}
        {[0, 1].map((i) => (
          <path
            key={i}
            d={wave(base + 40 + i * 55, 14 - i * 5, 3, i * 1.8, 0, is169 ? 1280 : 1080)}
            fill="none"
            stroke={i === 0 ? '#22D3EE' : '#A78BFA'}
            strokeWidth={i === 0 ? 9 : 6}
            opacity={0.8 - i * 0.3}
            strokeLinecap="round"
          />
        ))}
      </svg>
      {/* stickman hovering with hands up, shocked */}
      <div
        style={{
          position: 'absolute',
          left: ox,
          bottom: is169 ? 60 : 320,
          transform: `translateX(-50%) scale(${stickScale})`,
          transformOrigin: 'center bottom',
        }}
      >
        <CuriosityStickman
          pose={{ headTilt: 12, torsoLean: -4, leftShoulder: 62, rightShoulder: -62, leftElbow: -14, rightElbow: 14, leftHip: 8, rightHip: -8, leftKnee: 6, rightKnee: 6, mouthOpen: 0.9 }}
          className="w-[340px] h-[476px]"
        />
      </div>
    </>
  )
}

/* ------- everest scene: sky + trench silhouettes side by side ------- */
function EverestScene({ ratio }: { ratio: '9x16' | '16x9' }) {
  const is169 = ratio === '16x9'
  const vb = is169 ? '0 0 1280 720' : '0 0 1080 1920'

  return (
    <>
      {/* deep void + cyan to black gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(900px 560px at 50% -10%, rgba(10,58,90,0.56), transparent 58%),' +
            'radial-gradient(720px 620px at 110% 100%, rgba(30,58,114,0.30), transparent 60%),' +
            '#030712',
        }}
      />
      <StarField />

      <svg viewBox={vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A3A5A" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#04101C" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* sea level line across the whole frame */}
        {(is169 ? [178, 680] : [420, 1500]).map((_, i) => (
          <line key={i} x1={0} x2={is169 ? 1280 : 1080} y1={is169 ? 360 : 960} y2={is169 ? 360 : 960} stroke="#22d3ee" strokeWidth={2} strokeOpacity={0.45} />
        ))}

        {/* Everest silhouette (sky half) */}
        <g transform={`translate(${is169 ? 240 : 260}, ${is169 ? 330 : 880})`}>
          <polygon points="0,-130 -210,130 210,130" fill="#141b33" stroke="#f59e0b" strokeWidth={4} />
          <polygon points="0,-130 -30,-70 30,-70" fill="#e8edff" opacity={0.4} />
          <text x={0} y={-145} textAnchor="middle" fill="#e8edff" fontSize={is169 ? 18 : 26} fontFamily="ui-monospace, Consolas, monospace" letterSpacing={4} opacity={0.9}>{FACTS.everestM.display}</text>
        </g>

        {/* trench shaft (water half) */}
        <g transform={`translate(${is169 ? 1000 : 760}, ${is169 ? 480 : 1330})`}>
          <rect x={-140} y={-190} width={280} height={380} fill="rgba(0,0,0,0.35)" stroke="#475569" strokeWidth={3} />
          <line x1={-140} y1={-190} x2={140} y2={-190} stroke="#22d3ee" strokeWidth={4} opacity={0.8} />
          <text x={0} y={-205} textAnchor="middle" fill="#22d3ee" fontSize={is169 ? 16 : 24} fontFamily="ui-monospace, Consolas, monospace" letterSpacing={4} opacity={0.9}>{FACTS.deepM.display}</text>
          {/* depth ruler ticks */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = -190 + i * 95
            return <line key={i} x1={-160} y1={y} x2={-140} y2={y} stroke="#e8edff" strokeWidth={2} opacity={0.5} />
          })}
        </g>
      </svg>
    </>
  )
}

/* ------- touch-and-feel scene: skin cross-section + fingertip ------- */
function TouchAndFeelScene({ ratio }: { ratio: '9x16' | '16x9' }) {
  const is169 = ratio === '16x9'
  const vb = is169 ? '0 0 1280 720' : '0 0 1080 1920'

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(700px 620px at 50% 62%, rgba(34,211,238,0.12), transparent 60%),' +
            '#030712',
        }}
      />
      <StarField />
      <svg viewBox={vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {/* skin layers */}
        <rect x={0} y={is169 ? 470 : 1200} width={is169 ? 1280 : 1080} height={is169 ? 250 : 720} fill="#2a1810" />
        <rect x={0} y={is169 ? 380 : 1000} width={is169 ? 1280 : 1080} height={is169 ? 170 : 400} fill="#8a5a3b" />
        <path d={`M 0 ${is169 ? 380 : 1000} L ${(is169 ? 1280 : 1080) / 2 - 170} ${is169 ? 380 : 1000} Q ${(is169 ? 1280 : 1080) / 2} ${is169 ? 440 : 1120} ${(is169 ? 1280 : 1080) / 2 + 170} ${is169 ? 380 : 1000} L ${is169 ? 1280 : 1080} ${is169 ? 380 : 1000} L ${is169 ? 1280 : 1080} ${is169 ? 480 : 1220} L 0 ${is169 ? 480 : 1220} Z`} fill="#d9b08a" stroke="#2b1a10" strokeWidth={2} />
        {/* fingertip */}
        <path d={`M ${(is169 ? 1280 : 1080) / 2 - 120} ${is169 ? 180 : 640} L ${(is169 ? 1280 : 1080) / 2 - 120} ${is169 ? 380 : 1000} Q ${(is169 ? 1280 : 1080) / 2} ${is169 ? 420 : 1110} ${(is169 ? 1280 : 1080) / 2 + 120} ${is169 ? 380 : 1000} L ${(is169 ? 1280 : 1080) / 2 + 120} ${is169 ? 180 : 640} Z`} fill="#c98d5f" stroke="#5a3016" strokeWidth={4} />
        {/* nail */}
        <path d={`M ${(is169 ? 1280 : 1080) / 2 - 46} ${is169 ? 220 : 700} Q ${(is169 ? 1280 : 1080) / 2} ${is169 ? 200 : 672} ${(is169 ? 1280 : 1080) / 2 + 46} ${is169 ? 220 : 700} L ${(is169 ? 1280 : 1080) / 2 + 46} ${is169 ? 265 : 760} Q ${(is169 ? 1280 : 1080) / 2} ${is169 ? 245 : 735} ${(is169 ? 1280 : 1080) / 2 - 46} ${is169 ? 265 : 760} Z`} fill="#e8cdb8" opacity={0.9} />
        {/* electron dots */}
        <circle cx={(is169 ? 1280 : 1080) / 2 - 170} cy={is169 ? 340 : 985} r={is169 ? 10 : 18} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 7" />
        <circle cx={(is169 ? 1280 : 1080) / 2 + 170} cy={is169 ? 340 : 985} r={is169 ? 10 : 18} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 7" />
      </svg>
    </>
  )
}

/* ------- nuclear-gandhi scene: NO BUG stamp + glitch 255 tile ------- */
function NuclearGandhiScene({ ratio }: { ratio: '9x16' | '16x9' }) {
  const is169 = ratio === '16x9'
  const vb = is169 ? '0 0 1280 720' : '0 0 1080 1920'
  const cx = is169 ? 640 : 540
  const cy = is169 ? 360 : 940
  const S  = is169 ? 0.9 : 1.4

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(720px 620px at 60% 34%, rgba(34,211,238,0.12), transparent 58%),' +
            'radial-gradient(640px 620px at 40% 92%, rgba(239,68,68,0.10), transparent 60%),' +
            '#030712',
        }}
      />
      <StarField />
      <svg viewBox={vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {/* false numeral tile */}
        <rect x={cx - 240 * S} y={cy - 210 * S} width={480 * S} height={420 * S} fill="#0b1220" stroke="#ef4444" strokeWidth={4 * S} />
        <text x={cx} y={cy + 72 * S} textAnchor="middle" fill="#f59e0b" fontSize={is169 ? 160 : 250} fontFamily="Anton, Impact, sans-serif" letterSpacing={4 * S} opacity="0.92">255</text>
        <text x={cx} y={cy + 118 * S} textAnchor="middle" fill="#ef4444" fontSize={is169 ? 14 : 22} fontFamily="ui-monospace, Consolas, monospace" letterSpacing={10 * S} opacity="0.85">RUMORED</text>
        {/* stamp */}
        <g transform={`translate(${cx}, ${cy + 185 * S}) rotate(-4)`}>
          <rect x={is169 ? -185 : -280} y={-62} width={is169 ? 370 : 560} height={124} fill="#030712" stroke="#22d3ee" strokeWidth={is169 ? 3 : 6} />
          <text x={0} y={34} textAnchor="middle" fill="#22d3ee" fontSize={is169 ? 30 : 56} fontFamily="Anton, Impact, sans-serif" letterSpacing={is169 ? 4 : 8}>NO BUG</text>
        </g>
      </svg>
    </>
  )
}

/* ------- uranus-tilted-sideways scene: sideways ice giant with rings ------- */
function UranusThumbScene({ ratio }: { ratio: '9x16' | '16x9' }) {
  const is169 = ratio === '16x9'
  const vb = is169 ? '0 0 1280 720' : '0 0 1080 1920'
  const cx = is169 ? 920 : 540
  const cy = is169 ? 390 : 1120
  const S = is169 ? 0.72 : 1
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(900px 640px at 72% 52%, rgba(103,232,249,0.16), transparent 58%),' +
            'radial-gradient(640px 560px at 18% 40%, rgba(245,158,11,0.18), transparent 60%),' +
            '#030712',
        }}
      />
      <StarField />
      <svg viewBox={vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="uranusThumb" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#cffafe" />
            <stop offset="55%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#155e75" />
          </radialGradient>
          <radialGradient id="sunThumb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <filter id="uGlow"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx={is169 ? 180 : 170} cy={is169 ? 360 : 760} r={95 * S} fill="url(#sunThumb)" opacity="0.7" />
        <circle cx={is169 ? 180 : 170} cy={is169 ? 360 : 760} r={42 * S} fill="#f59e0b" filter="url(#uGlow)" />
        {[ -80,-40,0,40,80].map((dy,i)=>(<line key={i} x1={(is169?240:230)} y1={(is169?360:760)+dy*S*0.45} x2={cx-170*S} y2={cy+dy*S} stroke="rgba(253,230,138,0.18)" strokeWidth={4*S} strokeLinecap="round"/>))}
        <g transform={`translate(${cx},${cy}) rotate(90)`}>
          <circle r={150*S} fill="rgba(103,232,249,0.08)" />
          <circle r={108*S} fill="url(#uranusThumb)" />
          <ellipse rx={190*S} ry={44*S} fill="none" stroke="rgba(253,230,138,0.5)" strokeWidth={10*S} />
          <ellipse rx={190*S} ry={44*S} fill="none" stroke="rgba(248,250,252,0.28)" strokeWidth={2*S} />
          <line x1="0" y1={-170*S} x2="0" y2={170*S} stroke="rgba(248,250,252,0.7)" strokeWidth={4*S} strokeDasharray={`${10*S} ${12*S}`} />
          <path d={`M 0 ${-108*S} A ${108*S} ${108*S} 0 0 1 0 ${108*S} L 0 ${-108*S} Z`} fill="rgba(253,230,138,0.16)" />
          <path d={`M 0 ${-108*S} A ${108*S} ${108*S} 0 0 0 0 ${108*S} L 0 ${-108*S} Z`} fill="rgba(2,6,23,0.22)" />
        </g>
        <g fill="#f8fafc" fontFamily="ui-monospace, Consolas, monospace" fontSize={is169?20:28} letterSpacing="3">
          <text x={cx} y={cy - 210*S} textAnchor="middle" fill="#fde68a">97.77° TILT</text>
          <text x={cx - 170*S} y={cy + 210*S} textAnchor="middle" fill="#fde68a">42 YR SUN</text>
          <text x={cx + 170*S} y={cy + 210*S} textAnchor="middle" fill="#bfdbfe">42 YR DARK</text>
        </g>
      </svg>
    </>
  )
}

/* ------- venus-sun-rises-west scene: west sunrise, backward spin, day > year ------- */
function VenusThumbScene({ ratio }: { ratio: '9x16' | '16x9' }) {
  const is169 = ratio === '16x9'
  const vb = is169 ? '0 0 1280 720' : '0 0 1080 1920'
  const cx = is169 ? 930 : 540
  const cy = is169 ? 390 : 1180
  const S = is169 ? 0.72 : 1

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(920px 680px at 74% 58%, rgba(245,158,11,0.20), transparent 58%),' +
            'radial-gradient(680px 600px at 12% 78%, rgba(96,165,250,0.18), transparent 60%),' +
            '#05070F',
        }}
      />
      <StarField />
      <svg viewBox={vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="venusThumb" cx="34%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="48%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#7C2D12" />
          </radialGradient>
          <radialGradient id="venusSunThumb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <marker id="venusThumbArrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M 0 0 L 12 6 L 0 12 z" fill="#F59E0B" />
          </marker>
        </defs>

        {/* the Sun breaks the western horizon on the left */}
        <circle cx={is169 ? 190 : 150} cy={is169 ? 420 : 930} r={110 * S} fill="url(#venusSunThumb)" opacity="0.75" />
        <circle cx={is169 ? 190 : 150} cy={is169 ? 420 : 930} r={40 * S} fill="#F59E0B" />
        <path
          d={`M ${is169 ? 110 : 70} ${is169 ? 470 : 1030} Q ${is169 ? 190 : 150} ${is169 ? 330 : 810} ${is169 ? 270 : 230} ${is169 ? 470 : 1030}`}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={6 * S}
          strokeLinecap="round"
          markerEnd="url(#venusThumbArrow)"
          opacity="0.95"
        />

        {/* huge Venus hero with the reversed spin arrow */}
        <g transform={`translate(${cx},${cy})`}>
          <circle r={210 * S} fill="#F59E0B" opacity="0.12" />
          <circle r={150 * S} fill="url(#venusThumb)" />
          <ellipse cx={-36 * S} cy={-42 * S} rx={152 * S} ry={70 * S} fill="rgba(255,255,255,0.10)" />
          <line x1="0" y1={-190 * S} x2="0" y2={190 * S} stroke="#F8FAFC" strokeWidth={3 * S} strokeDasharray={`${9 * S} ${11 * S}`} opacity="0.6" />
          <path
            d={`M ${-168 * S} ${-86 * S} A ${176 * S} ${176 * S} 0 1 1 ${-112 * S} ${134 * S}`}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={9 * S}
            strokeLinecap="round"
            markerEnd="url(#venusThumbArrow)"
          />
        </g>

        {/* one visual proof: spin days outlast orbit days */}
        <g fontFamily="ui-monospace, Consolas, monospace" textAnchor="middle">
          <text x={cx - 175 * S} y={cy + 255 * S} fill="#FDE68A" fontSize={30 * S} letterSpacing={3 * S}>
            {VENUS_FACTS.spinDays.value}
          </text>
          <text x={cx - 175 * S} y={cy + 292 * S} fill="rgba(245,158,11,0.78)" fontSize={17 * S} letterSpacing={4 * S}>
            SPIN
          </text>
          <text x={cx + 175 * S} y={cy + 255 * S} fill="#BFDBFE" fontSize={30 * S} letterSpacing={3 * S}>
            {VENUS_FACTS.orbitDays.value}
          </text>
          <text x={cx + 175 * S} y={cy + 292 * S} fill="rgba(96,165,250,0.82)" fontSize={17 * S} letterSpacing={4 * S}>
            ORBIT
          </text>
        </g>
      </svg>
    </>
  )
}

/* ------- solar-system-flat-plane: atom-shell myth vs one flat disk ------- */
function FlatPlaneThumbScene({ ratio }: { ratio: '9x16' | '16x9' }) {
  const is169 = ratio === '16x9'
  const vb = is169 ? '0 0 1280 720' : '0 0 1080 1920'
  const cx = is169 ? 640 : 540
  const cy = is169 ? 360 : 1000
  const S = is169 ? 0.72 : 1

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(920px 680px at 50% 44%, rgba(245,158,11,0.20), transparent 58%),' +
            'radial-gradient(680px 600px at 18% 70%, rgba(96,165,250,0.18), transparent 60%),' +
            '#05070F',
        }}
      />
      <StarField />
      <svg viewBox={vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="flatPlaneThumbSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="42%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={`translate(${cx},${cy})`}>
          {[0, 60, 120].map((deg) => (
            <ellipse
              key={deg}
              rx={330 * S} ry={118 * S}
              transform={`rotate(${deg})`}
              fill="none" stroke="#60A5FA" strokeWidth={3.5 * S}
              strokeDasharray={`${16 * S} ${22 * S}`} opacity={0.72}
            />
          ))}
          <ellipse rx={390 * S} ry={54 * S} fill="none" stroke="#F59E0B" strokeWidth={9 * S} opacity={0.95} />
          <circle r={150 * S} fill="url(#flatPlaneThumbSun)" opacity={0.8} />
          <circle r={44 * S} fill="#FEF3C7" />
          {[0.3, 0.52, 0.74].map((f, i) => {
            const a = f * Math.PI * 2
            return (
              <circle
                key={i}
                cx={Math.cos(a) * (170 + i * 58) * S}
                cy={Math.sin(a) * 20 * S}
                r={(6 + i * 2) * S}
                fill="#F8FAFC"
                opacity={0.8}
              />
            )
          })}
        </g>
      </svg>
    </>
  )
}

/* ------- sun-never-black-hole scene: the red giant + faint ember ------- */
function SunRedGiantScene({ ratio }: { ratio: '9x16' | '16x9' }) {
  const is169 = ratio === '16x9'
  const vb = is169 ? '0 0 1280 720' : '0 0 1080 1920'
  const cx = is169 ? 640 : 540
  const cy = is169 ? 360 : 960
  const S  = is169 ? 0.85 : 1.4

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(820px 640px at 50% 46%, rgba(239,68,68,0.16), transparent 58%),' +
            'radial-gradient(640px 560px at 30% 85%, rgba(167,139,250,0.14), transparent 60%),' +
            '#030712',
        }}
      />
      <StarField />
      <svg viewBox={vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="giant" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="36%" stopColor="#fb923c" />
            <stop offset="72%" stopColor="#ef4444" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={300 * S} fill="url(#giant)" />
        <circle cx={cx} cy={cy} r={118 * S} fill="#fdba74" stroke="#7c2d12" strokeWidth={3 * S} />
      </svg>
    </>
  )
}

function Scene({ ratio, variant }: { ratio: '9x16' | '16x9'; variant?: 'minecraft' | 'neverTouch' | 'everest' | 'touchAndFeel' | 'nuclearGandhi' | 'sunNeverBlackHole' | 'uranusTiltedSideways' | 'venusSunRisesWest' | 'flatPlane' }) {
  if (variant === 'minecraft') return <MinecraftScene ratio={ratio} />
  if (variant === 'neverTouch') return <NeverTouchScene ratio={ratio} />
  if (variant === 'everest') return <EverestScene ratio={ratio} />
  if (variant === 'touchAndFeel') return <TouchAndFeelScene ratio={ratio} />
  if (variant === 'nuclearGandhi') return <NuclearGandhiScene ratio={ratio} />
  if (variant === 'sunNeverBlackHole') return <SunRedGiantScene ratio={ratio} />
  if (variant === 'uranusTiltedSideways') return <UranusThumbScene ratio={ratio} />
  if (variant === 'venusSunRisesWest') return <VenusThumbScene ratio={ratio} />
  if (variant === 'flatPlane') return <FlatPlaneThumbScene ratio={ratio} />
  const is169 = ratio === '16x9'

  // geometry per ratio
  const G = is169
    ? { cx: 960, cy: 360, r: 100, vb: '0 0 1280 720', translateY: 0 }
    : { cx: 540, cy: 1160, r: 262, vb: '0 0 1080 1920', translateY: 0 }

  return (
    <>
      {/* deep cosmic void + electric-blue stardust gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(900px 560px at 50% -10%, rgba(56,189,248,0.30), transparent 55%),' +
            'radial-gradient(720px 500px at 108% 90%, rgba(217,70,239,0.22), transparent 58%),' +
            'radial-gradient(660px 500px at -4% 108%, rgba(251,191,36,0.14), transparent 55%),' +
            '#030712',
        }}
      />

      {/* starfield */}
      <StarField />

      {/* nebula glow around the blast */}
      <svg viewBox={G.vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="blastGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#030712" stopOpacity="0" />
          </radialGradient>

          {/* shockwave gradient in the ring stroke */}
          <linearGradient id="shockGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#a5f3fc" stopOpacity="1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#blastGlow)" />
      </svg>

      {/* the blast scene itself */}
      <svg viewBox={G.vb} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {/* OUTER shockwave halo */}
        <circle
          cx={G.cx}
          cy={G.cy}
          r={G.r + 18}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="46"
          opacity="0.35"
          style={{ filter: 'blur(18px)' }}
        />
        {/* main shockwave ring (cyan→orange) */}
        <circle
          cx={G.cx}
          cy={G.cy}
          r={G.r}
          fill="none"
          stroke="url(#shockGrad)"
          strokeWidth="19"
          opacity="1"
        />
        {/* thin inner highlight */}
        <circle
          cx={G.cx}
          cy={G.cy}
          r={G.r - 34}
          fill="none"
          stroke="#a5f3fc"
          strokeWidth="3.5"
          opacity="0.55"
        />

        {/* ship silhouette — single big geometric arrow */}
        <g transform={`translate(${G.cx}, ${G.cy})`} opacity="1">
          {/* outer hull */}
          <path
            d="M -128 -16 L -52 -22 L 22 -18 L 66 -58 L 86 -66 L 72 -18 L 108 0 L 72 18 L 86 66 L 66 58 L 22 18 L -52 22 L -128 16 L -112 0 Z"
            fill="#0b1120"
            stroke="#22d3ee"
            strokeWidth="3.6"
            strokeLinejoin="round"
          />
          {/* cockpit */}
          <path d="M -26 -8 L 10 -10 L 26 0 L 10 10 L -26 8 Z" fill="#22d3ee" opacity="0.92" />
          {/* engine glow */}
          <ellipse cx="-117" cy="0" rx="13" ry="17" fill="#22d3ee" opacity="0.95" />
          <ellipse cx="-117" cy="0" rx="26" ry="34" fill="#22d3ee" opacity="0.32" />
          {/* engine streaks */}
          <line x1="-128" y1="-24" x2="-188" y2="-30" stroke="#a5f3fc" strokeWidth="4.5" strokeLinecap="round" strokeOpacity="0.85" />
          <line x1="-128" y1="-10" x2="-176" y2="-12" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="-128" y1="10"  x2="-176" y2="12"  stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="-128" y1="24"  x2="-188" y2="30"  stroke="#a5f3fc" strokeWidth="4.5" strokeLinecap="round" strokeOpacity="0.85" />
        </g>

        {/* red audio-mute icon */}
        <g transform={`translate(${G.cx + G.r * 0.62}, ${G.cy + G.r * 0.66})`}>
          {/* red halation */}
          <circle r="62" fill="#e11d48" opacity="0.22" />
          {/* red ring */}
          <circle r="50" fill="none" stroke="#f43f5e" strokeWidth="13" opacity="1" style={{ filter: 'drop-shadow(0 0 22px rgba(244,63,94,0.8))' }} />
          {/* three audio bars */}
          <rect x="-18" y="-17" width="8"  height="34" rx="2" fill="#f43f5e" />
          <rect x="-7"  y="-22" width="8"  height="44" rx="2" fill="#f43f5e" />
          <rect x="4"   y="-12" width="8"  height="24" rx="2" fill="#f43f5e" />
          {/* slash */}
          <line x1="-38" y1="38" x2="38" y2="-38" stroke="#f43f5e" strokeWidth="13" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 18px rgba(244,63,94,0.9))' }} />
        </g>
      </svg>
    </>
  )
}

function WordmarkRow({ ratio }: { ratio: '9x16' | '16x9' }) {
  const is169 = ratio === '16x9'
  return (
    <div
      style={{
        position: 'absolute',
        left: is169 ? 36 : 56,
        bottom: is169 ? 24 : 158,
        display: 'flex',
        alignItems: 'center',
        gap: is169 ? 16 : 22,
        zIndex: 2,
      }}
    >
      <img
        src={logoUrl}
        alt="Daily Dose of Curiosity"
        style={{
          width: is169 ? 70 : 104,
          height: is169 ? 70 : 104,
          objectFit: 'contain',
          mixBlendMode: 'lighten',
        }}
      />
      <div>
        <div
          className="font-brand"
          style={{
            fontSize: is169 ? 30 : 50,
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
            fontSize: is169 ? 46 : 78,
            lineHeight: 0.92,
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
  )
}

export default function Thumbnail() {
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('thumb') ?? 'space-sound'
  const ratio = (params.get('ratio') ?? '9x16') as '9x16' | '16x9'
  const data = COVERS[slug] ?? COVERS['space-sound']
  const is169 = ratio === '16x9'

  const titleData = is169
    ? [
        { text: data.title[0], size: 80, color: '#f5f0ff' },
        { text: data.title[1], size: 136, color: data.accent },
        { text: data.title[2], size: 80, color: '#f5f0ff' },
      ]
    : [
        { text: data.title[0], size: 88, color: '#f5f0ff' },
        { text: data.title[1], size: 142, color: data.accent },
        { text: data.title[2], size: 88, color: '#f5f0ff' },
      ]

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      style={{ width: '100vw', height: '100svh', background: '#030712' }}
    >
      <Scene
        ratio={ratio}
        variant={slug === 'minecraft-edge' ? 'minecraft' : slug === 'never-touch' ? 'neverTouch' : slug === 'everest-challenger-deep' ? 'everest' : slug === 'touch-and-feel' ? 'touchAndFeel' : slug === 'nuclear-gandhi' ? 'nuclearGandhi' : slug === 'sun-never-black-hole' ? 'sunNeverBlackHole' : slug === 'uranus-tilted-sideways' ? 'uranusTiltedSideways' : slug === 'venus-sun-rises-west' ? 'venusSunRisesWest' : slug === 'solar-system-flat-plane' ? 'flatPlane' : undefined}
      />

      {/* kicker chip top-left */}
      <div
        style={{
          position: 'absolute',
          left: is169 ? 34 : 56,
          top: is169 ? 36 : 104,
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: is169 ? '7px 16px' : '10px 18px',
          borderRadius: 999,
          border: '1px solid rgba(34,211,238,0.6)',
          background: 'rgba(6,10,30,0.82)',
          zIndex: 3,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: '#22d3ee',
            boxShadow: '0 0 14px rgba(34,211,238,0.9)',
          }}
        />
        <span
          className="font-mono"
          style={{
            fontSize: is169 ? 12 : 18,
            letterSpacing: 3,
            color: '#a5f3fc',
            fontWeight: 700,
          }}
        >
          {data.kicker}
        </span>
      </div>

      {/* title block */}
      <div
        style={{
          position: 'absolute',
          left: is169 ? 36 : 56,
          top: is169 ? 110 : 210,
          right: is169 ? undefined : 56,
          display: 'flex',
          flexDirection: 'column',
          alignItems: is169 ? 'flex-start' : 'center',
          textAlign: is169 ? 'left' : 'center',
          zIndex: 2,
        }}
      >
        {titleData.map((line, i) => (
          <div
            key={i}
            className="font-block"
            style={{
              fontSize: line.size,
              lineHeight: 0.92,
              letterSpacing: 1.5,
              color: line.color,
              textShadow: '0 6px 44px rgba(0,0,0,0.88)',
              textTransform: 'uppercase',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* tagline */}
      <div
        className="font-mono"
        style={{
          position: 'absolute',
          left: is169 ? 36 : 56,
          bottom: is169 ? 92 : 336,
          fontSize: is169 ? 14 : 18,
          letterSpacing: 4,
          color: 'rgba(232,236,255,0.72)',
          zIndex: 2,
        }}
      >
        {data.tagline}
      </div>

      {/* right-edge episode tag */}
      <div
        className="font-mono"
        style={{
          position: 'absolute',
          right: is169 ? 14 : 18,
          top: is169 ? 48 : 92,
          writingMode: 'vertical-rl',
          fontSize: is169 ? 10 : 13,
          letterSpacing: 5,
          color: 'rgba(232,236,255,0.32)',
          zIndex: 3,
        }}
      >
        DAILYDOSEOFCURIOSITY · EPISODE 01
      </div>

      {/* brand block bottom-left */}
      <WordmarkRow ratio={ratio} />
    </div>
  )
}
