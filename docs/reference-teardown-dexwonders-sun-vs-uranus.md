# Reference teardown — @dexwonders "Sun / 1.3 million Earths" vs. your Uranus episode

Date: 2026-11-25
Reference: https://www.tiktok.com/@dexwonders/video/7711900373165804801 (29.4 s)
Compared against: `results/videos/uranus-tilted-sideways/video.mp4` (26.8 s)

Everything below is measured from the two MP4s (commands in §7) or read off decoded frames.
Opinion is labelled as opinion.

---

## 1. TL;DR

Same idea, same length, same voice style, same "sources in description" habit. The reference is not
winning on script or on production budget — it's winning on **how much changes per second** and on
**how big things are on screen**.

| | Reference | Uranus | Gap |
|---|---|---|---|
| Visible change per second (frame-diff energy) | 2.17 | 0.47 | **4.7×** |
| Share of runtime that is visually frozen | 0 % | **18 %** | — |
| True silence in the audio | 0.8 s (2.6 %) | **7.8 s (29 %)** | — |
| Integrated loudness | −15.2 LUFS | −20.6 LUFS | **−5.4 dB** |
| Mean frame brightness | 73 | 33 | **2.2× darker** |
| Hero object width vs. frame | 100 %+ (bleeds off) | 21 % | — |
| Simultaneous text zones | 2 | 5 | — |
| Caption words per chunk | ~2 | ~5 | — |

Your video is technically correct, on-spec, and deterministic. It reads as a **slide with a
voiceover**. The reference reads as **one continuous camera move through an argument**. That is the
whole difference.

---

## 2. Difference table

### 2.1 Structure & pacing

| Dimension | Reference | Your Uranus | Why it matters |
|---|---|---|---|
| Composition model | One continuous world; the camera inside it moves | 3 acts = 3 separate `<g>` groups that fade in and then sit | Fades between static compositions look like slides |
| Number of distinct visual states | ~14 in 29 s (≈ every 2.1 s) | ~6 in 26.8 s (≈ every 4.5 s) | Every state change is a new reason to keep watching |
| Longest stretch with a frozen picture | < 1 s | **4–6 s** (Act 2 "giant impacts" and Act 3 "42 years" both sit still) | This is where people swipe |
| Hard cuts | 0 | 0 | Neither uses cuts — so cuts are not the answer, *motion* is |
| Recurring anchor | The sun sprite never leaves; it scales, recolors, gets measured | The Uranus sprite never leaves, but never changes size or context | Continuity is good — but continuity without transformation is a still image |
| Ending | Last line restates the opening number → seamless loop | Branded end card + confetti + **1.45 s of silence** | The end card buys a logo at the cost of the loop and the last impression |

### 2.2 On-screen instrumentation

| Dimension | Reference | Your Uranus | Why it matters |
|---|---|---|---|
| Top element | A chip that carries **the claim being tested**: `GIANT?` → struck through with a red line → `100 EARTHS WIDE` → `MEDIUM-SIZED` → `A RED SUPERGIANT` → `1.3M EARTHS` → `ONLY AVERAGE` | A badge (`COSMIC TELEMETRY // URANUS`) + a running timecode `TC 00:00:17:15` | Their top bar does narrative work every 2 s. Yours is decoration that never changes |
| Numbers | Rolling counter `147,661 → 1,266,300 → 1,300,000`, dot grid of 1.3 M Earths, 99.8 % proportion bar | `~42 YEARS` sits in a chip; never counts, never compares | A number that *moves* is the single cheapest way to feel produced |
| Labels tied to the visual | `EARTH` dot on the sun's edge, diameter line, `MARS ORBIT` dotted ring, `OUR SUN` marker | `URANUS` label, `~42 YEARS SUNLIGHT` / `~42 YEARS DARKNESS` chips floating in empty space below the planet | Their labels annotate geometry. Yours sit in a void, disconnected from the object |
| Big background typography | Ghosted `100x`, `1.3M`, `99.8%`, `MEDIUM`, `MARS`, `AVERAGE` at ~15 % opacity | none | Free richness that never competes with captions |
| Progress bar | none | yes (`17s / 26s`) | **Keep this.** It's a real retention device the reference doesn't have |

