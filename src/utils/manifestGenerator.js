/**
 * PWA manifest + document meta for a passport.
 *
 * `generateManifest` is pure and shared with vite-plugin-passport-manifests,
 * which writes real manifest files per passport. The browser side just points
 * <link rel="manifest"> at the right file for the current host mode.
 */
import { getPassportMetadata } from './passportMetadata.js';

/**
 * @param {Object} passport - Full passport configuration
 * @param {{ basePath?: string }} options - Where the passport is mounted:
 *   "/event/<id>" on checkins.party, "/" on <id>.checkins.party
 */
export function generateManifest(passport, { basePath = `/event/${passport.id}` } = {}) {
  const { meta, pwa, theme } = passport;
  const iconBase = `/passports/${passport.id}/assets/images/icons`;
  const iconPrefix = pwa?.iconPrefix || 'icon';

  return {
    id: basePath,
    name: meta.name,
    short_name: meta.shortName,
    description: meta.description,
    theme_color: pwa?.themeColor || theme.colors.primary['500'],
    background_color: pwa?.backgroundColor || theme.colors.background['100'],
    display: 'standalone',
    orientation: 'portrait',
    start_url: basePath,
    scope: basePath,
    categories: ['entertainment', 'games'],
    icons: [
      { src: `${iconBase}/${iconPrefix}-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${iconBase}/${iconPrefix}-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${iconBase}/${iconPrefix}-maskable-192.png`, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: `${iconBase}/${iconPrefix}-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

/** URL of the pre-generated manifest file for a passport and mount point. */
export function manifestUrl(passportId, basePath) {
  const variant = basePath === '/' ? '.host' : '';
  return `/passports/${passportId}/manifest${variant}.webmanifest`;
}

/**
 * Point the document at this passport's manifest.
 * @param {Object} passport
 * @param {string} basePath
 */
export function injectManifest(passport, basePath = `/event/${passport.id}`) {
  const href = manifestUrl(passport.id, basePath);
  let link = document.querySelector('link[rel="manifest"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  }
  if (link.getAttribute('href') !== href) {
    link.setAttribute('href', href);
  }
}

/**
 * Update meta tags based on passport config
 * @param {Object} passport - Passport configuration
 */
export function updateMetaTags(passport) {
  const metadata = getPassportMetadata(passport, window.location.origin + window.location.pathname);
  document.title = metadata.title;
  for (const [name, content] of Object.entries(metadata.named)) setMetaTag(name, content);
  for (const [name, content] of Object.entries(metadata.properties)) setMetaProperty(name, content);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = metadata.canonical;

  // Reuse identical links on content refresh; replace stale event branding when
  // navigating between passports, including the generic startup favicon.
  setIconLinks(metadata.icons);
}

// A client-side trip back to the event listing must not keep Twilight's moon
// or social image on the shared Checkins pages.
export function resetPassportBranding() {
  const url = window.location.origin + window.location.pathname;
  setMetaProperty('og:image', 'https://checkins.party/unfurl.png');
  setMetaTag('twitter:image', 'https://checkins.party/unfurl.png');
  setMetaProperty('og:image:alt', 'Checkins — badges and check-ins for events');
  setMetaTag('twitter:image:alt', 'Checkins — badges and check-ins for events');
  setMetaProperty('og:url', url);
  setMetaTag('twitter:url', url);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  document.querySelector('link[rel="manifest"]')?.remove();
  setIconLinks([
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon.png' },
    { rel: 'apple-touch-icon', sizes: '192x192', href: '/images/icon-maskable-192.png' },
  ]);
}

function setIconLinks(icons) {
  const existing = [...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')];
  const matches = existing.length === icons.length && icons.every((icon, i) =>
    Object.entries(icon).every(([key, value]) => existing[i].getAttribute(key) === value));
  if (!matches) {
    existing.forEach(icon => icon.remove());
    for (const attributes of icons) {
      const icon = document.createElement('link');
      for (const [key, value] of Object.entries(attributes)) icon.setAttribute(key, value);
      document.head.appendChild(icon);
    }
  }
}

function setMetaTag(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function setMetaProperty(property, content) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}
