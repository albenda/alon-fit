const CACHE = 'alonfit-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.mode === 'navigate' || u.pathname.endsWith('/index.html')) {
    // HTML: network-first - always the freshest version when online
    e.respondWith(
      fetch(e.request).then(r => {
        const c = r.clone();
        caches.open(CACHE).then(x => x.put(e.request, c));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else if (u.pathname.includes('/img/') || u.pathname.endsWith('.png') || u.pathname.endsWith('.json')) {
    // images/manifest: cache-first - they rarely change
    e.respondWith(
      caches.match(e.request).then(m => m || fetch(e.request).then(r => {
        const c = r.clone();
        caches.open(CACHE).then(x => x.put(e.request, c));
        return r;
      }))
    );
  }
});
