# EPISODE BRIEF — `minecraft-edge` ("How long to walk to the edge of Minecraft?")

> For the coding agent (OpenCode). Follow this brief literally. Where it conflicts with `AGENTS.md`, `AGENTS.md` hard rules win; report the conflict, don't silently pick.
> Do not change, add, or "improve" any claim, number, or line of narration. If you think something is wrong, stop and ask.

## 0. Summary

- Series: `game-physics`. Badge text: `[ GAME PHYSICS // SCALE ]`. Format: 9:16, 1080×1920, 30 fps.
- Hook style: **question + number**. Caption style: existing default (`karaoke-dim`). End card: **off**.
- Length: ~24 s (65 words). The real duration comes from the audio, not from this document.
- Idea: the Java Edition world border is ~30 million blocks from the center. Walking there nonstop takes ~80 days (62 sprinting). That distance is ~30,000 km, close to the Earth's circumference (~40,000 km).
- Color logic for this series: **amber = the game world, cyan = the real world.** Amber carries all Minecraft numbers. Cyan appears only for real-world facts (Act 3 Earth bar, kicker 03).
- Legal: Minecraft is a trademark. Use only your own simple shapes. No Mojang art, textures, logos, fonts or screenshots.

## 1. Narration (source of truth)

Write exactly this to `episodes/minecraft-edge/script.txt`. `[src: …]` markers and `//` lines are metadata: **strip them before TTS and before building caption words.** Word timings come only from edge-tts `WordBoundary` events.

```
// ACT 1 — THE QUESTION
How long does it take to walk to the edge of Minecraft's world? About eighty days. Nonstop. [src: S1, S2, D1]

// ACT 2 — THE MATH
The border sits about thirty million blocks from the center. [src: S1]
The player walks four point three blocks per second. [src: S2]
That's roughly seven million seconds. [src: D1]

// ACT 3 — THE SCALE
Sprint on flat ground and it's still about sixty-two days. [src: S2, D1]
For scale, that border is thirty thousand kilometers away. [src: S1, D2]
Earth is about forty thousand around. [src: S3]
```

- Voice `en-US-AriaNeural`, rate `+12%`. Word count must be 60–75 (expected 65). Duration 20–35 s. If outside, stop and report; don't edit the text.
- Listen for odd reads of "Minecraft's" and "point". If wrong, use a one-to-one `pronunciations` map (same word count, TTS input only).

## 2. Sources (a human must open and confirm each before publishing)

Only pages retrieved while writing this brief are listed. A retrieved snippet is not verification. Never replace these with sources recalled from memory.

| Key | URL | Supports | Notes |
|---|---|---|---|
| S1 | https://minecraft.gamepedia.com/World_border | World border at ±29,999,984 blocks from the center (Java Edition) | Old Gamepedia host. **Find the current official Minecraft Wiki page and use it instead** |
| S1b | https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/World_border | Same figure | Mirror of the wiki; backup only |
| S2 | https://breezewiki.discard.no/minecraft/wiki/Player | Walking 4.317, sprinting 5.612 blocks/s; states "4.317 meters (blocks) per second" | Proxy of a wiki page. **Find the official page** |
| S3 | **NOT YET FOUND** | Earth's equatorial circumference ≈ 40,075 km | Human must add a NASA or Britannica page. Packaging must fail until this is filled |
| D1 | derived | 29,999,984 ÷ 4.317 ÷ 86,400 ≈ 80.4 days; 29,999,984 ÷ 5.612 ÷ 86,400 ≈ 61.9 days; 29,999,984 ÷ 4.317 ≈ 6.95 M seconds | Check with the one-liner in section 6 |
| D2 | derived / assumption | 1 block = 1 m, so the border is ≈ 30,000 km from the center | S2 states blocks and meters interchangeably. Say the assumption on screen |

`about.txt` must list every source used with the claim it supports. Say "Java Edition" there; the border figure was not verified for Bedrock.

## 3. Art direction

