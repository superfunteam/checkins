/**
 * Emits a real web app manifest for every passport so add-to-home-screen works
 * on both `/event/<id>` and a dedicated host like `<id>.checkins.party`.
 *
 *   /passports/<id>/manifest.webmanifest       scope + start_url = /event/<id>
 *   /passports/<id>/manifest.host.webmanifest  scope + start_url = /
 *
 * Dev: served by middleware from the live passport.json.
 * Build: written into dist/passports/<id>/ after the bundle is emitted.
 */
import fs from 'fs';
import path from 'path';
import { generateManifest } from './src/utils/manifestGenerator.js';
import { renderPassportMetadata } from './src/utils/passportMetadata.js';

const PASSPORTS_DIR = path.resolve('public/passports');
const MANIFEST_RE = /^\/passports\/([a-z0-9-]+)\/manifest(\.host)?\.webmanifest$/;

function readPassport(id) {
  const file = path.join(PASSPORTS_DIR, id, 'passport.json');
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listPassportIds() {
  if (!fs.existsSync(PASSPORTS_DIR)) return [];
  return fs
    .readdirSync(PASSPORTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((id) => fs.existsSync(path.join(PASSPORTS_DIR, id, 'passport.json')));
}

function manifestFor(passport, hostMode) {
  const basePath = hostMode ? '/' : `/event/${passport.id}`;
  return JSON.stringify(generateManifest(passport, { basePath }), null, 2);
}

export function passportManifestsPlugin() {
  let outDir = 'dist';
  let forcedPassport = '';

  return {
    name: 'passport-manifests',

    configResolved(config) {
      outDir = config.build.outDir;
      forcedPassport = config.env?.VITE_HOST_PASSPORT || '';
    },

    // Seed the event surface before React or web fonts load, avoiding a light
    // flash when opening a dark passport. Full theme application stays in React.
    transformIndexHtml(html, context) {
      const themes = Object.fromEntries(listPassportIds().map(id => {
        const { theme } = readPassport(id);
        return [id, { mode: theme.mode || 'light', bg: theme.colors.background['100'], text: theme.colors.text['800'], muted: theme.colors.text['600'], primary: theme.colors.primary['500'] }];
      }));
      const encoded = JSON.stringify(themes).replaceAll('<', '\\u003c');
      const forced = JSON.stringify(forcedPassport).replaceAll('<', '\\u003c');
      const script = `(() => {
        if (location.pathname.startsWith('/admin')) return;
        const pathId = location.pathname.match(/^\\/event\\/([a-z0-9-]+)(?:\\/|$)/)?.[1];
        const hostId = /^(?:[a-z0-9-]+)\\.(?:checkins\\.party|localhost)$/.test(location.hostname) ? location.hostname.split('.')[0] : '';
        const theme = (${encoded})[pathId || ${forced} || hostId];
        if (!theme) return;
        const root = document.documentElement;
        root.dataset.passportTheme = theme.mode;
        root.style.colorScheme = theme.mode;
        for (const [key,value] of Object.entries({'background-100':theme.bg,'text-800':theme.text,'text-600':theme.muted,'primary-500':theme.primary})) root.style.setProperty('--color-'+key,value);
      })();`;
      html = html.replace('<!-- Primary Meta Tags -->', `<style>html[data-passport-theme],html[data-passport-theme] body{background:var(--color-background-100);color:var(--color-text-800)}</style><script>${script}</script>\n    <!-- Primary Meta Tags -->`);
      const pathId = context?.originalUrl?.match(/^\/event\/([a-z0-9-]+)(?:\/|\?|$)/)?.[1];
      const passport = pathId || forcedPassport ? readPassport(pathId || forcedPassport) : null;
      return passport?.meta.socialImage ? renderPassportMetadata(html, passport) : html;
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = (req.url || '').split('?')[0].match(MANIFEST_RE);
        if (!match) return next();
        const passport = readPassport(match[1]);
        if (!passport) return next();
        res.setHeader('Content-Type', 'application/manifest+json');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(manifestFor(passport, Boolean(match[2])));
      });
    },

    writeBundle() {
      const html = fs.readFileSync(path.resolve(outDir, 'index.html'), 'utf8');
      for (const id of listPassportIds()) {
        const passport = readPassport(id);
        const dir = path.resolve(outDir, 'passports', id);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), manifestFor(passport, false));
        fs.writeFileSync(path.join(dir, 'manifest.host.webmanifest'), manifestFor(passport, true));
        if (passport.meta.socialImage) {
          // Netlify rewrites both public entry URLs to these crawlable shells.
          // Keep the same app bundle and routes; only head metadata differs.
          fs.writeFileSync(path.join(dir, 'index.html'), renderPassportMetadata(html, passport, {
            manifest: `/passports/${id}/manifest.host.webmanifest`,
          }));
          fs.writeFileSync(path.join(dir, 'event.html'), renderPassportMetadata(html, passport, {
            manifest: `/passports/${id}/manifest.webmanifest`,
          }));
        }
      }
    },
  };
}
