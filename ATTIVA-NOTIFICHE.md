# Attivare le notifiche — 4 passi

Il workflow gira già (lo vedi in Actions, ogni 15 minuti). È **rosso**
perché mancano i secret: senza, non ha nulla a cui inviare.

Ordine obbligato: **prima i secret, poi il telefono.** Se fai il
telefono per primo ottieni un testo che poi non sai dove mettere.

---

## Passo 1 · Le chiavi VAPID

Sono una coppia: la pubblica sta nel codice, la privata in un secret.

**Hai già una coppia** dentro `SETUP-notifiche.md`. Puoi usarla e saltare
al passo 2 — ma quella privata è finita nella storia del repo pubblico,
quindi è meglio rigenerarla. Sono 30 secondi e non serve installare
niente.

Apri l'app nel browser del computer, premi **F12** → scheda **Console**,
incolla questo e premi invio:

```js
(async () => {
  const kp = await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'}, true, ['sign','verify']);
  const raw = await crypto.subtle.exportKey('raw', kp.publicKey);
  const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
  const b64 = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  console.log('PUBBLICA:', b64(raw));
  console.log('PRIVATA :', jwk.d);
})();
```

Escono due righe. Tienile aperte, servono adesso.

---

## Passo 2 · I secret su GitHub

Repo **mobility-blueprint** → **Settings** → **Secrets and variables** →
**Actions** → *New repository secret*. Quattro voci:

| Nome | Valore |
|---|---|
| `VAPID_PUBLIC_KEY` | la riga **PUBBLICA** del passo 1 |
| `VAPID_PRIVATE_KEY` | la riga **PRIVATA** del passo 1 |
| `VAPID_SUBJECT` | `mailto:napema03@icloud.com` |
| `DATI_TOKEN` | il token GitHub **intero**, quello che inizia con `github_pat_` |

> **`DATI_TOKEN` è lo stesso token del sync**, ma nella forma originale:
> in `config.js` è in base64 spezzato in tre, qui va intero. Per
> riaverlo, in console: `atob(APP_CFG.t1 + APP_CFG.t2 + APP_CFG.t3)`

> `VAPID_PUBLIC_KEY` deve essere **identica** al campo `vapidPublic` di
> `config.js`. Non c'è più un valore di ripiego: se il secret manca, il
> workflow fallisce subito invece di firmare con una chiave sbagliata e
> non far arrivare niente senza dirlo.

> Il `PUSH_SUBSCRIPTION` **non ce l'hai ancora**: arriva al passo 4.

**E la chiave pubblica va anche nell'app:** in `config.js`, campo
`vapidPublic`. Deve essere **identica** a `VAPID_PUBLIC_KEY`, altrimenti
il telefono si iscrive a una chiave e il server firma con un'altra, e
non arriva niente. Poi commit e push.

---

## Passo 3 · Installa la PWA sull'iPhone

Non è un dettaglio: **su iOS il push funziona solo così.** In Safari come
scheda normale non esiste, punto.

1. Apri il sito su **Safari dall'iPhone**
2. Tasto **Condividi** → **Aggiungi alla schermata Home**
3. Chiudi Safari
4. Apri l'app **dall'icona sulla Home**

---

## Passo 4 · Cattura la subscription

Nell'app aperta **dall'icona** (non da Safari):

1. **Impostazioni** → **Attiva le notifiche** → **Consenti**
2. Compare un riquadro con un testo JSON lungo, già copiato negli appunti
3. Mandatelo via mail o Note per averlo sul computer
4. Su GitHub crea il quinto secret:

| Nome | Valore |
|---|---|
| `PUSH_SUBSCRIPTION` | quel JSON, tutto su una riga |

---

## Verifica

Repo → **Actions** → **Notifiche** → **Run workflow** → nel campo
`forza` scrivi `1` → **Run workflow**.

Poi apri il run e leggi l'ultimo passo:

| Cosa leggi | Cosa significa |
|---|---|
| `INVIATA: prova` | Funziona. La notifica è sul telefono. |
| `SECRET MANCANTI: ...` | Manca quel secret: rifai il passo 2 o 4. |
| `PUSH_SUBSCRIPTION non è un JSON valido` | Hai incollato male: deve iniziare con `{"endpoint":` |
| `ERRORE invio: 410` | La subscription è scaduta: rifai il passo 4. |

Da lì in poi il run torna verde e le notifiche arrivano agli orari che
imposti in **Impostazioni → Promemoria**.

---

## Se il run è verde ma sul telefono non arriva niente

Nell'ordine:

1. L'icona è ancora sulla schermata Home? Se l'hai tolta, la
   subscription è morta: rifai il passo 4.
2. iPhone → Impostazioni → Notifiche → cerca l'app: i permessi ci sono?
3. Hai riaperto l'app da Safari invece che dall'icona? Le due cose sono
   installazioni diverse e hanno subscription diverse.
