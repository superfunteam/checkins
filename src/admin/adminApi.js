/**
 * Save passport.json for a given passport
 * @param {string} passportId - The passport ID
 * @param {object} passport - The passport data to save
 */
export async function savePassport(passportId, passport) {
  const response = await fetch(`/api/admin/passport/${passportId}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passport),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save passport');
  }

  return response.json();
}

/**
 * Upload an image or audio file for a passport
 * @param {string} passportId - The passport ID
 * @param {File} file - The file to upload
 * @param {string} assetType - 'images' or 'audio'
 * @param {string} [filename] - Optional custom filename (defaults to file.name)
 */
export async function uploadFile(passportId, file, assetType, filename) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('assetType', assetType);
  if (filename) {
    formData.append('filename', filename);
  }

  const response = await fetch(`/api/admin/passport/${passportId}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  return response.json();
}

/**
 * Save a QR code image from an external service
 * @param {string} passportId - The passport ID
 * @param {string} qrUrl - The URL to fetch the QR image from
 * @param {string} badgeId - The badge ID (used for filename)
 */
export async function saveQrImage(passportId, qrUrl, badgeId) {
  const response = await fetch(`/api/admin/passport/${passportId}/save-qr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qrUrl, badgeId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save QR image');
  }

  return response.json();
}
