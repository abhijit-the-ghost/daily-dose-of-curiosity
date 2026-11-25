# prompt.md — copy/paste prompt library

> Use this with `INSTRUCTIONS.md`. `INSTRUCTIONS.md` says *what must be true*; this file says *what to
> type*. Every prompt ends by writing a file into `episodes/<slug>/`, so nothing lives only in a chat.
>
> **Placeholders** are written `{{LIKE_THIS}}`. Replace them; delete any prompt you don't need.
> **Repo-aware agents** should also read `AGENTS.md` + `INSTRUCTIONS.md` first — each prompt says so
> in one line, so it still works if you paste it into a fresh model with no repo.

---

## 0. The Idea Sheet — fill this once per video

Everything below reads from this. Ten minutes here saves three hours later.

| Field | What goes in it | Uranus example |
|---|---|---|
| `{{SLUG}}` | kebab-case, permanent | `uranus-tilted-sideways` |
| `{{SUBJECT}}` | the thing, in 3 words | `Uranus' 98° tilt` |
| `{{BELIEF}}` | what a normal person assumes | "planets spin upright" |
| `{{SHIFT}}` | what they'll believe after | "one planet rolls, and that decides its seasons" |
| `{{CONTRADICTION}}` | one line, no jargon | "Every planet spins like a top. Uranus rolls." |
| `{{NUMBER}}` | the ONE number shown on screen | `97.77°` (then `42 years`) |
| `{{PROOF}}` | how the number is *shown*, not said | the axis visibly tipping from 0° to 98° |
| `{{COUNTER}}` | strongest objection | "giant impact is a model, not observed" |
| `{{SOURCE}}` | where the claim comes from | NASA Uranus Facts page |
| `{{QUESTION}}` | would-you-rather the viewer answers | "42 years of dark or 42 of light — which breaks you?" |
| `{{SERIES}}` | visual family: `cosmic` / `game-physics` / `star-scale` | `cosmic` |
| `{{HOOK_STYLE}}` | `contradiction` / `question` / `number` / `claim` | `contradiction` |

If `{{PROOF}}` is empty, **stop** — you have a lecture, not a video.

---

## 1. Session starters

### P0a — Start a new episode

```
You are working in my video repo. Read AGENTS.md (hard rules), then INSTRUCTIONS.md (pipeline +
gates), then prompt.md. Obey AGENTS.md §2 above everything.

New episode: {{SLUG}}
Idea Sheet:
- subject: {{SUBJECT}}
- belief → shift: {{BELIEF}} → {{SHIFT}}
- contradiction: {{CONTRADICTION}}
- number to show: {{NUMBER}}
- how it's shown: {{PROOF}}
- counter-argument: {{COUNTER}}
- source: {{SOURCE}}
- viewer question: {{QUESTION}}
- visual family: {{SERIES}}
- hook style: {{HOOK_STYLE}}

Do only Stage 1 and Stage 2 from INSTRUCTIONS.md right now: grill it (P2), then write
episodes/{{SLUG}}/brief.md, script.txt, sources.md, facts.ts. Do not write scene code yet.
Stop after the files exist and show me the script + the source map.
```

### P0b — Resume / fix an existing episode

```
Read AGENTS.md, INSTRUCTIONS.md, then open episodes/{{SLUG}}/ (brief, script, scene.json, meta.json).
Tell me, in a table, which INSTRUCTIONS.md gates currently FAIL for {{SLUG}} and which are
unverifiable without a render. Do not change any code yet.
```

---

## 2. P1 — Idea generation (when you have nothing)

```
Act as a short-form science writer for a faceless vertical channel. Format is locked, topic is open.

The format is always: a belief people hold → a contradiction → the mechanism → ONE number shown on
screen → a would-you-rather question for the comments. 55–75 spoken words, 24–32 seconds.

Give me 10 ideas. For each, one line each:
subject | the belief | the contradiction in one sentence | the ONE number | how that number is
VISUALLY shown (no "a text label") | the strongest objection | a would-you-rather question |
how confident you are that a reliable primary source exists.

Rules:
- No "did you know", no listicles, no "top 5". One idea per video.
- The number must be showable with dots, a bar, a counter, a scale comparison, or a measurement line.
- Reject anything where the visual would just be a labelled diagram.
- Rank them by "would a stranger stop scrolling with the sound off".

Then take the top 3 and tell me what would make me regret each one.
```

---

## 3. P2 — Grill the idea (the gate)

Run this **before** any script. This is the `grilling` skill applied to the Idea Sheet.

