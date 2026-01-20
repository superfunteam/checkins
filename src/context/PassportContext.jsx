import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { loadPassport, buildAssetUrl, getPrimaryBadges, getSecretBadges, getBadgeById, getBadgeType } from '../utils/passportLoader';
import { loadFonts, setFontVariables } from '../utils/fontLoader';
import { injectManifest, updateMetaTags } from '../utils/manifestGenerator';

const PassportContext = createContext(null);

/**
 * Apply theme colors as CSS variables
 * @param {Object} theme - Theme configuration from passport
 */
function applyTheme(theme) {
  const root = document.documentElement;

  // Apply color palette
  Object.entries(theme.colors).forEach(([colorName, shades]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        root.style.setProperty(`--color-${colorName}-${shade}`, value);
      });
    } else {
      // Single value like 'highlight'
      root.style.setProperty(`--color-${colorName}`, shades);
    }
  });

  // Apply font variables
  setFontVariables(theme.fonts);
}

export function PassportProvider({ children }) {
  const { passportId } = useParams();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load passport configuration
  useEffect(() => {
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

        // Apply theme
        applyTheme(passportData.theme);

        // Load fonts
        await loadFonts(passportData.theme.fonts);

        // Inject manifest and update meta tags
        injectManifest(passportData);
        updateMetaTags(passportData);

        setPassport(passportData);
      } catch (err) {
        console.error('Failed to load passport:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [passportId]);

  // Build asset URL helper
  const getAssetUrl = useCallback((assetPath) => {
    if (!passportId) return assetPath;
    return buildAssetUrl(passportId, assetPath);
  }, [passportId]);

  // Memoized badge helpers
  const badges = useMemo(() => passport?.badges || [], [passport]);

  const primaryBadges = useMemo(() => getPrimaryBadges(badges), [badges]);

  const secretBadges = useMemo(() => getSecretBadges(badges), [badges]);

  const badgeTypes = useMemo(() => passport?.badgeTypes || [], [passport]);

  // Get badge by ID helper
  const getBadge = useCallback((id) => getBadgeById(badges, id), [badges]);

  // Get badge type helper
  const getType = useCallback((typeId) => getBadgeType(badgeTypes, typeId), [badgeTypes]);

  // Get type color helper
  const getTypeColor = useCallback((typeId) => {
    const type = getBadgeType(badgeTypes, typeId);
    return type?.color || '#6B7280';
  }, [badgeTypes]);

  // Get type label helper
  const getTypeLabel = useCallback((typeId) => {
    const type = getBadgeType(badgeTypes, typeId);
    return type?.label || typeId;
  }, [badgeTypes]);

  // Context value
  const value = useMemo(() => {
    if (!passport) return null;

    return {
      // Core data
      passportId,
      passport,
      loading,
      error,

      // Badge data
      badges,
      primaryBadges,
      secretBadges,
      badgeTypes,

      // Helpers
      getAssetUrl,
      getBadge,
      getType,
      getTypeColor,
      getTypeLabel,

      // Direct access to common config
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

  // Show loading state
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

  // Show error state
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
