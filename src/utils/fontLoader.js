/**
 * Dynamic Google Fonts loader
 * Loads fonts specified in passport.json theme configuration
 */

const GOOGLE_FONTS_API = 'https://fonts.googleapis.com/css2';

/**
 * Build Google Fonts URL from font config
 * @param {Object} fontsConfig - Font configuration from theme
 * @returns {string} - Google Fonts URL
 */
function buildGoogleFontsUrl(fontsConfig) {
  const families = [];

  Object.values(fontsConfig).forEach(fontDef => {
    if (fontDef.family && fontDef.weights) {
      const family = fontDef.family.replace(/\s+/g, '+');
      const weights = fontDef.weights.join(';');

      // Handle italic variants if needed
      if (fontDef.italics) {
        families.push(`family=${family}:ital,wght@0,${weights};1,${fontDef.italics.join(';1,')}`);
      } else {
        families.push(`family=${family}:wght@${weights}`);
      }
    }
  });

  return `${GOOGLE_FONTS_API}?${families.join('&')}&display=swap`;
}

/**
 * Load fonts from passport theme configuration
 * @param {Object} fontsConfig - Font configuration from theme
 * @returns {Promise<void>}
 */
export async function loadFonts(fontsConfig) {
  // Check if fonts link already exists with same config
  const existingLink = document.querySelector('link[data-passport-fonts]');

  const fontsUrl = buildGoogleFontsUrl(fontsConfig);

  // If same fonts already loaded, skip
  if (existingLink && existingLink.href === fontsUrl) {
    return;
  }

  // Remove old fonts link if present
  if (existingLink) {
    existingLink.remove();
  }

  // Add preconnect hints for faster loading
  addPreconnectHint('https://fonts.googleapis.com');
  addPreconnectHint('https://fonts.gstatic.com', true);

  // Create and append new fonts link
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fontsUrl;
  link.setAttribute('data-passport-fonts', 'true');

  // Return promise that resolves when fonts are loaded
  return new Promise((resolve, reject) => {
    link.onload = () => {
      console.log('Passport fonts loaded');
      resolve();
    };
    link.onerror = () => {
      console.error('Failed to load passport fonts');
      reject(new Error('Font loading failed'));
    };

    document.head.appendChild(link);
  });
}

/**
 * Add preconnect hint for a domain
 * @param {string} href - Domain URL
 * @param {boolean} crossOrigin - Whether to add crossorigin attribute
 */
function addPreconnectHint(href, crossOrigin = false) {
  const id = `preconnect-${href.replace(/[^a-z0-9]/gi, '-')}`;

  if (document.getElementById(id)) {
    return;
  }

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'preconnect';
  link.href = href;

  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Set CSS font family variables from config
 * @param {Object} fontsConfig - Font configuration from theme
 */
export function setFontVariables(fontsConfig) {
  const root = document.documentElement;

  if (fontsConfig.display) {
    root.style.setProperty('--font-display', `"${fontsConfig.display.family}", serif`);
  }
  if (fontsConfig.body) {
    root.style.setProperty('--font-body', `"${fontsConfig.body.family}", serif`);
  }
  if (fontsConfig.ui) {
    root.style.setProperty('--font-ui', `"${fontsConfig.ui.family}", sans-serif`);
  }
}
