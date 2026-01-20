/**
 * Dynamic PWA manifest generator
 * Creates and injects manifest based on passport configuration
 */

/**
 * Generate manifest JSON from passport config
 * @param {Object} passport - Full passport configuration
 * @returns {Object} - Manifest object
 */
export function generateManifest(passport) {
  const { meta, pwa, theme } = passport;

  return {
    name: meta.name,
    short_name: meta.shortName,
    description: meta.description,
    theme_color: pwa?.themeColor || theme.colors.primary['500'],
    background_color: pwa?.backgroundColor || theme.colors.background['100'],
    display: 'standalone',
    orientation: 'portrait',
    start_url: `/event/${passport.id}`,
    scope: `/event/${passport.id}`,
    icons: [
      {
        src: `/passports/${passport.id}/assets/images/icons/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `/passports/${passport.id}/assets/images/icons/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: `/passports/${passport.id}/assets/images/icons/icon-maskable-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: `/passports/${passport.id}/assets/images/icons/icon-maskable-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

/**
 * Inject manifest into document
 * @param {Object} passport - Passport configuration
 */
export function injectManifest(passport) {
  // Remove existing manifest link
  const existingLink = document.querySelector('link[rel="manifest"]');
  if (existingLink) {
    existingLink.remove();
  }

  // Generate manifest
  const manifest = generateManifest(passport);

  // Create blob URL
  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create and append link
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = url;
  document.head.appendChild(link);

  console.log('Dynamic manifest injected');
}

/**
 * Update meta tags based on passport config
 * @param {Object} passport - Passport configuration
 */
export function updateMetaTags(passport) {
  const { meta, pwa, theme } = passport;

  // Update title
  document.title = meta.name;

  // Update theme-color
  setMetaTag('theme-color', pwa?.themeColor || theme.colors.primary['500']);

  // Update description
  setMetaTag('description', meta.description);

  // Update apple-mobile-web-app-title
  setMetaTag('apple-mobile-web-app-title', meta.shortName);

  // Update Open Graph tags
  setMetaProperty('og:title', meta.name);
  setMetaProperty('og:description', meta.description);

  // Update Twitter tags
  setMetaTag('twitter:title', meta.name);
  setMetaTag('twitter:description', meta.description);

  // Update apple-touch-icon
  const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
  if (appleIcon) {
    appleIcon.href = `/passports/${passport.id}/assets/images/icons/icon-maskable-192.png`;
  }
}

/**
 * Set or update a meta tag
 * @param {string} name - Meta tag name attribute
 * @param {string} content - Meta tag content
 */
function setMetaTag(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

/**
 * Set or update a meta property (for Open Graph)
 * @param {string} property - Meta tag property attribute
 * @param {string} content - Meta tag content
 */
function setMetaProperty(property, content) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}