```
Grill this video idea relentlessly. Do not be encouraging. My default failure mode is making a
correct, boring explainer that people swipe past at second 3.

Idea:
- subject: {{SUBJECT}}
- belief → shift: {{BELIEF}} → {{SHIFT}}
- contradiction: {{CONTRADICTION}}
- number: {{NUMBER}} / shown as: {{PROOF}}
- counter-argument: {{COUNTER}}
- source: {{SOURCE}}
- question: {{QUESTION}}

Ask me these 12, one at a time, and refuse to move on until each answer is concrete:
1. What does the viewer believe before, and after? Same sentence = kill it.
2. State the contradiction in one line without jargon.
3. What is the one number, and can I SEE it change on screen?
4. Describe the frame that proves it with the audio muted. If it needs words, it fails.
5. What is the strongest counter-argument, and is the video honest about it?
6. Which primary source did I actually open? No source = no video.
7. What will someone argue with in the comments? Nothing = no comments.
8. What is the second-best moment, after the hook?
9. Can the last line point back at the first?
10. Is this one idea or three? Cut to one.
11. Which of my existing episodes does this repeat?
12. Ship test: what is on screen in frame 1, described as a picture?

Then output a verdict: SHIP / REWORK / KILL, with the two changes that would move it from REWORK to
SHIP. Write the agreed answers to episodes/{{SLUG}}/brief.md.
```

**Gate:** you cannot answer Q3 with a word. If your answer is "the caption says 42 years", the idea
is not ready.

---

## 4. P3 — Script, sources, facts

```
Write the narration for episodes/{{SLUG}}/script.txt from this brief.

Constraints:
- 55–75 words total, 24–32 seconds at en-US-AriaNeural +12%.
- Three blocks: HOOK (10–20 words) / ESCALATION (20–30) / PAYOFF (15–25).
- Write comma-linked clauses, NOT five short sentences — short sentences create dead air between
  TTS lines and I need ≤10% silence in the final mix.
- Hook must state the contradiction in the first 6 words. No "did you know", no wind-up.
- Payoff must show the number, then restate the hook's idea in one closing line that loops.
- Hedge anything that is a model or estimate ("astronomers think", "likely").
- Every factual sentence gets an inline marker [src: S1] / [src: S2].
- No superlative that isn't in a source ("the most extreme", "the biggest ever").

Then write:
1. episodes/{{SLUG}}/sources.md — S1..Sn → title, publisher, URL, the exact sentence each supports.
2. episodes/{{SLUG}}/facts.ts — every number that appears ON SCREEN as
   { value, display, src }, e.g. axialTiltDeg: { value: 97.77, display: '97.77° TILT', src: 'S1' }.
3. episodes/{{SLUG}}/meta.json — slug, series, title, hook, hookStyle, captionStyle: "phrase",
   endCard: false, question, questionAt (guess), pinnedComment, wordCount, durationSec: 0,
   posted: { tiktok: null, youtube: null, instagram: null, facebook: null }.
   `phrase` is implemented (INSTRUCTIONS.md §16): 3 words per chunk, no grey upcoming words.

Rules: never invent a citation, never paraphrase a number you have not verified, and if a claim has
no source tell me instead of writing it. Then print the word count and the estimated duration.
```

**Gate:** `uv run --with edge-tts,mutagen python scripts/generate_audio.py {{SLUG}} --dry-run`
reports 55–75 words and 20–35 s.

---

## 5. P4 — Beat plan (this is the actual video)

```
Turn episodes/{{SLUG}}/script.txt into a beat plan for a 1080×1920, 30fps, 24–32s video.
This is the most important artefact — the picture, not the words.

Hard rules from INSTRUCTIONS.md §5:
- ≥12 beats, strictly increasing `at`, gap between beats ≤2.5s.
- Each beat changes EXACTLY ONE of: claim chip text, ground colour, camera scale, a number, a shape.
- Exactly ONE visual proof (counter / dot grid / bar / measure line) — not three.
- Exactly ONE question beat, placed at 40–60% of runtime.
- The hero object must exceed 55% of frame width at least once.
- ≥2 full-bleed ground colour changes.
- The final beat lands on the loop line so the last frame ≈ the first frame.

Output:
1. episodes/{{SLUG}}/scene.json with "beats": [...], "palette": {...}, "coverTitle": "3–5 words, one
   number", "endCard": false, "tail": 0.35.
2. A markdown table of the same beats with columns: t | kind | what changes | what the viewer sees |
   which caption words are on screen.
3. A one-line list of every SFX event and where it lands (hook hit, number landings, riser into payoff).

Then criticise your own plan: name the two longest stretches where nothing changes and fix them.
```

**Gate:** read the table out loud and count the beats. Under 12 → the video will be skipped.

### P4b — Hook-only stress test (cheap, run it before you build)

