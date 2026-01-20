# Passport CMS Migration PRD

Detailed task breakdown with acceptance criteria.

---

## Phase 1: Foundation

### 1.1 Install Dependencies
- [ ] Install `react-router-dom`
- **AC:** `npm install` succeeds, package.json updated

### 1.2 Create Passport Registry
- [ ] Create `passports/index.json` with shire entry
```json
{
  "passports": [
    { "id": "shire", "name": "The Shire Passport", "path": "/shire", "enabled": true, "default": true }
  ]
}
```
- **AC:** JSON is valid, contains shire passport

### 1.3 Create PassportContext
- [ ] Create `src/context/PassportContext.jsx`
  - Reads passportId from URL param
  - Loads `passports/{id}/passport.json`
  - Provides: `passport`, `badges`, `theme`, `content`, `features`, `getAssetUrl(path)`
  - Applies CSS variables from theme.colors
  - Calls fontLoader for theme.fonts
- **AC:** `usePassport()` returns loaded config, CSS variables are set on `:root`

### 1.4 Create usePassport Hook
- [ ] Create `src/hooks/usePassport.js` - thin wrapper around `useContext(PassportContext)`
- **AC:** Hook returns passport config or throws if used outside provider

### 1.5 Create passportLoader Utility
- [ ] Create `src/utils/passportLoader.js`
  - `loadPassportIndex()` - fetches `/passports/index.json`
  - `loadPassport(id)` - fetches `/passports/{id}/passport.json`
  - Returns parsed JSON
- **AC:** Functions return valid data, handle 404 gracefully

### 1.6 Create fontLoader Utility
- [ ] Create `src/utils/fontLoader.js`
  - `loadFonts(fontConfig)` - injects Google Fonts link tag
  - Handles display, body, ui fonts from config
- **AC:** Fonts load when called, no duplicate link tags

### 1.7 Add Routing to App.jsx
- [ ] Import react-router-dom (BrowserRouter, Routes, Route, Navigate, useParams)
- [ ] Wrap app with BrowserRouter
- [ ] Add routes: `/:passportId/*`, `/admin/*`, `/` redirect
- [ ] Create PassportApp component that wraps current AppContent with PassportProvider
- [ ] Remove RainEffect import and usage
- **AC:** `/shire` loads app, `/` redirects to `/shire`, RainEffect gone

### 1.8 Delete RainEffect
- [ ] Delete `src/components/RainEffect.jsx`
- **AC:** File deleted, no import errors

---

## Phase 2: Extract Shire Content

### 2.1 Create Passport JSON Schema
- [ ] Create `passports/shire/passport.json` with all sections:
  - `id`, `version`, `meta`
  - `features` (secretBadges, backgroundMusic, scheduleTimeline, greetingSounds, badgeSounds)
  - `schedule` (dayStart, dayEnd)
  - `badgeTypes` array with id, name, label, color, hidden
  - `badges` array (copy from badges.js, add sound paths)
  - `theme.colors` (copy from tailwind.config.js)
  - `theme.fonts` (display, body, ui with family, weights)
  - `content.splash`, `content.explainer`, `content.passport`, `content.certification`, `content.schedule`, `content.badgeModal`, `content.name`
  - `audio.greetings`, `audio.backgroundMusic`
  - `pwa` (themeColor, backgroundColor)
- **AC:** JSON is valid, contains all 20 badges, all UI text, all colors

### 2.2 Move Badge Images
- [ ] Create `passports/shire/assets/images/badges/`
- [ ] Move all `public/images/badge-*.webp` files there
- [ ] Move all `public/images/badge-*.png` files there
- [ ] Update passport.json badge image paths to `assets/images/badges/badge-{id}.webp`
- **AC:** All 24 badge images in new location, JSON paths correct

### 2.3 Move Lock Images
- [ ] Move `public/images/badge-lock.png` to `passports/shire/assets/images/lock.png`
- [ ] Move `public/images/badge-lock-ring.png` to `passports/shire/assets/images/lock-ring.png`
- **AC:** Lock images moved

### 2.4 Move Splash/UI Images
- [ ] Move `public/images/ring-badge.png` to `passports/shire/assets/images/splash.png`
- [ ] Move `public/images/sophia-matt.png` to `passports/shire/assets/images/hosts.png`
- [ ] Move `public/images/unfurl.png` to `passports/shire/assets/images/unfurl.png`
- **AC:** UI images moved, referenced in passport.json meta

