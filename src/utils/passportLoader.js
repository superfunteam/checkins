/**
 * Passport loader utilities
 * Handles loading passport configuration from JSON files
 */

/**
 * Load the passport index (list of all passports)
 * @returns {Promise<{passports: Array}>}
 */
export async function loadPassportIndex() {
  try {
    const response = await fetch('/passports/index.json');
    if (!response.ok) {
      throw new Error(`Failed to load passport index: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading passport index:', error);
    throw error;
  }
}

/**
 * Load a specific passport configuration
 * @param {string} passportId - The passport ID (e.g., 'shire')
 * @returns {Promise<Object>} - The passport configuration
 */
export async function loadPassport(passportId, { fresh = false } = {}) {
  try {
    // `fresh` bypasses the HTTP cache so a midday edit is seen on the next poll.
    const response = await fetch(`/passports/${passportId}/passport.json`, fresh ? { cache: 'no-store' } : undefined);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Passport "${passportId}" not found`);
      }
      throw new Error(`Failed to load passport: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading passport "${passportId}":`, error);
    throw error;
  }
}

/**
 * Get the default passport from the index
 * @param {Object} index - The passport index
 * @returns {Object|null} - The default passport entry
 */
export function getDefaultPassport(index) {
  return index.passports.find(p => p.default && p.enabled) ||
         index.passports.find(p => p.enabled) ||
         null;
}

/**
 * Build full asset URL for a passport
 * @param {string} passportId - The passport ID
 * @param {string} assetPath - Relative asset path (e.g., 'assets/images/badges/badge-breakfast.webp')
 * @param {number|string} [version] - passport.json `version`; appended as ?v=
 *   so bumping the version busts every cached image/sound on every phone.
 * @returns {string} - Full URL path
 */
export function buildAssetUrl(passportId, assetPath, version) {
  // Return null if no asset path provided
  if (!assetPath) return null;

  // Absolute URLs and data URIs pass through untouched
  if (/^(https?:)?\/\//.test(assetPath) || assetPath.startsWith('data:')) return assetPath;

  // Remove leading assets/ if present since it's already in the path structure
  const cleanPath = assetPath.replace(/^assets\//, '');
  const url = `/passports/${passportId}/assets/${cleanPath}`;
  return version === undefined || version === null ? url : `${url}?v=${encodeURIComponent(version)}`;
}

/**
 * Get badge type config by type ID
 * @param {Array} badgeTypes - Array of badge type configs
 * @param {string} typeId - The type ID (e.g., 'movie', 'meal')
 * @returns {Object|undefined}
 */
export function getBadgeType(badgeTypes, typeId) {
  return badgeTypes.find(t => t.id === typeId);
}

/**
 * Get primary (non-secret) badges
 * @param {Array} badges - All badges
 * @returns {Array}
 */
export function getPrimaryBadges(badges) {
  return badges.filter(b => b.type !== 'secret');
}

/**
 * Get secret badges
 * @param {Array} badges - All badges
 * @returns {Array}
 */
export function getSecretBadges(badges) {
  return badges.filter(b => b.type === 'secret');
}

/**
 * Get badges by type
 * @param {Array} badges - All badges
 * @param {string} type - Badge type ID
 * @returns {Array}
 */
export function getBadgesByType(badges, type) {
  return badges.filter(b => b.type === type);
}

/**
 * Get badge by ID
 * @param {Array} badges - All badges
 * @param {string} id - Badge ID
 * @returns {Object|undefined}
 */
export function getBadgeById(badges, id) {
  return badges.find(b => b.id === id);
}
