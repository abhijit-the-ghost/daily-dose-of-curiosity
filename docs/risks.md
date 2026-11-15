# Risks — audio pipeline and other known exposures

## edge-tts (Microsoft Edge neural TTS endpoint)

- **What we use it for:** voiceover generation for every episode (`en-US-AriaNeural`),
  invoked via `edge-tts` (Python, `uv run --with edge-tts,mutagen`).
- **Known fact:** edge-tts talks to an **unofficial, undocumented** Microsoft
  endpoint intended for Edge browser read-aloud. It is not a paid API and not
  contractually supported for production fan-outs.
- **Failure modes observed / plausible:**
  - Sudden endpoint breakage (the pipeline already saw HTTP 503 once — recovered on retry, but it could become permanent).
  - Rate limiting / IP blocks under heavy regeneration.
  - Voice model updates that change prosody and word timings (word boundaries are NOT guaranteed stable across service versions — re-synthesizing an existing episode can move beats without any local change).
  - Possibly unsupported commercial use — Microsoft has not issued terms for this path.
- **Mitigation current:** existing MP3s for shipped episodes are kept (never auto-regenerated), metadata is committed, renders are reproducible from committed bytes.
- **Issue owner action:** do NOT publish generated audio publicly outside the
  intended YouTube/Instagram/TikTok distribution without confirming current Microsoft terms with a human.
- **Alternatives to evaluate later (do not switch now; owner approval required):**
  - **Azure AI Speech** — `en-US-AriaNeural` exists there officially; same voice,
    real contract, free tier available. Likely near-zero audible difference.
  - **ElevenLabs free/paid neural voices** — very reliable; paid for production volume.
  - **Piper / Coqui XTTS / Kokoro (local open-weight)** — fully offline, no ToS ambiguity;
    quality and voice identity trade-off; better long-term control.
- **Do not "just switch" scripts.** Any swap changes voice identity of every episode
  and the captions/beats derive from that audio. Requires owner sign-off and a
  regeneration + re-baseline pass.

## Sources & claims

- Every factual statement shipped in an episode carries an **S-tag** in its
  `episodes/<slug>/script.txt`. Packaging (`results/<slug>/about.txt`) fails
  closed — if a link is not opened and confirmed by a human, the corresponding
  line must remain marked `NEEDS HUMAN CONFIRMATION` and the episode must not
  be posted.
- The agent must never invent or "recall" numbers or links; human verifies them.

## Platform contracts

- YouTube Shorts / Reels / TikTok policies, attribution wording, and AI-disclosure
  requirements change frequently. Owner must verify current platform terms before
  first posting, especially anything phrased as "this video is largely AI-generated audio vibe".

## Minecraft facts pinning

- `episodes/minecraft-edge/about.txt` documents the Java Edition assumptions
  (±29,999,984 blocks, walk 4.317 blocks/s, sprint 5.612 blocks/s, 1 block = 1 m,
  flat ground, nonstop). The Minecraft wiki values can shift; the human verifier
  should re-open the wiki pages before posting the episode.
