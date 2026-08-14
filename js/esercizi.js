// esercizi.js — catalogo esercizi, Blocco 0 e Blocco 1 (dati).
// Contenuto da CATALOGO-blocco-0-1.md. La struttura tecnica resta quella
// della SPEC: questo modulo espone solo dati, nessuna logica di sessione.
//
// I lati del binario RESET (gruppi A/B) e del modulo M4 NON sono fissi:
// sono espressi per ruolo — "lat" (il lato lateralizzato, dall'esito del
// Test 2) o "away" (il lato da cui si scappa) — e vanno risolti a runtime
// da sessione.js leggendo l'assessment corrente. Il modulo M5 fa eccezione:
// l'assessment non cattura ancora l'angolo del collo ("numeri mancanti"),
// quindi i suoi lati sono presi così come risultano dalla descrizione
// raccolta fuori dall'app (tessuto che frena a destra, rinforzo a
// sinistra) e restano fissi finché quella misura non esiste.
//
// Il campo `serve` è obbligatorio su ogni esercizio: l'utente ha solo
// foam roller, muro, sedia e pavimento (SPEC §2). I video YouTube sono di
// terzi e in alcuni mostrano attrezzi che qui non servono: `serve` è la
// fonte di verità, il video no.

const NOTA_ATTREZZI =
  "Nel video possono comparire elastici, blocchi o altri attrezzi: ignorali. Qui serve solo quello indicato sopra.";

const RESET_DURATA_SERIE_SEC = 40; // ~5-10 cicli respiratori per serie
const MICRO_DURATA_SEC = 30;

const RESET_GRUPPO_A = {
  sigla: "A",
  ruolo: "lat", // spinge fuori dal lato lateralizzato
  titolo: "Gruppo A — spingere fuori",
  descrizione: "Contatti del piede: tallone interno e prima testa metatarsale. Attiva glutei, anca laterale, quadricipite.",
  esercizi: [
    {
      sigla: "A1", nome: "Sdraiato sul fianco, spinta di gluteo", video: "pPmIKpPJP7c",
      lavoraLato: "lat", appoggioLato: "away", serve: "Solo il pavimento",
      istruzioni: "Sdraiato sul fianco d'appoggio, spinge il gluteo del lato di lavoro.",
      gruppoMuscolare: "gluteo",
    },
    {
      sigla: "A2", nome: "Esercizio A2", video: "O9PSPzyhozs",
      lavoraLato: "lat", serve: "Solo il pavimento",
      istruzioni: "Segui la posizione mostrata nel video, caricando il lato di lavoro.",
      gruppoMuscolare: "anca-laterale",
    },
    {
      sigla: "A3", nome: "Esercizio A3", video: "r8t2tgUnF9k",
      lavoraLato: "lat", serve: "Solo il pavimento",
      istruzioni: "Segui la posizione mostrata nel video, caricando il lato di lavoro.",
      gruppoMuscolare: "quadricipite",
    },
  ],
};

const RESET_GRUPPO_B = {
  sigla: "B",
  ruolo: "away", // entra nel lato da cui si scappa
  titolo: "Gruppo B — entrare",
  descrizione: "Contatto chiave: il tallone. Attiva femorali, obliqui, adduttori.",
  esercizi: [
    {
      sigla: "B1", nome: "Allungo sopra la testa", video: "bb1poiG5DFA",
      lavoraLato: "away", braccioLato: "lat", serve: "Solo il pavimento",
      istruzioni: "Il braccio che allunga sopra la testa è dal lato lateralizzato: apre la gabbia toracica e lascia traslare il peso verso il lato di lavoro.",
      gruppoMuscolare: "obliqui",
    },
    {
      sigla: "B2", nome: "Esercizio B2", video: "IiIF7jpAj1U",
      lavoraLato: "away", serve: "Solo il pavimento",
      istruzioni: "Segui la posizione mostrata nel video, caricando il lato di lavoro.",
      gruppoMuscolare: "adduttori",
    },
    {
      sigla: "B3", nome: "Esercizio B3", video: "5-NPvHbyf7c",
      lavoraLato: "away", serve: "Solo il pavimento",
      istruzioni: "Segui la posizione mostrata nel video, caricando il lato di lavoro.",
      gruppoMuscolare: "femorali",
    },
  ],
};

