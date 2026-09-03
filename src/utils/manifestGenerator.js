/**
 * PWA manifest + document meta for a passport.
 *
 * `generateManifest` is pure and shared with vite-plugin-passport-manifests,
 * which writes real manifest files per passport. The browser side just points
 * <link rel="manifest"> at the right file for the current host mode.
 */

/**
 * @param {Object} passport - Full passport configuration
 * @param {{ basePath?: string }} options - Where the passport is mounted:
 *   "/event/<id>" on checkins.party, "/" on <id>.checkins.party
 */
export function generateManifest(passport, { basePath = `/event/${passport.id}` } = {}) {
  const { meta, pwa, theme } = passport;
  const iconBase = `/passports/${passport.id}/assets/images/icons`;

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
      { src: `${iconBase}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${iconBase}/icon-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${iconBase}/icon-maskable-192.png`, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: `${iconBase}/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
  const { meta, pwa, theme } = passport;
  const iconBase = `/passports/${passport.id}/assets/images/icons`;

  document.title = meta.name;

  setMetaTag('theme-color', pwa?.themeColor || theme.colors.primary['500']);
  setMetaTag('description', meta.description);
  setMetaTag('apple-mobile-web-app-title', meta.shortName);

  setMetaProperty('og:title', meta.name);
  setMetaProperty('og:description', meta.description);
  setMetaProperty('og:url', window.location.origin + window.location.pathname);
  setMetaTag('twitter:title', meta.name);
  setMetaTag('twitter:description', meta.description);

  document.querySelectorAll('link[rel="apple-touch-icon"]').forEach((icon) => {
    icon.href = `${iconBase}/icon-maskable-192.png`;
  });
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
