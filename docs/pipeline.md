# From a prompt to a finished video — how this pipeline works

How one idea becomes a finished `results/videos/<slug>/{video.mp4, about.txt, meta.json}` package in
**Daily Dose of Curiosity** — from the raw prompt you give me to the exported short.

This is the *step-by-step reproduction guide*; the design rules and reasoning live in
`AGENTS.md`, `README.md` and `VIDEO_PRODUCTION.md`. Everything here is what actually runs on this
machine (Windows 11, bun, PowerShell) as of 2026-11.

---

## 0. The one-sentence version

**Prompt → episode folder → script → TTS (voiceover + word timings) → React/SVG scene (starts on a screenshot) → headless render loop → ffmpeg encode → QA gates → package.**

Nothing is edited by hand in a video editor — the whole visual stage is a pure function of time `t`.

---

## 1. You give a prompt, we turn it into an episode folder

A new idea becomes `episodes/<slug>/`. Examples from this repo: `touch-and-feel` (the "atoms never
touch — how do you feel a table?" follow-up), `everest-challenger-deep`.

The scaffold is:

```
episodes/<slug>/
  brief.md    ← the plan, art direction, beat sheet, fact table (the IDEA BATCH format)
  script.txt  ← the locked narration (60–75 words, 3 acts)
  facts.ts    ← every on-screen number (single source of truth)
  scene.json  ← kicker text, series, endCard flag, anchors ({word: occurrence})
  meta.json   ← posting metadata (tiktok/IG/YT) — re-written after render
  sources.md  ← one row per `[src:]` marker; human-verification gate
```

`docs/brief-template.md` is the skeleton; `touch-and-feel/brief.md` is the worked example (art
direction, palette, coordinates computed from FACTS, layers, beat sheet, decisions and risks).

Two rules dominate the scaffold:

- **No claim leaves the source list** — if a number or claim appears on screen or in VO, it lives in
  `facts.ts`/`sources.md` first, or it doesn't exist.
- **Adopt the series, don't invent a new one.** Current series: `cosmic`, `science`, `game-physics`
  (tags in `src/theme/series.ts`). New series need your sign-off.

---

## 2. `script.txt` — the source of truth for everything timed

Format:

```
// ACT 1 — THE QUESTION
Someone asked: if atoms never touch, how do you feel a table? [src: ls, wtamu]

// ACT 2 — THE CHAIN
... (~60–75 words total, in thirds per act)

// ACT 3 — THE VERDICT
...
```

Parsed by `scripts/generate_audio.py` with three machine contracts:

- **Word budget 60–75 tokens** (`WORDS_RE`, hyphenated words = 1 token). If exceeded it prints a
  warning and **refuses to silently adjust** — you fix the script, never the timings.
- **3 act markers** `// ACT N — ...` — comments/flags are stripped, act boundaries are derived from
  each act's token count — never hand-tuned. If the token split would overflow the spoken stream, it
  falls back to an even split and prints a warning.
- **`[src: tag]` markers are stripped from the narration** but kept as the audit trail for
  `sources.md`.

Voice: `en-US-AriaNeural` (`+12%` rate by default) — set per episode in `scene.json`
(`voice`/`rate`/`tail`) if ever overridden.

**Never hand-edit `metadata.json`.** Regenerate with `bun run generate:<slug> --force`.

---

## 3. `facts.ts` — every on-screen digit

```ts
// episodes/<slug>/facts.ts
export const FACTS = {
  meissnerHz: { value: 40, display: '40–60 Hz',   src: 'pmc' },  // ←3 numbers, display must contain `value`
  pacinianHz: { value: 100, display: '100–300 Hz', src: 'pmc' },
} as const
```

Scenes render **only** `FACTS.x.display`. Never literals like `"40–60 Hz"` in scene code.
`scripts/verify.ts` checks `display` ⊇ `value` (digits) for every entry — a new fact entry is
mandatory if the script says a new number.

---

## 4. `sources.md` — the claim gate (the most important file)

One table row per `[src:]` tag in the script: which page, what it supports, opened by whom, and
whether a human still needs to confirm it. The rule: every claim visible in VO or on screen is a
row. The agent may open pages (web fetch) but **the human is the final confirm** — every packaged
video so far ships with `NEEDS HUMAN CONFIRMATION` markers here; treat it as a posting-time blocker,
not a style choice. Fabricating or "recalling" a source is the #1 no-go in this repo
(see `docs/brief-template.md` for the full rule and `docs/risks.md`).

---

## 5. VO generation → `metadata.json` (the heart of the pipeline)

```bash
bun run generate:touch-and-feel        # or: uv run --with edge-tts,mutagen python scripts/generate_audio.py <slug>
```

`scripts/generate_audio.py` does, in order:

1. Parses + cleans the script (strips comments & `[src:]`), splits by `// ACT N` markers, counts
   tokens per act. **Fails** if word-count is outside 60–75 (redirects to fix the script-file, not
   the tokens) or act split would overflow words.
2. Calls **edge-tts** (`en-US-AriaNeural`, rate +12%, `boundary="WordBoundary"`) — voice model
   choice, rate and tail pad come from `scene.json` if present, else defaults.
3. Streams the MP3 to disk while capturing **WordBoundary events** (`offset`, `duration`). If zero
   WordBoundary events arrive, it **stops** and refuses the placeholder fallback —
   this is why timings are never hand-written.
4. Pads the audio with an `apad` `whole_dur` tail (2.0 s default; `touch-and-feel` uses 1.0 s) so
   the Short holds a beat of silence instead of cutting the last word off.
5. Emits `public/audio/<slug>/metadata.json`:

```jsonc
{
  "title": "...",
  "voice": "en-US-AriaNeural",
  "rate": "+12%",
  "actBreakdown": [ { "id": "act1", "label": "// ACT 1 — THE QUESTION",
                      "start": 0.10, "end": 4.67,
                      "words": [ {"w":"Someone","start":0.095,"end":0.4}, ... ] }, ... ],
  "words":     [ ... ],          // ← every caption pixel and beat-clock comes from here
  "anchors":   { "atoms_1": {"ok":true, "start":1.121, ...}, ... },
  "totalDuration": 34.672
}
```

Act boundaries here, not anywhere else. `start`/`end` in `actBreakdown` are derived from the spoken
stream — never hand-typed.

Banned: hand-editing `metadata.json`, estimating timings, reusing someone else's metadata for a
different script. If the narration changes, re-run `bun run generate:<slug> --force` and re-shot the
frames.

---

## 6. The scene: every pixel is a pure function of `t`

```
src/components/<Episode>Acts.tsx       (e.g. never-touch, everest, touch-and-feel)
  └─ React/SVG/Canvas only — no three.js, no random. All motion = f(t).
     Backbones from src/motion/anim.ts: clamp01, easeOutCubic, easeInOutCubic, backOut, anim().
  └─ Everything timed goes through `window.__seek(t)` in record mode (?record=1) and
     requestAnimationFrame + <audio>.currentTime in preview mode.
     The two clocks never share state.
  └─ Karaoke captions come from metadata.words[] (word-by-word reveal,
     active word = highlighted; see KaraokeCaption.tsx + captionChunks.ts).
  └─ On-screen numbers are never literals — they come from FACTS.
```

Technique:

- **Random-looking textures are seeded** — positions come from a fixed factory with your seed, so a
  "random" starfield/snow/grain loop produces the same placement on every render. `Math.random()` is
  banned everywhere in scene code.
- **Stagger and entrance** (0.35 s) with `anim()`: "0->1 progress from a start time + duration".
- One ~2–3 s beat cycle: something must change on screen every 2–3 s — the anchor beats handle that.
- No CSS `infinite` animations; no `requestAnimationFrame`-owned clocks — the audio is the clock.

Visual polish exists for one job: making the words easier to watch/read. Grid/Bento compositions add
ornament, not information.

Per episode triad (see `episodes/touch-and-feel`):

```
episodes/touch-and-feel/script.txt    ← what is said and when
episodes/touch-and-feel/scene.json    ← series/title/endCard/anchors/banner placement
src/components/TouchFeelActs.tsx      ← the t-driven SVG scene for this episode
```

---

## 7. `?record=1`: how the frame catcher sees the video

Episode shell (`src/components/Episode.tsx`) mounts a hidden `<audio>` plus the scene. In
`?record=1` mode:

- sets `window.__seek = (t) => { audio.currentTime = t }`
- sets `window.__ready = true` after the mp3/metadata are fetched
- after every React render at that `t`, sets `window.__committedFrame = t`
- when the last frame is rendered, sets `#root[data-rendering-complete="true"]`

In preview mode (no `record=1`) it plays normally with `<audio controls>` — exactly so you can
scrub on the fly; same DOM, no separate recorder code path.

`?episode=touch-and-feel` (or default `?episode=milkyway`) picks the episode via the router —
`src/App.tsx`.

---

## 8. `bun run shot` — the fast "does it look right" loop

```bash
bun run shot "4,7,12,16,24,27,33" --episode touch-and-feel
```

Spawns vite on a fresh ephemeral `127.0.0.1` port (avoids Windows localhost fights), seeks the same
`?record=1` page at the timestamps you give, saves numbered PNGs to `os.tmpdir()/internet-shorts-shots/`.
This is how every layout/caption/chip is checked without a full render; full MP4 is for the final gate.

---

## 9. `bun run render -- --episode <slug>` — the actual video render

Exactly what `scripts/render_video.mjs` does (measured 2026-11: ~60–110 s per episode):

1. `vite build` (production bundle, no HMR).
2. `vite preview` on an ephemeral port (`net.listen(0)`, `127.0.0.1`) — never a fixed port.
3. Headless **puppeteer Chrome at exactly 1080×1920** (deviceScaleFactor: 1), launch flag
   `--disable-gpu` (this is what kills sub-pixel raster jitter).
4. Goto `http://127.0.0.1:<port>/episode?record=1&episode=<slug>`; wait for `window.__ready === true`.
5. **For each of ~2,600 frames:**
   - `window.__seek(t)` at t = i/30
   - wait for `window.__committedFrame === t`
   - `page.screenshot({ type: 'jpeg', quality: 92 })` to `frames/frame_000001.jpg…`
6. **ffmpeg** (ffmpeg-static, never a global ffmpeg):
   - input: JPEG frames at 30 fps + the voiceover mp3
   - `apad=whole_dur=<total>` so the Short doesn't cut mid-tail
   - `-c:v libx264 -preset medium -crf 18 -profile:v high -level 4.0 -pix_fmt yuv420p`
   - `-c:a aac -b:a 192k -ar 48000 -ac 2`
   - `+faststart` (`moov` before `mdat`), `-shortest`
   - output `output/<slug>-1080x1920.mp4` (e.g. `output/touch-and-feel-1080x1920.mp4`), frames/ cleaned up

Result: 1080×1920 @ 30 fps, H.264 High / yuv420p, AAC 48 kHz stereo, `+faststart`.

---

## 10. `bun run verify <slug>` — the machine gates before packaging

Exits 0 (pass) or 1 (fail) — **both states have been exercised** in this repo (it fails twice on
purpose in the trade history and passes now):

```
bunx tsc -b        # type gate        — always before any merge
bun run lint       # eslint gate      — must be clean before any commit
bun run verify     # all five episodes: anchors, banned strings, FACTS display⊇value, tails
#   per episode: every scene.json anchor {word, occurrence} must exist in words[],
#   banned strings ("rock height", "true height", "exact depth", "exact") absent from script,
#   every FACTS.display must contain its value as digits, per-episode word-count/duration gates.
```

What verify **does not** check — nothing checks these, all enforced by eye/shot so far:

- Stream resolution/codec/faststart inside the MP4 (probe with ffmpeg yourself if unsure).
- "Frames still look right after the last visual change" — shots are the only reliable check today.
- The human-confirm sources gate — never machine-verified.
- Anything about *claims being true*, not just formatted correctly.

(Enforcement today is tsc → lint → verify + your eye. A stricter ffprobe gate is on the TODO list in
`AGENTS.md` §5, still open.)

---

## 11. `bun run cover` / `bun run thumb` — the still images

```
bun run cover --episode <slug>   → results/videos/<slug>/cover_{youtube,tiktok,instagram}.png
bun run thumb --episode <slug>   → results/videos/<slug>/thumbnail_{youtube,instagram}.png
```

Headless Chrome renders `/?cover=<slug>&ratio=16x9|4x3|9x16` (or `/?thumb=…`). Cover = 16:9 YouTube
hero text composition; Thumbnail = same composition square-cut for Shorts/TikTok. Renders are
independent of the video — they do not affect frames.

---

## 12. Package & post

```bash
# hand package (writes ~/results/videos/<slug>/, results/ is gitignored)
cp output/<slug>-1080x1920.mp4 results/videos/<slug>/video.mp4
Get-FileHash results/videos/<slug>/video.mp4   # confirm sha256

# about.txt — already written per episode; 4 blocks (YouTube Shorts / IG Reels / TikTok / FB Reels):
# every block: hook line, 3–5 short paragraphs, CTA to @DailyDoseOfCuriosity, hashtags,
# mtime of sources with the exact 3 source URLs, freeze-frame timestamps, sha256, endCard note,
# regeneration command.
n

node scripts/admin_manifest.mjs   # refreshes public/admin-manifest.json (dashboard, gitignored)
# episodes/<slug>/sources.md  ← human opens every link before posting
# results/<slug>/ still works — it is just gitignored, safe to paste anytime
```

`results/` is **gitignored on purpose** — it is parcels of output, not code. `about.txt` + `meta.json`
inside it are the handoff document; the `[TOC]` index inside that file tells you what each section is
for. Do not commit packages.

---

## 13. Golden path (end-to-end, ~90 minutes, per episode)

```bash
# 0) idea + brief (human round-trip) → episodes/<slug>/brief.md + script.txt + sources.md + scene.json + facts.ts
bun run generate:<slug>                 # TTS + metadata.json (anchors printed, must exit 0)
bunx tsc -b                           # typecheck
bun run shot "<t1>,<t2>,..." --episode <slug>   # verify visuals in the browser
# iterate scene until all beats read well
bun run render -- --episode <slug>      # full render → output/<slug>-1080x1920.mp4
bun run verify <slug>                   # anchors + banned strings + FACTS gates
bun run cover -- --episode <slug>       # hero images
bun run thumb -- --episode <slug>       # short-form covers
node scripts/admin_manifest.mjs         # refresh dashboard listing
bun run verify <slug>                   # final gate
# human QA (eye-on-PNGs/read-the-script.txt out loud) →
# post 🚀
```

---

## 14. Failures to expect (and what they mean)

| Symptom | Cause | Fix |
|---|---|---|
| `uv run ... generate_audio` fails with zero WordBoundary tokens | edge-tts silently dropped boundary events (rare) or market boundary missing | run with `--dry-run` first; if it persists, re-render with `--force`; never hand-type timings |
| `uv run ...` hangs / Python Store stub errors | Windows Store stub shadowing real python | use `uv run` — never bare `python`/`py` — and if uv misbehaves, reinstall via `uv python install` |
| vite preview never ready on `127.0.0.1` | stale `node_modules/.vite*` | `Remove-Item -Recurse -Force node_modules\.vite*` |
| render freezes at 300 s at "ready in" | stale `node_modules/.vite*` again | same fix |
| `Waiting for __ready === true` times out | scene code never set `__ready` (JS error at runtime, or mp3 404) | open the page in devtools; usually a 404 for `full_voiceover.mp3` because the episode isn't registered in `src/components/Episode.tsx` yet |
| `__committedFrame` never equals `t` | scene not listening to the record clock (bug) | check every animation is `f(t)` only; no `setInterval`, no `Math.random()` outside seeded factories |
| `verify` passes but MP4 is wrong streams | verify doesn't probe ffprobe today | decode `frames/frame_000001.jpg` manually (shot script) when something feels off |
| `framemd5` mismatch between runs but video looks identical | container-level encoder drift | use framemd5 as the pass/fail gate, not MP4 sha256 |
| End card/overlay drifts relative to voiceover | word-timings drift after a script edit | re-run `bun run generate:<slug> --force` then re-shot all beats |

---

## 15. What "done" means for this repo

- `bunx tsc -b` exits 0. `bun run lint` exits 0. `bun run verify` exits 0.
- anchor/beat sheet positions in `episodes/<slug>/brief.md` match the placed anchors in
  `episodes/<slug>/meta.json`'s generated anchor table.
- Every displayed number renders through `facts.ts` — new files carry the `FACTS` import.
- `output/<slug>-1080x1920.mp4` second-duplicate-render produces framemd5 identical frames.
- `results/<slug>/about.txt` contains source URLs + sha256 + freeze-frame picks + posting notes.
- **Human opens every source link** listed in `episodes/<slug>/sources.md` before posting.

Not done / honest limits:

- No automated ffprobe assertions inside `verify` (a checklist item).
- No posting automation (deliberately — phase 7 after ≥10 manual posts with real stats).
- No `--force` behavior in scene re-renders — full `render --force` is required if visuals are touched;
  reference shots for affected beats are always re-checked.
- Stats/analytics loop (`bun run stats`) — still per `AGENTS.md` §7, not yet implemented.

Where to read more, in order: `AGENTS.md` (the rules), `README.md` (layout), `VIDEO_PRODUCTION.md`
(playbook), `docs/brief-template.md` (the brief format), `docs/conventions.md` (anchors & datum),
`docs/determinism.md` (frames-identical passes), `docs/risks.md` (edge-tts is the wildcard — it can
break or be pulled at any time).
