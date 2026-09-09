import { useEffect, useLayoutEffect, useCallback, useState, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { scaleIn, overlayTransition } from '../utils/animations';
import { playBadgeSound, stopBadgeSound } from '../hooks/useSound';
import { getBadgeStyles } from '../utils/badgeStyles';
import { useDialog } from '../hooks/useDialog';

export default function SecretUnlockModal() {
  const { secretUnlockModal, finishSecretExit } = useApp();
  const [retainedBadge, setRetainedBadge] = useState(null);
  useLayoutEffect(() => { if (secretUnlockModal) setRetainedBadge(secretUnlockModal); }, [secretUnlockModal]);
  const finishExit = useCallback(() => {
    if (!secretUnlockModal) { setRetainedBadge(null); finishSecretExit(); }
  }, [secretUnlockModal, finishSecretExit]);
  const badge = secretUnlockModal || retainedBadge;
  return badge ? <SecretDialog key={badge.id} badge={badge} open={Boolean(secretUnlockModal)} onExited={finishExit} /> : null;
}

function SecretDialog({ badge, open, onExited }) {
  const { closeSecretUnlockModal } = useApp();
  const { getAssetUrl, content, theme, badgeShape, features } = usePassport();
  const dialogRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const closing = useRef(false);
  const handleClose = () => {
    if (closing.current) return;
    closing.current = true;
    closeSecretUnlockModal();
  };
  const { isPresent, completeExit } = useDialog(dialogRef, handleClose, { open, onExited });
  const unlockContent = content.secretUnlock;
  const badgeStyles = useMemo(() => getBadgeStyles(128, badgeShape === 'shuffle' ? 'arch' : badgeShape), [badgeShape]);

  useEffect(() => {
    if (features.badgeSounds !== false) playBadgeSound(badge.id, 0.7, getAssetUrl(badge.sound));
    if (!reduceMotion) {
      confetti({
        particleCount: 70,
        spread: 65,
        ticks: 150,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
        colors: [theme.colors.accent['500'], theme.colors.accent['400'], theme.colors.primary['500'], theme.colors.text['500']],
      });
    }
    return () => { stopBadgeSound(); confetti.reset(); };
  }, [badge.id, badge.sound, features.badgeSounds, getAssetUrl, reduceMotion, theme]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(31, 26, 19, 0.7)' }}
      initial={{ opacity: 0 }} animate={{ opacity: isPresent ? 1 : 0 }}
      transition={overlayTransition}
      onClick={handleClose}
    >
      <motion.div
        ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="secret-dialog-title" tabIndex={-1}
        className="bg-parchment-50 rounded-modal shadow-modal p-8 max-w-sm w-full text-center max-h-[85dvh] overflow-y-auto overscroll-contain"
        variants={scaleIn} initial={reduceMotion ? false : "initial"} animate={isPresent ? "animate" : "exit"} onAnimationComplete={completeExit}
        onClick={event => event.stopPropagation()}
      >
        <div className="text-5xl mb-4" aria-hidden="true">✨</div>
        <h2 className="font-display text-2xl font-bold text-gold-600 mb-4" id="secret-dialog-title">
          {unlockContent?.header || 'Secret Badge Unlocked!'}
        </h2>
        <div className="w-32 h-32 mx-auto mb-4 overflow-hidden" style={badgeStyles}>
          <img src={getAssetUrl(badge.image)} alt={badge.name} className="w-full h-full object-cover" />
        </div>
        <h3 className="font-display text-xl font-semibold text-earth-800 mb-2">{badge.name}</h3>
        <p className="font-body text-earth-600 mb-6">{badge.longDesc}</p>
        <motion.button className="btn-primary" onClick={handleClose} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {unlockContent?.continueButton || 'Continue Journey'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
