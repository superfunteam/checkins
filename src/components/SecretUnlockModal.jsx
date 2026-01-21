import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { scaleIn, springs } from '../utils/animations';
import { playBadgeSound } from '../hooks/useSound';
import { getBadgeStyles } from '../utils/badgeStyles';

export default function SecretUnlockModal() {
  const { secretUnlockModal, closeSecretUnlockModal } = useApp();
  const { getAssetUrl, content, theme, badgeShape } = usePassport();

  const unlockContent = content.secretUnlock;

  // Calculate badge styles based on shape setting
  // For secret badges, use the base shape (not shuffle since they're not in the grid)
  // Secret unlock badge is w-32 = 128px
  const badgeStylesData = useMemo(() => {
    const shape = badgeShape === 'shuffle' ? 'arch' : badgeShape;
    return getBadgeStyles(128, shape);
  }, [badgeShape]);

  // Fire confetti and play badge sound when modal opens
  useEffect(() => {
    if (secretUnlockModal) {
      playBadgeSound(secretUnlockModal.id);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Use theme colors for confetti
      const colors = [
        theme.colors.accent['500'],
        theme.colors.accent['400'],
        theme.colors.primary['500'],
        theme.colors.text['500'],
        theme.colors.background['100'],
      ];

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
  }, [secretUnlockModal, theme]);

  if (!secretUnlockModal) return null;

  return (
    <AnimatePresence>
      {secretUnlockModal && (
        <>
          <motion.div
            className="fixed inset-0 backdrop-blur-sm z-50"
            style={{ backgroundColor: 'rgba(31, 26, 19, 0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSecretUnlockModal}
          />

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
              <motion.div
                className="text-5xl mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...springs.bouncy, delay: 0.2 }}
              >
                ✨
              </motion.div>

              <motion.h2
                className="font-display text-2xl font-bold text-gold-600 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {unlockContent?.header || 'Secret Badge Unlocked!'}
              </motion.h2>

              <motion.div
                className="w-32 h-32 mx-auto mb-4 overflow-hidden"
                style={badgeStylesData}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...springs.bouncy, delay: 0.4 }}
              >
                <img
                  src={getAssetUrl(secretUnlockModal.image)}
                  alt={secretUnlockModal.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              <motion.h3
                className="font-display text-xl font-semibold text-earth-800 mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {secretUnlockModal.name}
              </motion.h3>

              <motion.p
                className="font-body text-earth-600 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {secretUnlockModal.longDesc}
              </motion.p>

              <motion.button
                className="btn-primary"
                onClick={closeSecretUnlockModal}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {secretUnlockModal.id === 'secret-ringbearer'
                  ? (unlockContent?.certifyButton || 'View and Certify My Passport')
                  : (unlockContent?.continueButton || 'Continue Journey')}
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