### 2.5 Move PWA Icons
- [ ] Create `passports/shire/assets/images/icons/`
- [ ] Move `public/images/icon-*.png` files there (4 files)
- **AC:** PWA icons moved

### 2.6 Move Audio Files
- [ ] Create `passports/shire/assets/audio/badges/`
- [ ] Create `passports/shire/assets/audio/greetings/`
- [ ] Create `passports/shire/assets/audio/music/`
- [ ] Move `public/audio/badge-*.mp3` to badges/
- [ ] Move `public/audio/greeting-*.mp3` to greetings/
- [ ] Move `public/audio/bg-*.mp3` to music/ (rename to morning-1, afternoon-1, etc.)
- [ ] Update passport.json audio paths
- **AC:** All audio files moved, JSON paths correct

### 2.7 Delete Old Data File
- [ ] Delete `src/data/badges.js`
- **AC:** File deleted, no import errors (will break components temporarily)

---

## Phase 3: Theme System

### 3.1 Update Tailwind Config for CSS Variables
- [ ] Replace hardcoded color values with CSS variable references:
  - `primary: { 50: 'var(--color-primary-50)', ... }`
  - `accent: { 50: 'var(--color-accent-50)', ... }`
  - `background: { 50: 'var(--color-background-50)', ... }`
  - `text: { 50: 'var(--color-text-50)', ... }`
  - `highlight: 'var(--color-highlight)'`
- [ ] Replace fontFamily with CSS variables
- [ ] Keep shadows, borderRadius, animations as-is (shared)
- **AC:** Tailwind compiles, colors come from CSS variables

### 3.2 Update PassportContext to Apply Theme
- [ ] In PassportContext, after loading JSON:
  - Loop theme.colors and set `--color-{name}-{shade}` CSS variables
  - Set `--font-display`, `--font-body`, `--font-ui` variables
- **AC:** Inspecting `:root` shows all color/font variables

### 3.3 Update index.html
- [ ] Remove hardcoded Google Fonts link (fonts loaded dynamically)
- [ ] Remove hardcoded theme-color meta (set dynamically)
- [ ] Remove hardcoded description meta (set dynamically)
- [ ] Keep viewport, charset, basic structure
- **AC:** index.html is minimal, no passport-specific content

### 3.4 Dynamic PWA Manifest
- [ ] Create `src/utils/manifestGenerator.js`
  - Generates manifest JSON from passport config
  - Injects as data URL or blob URL into link tag
- [ ] Call from PassportContext after loading
- **AC:** `/shire` has correct manifest with "The Shire Passport" name

### 3.5 Delete Old Manifest
- [ ] Delete `public/manifest.json`
- **AC:** File deleted

---

## Phase 4: Update Components

### 4.1 Update SplashScreen
- [ ] Import `usePassport`
- [ ] Replace hardcoded title with `content.splash.title`
- [ ] Replace hardcoded subtitle with `content.splash.subtitle`
- [ ] Replace button text with `content.splash.enterButton`
- [ ] Use `getAssetUrl()` for splash image and hosts image
- [ ] Use `meta.hosts.names` for hosts label
- **AC:** Splash screen renders from JSON data

### 4.2 Update NameModal
- [ ] Replace hardcoded prompt, placeholder, button text with `content.name.*`
- [ ] Move audio hint messages to JSON
- **AC:** Name modal renders from JSON data

### 4.3 Update ExplainerModal
- [ ] Replace all text with `content.explainer.*`
- [ ] Support `body` as array of paragraphs
- **AC:** Explainer renders from JSON data

### 4.4 Update Passport (main screen)
- [ ] Replace header, labels, buttons with `content.passport.*`
- [ ] Get badges from `usePassport().badges`
- **AC:** Main passport screen renders from JSON data

### 4.5 Update CertificationModal
- [ ] Replace all text with `content.certification.*`
- [ ] Support `completionMessages` object (perfect, high, medium, low)
- **AC:** Certification modal renders from JSON data

