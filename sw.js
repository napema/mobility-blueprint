// sw.js — cache dell'app shell per l'uso offline (la sessione serale non può
// dipendere dalla rete). Cache-first con fallback di rete, versionata a mano.

const CACHE_NAME = "mobilita-shell-v21";

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
  "./js/assessment.js",
  "./js/progressi.js",
  "./js/notifiche.js",
  "./js/sync.js",
  "./js/foto-sync.js",
  "./config.js",
  "./anteprima-video.html",
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
  let dati = {};
  try { dati = event.data.json(); } catch { dati = { title: "Mobilità" }; }

  event.waitUntil((async () => {
    const stato = await leggiStato();
    const fatta = stato && stato.ultimaSessione === oggiLocale();

    // Se la sessione è già fatta si CAMBIA il messaggio, non lo si
    // sopprime: sopprimere del tutto può far comparire la notifica
    // generica di sistema "questo sito è stato aggiornato".
    if (fatta && (dati.tag === "recupero" || dati.tag === "principale")) {
      return self.registration.showNotification("✅ Oggi è già fatta", {
        body: "Niente da fare. Ci vediamo domani.",
        tag: dati.tag,
        icon: "icons/icon-192.png",
        badge: "icons/icon-192.png",
        silent: true,
        data: { url: dati.url || "./index.html" },
      });
    }

    return self.registration.showNotification(dati.title || "Mobilità", {
      body: dati.body || "",
      tag: dati.tag || "mobilita",
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      data: { url: dati.url || "./index.html" },
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
  const url = new URL(event.request.url);
  // Le chiamate a GitHub non si toccano MAI: cacharle significherebbe
  // sincronizzare con dati vecchi. Stesso discorso per ogni altra origine.
  if (url.hostname === "api.github.com") return;
  if (url.origin !== self.location.origin) return;

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
