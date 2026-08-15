// storage.js — persistenza locale (localStorage per stato, IndexedDB per le foto).
// Nessun contenuto reale ancora: solo la forma dello stato e le funzioni di accesso.

const LS_KEY = "mobilita.state.v1";

const DEFAULT_STATE = {
  assessment: {
    completato: false,
    // Test 1 — muscolo o nervo? (SPEC §4)
    esitoTest1: {
      variante1Cm: null,
      variante2Cm: null,
      variante3Cm: null,
      esito: null,           // "neurale" | "muscolare" | null
    },
    // Test 2 — sette test di lateralizzazione, portati da asimmetria-bacino-protocollo.html
    esitoTest2: {
      risposte: [null, null, null, null, null, null, null], // "sx" | "dx" per test, indice 0-6
      latoLateralizzato: null, // "sx" | "dx" | null
      punteggio: null,         // quanti dei 7 test votano per latoLateralizzato
      doppioTwist: false,
      latoSopra: null,         // "sx" | "dx" | null — solo se doppioTwist
      latoSotto: null,         // "sx" | "dx" | null — solo se doppioTwist
    },
    // Test 3 — baseline fotografica + misure grezze dei 5 bersagli
    baselineTest3: {
      bersagli: {
        "deep-squat": { misure: { profonditaLivello: null, talloniATerra: null }, fotoData: null },
        "pike": { misure: { distanzaDitaPavimentoCm: null }, fotoData: null },
        "overhead-shoulder": { misure: { distanzaPolsoMuroCm: null, lombarePiatta: null }, fotoData: null },
        "farfalla": { misure: { altezzaGinocchioSxCm: null, altezzaGinocchioDxCm: null }, fotoData: null },
        "collo": { misure: { angoloDxGradi: null, angoloSxGradi: null }, fotoData: null },
      },
      completatoIl: null,
    },
  },
  programma: {
    blocco: 0,                    // 0..3
    settimana: 0,
    settimanaIniziataIl: null,    // data ISO (solo giorno) di inizio della settimana corrente
    inizioProgramma: null,        // data ISO del primo giorno: da qui si contano le settimane
    videoVistiObbligatori: [],    // esercizi già introdotti almeno una volta
    avvisoColloMostrato: false,   // filtro di sicurezza collo, mostrato una sola volta
    // Regola 3: un solo aggancio, sempre lo stesso. Lo propone l'app.
    aggancio: "Subito dopo la doccia serale",
    notificheAttive: false,
    giornoPalestra: 2,            // 0 = lunedì … 6 = domenica (mercoledì)
    // Orari dei promemoria. Li legge il workflow dal repo dei dati:
    // cambiarli qui li cambia davvero, senza toccare il codice.
    notifiche: {
      principale: "21:15",        // "hai corso oggi?"
      recupero: "22:15",          // propone la dose da 2 minuti
      palestra: "17:15",          // solo il giorno di palestra
      settimanale: "19:00",       // domenica, riepilogo
      attivaRecupero: true,
      attivaPalestra: true,
      attivaSettimanale: true,
    },
  },
  // Cosa è successo oggi: serve solo per la giornata corrente, non è storico.
  giornoCorrente: { data: null, haCorso: false, forza: null },
  // Sessione lasciata a metà: permette di riprendere da dove si era.
  sessioneInCorso: null,   // { tipo, indice, secondiResidui, data, salvataIl }
  // Foto dei bersagli: qui stanno solo i riferimenti, i file stanno nel
  // repo dei dati e i blob in IndexedDB.
  foto: [],                // [{ id, up, bersaglioId, data, path, del? }]
  // Lapidi delle sessioni cancellate. Devono sopravvivere in locale:
  // se si perdono, al primo sync il repo rimanda indietro i record e la
  // cancellazione si annulla da sola.
  lapidi: [],              // [{ id, del: true, up }]
  // Timestamp dell'ultima modifica alla configurazione: il sync lo usa
  // per decidere quale versione vince (last-write-wins in blocco).
  metaUp: 0,
  storicoSessioni: [],       // [{ data, tipo: "reset+micro"|"carico", durataSec, esercizi: [...] }]
  streak: {
    giorniConsecutivi: 0,
    ultimaDataCompletata: null,
  },
  volumePerGruppo: {},        // { [gruppoMuscolare]: secondiTotaliSettimanaCorrente }
};

