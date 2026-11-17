# nuclear-gandhi — sources

| tag | Source | Supports | Opened? |
|---|---|---|---|
| sk | NZ Skeptics (Mark Honeychurch) — "Nuclear Gandhi", 2022-01-03 · https://articles.skeptics.nz/2022/01/03/nuclear-gandhi | Brian Reynolds (Civ II lead) remembers 3 aggression levels — not 10 or 12;
leadership lowest shared by one third of leaders; no unsigned variable in that part of the code; 255 would act like 3; most leaders go nuclear-ish after nukes, but the effect is "most leaders", not Gandhi alone; Civ V deliberately programmed Gandhi to max nuke values. | Opened in-browser by agent this session (full article). Human must open before posting. |
| wp | Wikipedia — "Nuclear Gandhi" (rev. 1360571729, 2026-11) · https://en.wikipedia.org/wiki/Nuclear_Gandhi | The popular story (aggression 1 → democracy −2 → unsigned wrap to 255);
Sid Meier (memoir, 2020, pp.261–266): integers signed by default in C and C++; underflow would not have occurred; government form does not affect AI aggressiveness; Gandhi's aggression stayed the same all game;
Brian Reynolds: 3 aggression levels, Gandhi not sole lowest, no unsigned variable;
Civilization V, design lead Jon Shafer set Build Nuke and Use Nuke to 12 (max) deliberately as a joke;
TV Tropes user Tunafish added the bug claim 2012-07-17; Kotaku republished the story 2016 after a Reddit-triggered wave (Feb 2014); myth cemented by Civ V as in-joke-turned-feature. | Opened in-browser by agent this session (body + all cited references). Human must open before posting. |
| kk | Kotaku — Luke Plunkett, "Why Gandhi Is Such An Asshole In Civilization" (2016-03-02; original cited claim; Story updated noting Sid Meier debunked it) · https://kotaku.com/why-gandhi-is-such-an-asshole-in-civilization-1653818245 | The source article of the myth as told to popular media: Gandhi rating 1; democracy −2; unsigned 8-bit wrap → 255; Gandhi nukes heavy in-game; Civilization V nuke rating 12 vs next 8. | Opened in-browser by agent this session (full article + sticky update banner debunking itself). Human must open before posting. |
| tt | TV Tropes — edit history for "VideoGame/Civilization" (archived 2012-09-01) · https://web.archive.org/web/20120901052801/http://tvtropes.org/pmwiki/article_history.php?article=VideoGame.Civilization&more=t | 2012-07-17 02:17:20 Tunafish added the bug claim. Primary-source proof that the myth originated here, not in Civilization II's actual code. | Opened in-browser by agent this session (archived page, 419+ edit history rows inspected). Human must open before posting. |

## Not usable / not used

- **gamingbible.com** — URL in the source batch is 410 Gone even via Wayback (page deleted before our session). Its claim (Tunafish 2012 = origin) is verified directly via the archived edit history (tt). No reliance on the article text itself.
- **Sid Meier's Memoir! (2020)** — referenced via Wikipedia citations pp.261–266. Book not opened this session; the claim "bug fabricated" is attributed to Wikipedia's summary of the book, not to a page the agent read.
- **No other sources cited**. DTF.ru is referenced by Wikipedia but never opened by agent or owner this session.
- **No claim about**: Harvard teaching the example; the memoir being used as Harvard curriculum; the bug "fix" version; whether the Firaxis devs "kept it as a joke" in Civ V on purpose beyond Shafer's design setting; any claim that Gandhi's nuclear tendency in-game is empirically wrong outside this paper trail.

## What the script claims (all on screen or in VO)

| claim | on screen | source |
|---|---|---|
| "The most famous game bug never existed" | VO + captions + title | wp, sk |
| Gandhi's aggression rating was 1 | VO + captions | wp, kk, sk |
| Democracy drops aggression by 2 | VO + captions + ink-amount "2" | wp, kk, sk |
| Unsigned 8-bit integer wraps `1 - 2` to 255 | VO ("integer wraps to 255") + span numeral "255" | wp, kk |
| Sid Meier says C and C++ ints are signed by default | VO | wp (via memoir) |
| Government never changed AI aggression | VO | wp (via memoir) |
| Brian Reynolds remembers 3 aggression levels | VO + `3` numeral | sk, wp |
| CIV V's Gandhi got Nuke Build = 12 and Nuke Use = 12, set deliberately by Shafer | VO + `12` and `12` numerals | wp |
| The bug never happened | VO + stamp | wp |
| The joke did | VO + stamp artwork | wp |

## Human confirmation gate

Before publishing, a human must open every row marked "must open before posting" and confirm the narration faithfully
renders them, then flip the status lines in this file and in `episodes/nuclear-gandhi/meta.json`.