### 2.3 Typography & layout

| Dimension | Reference | Your Uranus | Why it matters |
|---|---|---|---|
| Simultaneous text zones | 2 (one chip, one caption) | **5** (HUD badge, timecode, kicker chip, headline, subline, caption) | At phone size, five small labels read as noise |
| Caption chunk | 1–3 words, one line, huge, white, centered, drop shadow | 5–7 words, one line, full width, `Anton` caps with karaoke-dim grey | 2-word chunks are read instantly; 6-word lines require a saccade mid-word |
| Caption size | cap height ≈ 7.5 % of frame width | ≈ 4 % of frame width | **~1.7× smaller** than the reference |
| Karaoke dim | none — the current words are the only words | upcoming words shown at ~40 % grey | Grey text lowers contrast on the most important element, and adds a second reading task |
| Secondary type | one weight family, sentence case, rounded | `ui-monospace` all-caps, 17–28 px, letterspaced | Mono micro-caps at 1080p is a *dashboard* voice, not a *story* voice |
| Dead space | full-bleed backgrounds, no empty zones | ~40 % of frame is empty; the `~42 YEARS` chips float in a black field at y≈1150 with nothing around them | Empty space reads as unfinished, not as restraint |

### 2.4 Colour, light, texture

| Dimension | Reference | Your Uranus | Why it matters |
|---|---|---|---|
| Background | Changes per beat: navy starfield → **full-bleed sun orange** → full-bleed red → navy | Constant `#030712` navy for 26.8 s | Changing the ground colour is the strongest signal that "something happened" |
| Mean luma | 73 (range 38–109) | 33 (range 26–38) | Your entire video lives in a 12-level brightness band: flat, dim, and after H.264 it bands |
| Hero fill | Textured: mottled sunspots, corona spikes, soft outer bloom | One radial-gradient sphere + 5 thin band ellipses | Gradients alone read as an icon; texture reads as a render |
| Contrast strategy | Few, very strong shapes | Many thin 1.5–3 px strokes on near-black | Thin light strokes on dark = the first thing compression destroys → looks soft / low-res |

### 2.5 Audio

