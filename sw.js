// KESP · cache para abrir mais rápido e funcionar sem internet
// - arquivos do próprio KESP: sempre busca a versão nova; sem internet, usa a guardada
// - bibliotecas externas com versão fixa (ícones, Supabase, PDF, planilhas): guardadas e reutilizadas
const CACHE = 'kesp-v1', LIBS = 'kesp-libs-v1';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); } return res; }).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
    return;
  }
  if (/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host) && /@\d|\/\d+\.\d+/.test(u.pathname + u.search)) {
    e.respondWith(caches.open(LIBS).then(k => k.match(r).then(m => m || fetch(r).then(res => { if (res.ok) k.put(r, res.clone()); return res; }))));
  }
});