**Intent:** make a huge number feel physical. The viewer watches a day counter spin up to 80, sees the three numbers that cause it, then sees the border distance fall just short of the real Earth.

### Palette & type
- Background `#030712`. Ink `#F8FAFC`. Amber `#F59E0B` (Minecraft). Cyan `#22D3EE` (real world). Slate `#475569` (secondary).
- Captions: Anton, uppercase, outlined. HUD and numbers' labels: `ui-monospace`. No other fonts.
- Kickers: `01 // THE QUESTION` (amber), `02 // THE MATH` (amber), `03 // THE SCALE` (cyan).

### Layout (1080×1920)
- Default safe zone: x 60–960, y 230–1536 (confirm per platform with the owner).
- Hero area y 380–1100. Captions centered at y ≈ 1320, max 2 lines. Longest words to test: "MINECRAFT'S", "KILOMETERS".
- HUD: badge top-left y ≈ 250, timecode `TC mm:ss:ff` top-right, progress bar y ≈ 1500. Nothing below y 1536.

### Camera (one parent `<g>` transform per act, driven by `t`)
- Act 1: ground scrolls left continuously (parallax), subtle push-in 1.00 → 1.04.
- Act 2: static layout, slow scale 1.00 → 1.03.
- Act 3: gentle pull-back 1.00 → 0.97 as the bars appear so the Earth bar feels larger.
- Easing: `easeInOutCubic` on camera, `easeOutCubic` on entrances.

### Motion rules
- Entrances 0.35–0.5 s, ~24 px slide + fade; stagger 80 ms. Something changes every 2–3 s.
- All motion is a pure function of `t`. Seeded PRNG for any scatter. No `Math.random()`, no CSS `infinite`, no Motion library.

### Cinematic purpose per act
- Act 1: **momentum.** Constant motion and a speeding counter create the "how long?" feeling.
- Act 2: **clarity.** Three big numbers, one at a time, make the math visible. Nothing else on screen.
- Act 3: **scale shock.** Two bars side by side make the border distance feel nearly planet-sized.

## 4. Beat sheet (anchored to words, not seconds)

Anchors are `{word, occurrence}` matches in `metadata.json` `words[]` (occurrence is 1-based; punctuation stripped, case-insensitive). If an anchor isn't found, fail loudly. In-between motion is ambient.

### Act 1 — THE QUESTION (amber)
| Anchor | Visual | Purpose |
|---|---|---|
| frame 0 | A simple block-built character (rectangles: head, torso, two legs; your own design) walks in place at x ≈ 300 on a ground row of 64 px tiles scrolling left. Two far parallax layers (slate hills as rectangles). Large mono counter `DAY 01` above (amber, ~96 px) | Already moving; no intro |
| `long` | Counter starts climbing, accelerating: `day = 1 + floor(79 × easeInCubic(p))`, where p goes 0→1 from frame 0 to the **start** of `eighty` | Time compressing |
| `eighty` | Counter lands on `DAY 80`; scale pulse 1.0 → 1.08 → 1.0 over 0.3 s | The answer lands |
| `Nonstop` | Ground scroll speed +25% for the word's duration | "Nonstop" feels relentless |

### Act 2 — THE MATH (amber)
| Anchor | Visual | Purpose |
|---|---|---|
| `border` (occurrence 1) | Character, ground and counter slide out left (0.4 s); card stack appears. Kicker changes to `02 // THE MATH` | Reset for clarity |
| `thirty` (occurrence 1) | Card 1 pops in: label `BORDER DISTANCE FROM CENTER`, value `29,999,984 BLOCKS` | Number 1 |
| `four` | A `÷` symbol and card 2: label `WALKING SPEED`, value `4.317 BLOCKS/S` | Number 2 |
| `seven` | A `=` symbol and card 3: label `TIME TO WALK`, value `≈ 6.95 MILLION SECONDS` (count-up over 0.6 s) | Result |

Card style: 840 px wide, ~200 px tall, 12 px radius, 1 px slate border, amber value in Anton, mono label. Stack at y ≈ 420, 700, 980.

