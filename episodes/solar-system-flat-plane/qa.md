## QA metrics — output\solar-system-flat-plane-1080x1920.mp4

| Metric | Measured | PASS | Threshold |
|---|---|---|---|
| Motion energy | 0.99 | ❌ FAIL | ≥ 1.5 @ fps=15 |
| Frozen share | 6.3 % | ❌ FAIL | ≤ 5 % |
| Mean luma | 69.4  (31–83) | ✅ PASS | 55–85 |
| Loudness | -14.0 LUFS / -1.4 dBTP | ✅ PASS | −14 ± 0.5 LUFS, ≤ −1.0 dBTP |
| Silence | 0.0 % / max 0.00 s | ✅ PASS | ≤ 10 %, gap ≤ 0.45 s |
| Spec | h264 1080×1920 30/1 yuv420p / aac 48000 Hz | ✅ PASS | h264 1080×1920 30/1 yuv420p / aac 48 kHz |
| Duration | 52.07 s | ✅ PASS | 20–75 s |

Cap size / text zones / loop need stills: `bun scripts/dev_shot.mjs 0,2,4,7,10,13,16,19,22,25,28 --episode solar-system-flat-plane`.
