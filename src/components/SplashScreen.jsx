import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { fadeIn } from '../utils/animations';
import { startBackgroundMusic } from '../hooks/useSound';
import { getBadgeStyles } from '../utils/badgeStyles';

export default function SplashScreen() {
  const { goToScreen, SCREENS } = useApp();
  const { content, meta, features, getAssetUrl, badgeShape } = usePassport();

  const reduceMotion = useReducedMotion();
  const splashContent = content.splash;

  // Calculate badge styles based on shape setting
  // Use arch as default for shuffle since this is a standalone hero image
  // Splash hero badge is w-48 = 192px
  const badgeStylesData = useMemo(() => {
    const shape = badgeShape === 'shuffle' ? 'arch' : badgeShape;
    return getBadgeStyles(192, shape);
  }, [badgeShape]);

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
      initial={reduceMotion ? false : "initial"}
      animate="animate"
      exit="exit"
    >
      {/* Ring badge in Gowalla style */}
      {(splashContent.heroImage || splashContent.heroEmoji) && (
        <motion.div
          className="w-48 h-48 mb-8 -mt-16 overflow-hidden flex items-center justify-center"
          style={badgeStylesData}
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
      >
        {splashContent.title}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="font-body text-lg text-earth-600 mb-10 italic"
        dangerouslySetInnerHTML={{
          __html: splashContent.subtitle.replace(/\n/g, '<br />')
        }}
      />

      {/* Hosts - fixed bottom right */}
      {meta.hosts?.image && (
        <motion.div
          className="fixed bottom-10 right-6 flex flex-col items-center"

        >
          <img
            src={getAssetUrl(meta.hosts.image)}
            alt={hostsText}
            className="w-24 drop-shadow-lg"
          />
          <p
            className="text-xs mt-1"
            style={{ fontFamily: "'Google Sans Flex', sans-serif", color: 'var(--color-highlight)' }}
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {splashContent.enterButton}
      </motion.button>
    </motion.div>
  );
}
