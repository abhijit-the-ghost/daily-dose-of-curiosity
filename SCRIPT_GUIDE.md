# SCRIPT_GUIDE.md — writing narration scripts for Daily Dose of Curiosity

Audience: the owner and any AI agent drafting `episodes/<slug>/script.txt`.
Precedence: `AGENTS.md` §2 wins over this file. If they conflict, follow `AGENTS.md`.
The owner locks every script. An agent's output is a draft until the owner approves it.

Check a draft with: `bun scripts/lint_script.mjs <slug>`

---

## 0. Hard rules (from AGENTS.md / owner decisions)

- Use only facts from sources the human owner has opened and confirmed. Never invent or "recall" a source, stat, quote or date. Unconfirmed facts go in a `NEEDS SOURCE` list and stay out of the script.
- Every factual sentence ends with `[src: S#]` (or `[src: S1, S2]`). Questions and the follow CTA are exempt.
- Numbers are spelled out in narration. No digits, `%`, `°`, `$`, `&`. Digits and symbols belong on screen (`facts.ts`), not in `script.txt`.
- Do not hand-estimate word timing. Timing comes only from edge-tts WordBoundary events after `generate_audio.py`.
- Format is locked: **belief → contradiction → mechanism → ONE number shown on screen → one viewer question.** Topics are open.
- `captionStyle: "phrase"`, `endCard: false`. "More words" means a longer script, never bigger captions.
- One variable changes per video, so the feedback loop can tell you something.

---

## 1. Length and pace

Reference: `solar-system-flat-plane` = 150 words in 51.7 s ≈ **2.9 words/second** at the current voice settings. The linter uses that. If you change voice or rate, pass `--wps`.

| Target | Words | Notes |
|---|---|---|
| 60 s | ~175 | trim belief + implication |
| 90 s | ~260 | the reference shape below |
| 120 s | ~350 | add a 4th mechanism step or a second proof, **not** longer sentences |

The locked verify band is 20-35 s (a 45 s override exists). The 60-120 s band is **not** locked yet. Ask the owner before changing verify limits.

---

## 2. Structure and word budget (≈90 s, ≈260 words)

| Beat | Words | Job |
|---|---|---|
| Hook | ≤12 (≤14 if two-beat) | State the contradiction. Claim on screen at frame 0. |
| Belief | 25-40 | What everyone assumes, and why it feels true. |
| Contradiction | 35-50 | First evidence it is wrong or incomplete. |
| Mechanism | 90-110 | Three steps. One visual change per step. |
| Number | 25-35 | ONE hero number, with a comparison a viewer can feel. |
| Implication | 20-30 | What this changes about how they see the thing. |
| Ending | 8-15 | Viewer question (and optionally the CTA). See §5. |

**Re-hook every ≤15-18 s.** A re-hook is a turn: *but, yet, until, except, which means, here's the part nobody says,* or a genuine question. If 20 seconds pass in one flat register, the viewer leaves.

Do not answer the hook in sentence two. Withhold the *why* until the mechanism. Pay it off at the number.

---

## 3. Hooks

The hook states a **tension**, not a topic. Test: could a viewer disagree with it, or feel it can't be true?

| Pattern | Shape | Example (illustrative; sources still required) |
|---|---|---|
| Flat contradiction | "You have never X." | "You have never touched anything in your life." |
| Pop-culture reversal | "Games/movies say X. Reality says Y." | "Space games make explosions loud. Real space gives you silence." |
| Challenge | "Drop X into Y. Does Z?" (two beats, ≤14 words total) | "Drop Everest into the deepest trench on Earth. Does the summit stay dry?" |
| Number tease | Only if the number is counterintuitive **and** sourced | `[number] + [surprising comparison]` |

Anti-patterns (the linter flags the obvious ones):
- Throat-clearing: "Did you know…", "Have you ever wondered…", "In this video…", "So…", "Today we…"
- Topic announcement: "Let's talk about gravity."
- Definition first: "Gravity is a force that…"
- A hook longer than ~4 s spoken.
- Hype adjectives: *insane, crazy, mind-blowing, amazing, literally, basically.*

Always write **three alternative hooks** and pick one. The first idea is usually the generic one.

---

## 4. Writing for the ear

- One idea per sentence. Average ≤14 words, hard cap 22.
- Mix long and short. Put a ≤5-word punch line at every pivot ("Not your phone.").
- Concrete nouns and verbs. Cut *very, really, quite, just, actually* unless they carry meaning.
- Say units: "degrees", "percent", "kilometers".
- No parentheses, semicolons, dashes or ellipses. TTS reads them unpredictably.
- Contractions are fine. Write how a person talks.
- **Show, don't narrate.** If the visual already shows it, don't say it. Write the *visual cue* for each beat in `brief.md`, not in `script.txt`.
- Check pronunciation with `uv run --with edge-tts,mutagen python scripts/generate_audio.py <slug> --dry-run` and swap hard words for simpler ones. Don't respell words in the script; that breaks caption text.

