# Passport CMS Migration Summary

Transform the single "Shire Passport" app into a multi-passport CMS where each passport has its own theme, content, badges, and optional features while sharing the same UI components.

## Goals
- Move ALL content out of code into JSON + asset folders
- Support flexible badge types per passport (not just movie/meal/scene)
- Make features optional: secret badges, background music, schedule timeline
- Add simple read-only admin dashboard
- Remove rain effect entirely

---

## New Folder Structure

```
/passports/
  index.json                    # Registry of all passports
  shire/
    passport.json               # All config: badges, theme, text, features
    assets/
      images/
        badges/                 # badge-*.webp files
        icons/                  # PWA icons
        splash.png              # Splash hero image
        hosts.png               # Optional hosts image
        lock.png                # Lock icon
      audio/
        badges/                 # Badge sound effects
        greetings/              # Welcome sounds
        music/                  # Background music (if enabled)

/src/
  context/
    PassportContext.jsx         # NEW: Loads & provides passport config
  hooks/
    usePassport.js              # NEW: Hook to access config
  utils/
    passportLoader.js           # NEW: JSON loading + validation
    fontLoader.js               # NEW: Dynamic Google Fonts
  admin/                        # NEW: Read-only admin UI
    AdminApp.jsx
    PassportList.jsx
    PassportDetail.jsx
```

---

## Routing

Path-based routing at single domain:
- `/shire` - Shire Passport
- `/disney` - Disney Passport (example future)
- `/admin` - Admin dashboard
- `/` - Redirect to default passport

---

## Theme System

Use CSS variables set at runtime from passport.json. Tailwind maps to variables like `var(--color-primary-500)`.

---

## Key Decisions
- **Path-based routing** (not subdomains)
- **Single build, runtime loading** - add passports by dropping in JSON + assets
- **CSS variables** for theming
- **Flexible badge types** - define any types per passport
- **Feature flags** - optional secret badges, music, schedule
