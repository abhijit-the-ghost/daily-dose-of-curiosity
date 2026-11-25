#!/usr/bin/env python3
"""
synth_bed.py — deterministic music bed for Daily Dose of Curiosity.

Output: shared-assets/sfx/music_bed.wav
  48 s, 48 kHz, 16-bit stereo, peak −18 dBFS / −25.3 LUFS. render_video.mjs
  applies −8 dB so the bed sits above the −35 dB silence gate in gaps and
  ~26 dB under the ducked voice. Original work — no samples, no licence.
  Provenance: this file + the constants below. Seed 0xBED5, byte-identical reruns.

Run from repo root:
  uv run --with numpy python scripts/synth_bed.py

Design: dark A-minor drone (six detuned partials, slow independent LFOs) +
a 0.5 Hz sub pulse for forward motion + a very quiet high shimmer that keeps
the top end alive under voice. Pure sines, vectorized, no audio downloads.
"""

from pathlib import Path
import wave

import numpy as np

SR = 48_000
SECONDS = 48.0
SEED = 0xBED5
OUT_DIR = Path(__file__).resolve().parent.parent / "shared-assets" / "sfx"
OUT = OUT_DIR / "music_bed.wav"
PEAK = 10 ** (-18.0 / 20)  # −18 dBFS: room for gain + peak guard in the mix


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    n = int(SR * SECONDS)
    t = np.arange(n, dtype=np.float64) / SR
    rng = np.random.default_rng(SEED)

    # Six partials; detune and phase are seeded, so a rerun is byte-identical.
    partials = [
        (55.00, 0.42),   # A1  root
        (82.41, 0.22),   # E2  fifth
        (110.00, 0.18),  # A2
        (164.81, 0.09),  # E3
        (220.00, 0.05),  # A3
        (329.63, 0.03),  # E4
    ]
    drone_l = np.zeros(n)
    drone_r = np.zeros(n)
    for k, (freq, amp) in enumerate(partials):
        detune = rng.uniform(0.9992, 1.0008)
        phase = rng.uniform(0.0, 2 * np.pi)
        # each partial breathes at its own very slow rate (0.023–0.061 Hz)
        lfo = 1.0 + 0.07 * np.sin(2 * np.pi * (0.023 + k * 0.0076) * t + phase)
        base = amp * np.sin(2 * np.pi * freq * t + phase) * lfo
        drone_l += base
        drone_r += amp * np.sin(2 * np.pi * (freq * detune) * t + phase * 1.11) * lfo

    # 0.5 Hz sub pulse: one hit every 2 s, exponential decay 0.4 s.
    pulse_env = np.exp(-((t % 2.0) * 6.0))
    pulse = 0.34 * np.sin(2 * np.pi * 55.0 * t + 0.2) * pulse_env

    # High shimmer: two near-silent sines with a 0.23 Hz tremolo.
    trem = 0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t)
    shimmer_l = 0.013 * np.sin(2 * np.pi * 880.0 * t + 0.9) * trem
    shimmer_r = 0.013 * np.sin(2 * np.pi * 1320.0 * t + 1.7) * trem

    left = drone_l + pulse + shimmer_l
    right = drone_r + pulse + shimmer_r

    # 0.4 s fades so looping / trimming never clicks.
    fade = int(0.4 * SR)
    env = np.ones(n)
    env[:fade] = np.linspace(0, 1, fade)
    env[-fade:] = np.linspace(1, 0, fade)
    left *= env
    right *= env

    stereo = np.stack([left, right], axis=1)
    stereo = np.tanh(stereo * 1.05)  # soft guard, no hard clipping
    stereo *= PEAK / np.max(np.abs(stereo))

    pcm = np.int16(np.clip(stereo, -1.0, 1.0) * 32767)
    with wave.open(str(OUT), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"[bed] wrote {OUT}  ({n / SR:.1f}s, peak -18 dBFS, seed 0x{SEED:X})")


if __name__ == "__main__":
    main()
