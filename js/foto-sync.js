// foto-sync.js — le foto dei bersagli tra dispositivi.
//
// I blob non stanno nel JSON: sarebbe enorme e illeggibile. Ogni foto è
// un file a sé nel repo dei dati (foto/<id>.jpg); nel JSON viaggiano
// solo i riferimenti, che si fondono per id/up come le sessioni.
//
// Le foto vengono COMPRESSE prima di salire: uno scatto da iPhone è
// 3-5 MB, e caricarlo intero significherebbe una richiesta lentissima e
// un repo che esplode. A 1400px lato lungo e qualità 0.82 restano
// 200-400 KB, più che sufficienti per un confronto a distanza di
// settimane — che è tutto quello che serve qui.

import { getState, updateState, salvaFotoBlob, leggiFotoBlob, elencaIdFotoLocali } from "./storage.js";

const CFG = (() => {
  const c = window.APP_CFG || {};
  let token = "";
  if (c.t1 && c.t2 && c.t3) {
    try { token = atob(String(c.t1) + String(c.t2) + String(c.t3)); } catch { token = ""; }
  }
  return { owner: c.owner, repo: c.repo, branch: c.branch || "main", token };
})();

const configurato = () => Boolean(CFG.token && CFG.owner && CFG.repo);
const urlFile = (path) => `https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/${path}`;
const hdr = () => ({
  Authorization: `Bearer ${CFG.token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

const MAX_LATO = 1400;
const QUALITA = 0.82;

// ===================== compressione =====================

function comprimi(blob) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const scala = Math.min(1, MAX_LATO / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scala);
      canvas.height = Math.round(img.height * scala);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => resolve(b || blob), "image/jpeg", QUALITA);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(blob); };
    img.src = url;
  });
}

// Base64 di dati binari: btoa non basta, serve passare dal DataURL.
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(",")[1]);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}

function base64ToBlob(b64, tipo = "image/jpeg") {
  const raw = atob(b64.replace(/\n/g, ""));
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return new Blob([arr], { type: tipo });
}

// ===================== salvataggio di una foto nuova =====================

async function aggiungiFoto(bersaglioId, blobOriginale) {
  const compressa = await comprimi(blobOriginale);
  const id = `${bersaglioId}-${Date.now()}`;
  const path = `foto/${id}.jpg`;
  const dataISO = new Date().toISOString();

  await salvaFotoBlob(id, compressa);
  updateState((s) => {
    s.foto = s.foto || [];
    s.foto.push({ id, up: Date.now(), bersaglioId, data: dataISO, path, caricata: false });
    s.assessment.baselineTest3.bersagli[bersaglioId].fotoData = dataISO;
    s.metaUp = Date.now();
  });

  document.dispatchEvent(new CustomEvent("dati-cambiati"));
  // Il caricamento parte subito ma non blocca l'anteprima: la foto è
  // già salva in locale, quello che manca è solo la copia sul repo.
  const caricamento = sincronizzaFoto();
  return { id, blob: compressa, caricamento };
}

// ===================== il giro di sincronizzazione =====================

let inCorso = false;
let richiestaPendente = false;

async function sincronizzaFoto() {
  if (!configurato()) return;
  // Se un giro è già in corso la richiesta si ACCODA, non si butta via:
  // scartarla significava che una foto aggiunta durante un sync non
  // saliva mai (restava lì fino al giro successivo, o per sempre).
  if (inCorso) { richiestaPendente = true; return; }
  inCorso = true;
  try {
    const locali = new Set(await elencaIdFotoLocali());
    const record = (getState().foto || []).filter((f) => !f.del);

    // 1. carica quelle che esistono qui ma non ancora sul repo
    for (const f of record) {
      if (f.caricata || !locali.has(f.id)) continue;
      const blob = await leggiFotoBlob(f.id);
      if (!blob) continue;
      try {
        await fetch(urlFile(f.path), {
          method: "PUT",
          headers: hdr(),
          body: JSON.stringify({
            message: `foto ${f.bersaglioId} ${f.data}`,
            content: await blobToBase64(blob),
            branch: CFG.branch,
          }),
        }).then((r) => { if (!r.ok && r.status !== 422) throw new Error(`HTTP ${r.status}`); });
        updateState((s) => {
          const x = (s.foto || []).find((y) => y.id === f.id);
          if (x) x.caricata = true;
        });
      } catch { /* riprova al giro successivo */ }
    }

    // 2. scarica quelle che stanno sul repo ma non su questo dispositivo
    for (const f of record) {
      if (locali.has(f.id)) continue;
      try {
        const res = await fetch(`${urlFile(f.path)}?ref=${encodeURIComponent(CFG.branch)}`, { headers: hdr(), cache: "no-store" });
        if (!res.ok) continue;
        const j = await res.json();
        await salvaFotoBlob(f.id, base64ToBlob(j.content));
      } catch { /* riprova al giro successivo */ }
    }
  } finally {
    inCorso = false;
    if (richiestaPendente) { richiestaPendente = false; await sincronizzaFoto(); }
  }
}

export { aggiungiFoto, sincronizzaFoto, comprimi, configurato };
