// push.mjs — invia i promemoria. Girato ogni 15 minuti dal workflow.
//
// Perché ogni 15 minuti e non a orari fissi: il cron di GitHub è in UTC,
// non conosce l'ora legale, e slitta di parecchio sotto carico. Girando
// spesso e decidendo QUI sull'ora di Roma, il cambio di marzo e ottobre
// si gestisce da solo e l'orario scelto viene rispettato entro ~15'.
//
// Gli orari NON sono nel codice: si leggono da dati.json nel repo dei
// dati, che è quello che l'app scrive. Così si cambiano dall'app e non
// serve toccare il workflow.

import webpush from "web-push";
import crypto from "node:crypto";

const {
  VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION,
  DATI_TOKEN, DATI_REPO, FORZA,
} = process.env;

// `::error::` fa comparire il messaggio nel riquadro Annotations della
// pagina del run: senza, si legge solo "exit code 1" e il motivo resta
// sepolto nel log, da aprire a mano.
const errore = (m) => console.log(`::error::${m}`);
const avviso = (m) => console.log(`::warning::${m}`);

// Un run verde che non ha inviato niente è peggio di un run rosso:
// sembra che funzioni. Se manca un secret, si fallisce e si vede.
const mancanti = [];
if (!VAPID_PUBLIC_KEY) mancanti.push("VAPID_PUBLIC_KEY");
if (!VAPID_PRIVATE_KEY) mancanti.push("VAPID_PRIVATE_KEY");
if (!PUSH_SUBSCRIPTION) mancanti.push("PUSH_SUBSCRIPTION");

// Diagnostica di cosa c'è e cosa no, senza mai stampare i valori.
console.log("Secret presenti:", [
  `VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY ? "sì" : "NO"}`,
  `VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY ? "sì" : "NO"}`,
  `PUSH_SUBSCRIPTION=${PUSH_SUBSCRIPTION ? "sì" : "NO"}`,
  `VAPID_SUBJECT=${VAPID_SUBJECT ? "sì" : "no (uso il predefinito)"}`,
  `DATI_TOKEN=${DATI_TOKEN ? "sì" : "no (uso gli orari predefiniti)"}`,
].join(" · "));

if (mancanti.length) {
  errore(`Secret mancanti: ${mancanti.join(", ")} — senza questi non parte nessuna notifica. Istruzioni in ATTIVA-NOTIFICHE.md.`);
  process.exit(1);
}

// La pubblica si può RICAVARE dalla privata: se non coincide con quella
// configurata, le due chiavi vengono da generazioni diverse. È l'unico
// modo di distinguere "chiavi sbagliate" da "iscrizione vecchia", che
// dal 403 sembrano lo stesso problema.
try {
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.setPrivateKey(Buffer.from(VAPID_PRIVATE_KEY, "base64url"));
  const derivata = ecdh.getPublicKey().toString("base64url");
  if (derivata !== VAPID_PUBLIC_KEY.replace(/=+$/, "")) {
    errore(
      "VAPID_PRIVATE_KEY non corrisponde a VAPID_PUBLIC_KEY: vengono da due generazioni diverse. " +
      "Usa le due righe dello STESSO lancio, e la pubblica dev'essere identica a config.js → vapidPublic."
    );
    process.exit(1);
  }
  console.log("Coppia VAPID coerente: la pubblica deriva dalla privata.");
} catch (e) {
  avviso(`Non ho potuto verificare la coppia VAPID (${e.message}): proseguo comunque.`);
}

