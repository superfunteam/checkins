import { AnimatePresence } from 'framer-motion';
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
import RainEffect from './components/RainEffect';

function AppContent() {
  const { currentScreen } = useApp();

  return (
    <div className="app-container bg-parchment-100">
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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <RainEffect />
    </AppProvider>
  );
}
