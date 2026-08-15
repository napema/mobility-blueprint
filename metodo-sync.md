# Metodo di sync GitHub per web app statiche (PWA) — da riusare

Incolla tutto questo come messaggio in una nuova chat: descrive un sistema di
sincronizzazione già collaudato in produzione, con i dettagli che di solito si
scoprono solo sbattendoci la testa.

---

Voglio usare in questo progetto lo stesso metodo di sync che ho già collaudato in
un'altra mia web app. Non riprogettarlo: implementalo così, adattando solo i nomi.

## L'idea in una riga

Il sito è statico (GitHub Pages), i dati stanno in **un solo file JSON dentro un
repo GitHub privato**, letto e scritto dal browser via API Contents. Nessun
backend, nessun database, nessun costo. `localStorage` è la copia locale che fa
funzionare tutto anche offline; GitHub è la fonte condivisa tra dispositivi.

## Architettura

- **Repo pubblico del sito**: `index.html`, `sw.js`, `manifest.webmanifest`, le
  icone e `config.js`.
- **Repo privato dei dati**: un unico file, es. `dati.json`.
- **Token GitHub fine-grained**, permessi minimi: solo *Contents: Read and write*
  sul repo dei dati. In `config.js` sta codificato in base64 e **spezzato in tre
  parti** concatenate a runtime — non è vera sicurezza, è solo antiscraping: chi
  apre il sorgente lo trova. È una scelta consapevole, accettabile solo perché il
  token tocca un unico repo privato di dati personali e si revoca in un clic.
  Se il progetto è multiutente o i dati sono sensibili, serve un backend vero.

```js
// config.js
window.APP_CFG = {
  owner: "utente", repo: "repo-dati", path: "dati.json", branch: "main",
  t1: "", t2: "", t3: ""   // base64 del token, spezzato in tre
};
```

```js
const CFG = (() => {
  const c = window.APP_CFG || {};
  let token = "";
  if (c.t1 && c.t2 && c.t3) token = atob(String(c.t1) + String(c.t2) + String(c.t3));
  return { owner:c.owner, repo:c.repo, path:c.path, branch:c.branch || "main", token };
})();
```

## Modello dati: merge per `id`/`up` + lapidi

