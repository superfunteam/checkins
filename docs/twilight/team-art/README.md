# Choose your forever

Three full-body, transparent character portraits generated with the built-in image tool. Original PNGs are preserved in `originals/`; optimized 768 × 1152 WebPs with alpha are in `public/passports/twilight/assets/images/teams/` at the repository root. The complete final prompt for each portrait is in [manifest.json](manifest.json).

| Team | Art direction | App / poster color |
| --- | --- | --- |
| Edward | Pale, bronze-haired vampire in a tailored charcoal coat | Moonlit silver-blue |
| Jacob | Warm, athletic, leather-jacketed companion | Copper and amber |
| Charlie | Lean Billy Burke-inspired Charlie; mustache, worn overshirt, gray tee, beer can | Evergreen and sage |

All three portraits were visually inspected. Edward and Jacob retain their generated alpha. Charlie’s revised generation included a checkerboard, removed during cutout packaging; glowing platforms are drawn by the app, so the active character's platform can be highlighted independently.

The first poll uses an endless, swipeable carousel with one centered figure and the neighboring characters peeking in from both edges. Arrow buttons, keyboard controls, and three radio indicators offer equivalent selection. Browsing does not record a vote; confirming does.

The first pick remains in the guest's existing local passport storage. After all 33 badges are claimed and every bonus reveal closes, the final poll asks them to confirm or change teams. Returning guests resume an unanswered poll; a confirmed final pick is not asked again on reload. The full collection poster shows the final team, the character pose, all 33 arch badges, and whether the guest stayed or switched. Guests can reopen the poster or revise the final team from the completed passport.

The app prepares an image before offering Web Share, keeping the native share action directly tied to the guest's tap. PNG download is always available. No poll totals are collected or invented, and no share is sent automatically.
