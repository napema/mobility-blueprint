# SPEC — App Mobilità · "from 0 to hero"

Documento di specifica per la costruzione. Scritto per essere aperto come
punto di partenza in Claude Code.

Versione 1.0 · 14 agosto 2026

---

## 0. Il problema che questa app risolve

L'utente non ha un problema di conoscenza né di programmazione: ha un
problema di **attrito e di ambiguità**. Nello specifico:

1. Non sa distinguere quando fare "mobility" e quando "stretching", e
   questa confusione lo blocca.
2. Associa mobility ad allenamento (sudore, fatica, tempo) e quindi la
   considera impossibile da fare quotidianamente.
3. Non conosce gli esercizi. Ha un foam roller e lo usa a caso.
4. Ha bisogno di follow-along guidato con timer visibile, almeno all'inizio.

**Il successo dell'app non si misura in range guadagnato. Si misura in
giorni consecutivi completati.** Ogni decisione di design è subordinata a
questo.

---

## 1. La risoluzione dell'ambiguità (il cuore della cosa)

I tre paper sembrano contraddirsi sulla frequenza:

- *Scala della Flessibilità*: 1-2 sessioni a settimana ad alta intensità.
  La frequenza quotidiana è esplicitamente etichettata come "percorso
  amatore".
- *Protocolli Neurobiologici*: frequenza ideale 5 giorni a settimana.

**Non si contraddicono: parlano di intensità diverse.** Il microstretching
al 30-40% della soglia di dolore produce guadagni di ROM attivo superiori
al lavoro all'80%. L'intensità alta attiva i riflessi protettivi.

Quindi esistono tre tipi di lavoro, e vanno tenuti nominalmente distinti
nell'app perché è proprio la confusione tra loro il problema dell'utente:

| Binario | Contenuto | Frequenza | Intensità | Suda |
|---|---|---|---|---|
| **RESET** | Protocollo bacino + collo, respiratorio | 7 gg/sett | nessuna | no |
| **MICRO** | Statico 30", sui 5 bersagli | 5 gg/sett | 30-40% | no |
| **CARICO** | End-range caricato, forza | 2 gg/sett | alta | sì |

**Messaggio chiave da comunicare in-app:** la pratica quotidiana NON deve
far sudare, e questo non è un compromesso — è la versione superiore del
metodo. Va detto esplicitamente nella schermata di onboarding, perché
smonta la convinzione che blocca l'utente.

### Ma l'utente non deve vedere tre cose

RESET e MICRO sono **un unico blocco serale da ~20 minuti**. Una sessione,
un pulsante, un flusso. La tripartizione è il modello mentale
sottostante, non l'interfaccia.

CARICO è agganciato alle sessioni di palestra che l'utente già fa, in
coda, e finisce sul suo calendario Google "Fitness".

---

## 2. Vincoli reali dell'utente

- Sveglia 06:45, esce 07:40, rientra 17:10. **Finestra serale ampia** dopo
  le 17:10 (palestra, cucina, resto).
- Appartamento da solo → nessun vincolo di spazio o imbarazzo. Può stare a
  terra quando vuole. **Ottimo per l'aggancio abitudinario.**
- A casa: **solo foam roller**. Nessun elastico, nessun blocco. Il programma
  domestico deve funzionare con foam roller, muro, sedia, pavimento. Un
  elastico e una cinghia sono da suggerire come acquisto, non da presupporre.
- Palestra completa disponibile per il binario CARICO.
- Non ha indicato un'abitudine di aggancio (domanda 14: "non saprei").
  **Da risolvere in onboarding**: l'app propone l'aggancio, non lo chiede.
  Proposta di default: *subito dopo la doccia serale*. Alternativa:
  *ultima cosa prima di mettere la sveglia*.

---

## 3. I cinque bersagli e le metriche fotografiche

L'utente ha rifiutato di scegliere una skill e ha dato obiettivi di esito:
performance, mobilità, flessibilità, azzerare asimmetrie visibili,
prevenire infortuni, **progresso visibile**.

Da qui si derivano cinque bersagli, ognuno con una metrica che si
fotografa. La foto è la feature, non un extra: risponde a "voglio
migliorare visivamente".

| # | Bersaglio | Metrica | Perché questo |
|---|---|---|---|
| 1 | **Deep squat** | Profondità + talloni a terra, profilo | Caviglia e anca; protegge shin splints e ginocchio |
| 2 | **Pike / forward fold** | Distanza dita-pavimento, profilo | È la sua lamentela principale; progresso più visibile |
| 3 | **Overhead shoulder flexion** | Braccia al muro, lombare piatta, profilo | Zaino, trazioni, e ci vive l'asimmetria di spalla |
| 4 | **Simmetria ER anca (farfalla)** | Altezza dei due ginocchi, frontale | L'asimmetria che lo ossessiona; foto già esistente come baseline |
| 5 | **Simmetria flessione laterale collo** | Angolo orecchio-spalla dx vs sx, frontale | Non negoziabile per l'utente |

