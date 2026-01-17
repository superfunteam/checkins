import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { badges as allBadgesData, getPrimaryBadges, BADGE_TYPES } from '../data/badges';
import BadgeCard from './BadgeCard';
import { badgeGridContainer, fadeIn } from '../utils/animations';

export default function Passport() {
  const { name, openCertificationModal, badges, resetAndStartOver, openScheduleSheet } = useApp();

  const primaryBadges = getPrimaryBadges();

  // Count claimed primary badges (for progress bar)
  const claimedPrimaryCount = primaryBadges.filter(b => badges[b.id]?.claimed).length;
  const totalPrimaryBadges = primaryBadges.length;

  // All badges sorted by order (primary + secret mixed together)
  const allBadgesSorted = [...allBadgesData].sort((a, b) => a.order - b.order);

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-parchment-100"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-parchment-100/95 backdrop-blur-sm border-b border-parchment-300 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={openScheduleSheet}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-parchment-200 text-earth-600 hover:bg-parchment-300 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
            <div>
              <h1 className="font-display text-lg font-bold text-earth-800">
                The Shire Passport
              </h1>
              <p className="text-xs text-earth-500" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
                {name}'s Journey
              </p>
            </div>
          </div>
          <div className="text-right" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
            <p className="text-lg font-bold text-shire-600">
              {claimedPrimaryCount}/{totalPrimaryBadges}
            </p>
            <p className="text-xs text-earth-400">badges</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-2 bg-parchment-300 rounded-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{ backgroundColor: '#7C3AED' }}
            initial={{ width: 0 }}
            animate={{ width: `${(claimedPrimaryCount / totalPrimaryBadges) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* All Badges Grid (primary + secret placeholders) */}
        <section className="mb-8">
          <h2 className="font-display text-sm font-semibold text-earth-500 uppercase tracking-wider mb-3">
            Your Journey
          </h2>
          <motion.div
            className="grid grid-cols-3 gap-3"
            variants={badgeGridContainer}
            initial="initial"
            animate="animate"
          >
            {allBadgesSorted.map((badge, index) => (
              <BadgeCard key={badge.id} badge={badge} index={index} />
            ))}
          </motion.div>
        </section>

        {/* Certify Button */}
        <section className="pb-8 mt-8">
          <motion.button
            className="btn-primary w-full text-lg py-5"
            onClick={openCertificationModal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Certify My Passport
          </motion.button>
          <p
            className="text-center text-earth-400 text-sm mt-4"
            style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
          >
            Complete your journey and download your certificate
          </p>
          <button
            className="block mx-auto text-center text-earth-400 text-sm mt-6 underline hover:text-earth-600 transition-colors"
            style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
            onClick={resetAndStartOver}
          >
            Reset and Start Over
          </button>
        </section>
      </main>
    </motion.div>
  );
}
