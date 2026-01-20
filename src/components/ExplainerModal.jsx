import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { slideUp, springs } from '../utils/animations';
import { playRandomGreeting, stopGreetingSound } from '../hooks/useSound';

export default function ExplainerModal() {
  const { goToScreen, SCREENS, name } = useApp();
  const { content, features } = usePassport();

  const explainerContent = content.explainer;

  // Play a random greeting when the screen mounts (if enabled)
  useEffect(() => {
    if (features.greetingSounds !== false) {
      playRandomGreeting();
    }

    // Stop the greeting if user leaves this screen
    return () => stopGreetingSound();
  }, [features.greetingSounds]);

  // Format greeting with name
  const greeting = explainerContent.greeting?.replace('{name}', name) || `Welcome, ${name}`;

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
          {explainerContent.title}
        </h2>

        {/* Greeting */}
        <p className="font-body text-earth-700 text-center mb-4 text-lg">
          {greeting.split(name).map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && <span className="font-semibold text-shire-600">{name}</span>}
            </span>
          ))}
        </p>

        {/* Body copy */}
        <div className="font-body text-earth-600 space-y-4 mb-6">
          {explainerContent.body?.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}

          {explainerContent.quote && (
            <p className="italic text-earth-500 border-l-4 border-gold-400 pl-4">
              "{explainerContent.quote}"
            </p>
          )}

          {explainerContent.disclaimer && (
            <p className="text-sm">{explainerContent.disclaimer}</p>
          )}
        </div>

        {/* Begin button */}
        <motion.button
          className="btn-primary w-full text-lg"
          onClick={() => goToScreen(SCREENS.PASSPORT)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {explainerContent.beginButton}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
