
const CACHE='jeju-trip-v5';
const APP=['./','./index.html','./styles.css','./app.js','./data/trip-data.js','./manifest.json','./assets/icon.svg',
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin===location.origin){
    e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
      const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return r;
    }).catch(()=>caches.match('./index.html'))));
  } else if(u.hostname.includes('tile.openstreetmap.org')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}).catch(()=>cached))));
  }
});
