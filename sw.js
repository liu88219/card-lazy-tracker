const CACHE_NAME = 'lazy-card-tracker-v6';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 一律優先向伺服器抓取最新畫面 (no-cache)，僅在離線時退回本機快取
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
