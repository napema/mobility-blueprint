// esercizi.js — catalogo esercizi, Blocco 0 e Blocco 1 (dati).
// Contenuto da CATALOGO-blocco-0-1.md. La struttura tecnica resta quella
// della SPEC: questo modulo espone solo dati, nessuna logica di sessione.
//
// I lati del binario RESET (gruppi A/B) e del modulo M4 NON sono fissi:
// sono espressi per ruolo — "lat" (il lato lateralizzato, dall'esito del
// Test 2) o "away" (il lato da cui si scappa) — e vanno risolti a runtime
// da sessione.js. Il modulo M5 fa eccezione: l'assessment non cattura
// ancora l'angolo del collo, quindi i suoi lati restano quelli della
// descrizione raccolta fuori dall'app finché quella misura non esiste.
//
// ONESTÀ SUL CONTENUTO — due limiti dichiarati, non aggirati:
//
// 1. `serve` è la fonte di verità sull'attrezzatura, non il video.
//    L'utente ha solo pavimento, muro, sedia e foam roller (SPEC §2);
//    i video di terzi mostrano a volte attrezzi che qui non servono.
//
// 2. Per A2, A3, B2 e B3 la fonte (asimmetria-bacino-protocollo.html)
//    NON descrive l'esecuzione: rimanda al video. Quei quattro esercizi
//    hanno quindi `passi` limitati ai principi che la fonte afferma
//    davvero (lato di lavoro, contatti del piede, respirazione) e
//    `videoDecide: true`. Inventare passaggi dettagliati per un
//    movimento che la fonte non descrive sarebbe inventare istruzioni
//    fisiche: non si fa.

const NOTA_ATTREZZI =
  "Se nel video compaiono elastici, blocchi o altri attrezzi, ignorali: qui serve solo quello indicato sopra.";

const NOTA_RESPIRO =
  "L'espirazione è l'esercizio: lunga e completa, finché senti le costole scendere e gli addominali chiudersi. La posizione ti mette nel posto giusto, l'espiro fa il lavoro.";

const RESET_DURATA_SERIE_SEC = 40; // ~5-10 cicli respiratori per serie
const MICRO_DURATA_SEC = 30;

const RESET_GRUPPO_A = {
  sigla: "A",
  ruolo: "lat",
  titolo: "Gruppo A — spingere fuori",
  descrizione: "Contatti del piede: tallone interno e prima testa metatarsale. Attiva glutei, anca laterale, quadricipite.",
  esercizi: [
    {
      sigla: "A1", nome: "Sdraiato sul fianco, spinta di gluteo", video: "pPmIKpPJP7c",
      lavoraLato: "lat", appoggioLato: "away", serve: "Solo il pavimento",
      muscoli: ["Gluteo medio", "Gluteo massimo"],
      gruppoMuscolare: "gluteo",
      istruzioni: "Sdraiato sul fianco d'appoggio, spinge il gluteo del lato di lavoro.",
      passi: [
        "Sdraiati sul fianco del lato d'appoggio, ginocchia piegate una sopra l'altra.",
        "Cerca due punti di contatto col piede che lavora: il tallone interno e il cuscinetto sotto l'alluce.",
        "Espira lentamente e fino in fondo: costole giù, addome che si chiude.",
        "Finita l'espirazione, spingi su quei due punti e senti accendersi il gluteo del lato di lavoro.",
        "Inspira senza mollare la posizione. Continua per 5-10 respiri.",
      ],
    },
    {
      sigla: "A2", nome: "Esercizio A2", video: "O9PSPzyhozs",
      lavoraLato: "lat", serve: "Solo il pavimento", videoDecide: true,
      muscoli: ["Anca laterale", "Gluteo medio"],
      gruppoMuscolare: "anca-laterale",
      istruzioni: "Assumi la posizione del video, caricando il lato di lavoro.",
      passi: [
        "Guarda il video qui sopra e assumi quella posizione.",
        "Il carico va sul lato di lavoro indicato qui sotto.",
        "Cerca i contatti del piede: tallone interno e cuscinetto sotto l'alluce.",
        "Espira lungo e completo a ogni ripetizione, 5-10 respiri.",
      ],
    },
    {
      sigla: "A3", nome: "Esercizio A3", video: "r8t2tgUnF9k",
      lavoraLato: "lat", serve: "Solo il pavimento", videoDecide: true,
      muscoli: ["Quadricipite", "Gluteo"],
      gruppoMuscolare: "quadricipite",
      istruzioni: "Assumi la posizione del video, caricando il lato di lavoro.",
      passi: [
        "Guarda il video qui sopra e assumi quella posizione.",
        "Il carico va sul lato di lavoro indicato qui sotto.",
        "Cerca i contatti del piede: tallone interno e cuscinetto sotto l'alluce.",
        "Espira lungo e completo a ogni ripetizione, 5-10 respiri.",
      ],
    },
  ],
};