const RESET_NOTA_RESPIRO =
  "L'espirazione è l'esercizio: lunga e completa, finché le costole scendono e gli addominali si chiudono. La posizione mette nel posto giusto, l'espiro fa il lavoro.";

// --- MICRO: bersagli, intensità 30-40%, mai oltre. Tenute da 30" salvo
// dove indicato diversamente nel catalogo sorgente. ---

const MODULO_M1 = {
  id: "M1", titolo: "Caviglia (dorsiflessione)", priorita: "alta",
  perche: "Alimenta il deep squat ed è direttamente protettiva sugli shin splints pregressi.",
  esercizi: [
    {
      nome: "Knee-to-wall", perLato: true, serve: "Un muro",
      istruzioni: "Piede a ~10 cm dal muro. Il ginocchio spinge in avanti oltre le dita senza staccare il tallone.",
      gruppoMuscolare: "caviglia",
    },
    {
      nome: "Tenuta in accosciata profonda", perLato: false, serve: "Nessun attrezzo",
      istruzioni: "Gomiti dentro le ginocchia, spinta attiva verso l'esterno.",
      gruppoMuscolare: "caviglia-anca",
    },
    {
      nome: "Soleo", perLato: true, serve: "Un muro",
      istruzioni: "Stessa posizione del knee-to-wall ma con il ginocchio molto più piegato.",
      gruppoMuscolare: "soleo",
    },
  ],
};

const MODULO_M2 = {
  id: "M2", titolo: "Posteriore / Pike", priorita: "attivo",
  perche: "Il range passivo c'è già. Il limite è il controllo, non la lunghezza.",
  esercizi: [
    {
      nome: "Active straight leg raise", perLato: true, serve: "Solo il pavimento",
      istruzioni: "Supino, una gamba tesa sale il più in alto possibile, senza slancio e senza mani. È l'esercizio che conta di più in questo modulo.",
      gruppoMuscolare: "femorali",
    },
    {
      nome: "Pike seduto con compressione attiva", perLato: false, serve: "Solo il pavimento",
      istruzioni: "Seduto gambe tese, tirati giù con gli addominali, non con le braccia. 5 tenute da 5\".",
      gruppoMuscolare: "addominali",
    },
    {
      nome: "Femorali statico", perLato: true, serve: "Solo il pavimento",
      istruzioni: "Allungamento statico, solo come complemento.",
      gruppoMuscolare: "femorali",
    },
  ],
};

const MODULO_M3 = {
  id: "M3", titolo: "Overhead", priorita: "attivo",
  perche: "Passa già al muro. Il limite è il controllo in assenza di supporto.",
  esercizi: [
    {
      nome: "Prone lift-off", perLato: false, serve: "Solo il pavimento",
      istruzioni: "A pancia sotto, braccia distese avanti: staccale da terra tenendo le costole giù. 8 tenute da 3\".",
      gruppoMuscolare: "dorsali",
    },
    {
      nome: "Wall slide", perLato: false, serve: "Un muro",
      istruzioni: "Schiena e lombare piatte contro il muro, braccia che scorrono su e giù mantenendo il contatto. 10 lente.",
      gruppoMuscolare: "spalle",
    },
    {
      nome: "Gran dorsale", perLato: true, serve: "Una sedia (o il pavimento)",
      istruzioni: "Allunga con la colonna lombare flessa — schiena arrotondata — altrimenti alleni gli estensori invece del bersaglio.",
      gruppoMuscolare: "gran-dorsale",
    },
  ],
};

