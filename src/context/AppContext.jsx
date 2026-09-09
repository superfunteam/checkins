import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  useSound,
  UI_SOUNDS,
  playBadgeSound,
  stopBadgeSound,
  preloadBadgeSounds,
  preloadGreetingSounds,
  configureBackgroundMusic,
  startBackgroundMusic,
} from '../hooks/useSound';
import { useSecretBadges } from '../hooks/useSecretBadges';
import { usePassport } from '../context/PassportContext';
import { setUpdateBusy } from '../pwa/updateGate';
import { getTwilightTeam } from '../data/twilightTeams';

const AppContext = createContext(null);

// App screens
export const SCREENS = {
  SPLASH: 'splash',
  NAME: 'name',
  LOADING: 'loading',
  EXPLAINER: 'explainer',
  PASSPORT: 'passport',
  TEAM_PICK: 'team-pick',
  TEAM_FINAL: 'team-final',
  TEAM_SHARE: 'team-share',
};

export function AppProvider({ children }) {
  // Get passportId from PassportContext
  const { passportId, features, secretBadges: secretBadgeConfigs, badges, audio, getAssetUrl } = usePassport();

  // Use passport-namespaced storage
  const storage = useLocalStorage(passportId);
  const { play } = useSound();
  const teamPollEnabled = passportId === 'twilight' && features?.teamPoll === true;
  const allBadgesComplete = badges.length > 0 && badges.every(b => storage.badges[b.id]?.claimed);

  // Initialize audio system with passport-based paths
  useEffect(() => {
    if (!badges || !getAssetUrl) return;

    // Build badge sound mappings from passport config
    const badgeSoundMappings = badges
      .filter(b => b.sound)
      .map(b => ({
        badgeId: b.id,
        soundUrl: getAssetUrl(b.sound),
      }));

    // Preload badge sounds if feature is enabled
    if (features?.badgeSounds !== false && badgeSoundMappings.length > 0) {
      preloadBadgeSounds(badgeSoundMappings);
    }

    // Preload greeting sounds if feature is enabled
    if (features?.greetingSounds !== false && audio?.greetings) {
      const greetingUrls = audio.greetings.map(src => getAssetUrl(src));
      preloadGreetingSounds(greetingUrls);
    }

    // Configure background music if feature is enabled
    if (features?.backgroundMusic !== false && audio?.backgroundMusic) {
      const bgMusicConfig = {};
      Object.entries(audio.backgroundMusic).forEach(([timeOfDay, tracks]) => {
        bgMusicConfig[timeOfDay] = tracks.map(src => getAssetUrl(src));
      });
      configureBackgroundMusic(bgMusicConfig);
    }
  }, [badges, audio, features, getAssetUrl]);

  // Current screen state
  const [currentScreen, setCurrentScreen] = useState(() => {
    // If user has already set up, go straight to passport
    if (storage.createdAt && storage.name) {
      return teamPollEnabled && !storage.teamPoll.initial ? SCREENS.TEAM_PICK : SCREENS.PASSPORT;
    }
    return SCREENS.SPLASH;
  });

  // Modal states
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeModalExiting, setBadgeModalExiting] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [certificationExiting, setCertificationExiting] = useState(false);
  const [scheduleExiting, setScheduleExiting] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);

  // Secret unlock modal queue - shows celebration modals sequentially
  const [secretUnlockQueue, setSecretUnlockQueue] = useState([]);
  const [secretModalExiting, setSecretModalExiting] = useState(false);

  // Show queued celebrations only after the previous dialog finishes closing.
  const secretUnlockModal = currentScreen === SCREENS.PASSPORT && !selectedBadge && !badgeModalExiting && !secretModalExiting && !showCertificationModal && !certificationExiting && !showScheduleSheet && !scheduleExiting
    ? secretUnlockQueue[0] || null : null;

  // Handle secret badge unlocks - add to queue
  const handleSecretUnlock = useCallback((badge) => {
    setSecretUnlockQueue(prev => [...prev, badge]);
  }, []);

  const closeSecretUnlockModal = useCallback(() => {
    play(UI_SOUNDS.modalClose);
    stopBadgeSound();
    setSecretModalExiting(true);
    setSecretUnlockQueue(prev => prev.slice(1));
  }, [play]);
  const finishSecretExit = useCallback(() => setSecretModalExiting(false), []);
  const finishCertificationExit = useCallback(() => { setCertificationExiting(false); setShowChecklist(false); }, []);
  const finishScheduleExit = useCallback(() => setScheduleExiting(false), []);
  const finishBadgeExit = useCallback(() => setBadgeModalExiting(false), []);

  // Tell the update gate when a silent app reload would interrupt the guest:
  // any modal/sheet open, or mid-onboarding. Splash and the idle passport
  // screen are safe because a reload lands right back where they were.
  const midOnboarding = ![SCREENS.SPLASH, SCREENS.PASSPORT].includes(currentScreen);
  const interacting = Boolean(selectedBadge) || badgeModalExiting || secretModalExiting || showCertificationModal || certificationExiting || showScheduleSheet || scheduleExiting || secretUnlockQueue.length > 0 || midOnboarding;
  useEffect(() => {
    setUpdateBusy(interacting);
    return () => setUpdateBusy(false);
  }, [interacting]);

  // Secret badges hook - only active if feature is enabled
  const { isSecretUnlocked } = useSecretBadges(
    storage.badges,
    storage.claimBadge,
    play,
    handleSecretUnlock,
    features?.secretBadges !== false, // enabled by default if not specified
    secretBadgeConfigs
  );

  // Navigation helpers
  const goToScreen = useCallback((screen, options = {}) => {
    if (!options.silent) {
      play(UI_SOUNDS.buttonTap);
    }
    setCurrentScreen(screen === SCREENS.PASSPORT && teamPollEnabled && !storage.teamPoll.initial ? SCREENS.TEAM_PICK : screen);
  }, [play, teamPollEnabled, storage.teamPoll.initial]);

  // Let every celebration finish before asking for the final verdict. This
  // also resumes the unanswered poll after a reload, without losing claims.
  useEffect(() => {
    if (!teamPollEnabled || currentScreen !== SCREENS.PASSPORT || interacting) return;
    if (!storage.teamPoll.initial) setCurrentScreen(SCREENS.TEAM_PICK);
    else if (allBadgesComplete && !storage.teamPoll.final) setCurrentScreen(SCREENS.TEAM_FINAL);
  }, [teamPollEnabled, currentScreen, interacting, allBadgesComplete, storage.teamPoll.initial, storage.teamPoll.final]);

  const chooseInitialTeam = useCallback(team => {
    if (!teamPollEnabled || !getTwilightTeam(team)) return;
    storage.pickInitialTeam(team);
    play(UI_SOUNDS.buttonTap);
    setCurrentScreen(SCREENS.PASSPORT);
  }, [teamPollEnabled, storage.pickInitialTeam, play]);

  const confirmFinalTeam = useCallback(team => {
    if (!teamPollEnabled || !allBadgesComplete || !storage.teamPoll.initial || !getTwilightTeam(team)) return;
    storage.pickFinalTeam(team);
    play(UI_SOUNDS.buttonTap);
    setCurrentScreen(SCREENS.TEAM_SHARE);
  }, [teamPollEnabled, allBadgesComplete, storage.teamPoll.initial, storage.pickFinalTeam, play]);

  const openBadgeModal = useCallback((badge) => {
    play(UI_SOUNDS.modalOpen);
    // Play the badge-specific sound effect (if enabled)
    if (features?.badgeSounds !== false && badge.sound) {
      const fallbackUrl = getAssetUrl(badge.sound);
      playBadgeSound(badge.id, 0.7, fallbackUrl);
    }
    setSelectedBadge(badge);
    setBadgeModalExiting(false);
  }, [play, features, getAssetUrl]);

  const closeBadgeModal = useCallback(() => {
    play(UI_SOUNDS.modalClose);
    // Stop any playing badge sound
    stopBadgeSound();
    setBadgeModalExiting(true);
    setSelectedBadge(null);
  }, [play]);

  const openCertificationModal = useCallback(() => {
    play(UI_SOUNDS.modalOpen);
    if (teamPollEnabled && allBadgesComplete) {
      setCurrentScreen(storage.teamPoll.final ? SCREENS.TEAM_SHARE : SCREENS.TEAM_FINAL);
      return;
    }
    setCertificationExiting(false);
    setShowCertificationModal(true);
  }, [play, teamPollEnabled, allBadgesComplete, storage.teamPoll.final]);

  const closeCertificationModal = useCallback(() => {
    play(UI_SOUNDS.modalClose);
    setCertificationExiting(true);
    setShowCertificationModal(false);
  }, [play]);

  const openScheduleSheet = useCallback(() => {
    play(UI_SOUNDS.modalOpen);
    setScheduleExiting(false);
    setShowScheduleSheet(true);
  }, [play]);

  const closeScheduleSheet = useCallback(() => {
    play(UI_SOUNDS.modalClose);
    setScheduleExiting(true);
    setShowScheduleSheet(false);
  }, [play]);

  const claimBadgeWithSound = useCallback((badgeId, options = {}) => {
    storage.claimBadge(badgeId, options);
    play(UI_SOUNDS.badgeClaim);
  }, [storage, play]);

  const resetAndStartOver = useCallback(() => {
    storage.resetAll();
    setSecretUnlockQueue([]);
    setSelectedBadge(null);
    setShowCertificationModal(false);
    setShowScheduleSheet(false);
    setCurrentScreen(SCREENS.SPLASH);
  }, [storage]);

  const value = {
    // Storage
    ...storage,
    claimBadge: claimBadgeWithSound,
    teamPollEnabled,
    allBadgesComplete,
    chooseInitialTeam,
    confirmFinalTeam,

    // Sound
    play,

    // Navigation
    currentScreen,
    goToScreen,

    // Badge modal
    selectedBadge,
    finishBadgeExit,
    finishCertificationExit,
    finishScheduleExit,
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
    finishSecretExit,

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
