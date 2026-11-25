# Pipeline fix report — 2026-11-25

Owner: Ghost (Abhijit Guragain). Scope: **pipeline only**. No new video idea was started.

This closes the fix list recorded in `INSTRUCTIONS.md` §16 before the next idea is grilled with
`prompt.md` P0/P2. One item remains deliberately open: `scripts/package.ts` / `bun run package`
(AGENTS.md Phase 4), because packaging needs the human-verified source gates and is not part of
the render/QA path fixed here.

---

## 1. What changed

| Area | Change | Why |
|---|---|---|
| `scripts/render_video.mjs` | Voice acts + SFX are mixed into a temporary WAV; optional `music_bed.wav` is ducked with `sidechaincompress`; the WAV is measured and normalized with two-pass `loudnorm` (`I=-14:TP=-1.5`, `linear=true`) before the final H.264/AAC mux. Flags: `--no-bed`, `--no-loudnorm`, `--bed-gain <dB>`. | The shipped Uranus render was −20.6 LUFS with 29 % silence. Those are measurable failures, not taste. |
| `scripts/synth_bed.py` + `bun run bed` | Deterministic 48 s / 48 kHz drone+pulse bed, seed `0xBED5`, peak −18 dBFS. Default render gain is −8 dB, putting it ~−33 LUFS in gaps and ~26 dB under the ducked voice. | Continuous low-level bed removes dead air without a download or a licence trail (D1). |
| `scripts/qa_metrics.mjs` + `bun run qa` | Decodes the real MP4 and prints the §9.1 PASS/FAIL table; exits 1 on any failure. Supports `--slug` and `--video <path>`. | QA must be a command with a raw number, not a vibe. |
| `scripts/verify.ts` | Added ffprobe spec row (h264 / 1080×1920 / 30 fps / yuv420p / AAC 48 kHz / duration / faststart), honours the 45 s long-form override, and decodes t=1 s + t=3 s PNGs into `output/.verify/`. | Phase 4 verification side was previously only anchors + banned strings. |
| `scripts/render_cover.mjs` | Replaced the wrong 1440×1080 (4:3) TikTok target with the seven-target §10.1 matrix and hard dimension checks; grid/feed are real crops, Shorts is a 2× capture; legacy aliases retained. | One 1080×1920 artboard, seven real surfaces, no post-hoc re-design. |
| `src/theme/captionStyles.ts`, `captionChunks.ts`, `KaraokeCaption.tsx`, `Episode.tsx` | Added `phrase`: 3-word chunks, 92 px, no dim upcoming words, moved 10 px up after the DOM check. Legacy styles still default to 6 words + dim upcoming. | H7 needs readable captions; existing episodes must not drift. |
| `package.json` | Added `bed`, `sfx`, `qa` scripts; existing `render`, `verify`, `cover` untouched. | Docs may only name commands that exist. |
| `INSTRUCTIONS.md`, `prompt.md`, `AGENTS.md`, `shared-assets/LICENSES.md` | Command tables, §16 status, caption fallback, seven-target cheat sheet, and asset rows for synthesized WAVs updated. | Keep the operating contract truthful. |

---

## 2. Verification actually run

### 2.1 Render + audio

```
bun scripts/render_video.mjs --episode uranus-tilted-sideways --max-frames 90 --out uranus-smoke-test.mp4
bun scripts/render_video.mjs --episode uranus-tilted-sideways --out uranus-pipeline-test.mp4
bun scripts/qa_metrics.mjs --video output/uranus-pipeline-test.mp4
```

Full render: 804 frames captured, 26.80 s, H.264 High / yuv420p / AAC 48 kHz / faststart, 4.2 MB.
Audio mix: 1 voice act + 1 SFX event + bed at −8 dB ducked; loudnorm measured −20.88 LUFS /
−5.28 dBTP and normalized the output to the table below.

| Metric | Measured | PASS | Threshold |
|---|---|---|---|
| Motion energy | 0.46 | ❌ FAIL | ≥ 1.5 @ fps=15 |
| Frozen share | 18.0 % | ❌ FAIL | ≤ 5 % |
| Mean luma | 33.5 (range 26–39) | ❌ FAIL | 55–85 |
| Loudness | −14.1 LUFS / −1.0 dBTP | ✅ PASS | −14 ± 0.5 LUFS, ≤ −1.0 dBTP |
| Silence | 0.0 % / max 0.00 s | ✅ PASS | ≤ 10 %, gap ≤ 0.45 s |
| Spec | h264 1080×1920 30/1 yuv420p / aac 48000 Hz | ✅ PASS | same |
| Duration | 26.80 s | ✅ PASS | 20–35 s |

**Interpretation:** the audio/container failures are fixed. The three remaining failures are
*visual content* properties of the existing Uranus scene (dark ground, few changes per second).
They are the next idea's job to fix during P4/P5, not a reason to weaken the thresholds (D5).

