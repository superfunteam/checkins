import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { badges } from '../data/badges';
import { slideUpModal, backdrop, springs } from '../utils/animations';
import { exportPassportPng, formatCertificateDate } from '../utils/exportPng';
import BadgeChecklist from './BadgeChecklist';
import ExportTemplate from './ExportTemplate';

export default function CertificationModal() {
  const {
    showCertificationModal,
    closeCertificationModal,
    showChecklist,
    setShowChecklist,
    getClaimedCount,
    name,
    play,
  } = useApp();

  const [isExporting, setIsExporting] = useState(false);

  const claimedCount = getClaimedCount();
  const totalBadges = badges.length;

  const handleCertify = async () => {
    setIsExporting(true);
    play('horn');

    try {
      await exportPassportPng({ name });
    } catch (error) {
      console.error('Export failed:', error);
      play('bonk');
    } finally {
      setIsExporting(false);
    }
  };

  if (!showCertificationModal) return null;

  return (
    <AnimatePresence>
      {showCertificationModal && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            variants={backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeCertificationModal}
          />

          {/* Modal */}
          <motion.div
            className="modal-content"
            variants={slideUpModal}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springs.smooth}
          >
            <div className="p-6">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-earth-400 hover:text-earth-600"
                onClick={closeCertificationModal}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {!showChecklist ? (
                <>
                  {/* Header */}
                  <h2 className="font-display text-2xl font-bold text-earth-800 text-center mb-4">
                    Return to the World of Men
                  </h2>

                  {/* Body */}
                  <div className="font-body text-earth-600 space-y-4 mb-6">
                    <p>
                      Your journey through Middle-earth is complete (or as complete
                      as you could manage).
                    </p>
                    <p>
                      By certifying this passport, you shall receive an official
                      document commemorating your fellowship.
                    </p>
                    <p className="text-sm text-earth-500 italic">
                      You will be transported back to Austin, TX — the realm of mortals.
                    </p>
                  </div>

                  {/* Progress summary */}
                  <div
                    className="bg-parchment-200 rounded-card p-4 mb-6 text-center"
                    style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
                  >
                    <p className="text-3xl font-bold text-shire-600">
                      {claimedCount} / {totalBadges}
                    </p>
                    <p className="text-earth-500 text-sm">
                      badges claimed
                    </p>

                    {/* Completion message */}
                    <p className="text-earth-600 mt-3 text-sm">
                      {claimedCount === totalBadges ? (
                        <span className="text-gold-600 font-semibold">
                          ✨ Perfect completion! You are a true Ringbearer.
                        </span>
                      ) : claimedCount >= 16 ? (
                        'A worthy journey indeed!'
                      ) : claimedCount >= 10 ? (
                        'A respectable showing!'
                      ) : (
                        'Every journey begins with a single step.'
                      )}
                    </p>
                  </div>

                  {/* Actions */}
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
                        Generating...
                      </span>
                    ) : (
                      'Certify & Download'
                    )}
                  </motion.button>

                  <button
                    className="w-full text-center text-shire-600 font-body text-sm py-2 hover:text-shire-700 transition-colors"
                    onClick={() => setShowChecklist(true)}
                  >
                    Review My Badges
                  </button>
                </>
              ) : (
                <BadgeChecklist onBack={() => setShowChecklist(false)} />
              )}
            </div>
          </motion.div>

          {/* Hidden export template */}
          <ExportTemplate />
        </>
      )}
    </AnimatePresence>
  );
}
