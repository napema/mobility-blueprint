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
    blocco: 0,              // 0..3
    settimana: 0,
  },
  storicoSessioni: [],       // [{ data, tipo: "reset+micro"|"carico", durataSec, esercizi: [...] }]
  streak: {
    giorniConsecutivi: 0,
    ultimaDataCompletata: null,
  },
  volumePerGruppo: {},        // { [gruppoMuscolare]: secondiTotaliSettimanaCorrente }
};

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
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

export { getState, updateState, salvaFoto, elencaFoto };
