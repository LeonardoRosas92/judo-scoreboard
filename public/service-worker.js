const CACHE_NAME = 'judotecnia-cache-v1'
const urlsToCache = ['/', '/index.html', '/manifest.json']

// 📦 Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

// ⚡ Interceptar peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    }),
  )
})
