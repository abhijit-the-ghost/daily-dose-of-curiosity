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
| three.js runtime | https://threejs.org/ | MIT | npm dependency |
| ffmpeg binary (dev machine only) | ffmpeg-static (gyan.dev build) | GPL/LGPL per ffmpeg | build tool, not shipped in content |

When adding third-party assets in the future, append a row with source URL +
license, and carry any required attribution into the episode's `about.txt`
("Credits" section) before publishing.
