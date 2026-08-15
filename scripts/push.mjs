// push.mjs — invia il promemoria. Girato ogni ora dal workflow.
//
// Perché ogni ora invece di quattro cron precisi: il cron di GitHub è in
// UTC e non conosce l'ora legale. Girando ogni ora e decidendo QUI
// sull'ora di Roma, il cambio di marzo e ottobre si gestisce da solo.
//
// Massimo 2 notifiche al giorno: è il vincolo più importante. Oltre, si
// disattivano — e con loro se ne va tutto il sistema.

import webpush from "web-push";

const { VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION, FORZA } = process.env;

if (!VAPID_PRIVATE_KEY || !PUSH_SUBSCRIPTION) {
  console.log("Secrets mancanti (VAPID_PRIVATE_KEY o PUSH_SUBSCRIPTION): niente da inviare.");
  process.exit(0);
}

webpush.setVapidDetails(
  VAPID_SUBJECT || "mailto:napema03@icloud.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const sub = JSON.parse(PUSH_SUBSCRIPTION);

const ora = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", hour12: false });
const h = parseInt(ora, 10);
const giorno = new Date().toLocaleString("en-US", { timeZone: "Europe/Rome", weekday: "short" });

// Gli orari vengono dalla giornata dell'utente (sveglia 06:45, rientro
// 17:10), non dai paper: sulla programmazione delle notifiche i paper
// non dicono niente. Niente notifiche al mattino.
let msg = null;

if (h === 21) {
  msg = { title: "Sessione di stasera", body: "Hai corso oggi?", tag: "principale", url: "./index.html" };
}
if (h === 22) {
  // Il recupero propone la dose minima, non la sessione intera: alle
  // 22:15 proporre 20 minuti significa farla ignorare.
  msg = { title: "Due minuti", body: "Collo + un allungamento. Non serve altro.", tag: "recupero", url: "./index.html" };
}
if (h === 17 && giorno === "Wed") {
  msg = { title: "Loaded mobility", body: "Oggi è il giorno di palestra.", tag: "palestra", url: "./index.html" };
}
if (h === 19 && giorno === "Sun") {
  msg = { title: "Riepilogo settimana", body: "Guarda dove sei rimasto sotto soglia.", tag: "settimanale", url: "./index.html" };
}

// Per provare fuori orario: lancia il workflow con FORZA=1.
if (!msg && FORZA === "1") {
  msg = { title: "Prova", body: "Il canale delle notifiche funziona.", tag: "prova", url: "./index.html" };
}

if (!msg) {
  console.log(`Ora ${h} (${giorno}) — niente da inviare.`);
  process.exit(0);
}

try {
  await webpush.sendNotification(sub, JSON.stringify(msg));
  console.log("Inviata:", msg.tag);
} catch (e) {
  console.error("Errore", e.statusCode, e.body);
  if (e.statusCode === 410) {
    console.error("Subscription scaduta: riattiva le notifiche dall'app e aggiorna il secret PUSH_SUBSCRIPTION.");
  }
  process.exit(1);
}
