import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { slideUpModal, backdrop, springs } from '../utils/animations';
import FloatingBadge from './FloatingBadge';
import { BADGE_SHAPES, getBadgeStyles } from '../utils/badgeStyles';

// Shape classes for shuffle mode (must match FloatingBadge/BadgeCard)
const SHUFFLE_SHAPES = ['arch', 'circle', 'square'];

export default function BadgeModal() {
  const {
    selectedBadge,
    closeBadgeModal,
    openBadgeModal,
    badges,
    claimBadge,
    getClaimTime,
    honorSystemDismissed,
    dismissHonorSystem,
    play,
    isSecretUnlocked,
    badgeOriginRect,
    isClosingBadgeModal,
  } = useApp();

  const { primaryBadges, secretBadges, getAssetUrl, getTypeLabel, getTypeColor, content, badgeShape } = usePassport();
  const modalContent = content.badgeModal;

  // Ref to get target position in modal
  const badgeTargetRef = useRef(null);
  const modalContentRef = useRef(null);
  const honorSystemRef = useRef(null);
  const [targetRect, setTargetRect] = useState(null);
  const [isFloatingVisible, setIsFloatingVisible] = useState(false);
  const [showModalBadge, setShowModalBadge] = useState(false);

  const [showHonorSystem, setShowHonorSystem] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);

  // Calculate badge styles based on shape setting (must match FloatingBadge)
  // Modal badge is w-48 = 192px
  const badgeStylesData = useMemo(() => {
    if (!selectedBadge) return getBadgeStyles(192, 'arch');

    if (badgeShape === 'shuffle') {
      // Find badge index in sorted primary badges
      const sortedBadges = [...primaryBadges].sort((a, b) => a.order - b.order);
      const index = sortedBadges.findIndex(b => b.id === selectedBadge.id);
      const safeIndex = index >= 0 ? index : 0;
      const shape = SHUFFLE_SHAPES[safeIndex % SHUFFLE_SHAPES.length];
      return getBadgeStyles(192, shape);
    }
    return getBadgeStyles(192, badgeShape);
  }, [badgeShape, selectedBadge, primaryBadges]);

  // Calculate target rect when modal opens and manage floating badge visibility
  useEffect(() => {
    if (selectedBadge && badgeOriginRect && !isClosingBadgeModal) {
      setShowModalBadge(false);
      const timer = setTimeout(() => {
        if (badgeTargetRef.current) {
          const rect = badgeTargetRef.current.getBoundingClientRect();
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
          setIsFloatingVisible(true);
        }
      }, 400);
      return () => clearTimeout(timer);
    } else if (isClosingBadgeModal && badgeOriginRect) {
      setIsFloatingVisible(true);
      setShowModalBadge(false);
    } else if (selectedBadge && !badgeOriginRect) {
      setIsFloatingVisible(false);
      setShowModalBadge(true);
      setTargetRect(null);
    } else if (!selectedBadge) {
      setTargetRect(null);
      setIsFloatingVisible(false);
      setShowModalBadge(false);
    }
  }, [selectedBadge, badgeOriginRect, isClosingBadgeModal]);

  const handleFloatingComplete = useCallback(() => {
    if (!isClosingBadgeModal) {
      setShowModalBadge(true);
    }
    setIsFloatingVisible(false);
  }, [isClosingBadgeModal]);

  // Get navigable badges (primary + unlocked secrets)
  const unlockedSecrets = secretBadges.filter(b => badges[b.id]?.claimed);
  const navigableBadges = [...primaryBadges, ...unlockedSecrets];

  const currentIndex = selectedBadge
    ? navigableBadges.findIndex(b => b.id === selectedBadge.id)
    : -1;

  const goToPrevBadge = useCallback(() => {
    if (currentIndex > 0) {
      setSlideDirection(1);
      setShowHonorSystem(false);
      setJustClaimed(false);
      openBadgeModal(navigableBadges[currentIndex - 1]);
    }
  }, [currentIndex, navigableBadges, openBadgeModal]);

  const goToNextBadge = useCallback(() => {
    if (currentIndex < navigableBadges.length - 1) {
      setSlideDirection(-1);
      setShowHonorSystem(false);
      setJustClaimed(false);
      openBadgeModal(navigableBadges[currentIndex + 1]);
    }
  }, [currentIndex, navigableBadges, openBadgeModal]);

  useEffect(() => {
    if (selectedBadge) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [selectedBadge]);

  useEffect(() => {
    if (showHonorSystem && honorSystemRef.current && modalContentRef.current) {
      setTimeout(() => {
        honorSystemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [showHonorSystem]);

  useEffect(() => {
    if (!selectedBadge) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrevBadge(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goToNextBadge(); }
      else if (e.key === 'Escape') { closeBadgeModal(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBadge, goToPrevBadge, goToNextBadge, closeBadgeModal]);

  const handleDragEnd = (e, info) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) goToPrevBadge();
    else if (info.offset.x < -swipeThreshold) goToNextBadge();
  };

  if (!selectedBadge) return null;

  const isClaimed = badges[selectedBadge.id]?.claimed;
  const claimTime = getClaimTime(selectedBadge.id);
  const isSecret = selectedBadge.type === 'secret';
  const typeLabel = getTypeLabel(selectedBadge.type);
  const typeColor = getTypeColor(selectedBadge.type);

  const handleClaimClick = () => {
    if (honorSystemDismissed) performClaim();
    else setShowHonorSystem(true);
  };

  const performClaim = () => {
    claimBadge(selectedBadge.id);
    setJustClaimed(true);
    setShowHonorSystem(false);
    if (dontAskAgain) dismissHonorSystem();
    setTimeout(() => {
      closeBadgeModal();
      setJustClaimed(false);
    }, 800);
  };

  const contentVariants = {
    enter: (direction) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <AnimatePresence>
      {selectedBadge && (
        <>
          <motion.div
            className="modal-backdrop"
            variants={backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeBadgeModal}
          />

          <motion.div
            ref={modalContentRef}
            className="modal-content overflow-y-auto overflow-x-hidden"
            style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
            variants={slideUpModal}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springs.smooth}
          >
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={selectedBadge.id}
                custom={slideDirection}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="p-6 pb-8"
              >
                <button
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-earth-400 hover:text-earth-600"
                  onClick={closeBadgeModal}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <motion.div
                  className="flex justify-center mb-4"
                  style={{ opacity: showModalBadge || !badgeOriginRect ? 1 : 0 }}
                  initial={badgeOriginRect ? false : { scale: 0.8 }}
                  animate={justClaimed ? { scale: [1, 1.1, 0.95, 1.05, 1], rotate: [0, -3, 3, -1, 0] } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div
                    ref={badgeTargetRef}
                    className="w-48 h-48 overflow-hidden"
                    style={badgeStylesData}
                  >
                    <img
                      src={getAssetUrl(selectedBadge.image)}
                      alt={selectedBadge.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span
                    className="px-3 py-1 rounded-full text-xs uppercase tracking-wider text-earth-800"
                    style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 500, backgroundColor: `${typeColor}25` }}
                  >
                    {typeLabel}
                  </span>
                  {selectedBadge.startTime && (
                    <span className="px-3 py-1 rounded-full text-xs tracking-wide text-earth-800 bg-earth-200" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
                      {selectedBadge.startTime} – {selectedBadge.time}
                    </span>
                  )}
                  {selectedBadge.time && !selectedBadge.startTime && (
                    <span className="px-3 py-1 rounded-full text-xs tracking-wide text-earth-800 bg-earth-200" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
                      {selectedBadge.time}
                    </span>
                  )}
                </div>

                <h2 className="font-display text-2xl font-bold text-earth-800 text-center mt-2 mb-4">
                  {selectedBadge.name}
                </h2>

                <p className="font-body text-earth-600 text-center mb-4 leading-relaxed text-xl">
                  {selectedBadge.longDesc}
                </p>

                {selectedBadge.instruction && !isClaimed && !justClaimed && (
                  <p className="text-base text-center mb-6" style={{ fontFamily: "'Google Sans Flex', sans-serif", color: '#7C3AED' }}>
                    {selectedBadge.instruction}
                  </p>
                )}

                {!showHonorSystem && (
                  <>
                    {isClaimed || justClaimed ? (
                      <div className="text-center">
                        <div
                          className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-button shadow-button"
                          style={{ backgroundColor: '#7C3AED', color: 'white', fontFamily: "'Google Sans Flex', sans-serif" }}
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{modalContent.claimedLabel}</span>
                        </div>
                        {claimTime && (
                          <p className="text-earth-500 text-sm mt-2">
                            {modalContent.witnessedAt?.replace('{time}', claimTime) || `Witnessed at ${claimTime}`}
                          </p>
                        )}
                      </div>
                    ) : (
                      <motion.button
                        className="btn-primary w-full"
                        onClick={handleClaimClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {modalContent.claimButton}
                      </motion.button>
                    )}
                  </>
                )}

                <AnimatePresence>
                  {showHonorSystem && (
                    <motion.div
                      ref={honorSystemRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-parchment-200 rounded-card p-4"
                    >
                      <p className="text-earth-700 text-sm mb-4" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
                        {modalContent.honorSystemText}
                      </p>

                      <label className="flex items-center gap-3 mb-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dontAskAgain}
                          onChange={(e) => setDontAskAgain(e.target.checked)}
                          className="w-5 h-5 rounded border-earth-400 text-shire-500 focus:ring-shire-500"
                        />
                        <span className="text-sm text-earth-600" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
                          {modalContent.honorSystemCheckbox}
                        </span>
                      </label>

                      <div className="flex flex-col gap-3">
                        <motion.button
                          className="btn-primary w-full py-4 text-lg"
                          onClick={performClaim}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {modalContent.honorConfirmButton}
                        </motion.button>
                        <button className="btn-secondary w-full" onClick={() => setShowHonorSystem(false)}>
                          {modalContent.cancelButton}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {isFloatingVisible && badgeOriginRect && targetRect && selectedBadge && (
            <FloatingBadge
              badge={selectedBadge}
              originRect={badgeOriginRect}
              targetRect={targetRect}
              isClosing={isClosingBadgeModal}
              onAnimationComplete={handleFloatingComplete}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
