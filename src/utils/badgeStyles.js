/**
 * Centralized badge styling utilities for consistent proportional borders
 */

export const BADGE_BORDER_RATIO = 0.10; // 10% of badge size

export const BADGE_SHAPES = {
  arch: '50% 50% 24% 24%',
  circle: '50%',
  square: '22%',
};

export const BADGE_BOX_SHADOW = '0 4px 8px rgba(31, 26, 19, 0.25), 0 2px 4px rgba(31, 26, 19, 0.15)';

/**
 * Calculate border width as percentage of badge size
 * @param {number} size - Badge size in pixels
 * @returns {number} Border width in pixels
 */
export function getBadgeBorderWidth(size) {
  return Math.round(size * BADGE_BORDER_RATIO);
}

/**
 * Get complete badge styles for a given size and shape
 * @param {number} size - Badge size in pixels
 * @param {string} shape - Shape name: 'arch', 'circle', or 'square'
 * @returns {object} Style object with borderRadius, border, and boxShadow
 */
export function getBadgeStyles(size, shape = 'arch') {
  return {
    borderRadius: BADGE_SHAPES[shape] || BADGE_SHAPES.arch,
    border: `${getBadgeBorderWidth(size)}px solid white`,
    boxShadow: BADGE_BOX_SHADOW,
  };
}
