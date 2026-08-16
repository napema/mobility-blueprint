// notifiche.js — promemoria push.
//
// ARCHITETTURA (SETUP-notifiche.md):
//   GitHub Action (cron orario) → web-push → servizio push Apple → iPhone
// Le chiavi VAPID e la subscription stanno nei GitHub Secrets. Nessun
// database, nessun backend: c'è un solo utente.
//
// VINCOLI iOS, non aggirabili:
//   · iOS 16.4+
//   · la PWA DEVE essere aggiunta alla schermata Home. In Safari come
//     scheda normale il push non funziona, punto.
//   · il permesso va chiesto DOPO UN TAP. Se lo chiedi al caricamento,
//     iOS lo rifiuta in silenzio e non puoi più richiederlo.
//
// La chiave pubblica sta nel codice ed è giusto così. La privata non
// deve mai finire in un file committato.

import { getState, salvaStatoSW } from "./storage.js";

// La chiave pubblica sta solo in config.js. Nessun valore di scorta:
// una chiave diversa da quella con cui firma il server produce un
// fallimento silenzioso, che è il modo peggiore di rompersi.
const VAPID_PUBLIC_KEY = (window.APP_CFG && window.APP_CFG.vapidPublic) || "";

const supportate = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

const statoPermesso = () => (supportate() ? Notification.permission : "non-supportate");

// L'app è installata dalla Home? Su iOS è il prerequisito del push.
const installata = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

function b64ToUint8(base64) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// Va chiamata da un gestore di click, mai all'avvio.
async function attivaNotifiche() {
  if (!supportate()) return { ok: false, motivo: "non-supportate" };
  if (!VAPID_PUBLIC_KEY) return { ok: false, motivo: "chiave-mancante" };

  const reg = await navigator.serviceWorker.register("./sw.js");
  await navigator.serviceWorker.ready;

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false, motivo: "negato" };

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: b64ToUint8(VAPID_PUBLIC_KEY),
    });
  }

  await sincronizzaStato();
  return { ok: true, iscrizione: JSON.stringify(sub) };
}

// Il service worker non può leggere localStorage: qui gli lasciamo in
// IndexedDB l'ultima data completata, così sa se tacere.
async function sincronizzaStato() {
  const s = getState();
  await salvaStatoSW({
    ultimaSessione: s.streak.ultimaDataCompletata,
    oraPromemoria: (s.programma.notifiche || {}).principale,
  });
}

async function provaNotifica() {
  if (statoPermesso() !== "granted") return false;
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification("Mobilità", {
    body: "Così ti arriverà il promemoria della sera.",
    tag: "prova",
    icon: "icons/icon-192.png",
    data: { url: "./index.html" },
  });
  return true;
}

export { supportate, statoPermesso, installata, attivaNotifiche, provaNotifica, sincronizzaStato, VAPID_PUBLIC_KEY };