const RESET_GRUPPO_B = {
  sigla: "B",
  ruolo: "away",
  titolo: "Gruppo B — entrare",
  descrizione: "Contatto chiave: il tallone. Attiva femorali, obliqui, adduttori.",
  esercizi: [
    {
      sigla: "B1", nome: "Allungo sopra la testa", video: "bb1poiG5DFA",
      lavoraLato: "away", braccioLato: "lat", serve: "Solo il pavimento",
      muscoli: ["Obliqui", "Intercostali"],
      gruppoMuscolare: "obliqui",
      istruzioni: "Il braccio che allunga sopra la testa è dal lato lateralizzato: apre la gabbia toracica e lascia traslare il peso verso il lato di lavoro.",
      passi: [
        "Metti il peso sul tallone del lato di lavoro: è lui che comanda il movimento.",
        "Allunga sopra la testa il braccio del lato opposto, quello lateralizzato.",
        "Espira fino in fondo mentre allunghi: senti il fianco aprirsi da quel lato.",
        "Inspira restando lungo, senza inarcare la schiena. 5-10 respiri.",
      ],
    },
    {
      sigla: "B2", nome: "Esercizio B2", video: "IiIF7jpAj1U",
      lavoraLato: "away", serve: "Solo il pavimento", videoDecide: true,
      muscoli: ["Adduttori", "Obliqui"],
      gruppoMuscolare: "adduttori",
      istruzioni: "Assumi la posizione del video, caricando il lato di lavoro.",
      passi: [
        "Guarda il video qui sopra e assumi quella posizione.",
        "Il lato di lavoro è quello indicato qui sotto.",
        "Il contatto che comanda è il tallone di quel lato.",
        "Espira lungo e completo, 5-10 respiri.",
      ],
    },
    {
      sigla: "B3", nome: "Esercizio B3", video: "5-NPvHbyf7c",
      lavoraLato: "away", serve: "Solo il pavimento", videoDecide: true,
      muscoli: ["Femorali", "Obliqui"],
      gruppoMuscolare: "femorali",
      istruzioni: "Assumi la posizione del video, caricando il lato di lavoro.",
      passi: [
        "Guarda il video qui sopra e assumi quella posizione.",
        "Il lato di lavoro è quello indicato qui sotto.",
        "Il contatto che comanda è il tallone di quel lato.",
        "Espira lungo e completo, 5-10 respiri.",
      ],
    },
  ],
};

// --- MICRO: intensità 30-40%, mai oltre. Tenute da 30". ---

