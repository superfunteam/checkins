import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { scaleIn, springs } from '../utils/animations';
import { playBadgeSound } from '../hooks/useSound';

export default function SecretUnlockModal() {
  const { secretUnlockModal, closeSecretUnlockModal } = useApp();

  // Fire confetti and play badge sound when modal opens
  useEffect(() => {
    if (secretUnlockModal) {
      // Play the badge-specific sound effect
      playBadgeSound(secretUnlockModal.id);

      // Check for reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Gold and earthy confetti colors
      const colors = ['#d4af37', '#e7c333', '#4a6741', '#8b7355', '#f9f6f0'];

      // Fire multiple bursts
      const fireConfetti = () => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors,
        });
      };

      fireConfetti();
      setTimeout(fireConfetti, 200);
      setTimeout(fireConfetti, 400);
    }
  }, [secretUnlockModal]);

  if (!secretUnlockModal) return null;

  return (
    <AnimatePresence>
      {secretUnlockModal && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-earth-900/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSecretUnlockModal}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-parchment-50 rounded-modal shadow-modal p-8 max-w-sm w-full text-center"
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={springs.bouncy}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sparkle decoration */}
              <motion.div
                className="text-5xl mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...springs.bouncy, delay: 0.2 }}
              >
                ✨
              </motion.div>

              {/* Header */}
              <motion.h2
                className="font-display text-2xl font-bold text-gold-600 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Secret Badge Unlocked!
              </motion.h2>

              {/* Badge image */}
              <motion.div
                className="w-32 h-32 mx-auto mb-4 badge-image-container overflow-hidden"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...springs.bouncy, delay: 0.4 }}
              >
                <img
                  src={secretUnlockModal.image}
                  alt={secretUnlockModal.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Badge name */}
              <motion.h3
                className="font-display text-xl font-semibold text-earth-800 mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {secretUnlockModal.name}
              </motion.h3>

              {/* Badge description */}
              <motion.p
                className="font-body text-earth-600 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {secretUnlockModal.longDesc}
              </motion.p>

              {/* Dismiss button */}
              <motion.button
                className="btn-primary"
                onClick={closeSecretUnlockModal}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {secretUnlockModal.id === 'secret-ringbearer' ? 'View and Certify My Passport' : 'Continue Journey'}
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
