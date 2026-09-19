# Twilight social artwork

Generated with the built-in `image_gen` tool on September 19, 2026. The full
prompts are in [prompts.json](prompts.json); unmodified PNG outputs are preserved
in `originals/`.

- **Social preview:** Edward, Jacob, and lean, beer-in-hand Charlie using the
  approved team portraits as references. Moonlit Forks, with a large Twilight
  Passport wordmark. Published at
  `public/passports/twilight/assets/images/social/twilight-og-v1.jpg`
  (1200 × 630, approximately 267 KB).
- **Favicon:** a full silver-blue moon on midnight teal. PNG sizes 16, 32, 180,
  192, and 512, plus maskable PWA variants and a multi-resolution ICO, under
  `public/passports/twilight/assets/images/icons/twilight-moon-v1*`.

Only format conversion and size reduction were used after generation. The
artwork and lettering are part of the generated images. Both the original
composition and the production-sized files were visually inspected, including
the favicon at 32 pixels. Versioned filenames avoid old artwork caches without
changing badge, voice, or progress data.

The build emits branded HTML for the dedicated host and `/event/twilight`.
Netlify serves it through explicit rewrites, so Open Graph metadata works without
JavaScript. Both shells use the same app bundle and the appropriate existing PWA
scope. The main Checkins page retains its generic branding. Runtime metadata uses
the same helper, and leaving the passport clears its event-specific image/icons.
See [Netlify's domain-level rewrite documentation](https://docs.netlify.com/manage/routing/redirects/redirect-options/#domain-level-redirects).

Verify the generated HTML and image sizes after a build:

```sh
npm run build
node scripts/twilight/branding.test.mjs
```
