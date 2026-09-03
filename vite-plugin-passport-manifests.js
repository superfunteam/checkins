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

  return {
    name: 'passport-manifests',

    configResolved(config) {
      outDir = config.build.outDir;
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

    closeBundle() {
      for (const id of listPassportIds()) {
        const passport = readPassport(id);
        const dir = path.resolve(outDir, 'passports', id);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), manifestFor(passport, false));
        fs.writeFileSync(path.join(dir, 'manifest.host.webmanifest'), manifestFor(passport, true));
      }
    },
  };
}
