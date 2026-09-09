import { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { slideUpModal, backdrop, overlayTransition } from '../utils/animations';
import { exportPassportPng } from '../utils/exportPng';
import { useDialog } from '../hooks/useDialog';
import BadgeChecklist from './BadgeChecklist';
import ExportTemplate from './ExportTemplate';

export default function CertificationModal() {
  const { showCertificationModal, finishCertificationExit } = useApp();
  return (
    <AnimatePresence initial={false} onExitComplete={finishCertificationExit}>
      {showCertificationModal && <CertificationDialog key="certification" />}
    </AnimatePresence>
  );
}

function CertificationDialog() {
  const {
    closeCertificationModal,
    showChecklist,
    setShowChecklist,
    getClaimedCount,
    name,
    play,
  } = useApp();

  const { badges: allBadges, content, passportId } = usePassport();
  const reduceMotion = useReducedMotion();
  const certContent = content.certification;

  const [isExporting, setIsExporting] = useState(false);

  const dialogRef = useRef(null);
  const handleClose = () => { if (!isExporting) closeCertificationModal(); };
  const { isPresent, completeExit } = useDialog(dialogRef, handleClose);

  const claimedCount = getClaimedCount();
  const totalBadges = allBadges.length;

  const handleCertify = async () => {
    setIsExporting(true);
    play('horn');

    try {
      await exportPassportPng({ name, passportId });
    } catch (error) {
      console.error('Export failed:', error);
      play('bonk');
    } finally {
      setIsExporting(false);
    }
  };

  // Get completion message
  const getCompletionMessage = () => {
    const messages = certContent.completionMessages;
    if (claimedCount === totalBadges) return messages?.perfect || 'Perfect completion! You are a true Ringbearer.';
    if (claimedCount >= 16) return messages?.high || 'A worthy journey indeed!';
    if (claimedCount >= 10) return messages?.medium || 'A respectable showing!';
    return messages?.low || 'Every journey begins with a single step.';
  };

  return (
    <>
          <motion.div
            className="modal-backdrop"
            transition={overlayTransition}
            variants={backdrop}
            initial={reduceMotion ? false : "initial"}
            animate={isPresent ? "animate" : "exit"}
            onClick={handleClose}
          />

          <motion.div
            className="modal-content"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={certContent.title}
            tabIndex={-1}
            onAnimationComplete={completeExit}
            variants={slideUpModal}
            initial={reduceMotion ? false : "initial"}
            animate={isPresent ? "animate" : "exit"}
          >
            <div className="p-6">
              <button
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-earth-400 hover:text-earth-600"
                aria-label="Close certificate"
                disabled={isExporting}
                onClick={handleClose}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {!showChecklist ? (
                <>
                  <h2 className="font-display text-2xl font-bold text-earth-800 text-center mb-4">
                    {certContent.title}
                  </h2>

                  <div className="font-body text-earth-600 space-y-4 mb-6">
                    {certContent.body?.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                    {certContent.footnote && (
                      <p className="text-sm text-earth-500 italic">{certContent.footnote}</p>
                    )}
                  </div>

                  <div
                    className="bg-parchment-200 rounded-card p-4 mb-6 text-center"
                    style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
                  >
                    <p className="text-3xl font-bold text-shire-600">
                      {claimedCount} / {totalBadges}
                    </p>
                    <p className="text-earth-500 text-sm">{certContent.badgesLabel}</p>

                    <p className="text-earth-600 mt-3 text-sm">
                      {claimedCount === totalBadges ? (
                        <span className="text-gold-600 font-semibold">
                          {getCompletionMessage()}
                        </span>
                      ) : (
                        getCompletionMessage()
                      )}
                    </p>
                  </div>

                  <motion.button
                    className="btn-primary w-full mb-3"
                    onClick={handleCertify}
                    disabled={isExporting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isExporting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {certContent.generatingText || 'Generating...'}
                      </span>
                    ) : (
                      certContent.downloadButton
                    )}
                  </motion.button>

                  <button
                    className="w-full text-center text-shire-600 font-body text-sm py-2 hover:text-shire-700 transition-colors"
                    onClick={() => setShowChecklist(true)}
                  >
                    {certContent.reviewButton}
                  </button>
                </>
              ) : (
                <BadgeChecklist onBack={() => setShowChecklist(false)} />
              )}
            </div>
          </motion.div>

          <ExportTemplate />
    </>
  );
}
