// sw.js — cache dell'app shell per l'uso offline (la sessione serale non può
// dipendere dalla rete). Cache-first con fallback di rete, versionata a mano.

const CACHE_NAME = "mobilita-shell-v5";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/app.js",
  "./js/storage.js",
  "./js/engine.js",
  "./js/esercizi.js",
  "./js/sessione.js",
  "./js/oggi.js",
  "./js/icone.js",
  "./js/animazioni.js",
  "./js/assessment.js",
  "./js/progressi.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomi) =>
      Promise.all(
        nomi.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Network-first con fallback sulla cache: online si prende sempre la
// versione aggiornata (con cache-first una correzione non arriverebbe mai
// senza svuotare la cache a mano), offline si serve l'ultima copia buona.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((risposta) => {
        if (risposta.ok) {
          const clone = risposta.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return risposta;
      })
      .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match("./index.html")))
  );
});
