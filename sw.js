const CACHE_NAME = 'lazy-card-tracker-v10';
const ASSETS = ['./', './index.html', './manifest.json', './qr.js'];

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

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  // access.json 與外部雲端同步 API 永遠即時連網，不快取
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('access.json') ||
    event.request.url.includes('script.google.com') ||
    event.request.url.includes('script.googleusercontent.com')
  ) {
    return;
  }
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
