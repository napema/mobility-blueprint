// sw.js — cache dell'app shell per l'uso offline (la sessione serale non può
// dipendere dalla rete). Cache-first con fallback di rete, versionata a mano.

const CACHE_NAME = "mobilita-shell-v6";

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
  "./js/notifiche.js",
  "./fonts/sf-pro-text-regular.woff2",
  "./fonts/sf-pro-text-medium.woff2",
  "./fonts/sf-pro-text-semibold.woff2",
  "./fonts/sf-pro-text-bold.woff2",
  "./fonts/sf-pro-display-semibold.woff2",
  "./fonts/sf-pro-display-bold.woff2",
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

// ---------------------------------------------------------------------
// Promemoria serale: il push arriva da GitHub Actions (vedi
// .github/workflows/promemoria.yml). Qui decidiamo se mostrarlo: se la
// sessione di oggi risulta già fatta, non si disturba.
// ---------------------------------------------------------------------

function leggiStato() {
  return new Promise((resolve) => {
    const req = indexedDB.open("mobilita-stato", 1);
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("stato")) return resolve(null);
      const tx = db.transaction("stato", "readonly");
      const r = tx.objectStore("stato").get("corrente");
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => resolve(null);
    };
    req.onerror = () => resolve(null);
    req.onupgradeneeded = () => resolve(null);
  });
}

function oggiLocale() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    const stato = await leggiStato();
    if (stato && stato.ultimaSessione === oggiLocale()) {
      // già fatta: nessun promemoria, ma il push va comunque consumato
      return self.registration.showNotification("Mobilità", {
        body: "Sessione di oggi già fatta. Nulla da fare.",
        tag: "promemoria-giornaliero",
        silent: true,
        data: { url: "./index.html" },
      });
    }
    return self.registration.showNotification("Mobilità", {
      body: "Non hai ancora fatto la sessione di oggi. Bastano pochi minuti.",
      tag: "promemoria-giornaliero",
      requireInteraction: false,
      data: { url: "./index.html" },
    });
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const finestre = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of finestre) {
      if ("focus" in c) return c.focus();
    }
    return self.clients.openWindow("./index.html");
  })());
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
