import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getBadgeStyles } from '../utils/badgeStyles';

// Badge images from all passports + landing page feature badges
const BADGE_IMAGES = [
  // Landing page feature badges
  '/images/landing/badge-custom-badges.webp',
  '/images/landing/badge-progress.webp',
  '/images/landing/badge-share.webp',
  '/images/landing/badge-participation.webp',
  '/images/landing/badge-no-app.webp',
  '/images/landing/badge-customize.webp',
  // Shire passport badges
  '/passports/shire/assets/images/badges/badge-fellowship.webp',
  '/passports/shire/assets/images/badges/badge-two-towers.webp',
  '/passports/shire/assets/images/badges/badge-return-king.webp',
  '/passports/shire/assets/images/badges/badge-breakfast.webp',
  '/passports/shire/assets/images/badges/badge-elevenses.webp',
  '/passports/shire/assets/images/badges/badge-luncheon.webp',
  '/passports/shire/assets/images/badges/badge-afternoon-tea.webp',
  '/passports/shire/assets/images/badges/badge-dinner.webp',
  '/passports/shire/assets/images/badges/badge-supper.webp',
  '/passports/shire/assets/images/badges/badge-you-shall-not-pass.webp',
  '/passports/shire/assets/images/badges/badge-my-precious.webp',
  '/passports/shire/assets/images/badges/badge-beacons-are-lit.webp',
  // Sample passport badges
  '/passports/sample/assets/images/badges/badge-check-in.webp',
  '/passports/sample/assets/images/badges/badge-pizza-time.webp',
  '/passports/sample/assets/images/badges/badge-team-formed.webp',
  '/passports/sample/assets/images/badges/badge-first-commit.webp',
  '/passports/sample/assets/images/badges/badge-caffeine.webp',
  '/passports/sample/assets/images/badges/badge-demo-ready.webp',
];

// Badge shapes for floating badges
const BADGE_SHAPES_LANDING = [
  { name: 'arch', borderRadius: '50% 50% 24% 24%' },
  { name: 'circle', borderRadius: '50%' },
  { name: 'square', borderRadius: '22%' },
];

// Tilt options
const BADGE_TILTS = [-3, 0, 3];