Ogni record ha un `id` stabile e `up` (timestamp dell'ultima modifica). Il merge è
**last-write-wins per record**, non per file: due dispositivi che scrivono record
diversi non si sovrascrivono a vicenda.

```js
function mergeRecords(local, remote) {
  const map = new Map();
  for (const r of [...remote, ...local]) {          // il locale passa per ultimo a parità di up
    if (!r || !r.id) continue;
    const ex = map.get(r.id);
    if (!ex || (r.up || 0) > (ex.up || 0)) map.set(r.id, r);
  }
  return [...map.values()];
}
```

**Le cancellazioni non cancellano**: sostituiscono il record con una *lapide*
`{ id, del:true, up:Date.now() }`. Senza lapide, il record cancellato su un
dispositivo verrebbe resuscitato dal merge con l'altro. Tutte le viste leggono da
un filtro unico, mai dall'array grezzo:

```js
const LIVE = () => DB.records.filter(r => !r.del);
// e ogni tanto: elimina le lapidi più vecchie di 90 giorni
```

Per la configurazione (impostazioni, categorie, preferenze) non serve il merge per
record: basta un singolo timestamp `metaUp`, e vince il più recente in blocco.

## Il ciclo di sync

Uno solo, riusato ovunque: **GET → merge → salva in locale → PUT se serve.**

```js
async function syncNow() {
  if (!CFG.token || SYNC.busy) return;
  SYNC.busy = true;
  try {
    let remote = null;
    const res = await fetch(apiURL(), { headers: hdr(), cache: "no-store" });
    if (res.status === 200) {
      const j = await res.json();
      SYNC.sha = j.sha;                       // serve per la PUT successiva
      remote = JSON.parse(b64dec(j.content));
    } else if (res.status === 404) {
      SYNC.sha = null;                        // primo avvio: il file non esiste ancora
    } else throw new Error("HTTP " + res.status);

    const before = snapshot(payload());
    if (remote) { /* merge record + meta per timestamp */ }
    const after = snapshot(payload());

    if (after !== before) { save(); scheduleRender(); }   // il locale è cambiato
    if (after !== snapshot(remote)) await push();          // il remoto è indietro
  } catch (e) {
    setSyncState("err", e.message);
  } finally { SYNC.busy = false; }
}
```

Dettagli che fanno la differenza:

1. **`snapshot()` normalizza prima di confrontare** (ordina i record per `id` e
   serializza). Senza, ogni ciclo vede una differenza fantasma e fa una PUT
   inutile: un commit ogni 20 secondi, per sempre.
2. **La PUT vuole lo `sha`** del file corrente. Se torna **409/422** lo `sha` è
   vecchio: azzeralo e lascia che sia il giro successivo a rifare GET → merge →
   PUT. Non ritentare in loop nello stesso istante.
3. **Cadenza**: polling silenzioso ogni 20 secondi, più un sync su `focus` della
   finestra, più un push in *debounce* (~1,5 s) dopo ogni modifica locale. Il
   debounce evita una PUT per ogni tasto premuto.
4. **Base64 con caratteri accentati**: `btoa` da solo esplode. Usa
   `btoa(unescape(encodeURIComponent(s)))` e l'inverso in lettura.
5. **Un flag `busy`** impedisce cicli sovrapposti.

## La regola che rende il sync invisibile

Il sync **non deve mai ridisegnare l'interfaccia sotto le dita dell'utente**. I
dati arrivano sempre, il ridisegno aspetta:

```js
function uiBusy() {
  const a = document.activeElement;
  const typing = a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA");
  return typing || !!document.querySelector(".sheet.show");  // o modale/dropdown aperti
}
function scheduleRender() {
  if (uiBusy()) SYNC.pendingRender = true;   // rimandato
  else render();
}
// alla chiusura del modale: if (SYNC.pendingRender) render();
```

Senza questa guardia l'app si "rianima" mentre scrivi: il campo perde il focus, la
lista salta, e sembra rotta anche quando i dati sono perfetti.

## Service worker: l'errore che costa mezza giornata

Se cachi tutto *cache-first*, `config.js` resta congelato alla versione del primo
caricamento. Risultato: in locale (`file://`, dove il service worker non si
registra) il sync funziona, in produzione no — con il file giusto sul repo.
Diagnosi difficile, causa banale.

Regole:

- `index.html` e `config.js` → **network-first**, cache solo come riserva offline.
- Il resto della shell (icone, manifest) → cache-first.
- Le chiamate a `api.github.com` → **il service worker non le tocca mai**
  (`return` secco nel handler `fetch`), altrimenti sincronizzi con dati in cache.
- Le richieste non-GET passano dirette.
- **Alza il nome della cache a ogni deploy** e cancella le vecchie in `activate`.

```js
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "api.github.com") return;
  const critical = req.mode === "navigate" ||
    url.pathname.endsWith("config.js") || url.pathname.endsWith("index.html");
  if (critical) {
    e.respondWith(fetch(req).then(r => {
      if (r && r.ok) caches.open(CACHE).then(c => c.put(req, r.clone()));
      return r;
    }).catch(() => caches.match(req)));
  }
  // ...altrimenti cache-first
});
```

## Due cose da mettere sempre nell'interfaccia

- **Un pallino di stato** (grigio non configurato / ambra in corso / verde ok /
  rosso errore) con il messaggio d'errore nel `title`. Un sync silenzioso che
  fallisce è peggio di nessun sync.
- **Un pulsante "Svuota cache e ricarica"** che disregistra i service worker,
  cancella tutte le cache e ricarica. È l'unica via d'uscita rapida quando una
  versione vecchia resta incastrata sul dispositivo.

## Come vorrei che procedessi

Implementa questo schema nel progetto, poi **testalo davvero**: simula l'API
GitHub intercettando le richieste (Playwright `page.route`) e verifica pull,
push con merge, lapide remota applicata, e la guardia che non ridisegna con un
modale aperto. Poi servi i file da un server HTTP vero, con il service worker
attivo, e controlla che un `config.js` aggiornato arrivi con un semplice reload.
Consegnami sempre i file completi, non i frammenti.