### Not generic: four tests

1. **Swap test.** Could this sentence appear unchanged in a video on a different topic? If yes, cut or make it specific.
2. **Specific-detail test.** Every beat has one concrete noun or number a generic version of this video wouldn't have.
3. **Angle test.** In one line, in `brief.md`: *what does our version say or show that the usual version doesn't?* You, not the agent, must check what existing videos cover.
4. **Sound-check test.** Read it aloud once. Anywhere you stumble, rewrite.

---

## 5. Endings (choose one, record it as the episode's variable)

The ending is the last sentence(s) of `script.txt`, so it is voiced by the same TTS, gets WordBoundary timing, and shows in the phrase captions. No separate audio file or end card.

**A. Viewer question (default; owner decision D2: preference / would-you-rather).**
- Two real options drawn from the video's content: "Would you rather stand on the summit or the trench floor?"
- Answerable in five seconds without research.
- Avoid "Thoughts?", "What do you think?", "Comment below."
- Not a factual claim, so no `[src]`.

**B. Spoken CTA.** One short last sentence: **"Follow for more."** (≤5 words). It is exempt from `[src]`.

**C. Question then CTA.** Question, then "Follow for more." Use this deliberately, as the variable under test.

Rules: the CTA is the last sentence only. No "like and subscribe". The ending should not answer the hook again; it hands the viewer a question that makes them want to watch once more. Which ending performs better is unknown until you have data. Don't declare one better without your own post stats.

Lint modes: `--ending question`, `--ending cta`, `--ending both`, or default `any`.

---

## 6. The number

The format shows **one** number on screen. Write the sentence so the number lands on the *last* stressed word, then holds for 2+ seconds on screen with a comparison.

- Narration: spelled out ("eight thousand eight hundred forty-nine meters").
- Screen: digits, from `FACTS` in `facts.ts` (single source of truth).
- State assumptions on screen (footnote), not buried in narration. Simplifications must be named.

---

## 7. Agent drafting prompt (paste this)

```
You are drafting a narration script for the Daily Dose of Curiosity pipeline.
Read AGENTS.md, INSTRUCTIONS.md and SCRIPT_GUIDE.md first. AGENTS.md §2 wins.

INPUTS (provided by the owner; do not add to them):
- Topic / claim: <...>
- Confirmed sources (S1..Sn, each opened by the owner): <URL + what each supports>
- Target length: <60 | 90 | 120> s  (≈2.9 words/second)
- Ending mode: <question | cta | both>
- The ONE variable this video tests: <...>

RULES:
- Use only facts the confirmed sources support. Anything else goes under NEEDS SOURCE and stays out of the script.
- Structure: hook → belief → contradiction → mechanism (3 steps) → ONE number → implication → ending.
- Spell out all numbers. No digits or symbols. Every factual sentence ends with [src: S#].
- Re-hook at least every 15-18 s. Average sentence ≤14 words.
- Do not invent statistics, quotes, dates, or sources.

DELIVER:
1. script.txt (target word count)
2. Claims table: sentence → source → exact supporting claim → confidence
3. Math for every derived number
4. Three alternative hooks, each ≤12 words
5. Three alternative endings (two questions with two concrete options, one CTA)
6. One-line angle: what this version says that the usual version doesn't
7. Risks: simplifications, assumptions that must be shown on screen
8. NEEDS SOURCE list

If you have shell access, run `bun scripts/lint_script.mjs <slug>` and fix every ERROR
before replying. Paste the final lint output. Do not edit sources.md. Do not commit or push.
```

---

## 8. Workflow

1. Owner picks a topic and opens/confirms sources.
2. Agent drafts using §7. Linter: zero ERRORs.
3. Owner reads it aloud, picks the hook, locks `script.txt`.
4. `generate_audio.py` produces real WordBoundary timing; beats and SFX anchor to that.
5. After posting, record the one variable and the result. Don't compare platforms directly.

## 9. Linter limits

`lint_script.mjs` checks structure, length, hook shape, banned and generic phrases, digits and symbols, re-hook spacing, ending, and `[src]` coverage against `sources.md`. It does **not** verify that a source is real, was opened, or supports the sentence, and it cannot judge whether a script is interesting. Checks marked *(heuristic)* are prompts, not verdicts. Time estimates are word-count estimates only.
