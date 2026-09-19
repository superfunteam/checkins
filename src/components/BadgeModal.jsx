import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { easeOut } from '../utils/animations';
import { useDialog } from '../hooks/useDialog';
import { getBadgeStyles } from '../utils/badgeStyles';
import QrScanner from './QrScanner';
import QrCodeIcon from './icons/QrCodeIcon';
import { validateQrScan } from '../utils/qrUtils';

// Shape classes for shuffle mode (must match BadgeCard)
const SHUFFLE_SHAPES = ['arch', 'circle', 'square'];

export default function BadgeModal() {
  const { selectedBadge, finishBadgeExit } = useApp();
  const [retainedBadge, setRetainedBadge] = useState(null);
  useLayoutEffect(() => {
    if (selectedBadge) setRetainedBadge(selectedBadge);
  }, [selectedBadge]);
  const finishExit = useCallback(() => {
    if (!selectedBadge) { setRetainedBadge(null); finishBadgeExit(); }
  }, [selectedBadge, finishBadgeExit]);
  const badge = selectedBadge || retainedBadge;
  return badge ? <BadgeDialog selectedBadge={badge} open={Boolean(selectedBadge)} onExited={finishExit} /> : null;
}

function BadgeDialog({ selectedBadge, open, onExited }) {
  const {
    closeBadgeModal,
    openBadgeModal,
    badges,
    claimBadge,
    getClaimTime,
    honorSystemDismissed,
    dismissHonorSystem,
  } = useApp();

  const { primaryBadges, secretBadges, getAssetUrl, getTypeLabel, getTypeColor, content, badgeShape, passportId, badges: allBadgeDefinitions } = usePassport();
  const modalContent = content.badgeModal;

  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrError, setQrError] = useState(null);

  // Keep scrolling and focus stable through the exit animation
  const modalContentRef = useRef(null);
  const backdropRef = useRef(null);
  const honorSystemRef = useRef(null);
  const claimTimer = useRef(null);
  const reduceMotion = useReducedMotion();
  const { isPresent } = useDialog(modalContentRef, closeBadgeModal, { nativeMotion: true, backdropRef, open, onExited });

  const [showHonorSystem, setShowHonorSystem] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);

  // Calculate badge styles based on shape setting (matches the grid)
  // Modal badge is w-48 = 192px
  const badgeStylesData = useMemo(() => {
    if (!selectedBadge) return getBadgeStyles(192, 'arch');

    if (badgeShape === 'shuffle') {
      // Find badge index in sorted primary badges
      const sortedBadges = [...allBadgeDefinitions].sort((a, b) => a.order - b.order);
      const index = sortedBadges.findIndex(b => b.id === selectedBadge.id);
      const safeIndex = index >= 0 ? index : 0;
      const shape = SHUFFLE_SHAPES[safeIndex % SHUFFLE_SHAPES.length];
      return getBadgeStyles(192, shape);
    }
    return getBadgeStyles(192, badgeShape);
  }, [badgeShape, selectedBadge, allBadgeDefinitions]);

  useEffect(() => {
    setShowHonorSystem(false);
    setJustClaimed(false);
    setQrError(null);
    setShowQrScanner(false);
    return () => { clearTimeout(claimTimer.current); claimTimer.current = null; };
  }, [selectedBadge.id]);

  // Get navigable badges (primary + unlocked secrets)
  const unlockedSecrets = secretBadges.filter(b => badges[b.id]?.claimed);
  const navigableBadges = [...primaryBadges, ...unlockedSecrets];

  const currentIndex = selectedBadge
    ? navigableBadges.findIndex(b => b.id === selectedBadge.id)
    : -1;

  const goToPrevBadge = useCallback(() => {
    if (isPresent && currentIndex > 0) {
      setSlideDirection(1);
      setShowHonorSystem(false);
      setJustClaimed(false);
      openBadgeModal(navigableBadges[currentIndex - 1]);
    }
  }, [isPresent, currentIndex, navigableBadges, openBadgeModal]);

  const goToNextBadge = useCallback(() => {
    if (isPresent && currentIndex < navigableBadges.length - 1) {
      setSlideDirection(-1);
      setShowHonorSystem(false);
      setJustClaimed(false);
      openBadgeModal(navigableBadges[currentIndex + 1]);
    }
  }, [isPresent, currentIndex, navigableBadges, openBadgeModal]);

  useLayoutEffect(() => {
    modalContentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [selectedBadge.id]);

  useEffect(() => {
    if (!open) {
      clearTimeout(claimTimer.current);
      claimTimer.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (showHonorSystem && honorSystemRef.current && modalContentRef.current) {
      const timer = setTimeout(() => {
        honorSystemRef.current?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'end' });
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [showHonorSystem, reduceMotion]);

  useEffect(() => {
    if (!isPresent || showQrScanner) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrevBadge(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goToNextBadge(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresent, showQrScanner, goToPrevBadge, goToNextBadge]);

  const handleSwipe = (e, info) => {
    const swipeThreshold = 50;
    if (Math.abs(info.offset.x) <= Math.abs(info.offset.y)) return;
    if (info.offset.x > swipeThreshold) goToPrevBadge();
    else if (info.offset.x < -swipeThreshold) goToNextBadge();
  };

  const isClaimed = badges[selectedBadge.id]?.claimed;
  const claimTime = getClaimTime(selectedBadge.id);
  const typeLabel = getTypeLabel(selectedBadge.type);
  const typeColor = getTypeColor(selectedBadge.type);

  const handleClaimClick = () => {
    if (!isPresent) return;
    if (selectedBadge.requiresQrScan) {
      setShowQrScanner(true);
      setQrError(null);
    } else if (honorSystemDismissed) {
      performClaim();
    } else {
      setShowHonorSystem(true);
    }
  };

  const performClaim = () => {
    if (justClaimed || claimTimer.current || !isPresent) return;
    claimBadge(selectedBadge.id);
    setJustClaimed(true);
    setShowHonorSystem(false);
    setShowQrScanner(false);
    if (dontAskAgain) dismissHonorSystem();
    claimTimer.current = setTimeout(closeBadgeModal, reduceMotion ? 150 : 420);
  };

  const handleQrScanSuccess = (decodedText) => {
    const result = validateQrScan(
      decodedText,
      passportId,
      selectedBadge.id,
      selectedBadge.claimSecret
    );

    if (result.valid) {
      setQrError(null);
      performClaim();
    } else {
      setQrError(result.error);
      setShowQrScanner(false);
    }
  };

  const handleQrScanClose = () => {
    setShowQrScanner(false);
  };

  return (
    <>
          <div ref={backdropRef} className="modal-backdrop" onClick={isPresent ? closeBadgeModal : undefined} />

          <div
            ref={modalContentRef}
            className="modal-content badge-detail-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-dialog-title"
            tabIndex={-1}
            inert={isPresent ? undefined : ''}
            style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
          >
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-earth-400 hover:text-earth-600"
              onClick={closeBadgeModal}
              aria-label="Close badge"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

              {/* Replace the page directly: no retained outgoing art or drag spring
                  can reappear after the sheet has started closing. */}
              <motion.div
                key={selectedBadge.id}
                initial={reduceMotion || !slideDirection ? false : { x: slideDirection * -12, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.14, ease: easeOut }}
                onPanEnd={handleSwipe}
                className="badge-detail-page p-6 pb-8"
              >
                <div className="flex justify-center mb-4">
                  <div
                    className="w-48 h-48 overflow-hidden"
                    style={badgeStylesData}
                  >
                    <img
                      src={getAssetUrl(selectedBadge.image)}
                      alt={selectedBadge.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

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

                <h2 id="badge-dialog-title" className="font-display text-2xl font-bold text-earth-800 text-center mt-2 mb-4">
                  {selectedBadge.name}
                </h2>

                <p className="font-body text-earth-600 text-center mb-4 leading-relaxed text-xl whitespace-pre-line">
                  {selectedBadge.longDesc}
                </p>

                {selectedBadge.instruction && !isClaimed && !justClaimed && (
                  <p className="text-base text-center mb-6" style={{ fontFamily: "'Google Sans Flex', sans-serif", color: 'var(--color-hint)' }}>
                    {selectedBadge.instruction}
                  </p>
                )}

                {qrError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                    {qrError}
                  </div>
                )}

                {!showHonorSystem && (
                  <>
                    {isClaimed || justClaimed ? (
                      <div className="text-center">
                        <div
                          className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-button shadow-button"
                          style={{ backgroundColor: 'var(--color-claimed)', color: 'white', fontFamily: "'Google Sans Flex', sans-serif" }}
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
                    ) : selectedBadge.requiresQrScan ? (
                      <motion.button
                        className="btn-primary w-full flex items-center justify-center gap-2"
                        onClick={handleClaimClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <QrCodeIcon className="w-5 h-5" />
                        <span>Scan QR Code to Claim</span>
                      </motion.button>
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
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
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
          </div>

          <AnimatePresence>
            {showQrScanner && (
              <QrScanner
                onSuccess={handleQrScanSuccess}
                onError={(e) => setQrError(e)}
                onClose={handleQrScanClose}
              />
            )}
          </AnimatePresence>
    </>
  );
}
