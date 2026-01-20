import { useEffect, useCallback, useRef } from 'react';
import { usePassport } from '../context/PassportContext';

/**
 * Hook to handle automatic secret badge unlocking
 * @param {Object} claimedBadges - Object of badge IDs to claim data
 * @param {Function} claimBadge - Function to claim a badge
 * @param {Function} playSound - Function to play sounds
 * @param {Function} onSecretUnlock - Callback when a secret is unlocked
 * @param {boolean} enabled - Whether secret badges feature is enabled
 * @param {Array} secretBadgeConfigs - Optional override for secret badge configs
 */
export function useSecretBadges(
  claimedBadges,
  claimBadge,
  playSound,
  onSecretUnlock,
  enabled = true,
  secretBadgeConfigs = null
) {
  const justUnlocked = useRef(new Set());

  // Get secret badges from passport context if not provided
  const passport = usePassport();
  const secretBadges = secretBadgeConfigs || passport.secretBadges || [];

  const checkSecretUnlocks = useCallback(() => {
    // Skip if feature is disabled
    if (!enabled) return;

    for (const secret of secretBadges) {
      // Skip if already claimed or already processed this session
      if (claimedBadges[secret.id]?.claimed) continue;
      if (justUnlocked.current.has(secret.id)) continue;

      // Check unlock condition
      if (!secret.unlockCondition?.badgeIds) continue;
      const { badgeIds } = secret.unlockCondition;
      const allUnlocked = badgeIds.every(id => claimedBadges[id]?.claimed);

      if (allUnlocked) {
        // Mark as being unlocked to prevent duplicate triggers
        justUnlocked.current.add(secret.id);

        // Small delay for dramatic effect
        setTimeout(() => {
          claimBadge(secret.id, { isAutoUnlock: true });
          playSound(secret.id === 'secret-ringbearer' ? 'horn' : 'chime');
          onSecretUnlock?.(secret);
        }, 600);
      }
    }
  }, [claimedBadges, claimBadge, playSound, onSecretUnlock, enabled, secretBadges]);

  // Check for unlocks whenever claimed badges change
  useEffect(() => {
    checkSecretUnlocks();
  }, [checkSecretUnlocks]);

  // Check if a secret badge is unlocked (for display purposes)
  const isSecretUnlocked = useCallback((badgeId) => {
    // If feature disabled, always return false
    if (!enabled) return false;

    const badge = secretBadges.find(b => b.id === badgeId);
    if (!badge) return false;

    // If already claimed, it's unlocked
    if (claimedBadges[badgeId]?.claimed) return true;

    // Check if conditions are met
    if (!badge.unlockCondition?.badgeIds) return false;
    const { badgeIds } = badge.unlockCondition;
    return badgeIds.every(id => claimedBadges[id]?.claimed);
  }, [claimedBadges, enabled, secretBadges]);

  return { checkSecretUnlocks, isSecretUnlocked };
}
