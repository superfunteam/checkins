import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { badgeGridItem, springs } from '../utils/animations';

// Shape classes for shuffle mode
const SHUFFLE_SHAPES = ['arch', 'circle', 'square'];
const SHUFFLE_TILTS = ['badge-tilt-left', 'badge-tilt-right', 'badge-tilt-none'];

export default function BadgeCard({ badge, index }) {
  const { badges, openBadgeModal, isSecretUnlocked } = useApp();
  const { getAssetUrl, badgeShape } = usePassport();
  const badgeImageRef = useRef(null);

  const isClaimed = badges[badge.id]?.claimed;
  const isSecret = badge.type === 'secret';
  const isUnlocked = isSecret ? isSecretUnlocked(badge.id) : true;

  // Secret badges that aren't unlocked yet show as mystery
  const showAsMystery = isSecret && !isUnlocked && !isClaimed;

  // Determine shape class and tilt for this badge
  const { shapeClass, tiltClass } = useMemo(() => {
    if (badgeShape === 'shuffle') {
      // Use badge index to deterministically assign shape and tilt
      const shape = SHUFFLE_SHAPES[index % SHUFFLE_SHAPES.length];
      const tilt = SHUFFLE_TILTS[(index + Math.floor(index / 3)) % SHUFFLE_TILTS.length];
      return { shapeClass: `badge-shape-${shape}`, tiltClass: tilt };
    }
    return { shapeClass: `badge-shape-${badgeShape}`, tiltClass: '' };
  }, [badgeShape, index]);

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
      className={`badge-card relative flex flex-col items-center gap-2 p-1 ${shapeClass}`}
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
          ${tiltClass}
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
              src={getAssetUrl(badge.id === 'secret-ringbearer' ? 'assets/images/lock-ring.png' : 'assets/images/lock.png')}
              alt="Locked"
              className="w-full h-full object-cover"
            />
          ) : badge.emoji ? (
            // Emoji badge
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">{badge.emoji}</span>
            </div>
          ) : (
            <img
              src={getAssetUrl(badge.image)}
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
