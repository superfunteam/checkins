# Twilight content handoff

Completed scope: 33 badges with finished illustrations, 33 character dialogue clips, and three greetings. The five approved samples are retained; the remaining 28 illustrations follow that direction. All Twilight badges use the Gowalla arch shape, including the grid, detail sheet, collection reveals, and certificate. All copy, voice casting/direction, narration scripts, and art prompts are in `production.json`; `scripts/twilight/build-content.mjs` builds the passport from this authored content. The build script and `scripts/twilight/voice-lines.mjs` are the editing sources; `production.json` is the generated review manifest.

## Host schedule

Arrival/setup 10:30 a.m.; brunch at 11; Twilight actually started at 11:35. All film and scene cues, plus subsequent meals, move 35 minutes later with the existing breaks preserved: Twilight ends about 1:32 p.m.; lunch at 1:35; New Moon 1:40–3:45; snack 3:50; Eclipse 3:55–5:58; Breaking Dawn Part 1 6:05–7:57; dinner 8; Breaking Dawn Part 2 8:05–9:58; farewell credits through 10:07 p.m. Arrival and brunch retain their original times. Later times are projections from the host's estimates, not independently verified edition runtimes.

Scene wall-clock times add the first sheet's offsets to the second sheet's film starts. Seconds remain in `movieOffset`; wall-clock labels round down to the minute. The app instructs guests to follow the on-screen scene if playback differs. No source timecode has silently been replaced.

## Scene cues to spot-check against the actual playback files

- Twilight's 1:04 row combines the Cullen-house visit and the meadow's glittering-skin reveal. Those are distinct moments, represented by the paired checkpoint **A Very Sparkly Secret**.
- Eclipse's 0:47 row says “Edward's backstory.” Eclipse prominently features Rosalie's and Jasper's histories. **A Century of Secrets** keeps the host offset and treats it as Cullen family history, rather than silently relabeling a specific flashback. Edward's Chicago/influenza origin is contextual lore, not a claim that the film shows that scene at 0:47.
- The host puts Bella's requested kiss at 1:17 and the tent at 1:34. In the film's narrative, the requested kiss follows the overnight camp. These offsets need a check in the actual edition. The copy distinguishes the requested kiss from Jacob's earlier unwanted kiss.
- The Breaking Dawn Part 2 battle is ultimately shown as Alice's vision of a possible outcome. The copy accounts for the reveal rather than recording those deaths as events that permanently happen.
- Imprinting is presented as protection of a child, not a romance between a child and an adult. The saga's fictional wolf mythology is not presented as real Quileute tradition.

## Lore references

The host's screenshots provide the checkpoint list and schedule. Canon context was cross-checked against [Stephenie Meyer's Breaking Dawn FAQ](https://stepheniemeyer.com/the-books/breaking-dawn/frequently-asked-questions-breaking-dawn/), [Eclipse FAQ](https://stepheniemeyer.com/frequently-asked-questions-eclipse/), [New Moon Q&A](https://stepheniemeyer.com/2009/11/new-moon-qa-with-stephenie/), the [Eclipse film plot](https://en.wikipedia.org/wiki/The_Twilight_Saga:_Eclipse), and [licensed Eclipse clip descriptions](https://visual-icon.com/title/detail/?id=18602). Badge lore is newly written. Short voice lines mix sourced film dialogue with explicitly labeled original character quips; sources are in `VOICE-NOTES.md` and `production.json`. No film soundtrack audio is used.

## Audio

All 36 clips use Eleven v3 (`eleven_v3`) at natural speed, with nine distinct voices created through Eleven v3 Voice Design (`eleven_ttv_v3`). Full acoustic and character traits are sent during voice creation; per-line emotion and delivery tags are included in the speech request. The spoken lines remain short. See `VOICE-NOTES.md` for casting, exact submitted text and source attribution, and `audio-validation.json` for measured duration and transcription results. Receipts record actual API payloads, voice-design hashes, audio hashes and request IDs. Generation stages candidates; publication requires the complete set to pass transcript and freshness checks. Emotional quality remains a listening judgment. The app plays at normal rate, and version 8 refreshes cached audio.

## Existing behavior

Stable IDs are preserved, including `breakfast` for Brunch and `late-night-snack` for Snack Break. All-movies requires five movie badges; all-scenes requires twenty scene badges; all-meals requires the four meals; Immortal requires those three bonuses. Passport version 9 refreshes the revised baseball art. All four locked Twilight secrets use the standard lock; the Shire finale retains its ring. The existing layout, schedule sheet, and claim flow remain in use. Twilight defaults to a dark blue-green palette with silver and burgundy accents, regardless of browser color preference. Its background is applied before React loads to avoid a bright initial frame; Shire retains its own theme. Motion now uses brief transform/opacity transitions, complete exit animations, fixed-height badge swipes, scroll/focus restoration, and reduced-motion handling. Loading prepares the first badge rows with a timeout and never waits for audio readiness. Certificate export expands vertically for the larger badge set and uses the Twilight filename.

Production is live at [twilight.checkins.party](https://twilight.checkins.party). Netlify builds the shared app from `main`; the Twilight subdomain selects this passport at `/`. See `DEPLOYMENT.md` for the release and verification record.

## First instinct and final verdict

Twilight's `teamPoll` feature adds Edward, Jacob, and Charlie to a looping character carousel after the introduction. Guests must confirm their first choice to enter the passport. Existing guests without a choice receive the poll without losing badges. Full-body portraits use alpha transparency and independent glowing platforms. Charlie’s revised portrait follows the host’s Billy Burke references: leaner frame, weary expression, loose tan overshirt, faded gray tee and a beer can.

The final poll waits for all 33 badges and every queued bonus reveal to finish. It preserves the first choice while recording a separate final choice. The poster uses the final team's silver-blue, copper, or evergreen palette, includes all 33 arches and a full character pose, and records loyalty or a changed heart. Guests can download the PNG, open their device's share sheet where supported, or change their final team. All state stays in the same per-passport local storage; no aggregate tally or automatic publishing is added. Reset clears both choices. Shire has no team poll.

Portrait originals, final prompts, and asset paths are in `team-art/`. These are separate character assets, not extra badges; the collection remains 33.

## Copy length

The LotR passport averages 21.7 words per badge description; Twilight now averages 23.1, down from 57.2. Every description was cut by at least half. Snippets average 3.1 words and instructions use five words. Onboarding, certification and team copy were shortened too. The detailed comparison is in `COPY-LENGTHS.md`.
