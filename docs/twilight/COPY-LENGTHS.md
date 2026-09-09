# Twilight copy length review

Measured the shipped LotR/Shire passport against Twilight before and after the copy edit. Word counts include the visible movie/time cue in scene descriptions. Apostrophes and hyphens stay within words; numbers count as words and punctuation does not. Badge rows are per-badge averages.

| Copy | LotR words | Twilight before | Twilight now | Reduction |
| --- | ---: | ---: | ---: | ---: |
| Badge description | 21.7 | 57.2 | 23.1 | 60% |
| Card snippet | 3.6 | 6.1 | 3.1 | 50% |
| Claim instruction | 7.3 | 14.8 | 5.0 | 66% |
| Scene description | 24.5 | 61.3 | 25.0 | 59% |
| Movie description | 16.7 | 52.4 | 20.6 | 61% |
| Meal description | 18.7 | 47.2 | 19.2 | 59% |
| Bonus description | 26.5 | 52.2 | 20.8 | 60% |
| Introduction body (total) | 39.0 | 85.0 | 33.0 | 61% |

All 33 badge descriptions were reduced by at least half. Descriptions now span 17–28 words, compared with LotR’s 13–35; card snippets span 2–4 words. Twilight has 33 badges to LotR’s 20, so the per-badge comparison avoids counting its larger collection as verbosity.

Also shortened the honor pledge, name prompt, certification copy, team-selection guidance and share status messages. Titles, schedule, unlock conditions, approved artwork and the previously shortened spoken dialogue retain their established content. Scene cues use a compact film/time line; the notes about ambiguous edition timestamps remain in `CONTENT-NOTES.md`.

Edit source: `scripts/twilight/build-content.mjs` for passport prose; team components and `src/data/twilightTeams.js` for team copy. Version 7 refreshes existing guests’ cached content.
