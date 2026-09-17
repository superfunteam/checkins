# Checkins

Badge / check-in passports for in-person events. One build, many passports:
every event lives in `public/passports/<id>/` as a `passport.json` plus assets,
and is served at `/event/<id>` and optionally at `<id>.checkins.party`.

## Run it

```bash
npm install
npm run dev              # http://localhost:5173/event/twilight
npm run dev:twilight     # host mode: the twilight passport at http://localhost:5173/
npm run build && npm run preview
```

`http://twilight.localhost:5173/` also works in Chrome without the env var.

```bash
npm run test:e2e        # party-readiness check in headless Chrome (see scripts/e2e)
```

The e2e run covers onboarding, claiming, secret unlocks, a new build applying
silently only once the guest is idle, a `passport.json` edit appearing without
a reload, a second consecutive update, the Shire passport, and subdomain host
mode. Run it before the event and after any change to `src/pwa/` or
`vite.config.js`.

## Party-day operations (live updates)

Every phone that has the passport open, or added to its home screen, updates
itself with no prompt. Two independent channels:

| What changed | How it reaches guests | Delay |
|---|---|---|
| `passport.json` (new badge, new copy, times, theme) | The open app re-fetches it every 45s and on tab focus, then re-renders in place | ≤ 45s after the deploy finishes |
| App code (anything under `src/`) | The service worker checks for a new build every 60s and on focus, downloads it, and reloads the page the next time the guest is idle (no modal open) or has the tab in the background | ≤ 60s + idle moment |

Guest progress lives in `localStorage`, so a reload lands right back on their
passport with every badge intact.

### Adding a badge mid-event

1. Drop the art in `public/passports/twilight/assets/images/badges/badge-<id>.webp`
   (and a sound in `assets/audio/badges/` if you have one).
2. Add the badge object to `badges` in `passport.json`. Keep `id` stable once
   shipped: that is the key guests' claims are stored under.
3. If a secret badge should depend on it, add its id to that secret's
   `unlockCondition.badgeIds`.
4. Commit, push, let Netlify deploy. Done.

### Replacing art or audio that already shipped

Keep the filename and **bump `version` in `passport.json`**. Asset URLs carry
`?v=<version>`, so the bump makes every phone refetch every asset on its next
poll. Without a bump the new file still wins eventually, just on the next
natural load instead of within a minute.

### Removing a badge

Delete it from `badges`. Guests who already claimed it keep an orphan entry in
localStorage; it is harmless and not shown.

## Hosting: twilight.checkins.party

The app detects `<id>.checkins.party` in the browser and mounts that passport
at `/`. Nothing server-side is host-specific.

Production is live at https://twilight.checkins.party on the Netlify site
`checkins-party`. Netlify builds and publishes `main` using `npm run build`
and `dist`. The subdomain is a site alias with managed Netlify DNS and HTTPS;
no separate Twilight build is needed. Do not set `VITE_HOST_PASSPORT` for the
shared production build, since the apex and other events use the same bundle.

See [the production release record](docs/twilight/DEPLOYMENT.md) for the site
ID and verification details. Open the production URL on a phone and use
"Add to Home Screen" to install the passport.

The PWA manifest for host mode is `/passports/twilight/manifest.host.webmanifest`
(start URL and scope `/`); the path-mode one is `manifest.webmanifest`. Both are
generated from `passport.json` at build time.

## PWA / caching model

- `vite-plugin-pwa` (workbox) is the only service worker. `public/sw.js` is gone.
- Precache: app shell only (`index.html`, hashed JS/CSS, root icons). Passport
  content is **not** precached, so guests never download other events' art.
- Runtime: `passport.json` is NetworkFirst; `assets/**` are
  StaleWhileRevalidate; fonts are cached long-term.
- Update flow lives in `src/pwa/`. `registerServiceWorker.js` polls for new
  builds; `updateGate.js` reloads only when the guest is idle.
- Netlify headers (`netlify.toml`) keep `sw.js`, `index.html`, manifests, and
  `passport.json` at `no-cache` so polls see new deploys immediately.

## Creating a new passport

1. Copy `public/passports/twilight/` to `public/passports/<id>/`, set `id`.
2. Replace art in `assets/images/badges/` and icons in `assets/images/icons/`
   (`icon-192.png`, `icon-512.png`, plus `icon-maskable-*.png`). Keep
   `lock.png` / `lock-ring.png`.
3. Add an entry to `public/passports/index.json`.
4. Optional: a `finale: true` secret badge gets the ring lock and the horn
   sound on unlock.

The Twilight content now includes 20 scene checkpoints, five movie completions,
four meals, and four collection/completion bonuses. See
`docs/twilight/CONTENT-NOTES.md` for schedule and source-cue notes, and
`docs/twilight/VOICE-NOTES.md` for the five-voice character cast, short dialogue,
and film excerpt sources.
All 33 finished illustrations, original PNGs, and a filterable gallery are under
`docs/twilight/final-art/`; the shareable web gallery is
`docs/twilight/twilight-complete-art.zip`. Every Twilight badge uses the Gowalla arch.
Twilight defaults to dark mode, including the first loading frame and exported
certificate. Other events keep their own palette. Dialog transitions preserve
scroll and focus, complete their exits, and respect reduced-motion preferences.
The five approved samples remain under `docs/twilight/art-review/`.
Twilight also includes a required Edward/Jacob/Charlie prediction, an endless
character carousel, a final team confirmation after every badge, and a team
poster with all 33 arches. Portraits and prompts are documented in
`docs/twilight/team-art/README.md`.

`scripts/make-twilight-placeholders.py` creates only missing placeholders and
preserves existing generated art. After changing content, run:

```bash
node scripts/twilight/build-content.mjs
node scripts/twilight/validate.mjs
node scripts/twilight/audio-cache.test.mjs
npm run test:e2e
node scripts/twilight/content-smoke.mjs
# With the development preview running on port 5175:
node scripts/twilight/motion-smoke.mjs
node scripts/twilight/team-smoke.mjs
```

## Admin

`/admin` (password-protected) edits `passport.json` and uploads assets, but the
write API only exists in the Vite dev server. In production it is read-only;
edit the JSON in the repo and deploy.
