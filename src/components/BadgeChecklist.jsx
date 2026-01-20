import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { usePassport } from '../context/PassportContext';

export default function BadgeChecklist({ onBack }) {
  const { badges: claimedBadges, toggleBadge } = useApp();
  const { badges: allBadges, badgeTypes, content } = usePassport();

  const checklistContent = content.checklist;

  // Group badges by type
  const groupedBadges = {};
  badgeTypes.forEach(type => {
    groupedBadges[type.id] = allBadges.filter(b => b.type === type.id);
  });

  const handleToggle = (badgeId) => {
    const badge = allBadges.find(b => b.id === badgeId);
    // Don't allow toggling secret badges directly
    if (badge?.type === 'secret') return;
    toggleBadge(badgeId);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center text-earth-500 hover:text-earth-700"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-display text-xl font-bold text-earth-800">
          {checklistContent?.header || 'Badge Checklist'}
        </h2>
      </div>

      <p className="font-body text-earth-500 text-sm mb-6">
        {checklistContent?.description || 'Made a mistake? Toggle badges on or off below. Secret badges unlock automatically when you complete their requirements.'}
      </p>

      <div className="space-y-6 max-h-[50vh] overflow-y-auto scrollbar-hide">
        {badgeTypes.map(type => {
          const typeBadges = groupedBadges[type.id] || [];
          if (typeBadges.length === 0) return null;

          return (
            <div key={type.id}>
              <h3 className="font-display text-sm font-semibold text-earth-500 uppercase tracking-wider mb-2">
                {type.emoji} {type.name}
              </h3>
              <div className="space-y-2">
                {typeBadges.map((badge) => {
                  const isClaimed = claimedBadges[badge.id]?.claimed;
                  const isSecret = badge.type === 'secret';

                  return (
                    <motion.label
                      key={badge.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-card bg-parchment-50
                        ${isSecret ? 'cursor-default' : 'cursor-pointer'}
                        ${isClaimed ? 'border-2 border-shire-300' : 'border border-parchment-300'}
                      `}
                      whileHover={!isSecret ? { scale: 1.01 } : {}}
                      whileTap={!isSecret ? { scale: 0.99 } : {}}
                    >
                      <input
                        type="checkbox"
                        checked={isClaimed || false}
                        onChange={() => handleToggle(badge.id)}
                        disabled={isSecret}
                        className={`
                          w-5 h-5 rounded border-earth-300 text-shire-500 focus:ring-shire-500
                          ${isSecret ? 'opacity-50' : ''}
                        `}
                      />
                      <div className="flex-1">
                        <p className={`font-display text-sm font-semibold ${isClaimed ? 'text-earth-800' : 'text-earth-500'}`}>
                          {badge.name}
                        </p>
                        {badge.time && (
                          <p className="font-body text-xs text-earth-400">
                            {badge.time}
                          </p>
                        )}
                        {isSecret && badge.unlockHint && (
                          <p className="font-body text-xs text-gold-600 mt-1">
                            Unlocks when: {badge.unlockHint}
                          </p>
                        )}
                      </div>
                      {isSecret && (
                        <span className={`text-xs font-body ${isClaimed ? 'text-shire-500' : 'text-gold-500'}`}>
                          {isClaimed ? '✓' : 'Auto'}
                        </span>
                      )}
                    </motion.label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <motion.button
        className="btn-secondary w-full mt-6"
        onClick={onBack}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {checklistContent?.doneButton || 'Done'}
      </motion.button>
    </div>
  );
}
