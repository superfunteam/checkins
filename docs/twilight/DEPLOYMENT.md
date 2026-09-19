# Twilight production release

- URL: https://twilight.checkins.party
- Published: September 17, 2026, 20:26 UTC.
- Application commit: `9dae1fcb9488d89b1e96d824ecede81af084b7fc`.
- Initial production deploy: `6aac4cadadcf550008938ba9`.
- Netlify site: `checkins-party` (`75c612bd-163c-48a9-98f4-91ba57bbbbc4`).
- Git repository: `superfunteam/checkins`; production branch: `main`.
- Build: `npm run build`; publish directory: `dist`.

The release fast-forwarded `main` to the tested Twilight branch. Netlify's Git
integration built and published it successfully. Subsequent pushes to `main`
use the same deployment pipeline.

The Twilight hostname is an alias on the existing site. Netlify manages its
DNS record, and the issued `*.checkins.party` certificate covers HTTPS. The
apex remains `checkins.party`. The client routes the Twilight hostname to its
passport at `/`; do not force `VITE_HOST_PASSPORT` in production.

## Initial release verification — September 17, 2026

- Full local end-to-end suite and Twilight content validation passed before
  release, including silent updates, bonus claims, and Shire regression.
- Google and Cloudflare public DNS both resolve the new hostname.
- HTTPS certificate validation succeeds for the Twilight hostname.
- Published passport JSON exactly matches content version 7 in the repository:
  33 badges, short copy, and team selection enabled.
- All 72 published content assets match local SHA-256 hashes: 33 badge images,
  three character portraits, and 36 replacement audio clips.
- The root PWA manifest has `/` for both start URL and scope. The passport
  configuration is served with `Cache-Control: no-cache`.
- A fresh mobile browser profile passed production-root onboarding, Charlie
  selection, dark mode with a light browser preference, all 33 loaded arches,
  and real-click playback of the new scene audio. Completing the collection
  opened the final team choice and downloaded a Charlie poster with all 33
  badges. The apex landing page and Shire's 20-badge passport also passed.

Some resolvers may retain the earlier negative DNS response during initial
propagation. Public DNS answers were used directly for HTTPS asset and browser
verification without disabling certificate checks. Browser QA used an isolated
profile; it did not change any guest's existing progress.

## Audio release — September 19, 2026

Content version 8 replaces all 36 Turbo recordings with Eleven v3 dialogue.
Nine distinct character voices were created with Eleven v3 Voice Design using
full acoustic and character profiles. Every clip includes explicit emotion
and delivery cues in its submitted speech text and uses natural speed 1.0.
Generation receipts and transcript checks cover the exact audio hashes.
The content-version bump invalidates cached clips without resetting claims
or team choices. Listening samples and the full review are in `VOICE-NOTES.md`.

## Baseball art and secret locks — content version 9

Twilight’s final mystery badge now uses the same lock as the other secrets. The Shire ring remains specific to its Ringbearer badge. Vampire Baseball has a new natural pitching composition, with the previous original preserved for reference. Version 9 changes the asset URLs so cached phones receive the replacement while keeping their existing badge claims and team choice.
