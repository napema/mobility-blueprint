// storage.js — persistenza locale (localStorage per stato, IndexedDB per le foto).
// Nessun contenuto reale ancora: solo la forma dello stato e le funzioni di accesso.

const LS_KEY = "mobilita.state.v1";

const DEFAULT_STATE = {
  assessment: {
    completato: false,
    esitoTest1: null,       // "neurale" | "muscolare" | null
    esitoTest2: null,       // { latoLateralizzato: "sx"|"dx"|null, doppioTwist: bool }
    baselineTest3: null,    // misure grezze + riferimenti foto dei 5 bersagli
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
