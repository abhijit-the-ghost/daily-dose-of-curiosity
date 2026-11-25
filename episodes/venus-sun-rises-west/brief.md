# Brief — `venus-sun-rises-west` (v2, owner-replaced script)

## 0. Owner decisions that supersede v1

- **Script:** the owner supplied a longer, better explanation. Use it **verbatim**, including "spin". No word-count gate; this is now a **1–2 minute explanation**, not a 20–35 s Short. The expected `word-count` and `duration` warnings from `generate_audio.py` are accepted, not failures.
- **Sources:** owner opened and re-confirmed every URL in `sources.md`. No agent-invented citations.
- **Science fix:** the closing line is now "nearly two months just for sunset" — derived from S3's 116.75-day **solar day**, half of which is ~58 days. The old "wait over a year" line was rejected as wrong.
- **Uranus fix:** "While almost every other planet spins counter-clockwise like an upright top…" — no numeric Uranus tilt is shown; S4 supports the "most planets prograde" framing.
- **Wording:** keep "spin" as written. On-screen labels use `SPIN` / `YEAR` / `SOLAR DAY` to match the narration. The 177° narration maps to S3's `177.36°` chip; S1's "only three degrees" is a different convention and is not relabelled.
- **Animation direction (for Stage 3/5, not built yet):** cinematic hybrid — deterministic Canvas set pieces, upgraded SVG/JSX timing, explicit physics-diagram beats, overlays only when a claim lands. One idea per scene; never everything at once.

---

## 1. Locked script

Source of truth: `episodes/venus-sun-rises-west/script.txt`.

```text
// ACT 1 — THE HOOK
On Venus, the Sun rises in the west and sets in the east—and a single day lasts longer than an entire year. [src: S1, S3]

// ACT 2 — THE WRONG ASSUMPTION
Most people assume that’s because Venus orbits the Sun backward. It doesn't. [src: S4] It travels around the Sun in the exact same direction as Earth. [src: S1, S4, S6] What’s backward is its spin. [src: S1, S4]

// ACT 3 — THE FLIP
While almost every other planet spins counter-clockwise like an upright top, Venus is flipped nearly upside down at a 177-degree tilt, rotating clockwise in extreme slow motion. [src: S3, S4]

// ACT 4 — THE TWO FORCES
Scientists think two forces pulled off this cosmic flip. [src: S4, S5] First, a massive protoplanet likely slammed into young Venus off-center, knocking its spin off balance. [src: S4] Then, over billions of years, the Sun’s gravity tugged on Venus’s thick, crushing atmosphere—acting like a slow-motion brake that eventually reversed its rotation completely. [src: S3, S5]

// ACT 5 — THE PAYOFF
That brake worked so well that one full spin on Venus takes 243 Earth days, while a full trip around the Sun takes just 225. [src: S1, S3]

// ACT 6 — THE VIEW FROM VENUS
Meaning if you stood on Venus, you’d watch the Sun rise in the west—and wait nearly two months just for sunset, while one full spin outlasts its entire year. [src: S1, S3]
```

Six narration acts. Stage 3 will decide the scene/template mapping; scene code must still be a pure function of `t`.

---

## 2. Source map

Full quotes, retrieval notes, and A–E mapping are in `sources.md`.

| Tag | Page | Used for | Owner status |
| --- | --- | --- | --- |
| S1 | https://science.nasa.gov/venus/venus-facts/ | west sunrise/east sunset, 243-day spin, 225-day year, crushing atmosphere | re-confirmed 2026-11-25 |
| S2 | https://science.nasa.gov/venus/ | background only — no direct impact sentence on the current page | opened 2026-11-25 |
| S3 | https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html | 177.36° tilt, −5832.6 h sidereal spin, 116.75-day solar day, 92-bar CO₂ atmosphere | re-confirmed 2026-11-25 |
| S4 | https://www.britannica.com/place/Venus-planet | most planets prograde / Venus retrograde, west sunrise, giant-impact hypothesis | re-confirmed 2026-11-25 |
| S5 | https://www.nature.com/articles/35081000 | atmospheric tides + dense atmosphere driving Venus's retrograde state (Correia & Laskar 2001) | opened 2026-11-25 |
| S6 | https://science.nasa.gov/solar-system/planets/ | background for "almost every other planet" | opened 2026-11-25 |

