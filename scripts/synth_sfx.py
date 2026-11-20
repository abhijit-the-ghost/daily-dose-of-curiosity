#!/usr/bin/env python3
"""
synth_sfx.py — deterministic code-synthesized cinematic SFX for Daily Dose of Curiosity.

Two abstract assets, 100% synthetic output (no samples anywhere, ever):
  sub_drop.wav   1.10s  48kHz 16-bit stereo — chest-thump sub impact (stamp slam / red-giant beat)
  riser.wav      2.60s  48kHz 16-bit stereo — build into the payoff (swells to peak, cuts clean)

Run from repo root:
  uv run --with numpy python scripts/synth_sfx.py

Everything is a pure function of (SR, params, RNG seed). RNG is seeded, so reruns are
byte-identical. Output lands in shared-assets/sfx/ (provenance: this file + params below,
no external licence needed — original work).
"""

from pathlib import Path
import numpy as np

SR = 48_000
SEED = 0xC0FFEE
OUT_DIR = Path(__file__).resolve().parent.parent / "shared-assets" / "sfx"
OUT_DIR.mkdir(parents=True, exist_ok=True)
PEAK = 10 ** (-1.0 / 20)  # -1 dBFS


def phase_from_freq(freq_per_t: np.ndarray) -> np.ndarray:
    """Cumulative-phase from a per-sample frequency array (Hz)."""
    return 2 * np.pi * np.cumsum(freq_per_t) / SR


def write_wav(name: str, stereo: np.ndarray) -> None:
    """Normalize a float stereo array to -1 dBFS and write 16-bit PCM via stdlib wave."""
    import wave

    peak = np.max(np.abs(stereo))
    assert peak > 1e-6, f"{name}: silent buffer"
    stereo = stereo * (PEAK / peak) * 0.89  # headroom: two soft-limit passes
    stereo = np.tanh(stereo * 1.15)         # soft-clip guard, no hard clipping possible
    pcm = np.int16(np.clip(stereo, -1.0, 1.0) * 32767)
    path = OUT_DIR / name
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"[sfx] wrote {path}  ({pcm.shape[0] / SR:.2f}s)")


def sub_drop() -> None:
    """Sub impact: 90→38 Hz exponential sweep + click transient + fixed 55 Hz thump + noise tail."""
    T = 1.10
    n = int(SR * T)
    t = np.linspace(0, T, n, endpoint=False)

    # main sweep
    f = 90.0 * (38.0 / 90.0) ** (t / T)
    tone = np.sin(phase_from_freq(f)) * np.exp(-t * 3.1)

    # fixed sub thump layer (body, 55 Hz)
    thump = np.sin(2 * np.pi * 55 * t) * 0.55 * np.exp(-t * 4.2)

    # click transient (first 25 ms, drives the "hit")
    click = np.zeros(n)
    cn = int(0.025 * SR)
    rng = np.random.default_rng(SEED)
    click[:cn] = rng.standard_normal(cn) * np.exp(-t[:cn] * 175)

    # airy decay tail (high-mid noise, very low)
    tail_rng = np.random.default_rng(SEED ^ 0x5EED)
    tail = tail_rng.standard_normal(n) * np.exp(-t * 6.0) * 0.10
    # cheap static highpass on the tail (one-pole)
    y = np.empty(n)
    acc = 0.0
    a = 0.08
    for i in range(n):
        acc = acc + a * (tail[i] - acc)
        y[i] = tail[i] - acc
    tail = y

    env = np.minimum(1.0, t / 0.008) * np.exp(-t * 2.6)  # 8ms attack
    left = (tone * 0.9 + thump + click * 0.7 + tail) * env
    right = (tone * 0.85 + thump + click * 0.7 + np.roll(tail, 37)) * env  # decorrelated click/tail
    write_wav("sub_drop.wav", np.stack([left, right], axis=1))


def riser() -> None:
    """Payoff riser: noise sweep (one-pole lowpass, cutoff opens with t) + staggered
    stacked fifths swell + sub reinforcement. Ends at peak with a clean 50 ms tail cut."""
    T = 2.60
    n = int(SR * T)
    t = np.linspace(0, T, n, endpoint=False)
    p = t / T  # 0..1

    rng = np.random.default_rng(SEED)
    noise_l = rng.standard_normal(n)
    noise_r = rng.standard_normal(n)

    # time-varying one-pole lowpass: cutoff coefficient opens from ~a=0.008 to a=0.9 (exp)
    a_curve = 0.008 * (0.9 / 0.008) ** (p**1.7)  # slow open → fast open at the top
    def one_pole_lp(x, a_series):
        y = np.empty(n)
        acc = 0.0
        for i in range(n):
            acc = acc + a_series[i] * (x[i] - acc)
            y[i] = acc
        return y
    sweep_l = one_pole_lp(noise_l, a_curve)
    sweep_r = one_pole_lp(noise_r, a_curve)

    # flutter so the air moves
    flutter = 1 + 0.10 * np.sin(2 * np.pi * 7.3 * t + 0.8)

    # swell envelope: pow curve, hard up, hold at peak, 50 ms clean cut
    swell = np.minimum(p**2.55, 1.0)
    cut = np.clip((T - t) / 0.05, 0.0, 1.0)  # final 50 ms fade so the tail never clicks

    # stacked harmony: G2, D3, G3, B3, D4 — staggered entry, crescendo per voice
    freqs = [98.0, 146.83, 196.0, 246.94, 293.66]
    cluster_l = np.zeros(n)
    cluster_r = np.zeros(n)
    for k, f0 in enumerate(freqs):
        entry = 0.10 + k * 0.13              # staggered voice entries
        ve = np.clip((p - entry) / (1 - entry), 0.0, 1.0)
        env = ve**(1.5 + k * 0.5)            # higher voices harder to hear early
        # tiny detune on the right side for width
        cluster_l += np.sin(2 * np.pi * f0 * t) * env * (0.16 + 0.05 * k)
        cluster_r += np.sin(2 * np.pi * (f0 * 1.004) * t) * env * (0.16 + 0.05 * k)

    # sub reinforcement an octave under the root
    sub = np.sin(2 * np.pi * 49.0 * t) * (p**3.2) * 0.34

    left = (sweep_l * flutter * 0.55 * swell + cluster_l * swell + sub) * cut
    right = (sweep_r * flutter * 0.55 * swell + cluster_r * swell + sub) * cut
    write_wav("riser.wav", np.stack([left, right], axis=1))


if __name__ == "__main__":
    sub_drop()
    riser()
    print("[sfx] done — deterministic params, seed 0xC0FFEE")