**Protocollo foto:** stessa posa, stessa distanza, stessa illuminazione,
ogni 3 settimane. L'app mostra in sovrimpressione la sagoma della foto
precedente per allineare. Confronto affiancato nella schermata progressi.

Nota: esiste già una foto baseline della farfalla (frontale, specchio,
14 ago 2026). Va importata come punto zero del bersaglio 4.

---

## 4. Settimana 0 — assessment in-app

Due diagnosi mancano e **non possono essere indovinate**. Vanno raccolte
dall'app al primo avvio, guidate passo passo, e salvate.

### Test 1 — Muscolo o nervo? (blocca il modulo posteriore)

Flessione in avanti in tre versioni consecutive:
1. Normale, mento neutro
2. Mento al petto
3. Mento al petto + caviglie in dorsiflessione (punte tirate verso di sé)

**Interpretazione:**
- Il range peggiora nettamente in 2 e 3 → **tensione neurale**. Il modulo
  posteriore usa *nerve flossing* dello sciatico, NON allungamento
  prolungato dei femorali. Allungare a fondo qui è controproducente.
- Il range resta sostanzialmente uguale → **lunghezza muscolare**. Modulo
  posteriore standard: statico 30" + attivo.

L'app deve ramificare il programma su questo esito. Sono due set di
esercizi diversi per lo stesso bersaglio (Pike).

### Test 2 — I sette test di lateralizzazione

Già implementati e validati nella pagina
`asimmetria-bacino-protocollo.html` (agosto 2026): logica di voto,
regola del 4/7, e rilevamento del pattern "doppio twist". **Portare
quella logica dentro l'app**, non riscriverla.

Output: lato lateralizzato + eventuale flag doppio twist. Da questo
dipendono i lati di tutti gli esercizi del binario RESET.

**Ipotesi corrente da verificare:** lateralizzato a destra. Indizi
convergenti — ginocchio destro rigido in farfalla (meno ER a destra),
sindrome della bandelletta destra un anno fa (il lato in appoggio è
quello che carica), e prevalenza destra nella popolazione generale.
L'app non deve dare questo per scontato: deve chiederlo.

### Test 3 — Baseline dei cinque bersagli

Le cinque foto, più le misure grezze dove ha senso (dita-pavimento in cm).

---

## 5. Struttura del programma

### Blocco 0 — Settimana 0
Assessment + apprendimento dei movimenti a intensità bassissima. Nessun
carico, nessuna progressione. Obiettivo unico: **finire la settimana**.

### Blocco 1 — Settimane 1-3 · "fase neurale"
- RESET quotidiano (protocollo bacino secondo esito Test 2, + collo)
- MICRO 5 giorni: statico 30", intensità 30-40%
- Nessun CARICO ancora

**Avviso obbligatorio a fine settimana 3:** i guadagni dei primi 21 giorni
sono puramente neurali (aumento della stretch tolerance), non strutturali.
Questo va detto *prima* che l'utente pensi di aver toccato un muro,
altrimenti molla proprio lì.

### Blocco 2 — Settimane 4-8 · "carico"
- RESET continua, con progressioni in stazione eretta (le progressioni
  del protocollo bacino, non prima delle 3-4 settimane)
- MICRO continua
- **CARICO entra**: 2 sessioni/settimana in palestra, in coda
  all'allenamento

### Blocco 3 — Settimana 9+
Re-test completo (Test 1, 2, 3 + foto). Riconfigurazione dei bersagli sul
piolo più basso emerso.

### Vincoli di programmazione (dai paper)
- Mai stretching statico **prima** di forza o velocità: inibisce
  temporaneamente la capacità contrattile.
- Sempre dopo riscaldamento termico.
- **Mai CARICO il giorno dopo le gambe.** I segnali di fatica occupano lo
  spazio percettivo e impediscono l'adattamento della tolleranza.
