import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { fadeIn, springs } from '../utils/animations';
import { preloadBadgeSounds, preloadGreetingSounds, startBackgroundMusic } from '../hooks/useSound';

export default function SplashScreen() {
  const { goToScreen, SCREENS } = useApp();

  // Preload all sounds during splash screen for instant playback later
  useEffect(() => {
    preloadBadgeSounds();
    preloadGreetingSounds();
  }, []);

  // Handle enter button - start background music and navigate
  const handleEnter = () => {
    startBackgroundMusic(); // Start BG music on first user interaction
    goToScreen(SCREENS.NAME);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Ring badge in Gowalla style */}
      <motion.div
        className="w-48 h-48 mb-8 -mt-16 badge-image-container overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...springs.bouncy, delay: 0.2 }}
      >
        <img
          src="/images/ring-badge.png"
          alt="The One Ring"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="font-display text-4xl font-bold text-earth-800 mb-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        The Shire Passport
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="font-body text-lg text-earth-600 mb-10 italic"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Official Documentation of One's Journey
        <br />
        Through Middle-earth
      </motion.p>

      {/* Hosts - fixed bottom right */}
      <motion.div
        className="fixed bottom-10 right-6 flex flex-col items-center"
        initial={{ scale: 0, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 6, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 15,
          delay: 1,
        }}
      >
        <img
          src="/images/sophia-matt.png"
          alt="Sophia and Matt"
          className="w-24 drop-shadow-lg"
        />
        <p
          className="text-xs mt-1"
          style={{ fontFamily: "'Google Sans Flex', sans-serif", color: '#7C3AED' }}
        >
          Hosted by <span className="font-bold">Sophia</span> <span className="font-bold">and</span> <span className="font-bold">Matt</span>
        </p>
      </motion.div>

      {/* Enter button */}
      <motion.button
        className="btn-primary text-xl px-10 py-5"
        onClick={handleEnter}
        initial={{ y: 20, opacity: 0, scale: 1 }}
        animate={{
          y: 0,
          opacity: 1,
          scale: [1, 1.2, 1],
        }}
        transition={{
          y: { delay: 0.6 },
          opacity: { delay: 0.6 },
          scale: {
            delay: 0.6,
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Enter the Shire
      </motion.button>
    </motion.div>
  );
}
