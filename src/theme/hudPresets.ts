/* ==================================================================
   HUD_PRESETS — per-episode literal HUD presets.
   Moved out of Hud.tsx so the component file exports only components.
   Static Tailwind classes — keep them literal.
   ================================================================== */

export const HUD_PRESETS = {
  milkyway: {
    accent: 'cyan' as const,
    cornerBrackets: true,
    badgeText: '[ COSMIC TELEMETRY // MILKY WAY ]',
    kickerBottomClass: 'bottom-[290px]',
    pbBottomClass: 'pb-8' as const,
    progressGradientClass:
      'from-cyan-400 via-sky-300 to-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.55)]',
  },
  spaceSound: {
    accent: 'cyan' as const,
    cornerBrackets: true,
    badgeText: '[ GAME PHYSICS // SOUND ]',
    kickerBottomClass: 'bottom-[312px]',
    pbBottomClass: 'pb-7' as const,
    progressGradientClass:
      'from-amber-400 via-yellow-300 to-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.55)]',
  },
  minecraftEdge: {
    accent: 'amber' as const,
    cornerBrackets: false,
    badgeText: '[ GAME PHYSICS // SCALE ]',
    kickerBottomClass: 'bottom-[312px]',
    pbBottomClass: 'pb-7' as const,
    progressGradientClass:
      'from-amber-400 via-orange-300 to-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.55)]',
    pulseDot: false,
  },
  neverTouch: {
    accent: 'cyan' as const,
    cornerBrackets: true,
    badgeText: '[ PHYSICS // MATTER ]',
    kickerBottomClass: 'bottom-[312px]',
    pbBottomClass: 'pb-7' as const,
    progressGradientClass:
      'from-cyan-400 via-violet-400 to-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.55)]',
  },
  everestVsDeep: {
    accent: 'cyan' as const,
    cornerBrackets: true,
    badgeText: '[ COSMIC TELEMETRY // EVEREST VS DEEP ]',
    kickerBottomClass: 'bottom-[312px]',
    pbBottomClass: 'pb-7' as const,
    progressGradientClass:
      'from-amber-400 via-orange-400 to-yellow-200 shadow-[0_0_14px_rgba(245,158,11,0.55)]',
  },
} as const
