import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion';
import { PassportProvider } from './context/PassportContext';
import { AppProvider, useApp, SCREENS } from './context/AppContext';
import SplashScreen from './components/SplashScreen';
import NameModal from './components/NameModal';
import LoadingScreen from './components/LoadingScreen';
import ExplainerModal from './components/ExplainerModal';
import Passport from './components/Passport';
import BadgeModal from './components/BadgeModal';
import CertificationModal from './components/CertificationModal';
import SecretUnlockModal from './components/SecretUnlockModal';
import ScheduleSheet from './components/ScheduleSheet';
import TeamPickScreen from './components/TeamPickScreen';
import TeamShareScreen from './components/TeamShareScreen';
import PassportListing from './components/PassportListing';
import LandingPage from './pages/LandingPage';
import EventInquiryPage from './pages/EventInquiryPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminApp from './admin/AdminApp';
import { getHostPassportId } from './utils/hostPassport';

function AppContent() {
  const { currentScreen } = useApp();
  const reduceMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: reduceMotion ? 0 : 0.2 }}>
    <div className={`app-container bg-background-100${reduceMotion ? ' motion-reduced' : ''}`}>
      <AnimatePresence mode="wait">
        {currentScreen === SCREENS.SPLASH && <SplashScreen key="splash" />}
        {currentScreen === SCREENS.NAME && <NameModal key="name" />}
        {currentScreen === SCREENS.LOADING && <LoadingScreen key="loading" />}
        {currentScreen === SCREENS.EXPLAINER && <ExplainerModal key="explainer" />}
        {currentScreen === SCREENS.PASSPORT && <Passport key="passport" />}
        {currentScreen === SCREENS.TEAM_PICK && <TeamPickScreen key="team-pick" />}
        {currentScreen === SCREENS.TEAM_FINAL && <TeamPickScreen key="team-final" finalRound />}
        {currentScreen === SCREENS.TEAM_SHARE && <TeamShareScreen key="team-share" />}
      </AnimatePresence>

      {/* Modals */}
      <BadgeModal />
      <CertificationModal />
      <SecretUnlockModal />
      <ScheduleSheet />
    </div>
    </MotionConfig>
  );
}

function PassportApp({ passportId }) {
  return (
    <PassportProvider passportId={passportId}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </PassportProvider>
  );
}

export default function App() {
  // twilight.checkins.party (or twilight.localhost in dev) mounts that
  // passport at "/". The path-based routes keep working everywhere.
  const hostPassportId = getHostPassportId();

  if (hostPassportId) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/event/:passportId/*" element={<PassportApp />} />
          <Route path="/*" element={<PassportApp passportId={hostPassportId} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Event inquiry form */}
        <Route path="/event-inquiry" element={<EventInquiryPage />} />

        {/* Legal pages */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Passport routes */}
        <Route path="/event/:passportId/*" element={<PassportApp />} />

        {/* Events listing */}
        <Route path="/events" element={<PassportListing />} />

        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}
