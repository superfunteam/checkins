import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { BADGE_TYPES } from '../data/badges';
import { badgeGridItem, springs } from '../utils/animations';

export default function BadgeCard({ badge, index }) {
  const { badges, openBadgeModal, isSecretUnlocked } = useApp();
  const badgeImageRef = useRef(null);

  const isClaimed = badges[badge.id]?.claimed;
  const isSecret = badge.type === BADGE_TYPES.SECRET;
  const isUnlocked = isSecret ? isSecretUnlocked(badge.id) : true;

  // Secret badges that aren't unlocked yet show as mystery
  const showAsMystery = isSecret && !isUnlocked && !isClaimed;

  const handleClick = () => {
    if (showAsMystery) return; // Can't open mystery badges
    const rect = badgeImageRef.current?.getBoundingClientRect();
    openBadgeModal(badge, rect ? {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    } : null);
  };

  return (
    <motion.button
      className="badge-card relative flex flex-col items-center gap-2 p-1"
      onClick={handleClick}
      variants={badgeGridItem}
      whileHover={!showAsMystery ? { scale: 1.05 } : {}}
      whileTap={!showAsMystery ? { scale: 0.95 } : {}}
      layout
    >
      {/* Badge image container with Gowalla styling */}
      <div
        className={`
          badge-image-wrapper relative w-full aspect-square
          ${showAsMystery ? 'cursor-default' : 'cursor-pointer'}
        `}
      >
        {/* The badge image with mask and styling */}
        <div
          ref={badgeImageRef}
          className={`
            badge-image-container w-full h-full overflow-hidden
            transition-all duration-300
            ${isClaimed ? 'opacity-100' : 'opacity-40 grayscale'}
          `}
        >
          {showAsMystery ? (
            // Lock placeholder for secret badges
            <img
              src={badge.id === 'secret-ringbearer' ? '/images/badge-lock-ring.png' : '/images/badge-lock.png'}
              alt="Locked"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={badge.image}
              alt={badge.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>

        {/* Claimed indicator - gold star for secrets, purple checkmark for regular */}
        {isClaimed && (
          <motion.div
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10 ${
              isSecret ? 'bg-gold-500' : ''
            }`}
            style={!isSecret ? { backgroundColor: '#7C3AED' } : {}}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springs.bouncy}
          >
            {isSecret ? (
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </motion.div>
        )}
      </div>

      {/* Badge name */}
      <p
        className={`
          text-[11px] font-semibold text-center leading-tight px-1
          ${isClaimed ? 'text-earth-800' : 'text-earth-400'}
        `}
        style={{ fontFamily: "'Google Sans Flex', sans-serif" }}
      >
        {showAsMystery ? '\u00A0' : badge.name}
      </p>
    </motion.button>
  );
}
