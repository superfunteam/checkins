import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
import PassportListing from './components/PassportListing';
import LandingPage from './pages/LandingPage';
import EventInquiryPage from './pages/EventInquiryPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminApp from './admin/AdminApp';

function AppContent() {
  const { currentScreen } = useApp();

  return (
    <div className="app-container bg-background-100">
      <AnimatePresence mode="wait">
        {currentScreen === SCREENS.SPLASH && <SplashScreen key="splash" />}
        {currentScreen === SCREENS.NAME && <NameModal key="name" />}
        {currentScreen === SCREENS.LOADING && <LoadingScreen key="loading" />}
        {currentScreen === SCREENS.EXPLAINER && <ExplainerModal key="explainer" />}
        {currentScreen === SCREENS.PASSPORT && <Passport key="passport" />}
      </AnimatePresence>

      {/* Modals */}
      <BadgeModal />
      <CertificationModal />
      <SecretUnlockModal />
      <ScheduleSheet />
    </div>
  );
}

function PassportApp() {
  return (
    <PassportProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </PassportProvider>
  );
}

export default function App() {
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
