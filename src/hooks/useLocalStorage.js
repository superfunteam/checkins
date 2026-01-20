import { useState, useEffect, useCallback } from 'react';

const STORAGE_VERSION = 1;

/**
 * Build storage key for a passport
 * @param {string} passportId - The passport ID
 * @returns {string} - Storage key
 */
function getStorageKey(passportId) {
  return `passport-${passportId}`;
}

const getInitialState = () => ({
  version: STORAGE_VERSION,
  name: '',
  createdAt: null,
  honorSystemDismissed: false,
  badges: {},
});

export function useLocalStorage(passportId = 'shire') {
  const storageKey = getStorageKey(passportId);

  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Version check for future migrations
        if (parsed.version === STORAGE_VERSION) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return getInitialState();
  });

  // Re-initialize when passportId changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === STORAGE_VERSION) {
          setData(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    setData(getInitialState());
  }, [storageKey]);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data, storageKey]);

  const setName = useCallback((name) => {
    setData(prev => ({
      ...prev,
      name,
      createdAt: prev.createdAt || new Date().toISOString(),
    }));
  }, []);

  const claimBadge = useCallback((badgeId, options = {}) => {
    setData(prev => ({
      ...prev,
      badges: {
        ...prev.badges,
        [badgeId]: {
          claimed: true,
          claimedAt: new Date().toISOString(),
          ...options,
        },
      },
    }));
  }, []);

  const unclaimBadge = useCallback((badgeId) => {
    setData(prev => ({
      ...prev,
      badges: {
        ...prev.badges,
        [badgeId]: {
          claimed: false,
          claimedAt: null,
        },
      },
    }));
  }, []);

  const toggleBadge = useCallback((badgeId) => {
    setData(prev => {
      const current = prev.badges[badgeId];
      const isClaimed = current?.claimed;
      return {
        ...prev,
        badges: {
          ...prev.badges,
          [badgeId]: {
            claimed: !isClaimed,
            claimedAt: isClaimed ? null : new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const dismissHonorSystem = useCallback(() => {
    setData(prev => ({
      ...prev,
      honorSystemDismissed: true,
    }));
  }, []);

  const resetAll = useCallback(() => {
    setData(getInitialState());
  }, []);

  const getClaimTime = useCallback((badgeId) => {
    const badge = data.badges[badgeId];
    if (!badge?.claimedAt) return null;
    return new Date(badge.claimedAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, [data.badges]);

  const getClaimedCount = useCallback(() => {
    return Object.values(data.badges).filter(b => b?.claimed).length;
  }, [data.badges]);

  return {
    name: data.name,
    createdAt: data.createdAt,
    honorSystemDismissed: data.honorSystemDismissed,
    badges: data.badges,
    setName,
    claimBadge,
    unclaimBadge,
    toggleBadge,
    dismissHonorSystem,
    resetAll,
    getClaimTime,
    getClaimedCount,
    isNewUser: !data.createdAt,
  };
}