// Fusione profonda: uno stato salvato da una versione precedente dell'app
// non deve cancellare i campi aggiunti dopo. Con una fusione superficiale
// un `programma` vecchio (solo blocco/settimana) sostituiva l'intero
// oggetto, lasciando i campi nuovi undefined e facendo fallire in silenzio
// chi li usava. Gli array vengono sostituiti, non uniti.
function mergeProfondo(base, salvato) {
  const out = { ...base };
  for (const [chiave, valore] of Object.entries(salvato ?? {})) {
    const attuale = base[chiave];
    const entrambiOggetti =
      valore && typeof valore === "object" && !Array.isArray(valore) &&
      attuale && typeof attuale === "object" && !Array.isArray(attuale);
    out[chiave] = entrambiOggetti ? mergeProfondo(attuale, valore) : valore;
  }
  return out;
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return mergeProfondo(structuredClone(DEFAULT_STATE), JSON.parse(raw));
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function getState() {
  return loadState();
}

function updateState(patchFn) {
  const state = loadState();
  patchFn(state);
  saveState(state);
  return state;
}

// --- IndexedDB: foto progressi (bersagli fotografici) ---

const IDB_NAME = "mobilita-foto";
const IDB_STORE = "foto";
const IDB_VERSION = 1;

function openFotoDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function salvaFoto({ bersaglioId, blob, data }) {
  const db = await openFotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).add({ bersaglioId, blob, data });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- foto con id esplicito: è quello che permette di riconoscerle tra
// dispositivi diversi (l'autoIncrement darebbe numeri scollegati) ---

async function salvaFotoBlob(id, blob) {
  const db = await openFotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put({ id, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function leggiFotoBlob(id) {
  const db = await openFotoDB();
  return new Promise((resolve) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const r = tx.objectStore(IDB_STORE).get(id);
    r.onsuccess = () => resolve(r.result?.blob || null);
    r.onerror = () => resolve(null);
  });
}

async function elencaIdFotoLocali() {
  const db = await openFotoDB();
  return new Promise((resolve) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const r = tx.objectStore(IDB_STORE).getAllKeys();
    r.onsuccess = () => resolve((r.result || []).map(String));
    r.onerror = () => resolve([]);
  });
}

async function elencaFoto(bersaglioId) {
  const db = await openFotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).getAll();
    req.onsuccess = () => {
      const tutte = req.result || [];
      resolve(bersaglioId ? tutte.filter((f) => f.bersaglioId === bersaglioId) : tutte);
    };
    req.onerror = () => reject(req.error);
  });
}

// --- IndexedDB: stato leggibile dal service worker ---
// Il service worker non ha accesso a localStorage. Per decidere se un
// promemoria serve davvero, gli lasciamo qui l'ultima data completata.

const IDB_STATO = "stato";

function openStatoDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("mobilita-stato", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STATO)) db.createObjectStore(IDB_STATO);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function salvaStatoSW(dati) {
  try {
    const db = await openStatoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STATO, "readwrite");
      tx.objectStore(IDB_STATO).put(dati, "corrente");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // se IndexedDB non è disponibile il promemoria resta comunque inviabile
  }
}

// Azzeramento completo: localStorage + tutti i database IndexedDB.
// Serve durante i test, e serve poter ripartire davvero da zero.
async function azzeraTutto() {
  localStorage.removeItem(LS_KEY);
  const nomi = ["mobilita-foto", "mobilita-stato"];
  await Promise.all(nomi.map((n) => new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(n);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  })));
}

// Azzera solo lo storico delle sessioni: utile dopo aver fatto prove,
// senza perdere l'assessment che è costato tempo.
//
// Ogni sessione cancellata lascia una LAPIDE: senza, il sync la
// rimanderebbe indietro al primo giro e la cancellazione si annullerebbe
// da sola (è esattamente quello che succedeva).
function azzeraStorico() {
  updateState((s) => {
    const ora = Date.now();
    const nuove = (s.storicoSessioni || []).map((x) => ({
      id: x.id || `${x.data}|${x.tipo}`, del: true, up: ora,
    }));
    s.lapidi = [...(s.lapidi || []), ...nuove];
    s.storicoSessioni = [];
    s.streak = { giorniConsecutivi: 0, ultimaDataCompletata: null };
    s.volumePerGruppo = {};
    s.programma.inizioProgramma = null;
    s.giornoCorrente = { data: null, haCorso: false, forza: null };
    s.sessioneInCorso = null;
    s.metaUp = ora;
  });
  // fa partire la spinta verso il repo, così sparisce anche dagli altri
  document.dispatchEvent(new CustomEvent("dati-cambiati"));
}

export {
  getState, updateState, salvaFoto, elencaFoto, salvaStatoSW,
  salvaFotoBlob, leggiFotoBlob, elencaIdFotoLocali,
  azzeraTutto, azzeraStorico,
};
