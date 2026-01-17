import { createContext, useContext, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSound, UI_SOUNDS, playBadgeSound, stopBadgeSound } from '../hooks/useSound';
import { useSecretBadges } from '../hooks/useSecretBadges';

const AppContext = createContext(null);

// App screens
export const SCREENS = {
  SPLASH: 'splash',
  NAME: 'name',
  LOADING: 'loading',
  EXPLAINER: 'explainer',
  PASSPORT: 'passport',
};

export function AppProvider({ children }) {
  const storage = useLocalStorage();
  const { play } = useSound();

  // Current screen state
  const [currentScreen, setCurrentScreen] = useState(() => {
    // If user has already set up, go straight to passport
    if (storage.createdAt && storage.name) {
      return SCREENS.PASSPORT;
    }
    return SCREENS.SPLASH;
  });

  // Modal states
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeOriginRect, setBadgeOriginRect] = useState(null);
  const [isClosingBadgeModal, setIsClosingBadgeModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);

  // Secret unlock modal queue - shows celebration modals sequentially
  const [secretUnlockQueue, setSecretUnlockQueue] = useState([]);
  const [secretModalDelayed, setSecretModalDelayed] = useState(false);

  // Derive the current modal to show (first in queue, unless delayed)
  const secretUnlockModal = !secretModalDelayed ? secretUnlockQueue[0] || null : null;

  // Handle secret badge unlocks - add to queue
  const handleSecretUnlock = useCallback((badge) => {
    setSecretUnlockQueue(prev => [...prev, badge]);
  }, []);

  const closeSecretUnlockModal = useCallback(() => {
    play(UI_SOUNDS.modalClose);
    setSecretUnlockQueue(prev => {
      const remaining = prev.slice(1);
      // If more in queue, add 1 second delay before showing next
      if (remaining.length > 0) {
        setSecretModalDelayed(true);
        setTimeout(() => setSecretModalDelayed(false), 1000);
      }
      return remaining;
    });
  }, [play]);

  // Secret badges hook
  const { isSecretUnlocked } = useSecretBadges(
    storage.badges,
    storage.claimBadge,
    play,
    handleSecretUnlock
  );

  // Navigation helpers
  const goToScreen = useCallback((screen, options = {}) => {
    if (!options.silent) {
      play(UI_SOUNDS.buttonTap);
    }
    setCurrentScreen(screen);
  }, [play]);

  const openBadgeModal = useCallback((badge, rect = null) => {
    play(UI_SOUNDS.modalOpen);
    // Play the badge-specific sound effect
    playBadgeSound(badge.id);
    setBadgeOriginRect(rect);
    setSelectedBadge(badge);
    setIsClosingBadgeModal(false);
  }, [play]);

  const closeBadgeModal = useCallback(() => {
    play(UI_SOUNDS.modalClose);
    // Stop any playing badge sound
    stopBadgeSound();
    setIsClosingBadgeModal(true);
    // Delay clearing state to allow reverse animation
    setTimeout(() => {
      setSelectedBadge(null);
      setBadgeOriginRect(null);
      setIsClosingBadgeModal(false);
    }, 300);
  }, [play]);

  const openCertificationModal = useCallback(() => {
    play(UI_SOUNDS.modalOpen);
    setShowCertificationModal(true);
  }, [play]);

  const closeCertificationModal = useCallback(() => {
    play(UI_SOUNDS.modalClose);
    setShowCertificationModal(false);
    setShowChecklist(false);
  }, [play]);

  const openScheduleSheet = useCallback(() => {
    play(UI_SOUNDS.modalOpen);
    setShowScheduleSheet(true);
  }, [play]);

  const closeScheduleSheet = useCallback(() => {
    play(UI_SOUNDS.modalClose);
    setShowScheduleSheet(false);
  }, [play]);

  const claimBadgeWithSound = useCallback((badgeId, options = {}) => {
    storage.claimBadge(badgeId, options);
    play(UI_SOUNDS.badgeClaim);
  }, [storage, play]);

  const resetAndStartOver = useCallback(() => {
    storage.resetAll();
    setCurrentScreen(SCREENS.SPLASH);
  }, [storage]);

  const value = {
    // Storage
    ...storage,
    claimBadge: claimBadgeWithSound,

    // Sound
    play,

    // Navigation
    currentScreen,
    goToScreen,

    // Badge modal
    selectedBadge,
    badgeOriginRect,
    isClosingBadgeModal,
    openBadgeModal,
    closeBadgeModal,

    // Certification modal
    showCertificationModal,
    showChecklist,
    setShowChecklist,
    openCertificationModal,
    closeCertificationModal,

    // Schedule sheet
    showScheduleSheet,
    openScheduleSheet,
    closeScheduleSheet,

    // Secret badges
    isSecretUnlocked,
    secretUnlockModal,
    closeSecretUnlockModal,

    // Reset
    resetAndStartOver,

    // Screen constants
    SCREENS,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