### 4.6 Update BadgeCard
- [ ] Get badge types from `usePassport().badgeTypes`
- [ ] Dynamic colors from badge type config
- [ ] Use `getAssetUrl()` for images
- [ ] Use lock images from passport assets
- **AC:** Badge cards show correct colors per type, images load

### 4.7 Update BadgeModal
- [ ] Get badge types from config for type labels and colors
- [ ] Replace hardcoded type labels (Film, Meal, Scene, Secret) with `badgeType.label`
- [ ] Replace honor system text with `content.badgeModal.*`
- [ ] Use `getAssetUrl()` for badge images
- **AC:** Badge modal shows dynamic type labels and colors

### 4.8 Update BadgeChecklist
- [ ] Get badge types from config
- [ ] Replace type group headers with `badgeType.name` + emoji (keep emojis in JSON)
- [ ] Replace unlock hints with dynamic text from secret badge config
- **AC:** Checklist groups by dynamic types

### 4.9 Update ScheduleSheet
- [ ] Conditionally render based on `features.scheduleTimeline`
- [ ] Replace header with `content.schedule.title`
- [ ] Get schedule times from `schedule.dayStart`, `schedule.dayEnd`
- [ ] Get badge type colors from config
- **AC:** Schedule sheet only shows if feature enabled, uses JSON times

### 4.10 Update SecretUnlockModal
- [ ] Conditionally process secrets based on `features.secretBadges`
- [ ] Use badge type color for secret type
- **AC:** Secret unlocks only happen if feature enabled

### 4.11 Update ExportTemplate
- [ ] Replace all text with `content.certificate.*`
- [ ] Use `getAssetUrl()` for badge images
- [ ] Support `{hosts}` placeholder in hostedBy text
- **AC:** Exported PNG has correct text from JSON

### 4.12 Update LoadingScreen
- [ ] Get preload paths from passport config (badge images, audio files)
- [ ] Use `getAssetUrl()` for all asset paths
- **AC:** Loading screen preloads from passport assets

---

## Phase 5: Audio System

### 5.1 Update useSound Hook
- [ ] Accept passport config or use `usePassport()` internally
- [ ] Build badge sound map from `badges[].sound` paths
- [ ] Build greeting list from `audio.greetings` paths
- [ ] Build background music map from `audio.backgroundMusic` paths
- [ ] Use `getAssetUrl()` for all paths
- **AC:** All sounds play from passport assets

### 5.2 Conditional Background Music
- [ ] Check `features.backgroundMusic` before starting music
- [ ] If false, don't preload music files
- **AC:** Music only loads/plays if feature enabled

### 5.3 Conditional Greeting Sounds
- [ ] Check `features.greetingSounds` before playing greeting
- **AC:** Greetings only play if feature enabled

### 5.4 Conditional Badge Sounds
- [ ] Check `features.badgeSounds` before playing badge claim sound
- **AC:** Badge sounds only play if feature enabled

---

## Phase 6: Storage & Secrets

### 6.1 Update useLocalStorage
- [ ] Accept `passportId` parameter
- [ ] Change storage key from `shire-passport` to `passport-{passportId}`
- [ ] Pass passportId from PassportContext
- **AC:** Different passports have isolated localStorage

### 6.2 Update useSecretBadges
- [ ] Check `features.secretBadges` before processing
- [ ] Get secret badges from passport config
- [ ] Get unlock conditions from badge config
- **AC:** Secrets only process if feature enabled

### 6.3 Update AppContext
- [ ] Get passportId from PassportContext
- [ ] Pass to useLocalStorage
- **AC:** App state uses passport-specific storage

---

## Phase 7: Admin Dashboard

### 7.1 Create Admin Route Structure
- [ ] Create `src/admin/AdminApp.jsx` - layout wrapper
- [ ] Create `src/admin/PassportList.jsx` - grid of passport cards
- [ ] Create `src/admin/PassportDetail.jsx` - single passport view
- [ ] Add routes in App.jsx: `/admin`, `/admin/:passportId`
- **AC:** `/admin` shows passport list, `/admin/shire` shows details

### 7.2 PassportList Component
- [ ] Load passport index
- [ ] Display cards with: name, badge count, enabled status, link to detail
- [ ] Show passport splash image as thumbnail
- **AC:** All registered passports appear in grid