webpush.setVapidDetails(VAPID_SUBJECT || "mailto:napema03@icloud.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

let sub;
try {
  sub = JSON.parse(PUSH_SUBSCRIPTION);
  if (!sub.endpoint) throw new Error("manca il campo endpoint");
} catch (e) {
  errore(`PUSH_SUBSCRIPTION non è valido (${e.message}). Deve iniziare con {"endpoint": e stare tutto su una riga.`);
  process.exit(1);
}

// Il telefono si iscrive con la chiave pubblica di config.js: se qui ne
// arriva un'altra, l'invio fallisce con 403 e sembra un problema del
// telefono. Meglio dirlo prima.
if (sub.endpoint.includes("web.push.apple.com")) {
  console.log("Endpoint Apple: la PWA risulta installata dalla Home. Bene.");
}

// ---------- orari scelti dall'utente, letti dal repo dei dati ----------

const PREDEFINITI = {
  principale: "21:15",
  recupero: "22:15",
  palestra: "17:15",
  settimanale: "19:00",
  attivaRecupero: true,
  attivaPalestra: true,
  attivaSettimanale: true,
  giornoPalestra: 2, // 0 = lunedì
};

async function leggiImpostazioni() {
  if (!DATI_TOKEN || !DATI_REPO) {
    console.log("DATI_TOKEN/DATI_REPO non impostati: uso gli orari predefiniti.");
    return PREDEFINITI;
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${DATI_REPO}/contents/dati.json`, {
      headers: {
        Authorization: `Bearer ${DATI_TOKEN}`,
        Accept: "application/vnd.github.raw",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) {
      console.log(`dati.json non leggibile (HTTP ${res.status}): uso i predefiniti.`);
      return PREDEFINITI;
    }
    const dati = JSON.parse(await res.text());
    const p = dati?.meta?.programma || {};
    return { ...PREDEFINITI, ...(p.notifiche || {}), giornoPalestra: p.giornoPalestra ?? PREDEFINITI.giornoPalestra };
  } catch (e) {
    console.log("Errore leggendo dati.json:", e.message, "— uso i predefiniti.");
    return PREDEFINITI;
  }
}

// ---------- ora di Roma ----------

const oraRoma = new Date().toLocaleString("en-GB", {
  timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", hour12: false,
});
const [hNow, mNow] = oraRoma.split(":").map(Number);
const minutiOra = hNow * 60 + mNow;

const giornoRoma = new Date().toLocaleString("en-US", { timeZone: "Europe/Rome", weekday: "short" });
const INDICE_GIORNO = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
const giornoIdx = INDICE_GIORNO[giornoRoma];

// Il cron gira ogni 15': una notifica è "dovuta" se il suo orario cade
// nella finestra appena trascorsa. Mezz'ora di tolleranza sarebbe troppa
// (doppioni), meno di 15' rischierebbe di saltarla se il cron slitta.
const FINESTRA = 15;
function dovuta(hhmm) {
  if (!hhmm) return false;
  const [h, m] = String(hhmm).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const diff = minutiOra - (h * 60 + m);
  return diff >= 0 && diff < FINESTRA;
}

const cfg = await leggiImpostazioni();
console.log(`Ora di Roma: ${oraRoma} (${giornoRoma}). Orari configurati:`, JSON.stringify(cfg));

let msg = null;

if (dovuta(cfg.principale)) {
  msg = { title: "Sessione di stasera", body: "Hai corso oggi?", tag: "principale", url: "./index.html" };
} else if (cfg.attivaRecupero && dovuta(cfg.recupero)) {
  // Il recupero propone la dose minima, non la sessione intera: a
  // quell'ora proporre 20 minuti significa farla ignorare.
  msg = { title: "Due minuti", body: "Collo + un allungamento. Non serve altro.", tag: "recupero", url: "./index.html" };
} else if (cfg.attivaPalestra && giornoIdx === cfg.giornoPalestra && dovuta(cfg.palestra)) {
  msg = { title: "Loaded mobility", body: "Oggi è il giorno di palestra.", tag: "palestra", url: "./index.html" };
} else if (cfg.attivaSettimanale && giornoIdx === 6 && dovuta(cfg.settimanale)) {
  msg = { title: "Riepilogo settimana", body: "Guarda dove sei rimasto sotto soglia.", tag: "settimanale", url: "./index.html" };
}

if (!msg && FORZA === "1") {
  msg = { title: "Prova", body: "Il canale delle notifiche funziona.", tag: "prova", url: "./index.html" };
}

if (!msg) {
  console.log(`::notice::Nessuna notifica dovuta alle ${oraRoma}. Tutto a posto: era solo fuori orario. Per provare subito, rilancia con forza=1.`);
  process.exit(0);
}

try {
  await webpush.sendNotification(sub, JSON.stringify(msg));
  console.log(`::notice::Inviata: ${msg.tag} — "${msg.title}"`);
} catch (e) {
  const codice = e.statusCode;
  let spiegazione = e.body || e.message;
  if (codice === 410 || codice === 404) {
    spiegazione = "Subscription scaduta o non più valida. Riattiva le notifiche dall'app (aperta dall'icona sulla Home) e aggiorna il secret PUSH_SUBSCRIPTION.";
  } else if (codice === 403) {
    spiegazione = "Chiavi VAPID non corrispondenti: VAPID_PUBLIC_KEY deve essere identica al campo vapidPublic di config.js, e la privata deve essere quella nata con lei.";
  } else if (codice === 400) {
    spiegazione = "Richiesta rifiutata dal servizio push: di solito è la subscription incollata male.";
  }
  errore(`Invio fallito (HTTP ${codice}). ${spiegazione}`);
  process.exit(1);
}
