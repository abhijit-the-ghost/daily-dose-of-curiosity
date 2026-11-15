# Motion rules

Authoritative rules every scene component follows (AGENTS.md Phase 1):

1. **Entrances are 0.35–0.5 s**, `easeOutCubic`, ~24 px slide + fade. No harder easings.
2. **Stagger list items ~80 ms** (`MOTION.staggerSec`).
3. **Ambient drift only**: 2–4 % scale (`MOTION.ambientScaleFrom` → `ambientScaleTo`) or slow parallax across the whole video.
4. **Something on screen changes every ~2–3 s** (`MOTION.changeEverySec`).
5. **One accent color per video** (series `accent` in `src/theme/series.ts`). No extra accents "because it looks better".
6. **No motion longer than 1 s** except ambient drift (`MOTION.maxMotionSec`).
7. Everything is a **pure function of `t`** — `clamp01`, `easeOutCubic`, `easeInOutCubic`, `anim` from `src/motion/anim.ts`. No `Math.random()` outside seeded factories, no wall clocks, no CSS transitions inside video scenes.
8. Captions karaoke: active word = accent, past = ink, upcoming = dim ink (`karaoke-dim`). Planned `phrase` style lives behind a config flag — never ship a mid-episode caption restyle.
9. End card: off by default; the Short loops back to frame 0 cleanly. If `endCard: true` in `scene.json`, the end-card fade runs last ~1.4 s only.
