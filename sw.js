// Service worker do ISIS: abre mesmo sem internet. Dados continuam no aparelho + Drive.
const CACHE = 'isis-v7';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // Google (login e Drive) sempre direto na rede
  if (/(^|\.)(googleapis\.com|accounts\.google\.com|google\.com)$/.test(u.hostname) && !/fonts\./.test(u.hostname)) return;
  const sameOrigin = u.origin === location.origin;
  if (sameOrigin && (r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/'))) {
    // página principal: rede primeiro (pega atualizações), cache se estiver offline
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
    return;
  }
  // bibliotecas, fontes e ícones: cache primeiro
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })));
});
