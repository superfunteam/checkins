/** Run after npm run build: validate the HTML a crawler receives without JS. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getPassportMetadata, renderPassportMetadata } from '../../src/utils/passportMetadata.js';
import { generateManifest } from '../../src/utils/manifestGenerator.js';

const passport = JSON.parse(fs.readFileSync('public/passports/twilight/passport.json'));
const image = 'https://twilight.checkins.party/passports/twilight/assets/images/social/twilight-og-v1.jpg';
const shared = fs.readFileSync('dist/index.html', 'utf8');
const script = html => html.match(/<script[^>]+src="([^"]+\.js)"/)?.[1];
assert(shared.includes('<title>Checkins - Badges and Check-ins for Events</title>'));
assert(shared.includes('content="https://checkins.party/unfurl.png"'));
assert(!shared.includes('twilight-og-v1.jpg'), 'Keep the main Checkins site branding');

for (const [file, suffix, scope] of [['index.html', '.host', '/'], ['event.html', '', '/event/twilight']]) {
  const html = fs.readFileSync(`dist/passports/twilight/${file}`, 'utf8');
  assert(html.includes('<title>The Twilight Passport</title>'));
  for (const field of ['og:image', 'twitter:image']) {
    assert.equal(html.match(new RegExp(`<meta (?:property|name)="${field}" content="([^"]+)"`))?.[1], image);
  }
  assert(html.includes('<meta property="og:image:width" content="1200" />'));
  assert(html.includes('<meta property="og:image:height" content="630" />'));
  assert(html.includes('<link rel="canonical" href="https://twilight.checkins.party/" />'));
  assert(html.includes(`href="/passports/twilight/manifest${suffix}.webmanifest"`));
  assert(!html.includes('href="/favicon.png"'), 'No generic favicon competes with the moon');
  assert.equal(script(html), script(shared), 'Branded HTML uses the actual current app bundle');
  assert(fs.existsSync(`dist${script(html)}`));
  const manifest = JSON.parse(fs.readFileSync(`dist/passports/twilight/manifest${suffix}.webmanifest`));
  assert.equal(manifest.scope, scope);
  assert.equal(manifest.start_url, scope);
  for (const icon of manifest.icons) {
    assert(icon.src.includes('twilight-moon-v1'));
    const data = fs.readFileSync(`dist${icon.src}`);
    assert.equal(`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`, icon.sizes);
  }
}

const metadata = getPassportMetadata(passport, 'https://checkins.party/event/twilight');
for (const icon of metadata.icons) {
  const data = fs.readFileSync(`dist${icon.href}`);
  assert.equal(`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`, icon.sizes);
}
assert(fs.statSync(`dist${new URL(image).pathname}`).size < 500_000, 'Keep the OG download small');

// Host-supplied titles must remain text, including quotes and closing tags.
const hostile = structuredClone(passport);
hostile.meta.name = 'Moon & stars </title><script>alert("hello")</script>';
const escaped = renderPassportMetadata(shared, hostile);
assert(!escaped.includes('<script>alert('));
assert(escaped.includes('Moon &amp; stars &lt;/title&gt;'));
assert.equal((escaped.match(/property="og:image"/g) || []).length, 1);

const shire = JSON.parse(fs.readFileSync('public/passports/shire/passport.json'));
assert(generateManifest(shire).icons.every(icon => icon.src.includes('/shire/assets/images/icons/icon-')));
assert.equal(getPassportMetadata(shire, 'https://checkins.party/event/shire').icons[0].href, '/favicon.png');
console.log('PASS: crawler HTML, canonical URLs, OG/Twitter images, favicon dimensions, both PWA scopes, escaping, unchanged shared/shire branding.');
