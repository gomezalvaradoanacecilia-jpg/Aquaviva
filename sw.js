const CACHE='gestorpro-pwa-v2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.svg','./icon-512.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
self.addEventListener('push',e=>{let data={};try{data=e.data?e.data.json():{}}catch{data={title:'Gestor Pro',body:e.data?.text()||'Tienes una nueva alerta.'}};e.waitUntil(self.registration.showNotification(data.title||'Gestor Pro',{body:data.body||'Tienes una nueva alerta.',icon:'./icon-192.svg',badge:'./icon-192.svg',data:{url:data.url||'./index.html'}}));});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow(e.notification.data?.url||'./index.html'));});
