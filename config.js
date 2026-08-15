// config.js — configurazione del sync. NON è codice: sono i tuoi dati.
//
// Il token sta qui in chiaro-ish (base64 spezzato in tre): non è
// sicurezza, è solo antiscraping. Chi apre il sorgente lo trova.
// È accettabile SOLO perché è un token fine-grained con permessi
// minimi (Contents: read/write) su un unico repo privato di dati
// personali, e si revoca in un clic. Se un giorno i dati diventano
// sensibili o gli utenti più di uno, serve un backend vero.
//
// COME RIEMPIRLO — istruzioni complete in SETUP-sync.md.
// In breve: crea un repo privato per i dati, genera un token
// fine-grained, poi in una console del browser esegui:
//
//   const t = "ghp_iltuotoken";
//   const b = btoa(t);
//   const n = Math.ceil(b.length / 3);
//   console.log(JSON.stringify([b.slice(0,n), b.slice(n,2*n), b.slice(2*n)]));
//
// e incolla i tre pezzi in t1, t2, t3 qui sotto.

window.APP_CFG = {
  owner: "napema",
  repo: "mobilita-dati",     // il repo PRIVATO dei dati, da creare
  path: "dati.json",
  branch: "main",
  t1: "",
  t2: "",
  t3: "",
};
