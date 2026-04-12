/**
 * Mochi Service Worker — Offline caching strategy
 */

const CACHE_NAME = 'mochi-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/src/ui/styles.css',
  '/src/index.js',
  '/src/state/StateManager.js',
  '/src/state/EmotionalSystem.js',
  '/src/state/DailyRoutineSystem.js',
  '/src/state/AlarmSystem.js',
  '/src/state/ReminderSystem.js',
  '/src/animations/AnimationEngine.js',
  '/src/voice/VoiceSystem.js',
  '/src/apis/ToolSystem.js',
  '/src/rss/RSSParser.js',
  '/src/i18n/I18nModule.js',
  '/src/llm/WebLLMModule.js',
  '/src/games/MiniGame.js',
  '/src/audio/AudioSystem.js',
  '/src/ui/ActionHandler.js',
  '/src/ui/ColorSystem.js'
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for API calls
  if (url.hostname !== location.hostname) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache API responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first for local assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      });
    })
  );
});
