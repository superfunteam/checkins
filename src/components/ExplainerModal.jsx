import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { slideUp, springs } from '../utils/animations';
import { playRandomGreeting, stopGreetingSound } from '../hooks/useSound';

export default function ExplainerModal() {
  const { goToScreen, SCREENS, name } = useApp();

  // Play a random greeting when the screen mounts
  useEffect(() => {
    playRandomGreeting();

    // Stop the greeting if user leaves this screen
    return () => stopGreetingSound();
  }, []);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={springs.smooth}
    >
      <motion.div
        className="w-full max-w-sm bg-parchment-50 rounded-modal shadow-modal p-8"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Header */}
        <h2 className="font-display text-2xl font-bold text-earth-800 text-center mb-6">
          Your Quest Awaits
        </h2>

        {/* Greeting */}
        <p className="font-body text-earth-700 text-center mb-4 text-lg">
          Welcome, <span className="font-semibold text-shire-600">{name}</span>
        </p>

        {/* Body copy */}
        <div className="font-body text-earth-600 space-y-4 mb-6">
          <p>
            Before you lies a perilous journey through all three Extended Editions
            of The Lord of the Rings.
          </p>
          <p>
            As you witness legendary moments and partake in the seven sacred meals
            of hobbit tradition, tap each badge to mark your progress.
          </p>
          <p className="italic text-earth-500 border-l-4 border-gold-400 pl-4">
            "A wizard is never late, nor is he early. He arrives precisely when
            he means to."
          </p>
          <p className="text-sm">
            All times are approximate-ish. This passport operates on the honor system.
            The Shire trusts its guests.
          </p>
        </div>

        {/* Begin button */}
        <motion.button
          className="btn-primary w-full text-lg"
          onClick={() => goToScreen(SCREENS.PASSPORT)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Begin My Journey
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