| Dimension | Reference | Your Uranus | Why it matters |
|---|---|---|---|
| Integrated loudness | −15.2 LUFS | −20.6 LUFS | 5.4 dB quieter than the feed around it. Reads as "amateur upload" |
| Silence between sentences | 0.34 s once, 0.44 s tail | **9 gaps**, 0.32–1.45 s, 7.8 s total | 29 % of your runtime is near-silent. Nothing fills it — no bed, no SFX, no room tone |
| Sentences per script | Long, continuous, comma-linked | 5 short sentences, each followed by an edge-tts breath | Sentence-splitting literally creates the dead air you can hear |
| SFX | implied by visual pops (can't verify in the file) | 1 SFX, at the follow CTA only | Beat-synced ticks/pops are the cheapest "produced" signal there is |

---

## 3. Why your video *feels* low quality

Not a rendering bug. Six compounding causes:

1. **Nothing moves.** 18 % of frames are effectively static and the global camera is
   `1.01 + 0.01·sin(t·0.22)` — a 1 % scale wobble over 28 s. That is below the perceptual threshold,
   so the brain files the frame as a still image. Three text pops per act don't count as motion.
2. **Everything is small.** The planet is 224 px wide in a 1080 px frame. The sun in the opening act
   is 108 px. In the reference the subject routinely exceeds the frame width and gets cropped — that
   is what makes it feel like a camera is *in* the scene.
3. **Five text layers compete.** HUD + timecode + kicker + headline + subline + caption. Each is
   individually defensible; together, at 1080×1920 on a 6" screen, they read as a spec sheet.
   A viewer can track two things at once.
4. **It's dark and flat.** Mean luma 33 with a 12-level range. Dark gradients + thin strokes +
   CRF 18 = banding and mush. The encoder only spent 1.05 Mbps because there was almost nothing to
   encode — the low bitrate is a *symptom* of the static picture, not a cause.
5. **It's quiet and full of holes.** −20.6 LUFS with 7.8 s of true silence. The viewer's
   subconscious verdict is "unfinished", even if they can't say why.
6. **Nothing is proven.** Uranus is explained with a label and two chips. The reference *shows* you
   1.3 million Earths as a growing grid of dots and a counter that climbs. A visual proof is what
   separates "educational" from "interesting".

What it is **not**: resolution (you're 1080×1920, they're 576×1024 — you win), frame rate, codec,
script length, voice quality, or sources. Don't fix those.

---

## 4. What to change, in order

### Tier 1 — this week, no architecture change (~1–2 h, biggest ratio)

1. **Loudness.** Two-pass `loudnorm` to **−14 LUFS** (TikTok/Reels target) in
   `scripts/render_video.mjs`. One flag, +5.4 dB of presence.
2. **Fill the holes.** Either write the script as one paragraph with commas instead of 3 sentences
   per act, or add a −30 dB ambient/music bed via the existing `sfx.json` mix path. Target
   **< 10 % true silence**. Verify with `silencedetect`.
3. **Turn the end card off** for the next episode (`"endCard": false`). Recovers ~1.5 s, removes the
   dead tail, and lands the last line on the loop point. Note: `UranusTiltedSidewaysActs.tsx` header
   still says `endCard false` while `scene.json` says `true` — pick one and make the header honest.
4. **Caption style `phrase`** (already an open Phase 5 item): 2–3 words max, centered,
   **~1.7× larger**, no grey upcoming words. This single change is probably worth more than
   everything else here.
5. **Kill the timecode**, keep the progress bar.

### Tier 2 — the structural fix: a beat timeline instead of acts (~1 day)

Your act model is `act → fade in → pop 2–3 texts → hold`. The reference is a **beat list**. Give
`scene.json` a beat timeline and let one renderer walk it, still a pure function of `t`:

```jsonc
// episodes/<slug>/scene.json
"beats": [
  { "at": 0.0, "kind": "chip",   "text": "SMALL?", "strikeAt": 3.2 },
  { "at": 3.4, "kind": "measure", "label": "EARTH", "from": 0.2, "to": 0.55 },
  { "at": 5.8, "kind": "chip",   "text": "4× WIDER THAN EARTH" },
  { "at": 7.0, "kind": "dots",   "count": 63, "label": "EARTHS ACROSS" },
  { "at": 9.0, "kind": "camera", "scale": 1.35, "to": [0.5, 0.42] },
  { "at": 11.0, "kind": "palette", "ground": "ice", "bleed": true },
  { "at": 19.0, "kind": "bar",   "value": 0.42, "label": "OF ITS ORBIT IN DARKNESS" }
]
```

Rules that make it feel like the reference:

- **One beat every 1.5–2.5 s.** Budget the video: `duration / 2` beats minimum.
- Each beat changes **exactly one** of: chip text, ground colour, camera scale, a number, a shape.
- The chip is the argument tracker — it must never show a decorative string.
- The camera never rests at 1.0 of the same framing for more than ~2 s. Scale beats
  (1.0 → 1.35 → 2.1 → 0.9) are what create depth without cuts.
- Ground colour flips full-bleed at least twice (navy → accent → navy).

### Tier 3 — build these six primitives once (`src/templates/primitives/`)

These are the reusable "produced look" components. Each is a pure `t → frame` function, so they fit
the determinism rule and can be dropped into any episode:

| Primitive | What it does | Reference moment it reproduces |
|---|---|---|
| `<Counter to={1_300_000} at={9} dur={1.2} format="comma" />` | rolling number, eased, optional tick SFX | `147,661 → 1,266,300 → 1,300,000` |
| `<DotGrid count={400} cols={22} revealAt={10.4} stagger={0.004} />` | grid that fills in, one dot per frame-ish | 1.3 M Earths |
| `<ProportionBar pct={0.998} label="OF THE SOLAR SYSTEM'S MASS" />` | bar that grows to the value | 87.3 % → 99.8 % |
| `<MeasureLine from to label="100 EARTHS WIDE" />` | dimension line + label + dashed ticks | diameter line, `MARS ORBIT` ring |
| `<Chip state="=> GIANT? (struck)" />` | argument chip w/ strike-through / swap animation | the `GIANT?` → red strike |
| `<FullBleed ground="orange" bleed={0.9} />` | flat/radial full-bleed ground per beat | sun interior, red supergiant |

Plus two infrastructure pieces:

- **`<Camera>`** — a wrapper that applies `scale`/`translate` per beat with `easeInOutCubic` and
  lets foreground/background move at different rates (real parallax instead of a global sine).
- **Grain/dither overlay** — a 3–5 % noise layer at 2 fps over dark gradients. Kills banding and
  makes flat SVG look rendered. Deterministic if you precompute the noise field.

### Tier 4 — content patterns worth stealing

- **Frame the script as a contradiction the video resolves.** Theirs: "you might think the Sun is
  giant" → `GIANT?` crossed out → "it's only average". Yours explains a tilt; it never sets up a
  belief to knock down. Your `hookStyle: "contradiction"` is declared in `meta.json` but the visual
  never *contradicts* anything.
- **Prove one number.** Each episode should have exactly one number the viewer can *see*
  (a grid, a bar, a counter, a scale compare).
- **Bookend the hook.** Last line = first line's number, restated as the answer. Gives the loop.
- **A "you are here" scale marker.** Their mascot does this; you don't need a character — a small
  Earth dot labelled `EARTH` next to Uranus gives the same service for free. This is on-brand for
  `cosmic` and costs ~10 lines.

---

## 5. What NOT to copy

- The `99 8 percent` caption (they drop the decimal — that's a bug in their text pipeline).
- 576×1024 output. You're already better.
- The empty bottom third. Their captions sit at ~63 % height, which leaves a weird void. Keep your
  caption in the safe area (`yMax 1536` per `AGENTS.md`).
- No progress bar. Yours helps.

---

## 6. Suggested experiment ladder (one variable per video, per AGENTS.md §5 Phase 6)

Do **not** ship all of Tier 1 in one video — you'll learn nothing. Suggested order, each one
isolated and recorded in `meta.json`:

| # | Video changes | Hypothesis | Read at 48 h |
|---|---|---|---|
| 1 | `captionStyle: phrase` only | Bigger, shorter captions raise hold | avg % viewed |
| 2 | + loudness −14 LUFS only | Presence raises hold in the first 3 s | 3 s hold |
| 3 | + beat timeline (Tier 2) | Doubling visual change rate raises avg % viewed | avg % viewed |
| 4 | + one number-proof primitive | Proof beats explanation | avg % viewed + rewatches |
| 5 | + `endCard: false`, loop-safe ending | Loops raise rewatch → reach | rewatch rate |

Record which of the five each video changed in `meta.json`, then `bun run stats report` will actually
be able to tell you something.

---

## 7. How to reproduce the measurements

```powershell
# 1. loudness
ffmpeg -i <file> -af ebur128 -f null -          # read "I: ... LUFS"

# 2. dead air
ffmpeg -i <file> -af "silencedetect=n=-35dB:d=0.25" -f null -

# 3. motion energy (higher = more visually alive)
ffmpeg -i <file> -vf "fps=15,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null -

# 4. brightness over time
ffmpeg -i <file> -vf "fps=5,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null -

# 5. contact sheet for eyeballing
ffmpeg -i <file> -vf "fps=1,scale=360:640,tile=5x3" -frames:v 1 sheet.png
```

Reference values measured on 2026-11-25:
`motion 2.174 · luma 73.2 (38–109) · −15.2 LUFS · silence 0.78 s`
Uranus values:
`motion 0.465 · luma 33.5 (26–38) · −20.6 LUFS · silence 7.79 s`

---

## 8. One-paragraph version

Your Uranus video is a correctly-built, on-spec, static diagram that is explained out loud. The
reference is the same facts delivered as a moving camera through a changing world where every two
seconds the ground colour, the claim chip, or a number changes, and the number is *shown* rather than
described. Close the gap in this order: −14 LUFS, fill the 7.8 s of silence, 2-word huge captions,
kill the end card, then give every episode a beat timeline with a camera and one visual proof.
