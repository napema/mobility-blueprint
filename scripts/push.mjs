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

// PERCHÉ NON UNA FINESTRA DI 15 MINUTI.
// Il cron dice */15, ma GitHub esegue gli scheduled workflow quando può:
// misurato su questo repo, gli intervalli reali stanno fra 22 e 46
// minuti. Una finestra di 15' è più stretta dell'intervallo effettivo,
// quindi la maggior parte degli orari cade in un buco fra due run e non
// scatta mai.
//
// Regola giusta: "è passata l'ora E oggi non l'ho ancora mandata".
// Non serve che il run cada in un istante preciso — basta che avvenga.
// Il "già mandata" sta in un file nel repo dei dati, perché fra un run
// e l'altro non sopravvive niente.
const RITARDO_MAX_MIN = 180; // oltre 3 ore è tardi: meglio tacere che svegliarti

function orarioPassato(hhmm) {
  if (!hhmm) return false;
  const [h, m] = String(hhmm).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const ritardo = minutiOra - (h * 60 + m);
  return ritardo >= 0 && ritardo <= RITARDO_MAX_MIN;
}

const URL_STATO = DATI_REPO
  ? `https://api.github.com/repos/${DATI_REPO}/contents/notifiche-stato.json`
  : null;
const intestazioni = () => ({
  Authorization: `Bearer ${DATI_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

async function leggiStatoInvii() {
  if (!URL_STATO || !DATI_TOKEN) return { dati: {}, sha: null };
  try {
    const res = await fetch(URL_STATO, { headers: intestazioni(), cache: "no-store" });
    if (res.status === 404) return { dati: {}, sha: null };
    if (!res.ok) return { dati: {}, sha: null };
    const j = await res.json();
    return { dati: JSON.parse(Buffer.from(j.content, "base64").toString("utf8")), sha: j.sha };
  } catch {
    return { dati: {}, sha: null };
  }
}

async function segnaInviata(stato, tag, oggi) {
  if (!URL_STATO || !DATI_TOKEN) return;
  const nuovo = { ...stato.dati, [tag]: oggi };
  const corpo = {
    message: `notifica ${tag} ${oggi}`,
    content: Buffer.from(JSON.stringify(nuovo, null, 2)).toString("base64"),
  };
  if (stato.sha) corpo.sha = stato.sha;
  try {
    await fetch(URL_STATO, { method: "PUT", headers: intestazioni(), body: JSON.stringify(corpo) });
  } catch (e) {
    avviso(`Inviata ma non registrata (${e.message}): potrebbe ripartire al prossimo run.`);
  }
}

const cfg = await leggiImpostazioni();
console.log(`Ora di Roma: ${oraRoma} (${giornoRoma}). Orari configurati:`, JSON.stringify(cfg));

let msg = null;

// iOS aggiunge da sé la riga "from <nome app>": è attribuzione della
// fonte e non si disattiva. Quindi il titolo NON ripete il nome né
// annuncia la categoria — porta l'informazione vera, perché è la riga
// più visibile delle tre.
const oggiRoma = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" }); // AAAA-MM-GG
const stato = await leggiStatoInvii();
const giaInviata = (tag) => stato.dati[tag] === oggiRoma;

const candidati = [
  { tag: "principale", attiva: true, ora: cfg.principale,
    title: "🏃 Hai corso oggi?", body: "Dimmelo e ti apro la sessione giusta." },
  // Il recupero propone la dose minima, non la sessione intera: a
  // quell'ora proporre 20 minuti significa farla ignorare.
  { tag: "recupero", attiva: cfg.attivaRecupero, ora: cfg.recupero,
    title: "⏱️ Bastano due minuti", body: "Collo più un allungamento, e la giornata è salva." },
  { tag: "palestra", attiva: cfg.attivaPalestra && giornoIdx === cfg.giornoPalestra, ora: cfg.palestra,
    title: "🏋️ Oggi è il giorno di palestra", body: "Loaded mobility: carichi, non varietà." },
  { tag: "settimanale", attiva: cfg.attivaSettimanale && giornoIdx === 6, ora: cfg.settimanale,
    title: "📊 Com'è andata la settimana", body: "Guarda quali gruppi sono rimasti sotto soglia." },
];

const scelto = candidati.find((c) => c.attiva && orarioPassato(c.ora) && !giaInviata(c.tag));
if (scelto) {
  msg = { title: scelto.title, body: scelto.body, tag: scelto.tag, url: "./index.html" };
}

if (!msg && FORZA === "1") {
  msg = { title: "✅ Le notifiche funzionano", body: "Questo è l'aspetto che avranno.", tag: "prova", url: "./index.html" };
}

if (!msg) {
  const stati = candidati
    .filter((c) => c.attiva)
    .map((c) => `${c.tag} ${c.ora}${giaInviata(c.tag) ? " già inviata" : orarioPassato(c.ora) ? " ?" : " non ancora"}`)
    .join(" · ");
  console.log(`::notice::Alle ${oraRoma} non c'è nulla da mandare. Stato: ${stati}`);
  process.exit(0);
}

try {
  await webpush.sendNotification(sub, JSON.stringify(msg));
  console.log(`::notice::Inviata: ${msg.tag} — "${msg.title}"`);
  // Registrata subito: è quello che impedisce di rimandarla a ogni run
  // successivo, visto che l'orario resta "passato" per ore.
  if (msg.tag !== "prova") await segnaInviata(stato, msg.tag, oggiRoma);
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
