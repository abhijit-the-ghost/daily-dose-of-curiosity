# PROMPT — Video generation (reusable, for OpenCode)

Use after `AGENTS.md` is in the repo and an episode brief exists. This runs the whole build → render → verify → package cycle. Paste one stage at a time into OpenCode, check the output, then paste the next.

---

## Stage A — Plan (no code)

```
Read AGENTS.md and episodes/<slug>/ brief (e.g. minecraft-edge-brief.md).
TASK: Stage A, planning only. Change no files.
1. Summarize the brief in 5 lines: narration word count, acts, series, anchors, bars/counters, SFX yes/no.
2. List every file you will create or modify. Mark which already exist.
3. List every anchor word from the beat sheet and whether it appears in the script (occurrence numbers).
4. List anything in the brief that conflicts with AGENTS.md, is ambiguous, or can't be built as a pure function of t.
5. List what you need from me (e.g. missing source S3, pronunciation fixes).
Report in the AGENTS.md format and stop.
```

## Stage B — Audio and metadata

```
Read AGENTS.md and the brief.
TASK: Stage B. Do only audio.
1. Write the narration from brief section 1 to episodes/<slug>/script.txt exactly. Don't edit any word.
2. Strip `[src: …]` markers and `//` lines, then generate the voiceover (en-US-AriaNeural, +12%) and metadata.json with per-word start/end from edge-tts WordBoundary events only.
3. Report: word count, total duration, and a table of every anchor word → its start time. Fail loudly if an anchor is missing.
4. Play-check text: list any words the voice is likely to mispronounce.
Stop if WordBoundary events are missing. Don't estimate timings.
Gate: valid metadata.json; word count 60–75; duration 20–35 s.
Report and stop.
```

## Stage C — Build the scene

```
Read AGENTS.md and the brief (sections 3, 4 and 5).
TASK: Stage C. Build the episode component and route.
1. Create a self-contained component for this episode (or use the generic <Episode> if it exists). All visuals are pure functions of t. Seeded PRNG only. No Motion library, no CSS infinite animations.
2. Put every on-screen number and label into one FACTS constant; compute bars/counters from it. Don't hard-code derived values.
3. Resolve every beat from metadata.json words[] by {word, occurrence}. No hard-coded seconds.
4. Keep the recorder hooks (window.__seek, __ready, __committedFrame, data-rendering-complete).
5. Route with ?episode=<slug>.
Gates: bunx tsc -b passes; bun run dev loads the stage with no console errors; bun run shot "0,<time of each anchor>,<last>" and show the PNGs.
Don't touch other episodes. Report and stop.
```

## Stage D — Review loop (repeat as needed)

```
Read AGENTS.md and the brief.
TASK: Stage D. Compare the screenshots to the brief and fix only listed issues:
- clipped or overlapping text (test the longest caption words)
- anything below y 1536 or outside x 60–960
- wrong color use (amber vs cyan)
- counters, bars or numbers that don't match the FACTS constant
- anchors that fire at the wrong word
Fix only what I list below, then re-run bun run shot and show the new PNGs.
ISSUES: <paste what you saw>
Report and stop.
```

## Stage E — Render and verify

```
Read AGENTS.md and the brief (sections 6 and 7).
TASK: Stage E.
1. bun run render:smoke first. If it fails, stop and report.
2. bun run render (full).
3. Run the acceptance checks in brief section 6: math one-liner, ffprobe (1080×1920, 30 fps, H.264 yuv420p, AAC 48 kHz, both streams, duration), frames decoded at ≥ 2 timestamps (first and last), loop check (last frame ≈ first), and render twice + ffmpeg -f framemd5 comparison.
4. Paste every command and its real output.
Don't package yet. Report and stop.
```

## Stage F — Package

```
Read AGENTS.md and the brief.
TASK: Stage F.
1. Copy the final MP4 to results/videos/<slug>/video.mp4 and show matching sha256 for source and copy.
2. Write about.txt: three caption blocks (YouTube Shorts, Instagram Reels, TikTok), hashtags, a SOURCES section (every key in the brief with its claim; mark anything not yet confirmed by a human), posting notes, a suggested pinned comment explaining the math/assumptions.
3. Write meta.json as specified in the brief.
4. FAIL (don't package) if any source key is still empty or marked NOT YET FOUND.
Report and stop.
```

---

## Operator checklist (for you)

1. **Before Stage A:** open every source in the brief. Fill in missing ones. Don't let the agent search for them.
2. **After Stage B:** listen to the audio once. Fix pronunciation with a one-to-one map.
3. **After Stage C/D:** look at the screenshots yourself. Check the first frame, the biggest number, and the last frame.
4. **After Stage E:** watch the MP4 end to end on your phone.
5. **After Stage F:** post, then record stats at 48 hours and 7 days in `stats.json`.

## If the agent drifts

Paste: `Stop. Re-read AGENTS.md section 1 and the brief. Tell me which rule you broke, then continue only the current stage.`

If the same error appears twice, tell it to stop and report instead of trying more fixes.