### 2.2 Verifier

```
bun run verify uranus-tilted-sideways        # PASS, spec + 2 decoded PNGs
bun run verify                              # all 10 canonical renders PASS
```

A deliberately broken 640×360 / 25 fps / MPEG-4 / MP3 / 1 s file was swapped in and correctly
reported `FAIL` on seven spec rows; restoring the real file returned `PASS`. All ten canonical
renders (including the 43.09 s long-form `sun-never-black-hole`) now pass the spec row.

### 2.3 Covers

```
bun scripts/render_cover.mjs --episode uranus-tilted-sideways
bun run cover -- --episode uranus-tilted-sideways
```

Seven files were emitted and their PNG headers checked:

| File | Size |
|---|---|
| `cover_tiktok_1080x1920.png` | 1080×1920 |
| `cover_reels_1080x1920.png` | 1080×1920 |
| `cover_fb_1080x1920.png` | 1080×1920 |
| `cover_shorts_2160x3840.png` | 2160×3840 |
| `cover_grid_1080x1440.png` | 1080×1440 |
| `cover_feed_1080x1350.png` | 1080×1350 |
| `thumbnail_youtube_1280x720.png` | 1280×720 |

Legacy `cover_tiktok.png` / `cover_instagram.png` / `cover_youtube.png` aliases are still written.
Dimension and crop geometry are machine-checked; **opening the seven PNGs at 20 % zoom remains a
human gate** (§10.3).

### 2.4 Caption style gate

`phrase` was temporarily selected for `uranus-tilted-sideways`, DOM-measured at 10 timestamps,
then reverted:

- 92 px rendered cap height (≥ 65 px required);
- ≤ 3 words per chunk;
- worst-case box `x 94–964`, `y bottom 1528` — inside x 60–1020 / y ≤ 1536;
- no `text-white/30` upcoming words;
- `uranus-phrase-smoke.mp4` rendered successfully; the temporary swap is gone.

The first pass found `y=1538` at one timestamp; `bottomClass` was moved from `bottom-[392px]` to
`bottom-[402px]` and re-measured. This is a real fix, not a waiver.

### 2.5 Asset determinism and legacy frames

```
bun run bed     # SHA256 before == after: E8D51D13…A0
bun run sfx     # all three WAV hashes unchanged
bunx tsc -b     # exit 0
```

Legacy visual regression check against a detached `HEAD` worktree using the same audio metadata:

| Episode | Result |
|---|---|
| `captionChunks.buildChunks` | Identical output to the pre-change algorithm for all 10 episodes. |
| `space-sound` current vs `HEAD` | Frames 0–509 byte-identical; 209 later frames differ, SSIM **0.999891** — the known act-3 raster jitter in `docs/determinism.md`, not introduced here. |
| `minecraft-edge` current vs `HEAD` | Frames 0–801 byte-identical; 61 tail frames differ, SSIM **0.999993** — the new WAV keeps one more frame at the tail than the old direct-mix `-shortest` path. Visual content is unchanged. |

The audio patch deliberately changes the container tail, so exact MP4 `sha256` parity with the
old builds is not claimed. Frame parity is the gate, with the two documented exceptions above.

---

## 3. Deferred / still open

- `scripts/package.ts` + `bun run package` (sha256-verified copy, `meta.json`, `about.txt`, missing-source gate). Package manually to `results/videos/<slug>/` until then.
- `bun run stats add` / `stats report` (Phase 6). No post data exists yet; §9 targets stay reference-derived (D5).
- Episode-level visual gates (motion / luma / frozen / caption size / text zones / loop). `qa_metrics.mjs` measures them; it cannot design a better scene.
- Human inspection of all seven cover PNGs and of the decoded stills in `output/.verify/`.
- The canonical `output/uranus-tilted-sideways-1080x1920.mp4` and its posted package were **not** overwritten by the test render; this report validates the new pipeline, not a re-post.

---

## 4. How to verify by experiment

1. `bun run bed` twice — `Get-FileHash shared-assets/sfx/music_bed.wav -Algorithm SHA256` must match.
2. `bun scripts/render_video.mjs --episode <slug> --out output/<slug>-audio-test.mp4` — look for
   `audio: … bed on (-8 dB, ducked)` and the measured LUFS line, then `bun run qa -- --video …`.
3. Swap a deliberately broken file into `output/<slug>-1080x1920.mp4`; `bun run verify <slug>`
   must fail; restore and it must pass.
4. `bun run cover -- --episode <slug>` — confirm seven exact filenames/sizes and open the 3:4 and
   4:5 crops at 20 % zoom.
5. Grill the next idea with `prompt.md` P0 → P2, then continue P3–P10. Change **one** variable.