const MODULO_M1 = {
  id: "M1", titolo: "Caviglia", priorita: "alta",
  perche: "Alimenta il deep squat ed è direttamente protettiva sugli shin splints pregressi.",
  esercizi: [
    {
      nome: "Knee-to-wall", perLato: true, serve: "Un muro",
      muscoli: ["Soleo", "Gastrocnemio", "Capsula caviglia"],
      gruppoMuscolare: "caviglia",
      istruzioni: "Il ginocchio supera le dita del piede senza che il tallone si stacchi.",
      passi: [
        "Mettiti davanti al muro, piede a circa 10 cm dal battiscopa.",
        "Spingi il ginocchio in avanti, verso il muro, puntando oltre le dita del piede.",
        "Il tallone resta incollato a terra: se si stacca, avvicina il piede al muro.",
        "Fermati dove senti tensione ma non dolore — al 30-40%, non oltre.",
      ],
    },
    {
      nome: "Tenuta in accosciata profonda", perLato: false, serve: "Nessun attrezzo",
      muscoli: ["Caviglie", "Adduttori", "Anche"],
      gruppoMuscolare: "caviglia-anca",
      istruzioni: "Gomiti dentro le ginocchia, spinta attiva verso l'esterno.",
      passi: [
        "Scendi in accosciata piena, piedi a larghezza spalle, talloni a terra.",
        "Porta i gomiti all'interno delle ginocchia, mani giunte davanti al petto.",
        "Spingi le ginocchia verso l'esterno con i gomiti, in modo attivo.",
        "Tieni il petto alto e respira normalmente per tutta la tenuta.",
      ],
    },
    {
      nome: "Soleo", perLato: true, serve: "Un muro",
      muscoli: ["Soleo"],
      gruppoMuscolare: "soleo",
      istruzioni: "Come il knee-to-wall ma con il ginocchio molto più piegato.",
      passi: [
        "Stessa posizione del knee-to-wall, davanti al muro.",
        "Piega molto di più il ginocchio, portando il peso in basso.",
        "Il tallone resta a terra: è questo che sposta il lavoro sul soleo.",
        "Tensione al 30-40%, mai dolore.",
      ],
    },
  ],
};

const MODULO_M2 = {
  id: "M2", titolo: "Posteriore / Pike", priorita: "attivo",
  perche: "Il range passivo c'è già. Il limite è il controllo, non la lunghezza.",
  esercizi: [
    {
      nome: "Active straight leg raise", perLato: true, serve: "Solo il pavimento",
      muscoli: ["Femorali", "Flessori d'anca"],
      gruppoMuscolare: "femorali",
      istruzioni: "È l'esercizio che conta di più del modulo: range attivo, non passivo.",
      passi: [
        "Supino, gambe distese, schiena a contatto col pavimento.",
        "Alza una gamba tesa più in alto che puoi, lentamente.",
        "Nessuno slancio e nessuna mano: deve salire solo con la sua forza.",
        "Scendi ancora più lentamente di quanto sei salito. 8 ripetizioni.",
      ],
    },
    {
      nome: "Pike seduto con compressione attiva", perLato: false, serve: "Solo il pavimento",
      muscoli: ["Addominali", "Flessori d'anca", "Femorali"],
      gruppoMuscolare: "addominali",
      istruzioni: "Ti tiri giù con gli addominali, non con le braccia. 5 tenute da 5\".",
      passi: [
        "Seduto a terra, gambe tese unite davanti a te.",
        "Tirati verso le gambe usando gli addominali, non le braccia.",
        "Le mani non tirano: al massimo accompagnano.",
        "Tieni 5 secondi, rilascia, ripeti 5 volte.",
      ],
    },
    {
      nome: "Femorali statico", perLato: true, serve: "Solo il pavimento",
      muscoli: ["Femorali"],
      gruppoMuscolare: "femorali",
      istruzioni: "Solo come complemento al lavoro attivo.",
      passi: [
        "Allunga il femorale nella posizione che preferisci, a terra.",
        "Intensità 30-40%: deve essere quasi comodo.",
        "Respira normalmente, non trattenere il fiato.",
      ],
    },
  ],
};

