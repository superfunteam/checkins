import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Badge images from all passports
const BADGE_IMAGES = [
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
  '/passports/sample/assets/images/badges/badge-check-in.webp',
  '/passports/sample/assets/images/badges/badge-pizza-time.webp',
  '/passports/sample/assets/images/badges/badge-team-formed.webp',
  '/passports/sample/assets/images/badges/badge-first-commit.webp',
  '/passports/sample/assets/images/badges/badge-caffeine.webp',
  '/passports/sample/assets/images/badges/badge-demo-ready.webp',
];

// Badge shapes with border radius
const BADGE_SHAPES = [
  { name: 'arch', borderRadius: '50% 50% 24% 24%' },
  { name: 'circle', borderRadius: '50%' },
  { name: 'square', borderRadius: '22%' },
];

// Tilt options
const BADGE_TILTS = [-3, 0, 3];

// Single floating badge component
function FloatingBadge({ position, size, delay, duration }) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * BADGE_IMAGES.length));
  const [shapeIndex, setShapeIndex] = useState(() => Math.floor(Math.random() * BADGE_SHAPES.length));
  const [tiltIndex, setTiltIndex] = useState(() => Math.floor(Math.random() * BADGE_TILTS.length));
  const [isVisible, setIsVisible] = useState(true);

  // Change badge every 6-10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1 + Math.floor(Math.random() * 3)) % BADGE_IMAGES.length);
        setShapeIndex(prev => (prev + 1) % BADGE_SHAPES.length);
        setTiltIndex(prev => (prev + 1) % BADGE_TILTS.length);
        setIsVisible(true);
      }, 300);
    }, 6000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  const shape = BADGE_SHAPES[shapeIndex];
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
                borderRadius: shape.borderRadius,
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
  // Desktop positions (8 badges) - evenly around edges, 120px each
  const desktopBadges = useMemo(() => [
    // Left side (top to bottom)
    { position: { top: '10%', left: '4%' }, size: 120, delay: 0, duration: 3.5 },
    { position: { top: '45%', left: '2%' }, size: 120, delay: 0.4, duration: 4 },
    { position: { top: '80%', left: '6%' }, size: 120, delay: 0.2, duration: 3.2 },
    // Right side (top to bottom)
    { position: { top: '10%', right: '4%' }, size: 120, delay: 0.3, duration: 3.8 },
    { position: { top: '45%', right: '2%' }, size: 120, delay: 0.6, duration: 4.2 },
    { position: { top: '80%', right: '6%' }, size: 120, delay: 0.1, duration: 3.6 },
    // Bottom corners (inset more)
    { position: { bottom: '5%', left: '18%' }, size: 120, delay: 0.5, duration: 3.4 },
    { position: { bottom: '5%', right: '18%' }, size: 120, delay: 0.7, duration: 3.9 },
  ], []);

  // Mobile positions (4 badges near corners) - 75px each
  const mobileBadges = useMemo(() => [
    { position: { top: '3%', left: '1%' }, size: 75, delay: 0, duration: 3.5 },
    { position: { top: '3%', right: '1%' }, size: 75, delay: 0.3, duration: 4 },
    { position: { bottom: '3%', left: '1%' }, size: 75, delay: 0.5, duration: 3.8 },
    { position: { bottom: '3%', right: '1%' }, size: 75, delay: 0.2, duration: 3.6 },
  ], []);

  return (
    <>
      {/* Desktop badges */}
      <div className="hidden md:block absolute inset-0 overflow-hidden">
        {desktopBadges.map((badge, i) => (
          <FloatingBadge key={`desktop-${i}`} {...badge} />
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

// Feature icons as SVG components
const FeatureIcons = {
  badges: (
    <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40" fill="currentColor">
      <path d="M240-40v-329L110-580l185-300h370l185 300-130 211v329l-240-80-240 80Zm80-111 160-53 160 53v-129H320v129Zm20-649L204-580l136 220h280l136-220-136-220H340Zm98 383L296-558l57-57 85 85 169-170 57 56-226 227ZM320-280h320-320Z"/>
    </svg>
  ),
  progress: (
    <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40" fill="currentColor">
      <path d="M80-120v-80h800v80H80Zm40-120v-280h120v280H120Zm200 0v-480h120v480H320Zm200 0v-360h120v360H520Zm200 0v-600h120v600H720Z"/>
    </svg>
  ),
  certificates: (
    <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40" fill="currentColor">
      <path d="M160-440v80h640v-80H160Zm0-440h640q33 0 56.5 23.5T880-800v440q0 33-23.5 56.5T800-280H640v200l-160-80-160 80v-200H160q-33 0-56.5-23.5T80-360v-440q0-33 23.5-56.5T160-880Zm0 320h640v-240H160v240Zm0 200v-440 440Z"/>
    </svg>
  ),
  secrets: (
    <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40" fill="currentColor">
      <path d="M80-200v-80h800v80H80Zm46-242-52-30 34-60H40v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Z"/>
    </svg>
  ),
  mobile: (
    <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40" fill="currentColor">
      <path d="M280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h400q33 0 56.5 23.5T760-840v124q18 7 29 22t11 34v80q0 19-11 34t-29 22v404q0 33-23.5 56.5T680-40H280Zm0-80h400v-720H280v720Zm0 0v-720 720Zm200-600q17 0 28.5-11.5T520-760q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760q0 17 11.5 28.5T480-720Z"/>
    </svg>
  ),
  customize: (
    <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40" fill="currentColor">
      <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 32.5-156t88-127Q256-817 330-848.5T488-880q80 0 151 27.5t124.5 76q53.5 48.5 85 115T880-518q0 115-70 176.5T640-280h-74q-9 0-12.5 5t-3.5 11q0 12 15 34.5t15 51.5q0 50-27.5 74T480-80Zm0-400Zm-220 40q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm120-160q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm200 0q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm120 160q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17ZM480-160q9 0 14.5-5t5.5-13q0-14-15-33t-15-57q0-42 29-67t71-25h70q66 0 113-38.5T800-518q0-121-92.5-201.5T488-800q-136 0-232 93t-96 227q0 133 93.5 226.5T480-160Z"/>
    </svg>
  )
};

// Feature data
const features = [
  {
    icon: 'badges',
    title: 'Custom Badges',
    description: 'Design badges with images or emoji that match your event theme'
  },
  {
    icon: 'progress',
    title: 'Progress Tracking',
    description: 'Real-time journey progress so attendees see how far they\'ve come'
  },
  {
    icon: 'certificates',
    title: 'Sharable Certificates',
    description: 'Downloadable completion certificates to celebrate achievements'
  },
  {
    icon: 'secrets',
    title: 'Secret Achievements',
    description: 'Hidden badges for extra engagement and surprise moments'
  },
  {
    icon: 'mobile',
    title: 'Mobile first, no apps',
    description: 'Works on any device, no app download needed'
  },
  {
    icon: 'customize',
    title: 'Fully Customizable',
    description: 'Custom colors, fonts, and themes to match your brand'
  }
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="landing-container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <svg width="48" height="48" viewBox="0 0 727 727" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 border border-amber-500 rounded-xl">
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
            to="/events"
            className="landing-btn-primary text-sm"
          >
            Get Started
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
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
            variants={fadeInUp}
          >
            The easiest badges and check-ins<br className="hidden md:block" />
            for hosts and event managers.
          </motion.h1>
          <motion.p
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Create engaging passport experiences that turn attendees into explorers.
            Track progress, unlock achievements, and celebrate completions.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
          >
            <Link to="/events" className="landing-btn-primary">
              Try Free
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need for event engagement
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features that make it easy to create memorable experiences
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                variants={fadeInUp}
              >
                <div className="text-slate-700 mb-4">{FeatureIcons[feature.icon]}</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Showcases */}
      <section id="showcases" className="py-20 px-6">
        <div className="landing-container mx-auto">
          {/* Shire Passport Showcase */}
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center mb-24"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide">
                Featured Example
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">
                The Shire Passport
              </h3>
              <p className="text-lg text-slate-600 mb-6">
                A Lord of the Rings-themed passport experience that takes attendees on a
                journey through Middle-earth. Perfect for themed events and immersive experiences.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Custom hand-drawn badge artwork
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Themed color palette and typography
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Secret achievements for dedicated explorers
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-emerald-500">✓</span>
                  Completion certificate with custom design
                </li>
              </ul>
              <Link to="/event/shire" className="landing-btn-primary">
                Try the Demo
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[9/16] bg-slate-100 rounded-2xl overflow-hidden">
                <img
                  src="/images/landing/shire-1.png"
                  alt="Shire Passport screenshot"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="aspect-[9/16] bg-slate-100 rounded-2xl overflow-hidden mt-8">
                <img
                  src="/images/landing/shire-2.png"
                  alt="Shire Passport screenshot"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="aspect-[9/16] bg-slate-100 rounded-2xl overflow-hidden">
                <img
                  src="/images/landing/shire-3.png"
                  alt="Shire Passport screenshot"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="aspect-[9/16] bg-slate-100 rounded-2xl overflow-hidden mt-8">
                <img
                  src="/images/landing/shire-4.png"
                  alt="Shire Passport screenshot"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          </motion.div>

          {/* Sample Check-ins Showcase (reversed layout) */}
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-2 gap-4 order-2 md:order-1">
              <div className="aspect-[9/16] bg-slate-100 rounded-2xl overflow-hidden">
                <img
                  src="/images/landing/sample-1.png"
                  alt="Sample Check-ins screenshot"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="aspect-[9/16] bg-slate-100 rounded-2xl overflow-hidden mt-8">
                <img
                  src="/images/landing/sample-2.png"
                  alt="Sample Check-ins screenshot"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="aspect-[9/16] bg-slate-100 rounded-2xl overflow-hidden">
                <img
                  src="/images/landing/sample-3.png"
                  alt="Sample Check-ins screenshot"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="aspect-[9/16] bg-slate-100 rounded-2xl overflow-hidden mt-8">
                <img
                  src="/images/landing/sample-4.png"
                  alt="Sample Check-ins screenshot"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Starter Template
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">
                Sample Check-ins
              </h3>
              <p className="text-lg text-slate-600 mb-6">
                A modern hackathon survival guide template perfect for tech events,
                conferences, and workshops. Clean design with engaging content.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-blue-500">✓</span>
                  Emoji-based badges for quick setup
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-blue-500">✓</span>
                  Professional blue theme
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-blue-500">✓</span>
                  Easy to customize and rebrand
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <span className="text-blue-500">✓</span>
                  Perfect starting point for your event
                </li>
              </ul>
              <Link to="/event/sample" className="landing-btn-primary bg-blue-600 hover:bg-blue-700">
                Try the Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="landing-container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start free or get help from our team for a polished experience
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Free Tier */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
              variants={fadeInUp}
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Free (DIY)</h3>
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
                to="/events"
                className="block w-full text-center landing-btn-secondary"
              >
                Get Started Free
              </Link>
            </motion.div>

            {/* Concierge Tier */}
            <motion.div
              className="bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-800 relative overflow-hidden"
              variants={fadeInUp}
            >
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Popular
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Concierge</h3>
                <div className="text-4xl font-bold text-white">$899</div>
                <p className="text-slate-400 mt-2">One-time setup</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Everything in Free
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Custom badge design
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Premium color themes
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Dedicated setup support
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Custom branding
                </li>
              </ul>
              <button className="block w-full text-center bg-white text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors">
                Contact Us
              </button>
            </motion.div>
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
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Ready to create your event passport?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Start building engaging check-in experiences today.
            </p>
            <Link to="/events" className="landing-btn-primary">
              Get Started Free
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
