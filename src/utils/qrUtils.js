/**
 * QR Code utilities for badge claiming
 */

// Characters to use for secret generation (excludes ambiguous chars like 0/O/l/1)
const SECRET_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

/**
 * Generate a cryptographically random alphanumeric secret
 * @param {number} length - Length of the secret (default 12)
 * @returns {string} Random alphanumeric string
 */
export function generateClaimSecret(length = 12) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => SECRET_CHARS[byte % SECRET_CHARS.length]).join('');
}

/**
 * Build QR data string from components
 * Format: {passportId}:{badgeId}:{secret}
 * @param {string} passportId - The passport ID
 * @param {string} badgeId - The badge ID
 * @param {string} secret - The claim secret
 * @returns {string} QR data string
 */
export function buildQrData(passportId, badgeId, secret) {
  return `${passportId}:${badgeId}:${secret}`;
}

/**
 * Parse QR data string into components
 * @param {string} qrData - The scanned QR data
 * @returns {{ passportId: string, badgeId: string, secret: string } | null} Parsed components or null if invalid
 */
export function parseQrData(qrData) {
  if (!qrData || typeof qrData !== 'string') {
    return null;
  }

  const parts = qrData.split(':');
  if (parts.length !== 3) {
    return null;
  }

  const [passportId, badgeId, secret] = parts;
  if (!passportId || !badgeId || !secret) {
    return null;
  }

  return { passportId, badgeId, secret };
}

/**
 * Validate a scanned QR code against expected values
 * @param {string} scannedData - The scanned QR data string
 * @param {string} expectedPassportId - Expected passport ID
 * @param {string} expectedBadgeId - Expected badge ID
 * @param {string} expectedSecret - Expected secret
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export function validateQrScan(scannedData, expectedPassportId, expectedBadgeId, expectedSecret) {
  const parsed = parseQrData(scannedData);

  if (!parsed) {
    return { valid: false, error: "This doesn't appear to be a valid badge QR code" };
  }

  if (parsed.passportId !== expectedPassportId) {
    return { valid: false, error: 'This QR code is for a different event' };
  }

  if (parsed.badgeId !== expectedBadgeId) {
    return { valid: false, error: 'This QR code is for a different badge' };
  }

  if (parsed.secret !== expectedSecret) {
    return { valid: false, error: 'Invalid QR code' };
  }

  return { valid: true };
}

/**
 * Build URL for external QR code generation service
 * @param {string} data - The data to encode in the QR code
 * @returns {string} The full URL to the QR service
 */
export function buildQrServiceUrl(data) {
  return `https://qr.superfun.games/${encodeURIComponent(data)}`;
}
