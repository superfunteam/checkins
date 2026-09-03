import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { loadPassport, buildAssetUrl, getPrimaryBadges, getSecretBadges, getBadgeById, getBadgeType } from '../utils/passportLoader';
import { loadFonts, setFontVariables } from '../utils/fontLoader';
import { injectManifest, updateMetaTags } from '../utils/manifestGenerator';
import { getPassportBasePath } from '../utils/hostPassport';

const PassportContext = createContext(null);

// How often an open passport re-checks passport.json for new badges, art, or
// copy. Also checked whenever the tab becomes visible / focused / online.
const CONTENT_REFRESH_MS = 45 * 1000;

/**
 * Apply theme colors as CSS variables
 * @param {Object} theme - Theme configuration from passport
 */
function applyTheme(theme) {
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([colorName, shades]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        root.style.setProperty(`--color-${colorName}-${shade}`, value);
      });
    } else {
      root.style.setProperty(`--color-${colorName}`, shades);
    }
  });

  setFontVariables(theme.fonts);
}

/** Push a (new or updated) passport into the document: theme, fonts, manifest, meta. */
async function applyPassportToDocument(passportData, basePath) {
  applyTheme(passportData.theme);
  await loadFonts(passportData.theme.fonts);
  injectManifest(passportData, basePath);
  updateMetaTags(passportData);
}

/**
 * @param {{ passportId?: string, children: any }} props
 *   `passportId` overrides the route param; used when a host like
 *   twilight.checkins.party mounts a passport at "/".
 */
export function PassportProvider({ passportId: passportIdProp, children }) {
  const params = useParams();
  const passportId = passportIdProp || params.passportId;
  const basePath = getPassportBasePath(passportId);

  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastJsonRef = useRef(null);

  // Initial load
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!passportId) {
        setError(new Error('No passport ID provided'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const passportData = await loadPassport(passportId);
        if (cancelled) return;

        await applyPassportToDocument(passportData, basePath);
        if (cancelled) return;

        lastJsonRef.current = JSON.stringify(passportData);
        setPassport(passportData);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load passport:', err);
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [passportId, basePath]);

  // Live refresh: pick up edits to passport.json without a reload.
  useEffect(() => {
    if (loading || error || !passportId) return undefined;

    let cancelled = false;
    let inFlight = false;

    const refresh = async () => {
      if (inFlight || cancelled) return;
      if (navigator.onLine === false) return;

      inFlight = true;
      try {
        const fresh = await loadPassport(passportId, { fresh: true });
        if (cancelled) return;
        const json = JSON.stringify(fresh);
        if (json !== lastJsonRef.current) {
          lastJsonRef.current = json;
          await applyPassportToDocument(fresh, basePath);
          if (cancelled) return;
          setPassport(fresh);
          console.log(`Passport "${passportId}" updated to version ${fresh.version ?? '?'}`);
        }
      } catch (err) {
        // Offline or a transient error: keep what we have and try again later.
        console.debug('Passport refresh skipped:', err?.message || err);
      } finally {
        inFlight = false;
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    // The timer skips hidden tabs (the visibility handler catches them up);
    // focus / online / visible always refresh immediately.
    const interval = setInterval(() => {
      if (document.visibilityState !== 'hidden') refresh();
    }, CONTENT_REFRESH_MS);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
    };
  }, [passportId, basePath, loading, error]);

  const assetVersion = passport?.version;

  // Build asset URL helper (versioned so a bump busts every phone's cache)
  const getAssetUrl = useCallback((assetPath) => {
    if (!passportId) return assetPath;
    return buildAssetUrl(passportId, assetPath, assetVersion);
  }, [passportId, assetVersion]);

  // Memoized badge helpers
  const badges = useMemo(() => passport?.badges || [], [passport]);
  const primaryBadges = useMemo(() => getPrimaryBadges(badges), [badges]);
  const secretBadges = useMemo(() => getSecretBadges(badges), [badges]);
  const badgeTypes = useMemo(() => passport?.badgeTypes || [], [passport]);

  const getBadge = useCallback((id) => getBadgeById(badges, id), [badges]);
  const getType = useCallback((typeId) => getBadgeType(badgeTypes, typeId), [badgeTypes]);

  const getTypeColor = useCallback((typeId) => {
    const type = getBadgeType(badgeTypes, typeId);
    return type?.color || '#6B7280';
  }, [badgeTypes]);

  const getTypeLabel = useCallback((typeId) => {
    const type = getBadgeType(badgeTypes, typeId);
    return type?.label || typeId;
  }, [badgeTypes]);

  const value = useMemo(() => {
    if (!passport) return null;

    return {
      passportId,
      basePath,
      passport,
      loading,
      error,

      badges,
      primaryBadges,
      secretBadges,
      badgeTypes,

      getAssetUrl,
      getBadge,
      getType,
      getTypeColor,
      getTypeLabel,

      meta: passport.meta,
      features: passport.features,
      theme: passport.theme,
      content: passport.content,
      audio: passport.audio,
      schedule: passport.schedule,
      pwa: passport.pwa,
      settings: passport.settings || {},
      badgeShape: passport.settings?.badgeShape || 'arch',
    };
  }, [
    passportId,
    basePath,
    passport,
    loading,
    error,
    badges,
    primaryBadges,
    secretBadges,
    badgeTypes,
    getAssetUrl,
    getBadge,
    getType,
    getTypeColor,
    getTypeLabel,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-100">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-600">Loading passport...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-100 p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-800 mb-4">Passport Not Found</h1>
          <p className="text-text-600 mb-6">
            The passport "{passportId}" could not be loaded.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <PassportContext.Provider value={value}>
      {children}
    </PassportContext.Provider>
  );
}

export function usePassport() {
  const context = useContext(PassportContext);
  if (!context) {
    throw new Error('usePassport must be used within a PassportProvider');
  }
  return context;
}

export { PassportContext };
