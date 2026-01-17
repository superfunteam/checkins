// Spring configs
export const springs = {
  // Snappy for UI interactions
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  // Bouncy for celebrations
  bouncy: { type: 'spring', stiffness: 300, damping: 15 },
  // Smooth for modals
  smooth: { type: 'spring', stiffness: 200, damping: 25 },
  // Gentle for subtle movements
  gentle: { type: 'spring', stiffness: 100, damping: 20 },
};

// Transition presets
export const transitions = {
  fast: { duration: 0.15, ease: 'easeOut' },
  normal: { duration: 0.25, ease: 'easeOut' },
  slow: { duration: 0.4, ease: 'easeInOut' },
};

// Animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideUpModal = {
  initial: { opacity: 0, y: '100%' },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '100%' },
};

export const slideFromLeft = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const stampIn = {
  initial: { opacity: 0, scale: 1.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
};

export const shake = {
  animate: {
    x: [-4, 4, -4, 4, -2, 2, 0],
    transition: { duration: 0.5 },
  },
};

// Stagger children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Badge grid animations
export const badgeGridContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

export const badgeGridItem = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springs.snappy,
  },
};

// Secret badge reveal
export const secretReveal = {
  initial: {
    opacity: 0,
    scale: 0.5,
    rotate: -10,
  },
  animate: {
    opacity: 1,
    scale: [0.5, 1.2, 1],
    rotate: [-10, 5, 0],
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

// Modal backdrop
export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: transitions.fast,
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: transitions.normal,
};

// Pulse animation for buttons
export const pulseButton = {
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Celebrate animation for claimed badges
export const celebrate = {
  animate: {
    scale: [1, 1.1, 0.95, 1.05, 1],
    rotate: [0, -3, 3, -1, 0],
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};