### 7.3 PassportDetail Component
- [ ] Load full passport config
- [ ] Show: meta info, feature flags, theme preview (color swatches), badge gallery
- [ ] Read-only (no editing)
- **AC:** Can view all passport config details

---

## Phase 8: Cleanup & Verification

### 8.1 Remove Unused Public Files
- [ ] Delete files moved to passports/ from public/
- [ ] Keep only: favicon.png, any truly shared assets
- **AC:** public/ is minimal

### 8.2 Update Vite Config
- [ ] Ensure passports/ folder is served as static
- [ ] Update PWA workbox to cache passport assets
- **AC:** Dev server serves passport assets, PWA caches them

### 8.3 Final Verification
- [ ] Full flow test: `/shire` splash → name → loading → explainer → passport → claim all badges → certify → download
- [ ] Secret badges unlock correctly
- [ ] Background music plays (if enabled)
- [ ] Schedule sheet shows (if enabled)
- [ ] PWA installs with correct name/icons
- [ ] Offline mode works
- [ ] Admin dashboard shows passport
- [ ] localStorage is namespaced
- **AC:** All features work end-to-end

---

## Content Strings to Extract

Reference for passport.json `content` section:

```
content.splash.title = "The Shire Passport"
content.splash.subtitle = "Official Documentation of One's Journey Through Middle-earth"
content.splash.enterButton = "Enter the Shire"
content.splash.hostedBy = "Hosted by {hosts}"

content.name.prompt = "What name shall be recorded in the official registry of travelers?"
content.name.placeholder = "Enter your name..."
content.name.continueButton = "Continue"
content.name.skipButton = "or Remain Anonymous"
content.name.defaultNote = '(defaults to "A Humble Hobbit")'
content.name.defaultName = "A Humble Hobbit"
content.name.audioHints = ["Better with Audio", "Volume Up", "If you want"]

content.explainer.title = "Your Quest Awaits"
content.explainer.greeting = "Welcome, {name}"
content.explainer.body = [array of paragraphs]
content.explainer.quote = "A wizard is never late..."
content.explainer.disclaimer = "All times are approximate-ish..."
content.explainer.beginButton = "Begin My Journey"

content.passport.header = "The Shire Passport"
content.passport.journeySubtitle = "{name}'s Journey"
content.passport.sectionTitle = "Your Journey"
content.passport.badgesLabel = "badges"
content.passport.certifyButton = "Certify My Passport"
content.passport.certifySubtext = "Complete your journey and download your certificate"
content.passport.resetButton = "Reset and Start Over"

content.certification.title = "Return to the World of Men"
content.certification.body = [array of paragraphs]
content.certification.footnote = "You will be transported back to Austin, TX..."
content.certification.badgesLabel = "badges claimed"
content.certification.downloadButton = "Certify & Download"
content.certification.generatingText = "Generating..."
content.certification.reviewButton = "Review My Badges"
content.certification.completionMessages.perfect = "Perfect completion!..."
content.certification.completionMessages.high = "A worthy journey indeed!"
content.certification.completionMessages.medium = "A respectable showing!"
content.certification.completionMessages.low = "Every journey begins with a single step."

content.badgeModal.claimButton = "Claim This Badge"
content.badgeModal.claimedLabel = "Claimed"
content.badgeModal.witnessedAt = "Witnessed at {time}"
content.badgeModal.honorSystemText = "The Shire Passport operates on the honor system..."
content.badgeModal.honorSystemCheckbox = "Don't ask me again"
content.badgeModal.honorConfirmButton = "I So Swear"
content.badgeModal.cancelButton = "Cancel"

content.schedule.title = "Today's Journey"

content.checklist.header = "Badge Checklist"
content.checklist.description = "Made a mistake? Toggle badges..."
content.checklist.doneButton = "Done"

content.secretUnlock.header = "Secret Badge Unlocked!"
content.secretUnlock.continueButton = "Continue Journey"
content.secretUnlock.certifyButton = "View and Certify My Passport"

content.certificate.title = "The Shire Passport"
content.certificate.subtitle = "Official Documentation..."
content.certificate.certifies = "This certifies that"
content.certificate.completed = "has completed the sacred marathon"
content.certificate.hostedBy = "Hosted by {hosts}"
content.certificate.footer = "\"The road goes ever on and on...\""
```
