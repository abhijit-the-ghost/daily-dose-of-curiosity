#!/usr/bin/env python3
"""
synth_sfx.py — deterministic code-synthesized cinematic SFX for Daily Dose of Curiosity.

Nine deterministic assets, 100% synthetic output (no samples anywhere, ever):
  sub_drop.wav       1.10s  48kHz 16-bit stereo — chest-thump sub impact (existing episodes)
  riser.wav          2.60s  48kHz 16-bit stereo — payoff riser (existing episodes)
  glass_chime.wav    1.20s  bright metallic partials — frame-1 reveal
  sub_thump.wav      0.95s  short low weight under the frame-1 hit
  airy_swell.wav     2.20s  filtered-noise dissolve into the nebula cloud
  spin_up_hum.wav    3.20s  80→160 Hz sweep — angular-momentum spin-up
  collision_tick.wav 0.18s  short noise/body tick — vertical motion damping
  disk_collapse.wav  1.60s  descending bass settle — disk formation
  telemetry_click.wav 0.14s  two-tone click — angle readout landings

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


def _one_pole_lp(x: np.ndarray, a_series: np.ndarray) -> np.ndarray:
    """Deterministic one-pole lowpass with a time-varying coefficient."""
    y = np.empty_like(x)
    acc = 0.0
    for i in range(x.shape[0]):
        acc = acc + a_series[i] * (x[i] - acc)
        y[i] = acc
    return y


def glass_chime() -> None:
    """Frame-1 reveal: inharmonic metallic partials with a tiny noise strike."""
    T = 1.20
    n = int(SR * T)
    t = np.linspace(0, T, n, endpoint=False)
    rng = np.random.default_rng(SEED ^ 0xC11A)

    left = np.zeros(n)
    right = np.zeros(n)
    for k, (f0, amp, decay) in enumerate([
        (2093.0, 0.90, 3.6),
        (3136.0, 0.55, 4.8),
        (4186.0, 0.32, 6.2),
        (5232.5, 0.18, 7.4),
    ]):
        env = np.exp(-t * decay) * np.minimum(1.0, t / 0.004)
        left += np.sin(2 * np.pi * f0 * t + 0.3 * k) * amp * env
        right += np.sin(2 * np.pi * (f0 * 1.003) * t + 0.5 * k) * amp * env

    click = rng.standard_normal(n) * np.exp(-t * 220) * 0.25 * np.minimum(1.0, t / 0.002)
    left += click
    right += np.roll(click, 11)
    write_wav("glass_chime.wav", np.stack([left, right], axis=1))


def sub_thump() -> None:
    """Short low weight under the hook-frame chime (distinct from sub_drop)."""
    T = 0.95
    n = int(SR * T)
    t = np.linspace(0, T, n, endpoint=False)
    f = 65.0 * (38.0 / 65.0) ** (t / T)
    tone = np.sin(phase_from_freq(f)) * np.exp(-t * 4.0)
    fixed = np.sin(2 * np.pi * 48 * t) * 0.6 * np.exp(-t * 5.0)

    rng = np.random.default_rng(SEED ^ 0x5EED)
    cn = int(0.015 * SR)
    click = np.zeros(n)
    click[:cn] = rng.standard_normal(cn) * np.exp(-t[:cn] * 200) * np.minimum(1.0, t[:cn] / 0.0015)

    attack = np.minimum(1.0, t / 0.006)
    left = (tone + fixed + click * 0.8) * attack
    right = (tone * 0.96 + fixed + np.roll(click, 19) * 0.8) * attack
    write_wav("sub_thump.wav", np.stack([left, right], axis=1))


def airy_swell() -> None:
    """Atom-to-nebula dissolve: lowpassed noise blooms, then cuts clean."""
    T = 2.20
    n = int(SR * T)
    t = np.linspace(0, T, n, endpoint=False)
    p = t / T
    rng = np.random.default_rng(SEED ^ 0xA121)
    noise_l = rng.standard_normal(n)
    noise_r = rng.standard_normal(n)

    a = 0.010 * (0.85 / 0.010) ** (p ** 1.4)
    sweep_l = _one_pole_lp(noise_l, a)
    sweep_r = _one_pole_lp(noise_r, a)
    env = np.minimum(p / 0.26, 1.0) * np.minimum((1.0 - p) / 0.18, 1.0)
    shimmer_l = np.sin(2 * np.pi * 880 * t + 0.4) * 0.055 * env
    shimmer_r = np.sin(2 * np.pi * (880 * 1.006) * t + 1.1) * 0.055 * env
    left = sweep_l * env * 0.8 + shimmer_l
    right = sweep_r * env * 0.8 + shimmer_r
    write_wav("airy_swell.wav", np.stack([left, right], axis=1))


def spin_up_hum() -> None:
    """Angular-momentum cue: continuous 80→160 Hz sweep, 3.2 s per sfx.json."""
    T = 3.20
    n = int(SR * T)
    t = np.linspace(0, T, n, endpoint=False)
    p = t / T
    f = 80.0 * (160.0 / 80.0) ** p
    phase_l = phase_from_freq(f)
    phase_r = phase_from_freq(f * 1.002)

    harm_l = np.sin(phase_l) + 0.35 * np.sin(2 * phase_l + 0.4) + 0.12 * np.sin(3 * phase_l + 0.9)
    harm_r = np.sin(phase_r) + 0.35 * np.sin(2 * phase_r + 0.7) + 0.12 * np.sin(3 * phase_r + 1.4)
    env = (0.28 + 0.72 * p) * np.minimum((1.0 - p) / 0.08, 1.0)
    left = harm_l * env * 0.72
    right = harm_r * env * 0.72
    write_wav("spin_up_hum.wav", np.stack([left, right], axis=1))


def collision_tick() -> None:
    """Vertical-motion damping tick: short noise transient + low body."""
    T = 0.18
    n = int(SR * T)
    t = np.linspace(0, T, n, endpoint=False)
    rng = np.random.default_rng(SEED ^ 0x711C)
    noise = rng.standard_normal(n) * np.exp(-t * 90)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 55) * 0.5
    attack = np.minimum(1.0, t / 0.001)
    left = (noise * 0.5 + body) * attack
    right = (np.roll(noise, 7) * 0.5 + body) * attack
    write_wav("collision_tick.wav", np.stack([left, right], axis=1))


def disk_collapse() -> None:
    """Disk settle: descending bass sweep that lands and stays low."""
    T = 1.60
    n = int(SR * T)
    t = np.linspace(0, T, n, endpoint=False)
    f = 120.0 * (42.0 / 120.0) ** (t / T)
    tone = np.sin(phase_from_freq(f)) * np.exp(-t * 2.2)
    sub = np.sin(2 * np.pi * 42 * t) * 0.5 * np.exp(-t * 2.8)

    rng = np.random.default_rng(SEED ^ 0xD15C)
    noise = _one_pole_lp(rng.standard_normal(n), np.full(n, 0.03))
    tail = noise * np.exp(-t * 3.2) * 0.18
    env = np.minimum(1.0, t / 0.01) * np.minimum((T - t) / 0.06, 1.0)
    left = (tone + sub + tail) * env
    right = (tone * 0.97 + sub + np.roll(tail, 23)) * env
    write_wav("disk_collapse.wav", np.stack([left, right], axis=1))


def telemetry_click() -> None:
    """Two-tone click for each angle readout landing."""
    T = 0.14
    n = int(SR * T)
    t = np.linspace(0, T, n, endpoint=False)
    rng = np.random.default_rng(SEED ^ 0x7E1E)
    tone = np.sin(2 * np.pi * 2200 * t) * 0.6 + np.sin(2 * np.pi * 3300 * t + 0.8) * 0.4
    env = np.exp(-t * 70) * np.minimum(1.0, t / 0.0012)
    noise = rng.standard_normal(n) * np.exp(-t * 160) * 0.18 * np.minimum(1.0, t / 0.001)
    left = (tone + noise) * env
    right = (np.roll(tone, 5) + np.roll(noise, 5)) * env
    write_wav("telemetry_click.wav", np.stack([left, right], axis=1))


def main() -> None:
    sub_drop()
    riser()
    glass_chime()
    sub_thump()
    airy_swell()
    spin_up_hum()
    collision_tick()
    disk_collapse()
    telemetry_click()
    print("[sfx] done — 9 deterministic assets, seed 0xC0FFEE")


if __name__ == "__main__":
    main()
