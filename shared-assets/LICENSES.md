# Shared assets — sources & licenses

Every external (non-original) asset used by Daily Dose of Curiosity video renders
is logged here. Ours stay ours; everything else keeps its license terms.

| Asset | Source | License | Notes |
| --- | --- | --- | --- |
| `brand/logo.png` | original channel artwork | © Daily Dose of Curiosity | channel logo; do not redistribute |
| `brand/CuriosityStickman.tsx` | original channel artwork | © Daily Dose of Curiosity | poseable Curiosity stickman (React/TSX SVG component); do not redistribute |
| `svg/animated/pixel-tree.svg` | original, generated locally with OpenCode SVG Studio | © Daily Dose of Curiosity | subtle 1–2px CSS leaf sway; reduced-motion safe |
| `brand/fonts/PirataOne-Regular.ttf` | https://github.com/google/fonts (ofl/pirataone) | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Pirata+One |
| `brand/fonts/Anton-Regular.ttf` | https://github.com/google/fonts (ofl/anton) | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Anton (karaoke captions) |
| (narration MP3s, `public/audio/`) | generated with edge-tts | Microsoft Speech service terms (free tier) | voices: en-US-AriaNeural |
| `sfx/follow_for_more.mp3` | generated with edge-tts (en-US-AriaNeural) | Microsoft Speech service terms (free tier) | short "Follow for more!" end-card CTA audio; original generated asset |
| `sfx/sub_drop.wav`, `sfx/riser.wav`, `sfx/glass_chime.wav`, `sfx/sub_thump.wav`, `sfx/airy_swell.wav`, `sfx/spin_up_hum.wav`, `sfx/collision_tick.wav`, `sfx/disk_collapse.wav`, `sfx/telemetry_click.wav`, `sfx/sub_drop_v2.wav`, `sfx/sub_thump_v2.wav`, `sfx/disk_collapse_v2.wav` | generated locally by `scripts/synth_sfx.py` | original work | deterministic synthesized SFX; seed `0xC0FFEE`; v2 files add phone-band harmonics; no samples, no third-party licence |
| `sfx/music_bed.wav` | generated locally by `scripts/synth_bed.py` (`bun run bed`) | original work | deterministic 48 s / 48 kHz drone+pulse bed; seed `0xBED5`, peak −18 dBFS |
| three.js runtime | https://threejs.org/ | MIT | npm dependency |
| ffmpeg binary (dev machine only) | ffmpeg-static (gyan.dev build) | GPL/LGPL per ffmpeg | build tool, not shipped in content |

When adding third-party assets in the future, append a row with source URL +
license, and carry any required attribution into the episode's `about.txt`
("Credits" section) before publishing.
