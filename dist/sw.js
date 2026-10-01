const SCOPE=new URL(self.registration.scope);
const PREFIX='stuttgart-show-2026:'+encodeURIComponent(SCOPE.pathname)+':';
const CACHE=PREFIX+'v7-transfer';
const ASSETS=['./','./index.html','./style.css','./app.js','./leisure.js','./exhibitors.json','./booth-coordinates.json','./hall-8.webp','./hall-10.webp','./venue-overview.webp','./manifest.webmanifest','./icon-192.png','./icon-512.png','./venue-overview.pdf','./accessible-routes.pdf','./catering-map.pdf','./transfer.js'];
const URLS=new Set(ASSETS.map(p=>new URL(p,SCOPE).href));
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...URLS].map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==SCOPE.origin||!u.pathname.startsWith(SCOPE.pathname)||!URLS.has(u.href))return;e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)).then(hit=>hit||fetch(e.request)))});
