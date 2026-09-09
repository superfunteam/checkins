import html2canvas from 'html2canvas';

/**
 * Export the passport as a PNG
 * Uses html2canvas to capture a hidden export template
 */
export async function createPassportPng(options = {}) {
  const {
    templateSelector = '#passport-export-template',
    scale = 2,
  } = options;

  const template = document.querySelector(templateSelector);
  if (!template) {
    throw new Error('Export template not found');
  }

  // Make template visible for capture (positioned off-screen)
  const originalDisplay = template.style.display;
  const originalPosition = template.style.position;
  const originalLeft = template.style.left;
  let loadTimeout;

  template.style.display = 'block';
  template.style.position = 'absolute';
  template.style.left = '-9999px';

  try {
    // Capture only once the actual portraits, badges, and fonts are ready.
    // A failed asset is retryable instead of silently producing an empty slot.
    await Promise.race([
      Promise.all([
        document.fonts.ready,
        ...[...template.querySelectorAll('img')].map(img => img.decode()),
      ]),
      new Promise((_, reject) => { loadTimeout = setTimeout(() => reject(new Error('Artwork is still loading. Please try again.')), 15000); }),
    ]);
    clearTimeout(loadTimeout);
    const canvas = await html2canvas(template, {
      scale,
      useCORS: true,
      backgroundColor: getComputedStyle(template).backgroundColor,
      logging: false,
    });

    // Keep generation separate from a user-initiated download or share.
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }

        resolve(blob);
      }, 'image/png');
    });

  } finally {
    clearTimeout(loadTimeout);
    // Restore original styles
    template.style.display = originalDisplay;
    template.style.position = originalPosition;
    template.style.left = originalLeft;
  }
}

export function downloadPng(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function passportFilename(name, passportId = 'shire', team = null) {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'guest';
  return `${passportId}-${team ? `team-${team}` : 'passport'}-${safeName}.png`;
}

export async function exportPassportPng(options = {}) {
  const blob = await createPassportPng(options);
  downloadPng(blob, passportFilename(options.name || 'A Humble Hobbit', options.passportId));
}

/**
 * Format date for display on certificate
 */
export function formatCertificateDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
