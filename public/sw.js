/// <reference lib="webworker" />
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

const CACHE_NAME = 'ww-pro-v2';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icon-64.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

// Install: precache app shell
sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  sw.skipWaiting();
});

// Activate: clean old caches
sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  sw.clients.claim();
});

// Offline fallback HTML
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover"/>
<meta name="theme-color" content="#050505"/>
<title>WW.pro — Офлайн</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050505;color:#f4f4f5;font-family:'Golos Text',system-ui,sans-serif;padding:env(safe-area-inset-top,0) env(safe-area-inset-right,0) env(safe-area-inset-bottom,0) env(safe-area-inset-left,0)}
.c{text-align:center;padding:2rem}
h1{font-size:1.25rem;font-weight:500;margin-bottom:.5rem}
p{font-size:.875rem;color:#71717a;margin-bottom:1.5rem}
button{background:#10b981;color:#000;border:none;padding:.625rem 1.5rem;border-radius:9999px;font-size:.875rem;font-weight:500;cursor:pointer}
button:active{opacity:.8}
</style>
</head>
<body>
<div class="c">
<h1>Нет подключения</h1>
<p>Проверьте интернет-соединение и попробуйте снова.</p>
<button onclick="location.reload()">Обновить</button>
</div>
</body>
</html>`;

// Fetch: network-first for navigations, stale-while-revalidate for static assets
sw.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET, chrome-extension, etc.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== sw.location.origin) return;

  // Navigations → network-first (SPA fallback to /index.html, then offline page)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the latest navigation response
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then((r) =>
            r || new Response(OFFLINE_HTML, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
          )
        )
    );
    return;
  }

  // Static assets (JS/CSS/images/fonts) → stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });
        return cached || fetchPromise;
      })
    )
  );
});
