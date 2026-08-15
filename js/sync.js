// sync.js — sincronizzazione via GitHub Contents API.
//
// Il sito è statico: i dati stanno in un solo file JSON dentro un repo
// PRIVATO, letto e scritto dal browser. localStorage resta la copia
// locale che fa funzionare tutto offline; GitHub è la fonte condivisa
// tra dispositivi. Nessun backend, nessun database.
//
// Ciclo unico, riusato ovunque: GET → merge → salva in locale → PUT.

import { getState, updateState } from "./storage.js";

const CFG = (() => {
  const c = window.APP_CFG || {};
  let token = "";
  if (c.t1 && c.t2 && c.t3) {
    try { token = atob(String(c.t1) + String(c.t2) + String(c.t3)); } catch { token = ""; }
  }
  return { owner: c.owner, repo: c.repo, path: c.path, branch: c.branch || "main", token };
})();

const SYNC = { busy: false, sha: null, pullFatto: false, pendingRender: false, timer: null, poll: null, stato: "off", messaggio: "" };
const INTERVALLO_MS = 20000;
const DEBOUNCE_MS = 1500;
const GIORNI_LAPIDE = 90;

const configurato = () => Boolean(CFG.token && CFG.owner && CFG.repo);
const apiURL = () => `https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/${CFG.path}`;
const hdr = () => ({
  Authorization: `Bearer ${CFG.token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

// btoa da solo esplode sugli accenti: serve il giro via UTF-8.
const b64enc = (s) => btoa(unescape(encodeURIComponent(s)));
const b64dec = (s) => decodeURIComponent(escape(atob(s.replace(/\n/g, ""))));

// ===================== modello dati =====================
//
// I record sono le sessioni: hanno id stabile e `up` (ultima modifica),
// e si fondono per record — due dispositivi che scrivono sessioni
// diverse non si sovrascrivono a vicenda.
// La configurazione (assessment, programma, streak) non ha bisogno del
// merge per record: un solo timestamp `metaUp`, vince il più recente.

function idSessione(s) {
  return s.id || `${s.data}|${s.tipo}`;
}

function payload() {
  const st = getState();
  return {
    // Sessioni vive + lapidi: le lapidi devono viaggiare, altrimenti
    // l'altro dispositivo non sa che quel record è stato cancellato.
    records: [
      ...(st.storicoSessioni || []).map((s) => ({ ...s, id: idSessione(s), up: s.up || 0 })),
      ...(st.lapidi || []),
    ],
    // I riferimenti alle foto viaggiano qui; i file veri stanno in
    // foto/<id>.jpg nello stesso repo (vedi foto-sync.js).
    // `caricata` è un dettaglio locale: non deve entrare nel confronto,
    // altrimenti due dispositivi si rimbalzano PUT a vicenda per sempre.
    foto: (st.foto || []).map(({ caricata, ...f }) => f),
    meta: {
      assessment: st.assessment,
      programma: st.programma,
      streak: st.streak,
    },
    metaUp: st.metaUp || 0,
  };
}

// Normalizza prima di confrontare: senza, ogni ciclo vede una differenza
// fantasma e fa una PUT inutile — un commit ogni 20 secondi, per sempre.
function snapshot(p) {
  if (!p) return "";
  const ordina = (arr) => [...(arr || [])]
    .map(({ caricata, ...r }) => r)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return JSON.stringify({
    records: ordina(p.records),
    foto: ordina(p.foto),
    meta: p.meta,
    metaUp: p.metaUp,
  });
}

function mergeRecords(local, remote) {
  const map = new Map();
  for (const r of [...(remote || []), ...(local || [])]) { // il locale passa per ultimo
    if (!r || !r.id) continue;
    const ex = map.get(r.id);
    if (!ex || (r.up || 0) > (ex.up || 0)) map.set(r.id, r);
  }
  return [...map.values()];
}

// Le lapidi vecchie si potano, altrimenti il file cresce per sempre.
function potaLapidi(records) {
  const limite = Date.now() - GIORNI_LAPIDE * 86400000;
  return records.filter((r) => !(r.del && (r.up || 0) < limite));
}

// Tutte le viste leggono le sessioni vive, mai l'array grezzo.
function sessioniVive(records) {
  return (records || []).filter((r) => !r.del);
}

function applicaInLocale(p) {
  updateState((s) => {
    const tutti = potaLapidi(p.records);
    s.storicoSessioni = tutti.filter((r) => !r.del);
    s.lapidi = tutti.filter((r) => r.del);   // conservate, non buttate
    // Il flag `caricata` è locale: si conserva per non ricaricare file
    // che questo dispositivo ha già messo sul repo.
    const giaCaricate = new Set((s.foto || []).filter((f) => f.caricata).map((f) => f.id));
    s.foto = potaLapidi(p.foto || []).map((f) => ({ ...f, caricata: giaCaricate.has(f.id) }));

    // Salvaguardia sul dato che costa di più rifare: un assessment
    // completato non viene mai perso a favore di uno vuoto, qualunque
    // cosa dicano i timestamp. Vale in entrambe le direzioni.
    // La salvaguardia vale solo per un dispositivo che non ha MAI
    // scritto (metaUp a zero): è lì che lo stato vuoto è un caso da
    // proteggere. Se invece hai azzerato apposta, metaUp è recente e
    // l'azzeramento deve poter viaggiare.
    const remotoHaAssessment = Boolean(p.meta?.assessment?.completato);
    const localeHaAssessment = Boolean(s.assessment?.completato);
    const localeMaiScritto = !(s.metaUp > 0);
    if (remotoHaAssessment && !localeHaAssessment && localeMaiScritto) {
      s.assessment = p.meta.assessment;
      if (p.meta.programma) s.programma = p.meta.programma;
      if (p.meta.streak) s.streak = p.meta.streak;
      s.metaUp = Math.max(p.metaUp || 0, s.metaUp || 0);
      return;
    }
    if (localeHaAssessment && !remotoHaAssessment) return; // il locale è più ricco: non toccarlo

    if ((p.metaUp || 0) > (s.metaUp || 0)) {
      if (p.meta.assessment) s.assessment = p.meta.assessment;
      if (p.meta.programma) s.programma = p.meta.programma;
      if (p.meta.streak) s.streak = p.meta.streak;
      s.metaUp = p.metaUp;
    }
  });
}

// ===================== stato visibile =====================

function setSyncState(stato, messaggio = "") {
  SYNC.stato = stato;
  SYNC.messaggio = messaggio;
  const titolo = messaggio || {
    off: "Sync non configurato",
    ok: "Sincronizzato",
    corso: "Sincronizzazione in corso",
    err: "Errore di sincronizzazione",
  }[stato] || "";
  for (const dot of document.querySelectorAll(".sync-dot")) {
    dot.className = `sync-dot is-${stato}`;
    dot.title = titolo;
  }
  const testo = document.getElementById("sync-stato");
  if (testo) {
    testo.textContent = {
      off: "Non configurato: i dati restano solo su questo dispositivo.",
      ok: `Sincronizzato${SYNC.ultimo ? ` alle ${SYNC.ultimo}` : ""}.`,
      corso: "Sincronizzazione in corso…",
      err: `Errore: ${messaggio}`,
    }[stato] || "";
  }
}

// Il sync non deve MAI ridisegnare l'interfaccia sotto le dita: i dati
// arrivano sempre, il ridisegno aspetta.
function uiBusy() {
  const a = document.activeElement;
  const scrive = a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA");
  const overlay = [...document.querySelectorAll(".view-overlay")].some((v) => !v.hidden);
  return Boolean(scrive || overlay);
}

let renderCb = () => {};
function scheduleRender() {
  if (uiBusy()) SYNC.pendingRender = true;
  else { SYNC.pendingRender = false; renderCb(); }
}

function renderSeInSospeso() {
  if (SYNC.pendingRender && !uiBusy()) { SYNC.pendingRender = false; renderCb(); }
}

// ===================== il ciclo =====================

async function push() {
  // Un dispositivo che non ha ancora LETTO non deve poter SCRIVERE.
  // Senza questa regola uno stato locale vuoto (primo avvio, cache
  // svuotata, dati azzerati) sovrascrive i dati buoni sul repo: è
  // successo davvero, e ha cancellato un assessment.
  if (!SYNC.pullFatto) return;
  const p = payload();
  const corpo = {
    message: `dati ${new Date().toISOString()}`,
    content: b64enc(JSON.stringify(p, null, 2)),
    branch: CFG.branch,
  };
  if (SYNC.sha) corpo.sha = SYNC.sha;

  const res = await fetch(apiURL(), { method: "PUT", headers: hdr(), body: JSON.stringify(corpo) });
  if (res.status === 409 || res.status === 422) {
    // sha vecchio: azzera e lascia che sia il giro dopo a rifare GET → merge → PUT.
    SYNC.sha = null;
    throw new Error("conflitto, riprovo al prossimo giro");
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  SYNC.sha = j.content?.sha || null;
}

async function syncNow() {
  if (!configurato() || SYNC.busy) return;
  SYNC.busy = true;
  setSyncState("corso");
  try {
    let remote = null;
    const res = await fetch(`${apiURL()}?ref=${encodeURIComponent(CFG.branch)}`, { headers: hdr(), cache: "no-store" });
    if (res.status === 200) {
      const j = await res.json();
      SYNC.sha = j.sha;
      remote = JSON.parse(b64dec(j.content));
      SYNC.pullFatto = true;
    } else if (res.status === 404) {
      SYNC.sha = null;        // primo avvio: il file non esiste ancora
      SYNC.pullFatto = true;  // abbiamo comunque letto: non c'è nulla da perdere
    } else {
      throw new Error(`HTTP ${res.status}`);
    }

    const prima = snapshot(payload());

    if (remote) {
      const locale = payload();
      applicaInLocale({
        records: potaLapidi(mergeRecords(locale.records, remote.records)),
        foto: potaLapidi(mergeRecords(locale.foto, remote.foto)),
        meta: remote.meta || locale.meta,
        metaUp: remote.metaUp || 0,
      });
    }

    const dopo = snapshot(payload());
    if (dopo !== prima) scheduleRender();
    if (dopo !== snapshot(remote)) await push();

    SYNC.ultimo = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    setSyncState("ok");

    // Le foto viaggiano a parte: sono file, non righe di JSON.
    import("./foto-sync.js").then((m) => m.sincronizzaFoto()).catch(() => {});
  } catch (e) {
    setSyncState("err", e.message);
  } finally {
    SYNC.busy = false;
  }
}

// Debounce dopo ogni modifica locale: evita una PUT per ogni tasto.
function segnalaModifica() {
  if (!configurato()) return;
  updateState((s) => { s.metaUp = Date.now(); });
  clearTimeout(SYNC.timer);
  SYNC.timer = setTimeout(syncNow, DEBOUNCE_MS);
}

// Cancellare non cancella: sostituisce con una lapide, altrimenti il
// record tornerebbe a vivere al primo merge con l'altro dispositivo.
function cancellaSessione(id) {
  updateState((s) => {
    s.storicoSessioni = s.storicoSessioni.filter((x) => idSessione(x) !== id);
    s.storicoSessioni.push({ id, del: true, up: Date.now() });
    s.metaUp = Date.now();
  });
  segnalaModifica();
}

// Promessa risolta dopo il PRIMO giro di sync. Serve a chi deve decidere
// qualcosa sullo stato: su un dispositivo nuovo lo stato locale è vuoto,
// e leggerlo prima che i dati arrivino porta a conclusioni sbagliate
// (per esempio: "l'assessment non è stato fatto").
let risolviPrimo;
const primoSync = new Promise((r) => { risolviPrimo = r; });

function primoSyncCompletato(timeoutMs = 5000) {
  // Il timeout evita che una rete lenta blocchi l'avvio dell'app.
  return Promise.race([primoSync, new Promise((r) => setTimeout(r, timeoutMs))]);
}

function initSync(onRender) {
  renderCb = onRender || (() => {});
  if (!configurato()) { setSyncState("off"); risolviPrimo(); return; }

  syncNow().finally(() => risolviPrimo());

  // Polling solo quando l'app è davvero visibile: in background il
  // timer verrebbe comunque sospeso dal sistema, e tenerlo acceso
  // consuma batteria senza sincronizzare niente.
  clearInterval(SYNC.poll);
  SYNC.poll = setInterval(() => { if (!document.hidden) syncNow(); }, INTERVALLO_MS);

  // I momenti in cui serve un sync IMMEDIATO, senza aspettare il giro:
  // sono quelli in cui l'utente torna sull'app dopo aver fatto qualcosa
  // altrove, ed è lì che il ritardo si nota.
  const subito = () => { if (!document.hidden) syncNow(); };
  window.addEventListener("focus", subito);
  document.addEventListener("visibilitychange", subito);
  window.addEventListener("pageshow", subito);   // ritorno dalla cache di iOS
  window.addEventListener("online", subito);     // rete tornata
}

// Unica via d'uscita quando una versione vecchia resta incastrata.
async function svuotaCacheERicarica() {
  try {
    const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(regs.map((r) => r.unregister()));
    const chiavi = await caches.keys();
    await Promise.all(chiavi.map((k) => caches.delete(k)));
  } catch { /* si ricarica comunque */ }
  location.reload(true);
}

export {
  initSync, syncNow, segnalaModifica, cancellaSessione, renderSeInSospeso,
  svuotaCacheERicarica, configurato, primoSyncCompletato, SYNC,
};
