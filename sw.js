/* ═══════════════════════════════════════════════════════════
   Factura — Service Worker

   Le nom du cache est dérivé automatiquement de la version
   passée par l'application dans l'URL d'enregistrement
   (./sw.js?v=1.4.0). Aucune synchronisation manuelle :
   changer APP_VERSION dans l'app suffit à invalider le cache.
   ═══════════════════════════════════════════════════════════ */

const VERSION = new URL(self.location).searchParams.get('v') || 'dev';
const CACHE   = 'factura-' + VERSION;

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.ico',
];

// ── Installation : mettre l'application en cache ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE).catch(() =>
        cache.addAll(['./', './index.html'])
      ))
      // On n'active pas de force : l'utilisateur choisit quand recharger
      .then(() => self.skipWaiting())
  );
});

// ── Activation : supprimer les caches des versions précédentes ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('factura-') && k !== CACHE)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── L'application demande l'activation immédiate ──
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Requêtes ──
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;

  // Navigation : réseau d'abord, cache en secours (toujours à jour si en ligne)
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

  // Ressources : cache immédiat, rafraîchissement en arrière-plan
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
