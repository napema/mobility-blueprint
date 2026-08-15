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

const SYNC = { busy: false, sha: null, pendingRender: false, timer: null, stato: "off", messaggio: "" };
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
    records: (st.storicoSessioni || []).map((s) => ({ ...s, id: idSessione(s), up: s.up || 0 })),
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
  const rec = [...(p.records || [])]
    .map((r) => ({ ...r }))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return JSON.stringify({ records: rec, meta: p.meta, metaUp: p.metaUp });
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
    s.storicoSessioni = sessioniVive(potaLapidi(p.records));
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
    } else if (res.status === 404) {
      SYNC.sha = null; // primo avvio: il file non esiste ancora
    } else {
      throw new Error(`HTTP ${res.status}`);
    }

    const prima = snapshot(payload());

    if (remote) {
      const locale = payload();
      const uniti = potaLapidi(mergeRecords(locale.records, remote.records));
      applicaInLocale({
        records: uniti,
        meta: remote.meta || locale.meta,
        metaUp: remote.metaUp || 0,
      });
    }

    const dopo = snapshot(payload());
    if (dopo !== prima) scheduleRender();
    if (dopo !== snapshot(remote)) await push();

    SYNC.ultimo = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    setSyncState("ok");
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

function initSync(onRender) {
  renderCb = onRender || (() => {});
  if (!configurato()) { setSyncState("off"); return; }
  syncNow();
  setInterval(syncNow, INTERVALLO_MS);
  window.addEventListener("focus", syncNow);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) syncNow(); });
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
  svuotaCacheERicarica, configurato, SYNC,
};
