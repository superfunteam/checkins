import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { slideUp } from '../utils/animations';

import { preloadImage, warmImages } from '../utils/preloadImages';

export default function LoadingScreen() {
  const { goToScreen, SCREENS } = useApp();
  const { badges, getAssetUrl, content } = usePassport();

  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Preparing the journey...');

  useEffect(() => {
    let mounted = true;
    // Prepare the first visible rows. Remaining art warms in a bounded queue;
    // audio is already managed by AppContext and never blocks navigation.
    const images = [...badges].sort((a, b) => a.order - b.order).map(b => getAssetUrl(b.image));
    const firstRows = images.slice(0, 9);
    let loaded = 0;
    setLoadingText('Loading badges...');
    setProgress(0);
    Promise.all(firstRows.map(src => preloadImage(src).then(() => {
      loaded += 1;
      if (mounted) setProgress(Math.round(loaded / firstRows.length * 100));
    }))).then(() => {
      warmImages(images.slice(9));
      if (mounted) goToScreen(SCREENS.EXPLAINER, { silent: true });
    });
    return () => { mounted = false; };
  }, [goToScreen, SCREENS, badges, getAssetUrl]);

  // Get quote from content or use default
  const flavorQuote = content.certificate?.footer || '"The road goes ever on and on..."';

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      variants={slideUp}
      initial={reduceMotion ? false : "initial"}
      animate="animate"
      exit="exit"
    >
      <motion.div
        className="w-full max-w-xs flex flex-col items-center"
      >
        {/* Spinning ring loader */}
        <div className="relative w-24 h-24 mb-8">
          <motion.div
            className="w-full h-full rounded-full border-4 border-parchment-300"
            style={{ borderTopColor: 'var(--color-highlight)' }}
            animate={{ rotate: reduceMotion ? 0 : 360 }}
            transition={{
              duration: 1,
              repeat: reduceMotion ? 0 : Infinity,
              ease: 'linear',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-display text-earth-700">{progress}%</span>
          </div>
        </div>

        {/* Loading text */}
        <p
          className="text-earth-600 text-center mb-4"
          style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
        >
          {loadingText}
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-parchment-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--color-highlight)', transformOrigin: 'left' }}
            initial={false}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
          />
        </div>

        {/* Flavor text */}
        <p
          className="text-earth-400 text-xs text-center mt-6 italic"
          style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
        >
          {flavorQuote}
        </p>
      </motion.div>
    </motion.div>
  );
}
