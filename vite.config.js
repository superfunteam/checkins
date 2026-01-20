import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { adminApiPlugin } from './vite-plugin-admin-api';

export default defineConfig({
  plugins: [
    react(),
    adminApiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'images/*.png',
        'images/*.webp',
        'images/*.svg',
      ],
      manifest: {
        name: 'The Shire Passport',
        short_name: 'Shire Passport',
        description: 'Official Documentation of One\'s Journey Through Middle-earth',
        theme_color: '#4a6741',
        background_color: '#f9f6f0',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/images/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/images/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
});
