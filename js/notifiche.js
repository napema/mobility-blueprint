// notifiche.js — promemoria serale se la sessione del giorno non è fatta.
//
// COME FUNZIONA DAVVERO, senza illusioni:
//
// GitHub Pages serve file statici: da solo non può "svegliare" il
// telefono. Una notifica che arriva ad app chiusa richiede sempre due
// pezzi: un'iscrizione push del dispositivo e QUALCUNO che invii il
// messaggio a quell'iscrizione a un orario stabilito.
//
// Qui il "qualcuno" è GitHub Actions: un workflow con cron gira alle
// 21:00 e invia il push usando chiavi VAPID tenute nei secrets del repo
// (vedi .github/workflows/promemoria.yml). Questo è il senso in cui le
// notifiche PWA "si fanno via GitHub": non è Pages, è Actions.
//
// Su iPhone la notifica arriva SOLO se l'app è stata aggiunta alla Home
// (iOS 16.4+): in Safari normale il push per le web app non esiste.
//
// Dove il browser supporta i Notification Triggers (Chrome su Android)
// programmiamo anche una notifica locale, che funziona senza server.

import { getState, updateState, salvaStatoSW } from "./storage.js";

// Sostituire con la propria chiave pubblica VAPID (vedi README-notifiche.md).
const VAPID_PUBLIC_KEY = "";

function supportate() {
  return "Notification" in window && "serviceWorker" in navigator;
}

function statoPermesso() {
  if (!supportate()) return "non-supportate";
  return Notification.permission; // "default" | "granted" | "denied"
}

function base64UrlToUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function chiediPermesso() {
  if (!supportate()) return "non-supportate";
  const esito = await Notification.requestPermission();
  updateState((s) => { s.programma.notificheAttive = esito === "granted"; });
  if (esito === "granted") {
    await sincronizzaStato();
    await programmaLocale();
  }
  return esito;
}

// Mette in IndexedDB l'ultima data completata: il service worker non può
// leggere localStorage, quindi senza questo non saprebbe se tacere.
async function sincronizzaStato() {
  const s = getState();
  await salvaStatoSW({
    ultimaSessione: s.streak.ultimaDataCompletata,
    oraPromemoria: s.programma.oraPromemoria,
  });
}

async function iscriviPush() {
  if (!VAPID_PUBLIC_KEY) {
    return { ok: false, motivo: "chiave-vapid-mancante" };
  }
  const reg = await navigator.serviceWorker.ready;
  const esistente = await reg.pushManager.getSubscription();
  const sub = esistente || await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToUint8Array(VAPID_PUBLIC_KEY),
  });
  return { ok: true, iscrizione: sub.toJSON() };
}

// Notifica locale programmata: niente server, ma supporto limitato.
async function programmaLocale() {
  try {
    const reg = await navigator.serviceWorker.ready;
    if (!("showTrigger" in Notification.prototype)) return false;
    const { TimestampTrigger } = window;
    if (!TimestampTrigger) return false;

    const [h, m] = getState().programma.oraPromemoria.split(":").map(Number);
    const quando = new Date();
    quando.setHours(h, m, 0, 0);
    if (quando <= new Date()) quando.setDate(quando.getDate() + 1);

    await reg.showNotification("Mobilità", {
      body: "Non hai ancora fatto la sessione di oggi. Bastano pochi minuti.",
      tag: "promemoria-giornaliero",
      showTrigger: new TimestampTrigger(quando.getTime()),
      data: { url: "./index.html" },
    });
    return true;
  } catch {
    return false;
  }
}

async function provaNotifica() {
  if (statoPermesso() !== "granted") return false;
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification("Mobilità", {
    body: "Così ti arriverà il promemoria serale.",
    tag: "prova",
    data: { url: "./index.html" },
  });
  return true;
}

export {
  supportate, statoPermesso, chiediPermesso, iscriviPush,
  programmaLocale, provaNotifica, sincronizzaStato, VAPID_PUBLIC_KEY,
};