Retired: the old Britannica Kids URL returned 403 previously and is **not** used. No source is fabricated.

---

## 3. FACTS (single source for every number on screen)

`episodes/venus-sun-rises-west/facts.ts`:

| Key | `value` | `display` | src |
| --- | --- | --- | --- |
| `obliquityDeg` | 177.36 | `177.36° TILT` | S3 |
| `spinDays` | 243 | `243 EARTH DAYS / SPIN` | S1 |
| `orbitDays` | 225 | `225 EARTH DAYS / YEAR` | S1 |
| `solarDayDays` | 116.75 | `116.75-DAY SOLAR DAY` | S3 |
| `sunsetApproxDays` | 58.4 | `~58 DAYS / SUNSET` | S3 (derived: 116.75 / 2) |

No digit for an on-screen number is written in scene code.

---

## 4. Stage 1 grill verdict — **SHIP**

1. **Belief before / after.** Before: "Venus orbits backward, so the Sun rises west." After: "It orbits the same way; its **spin** is reversed, and one spin outlasts its year." The script owns that correction.
2. **Contradiction in one line.** "The Sun rises in the west — and one day lasts longer than a year."
3. **One idea.** Why Venus's sunrise is reversed and why its day outlasts its year. The impact/tide mechanisms serve that one idea; they are not separate videos.
4. **Mute test.** Sun breaking a west horizon → planet flipping nearly upside down → off-center impact → atmospheric brake → 243 vs 225 race → Sun setting after ~58 days. Reads without audio.
5. **Hedge.** "Scientists think", "likely", "over billions of years" preserve S4's "no satisfactory explanation" and S5's model-dependence. No settled-cause claim.
6. **Source discipline.** Six tags, all owner-opened/re-confirmed. Exact quotes in `sources.md`. No recalled URLs, no 403 link.
7. **Comment edge.** "It doesn't orbit backward — so why does the Sun rise west?" invites argument without being wrong.
8. **Second-best moment.** The atmospheric brake visibly slowing the clockwise spin until the 243/225 counters cross.
9. **Loop / ending.** No end card. Last beat returns to the frame-1 west sunrise so a replay cuts cleanly.
10. **Overlap check.** `uranus-tilted-sideways` uses a 97.77° side-on tilt as its proof. This episode's tilt is direction (177°) and its proof is day-vs-year. Different idea.
11. **Ship test (frame 1, sound off).** Huge Venus, Sun on the wrong horizon, clockwise arrow already drawing — the contradiction is visible before any caption.
12. **Runtime.** ~74 s expected at `+12%` (188 `token_count` tokens across 6 acts `[23, 31, 27, 51, 25, 31]`; extrapolated from the old 69-token / 27.02 s take). Within the owner's new 1–2 min range; Stage 4/7 must relax the 60 s verify override.

---

## 5. Stage 2 audio notes

- Voice/rate remain from config: `en-US-AriaNeural`, `+12%`.
- `tail` stays small so the last word hands directly into the loop; expected total ≈ 72–78 s.
- WordBoundary events remain the only timing source — no estimated timings.
- `generate_audio.py --dry-run` will warn on word count and (after synthesis) duration. Both are accepted by owner decision; do not silently edit the script to satisfy them.

---

## 6. Stage gates still ahead

- Stage 3/4 — beat plan, hook stress test, source-anchored beats, no clutter, one idea per scene.
- Stage 5 — scene implementation + full registration; deterministic pure function of `t`.
- Stage 6 — sound: silence ≤10%, max gap ≤0.45 s, −14 ±0.5 LUFS; longer bed already covers 48 s, so it will need a longer deterministic bed or a loop-safe extension.
- Stage 7 — full render, pause before any packaging/posting.