### Act 3 — THE SCALE (cyan)
| Anchor | Visual | Purpose |
|---|---|---|
| `Sprint` | Cards slide up and out; kicker `03 // THE SCALE` | New act |
| `sixty-two` | Chip: `SPRINT 5.612 BLOCKS/S ≈ 62 DAYS` (amber) at y ≈ 520 | Alternative result |
| `flat` | Footnote (mono, slate, small) at y ≈ 1100: `JAVA EDITION · FLAT GROUND · NONSTOP · 1 BLOCK = 1 M` | State assumptions on screen |
| `thirty` (occurrence 2) | Bar track appears at y ≈ 700; **amber bar** grows left→right (0.6 s), label `MINECRAFT BORDER ≈ 30,000 KM` | The distance |
| `Earth` | **Cyan bar** grows at y ≈ 860 to full track width, label `EARTH'S CIRCUMFERENCE ≈ 40,000 KM` | Real-world comparison |
| `around` + final 0.4 s | Hold, then everything fades; scene returns to the frame-0 composition (character, `DAY 01`) so the Short loops. **No end card, no CTA** | Loop |

Bar geometry: track width 840 px starting at x = 120. The cyan bar is the full track (40,075 km). The amber bar width = `840 × (29,999.984 / 40,075)` ≈ 629 px, **computed from the numbers in code, not hard-coded.**

### Audio
Voice only is a valid output. Optional: a very short soft tick per card appearing (CC0, logged in `shared-assets/LICENSES.md`). If you add SFX, mix with `adelay`/`amix` + `apad=whole_dur`.

## 5. Implementation constraints

- Build as a self-contained custom episode component (`MinecraftEdge.tsx`) unless the generic `<Episode>` / templates from `AGENTS.md` Phase 3 exist. Reuse `theme`/`anim` helpers if present; otherwise inline minimal helpers (`clamp01`, `easeOutCubic`, `easeInCubic`, `easeInOutCubic`, `anim`).
- Keep the recorder hooks from `AGENTS.md` intact. Don't refactor other episodes. No new dependencies without asking.
- Numbers on screen come from a single `FACTS` constant in the component (border blocks, speeds, Earth km) so they can't drift from the math.

## 6. Acceptance checks (run them; show output)

1. `bunx tsc -b` passes.
2. **Math check:** `bun -e "const b=29999984; console.log((b/4.317/86400).toFixed(2), (b/5.612/86400).toFixed(2), (b/4.317/1e6).toFixed(2), (b/1000).toFixed(3))"` prints `80.43 61.87 6.95 29999.984`.
3. Audio generated: valid `metadata.json`; word count 60–75; duration 20–35 s; every anchor in section 4 resolves.
4. `bun run shot` at: frame 0, `eighty` start, each card, `sixty-two`, `Earth`, and the last frame. Show the PNGs.
5. Visual checks: no clipped text, no HUD/label/caption collisions, nothing below y 1536, amber used only for Minecraft numbers, cyan only for real-world facts and kicker 03. Counter shows `DAY 80` at `eighty`. Bar ratio amber/cyan ≈ 0.749.
6. Rendered MP4 probe: 1080×1920, 30 fps, H.264 + yuv420p, AAC 48 kHz, both streams, duration matches the audio.
7. Last frame ≈ first frame composition (loop check).
8. Render twice, compare `ffmpeg -f framemd5`; report whether frames match.
9. `about.txt`: 3 platform caption blocks, a `SOURCES` section (S1–S3, D1–D2 with the assumptions), posting notes, and a suggested pinned comment explaining the math. Packaging **fails while S3 is empty.**
10. `meta.json`: `slug: minecraft-edge`, `series: game-physics`, `hookStyle: question`, `captionStyle: karaoke-dim`, `endCard: false`, measured `durationSec` and `wordCount`.

## 7. Report back with

What you built, deviations (with reasons), each check's output, open questions, and a "Deferred" list. Don't start another episode or refactor.
