# SETUP — quello che devo fare io a mano

Il codice è già tutto scritto e funzionante. Restano solo le cose che
richiedono i tuoi account: **repo, token, chiavi, secrets**. Nessuna
richiede di scrivere codice.

Totale: **circa 15 minuti**, una volta sola.

---

## A · SYNC — dati condivisi tra dispositivi

### A1 · Crea il repo privato dei dati

GitHub → **New repository**

| Campo | Valore |
|---|---|
| Nome | `mobilita-dati` |
| Visibilità | **Private** — obbligatorio |
| Inizializza con README | **sì** (serve un commit iniziale) |

> Se scegli un nome diverso, cambialo anche in `config.js` (campo `repo`).

### A2 · Genera il token

GitHub → **Settings** (del profilo, non del repo) → **Developer settings**
→ **Personal access tokens** → **Fine-grained tokens** → *Generate new token*

| Campo | Valore |
|---|---|
| Token name | `mobilita-sync` |
| Expiration | quello che preferisci (con scadenza va rigenerato) |
| Repository access | **Only select repositories** → `mobilita-dati` |
| Permissions → Repository → **Contents** | **Read and write** |

Nient'altro. Solo Contents, solo su quel repo.

Copia il token: lo vedi **una volta sola**.

### A3 · Spezzalo e mettilo in `config.js`

Apri l'app, premi F12 (console), incolla:

```js
const t = "INCOLLA_QUI_IL_TOKEN";
const b = btoa(t); const n = Math.ceil(b.length / 3);
console.log(JSON.stringify([b.slice(0,n), b.slice(n,2*n), b.slice(2*n)]));
```

Escono tre stringhe. Aprile in `config.js` e incollale in `t1`, `t2`, `t3`.
Poi commit e push.

> **Perché spezzato:** non è sicurezza, è antiscraping. Chi apre il
> sorgente lo trova comunque. È accettabile solo perché il token tocca un
> unico repo privato di dati personali e si revoca in un clic. Se un
> giorno i dati diventano sensibili, serve un backend vero.

### A4 · Verifica

Apri l'app. Il pallino in alto a destra deve passare da **grigio** a
**verde**. In Impostazioni compare l'ora dell'ultimo sync.

Sul repo `mobilita-dati` deve comparire `dati.json`.

Se il pallino è **rosso**, passaci sopra: il messaggio d'errore è nel
tooltip. `HTTP 401` = token sbagliato. `HTTP 404` = nome repo sbagliato.

---

## B · NOTIFICHE — promemoria serale

### B1 · I secrets

Sul repo **del sito** (`mobility-blueprint`) → **Settings** →
**Secrets and variables** → **Actions** → *New repository secret*.

| Nome | Valore |
|---|---|
| `VAPID_PRIVATE_KEY` | la chiave privata che hai in `SETUP-notifiche.md` |
| `VAPID_SUBJECT` | `mailto:napema03@icloud.com` |
| `PUSH_SUBSCRIPTION` | lo prendi al passo B3 |

> La chiave **pubblica** è già nel codice, ed è giusto così.
> La **privata** non deve mai finire in un file committato — infatti non
> l'ho messa da nessuna parte nel repo.
>
> ⚠️ **Attenzione:** la chiave privata è scritta in chiaro dentro
> `SETUP-notifiche.md` che hai in Downloads. Se quel file finisce nel
> repo o lo condividi, la chiave va rigenerata.

### B2 · Installa la PWA sull'iPhone

Non è opzionale: **su iOS il push funziona solo così.**

1. Apri il sito su Safari **dall'iPhone**
2. Condividi → **Aggiungi alla schermata Home**
3. Chiudi Safari e apri l'app **dall'icona**

### B3 · Cattura la subscription

Nell'app (aperta dall'icona): **Impostazioni → Attiva le notifiche** →
consenti.

Compare un riquadro con un testo JSON, già copiato negli appunti.
Mandatelo via mail o Note, e incollalo nel secret `PUSH_SUBSCRIPTION`
(tutto su una riga).

### B4 · Prova

Repo → **Actions** → *Notifiche* → **Run workflow** → nel campo
`forza` scrivi `1` → Run.

Deve arrivare una notifica sul telefono. Se sei fuori orario e non forzi,
il log dice *"niente da inviare"*: è il comportamento giusto.

---

## Gli orari, e perché

| Ora | Giorni | Cosa |
|---|---|---|
| **21:15** | tutti | principale — *"Hai corso oggi?"* |
| **22:15** | solo se non fatta | recupero: propone i **2 minuti**, non la sessione intera |
| **17:15** | mercoledì | *"Oggi c'è la loaded mobility"* |
| **19:00** | domenica | riepilogo settimanale |

Niente notifiche al mattino: hai 55 minuti tra sveglia e uscita, e lo
statico prima di attività non va fatto comunque.

**Massimo 2 al giorno.** È il vincolo più importante: oltre, le disattivi
— e con loro se ne va tutto il sistema.

---

## Le cose che ti faranno perdere tempo

**Il cron di GitHub ritarda.** Sotto carico slitta di 10-20 minuti, a
volte salta. Per delle notifiche va bene; non usarlo per cose che devono
partire all'orario esatto.

**I workflow schedulati si disattivano dopo 60 giorni di inattività del
repo.** GitHub manda una mail. Basta un commit qualsiasi.

**La subscription scade.** Prima o poi arriva `410 Gone`: rifai B3 e
aggiorna il secret. Stessa cosa se reinstalli la PWA.

**Se le notifiche smettono di arrivare**, la prima cosa da controllare è
che l'icona sia ancora sulla Home.

**Se una versione vecchia resta incastrata** sul telefono:
Impostazioni → **Svuota cache e ricarica**.
