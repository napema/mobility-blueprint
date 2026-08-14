# Promemoria serale — come attivarlo davvero

## Il punto che conta

GitHub **Pages** serve file statici: da solo non può svegliare il telefono.
Una notifica che arriva **ad app chiusa** richiede sempre due pezzi:

1. un'**iscrizione push** del dispositivo,
2. **qualcuno che invii** il messaggio a quell'iscrizione a un orario stabilito.

Qui il "qualcuno" è **GitHub Actions**, non Pages: il workflow
`.github/workflows/promemoria.yml` gira col cron e manda il push.
È in questo senso che le notifiche PWA "si fanno via GitHub".

**Su iPhone** la notifica arriva **solo se l'app è stata aggiunta alla Home**
(iOS 16.4+). In Safari come sito normale il push per le web app non esiste.

---

## I tre passaggi

### 1 · Genera le chiavi VAPID

Su una macchina con Node:

```bash
npx web-push generate-vapid-keys
```

Escono due stringhe: `Public Key` e `Private Key`.

### 2 · Metti la chiave pubblica nell'app

In `js/notifiche.js`, riga in alto:

```js
const VAPID_PUBLIC_KEY = "";   // <-- incolla qui la Public Key
```

Poi committa e aspetta che GitHub Pages ripubblichi.

### 3 · Iscrivi il telefono e salva i secrets

1. Apri l'app **dalla Home dell'iPhone** (non da Safari).
2. Impostazioni → **Attiva le notifiche** → consenti.
3. Tocca **Copia l'iscrizione push**.
4. Su GitHub: `Settings → Secrets and variables → Actions → New secret`, e crea:

| Nome | Valore |
|---|---|
| `VAPID_PUBLIC` | la Public Key |
| `VAPID_PRIVATE` | la Private Key |
| `VAPID_SUBJECT` | `mailto:napema03@icloud.com` |
| `PUSH_SUBSCRIPTION` | il JSON copiato al punto 3 |

### Prova subito

Su GitHub: `Actions → Promemoria serale → Run workflow`.
Se i secrets sono a posto, la notifica arriva sul telefono.

---

## Cosa fa il service worker

Quando il push arriva, `sw.js` legge da IndexedDB l'ultima sessione
completata:

- **sessione di oggi già fatta** → notifica silenziosa, non ti disturba;
- **non ancora fatta** → il promemoria vero.

Il cron gira alle 19:00 e alle 20:00 UTC (= 21:00 in Italia sia con l'ora
legale sia con quella solare). I due invii hanno lo stesso `tag`, quindi
sul telefono resta una notifica sola.

---

## Se non fai nulla di tutto questo

L'app funziona lo stesso. Senza chiavi VAPID:

- la notifica di **prova** funziona (app aperta);
- su **Android/Chrome** viene programmata anche una notifica locale con i
  Notification Triggers, che non richiede server;
- su **iPhone** il promemoria ad app chiusa **non arriva**.
