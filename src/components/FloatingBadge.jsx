import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { usePassport } from '../context/PassportContext';
import { BADGE_SHAPES, getBadgeBorderWidth, BADGE_BOX_SHADOW } from '../utils/badgeStyles';

// Shape classes for shuffle mode (must match BadgeCard)
const SHUFFLE_SHAPES = ['arch', 'circle', 'square'];
const SHUFFLE_TILTS = ['badge-tilt-left', 'badge-tilt-right', 'badge-tilt-none'];

/**
 * FloatingBadge - Animates badge image between grid and modal positions
 * Animates position and size directly for pixel-perfect accuracy
 * No exit animation - disappears instantly for flicker-free handoff
 */
export default function FloatingBadge({
  badge,
  originRect,
  targetRect,
  isClosing,
  onAnimationComplete,
}) {
  const { getAssetUrl, badgeShape, primaryBadges } = usePassport();
  const [isVisible, setIsVisible] = useState(false);

  // Calculate shape and tilt based on badge index (matching BadgeCard logic)
  const { borderRadius, tiltDeg } = useMemo(() => {
    if (badgeShape === 'shuffle') {
      // Find badge index in sorted primary badges
      const sortedBadges = [...primaryBadges].sort((a, b) => a.order - b.order);
      const index = sortedBadges.findIndex(b => b.id === badge.id);
      const safeIndex = index >= 0 ? index : 0;

      const shape = SHUFFLE_SHAPES[safeIndex % SHUFFLE_SHAPES.length];
      const tiltClass = SHUFFLE_TILTS[(safeIndex + Math.floor(safeIndex / 3)) % SHUFFLE_TILTS.length];
      const tilt = tiltClass === 'badge-tilt-left' ? -3 : tiltClass === 'badge-tilt-right' ? 3 : 0;

      return { borderRadius: BADGE_SHAPES[shape], tiltDeg: tilt };
    }
    return { borderRadius: BADGE_SHAPES[badgeShape] || BADGE_SHAPES.arch, tiltDeg: 0 };
  }, [badgeShape, badge.id, primaryBadges]);

  // Show floating badge when we have valid rects
  useEffect(() => {
    if (originRect && targetRect) {
      setIsVisible(true);
    }
  }, [originRect, targetRect]);

  // Don't render if no rects or not visible
  if (!originRect || !targetRect || !isVisible) return null;

  // Calculate animation values
  const fromRect = isClosing ? targetRect : originRect;
  const toRect = isClosing ? originRect : targetRect;

  // Calculate proportional border width based on target size
  const borderWidth = getBadgeBorderWidth(toRect.width);

  const handleAnimationComplete = () => {
    setIsVisible(false);
    onAnimationComplete?.();
  };

  return createPortal(
    <motion.div
      className="fixed pointer-events-none"
      style={{
        zIndex: 60, // Above modal
      }}
      initial={{
        top: fromRect.top,
        left: fromRect.left,
        width: fromRect.width,
        height: fromRect.height,
      }}
      animate={{
        top: toRect.top,
        left: toRect.left,
        width: toRect.width,
        height: toRect.height,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 1,
      }}
      onAnimationComplete={handleAnimationComplete}
    >
      <div
        className="w-full h-full overflow-hidden"
        style={{
          border: `${borderWidth}px solid white`,
          borderRadius,
          boxShadow: BADGE_BOX_SHADOW,
          transform: tiltDeg !== 0 ? `rotate(${tiltDeg}deg)` : undefined,
        }}
      >
        {badge.emoji ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{badge.emoji}</span>
          </div>
        ) : (
          <img
            src={getAssetUrl(badge.image)}
            alt={badge.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </motion.div>,
    document.body
  );
}
