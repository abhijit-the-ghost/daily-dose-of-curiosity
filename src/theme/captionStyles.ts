/* ==================================================================
   CAPTION_STYLES — per-episode literal karaoke caption presets.
   Moved out of KaraokeCaption.tsx so the component file exports only components.
   Static Tailwind classes — keep them literal.
   ================================================================== */

import { backOut, easeOutCubic } from '../motion/anim'

export const CAPTION_STYLES = {
  milkyway: {
    bottomClass: 'bottom-[150px]',
    pxClass: 'px-12' as const,
    fontSizeClass: 'text-[56px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#241202,2px_-2px_0_#241202,-2px_2px_0_#241202,2px_2px_0_#241202,0_0_34px_rgba(251,191,36,0.55)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#060a18,2px_-2px_0_#060a18,-2px_2px_0_#060a18,2px_2px_0_#060a18,0_8px_24px_rgba(0,0,0,0.9)]',
    holdSec: 0.65,
    wordEase: backOut,
    wordDurationSec: 0.24,
  },
  spaceSound: {
    bottomClass: 'bottom-[136px]',
    pxClass: 'px-12' as const,
    fontSizeClass: 'text-[54px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#241202,2px_-2px_0_#241202,-2px_2px_0_#241202,2px_2px_0_#241202,0_0_30px_rgba(251,191,36,0.55)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#070a14,2px_-2px_0_#070a14,-2px_2px_0_#070a14,2px_2px_0_#070a14,0_8px_24px_rgba(0,0,0,0.9)]',
    holdSec: 0.6,
  },
  minecraftEdge: {
    bottomClass: 'bottom-[140px]',
    pxClass: 'px-14' as const,
    fontSizeClass: 'text-[56px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#241202,2px_-2px_0_#241202,-2px_2px_0_#241202,2px_2px_0_#241202,0_0_30px_rgba(251,191,36,0.55)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#050a18,2px_-2px_0_#050a18,-2px_2px_0_#050a18,2px_2px_0_#050a18,0_8px_24px_rgba(0,0,0,0.9)]',
    holdSec: 0.55,
    wordEase: easeOutCubic,
    wordDurationSec: 0.22,
  },
  neverTouch: {
    bottomClass: 'bottom-[140px]',
    pxClass: 'px-14' as const,
    fontSizeClass: 'text-[56px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#2497ab,2px_-2px_0_#2497ab,-2px_2px_0_#2497ab,2px_2px_0_#2497ab,0_0_30px_rgba(34,211,238,0.6)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#050a18,2px_-2px_0_#050a18,-2px_2px_0_#050a18,2px_2px_0_#050a18,0_8px_24px_rgba(0,0,0,0.9)]',
    activeTextClass: 'text-cyan-300',
    holdSec: 0.55,
    wordEase: easeOutCubic,
    wordDurationSec: 0.22,
  },
  everestVsDeep: {
    bottomClass: 'bottom-[140px]',
    pxClass: 'px-14' as const,
    fontSizeClass: 'text-[56px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#241202,2px_-2px_0_#241202,-2px_2px_0_#241202,2px_2px_0_#241202,0_0_30px_rgba(251,191,36,0.55)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#060a18,2px_-2px_0_#060a18,-2px_2px_0_#060a18,2px_2px_0_#060a18,0_8px_24px_rgba(0,0,0,0.9)]',
    activeTextClass: 'text-amber-400',
    holdSec: 0.55,
    wordEase: easeOutCubic,
    wordDurationSec: 0.22,
  },
  touchAndFeel: {
    bottomClass: 'bottom-[140px]',
    pxClass: 'px-14' as const,
    fontSizeClass: 'text-[56px]',
    activeShadowClass:
      '[text-shadow:-2px_-2px_0_#062a33,2px_-2px_0_#062a33,-2px_2px_0_#062a33,2px_2px_0_#062a33,0_0_30px_rgba(34,211,238,0.6)]',
    idleShadowClass:
      '[text-shadow:-2px_-2px_0_#050a18,2px_-2px_0_#050a18,-2px_2px_0_#050a18,2px_2px_0_#050a18,0_8px_24px_rgba(0,0,0,0.9)]',
    activeTextClass: 'text-cyan-300',
    holdSec: 0.55,
    wordEase: easeOutCubic,
    wordDurationSec: 0.22,
  },
} as const
