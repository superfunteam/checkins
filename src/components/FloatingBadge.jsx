import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

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
  const [isVisible, setIsVisible] = useState(false);

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
      <div className="badge-image-container w-full h-full overflow-hidden">
        <img
          src={badge.image}
          alt={badge.name}
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>,
    document.body
  );
}
