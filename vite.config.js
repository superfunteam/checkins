import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { adminApiPlugin } from './vite-plugin-admin-api';
import { passportManifestsPlugin } from './vite-plugin-passport-manifests';

// Exposed as __BUILD_ID__ so a phone can be asked which build it runs
// (window.__BUILD_ID__). Netlify sets COMMIT_REF; VITE_BUILD_ID is for local tests.
const BUILD_ID = (process.env.COMMIT_REF || '').slice(0, 7) || process.env.VITE_BUILD_ID || `local-${Date.now()}`;

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  plugins: [
    react(),
    adminApiPlugin(),
    passportManifestsPlugin(),
    VitePWA({
      // The app decides when to swap in a new build (see src/pwa). "prompt"
      // here only means "don't reload the instant a new worker activates".
      registerType: 'prompt',
      injectRegister: false,
      // Manifests are generated per passport by passportManifestsPlugin.
      manifest: false,
      includeAssets: ['favicon.png', 'images/icon-*.png'],
      workbox: {
        // Precache only the app shell. Passport content is fetched at runtime
        // so it stays fresh and so guests don't download every event's art.
        globPatterns: ['**/*.{js,css,html,ico,svg,png,webp,woff2}'],
        globIgnores: ['passports/**', '**/unfurl.png'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/passports\//],
        runtimeCaching: [
          {
            // Passport config: always try the network so new badges and copy
            // show up immediately; fall back to cache when offline.
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /^\/passports\/(index\.json|[^/]+\/passport\.json)$/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'passport-config',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20 },
            },
          },
          {
            // Badge art, sounds, music: instant from cache, refreshed behind
            // the scenes. URLs carry ?v=<version> so a bump busts them.
            urlPattern: ({ url }) =>
              url.origin === self.location.origin && /^\/passports\/[^/]+\/assets\//.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'passport-assets',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
