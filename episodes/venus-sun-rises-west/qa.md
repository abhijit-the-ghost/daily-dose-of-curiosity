## QA metrics — output\venus-sun-rises-west-1080x1920.mp4

| Metric | Measured | PASS | Threshold |
|---|---|---|---|
| Motion energy | 1.17 | ❌ FAIL | ≥ 1.5 @ fps=15 |
| Frozen share | 1.8 % | ✅ PASS | ≤ 5 % |
| Mean luma | 81.4  (47–103) | ✅ PASS | 55–85 |
| Loudness | -14.0 LUFS / -1.4 dBTP | ✅ PASS | −14 ± 0.5 LUFS, ≤ −1.0 dBTP |
| Silence | 0.0 % / max 0.00 s | ✅ PASS | ≤ 10 %, gap ≤ 0.45 s |
| Spec | h264 1080×1920 30/1 yuv420p / aac 48000 Hz | ✅ PASS | h264 1080×1920 30/1 yuv420p / aac 48 kHz |
| Duration | 66.40 s | ✅ PASS | 20–75 s |

Cap size / text zones / loop need stills: `bun scripts/dev_shot.mjs 0,2,4,7,10,13,16,19,22,25,28 --episode venus-sun-rises-west`.

## Documented exception — H3 motion-energy target

- **Metric:** 1.17 mean frame-diff @ fps=15 vs the 1.5 *target* (INSTRUCTIONS.md §5 H3, marked `[target]`, not a hard container gate).
- **Why this is not a frozen video:** frozen share is 1.8 % (gate ≤ 5 %); 40 beats drive the continuous SVG world with a measured max beat gap of 2.389 s; the globe's sunlit bands and terminator rotate with `t`, stars twinkle, and the camera, ground palette, shapes, and the single proof counter all advance on WordBoundary-anchored beats. Two render iterations raised the metric 0.46 → 1.13 → 1.17; further increases require a fundamentally different, more cut-heavy visual design, which is an owner decision for a future episode, not a threshold change here.
- **Context:** this is an owner-approved 1–2 minute, 6-act explainer (66.40 s), while the 1.5 target was calibrated against ≤35 s Shorts. Thresholds were left intact; the 20–75 s duration band in `qa_metrics.mjs` and `verify.ts` reflects the approved format, not a visual-gate relaxation.
- **Decision:** ship with the exception recorded, per INSTRUCTIONS.md ("Write exceptions in `qa.md` or change beats, not thresholds"). All hard gates (spec, loudness, silence, frozen share, luma, duration) pass.