// M4 — bersaglio principale: asimmetria di farfalla. Il lato con più
// distanza da terra (meno rotazione esterna) riceve un volume extra —
// risolto a runtime da sessione.js sulla base della baseline del Test 3.
const MODULO_M4 = {
  id: "M4", titolo: "Asimmetria d'anca", priorita: "bersaglio principale",
  perche: "Differenza misurata in farfalla. Lavoro asimmetrico: volume doppio sul lato più stretto.",
  esercizi: [
    {
      nome: "Frog rock back", perLato: false, dueFasi: true, serve: "Solo il pavimento",
      istruzioni: "In quadrupedia, ginocchia larghe: 8 oscillazioni lente, poi tenuta.",
      gruppoMuscolare: "adduttori",
    },
    {
      nome: "90/90", perLato: true, extraLatoStretto: true, serve: "Solo il pavimento",
      istruzioni: "Seduto, focus sulla rotazione esterna dell'anca.",
      gruppoMuscolare: "rotatori-anca",
    },
    {
      nome: "Figure-4 supina", perLato: true, extraLatoStretto: true, serve: "Solo il pavimento",
      istruzioni: "Caviglia sopra il ginocchio opposto, tira la coscia verso di te. Sostituisce la pigeon pose: stessa rotazione esterna, senza torcere il ginocchio sinistro.",
      gruppoMuscolare: "piriforme-gluteo",
    },
    {
      nome: "Farfalla", perLato: false, serve: "Solo il pavimento",
      istruzioni: "Passiva, senza spingere le ginocchia con le mani.",
      gruppoMuscolare: "adduttori",
    },
  ],
};

// M5 — collo, non negoziabile. Lati fissi per QUESTO utente: la
// descrizione raccolta (non l'assessment numerico, ancora mancante) dice
// che il tessuto che frena sta a destra e il rinforzo va a sinistra.
const MODULO_M5 = {
  id: "M5", titolo: "Collo", priorita: "non negoziabile",
  intensitaMax: "30-40%, mai oltre",
  avviso: "Stop assoluto se compaiono vertigini, formicolii alle braccia, cefalea o dolore. Non è un problema di mobilità e il programma non lo tratta.",
  latoAllungamento: "dx", // tessuto bersaglio
  latoRinforzo: "sx",
  esercizi: [
    {
      nome: "Allungamento laterale", fase: "allungamento", volte: 2, serve: "Una sedia",
      istruzioni: "Seduto, mano opposta al bordo della sedia per fissare la spalla. Porta l'orecchio verso quella spalla, senza ruotare la testa e senza alzare il mento.",
      gruppoMuscolare: "collo-laterale",
    },
    {
      nome: "Allungamento con rotazione (scaleno)", fase: "allungamento", volte: 1, serve: "Una sedia",
      istruzioni: "Stessa posizione, con una leggera rotazione del mento verso l'ascella.",
      gruppoMuscolare: "collo-scaleno",
    },
    {
      nome: "Isometria di rinforzo", fase: "rinforzo", volte: 1, serve: "Nessun attrezzo",
      istruzioni: "Mano sulla tempia dello stesso lato: la testa spinge contro la mano senza muoversi. Pressione leggera, 5 tenute da 5\".",
      gruppoMuscolare: "collo-laterale",
    },
    {
      nome: "Flessione laterale attiva", fase: "rinforzo", volte: 1, serve: "Nessun attrezzo",
      istruzioni: "Senza mani, porta l'orecchio verso la spalla e torna. 8 ripetizioni lente.",
      gruppoMuscolare: "collo-laterale",
    },
  ],
};

const MODULI_MICRO = [MODULO_M1, MODULO_M2, MODULO_M3, MODULO_M4, MODULO_M5];

// Blocco 0: solo i moduli caviglia e collo tra i bersagli (SPEC + catalogo).
const MODULI_MICRO_BLOCCO_0 = [MODULO_M1, MODULO_M5];

export {
  NOTA_ATTREZZI,
  RESET_GRUPPO_A,
  RESET_GRUPPO_B,
  RESET_DURATA_SERIE_SEC,
  RESET_NOTA_RESPIRO,
  MICRO_DURATA_SEC,
  MODULO_M1,
  MODULO_M2,
  MODULO_M3,
  MODULO_M4,
  MODULO_M5,
  MODULI_MICRO,
  MODULI_MICRO_BLOCCO_0,
};