```
Here is my first 3 seconds as a shot list:
{{PASTE_BEATS_0_TO_3}}

Judge it as a stranger scrolling with the sound off:
1. What is on screen in frame 1, and is it obviously the subject?
2. Is there a reason to stay past second 3, stated as a picture rather than a caption?
3. Does anything on screen read as "slide" or "diagram"?
4. Would a bigger version of the hero object fix more than adding text would?
Give me 3 swaps ranked by how much they'd improve the 3-second hold. No praise, just swaps.
```

---

## 6. P5 — Build prompt (give this to the coding agent)

```
Implement the episode {{SLUG}} exactly per episodes/{{SLUG}}/scene.json and INSTRUCTIONS.md §5–§7.

Read first: AGENTS.md §2, INSTRUCTIONS.md §5–§7, src/theme/tokens.ts, src/motion/anim.ts,
src/components/Episode.tsx (the REGISTRY), and one existing Acts file (UranusTiltedSidewaysActs.tsx)
for house style.

Rules:
- The scene is a pure function of t. No Math.random outside seeded factories, no setInterval, no CSS
  infinite, no Motion. Camera moves come from beats, not from a global sin() wobble.
- Respect the safe box x 60–1020, y 170–1536. Nothing below y 1536.
- Max 3 text zones per frame. No timecode. No badge + kicker + headline + subline + caption stack.
- Captions: 1–3 words, cap height ≥65px at 1080, no grey upcoming words (use the `phrase` style).
- Motion: entrances 0.35–0.5s easeOutCubic, stagger 80ms, per-beat camera 0.5–0.9s easeInOutCubic,
  ambient drift 2–4% ON TOP of the beats.
- Add the primitives you need to src/templates/primitives/ only if a second episode will use them.
- Complete the 15-file registration checklist in INSTRUCTIONS.md §7.4.
- Do not touch any existing episode's output.

Deliver: bunx tsc -b passes; stills at 0,2,4,7,10,13,16,19,22,25,28 show a DIFFERENT frame each time
and ≤3 text zones. Show me the stills before you claim it's done.
```

---

## 7. P6 — On-screen caption check

On-screen captions are never hand-written: they come from `WordBoundary` timings in
`public/audio/{{SLUG}}/metadata.json`. This prompt checks that the *rendering* of those words is
readable, instead of retyping them.

```
Audit the on-screen captions for {{SLUG}} against INSTRUCTIONS.md §5 H7 and §6.2.

Inputs: public/audio/{{SLUG}}/metadata.json (words + start/end) and stills at 10 timestamps.

Report a table: timestamp | words on screen | chunk size | rendered cap height (px) | zone count |
overlaps HUD? | fails any rule?

Flag specifically:
1. Any chunk with >3 words.
2. Any chunk visible >2.0s (a caption that lingers is a frozen frame).
3. Any word split awkwardly for reading (e.g. a chunk that starts mid-phrase).
4. Any cap height <65px or any caption crossing x 60 / x 1020 / y 1536.
5. Any grey/dim upcoming words.

Do not rewrite the script. If a chunk is wrong, fix the chunker or the style, and say which.
```

---

## 8. P7 — Social captions (the post copy)

This is the one you use per video, per platform. It produces `about.txt` in the packaged layout.

```
Write the post copy for {{SLUG}} for four platforms. Same video, four caption files.

Source material: episodes/{{SLUG}}/script.txt, sources.md, meta.json (question, pinnedComment).
Do not contradict the script. Do not add a claim that isn't in sources.md.

Platform rules (INSTRUCTIONS.md §11.2):
- TikTok    — first line = the contradiction; 1–2 sentences; 3–5 hashtags; sources at the end.
- Instagram — first line = the question; 1–2 sentences; 3–5 hashtags; sources at the end.
- Facebook  — first line = the question; 1–2 sentences; 0–3 hashtags; sources at the end.
- YouTube Shorts — first line = the contradiction, ≤90 characters; 1–2 sentences; 3–5 hashtags;
  sources at the end.

Every version must include:
1. A question a stranger can answer in under 2 seconds (default: would-you-rather, D2).
2. "Narration uses an AI-generated voice." (disclosure — keep it, it costs nothing and it's honest)
3. A SOURCES block copied from sources.md, one line per source.

Do NOT: ask for likes/follows as a trade, write "comment YES", use emoji walls, or use more than one
emoji per caption.

Also give me:
- one pinned comment version of the question (≤120 chars, no hashtags)
- three alternative first lines per platform I can A/B later

Write the result to results/videos/{{SLUG}}/about.txt with sections: TIKTOK / INSTAGRAM / FACEBOOK /
YOUTUBE SHORTS / PINNED COMMENT / SOURCES.
```

