// Shared by build-time HTML and the browser. Social crawlers must receive the
// same branding without running React or waiting for the passport fetch.
export function getPassportMetadata(passport, url) {
  const { id, meta, pwa, theme } = passport;
  const canonical = meta.canonicalUrl || url;
  const iconBase = `/passports/${id}/assets/images/icons`;
  const prefix = pwa?.iconPrefix;
  const social = meta.socialImage;
  const image = social
    ? new URL(`/passports/${id}/${social.path}`, canonical).href
    : 'https://checkins.party/unfurl.png';
  return {
    title: meta.name,
    canonical,
    named: {
      title: meta.name,
      description: meta.description,
      'theme-color': pwa?.themeColor || theme.colors.primary['500'],
      'apple-mobile-web-app-title': meta.shortName,
      'twitter:card': 'summary_large_image',
      'twitter:url': canonical,
      'twitter:title': meta.name,
      'twitter:description': meta.description,
      'twitter:image': image,
      'twitter:image:alt': social?.alt || 'Checkins — badges and check-ins for events',
    },
    properties: {
      'og:type': 'website',
      'og:url': canonical,
      'og:title': meta.name,
      'og:description': meta.description,
      'og:image': image,
      'og:image:width': String(social?.width || 1200),
      'og:image:height': String(social?.height || 630),
      'og:image:alt': social?.alt || 'Checkins — badges and check-ins for events',
    },
    icons: [
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: prefix ? `${iconBase}/${prefix}-32.png` : '/favicon.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: prefix ? `${iconBase}/${prefix}-16.png` : '/favicon.png' },
      { rel: 'apple-touch-icon', sizes: prefix ? '180x180' : '192x192', href: `${iconBase}/${prefix ? `${prefix}-180` : 'icon-maskable-192'}.png` },
    ],
  };
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export function renderPassportMetadata(html, passport, { url, manifest } = {}) {
  const metadata = getPassportMetadata(passport, url || `https://checkins.party/event/${passport.id}`);
  const upsert = (pattern, tag) => {
    html = pattern.test(html) ? html.replace(pattern, () => tag) : html.replace('</head>', () => `    ${tag}\n  </head>`);
  };
  upsert(/<title>[^<]*<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`);
  for (const [attribute, values] of [['name', metadata.named], ['property', metadata.properties]]) {
    for (const [key, value] of Object.entries(values)) {
      upsert(new RegExp(`<meta\\b(?=[^>]*\\b${attribute}=["']${key}["'])[^>]*>`, 'g'),
        `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`);
    }
  }
  upsert(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/g,
    `<link rel="canonical" href="${escapeHtml(metadata.canonical)}" />`);
  html = html.replace(/<link\b(?=[^>]*\brel=["'](?:icon|apple-touch-icon)["'])[^>]*>\s*/g, '');
  const icons = metadata.icons.map(icon => `<link ${Object.entries(icon).map(([key, value]) => `${key}="${escapeHtml(value)}"`).join(' ')} />`).join('\n    ');
  html = html.replace('</head>', () => `    ${icons}\n  </head>`);
  if (manifest) upsert(/<link\b(?=[^>]*\brel=["']manifest["'])[^>]*>/g,
    `<link rel="manifest" href="${escapeHtml(manifest)}" />`);
  return html;
}
