import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';
import { slideFromLeft, backdrop, springs } from '../utils/animations';

// Parse time string like "9am ish" or "10:43am ish" into minutes from midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):?(\d*)\s*(am|pm)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3].toLowerCase();

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Parse schedule time like "09:00" into minutes from midnight
function parseScheduleTime(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

// Icon components for badge types
function MovieIcon({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill={color}>
      <path d="m380-340 280-180-280-180v360Zm-60 220v-80H160q-33 0-56.5-23.5T80-280v-480q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v480q0 33-23.5 56.5T800-200H640v80H320ZM160-280h640v-480H160v480Zm0 0v-480 480Z"/>
    </svg>
  );
}

function MealIcon({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill={color}>
      <path d="M240-80v-366q-54-14-87-57t-33-97v-280h80v240h40v-240h80v240h40v-240h80v280q0 54-33 97t-87 57v366h-80Zm400 0v-381q-54-18-87-75.5T520-667q0-89 47-151t113-62q66 0 113 62.5T840-666q0 73-33 130t-87 75v381h-80Z"/>
    </svg>
  );
}

function SceneIcon({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill={color}>
      <path d="M120-200q-33 0-56.5-23.5T40-280v-400q0-33 23.5-56.5T120-760h400q33 0 56.5 23.5T600-680v400q0 33-23.5 56.5T520-200H120Zm0-146q44-26 94-40t106-14q56 0 106 14t94 40v-334H120v334Zm200 26q-41 0-80 10t-74 30h308q-35-20-74-30t-80-10Zm0-110q-45 0-77.5-32.5T210-540q0-45 32.5-77.5T320-650q45 0 77.5 32.5T430-540q0 45-32.5 77.5T320-430Zm0-74q15 0 25.5-10.5T356-540q0-15-10.5-25.5T320-576q-15 0-25.5 10.5T284-540q0 15 10.5 25.5T320-504Zm360 304v-560h80v560h-80Zm160 0v-560h80v560h-80ZM320-540Zm0 260Z"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

// Get icon component for badge type
function BadgeTypeIcon({ type, color }) {
  switch (type) {
    case 'meal': return <MealIcon color={color} />;
    case 'scene': return <SceneIcon color={color} />;
    case 'movie': return <MovieIcon color={color} />;
    default: return null;
  }
}

export default function ScheduleSheet() {
  const { showScheduleSheet, closeScheduleSheet, badges } = useApp();
  const { primaryBadges, schedule, getTypeColor, content } = usePassport();

  const scheduleContent = content.schedule;

  // Parse day boundaries from schedule config
  const dayStart = parseScheduleTime(schedule?.dayStart || '09:00');
  const dayEnd = parseScheduleTime(schedule?.dayEnd || '20:30');
  const dayDuration = dayEnd - dayStart;

  // Get current progress through the day (0-100)
  const getDayProgress = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (currentMinutes < dayStart) return 0;
    if (currentMinutes > dayEnd) return 100;
    return ((currentMinutes - dayStart) / dayDuration) * 100;
  };

  // Get badge position on the timeline (0-100)
  const getBadgePosition = (badge) => {
    const badgeMinutes = parseTimeToMinutes(badge.time);
    if (badgeMinutes < dayStart) return 0;
    if (badgeMinutes > dayEnd) return 100;
    return ((badgeMinutes - dayStart) / dayDuration) * 100;
  };

  const [dayProgress, setDayProgress] = useState(getDayProgress);

  // Get start time for sorting (movies use startTime, others use time)
  const getSortTime = (badge) => badge.startTime || badge.time;

  // Sort by start time for the timeline
  const sortedBadges = [...primaryBadges].sort((a, b) => {
    return parseTimeToMinutes(getSortTime(a)) - parseTimeToMinutes(getSortTime(b));
  });

  // Update progress every minute
  useEffect(() => {
    if (!showScheduleSheet) return;

    const interval = setInterval(() => {
      setDayProgress(getDayProgress());
    }, 60000);

    setDayProgress(getDayProgress());

    return () => clearInterval(interval);
  }, [showScheduleSheet]);

  return (
    <AnimatePresence>
      {showScheduleSheet && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            variants={backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeScheduleSheet}
          />

          <motion.div
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-parchment-100 z-50 shadow-2xl flex flex-col"
            variants={slideFromLeft}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springs.smooth}
          >
            <header className="flex items-center justify-between px-4 py-4 border-b border-parchment-300">
              <h2 className="font-display text-lg font-bold text-earth-800">
                {scheduleContent?.title || "Today's Journey"}
              </h2>
              <motion.button
                onClick={closeScheduleSheet}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-parchment-200 text-earth-600 hover:bg-parchment-300 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Legend */}
              <div className="mb-4 p-3 rounded-xl border border-parchment-300" style={{ backgroundColor: 'rgba(237, 232, 220, 0.5)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: getTypeColor('meal') }}>
                      <MealIcon color="white" />
                    </div>
                    <span className="text-xs text-earth-500" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>Meal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: getTypeColor('scene') }}>
                      <SceneIcon color="white" />
                    </div>
                    <span className="text-xs text-earth-500" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>Scene</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: getTypeColor('movie') }}>
                      <MovieIcon color="white" />
                    </div>
                    <span className="text-xs text-earth-500" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>Movie</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-0 bottom-0 bg-parchment-300 z-0" style={{ left: '17px', width: '6px' }} />

                <motion.div
                  className="absolute top-0 origin-top z-0"
                  style={{ left: '17px', width: '6px', backgroundColor: '#7C3AED' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${dayProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                {dayProgress > 0 && dayProgress < 100 && (
                  <motion.div
                    className="absolute -translate-y-1/2 z-20"
                    style={{ top: `${dayProgress}%`, left: '10px', width: '21px', height: '21px' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springs.bouncy}
                  >
                    <motion.div
                      className="w-full h-full bg-black rotate-45"
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(124, 58, 237, 0.7)',
                          '0 0 10px 5px rgba(124, 58, 237, 0.5)',
                          '0 0 0 0 rgba(124, 58, 237, 0.7)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                )}

                <div className="space-y-4 ml-10">
                  {sortedBadges.map((badge) => {
                    const isClaimed = badges[badge.id]?.claimed;
                    const position = getBadgePosition(badge);
                    const isPast = position < dayProgress;
                    const typeColor = getTypeColor(badge.type);

                    return (
                      <div key={badge.id} className="relative flex items-start gap-3">
                        <div
                          className="absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center z-10"
                          style={{
                            backgroundColor: isClaimed ? '#7C3AED' : typeColor,
                            boxShadow: `0 0 0 3px ${isClaimed ? '#7C3AED' : typeColor}20`
                          }}
                        >
                          {isClaimed ? (
                            <span className="text-white"><CheckIcon /></span>
                          ) : (
                            <BadgeTypeIcon type={badge.type} color="white" />
                          )}
                        </div>

                        <div className={`flex-1 min-w-0 transition-opacity ${isClaimed ? 'opacity-60' : isPast ? 'opacity-70' : 'opacity-100'}`}>
                          <span
                            className="text-xs font-medium"
                            style={{ fontFamily: "'Google Sans Flex', sans-serif", color: isClaimed ? '#9CA3AF' : '#78716C' }}
                          >
                            {badge.time}
                          </span>
                          <p className={`text-sm font-medium truncate ${isClaimed ? 'text-earth-400 line-through' : 'text-earth-700'}`}>
                            {badge.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
