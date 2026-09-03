/**
 * Host-based passport routing
 *
 * `twilight.checkins.party` serves the "twilight" passport at `/`.
 * `twilight.localhost:5173` does the same in development (Chrome resolves
 * *.localhost automatically). `VITE_HOST_PASSPORT=twilight npm run dev` forces
 * host mode on plain localhost for browsers that don't.
 */

const BASE_DOMAINS = ['checkins.party', 'localhost'];
const IGNORED_LABELS = new Set(['www', 'app', 'admin', 'api', 'staging']);

export function getHostPassportId(hostname = typeof window !== 'undefined' ? window.location.hostname : '') {
  const forced = import.meta.env.VITE_HOST_PASSPORT;
  if (forced) return forced;

  const host = String(hostname).toLowerCase();
  for (const base of BASE_DOMAINS) {
    if (host.endsWith(`.${base}`)) {
      const label = host.slice(0, -(base.length + 1));
      if (label && !label.includes('.') && !IGNORED_LABELS.has(label)) {
        return label;
      }
    }
  }
  return null;
}

/** Path where this passport is mounted on the current host. */
export function getPassportBasePath(passportId) {
  return getHostPassportId() === passportId ? '/' : `/event/${passportId}`;
}
