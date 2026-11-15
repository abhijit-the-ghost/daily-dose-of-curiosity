# Daily Dose of Curiosity — programmatic vertical videos

Channel: **Daily Dose of Curiosity** — gaming · science · verified facts.
Format: short-form (YouTube Shorts / Instagram Reels / TikTok, 9:16 1080×1920)
generated with code: **React + deterministic scenes**, **free neural TTS**
(edge-tts), **2D SVG composition**, **Tailwind CSS v4**, and **puppeteer + ffmpeg**
for frame-capture encoding. (No 3D engine — SVG only.)

Episodes:
1. **“Why You've Never Seen a Real Photo of the Milky Way”** (default) — Act 1 · The Lie → Act 2 · The Scale Problem → Act 3 · Voyager 1 Reality Check → **branded end card** (logo + Pirata One lockup + FOLLOW + confetti). Pure 2D SVG: 3-layer parallax starfield, spiral vector galaxy, Voyager scale ruler, telemetry card, stamp overlay. Render: `bun run render` (view at `/`).
   Voiceover: `uv run --with edge-tts,mutagen python scripts/generate_audio.py milkyway` (or `bun run generate:milkyway`)
2. **“What actually happens when you type a URL?”** — Act 1 · DNS → Act 2 · Routing (2D) → Act 3 · Server response. Render: `bun run render -- --episode url-explainer` (view at `/episode?episode=url-explainer`).
3. **“Space games make explosions loud — real space gives you silence.”** — Act 1 · The Lie → Act 2 · The Scale → Act 3 · The Truth. Render: `bun run render -- --episode space-sound` (view at `/episode?episode=space-sound`).
4. **“How long to walk to the edge of Minecraft?”** — Act 1 · The Question → Act 2 · The Math → Act 3 · The Scale. ~29 s · 1080×1920 · verified facts (S1/S2/S3/D1/D2 in `results/videos/minecraft-edge/about.txt`). Render: `bun run render -- --episode minecraft-edge` (view at `/episode?episode=minecraft-edge`).
5. **“You have never touched anything in your life”** — Act 1 · The Hook (hand vs neon barrier) → Act 2 · The Science (two electron clouds + electromagnetic repulsion + Pauli exclusion labels) → Act 3 · The Payoff (Curiosity stickman hovering over energy waves — "HOVERING."). cyan/violet palette · verified facts (S1/S2 in `results/videos/never-touch/about.txt`) · 29 s. Render: `bun run render -- --episode never-touch` (view at `/episode?episode=never-touch`).

6. **Studio dashboard** — `bun run dev` and open `http://localhost:5173/`. Built with react-router-dom + TanStack Query + lucide-react. Routes: `/` (overview, latest-first), `/videos`, `/videos/:slug` (per-platform artwork + meta + about + MP4 download), `/assets` (shared-assets kit). Generated manifest: `bun scripts/admin_manifest.mjs` → `public/admin-manifest.json` (gitignored).

See **VIDEO_PRODUCTION.md** for the full playbook + per-episode recipes.

## Pipeline (run in order)

| Step | Command | Output |
| --- | --- | --- |
| 1. Voiceover | `bun run generate:audio` | `public/audio/act{1,2,3}_*.mp3` + `manifest.json` |
| 2. Preview | `bun run dev` | Interactive 9:16 stage at localhost:5173 (PLAY / scrub) |
| 3. Frame check | `bun run shot "0.5,10,30"` | PNGs of any timeline point → `%TEMP%/internet-shorts-shots/` |
| 4. Smoke render | `bun run render:smoke` | `output/…mp4`, first 3 s only |
| 5. Full render | `bun run render` | `output/url-explainer-1080x1920.mp4` |

`bun run shot` and `bun run render` need no manual dev server — they spawn vite themselves.

## How it works