### P7b — Quick captions only (no repo, paste into any model)

```
Write TikTok, Instagram Reels, Facebook Reels and YouTube Shorts captions for a 30-second vertical
science video.

Topic: {{SUBJECT}}
The contradiction: {{CONTRADICTION}}
The number shown: {{NUMBER}}
Sources: {{SOURCE}}
The viewer question: {{QUESTION}}

Format per platform — first line (scroll-stopping), then 1–2 sentences, then 3–5 hashtags, then
"Sources: …", then "Narration uses an AI-generated voice."
Rules: no engagement bait, no emoji walls, max one emoji, no claims beyond the sources above,
first line under 90 characters for YouTube. Add one pinned-comment version of the question.
```

---

## 9. P8 — Cover copy and layout

```
Design the cover for {{SLUG}}.

Constraints (INSTRUCTIONS.md §10):
- One 1080×1920 master. Everything is a crop of it.
- coverTitle: 3–5 words, exactly one number, zero punctuation. Different words from the video title.
- Title stays inside y 240–1680 (survives the 3:4 profile-grid crop) and x ≤ 900 (feed right rail).
- Bottom 672px and top 270px carry no text (Meta Reels safe margins).
- One visual: the hero object OR the number. Never both plus a label.
- Dark ground + one saturated accent. Contrast ≥7:1. Accent used once.
- Readable at 20% zoom — that's the real size.

Give me 3 cover concepts as: title text | the one visual | accent colour | where the eye lands first
| why it survives the 3:4 crop. Then pick one and tell me what would make it fail.

Output the chosen title into episodes/{{SLUG}}/scene.json as "coverTitle".
Then list the render targets that must exist after `bun scripts/render_cover.mjs --episode {{SLUG}}`:
tiktok / reels / fb (1080×1920), shorts (2160×3840), grid (1080×1440), feed (1080×1350) — plus the
1280×720 long-form thumb only if a long-form cut exists.
```

---

## 10. P9 — After the render: review, don't vibe

```
Review the rendered {{SLUG}} against INSTRUCTIONS.md §9. Run the actual commands and paste the raw
numbers — do not estimate. First run:
`bun scripts/qa_metrics.mjs --slug {{SLUG}} --out episodes/{{SLUG}}/qa.md`
(use `--video output/<test-file>.mp4` if the file is not the canonical output).

Compute and report in a table with PASS/FAIL against the §9 targets:
1. motion energy (fps=15 tblend difference, mean YAVG) and frozen share
2. mean luma and luma range
3. integrated loudness (ebur128) and true peak
4. silence total % and longest gap (silencedetect -35dB:0.25)
5. duration, resolution, fps, codec, pixel format, sample rate
6. stills at 10 timestamps: count text zones and the longest unchanged stretch

Then answer only these:
- What is the single worst 2-second stretch, and what beat is missing there?
- Which change would move the most people past second 3?
- What is the ONE variable we change for the next video (INSTRUCTIONS.md: one variable per video)?

Write the numbers to episodes/{{SLUG}}/qa.md. Do not tell me it "looks good".
```

---

## 11. P10 — Post-ship decision (after 48 h)

```
Here are the 48-hour numbers for {{SLUG}}:
views {{VIEWS}} | avg % viewed {{AVG_PCT}} | 3s hold {{HOLD3}} | swiped away {{SWIPE}} | comments
{{COMMENTS}} | saves {{SAVES}}

Compare against the previous video ({{PREV_SLUG}}) and tell me:
1. Which gate from INSTRUCTIONS.md §9 does this data point at as the weak one?
2. Did the caption question get answered? Are the comments on-topic or generic?
3. Was the one changed variable the right one to test?
4. The single change for the next video — and it must be one, not a list.

Ignore the absolute view count. Only ratios matter at this stage. Be blunt.
```

---

## 12. Cheat sheet — which prompt when

| You have… | Run | Output |
|---|---|---|
| nothing | P1 | 10 ranked ideas |
| an idea | P2 | verdict + `brief.md` |
| a passing brief | P3 | `script.txt`, `sources.md`, `facts.ts`, `meta.json` |
| a script | P4 → P4b | `scene.json` beats + hook test |
| a beat plan | P5 | the scene code |
| a running episode | P6 | caption audit |
| a rendered video | P7 | four platform captions |
| a video + covers | P8 | cover title + seven targets |
| a render | P9 | `qa.md` numbers |
| 48 hours of data | P10 | next change (one) |

**The only two prompts that must never be skipped:** P2 (grill) and P9 (measure). Skipping P2 gives
you a correct, boring video. Skipping P9 gives you the same video again next week.