// Single floating badge component
function FloatingBadge({ position, size, delay, duration, isDesktop = false }) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * BADGE_IMAGES.length));
  const [shapeIndex, setShapeIndex] = useState(() => Math.floor(Math.random() * BADGE_SHAPES_LANDING.length));
  const [tiltIndex, setTiltIndex] = useState(() => Math.floor(Math.random() * BADGE_TILTS.length));
  const [isVisible, setIsVisible] = useState(true);

  // Change badge every 6-10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1 + Math.floor(Math.random() * 3)) % BADGE_IMAGES.length);
        setShapeIndex(prev => (prev + 1) % BADGE_SHAPES_LANDING.length);
        setTiltIndex(prev => (prev + 1) % BADGE_TILTS.length);
        setIsVisible(true);
      }, 300);
    }, 6000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  const shape = BADGE_SHAPES_LANDING[shapeIndex];
  const badgeStyles = getBadgeStyles(size, shape.name);
  const tilt = BADGE_TILTS[tiltIndex];

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={position}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              key={`${currentIndex}-${shapeIndex}-${tiltIndex}`}
              initial={{ opacity: 0, scale: 0.8, rotate: tilt - 5 }}
              animate={{ opacity: 1, scale: 1, rotate: tilt }}
              exit={{ opacity: 0, scale: 0.8, rotate: tilt + 5 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-white"
              style={{
                width: size,
                height: size,
                ...badgeStyles,
              }}
            >
              <img
                src={BADGE_IMAGES[currentIndex]}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Floating badges container for hero
function HeroFloatingBadges() {
  // Desktop positions (11 badges) - evenly around edges, 120px each
  const desktopBadges = useMemo(() => [
    // Top row - hanging under header
    { position: { top: '50px', left: '30%' }, size: 120, delay: 0.8, duration: 3.6 },
    { position: { top: '50px', left: '65%' }, size: 120, delay: 0.9, duration: 4.1 },
    // Bottom center - hanging off bottom edge
    { position: { bottom: '-50px', left: 'calc(50% - 60px)' }, size: 120, delay: 1.0, duration: 3.7 },
    // Left side (top to bottom)
    { position: { top: '10%', left: '4%' }, size: 120, delay: 0, duration: 3.5 },
    { position: { top: '45%', left: '2%' }, size: 120, delay: 0.4, duration: 4 },
    { position: { top: '80%', left: '6%' }, size: 120, delay: 0.2, duration: 3.2 },
    // Right side (top to bottom)
    { position: { top: '10%', right: '4%' }, size: 120, delay: 0.3, duration: 3.8 },
    { position: { top: '45%', right: '2%' }, size: 120, delay: 0.6, duration: 4.2 },
    { position: { top: '80%', right: '6%' }, size: 120, delay: 0.1, duration: 3.6 },
    // Bottom corners (inset more)
    { position: { bottom: '5%', left: '28%' }, size: 120, delay: 0.5, duration: 3.4 },
    { position: { bottom: '5%', right: '28%' }, size: 120, delay: 0.7, duration: 3.9 },
  ], []);

  // Mobile positions (8 badges) - asymmetric layout hanging off edges
  const mobileBadges = useMemo(() => [
    // Top center - under nav
    { position: { top: '50px', left: 'calc(50% - 37.5px)' }, size: 75, delay: 0.6, duration: 3.7 },
    // Bottom center - hanging off bottom edge
    { position: { bottom: '-35px', left: 'calc(50% - 37.5px)' }, size: 75, delay: 0.7, duration: 4.2 },
    // Left side (top to bottom)
    { position: { top: '5%', left: '-15px' }, size: 75, delay: 0, duration: 3.5 },
    { position: { top: '35%', left: '-20px' }, size: 75, delay: 0.4, duration: 3.8 },
    { position: { bottom: '8%', left: '-10px' }, size: 75, delay: 0.2, duration: 4.1 },
    // Right side (top to bottom)
    { position: { top: '12%', right: '-18px' }, size: 75, delay: 0.3, duration: 4 },
    { position: { top: '48%', right: '-15px' }, size: 75, delay: 0.5, duration: 3.6 },
    { position: { bottom: '15%', right: '-20px' }, size: 75, delay: 0.1, duration: 3.9 },
  ], []);

  return (
    <>
      {/* Desktop badges */}
      <div className="hidden md:block absolute inset-0 overflow-hidden">
        {desktopBadges.map((badge, i) => (
          <FloatingBadge key={`desktop-${i}`} {...badge} isDesktop />
        ))}
      </div>
      {/* Mobile badges */}
      <div className="md:hidden absolute inset-0 overflow-hidden">
        {mobileBadges.map((badge, i) => (
          <FloatingBadge key={`mobile-${i}`} {...badge} />
        ))}
      </div>
    </>
  );
}

// Feature data with badge images
const features = [
  {
    badgeImage: '/images/landing/badge-custom-badges.webp',
    title: 'Custom Badges',
    description: 'Design badges with images or emoji that match your event theme'
  },
  {
    badgeImage: '/images/landing/badge-progress.webp',
    title: 'Progress Tracking',
    description: 'Real-time journey progress so attendees see how far they\'ve come'
  },
  {
    badgeImage: '/images/landing/badge-share.webp',
    title: 'Sharable Certificates',
    description: 'Downloadable completion certificates to celebrate achievements'
  },
  {
    badgeImage: '/images/landing/badge-participation.webp',
    title: 'Secret Achievements',
    description: 'Hidden badges for extra engagement and surprise moments'
  },
  {
    badgeImage: '/images/landing/badge-no-app.webp',
    title: 'Mobile first, no apps',
    description: 'Works on any device, no app download needed'
  },
  {
    badgeImage: '/images/landing/badge-customize.webp',
    title: 'Fully Customizable',
    description: 'Custom colors, fonts, and themes to match your brand'
  }
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const swingIn = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: 45,
    rotateY: -15,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const featureStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Passport showcase data
const PASSPORT_SHOWCASES = [
  {
    id: 'shire',
    title: 'The Shire Passport',
    badgeCount: 12,
    heroImage: '/passports/shire/assets/images/badges/badge-fellowship.webp',
    path: '/event/shire',
  },
  {
    id: 'sample',
    title: 'Sample Check-ins',
    badgeCount: 6,
    heroEmoji: '🚀',
    path: '/event/sample',
  },
];

// Preview screen component - shows image or fallback placeholder
function PreviewScreen({ passportId, number }) {
  const [hasError, setHasError] = useState(false);
  const imageSrc = `/passports/${passportId}/previews/${number}.webp`;

  if (hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <span className="text-6xl font-bold text-slate-300">{number}</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={`Preview ${number}`}
      className="w-full h-full object-cover object-top"
      onError={() => setHasError(true)}
    />
  );
}

// Phone preview with looping screens
function PhonePreview({ passportId }) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const screens = [1, 2, 3, 4];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % screens.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-t-[24px] px-2 pt-2 shadow-xl w-full max-w-[185px] mx-auto">
      {/* Notch */}
      <div className="bg-slate-900 h-5 w-16 mx-auto rounded-full mb-1.5" />
      {/* Screen */}
      <div className="bg-white rounded-t-[18px] overflow-hidden relative" style={{ aspectRatio: '9/17' }}>
        {/* Both screens rendered, positioned absolutely */}
        {screens.map((num, index) => {
          const isActive = index === currentScreen;
          const isPrev = index === (currentScreen - 1 + screens.length) % screens.length;

          // Active slides in from right, previous stays still (covered), others wait offscreen
          return (
            <motion.div
              key={num}
              className="absolute inset-0"
              initial={false}
              animate={{
                x: isActive ? '0%' : isPrev ? '0%' : '100%',
                zIndex: isActive ? 2 : isPrev ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <PreviewScreen passportId={passportId} number={num} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Passport card component
function PassportShowcaseCard({ passport }) {
  return (
    <Link
      to={passport.path}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col overflow-hidden"
    >
      <div className="flex flex-col items-center text-center p-6 pb-4">
        {/* Hero badge */}
        <div
          className="w-20 h-20 overflow-hidden flex items-center justify-center bg-slate-50 mb-3"
          style={getBadgeStyles(80, 'arch')}
        >
          {passport.heroEmoji ? (
            <span className="text-4xl">{passport.heroEmoji}</span>
          ) : (
            <img
              src={passport.heroImage}
              alt={passport.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        {/* Title and count */}
        <h3 className="font-semibold text-slate-800 text-lg leading-tight mb-1 landing-heading">
          {passport.title}
        </h3>
        <p className="text-sm text-slate-500">
          {passport.badgeCount} check-ins
        </p>
      </div>
      {/* Phone preview - cropped at bottom */}
      <div className="flex-1 flex items-start justify-center pt-2">
        <PhonePreview passportId={passport.id} />
      </div>
    </Link>
  );
}

// CTA card styled like passport showcases
function CTACard() {
  return (
    <Link
      to="/events"
      className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col overflow-hidden"
    >
      <div className="flex flex-col items-center text-center p-6 pb-4">
        {/* Logo badge */}
        <div
          className="w-20 h-20 overflow-hidden flex items-center justify-center bg-slate-50 mb-3"
          style={getBadgeStyles(80, 'arch')}
        >
          <svg width="80" height="80" viewBox="0 0 727 727" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="727" height="727" fill="white"/>
            <rect width="727" height="727" fill="#FFD700" fillOpacity="0.3"/>
            <path d="M84 476.5C91.6 420.5 172.167 350.167 211.5 322L252.5 209L544.5 233L592.5 370.5L544.5 423.5L568.5 597L633.5 806.5L50 794.5C46 772.833 36.1 714.1 28.5 652.5C22.7095 605.567 57.5734 547.139 88.7303 507.382C83.4926 508.044 80.7783 500.239 84 476.5Z" fill="white"/>
            <path d="M418 100C509.127 100 583 173.873 583 265V340H580.462C568.698 283.021 490.82 239 396.5 239C308.408 239 234.657 277.399 215.718 328.892C144.71 303.044 94 234.945 94 155V100H418Z" fill="#FF0000"/>
            <circle cx="438" cy="354" r="40" fill="black"/>
            <rect x="446" y="503.919" width="270" height="60" transform="rotate(-45 446 503.919)" fill="#FFD700"/>
            <rect x="389.426" y="415" width="162.918" height="60" transform="rotate(45 389.426 415)" fill="#FFD700"/>
            <path d="M669.364 627.829C652.801 600.18 619.646 557.907 553.187 501.489C553.14 501.438 553.096 501.398 553.026 501.351C552.979 501.421 552.977 501.47 552.953 501.535C511.211 581.145 496.644 633.567 492.125 665.12C492.13 665.144 492.109 665.16 492.113 665.183C492.104 665.197 492.094 665.211 492.096 665.223C492.078 665.251 492.08 665.262 492.08 665.262C490.19 678.579 490.076 688.167 490.461 694.518C490.482 694.623 490.479 694.733 490.487 694.84C490.813 698.014 491.26 701.189 491.88 704.378C500.08 746.564 534.051 777.306 574.247 783.385C585.039 785.034 596.261 784.89 607.597 782.722L607.831 782.677C619.103 780.486 629.554 776.442 638.932 770.933C674.116 750.297 694.257 708.941 686.034 666.639C683.27 652.421 677.548 639.275 669.356 627.845L669.364 627.829Z" fill="#FF0000"/>
            <path d="M326.1 587.875C326.1 592.145 323.869 608.551 319.32 619.205C314.136 631.346 282.293 653.402 263.889 665.435C255.926 670.641 285.448 667.735 295.766 666.618C300.909 666.061 307.045 665.731 311.498 666.878C310.711 670.322 280.822 696.938 237.198 734.691C221.68 748.194 219.602 750.213 217.461 752.294" stroke="black" strokeOpacity="0.05" strokeWidth="20" strokeLinecap="round"/>
            <path d="M175.483 582.425C175.085 582.425 172.069 582.425 166.953 584.247C147.698 591.105 146.777 625.28 141.836 635.082C134.323 649.985 119.099 666.171 114.8 680.555C105.841 707.736 91.2261 749.683 90.2988 756.962C89.9835 760.882 89.9835 765.263 89.9835 769.776" stroke="black" strokeOpacity="0.05" strokeWidth="20" strokeLinecap="round"/>
          </svg>
        </div>
        {/* Title and subtitle */}
        <h3 className="font-semibold text-slate-800 text-lg leading-tight mb-1 landing-heading">
          Get Started
        </h3>
        <p className="text-sm text-slate-500">
          Create your own passport
        </p>
      </div>
      {/* Placeholder phone area to match height */}
      <div className="flex-1 flex items-start justify-center pt-2">
        <div className="bg-slate-200 rounded-t-[24px] px-2 pt-2 w-full max-w-[185px] mx-auto">
          <div className="bg-slate-200 h-5 w-16 mx-auto rounded-full mb-1.5" />
          <div className="bg-slate-100 rounded-t-[18px] flex items-center justify-center" style={{ aspectRatio: '9/17' }}>
            <div className="text-center text-slate-400 p-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-medium">Your event here</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  // Update document meta for landing page
  useEffect(() => {
    document.title = 'Checkins - Badges and Check-ins for Events';

    const setMeta = (selector, content) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };

    const description = 'The easiest badges and check-ins for hosts and event managers. Create engaging passport experiences for your events.';
    setMeta('meta[name="description"]', description);
    setMeta('meta[name="title"]', 'Checkins - Badges and Check-ins for Events');
    setMeta('meta[property="og:title"]', 'Checkins - Badges and Check-ins for Events');
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', 'Checkins - Badges and Check-ins for Events');
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="theme-color"]', '#0f172a');
  }, []);

  const scrollToShowcases = () => {
    document.getElementById('showcases')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-lg">
        <div className="landing-container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 text-2xl font-bold text-slate-800 landing-heading">
            <svg width="48" height="48" viewBox="0 0 727 727" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 border-[1.5px] border-amber-500 rounded-xl">
              <rect width="727" height="727" fill="white"/>
              <rect width="727" height="727" fill="#FFD700" fillOpacity="0.3"/>
              <path d="M84 476.5C91.6 420.5 172.167 350.167 211.5 322L252.5 209L544.5 233L592.5 370.5L544.5 423.5L568.5 597L633.5 806.5L50 794.5C46 772.833 36.1 714.1 28.5 652.5C22.7095 605.567 57.5734 547.139 88.7303 507.382C83.4926 508.044 80.7783 500.239 84 476.5Z" fill="white"/>
              <path d="M418 100C509.127 100 583 173.873 583 265V340H580.462C568.698 283.021 490.82 239 396.5 239C308.408 239 234.657 277.399 215.718 328.892C144.71 303.044 94 234.945 94 155V100H418Z" fill="#FF0000"/>
              <circle cx="438" cy="354" r="40" fill="black"/>
              <rect x="446" y="503.919" width="270" height="60" transform="rotate(-45 446 503.919)" fill="#FFD700"/>
              <rect x="389.426" y="415" width="162.918" height="60" transform="rotate(45 389.426 415)" fill="#FFD700"/>
              <path d="M669.364 627.829C652.801 600.18 619.646 557.907 553.187 501.489C553.14 501.438 553.096 501.398 553.026 501.351C552.979 501.421 552.977 501.47 552.953 501.535C511.211 581.145 496.644 633.567 492.125 665.12C492.13 665.144 492.109 665.16 492.113 665.183C492.104 665.197 492.094 665.211 492.096 665.223C492.078 665.251 492.08 665.262 492.08 665.262C490.19 678.579 490.076 688.167 490.461 694.518C490.482 694.623 490.479 694.733 490.487 694.84C490.813 698.014 491.26 701.189 491.88 704.378C500.08 746.564 534.051 777.306 574.247 783.385C585.039 785.034 596.261 784.89 607.597 782.722L607.831 782.677C619.103 780.486 629.554 776.442 638.932 770.933C674.116 750.297 694.257 708.941 686.034 666.639C683.27 652.421 677.548 639.275 669.356 627.845L669.364 627.829Z" fill="#FF0000"/>
              <path d="M326.1 587.875C326.1 592.145 323.869 608.551 319.32 619.205C314.136 631.346 282.293 653.402 263.889 665.435C255.926 670.641 285.448 667.735 295.766 666.618C300.909 666.061 307.045 665.731 311.498 666.878C310.711 670.322 280.822 696.938 237.198 734.691C221.68 748.194 219.602 750.213 217.461 752.294" stroke="black" strokeOpacity="0.05" strokeWidth="20" strokeLinecap="round"/>
              <path d="M175.483 582.425C175.085 582.425 172.069 582.425 166.953 584.247C147.698 591.105 146.777 625.28 141.836 635.082C134.323 649.985 119.099 666.171 114.8 680.555C105.841 707.736 91.2261 749.683 90.2988 756.962C89.9835 760.882 89.9835 765.263 89.9835 769.776" stroke="black" strokeOpacity="0.05" strokeWidth="20" strokeLinecap="round"/>
            </svg>
            Checkins
          </Link>
          <Link
            to="/event-inquiry"
            className="landing-btn-primary text-sm"
          >
            Host Event
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-10 md:px-6 relative min-h-[80vh] flex items-center">
        <HeroFloatingBadges />
        <motion.div
          className="landing-container mx-auto text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight landing-heading bg-white/70 md:bg-transparent rounded-lg px-2 py-1 inline-block"
            variants={fadeInUp}
          >
            The easiest badges and check-ins<br className="hidden md:block" />{' '}
            for hosts and event managers.
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto bg-white/70 md:bg-transparent rounded-md px-2 py-1"
            variants={fadeInUp}
          >
            Create engaging passport experiences that turn attendees into explorers.
            Track progress, unlock achievements, create excitement at your next party or work event.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
          >
            <Link to="/event-inquiry" className="landing-btn-primary">
              Host Event
            </Link>
            <button
              onClick={scrollToShowcases}
              className="landing-btn-secondary"
            >
              See Examples
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="landing-container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 landing-heading">
              Everything you need for event engagement
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features that make it easy to create memorable experiences
            </p>
          </motion.div>

          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            style={{ perspective: 1000 }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '0px 0px -100px 0px' }}
                variants={swingIn}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="w-20 h-20 mb-4 overflow-hidden"
                  style={getBadgeStyles(80, 'arch')}
                >
                  <img
                    src={feature.badgeImage}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2 landing-heading">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcases */}
      <section id="showcases" className="py-20 px-6">
        <div className="landing-container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 landing-heading">
              See it in action
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Check out these example passports to see what you can create
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {PASSPORT_SHOWCASES.map((passport) => (
              <motion.div key={passport.id} variants={fadeInUp}>
                <PassportShowcaseCard passport={passport} />
              </motion.div>
            ))}
            <motion.div variants={fadeInUp}>
              <CTACard />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-slate-50">
        <div className="landing-container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 landing-heading">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start free or get help from our team for a polished experience
            </p>
          </motion.div>

          <div
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            style={{ perspective: 1000 }}
          >
            {/* Free Tier */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
              variants={swingIn}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-2 landing-heading">Free (DIY)</h3>
                <div className="text-4xl font-bold text-slate-900">$0</div>
                <p className="text-slate-500 mt-2">Forever free</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Unlimited events
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Basic badge templates
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Standard color themes
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Self-serve setup
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Community support
                </li>
              </ul>
              <Link
                to="/event-inquiry"
                className="block w-full text-center landing-btn-secondary"
              >
                Host Event
              </Link>
            </motion.div>

            {/* Pro Tier */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
              variants={swingIn}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                Budget
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-2 landing-heading">Pro</h3>
                <div className="text-4xl font-bold text-slate-900">$399</div>
                <p className="text-slate-500 mt-2">24hr turnaround</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Everything in Free
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Bring your own art
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Bring your own copy
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  We build it for you
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Priority support
                </li>
              </ul>
              <Link to="/event-inquiry" className="block w-full text-center bg-white text-slate-800 font-semibold px-6 py-3 rounded-xl border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors">
                Contact Us
              </Link>
            </motion.div>

            {/* VIP Tier */}
            <motion.div
              className="bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-800 relative overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
              variants={swingIn}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full">
                We do it all!
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2 landing-heading">VIP</h3>
                <div className="text-4xl font-bold text-white">$1,499</div>
                <p className="text-slate-400 mt-2">72hr turnaround</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Everything in Pro
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Full custom art design
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Custom audio design
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Premium themes
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Dedicated support
                </li>
              </ul>
              <Link to="/event-inquiry" className="block w-full text-center bg-white text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors">
                Contact Us
              </Link>
            </motion.div>
          </div>

          {/* Non-profit CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-slate-800 mb-2 landing-heading">
              Non-profits welcome!
            </h3>
            <p className="text-slate-600 max-w-xl mx-auto">
              We love working with local non-profits. If you're hosting an event in the next few months, send an email to{' '}
              <a href="mailto:clark@superfun.team" className="text-red-600 hover:text-red-700 underline">
                clark@superfun.team
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="landing-container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 landing-heading">
              Ready to create your event passport?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Start building engaging check-in experiences today.
            </p>
            <Link to="/events" className="landing-btn-primary">
              Host Event
            </Link>
          </motion.div>
          <div className="mt-16 pt-8 border-t border-slate-100 text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Checkins. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