1. **`scripts/generate_audio.py`** — unified edge-tts generator (Microsoft neural voices, free, no API key; `uv` manages the Python). Reads `episodes/<slug>/script.txt` + `scene.json`, measures each MP3 (mutagen), writes `public/audio/<slug>/metadata.json` (fps, totalDuration, per-act word streams with per-word `start`/`end`, act boundaries derived from token counts — never hand-tuned). The url-explainer legacy uses `scripts/generate_url_explainer_audio.py` (multi-file manifest layout).
2. **`src/App.tsx`** — the 9:16 stage + *audio sync controller*. The whole visual stage is a
   **pure function of `time`** (seconds). Nothing reads the wall clock: no CSS animations,
   no `Date.now()`. Therefore `window.__seek(t)` renders the identical frame every time.
   - preview mode: rAF clock + `<audio>` elements, Play/Pause/scrub.
   - record mode (`?record=1`): no chrome or audio; external seek only.
   - bottom **karaoke captions**: narration is embedded in the manifest as word-level
     timings (edge-tts `WordBoundary`); the spoken word pops amber (Anton, block weight),
     earlier words stay white, upcoming words stay dim. Chunks split at natural pauses.
3. **`src/components/{DNSScene,RoutingScene,ServerScene}.tsx`** — the three acts.
   All motion (typing, packet flight, pops, confetti) is computed inline from
   `t`/`p` passed as props. **RoutingScene** embeds a three.js scene (globe, route
   arcs, packet pulse, starfield) — rendered on each committed `time`, keeping the
   determinism rule. A cinematic grade sits on top: vignette, deterministic film
   grain (seeded per frame), `saturate/contrast` CSS filter, white flash at act cuts.
4. **`scripts/render_video.mjs`** — vite build → vite preview → puppeteer 1080×1920;
   for every frame: `__seek(t)` → wait for `window.__committedFrame === t` → JPEG,
   then ffmpeg (`ffmpeg-static`) mixes the act MP3s at their manifest offsets
   (`adelay` + `amix`) over the mjpeg sequence → H.264 High + AAC, `+faststart`.

## Project layout

```
public/audio/            generated MP3s + manifest.json (do not hand-edit)
shared-assets/           channel-wide brand library (single source; imported via vite)
  brand/logo.png         the channel logo (Daily Dose of Curiosity)
  brand/fonts/           Pirata One (OFL) — end-card block calligraphy
  LICENSES.md            attribution registry for every external asset
scripts/generate_audio.py            unified TTS generator (scripts/generate_url_explainer_audio.py = url-ep legacy)
scripts/render_video.mjs   frame capture + encode
scripts/dev_shot.mjs       screenshot dev-tool (ephemeral ports, 127.0.0.1 binding)
src/App.tsx                stage + sync controller + cinematic grade (vignette/grain/flash)
src/components/            DNSScene / RoutingScene (three.js globe) / ServerScene (end card)
results/videos/<topic>/    ready-to-post package: video.mp4 + about.txt
frames/  output/           render working dir / final MP4s (gitignored)
```

## Gotchas on this machine

- edge-tts runs via `uv run --with edge-tts,mutagen python …` — uv manages a private CPython,
  so the Windows Store `python.exe` stub is no longer used.
- Bun does not run untrusted lifecycle scripts by default; after `bun add -d ffmpeg-static`
  run `bun node_modules/ffmpeg-static/install.js` once to fetch `ffmpeg.exe`.
- `bun run shot "a,b,c"` — quote the time list, PowerShell parses commas as arrays otherwise.

## Customizing the episode

- New voice / faster pace: `uv run --with edge-tts,mutagen python scripts/generate_audio.py <slug> --force`
  (voice/rate live in `episodes/<slug>/scene.json` — change them there, then re-render;
  scenes read the timeline from metadata.json, nothing else to touch).
- New topic: `episodes/<slug>/script.txt` (+ `scene.json`) → `bun run generate:<slug>` →
  wire `src/components/<Ep>.tsx` and `?episode=<slug>` in `src/App.tsx`, then re-baseline (framemd5).

## Not included (yet)

Auto-upload to Shorts/Reels/TikTok — planned as a separate phase (API credentials required).
