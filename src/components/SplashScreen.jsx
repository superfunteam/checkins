import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { fadeIn, springs } from '../utils/animations';
import { preloadBadgeSounds, preloadGreetingSounds, startBackgroundMusic } from '../hooks/useSound';

// Border radius values for each shape
const SHAPE_BORDER_RADIUS = {
  arch: '50% 50% 24% 24%',
  circle: '50%',
  square: '22%',
};

export default function SplashScreen() {
  const { goToScreen, SCREENS } = useApp();
  const { content, meta, features, getAssetUrl, badgeShape } = usePassport();

  const splashContent = content.splash;

  // Calculate border radius based on badge shape setting
  // Use arch as default for shuffle since this is a standalone hero image
  const badgeBorderRadius = useMemo(() => {
    const shape = badgeShape === 'shuffle' ? 'arch' : badgeShape;
    return SHAPE_BORDER_RADIUS[shape] || SHAPE_BORDER_RADIUS.arch;
  }, [badgeShape]);

  // Preload all sounds during splash screen for instant playback later
  useEffect(() => {
    preloadBadgeSounds();
    preloadGreetingSounds();
  }, []);

  // Handle enter button - start background music and navigate
  const handleEnter = () => {
    if (features.backgroundMusic !== false) {
      startBackgroundMusic();
    }
    goToScreen(SCREENS.NAME);
  };

  // Format hosts text
  const hostsText = meta.hosts?.names?.join(' and ') || '';
  const hostedByText = splashContent.hostedBy?.replace('{hosts}', hostsText) || `Hosted by ${hostsText}`;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Ring badge in Gowalla style */}
      {(splashContent.heroImage || splashContent.heroEmoji) && (
        <motion.div
          className="w-48 h-48 mb-8 -mt-16 badge-image-container overflow-hidden flex items-center justify-center"
          style={{ borderRadius: badgeBorderRadius }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...springs.bouncy, delay: 0.2 }}
        >
          {splashContent.heroEmoji ? (
            <span className="text-8xl">{splashContent.heroEmoji}</span>
          ) : (
            <img
              src={getAssetUrl(splashContent.heroImage)}
              alt={splashContent.title}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      )}

      {/* Title */}
      <motion.h1
        className="font-display text-4xl font-bold text-earth-800 mb-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {splashContent.title}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="font-body text-lg text-earth-600 mb-10 italic"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        dangerouslySetInnerHTML={{
          __html: splashContent.subtitle.replace(/\n/g, '<br />')
        }}
      />

      {/* Hosts - fixed bottom right */}
      {meta.hosts?.image && (
        <motion.div
          className="fixed bottom-10 right-6 flex flex-col items-center"
          initial={{ scale: 0, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: 6, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 15,
            delay: 1,
          }}
        >
          <img
            src={getAssetUrl(meta.hosts.image)}
            alt={hostsText}
            className="w-24 drop-shadow-lg"
          />
          <p
            className="text-xs mt-1"
            style={{ fontFamily: "'Google Sans Flex', sans-serif", color: '#7C3AED' }}
          >
            Hosted by{' '}
            {meta.hosts.names.map((name, i) => (
              <span key={name}>
                {i > 0 && <span className="font-bold"> and </span>}
                <span className="font-bold">{name}</span>
              </span>
            ))}
          </p>
        </motion.div>
      )}

      {/* Enter button */}
      <motion.button
        className="btn-primary text-xl px-10 py-5"
        onClick={handleEnter}
        initial={{ y: 20, opacity: 0, scale: 1 }}
        animate={{
          y: 0,
          opacity: 1,
          scale: [1, 1.2, 1],
        }}
        transition={{
          y: { delay: 0.6 },
          opacity: { delay: 0.6 },
          scale: {
            delay: 0.6,
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {splashContent.enterButton}
      </motion.button>
    </motion.div>
  );
}