const MODULO_M3 = {
  id: "M3", titolo: "Overhead", priorita: "attivo",
  perche: "Passa già al muro. Il limite è il controllo in assenza di supporto.",
  esercizi: [
    {
      nome: "Prone lift-off", perLato: false, serve: "Solo il pavimento",
      muscoli: ["Trapezio inferiore", "Deltoide posteriore"],
      gruppoMuscolare: "dorsali",
      istruzioni: "8 tenute da 3\", costole giù.",
      passi: [
        "A pancia sotto, braccia distese avanti, pollici verso l'alto.",
        "Stacca le braccia da terra tenendo le costole basse, senza inarcare.",
        "La fronte resta appoggiata o quasi: non alzare la testa.",
        "Tieni 3 secondi, appoggia, ripeti 8 volte.",
      ],
    },
    {
      nome: "Wall slide", perLato: false, serve: "Un muro",
      muscoli: ["Cuffia dei rotatori", "Dentato anteriore"],
      gruppoMuscolare: "spalle",
      istruzioni: "10 lente, mantenendo tutti i contatti col muro.",
      passi: [
        "Schiena al muro, lombare piatta contro la parete.",
        "Appoggia dorso delle mani e gomiti al muro, braccia a candeliere.",
        "Fai scorrere le braccia verso l'alto senza staccare nessun contatto.",
        "Se la lombare si stacca, sei andato troppo su: torna giù. 10 ripetizioni lente.",
      ],
    },
    {
      nome: "Gran dorsale", perLato: true, serve: "Una sedia (o il pavimento)",
      muscoli: ["Gran dorsale"],
      gruppoMuscolare: "gran-dorsale",
      istruzioni: "Con la lombare flessa, altrimenti alleni gli estensori invece del bersaglio.",
      passi: [
        "In ginocchio davanti alla sedia, appoggia l'avambraccio sul sedile.",
        "Arrotonda la schiena bassa — non inarcarla: è il punto che cambia tutto.",
        "Lascia scendere il petto verso il pavimento.",
        "Senti l'allungo sul fianco, sotto l'ascella. Al 30-40%.",
      ],
    },
  ],
};

const MODULO_M4 = {
  id: "M4", titolo: "Asimmetria d'anca", priorita: "bersaglio principale",
  perche: "Differenza misurata in farfalla. Lavoro asimmetrico: volume doppio sul lato più stretto.",
  esercizi: [
    {
      nome: "Frog rock back", perLato: false, dueFasi: true, serve: "Solo il pavimento",
      muscoli: ["Adduttori", "Anche"],
      gruppoMuscolare: "adduttori",
      istruzioni: "8 oscillazioni lente, poi tenuta. Sicuro per il menisco: nessuna torsione.",
      passi: [
        "In quadrupedia, allarga le ginocchia il più possibile, piedi in linea con le ginocchia.",
        "Interno dei piedi e delle ginocchia appoggiati a terra.",
        "Spingi il bacino indietro, verso i talloni, lentamente.",
        "Torna avanti e ripeti. Fermati prima che la schiena si arrotondi.",
      ],
    },
    {
      nome: "90/90", perLato: true, extraLatoStretto: true, serve: "Solo il pavimento",
      muscoli: ["Rotatori esterni d'anca", "Piriforme"],
      gruppoMuscolare: "rotatori-anca",
      istruzioni: "Focus sulla rotazione esterna dell'anca davanti.",
      passi: [
        "Seduto a terra: una gamba davanti a 90°, l'altra di lato a 90°.",
        "Siediti dritto sulle ossa del bacino, senza crollare indietro.",
        "Porta il petto verso la gamba davanti, mantenendo la schiena lunga.",
        "Se ti manca il range, alza il bacino su un supporto. Al 30-40%.",
      ],
    },
    {
      nome: "Figure-4 supina", perLato: true, extraLatoStretto: true, serve: "Solo il pavimento",
      muscoli: ["Piriforme", "Gluteo"],
      gruppoMuscolare: "piriforme-gluteo",
      istruzioni: "Sostituisce la pigeon pose: stessa rotazione esterna, senza torcere il ginocchio.",
      passi: [
        "Supino, piedi a terra, ginocchia piegate.",
        "Appoggia la caviglia di un lato sopra il ginocchio opposto, formando un 4.",
        "Afferra la coscia della gamba sotto e tirala verso il petto.",
        "Il ginocchio in alto resta aperto verso l'esterno. Al 30-40%.",
      ],
    },
    {
      nome: "Farfalla", perLato: false, serve: "Solo il pavimento",
      muscoli: ["Adduttori"],
      gruppoMuscolare: "adduttori",
      istruzioni: "Passiva. È anche la posa della foto di controllo del bersaglio 4.",
      passi: [
        "Seduto, piante dei piedi unite, talloni verso il bacino.",
        "Lascia cadere le ginocchia per gravità.",
        "Non spingere le ginocchia con le mani: qui si misura, non si forza.",
        "Schiena lunga, respiro tranquillo.",
      ],
    },
  ],
};

