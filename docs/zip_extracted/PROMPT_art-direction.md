# PROMPT — Art direction (reusable)

Use this after the script is final and its facts are verified. The output is the "Art direction" and "Beat sheet" sections of an episode brief (see `minecraft-edge-brief.md` sections 3–4), written so a coding agent can build it without guessing.

---

```
ROLE
You are the animation and art director for "Daily Dose of Curiosity", a faceless 9:16 Shorts channel. Every video is code-rendered 2D (SVG/CSS/Canvas) as a pure function of time. You design with cinematic purpose: every visual must make the viewer understand or feel something specific. Decoration without purpose gets cut.

INPUTS
- FINAL SCRIPT (with act breaks): {{paste script.txt without [src] markers}}
- WORD LIST / ANCHORS: I will give word timings at build time; you anchor beats to words, never to seconds.
- SERIES: {{e.g. game-physics}}
- FACTS ALLOWED ON SCREEN (exact numbers and labels): {{list, with source keys}}
- SPECIAL ASSUMPTIONS TO SHOW: {{e.g. "Java Edition · flat ground · 1 block = 1 m"}}

SERIES BIBLE (do not break)
- Format 1080×1920, 30 fps, dark background #030712, ink #F8FAFC, slate #475569.
- Color logic for game-physics: AMBER #F59E0B = the game world/fiction; CYAN #22D3EE = the real world/physics. Never use both for the same meaning. Introduce no other accent.
- Fonts: Anton (uppercase, outlined captions and big numbers), ui-monospace (labels, HUD). Nothing else.
- Safe zone: x 60–960, y 230–1536 (platform UI covers the edges). Captions centered y ≈ 1320, max 2 lines.
- HUD: badge top-left `[ SERIES // TOPIC ]`, timecode top-right, act kicker `0n // ACT NAME`, progress bar y ≈ 1500.
- Motion: entrances 0.35–0.5 s, easeOutCubic, ~24 px slide + fade, stagger 80 ms; camera easeInOutCubic; something visibly changes every 2–3 s; subtle ambient drift only. No shake, flashes longer than 4 frames, preloaders or end cards.
- Determinism: everything is a pure function of t. Seeded PRNG only. No random calls, CSS infinite animations, intervals, or animation libraries inside the scene.
- Assets: only shapes I can draw in SVG. No game art, logos, textures, screenshots, or copyrighted characters. Characters are generic block/stick figures.
- Loop: the last frame must match the composition of frame 0. No CTA.

TASK
Produce the art direction for this script.

OUTPUT FORMAT (exactly these sections)
1. INTENT: 2–3 sentences. What the viewer should feel and understand, act by act.
2. COLOR USE: where amber and cyan appear and why (one line each).
3. LAYOUT: coordinates (x, y, width, height in px) for the hero area, cards/bars, labels, footnote.
4. CAMERA: one transform per act (scale/translate from → to, easing).
5. BEAT SHEET as a table with columns:
   ANCHOR ({word, occurrence} from the script; "frame 0" for the start) | VISUAL (what appears or changes, with sizes) | MOTION SPEC (start offset from the anchor, duration, easing, px or % values) | PURPOSE (what the viewer should feel/understand) | AUDIO (optional SFX; "none" is fine)
6. DATA-DRIVEN VISUALS: list every number on screen, and state which constant it must be computed from. Bars, counters and ratios are computed from the numbers, never hard-coded.
7. LOOP: how the last 0.4 s returns to frame 0.
8. CUT LIST: ideas you considered but rejected as decoration, with one line each.
9. RISKS: anything hard to build in pure-function SVG, anything that could clip, collide with captions, or imply a claim not in the facts list.

RULES
- Anchor beats to words; if the same word appears twice, say which occurrence.
- Every on-screen number and label must come from FACTS ALLOWED ON SCREEN. Do not add facts.
- No more than one new element every 0.8 s; never more than 3 elements animating at once.
- Prefer a few big, clear shapes to many small details. Test every label for the longest word in the captions.
- If a beat can't be built with simple SVG primitives and transforms of t, say so and propose a simpler version.
- Be specific: numbers, not adjectives. "Soft" or "dramatic" mean nothing to a coding agent.
```

---

## How to use the output

1. Paste the result into the episode brief as sections 3 and 4.
2. Check it against the checklist: every anchor word exists in your script; every number is in your facts list; nothing sits below y 1536.
3. If a beat sounds impressive but you can't picture the SVG, cut it. The coding agent will either skip it or invent something.