- Il MICRO al 30-40% è esente da questi vincoli: non affatica.
- Set da **30 secondi** (60" non aggiunge nulla).
- Soglia di adattamento: **almeno 5 minuti totali per gruppo muscolare a
  settimana**. L'app deve tracciare questo volume per gruppo e segnalare
  quando un bersaglio è sottodosato.

---

## 6. Vincoli medici personali

Da rispettare nella selezione esercizi. Non sono avvertenze generiche:
sono filtri sul contenuto.

**Lesione lieve al menisco, ginocchio sinistro**
- Evitare flessione profonda di ginocchio sotto carico nelle prime
  settimane.
- Evitare torsione sul ginocchio sinistro: **niente pigeon pose classica**
  a sinistra nelle prime 4 settimane. Alternativa: figure-4 supina, che
  dà la stessa rotazione esterna d'anca senza torcere il ginocchio.
- Farfalla è sicura (nessuna torsione).
- Deep squat come bersaglio va approcciato dall'alto: prima caviglia, poi
  anca, e solo dopo profondità.

**Sindrome della bandelletta ileotibiale destra (1 anno fa)**
- Coerente con lateralizzazione destra. Il lavoro sul bacino è
  direttamente preventivo qui.
- Non foam-rollare la bandelletta stessa (è tessuto connettivo, non
  contrattile). Lavorare su tensore della fascia lata e gluteo.
- Includere rinforzo del medio gluteo destro: il piolo "deficit di forza".

**Shin splints (pregressi)**
- La dorsiflessione di caviglia è direttamente protettiva e alimenta
  anche il bersaglio Deep squat. Priorità alta.
- Soleo e tibiale anteriore nel modulo.

**Collo**
- Intensità **30-40% e mai oltre**. Il riflesso miotatico cervicale è
  particolarmente reattivo.
- Allungamento del lato rigido (sinistro) **+ rinforzo isometrico** del
  lato che deve produrre il movimento. Il limite è attivo oltre che
  passivo: c'è una componente di forza, non solo di lunghezza.
- **Stop assoluto** se compaiono vertigini, formicolii alle braccia,
  cefalea o dolore. L'app deve mostrare questo filtro prima del primo
  utilizzo del modulo collo, una volta sola, non a ogni sessione.

---

## 7. Requisiti tecnici

- **Hosting:** GitHub Pages, come l'app Abitudini esistente.
- **PWA**, aggiunta alla home dell'iPhone. Manifest + service worker.
  **Deve funzionare offline**: la sessione serale non può dipendere dalla
  rete.
- **Persistenza:** localStorage. Stato da salvare: esito assessment,
  blocco e settimana corrente, storico sessioni completate, streak, foto
  progressi (IndexedDB per le immagini), volume per gruppo muscolare.
- **File separati fin dall'inizio.** Un modulo per: engine del
  follow-along, catalogo esercizi (dati), animazioni, assessment,
  progressi, storage. Niente file monolitico — verrà modificato decine di
  volte.
- **Nessuna dipendenza esterna** se evitabile. Se serve 3D nel pilota,
  three.js da CDN, isolato in un solo modulo.

### Follow-along
- Scorre da solo, countdown grande e leggibile a distanza di braccio da
  terra.
- Pausa sempre disponibile, un tap.
- **Audio:** beep a fine tenuta. Serve a permettere di chiudere gli occhi
  invece di fissare lo schermo — sul microstretching serale è funzionale,
  non un vezzo.
- Wake lock sullo schermo durante la sessione.
- Indicatore di posizione: esercizio N di M, tempo residuo totale.

### Animazioni
- **Default: SVG 2D**, figura schematica, **due angolazioni affiancate**
  (fronte + profilo), loop continuo, con evidenziato il punto che conta
  (dove spingere, cosa non deve muoversi).
- Link YouTube per il primo apprendimento di ogni esercizio, apribile una
  volta e poi nascosto dietro un tap.
  **Nota tecnica:** gli embed YouTube falliscono con errore 153 in
  contesto `file://` o iframe sandboxed. Usare sempre link esterni, mai
  iframe embed.
- **Pilota 3D** su 2-3 esercizi dove la posizione è illeggibile in 2D
  (candidati: 90/90, pancake, sidelying del protocollo bacino). Valutare
  dopo il pilota se estendere.

---

## 8. Cosa questa app NON fa

Da tenere fermo in fase di build, perché è dove si sfalda lo scope:

- **Non sostituisce una valutazione in presenza.** Se compare dolore vero
  — non fastidio da posizione — il programma si ferma.
- **Non promette simmetria.** Un grado di asimmetria è normale e
  asintomatico in quasi tutti. L'obiettivo è ridurre quelle che limitano
  il movimento, non azzerarle.
- **Non è una app di allenamento.** Il binario CARICO si aggancia alle
  sessioni di palestra esistenti; l'app non programma forza né corsa.
- **Non traccia il peso, le calorie, il sonno.** Fuori scope.

---

## 9. Ordine di costruzione consigliato

1. Scheletro PWA + storage + navigazione
2. Assessment (Test 1, 2, 3) — serve per primo, configura tutto il resto
3. Engine del follow-along con timer e audio, testato con esercizi finti
4. Catalogo esercizi Blocco 0 e Blocco 1 + animazioni SVG
5. Schermata progressi + foto con sagoma di allineamento
6. Blocco 2 (CARICO) + progressioni bacino
7. Pilota 3D