const MODULO_M5 = {
  id: "M5", titolo: "Collo", priorita: "non negoziabile",
  intensitaMax: "30-40%, mai oltre",
  avviso: "Stop assoluto se compaiono vertigini, formicolii alle braccia, cefalea o dolore. Non è un problema di mobilità e il programma non lo tratta.",
  latoAllungamento: "dx",
  latoRinforzo: "sx",
  esercizi: [
    {
      nome: "Allungamento laterale", fase: "allungamento", volte: 2, serve: "Una sedia",
      muscoli: ["Trapezio superiore", "Elevatore della scapola"],
      gruppoMuscolare: "collo-laterale",
      istruzioni: "Senza ruotare la testa e senza alzare il mento.",
      passi: [
        "Seduto sulla sedia, schiena dritta.",
        "Con la mano del lato opposto afferra il bordo della sedia: fissa la spalla in basso.",
        "Porta l'orecchio verso la spalla, dal lato opposto a quello che allunghi.",
        "Non ruotare la testa e non alzare il mento. Intensità 30-40%, mai oltre.",
      ],
    },
    {
      nome: "Allungamento con rotazione (scaleno)", fase: "allungamento", volte: 1, serve: "Una sedia",
      muscoli: ["Scaleni"],
      gruppoMuscolare: "collo-scaleno",
      istruzioni: "Sposta il bersaglio sullo scaleno.",
      passi: [
        "Stessa posizione dell'esercizio precedente, spalla fissata.",
        "Aggiungi una leggera rotazione del mento verso l'ascella.",
        "Il movimento è minimo: pochi gradi bastano.",
        "Se senti formicolii, fermati subito.",
      ],
    },
    {
      nome: "Isometria di rinforzo", fase: "rinforzo", volte: 1, serve: "Nessun attrezzo",
      muscoli: ["Flessori laterali del collo"],
      gruppoMuscolare: "collo-laterale",
      istruzioni: "5 tenute da 5\", pressione leggera. Qui si costruisce forza, non lunghezza.",
      passi: [
        "Appoggia la mano sulla tempia dello stesso lato da rinforzare.",
        "Spingi la testa contro la mano — la mano resiste.",
        "La testa non si muove di un millimetro: è un'isometria.",
        "Pressione leggera, 5 secondi, poi rilascia. 5 volte.",
      ],
    },
    {
      nome: "Flessione laterale attiva", fase: "rinforzo", volte: 1, serve: "Nessun attrezzo",
      muscoli: ["Flessori laterali del collo"],
      gruppoMuscolare: "collo-laterale",
      istruzioni: "8 ripetizioni lente, senza mani.",
      passi: [
        "Seduto o in piedi, spalle rilassate e basse.",
        "Porta l'orecchio verso la spalla usando solo i muscoli del collo.",
        "Nessuna mano ad aiutare, nessuna spalla che sale.",
        "Torna al centro con controllo. 8 ripetizioni lente.",
      ],
    },
  ],
};

const MODULI_MICRO = [MODULO_M1, MODULO_M2, MODULO_M3, MODULO_M4, MODULO_M5];
const MODULI_MICRO_BLOCCO_0 = [MODULO_M1, MODULO_M5];

export {
  NOTA_ATTREZZI,
  NOTA_RESPIRO,
  RESET_GRUPPO_A,
  RESET_GRUPPO_B,
  RESET_DURATA_SERIE_SEC,
  MICRO_DURATA_SEC,
  MODULO_M1,
  MODULO_M2,
  MODULO_M3,
  MODULO_M4,
  MODULO_M5,
  MODULI_MICRO,
  MODULI_MICRO_BLOCCO_0,
};
