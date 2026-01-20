# Multi-Passport Migration Notes

Tracking progress and notes for the CMS migration.

---

## Progress Log

### Session Start
- Read PRD and summary docs
- Analyzed current codebase structure
- Key files identified: badges.js (20 badges), tailwind.config.js (colors), App.jsx, AppContext.jsx, useLocalStorage.js, useSound.js

### Phase 1: Foundation
- [x] Installed react-router-dom
- [x] Created PassportContext.jsx - loads passport.json, applies theme
- [x] Created usePassport.js hook
- [x] Created passportLoader.js utility
- [x] Created fontLoader.js for dynamic Google Fonts
- [x] Created manifestGenerator.js for dynamic PWA manifest
- [x] Set up routing in App.jsx

### Phase 2: Extract Shire Content
- [x] Created passports/index.json registry
- [x] Created passports/shire/passport.json with all 20 badges, theme, content, audio
- [x] Moved images from public/images/ to passports/shire/assets/images/
- [x] Moved audio from public/audio/ to passports/shire/assets/audio/
- [x] Deleted src/data/badges.js
- [x] Deleted src/components/RainEffect.jsx

### Phase 3: Theme System
- [x] Updated tailwind.config.js to use CSS variables
- [x] Fixed opacity modifiers (bg-color/opacity) to use inline styles
- [x] Dynamic font loading working

### Phase 4: Update Components
All components updated to use usePassport() context:
- [x] SplashScreen.jsx
- [x] NameModal.jsx
- [x] ExplainerModal.jsx
- [x] Passport.jsx
- [x] BadgeCard.jsx
- [x] BadgeModal.jsx
- [x] CertificationModal.jsx
- [x] BadgeChecklist.jsx
- [x] ScheduleSheet.jsx
- [x] SecretUnlockModal.jsx
- [x] ExportTemplate.jsx
- [x] FloatingBadge.jsx
- [x] LoadingScreen.jsx

### Phase 5: Audio System
- [x] Updated useSound.js to accept dynamic paths
- [x] Removed hardcoded audio file mappings
- [x] Added preloadBadgeSounds() with {badgeId, soundUrl} mapping
- [x] Added preloadGreetingSounds() with URL array
- [x] Added configureBackgroundMusic() with time-of-day config
- [x] Updated AppContext to initialize audio from passport config

### Phase 6: Storage & Secrets
- [x] Updated useLocalStorage.js to namespace by passport ID
- [x] Updated useSecretBadges.js to use passport config
- [x] Secret badges respect features.secretBadges flag

### Phase 7: Admin Dashboard
- [x] Created AdminApp.jsx with PassportList and PassportDetail views
- [x] Routes at /admin and /admin/:passportId

---

## Verification Checklist

- [x] Build succeeds with no errors
- [x] /shire route loads correctly
- [x] /admin route loads correctly
- [x] passport.json served correctly
- [x] Badge images accessible at new paths
- [x] Passport index.json working

## Notes for Future

1. **Opacity modifiers**: Tailwind's `/opacity` syntax doesn't work with CSS variable colors. Use inline styles with rgba() for transparency.

2. **Audio paths**: Badge sounds now use {badgeId, soundUrl} mapping. Each badge defines its own sound path in passport.json.

3. **Adding new passports**: Create new folder at passports/{id}/ with passport.json and assets/, add entry to passports/index.json.

4. **Feature flags**: All features can be disabled in passport.json:
   - secretBadges, backgroundMusic, scheduleTimeline, greetingSounds, badgeSounds

---

## Migration Complete
All phases implemented and verified working.

