/* ═══════════════════════════════════════════════════════════
   Factura — Service Worker
   Stratégie : pré-cache à l'installation + stale-while-revalidate
   Objectif  : application 100 % utilisable hors connexion
   ═══════════════════════════════════════════════════════════ */

const CACHE = 'factura-v3';

// Ressources indispensables au démarrage hors ligne
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.ico',
];

// ── Installation : mettre l'application en cache immédiatement ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE).catch(() =>
        cache.addAll(['./', './index.html'])
      ))
      .then(() => self.skipWaiting())
  );
});

// ── Activation : purger les anciens caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Requêtes : cache d'abord, rafraîchissement en arrière-plan ──
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;

  // Navigation : renvoyer index.html même hors ligne
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html')
          .then(r => r || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req)
        .then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
