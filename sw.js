const CACHE='aktien-cockpit-shell-4-9-4-kapitelnavigation';
const SHELL=['./','./index.html','./app.js','./wissen.js','./wissen-data.js','./manifest.json','./icon-192.png','./icon-512.png',];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(async c=>{await c.addAll(SHELL.filter(u=>!u.includes('wissen-bilder/')));await Promise.all(SHELL.filter(u=>u.includes('wissen-bilder/')).map(async u=>{try{await c.add(u)}catch(e){/* images absent on server: app shell remains installable */}}));}).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('aktien-cockpit-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy))}return r}).catch(()=>caches.match('./index.html')));return}
event.respondWith(fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return r}).catch(()=>caches.match(event.request)));
});
