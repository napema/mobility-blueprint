// esercizi.js — LIBRERIA (PROGRAMMA-v3).
//
// TRE SESSIONI, non un menu:
//   1. POST-CORSA   — fissa, nessuna progressione, dopo ogni corsa
//   2. QUOTIDIANO   — a casa, ogni giorno, progressione 10 → 20 min
//   3. LOADED       — palestra, 1×/settimana, progressione a carichi
// È l'app a scegliere quale: l'unica domanda è "hai corso oggi?".
//
// VIDEO — ogni esercizio ne ha uno. Nessuna animazione disegnata.
// Ogni id è stato cercato e poi verificato con l'API oEmbed di YouTube:
// risulta esistente, con titolo e canale coerenti con l'esercizio (due
// id sono stati scartati proprio così, perché i video erano stati
// rimossi). Quello che NON è verificato è il contenuto: i video non sono
// guardabili da qui. anteprima-video.html serve a rivederli in fila.
//
// Tag: [S] stretching (passivo) · [M] mobility/forza (attivo).

const DURATA_STD = 30;

// ====================== G1 · COLLO ======================
// Direzione: la testa scende più a destra → limitato verso sinistra →
// si allunga a DESTRA e si rinforza a SINISTRA.
const G1 = {
  id: "G1", nome: "Collo", sempreAttivo: true,
  intensita: "30-40% e mai oltre",
  avviso: "Stop assoluto con vertigini, formicolii alle braccia, cefalea o dolore. Il riflesso cervicale è particolarmente reattivo: spingere ottiene l'opposto.",
  esercizi: [
    { id: "g1-flex-lat", video: "-r0eoFS7_5Q", nome: "Flessione laterale destra", tag: "S", lato: "dx", volte: 2,
      serve: "Una sedia", muscoli: ["Trapezio superiore"],
      passi: [
        "Seduto, schiena dritta.",
        "Mano sinistra al bordo della sedia: blocca la spalla in basso.",
        "Orecchio sinistro verso la spalla sinistra.",
        "Non ruotare la testa, non alzare il mento.",
      ] },
    { id: "g1-scaleno", video: "DwdEkATOppo", nome: "Scaleno destro", tag: "S", lato: "dx",
      serve: "Una sedia", muscoli: ["Scaleni"],
      passi: ["Stessa posizione, spalla bloccata.", "Ruota il mento verso l'ascella sinistra.", "Pochi gradi bastano."] },
    { id: "g1-elevatore", video: "ZsFdEpVKu_c", nome: "Elevatore della scapola destro", tag: "S", lato: "dx",
      serve: "Una sedia", muscoli: ["Elevatore della scapola"],
      passi: ["Spalla destra bloccata in basso.", "Naso verso l'ascella sinistra: rotazione opposta allo scaleno."] },
    // Correzione dal fisioterapista: la mano resiste dal lato OPPOSTO
    // alla direzione in cui il collo spinge. Prima era scritto al
    // contrario, e faceva lavorare il lato sbagliato.
    { id: "g1-isometria", video: "brkZW0fdc5k", nome: "Isometria del collo (rinforzo sinistro)", tag: "M", lato: "sx",
      serve: "Nessun attrezzo", muscoli: ["Flessori laterali sinistri"], ripetizioni: "5 × 5\"",
      nota: "La mano sta dal lato opposto alla spinta: è la resistenza, non la direzione del lavoro.",
      passi: [
        "Appoggia la mano DESTRA sulla tempia destra.",
        "Spingi la testa VERSO SINISTRA contro la mano, che resiste.",
        "La testa non si muove: lavora il lato sinistro del collo.",
        "Pressione leggera, 5 secondi. Poi rilascia.",
      ] },
    { id: "g1-flex-attiva", video: "fF8Hhf6Z9PY", nome: "Flessione laterale attiva sinistra", tag: "M", lato: "sx",
      serve: "Nessun attrezzo", muscoli: ["Flessori laterali sinistri"], ripetizioni: "8 lente",
      passi: ["Senza mani, spalle basse.", "Orecchio verso la spalla sinistra e ritorno.", "Solo i muscoli del collo."] },
    { id: "g1-chin-tuck", video: "vhFGQxDVzF8", nome: "Retrazione cervicale (chin tuck)", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Flessori profondi del collo"], ripetizioni: "10 × 3\"",
      passi: ["Sguardo all'orizzonte.", "Mento indietro, come un doppio mento.", "Non abbassarlo: si muove in orizzontale."] },
  ],
};

// ================= G2 · CAVIGLIA, POLPACCIO, PIEDE =================
const G2 = {
  id: "G2", nome: "Caviglia e piede", priorita: "alta (shin splints)",
  esercizi: [
    { id: "g2-gastro", video: "EFnLllHNbQQ", nome: "Gastrocnemio", tag: "S", perLato: true,
      serve: "Un muro", muscoli: ["Gastrocnemio"],
      passi: ["Mani al muro.", "Gamba dietro tesa, ginocchio bloccato.", "Tallone incollato a terra."] },
    { id: "g2-soleo", video: "Zmc36LtB7f8", nome: "Soleo", tag: "S", perLato: true,
      serve: "Un muro", muscoli: ["Soleo"], nota: "Bersaglio diverso dal gastrocnemio: non saltarlo.",
      passi: ["Stessa posizione del gastrocnemio.", "Piega il ginocchio dietro.", "Tallone sempre a terra."] },
    { id: "g2-knee-wall", video: "u3NbKOXl75k", nome: "Knee-to-wall", tag: "M", perLato: true,
      serve: "Un muro", muscoli: ["Caviglia"], ripetizioni: "10 × 3\"", nota: "È il test e l'esercizio insieme.",
      passi: ["Piede a 10 cm dal muro.", "Ginocchio oltre le dita.", "Il tallone non si stacca mai."] },
    { id: "g2-heel-drop", video: "d7ZsskaHtfg", nome: "Heel drop eccentrici", tag: "M", perLato: true,
      serve: "Un gradino", muscoli: ["Polpaccio", "Achilleo"], ripetizioni: "15 per lato",
      nota: "L'eccentrica è il pezzo che conta: 3-4 secondi in discesa.",
      passi: ["Avampiede sul gradino, talloni nel vuoto.", "Sali con DUE piedi.", "Scendi lentamente con UNO solo, 3-4 secondi.", "Risali sempre con due."] },
    { id: "g2-tibiale", video: "RHWRxiBe1iU", nome: "Sollevamenti del tibiale", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Tibiale anteriore"], ripetizioni: "15 lente",
      nota: "L'antagonista del polpaccio: protettivo diretto sugli shin splints.",
      passi: ["Talloni a terra, schiena a un muro.", "Solleva le punte più che puoi.", "Scendi lentamente."] },
    { id: "g2-short-foot", video: "m1lkcg8p-48", nome: "Short foot", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Intrinseci del piede"], ripetizioni: "10 × 5\"",
      nota: "Propriocezione: è nell'intervento del RCT sugli shin splints.",
      passi: ["In piedi, peso distribuito.", "Accorcia l'arco avvicinando l'avampiede al tallone.", "SENZA artigliare le dita: restano lunghe.", "Tieni 5 secondi."] },
    { id: "g2-plantare", video: "P3oBz2S511Y", nome: "Fascia plantare su pallina", tag: "S", perLato: true,
      serve: "Una pallina", muscoli: ["Fascia plantare"], durataSec: 60,
      passi: ["Pallina sotto il piede, da seduto o in piedi.", "Rotola lentamente dal tallone alle dita.", "Fermati sui punti densi."] },
    { id: "g2-accosciata", video: "MDKRgwUa4To", nome: "Tenuta in accosciata profonda", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Caviglie", "Adduttori"], durataSec: 45,
      passi: ["Accosciata piena, talloni a terra.", "Gomiti dentro le ginocchia.", "Spingi le ginocchia in fuori."] },
  ],
};

// ====================== G3 · FEMORALI ======================
const G3 = {
  id: "G3", nome: "Femorali", nota: "Il range passivo c'è già: il limite è il controllo, non la lunghezza.",
  esercizi: [
    { id: "g3-aslr", video: "WXs5HoRPvm0", nome: "Active straight leg raise", tag: "M", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Femorali", "Flessori d'anca"], ripetizioni: "8 lente",
      nota: "L'esercizio singolo più importante del programma per il pike.",
      passi: ["Supino, schiena a terra.", "Una gamba tesa sale il più possibile.", "Senza slancio e senza mani.", "Scendi più lento di quanto sali."] },
    { id: "g3-aslr-ecc", video: "TQ5OD5zEB-o", nome: "ASLR eccentrico", tag: "M", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Femorali"], ripetizioni: "6 per lato",
      passi: ["Sali con il ginocchio piegato: superi il limite.", "In alto distendi il ginocchio.", "Scendi lentissimo a gamba tesa."] },
    { id: "g3-femorale-piedi", video: "BVq9x15BfII", nome: "Femorale in piedi", tag: "S", perLato: true,
      serve: "Un rialzo basso", muscoli: ["Femorali"],
      nota: "Inibizione reciproca: contrai il quadricipite mentre allunghi e il femorale si spegne per riflesso.",
      passi: ["Tallone su un rialzo basso.", "Scendi con la schiena DRITTA, non arrotondata.", "Contrai il quadricipite della gamba che allunghi."] },
    { id: "g3-pike", video: "oJX8EKF3TqM", nome: "Pike seduto", tag: "S",
      serve: "Solo il pavimento", muscoli: ["Femorali", "Addominali"], ripetizioni: "5 × 5\"",
      passi: ["Seduto, gambe tese unite.", "Tirati giù con gli addominali.", "Le braccia non tirano."] },
    { id: "g3-femorale-supino", video: "Il1L75v6gq0", nome: "Femorale supino con asciugamano", tag: "S", perLato: true,
      serve: "Un asciugamano", muscoli: ["Femorali"],
      nota: "Il più controllabile come intensità: usalo per stare davvero al 30-40%.",
      passi: ["Supino, asciugamano attorno al piede.", "Gamba tesa che sale, tirata dall'asciugamano.", "L'altra gamba resta a terra."] },
  ],
};

// =================== G4 · FLESSORI D'ANCA ===================
const G4 = {
  id: "G4", nome: "Flessori d'anca", nota: "Il gruppo che la corsa accorcia di più.",
  esercizi: [
    { id: "g4-affondo", video: "4_9AMcMdENY", nome: "Affondo in ginocchio con retroversione", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Psoas", "Retto femorale"],
      nota: "Senza la retroversione non allunghi niente: è l'errore più comune in assoluto.",
      passi: ["In ginocchio, l'altro piede avanti.", "Porta il coccige SOTTO: retroversione.", "Solo ora spingi il bacino avanti."] },
    { id: "g4-couch", video: "sWquwUNscy0", nome: "Couch stretch", tag: "S", perLato: true,
      serve: "Un rialzo o il divano", muscoli: ["Retto femorale", "Psoas"],
      nota: "Versione intensa: si esagera facilissimo, tienila al 30-40%.",
      passi: ["Piede posteriore sul rialzo, ginocchio a terra.", "Busto eretto.", "Mantieni il coccige sotto."] },
    { id: "g4-ponte", video: "WtilA9IJX1c", nome: "Ponte glutei", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Glutei"], ripetizioni: "12 lente",
      nota: "L'antagonista: inibizione reciproca sul flessore.",
      passi: ["Supino, piedi vicino ai glutei.", "Spingi il bacino in alto.", "Stringi i glutei in cima."] },
    { id: "g4-psoas-roller", video: "HM8mOf8VNB8", nome: "Psoas su foam roller", tag: "S", perLato: true,
      serve: "Foam roller", muscoli: ["Psoas"], durataSec: 60,
      passi: ["A pancia sotto, roller sotto la cresta iliaca.", "Resta fermo e respira.", "Niente rotolamenti veloci."] },
  ],
};

// ========= G5 · ADDUTTORI E ROTATORI D'ANCA (bersaglio) =========
const G5 = {
  id: "G5", nome: "Adduttori e rotatori d'anca", sempreAttivo: true,
  nota: "Il gruppo bersaglio: 3 cm di asimmetria in farfalla. Volume doppio sul lato più stretto.",
  esercizi: [
    { id: "g5-farfalla", video: "giwBs8Eqq6M", nome: "Farfalla", tag: "S",
      serve: "Solo il pavimento", muscoli: ["Adduttori"],
      passi: ["Piante unite, talloni verso il bacino.", "Le ginocchia scendono per gravità.", "Non spingerle con le mani: qui si misura."] },
    { id: "g5-frog", video: "uZyLZDxcD38", nome: "Frog rock back", tag: "S",
      serve: "Solo il pavimento", muscoli: ["Adduttori"], nota: "Sicuro per il menisco: nessuna torsione.",
      passi: ["Quadrupedia, ginocchia larghe.", "Interno di piedi e ginocchia a terra.", "Bacino indietro, lento.", "8 oscillazioni, poi tenuta."] },
    { id: "g5-9090", video: "P4GfbdNvOT8", nome: "90/90", tag: "S", perLato: true, extraLatoStretto: true,
      serve: "Solo il pavimento", muscoli: ["Rotatori esterni d'anca"],
      passi: ["Gamba davanti a 90°, l'altra di lato a 90°.", "Siedi dritto sulle ossa del bacino.", "Petto verso la gamba davanti."] },
    { id: "g5-figure4", video: "-g0nuyTHMrI", nome: "Figure-4 supina", tag: "S", perLato: true, extraLatoStretto: true,
      serve: "Solo il pavimento", muscoli: ["Piriforme", "Gluteo"],
      nota: "Sostituisce la pigeon: stessa rotazione esterna, nessuna torsione del ginocchio (filtro menisco sinistro).",
      passi: ["Supino, ginocchia piegate.", "Caviglia sopra il ginocchio opposto: forma un 4.", "Tira verso di te la coscia sotto."] },
    { id: "g5-hip-switch", video: "YxECcOkUCEY", nome: "90/90 hip switch", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Rotatori d'anca"], ripetizioni: "8 passaggi",
      nota: "Range attivo: il migliore per il pavimento, non per il soffitto.",
      passi: ["Dalla posizione 90/90.", "Ruota fino al 90/90 opposto.", "Senza usare le mani."] },
    { id: "g5-cossack", video: "nLNqEQ4B6XI", nome: "Cossack squat", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Adduttori"], ripetizioni: "6 per lato",
      nota: "Adduttore sotto carico in allungamento: è quello che sposta davvero la farfalla.",
      passi: ["Piedi molto larghi.", "Scendi su una gamba, l'altra resta tesa.", "Punta del piede teso verso l'alto."] },
    { id: "g5-affondo-lat", video: "HzdAMw5Si84", nome: "Adduttore in affondo laterale", tag: "S", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Adduttori"],
      passi: ["Piedi larghi, scendi su un lato.", "La gamba opposta resta tesa.", "Tieni la posizione."] },
    { id: "g5-abduzione", video: "UmmBtOG2N_s", nome: "Abduzione sdraiato", tag: "M", perLato: true, doppioADestra: true,
      serve: "Solo il pavimento", muscoli: ["Medio gluteo"],
      nota: "15 a sinistra, 25 a destra: deficit di forza sul lato della bandelletta.",
      passi: ["Sul fianco, corpo in linea.", "La gamba sopra sale lenta.", "Non ruotare il bacino indietro."] },
    { id: "g5-side-plank-abd", video: "09082SvRFFg", nome: "Side plank con abduzione", tag: "M", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Medio gluteo", "Obliqui"], ripetizioni: "8 per lato",
      nota: "Quando diventa facile: tenuta 20\" più 8 abduzioni.",
      passi: ["Side plank sull'avambraccio.", "Corpo in linea, bacino alto.", "La gamba sopra si alza e scende lenta."] },
  ],
};

// =============== G6 · GLUTEI E BANDELLETTA ===============
const G6 = {
  id: "G6", nome: "Glutei e bandelletta",
  avviso: "Mai foam-rollare la bandelletta: è tessuto fibroso, sotto massima contrazione si allunga meno dello 0,2%. Si lavora su TFL e gluteo.",
  esercizi: [
    { id: "g6-piriforme", video: "xVq2-g_leTI", nome: "Piriforme figure-4 supina", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Piriforme", "Gluteo"],
      nota: "A sinistra usa sempre la versione supina: filtro menisco.",
      passi: ["Supino, forma il 4 con le gambe.", "Tira la coscia verso il petto."] },
    { id: "g6-tfl", video: "cf3hapBV-Nc", nome: "TFL e gluteo, doppio a destra", tag: "S", perLato: true, doppioADestra: true,
      serve: "Nessun attrezzo", muscoli: ["TFL", "Gluteo"], nota: "30\" a sinistra, 60\" a destra.",
      passi: ["In piedi, gamba destra incrociata dietro la sinistra.", "Spingi il bacino verso destra.", "Allunga il braccio sopra la testa."] },
  ],
};

// ==================== G7 · QUADRICIPITI ====================
const G7 = {
  id: "G7", nome: "Quadricipiti",
  avviso: "Filtro menisco sinistro: nelle prime 4 settimane niente flessione profonda di ginocchio sotto carico a sinistra.",
  esercizi: [
    { id: "g7-quad-piedi", video: "kzAsm4WQqvQ", nome: "Quadricipite in piedi", tag: "S", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Quadricipite"],
      passi: ["Tallone verso il gluteo.", "Il ginocchio punta a terra, non avanti.", "Bacino in retroversione."] },
    { id: "g7-couch", video: "sWquwUNscy0", nome: "Couch stretch", tag: "S", perLato: true,
      serve: "Un rialzo", muscoli: ["Quadricipite", "Psoas"],
      passi: ["Piede posteriore su un rialzo.", "Busto eretto, coccige sotto."] },
  ],
};

// ================ G8 · TORACICA E SPALLE ================
const G8 = {
  id: "G8", nome: "Toracica e spalle", nota: "È il gruppo che porta l'overhead.",
  esercizi: [
    { id: "g8-gran-dorsale", video: "LYJjlj6rmxs", nome: "Gran dorsale con lombare flessa", tag: "S", perLato: true,
      serve: "Una sedia", muscoli: ["Gran dorsale"],
      nota: "Con la schiena arrotondata: altrimenti allunghi gli estensori invece del bersaglio.",
      passi: ["In ginocchio, avambraccio sul sedile.", "ARROTONDA la schiena bassa.", "Lascia scendere il petto."] },
    { id: "g8-estensione", video: "qCrYe698zJU", nome: "Estensione toracica su foam roller", tag: "M",
      serve: "Foam roller", muscoli: ["Toracica"], ripetizioni: "8 lente",
      passi: ["Roller trasversale sotto le scapole.", "Mani dietro la testa.", "Estendi indietro lentamente, senza inarcare la lombare."] },
    { id: "g8-prone-liftoff", video: "ZJZRgsJJj90", nome: "Prone lift-off", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Trapezio inferiore"], ripetizioni: "8 × 3\"",
      nota: "È l'esercizio che chiude il gap sull'overhead.",
      passi: ["Pancia sotto, braccia distese avanti, pollici in su.", "Staccale da terra.", "Costole giù: non inarcare."] },
    { id: "g8-wall-slide", video: "W_p73Vqhs-8", nome: "Wall slide", tag: "M",
      serve: "Un muro", muscoli: ["Dentato anteriore", "Cuffia"], ripetizioni: "10 lente",
      passi: ["Lombare piatta contro il muro.", "Dorso delle mani e gomiti al muro.", "Scorri in alto senza staccare nulla."] },
    { id: "g8-pettorale", video: "M850sCj9LHQ", nome: "Pettorale su stipite", tag: "S", perLato: true,
      serve: "Uno stipite", muscoli: ["Pettorale"],
      nota: "Tre altezze diverse (basso, medio, alto): sono tre porzioni diverse del muscolo.",
      passi: ["Gomito a 90° contro lo stipite.", "Ruota il busto in avanti.", "Cambia altezza a ogni serie."] },
    { id: "g8-tricipite", video: "nbHOmIYMazk", nome: "Tricipite overhead", tag: "S", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Tricipite"],
      passi: ["Gomito in alto vicino all'orecchio.", "La mano scende dietro la schiena.", "L'altra mano accompagna il gomito."] },
  ],
};

// ============ BACINO — protocollo laterale (settimana 3+) ============
const BACINO = {
  id: "BACINO", nome: "Bacino",
  nota: "L'espirazione è l'esercizio: lunga e completa, fino a sentire le costole scendere.",
  esercizi: [
    { id: "A1", sigla: "A1", video: "pPmIKpPJP7c", nome: "A1 · Sdraiato sul fianco, spinta di gluteo", tag: "M",
      ruoloLato: "lat", serve: "Solo il pavimento", ridotto: true, muscoli: ["Gluteo medio"], durataSec: 40,
      passi: ["Sdraiati sul fianco d'appoggio, ginocchia piegate.", "Cerca i due contatti: tallone interno e cuscinetto sotto l'alluce.", "Espira fino in fondo, poi spingi.", "5-10 respiri."] },
    { id: "A2", sigla: "A2", video: "O9PSPzyhozs", nome: "A2", tag: "M", ruoloLato: "lat",
      serve: "Solo il pavimento", videoDecide: true, muscoli: ["Anca laterale"], durataSec: 40,
      passi: ["Assumi la posizione del video.", "Carica il lato indicato qui sotto.", "Espira lungo, 5-10 respiri."] },
    { id: "A3", sigla: "A3", video: "r8t2tgUnF9k", nome: "A3", tag: "M", ruoloLato: "lat",
      serve: "Solo il pavimento", videoDecide: true, muscoli: ["Quadricipite"], durataSec: 40,
      passi: ["Assumi la posizione del video.", "Carica il lato indicato qui sotto.", "Espira lungo, 5-10 respiri."] },
    { id: "B1", sigla: "B1", video: "bb1poiG5DFA", nome: "B1 · Allungo sopra la testa", tag: "M",
      ruoloLato: "away", serve: "Solo il pavimento", ridotto: true, muscoli: ["Obliqui"], durataSec: 40,
      passi: ["Peso sul tallone del lato di lavoro.", "Allunga sopra la testa il braccio del lato opposto.", "Espira fino in fondo.", "5-10 respiri."] },
    { id: "B2", sigla: "B2", video: "IiIF7jpAj1U", nome: "B2", tag: "M", ruoloLato: "away",
      serve: "Solo il pavimento", ridotto: true, videoDecide: true, muscoli: ["Adduttori"], durataSec: 40,
      passi: ["Assumi la posizione del video.", "Il contatto che comanda è il tallone.", "Espira lungo, 5-10 respiri."] },
    { id: "B3", sigla: "B3", video: "5-NPvHbyf7c", nome: "B3", tag: "M", ruoloLato: "away",
      serve: "Solo il pavimento", videoDecide: true, muscoli: ["Femorali"], durataSec: 40,
      passi: ["Assumi la posizione del video.", "Il contatto che comanda è il tallone.", "Espira lungo, 5-10 respiri."] },
  ],
};

// ============ LOADED MOBILITY — palestra, 1×/settimana ============
const LOADED = {
  id: "LOADED", nome: "Loaded mobility",
  nota: "Carico, non varietà. Sei esercizi fatti bene che progrediscono nel tempo. Mai il giorno dopo le gambe.",
  esercizi: [
    { id: "l-jefferson", video: "YGlAdtSKQaU", nome: "Jefferson curl", tag: "M", serve: "Bilanciere o manubrio", serie: 3,
      muscoli: ["Catena posteriore"], durataSec: 60, ripetizioni: "3 × 5 lentissime",
      carico: { partenza: 5, incrementoKg: 1.5, ogniSettimane: 2 },
      nota: "È l'esercizio che chiude il pike: carico su un range che già possiedi. Carico ridicolo all'inizio, mai fretta di salire.",
      passi: ["In piedi su un rialzo, peso a braccia distese.", "Arrotola la colonna una vertebra alla volta.", "Gambe tese, il peso scende vicino alle gambe.", "Risali srotolando nello stesso ordine."] },
    { id: "l-aslr-zav", video: "WXs5HoRPvm0", nome: "ASLR zavorrato", tag: "M", perLato: true, serie: 3,
      serve: "Cavigliera o disco", muscoli: ["Femorali"], durataSec: 45, ripetizioni: "3 × 8 per lato",
      carico: { partenza: 2, incrementoKg: 0.5, ogniSettimane: 3 },
      nota: "Stesso movimento del video, con la zavorra alla caviglia.",
      passi: ["Supino, zavorra alla caviglia.", "Gamba tesa che sale, senza slancio.", "Scendi lentissimo: l'eccentrica è il punto."] },
    { id: "l-cossack", video: "nLNqEQ4B6XI", nome: "Cossack squat con goblet", tag: "M", perLato: true, serie: 3,
      serve: "Manubrio o kettlebell", muscoli: ["Adduttori"], durataSec: 45, ripetizioni: "3 × 6 per lato",
      carico: { partenza: 8, incrementoKg: 2, ogniSettimane: 2 },
      passi: ["Peso al petto, piedi molto larghi.", "Scendi su una gamba, l'altra tesa.", "Petto alto, tallone a terra."] },
    { id: "l-goblet", video: "4khBSY-0Tis", nome: "Deep squat goblet, tenuta attiva", tag: "M", serie: 3,
      serve: "Manubrio o kettlebell", muscoli: ["Caviglie", "Anche"], durataSec: 30, ripetizioni: "3 × 30\"",
      carico: { partenza: 8, incrementoKg: 2, ogniSettimane: 3 },
      nota: "Sali di peso quando i 30\" diventano comodi.",
      passi: ["Peso al petto, accosciata piena.", "Gomiti dentro le ginocchia che spingono in fuori.", "Talloni a terra, petto alto."] },
    { id: "l-overhead", video: "htphsDzpWcc", nome: "Overhead con bastone", tag: "M", serie: 3,
      serve: "Bastone o bilanciere vuoto", muscoli: ["Spalle", "Gran dorsale"], durataSec: 45, ripetizioni: "3 × 8 lente",
      nota: "Il bastone rende il range misurabile: nel tempo si stringe la presa.",
      passi: ["Presa larga, braccia tese.", "Porta il bastone sopra e dietro la testa.", "Non inarcare la lombare per guadagnare range."] },
    { id: "l-copenhagen", video: "1NNqUQvMYGc", nome: "Copenhagen plank", tag: "M", perLato: true, serie: 3,
      serve: "Una panca o un rialzo", muscoli: ["Adduttori"], durataSec: 20, ripetizioni: "3 × 20\" per lato",
      nota: "Il più duro della lista, ed è quello che sposta la farfalla. Si parte col ginocchio sul rialzo, si arriva alla caviglia.",
      passi: ["Sul fianco, gamba sopra appoggiata al rialzo.", "Solleva il bacino: corpo in linea.", "Inizia col GINOCCHIO sul rialzo (leva corta).", "Solo quando è facile passa alla caviglia."] },
    { id: "l-abduzione-cavo", video: "bGlm-qTnfTI", nome: "Abduzione al cavo, destra doppia", tag: "M", perLato: true, doppioADestra: true, serie: 2,
      serve: "Cavo o elastico", muscoli: ["Medio gluteo"], durataSec: 40, ripetizioni: "2×12 sx · 3×12 dx",
      carico: { partenza: 5, incrementoKg: 2.5, ogniSettimane: 2 },
      passi: ["Cavigliera al cavo basso, di fianco alla macchina.", "Gamba tesa che si allontana.", "Non ruotare il bacino: il busto resta fermo."] },
  ],
};

const GRUPPI = { G1, G2, G3, G4, G5, G6, G7, G8 };

// ============ 1 · POST-CORSA — fissa, nessuna progressione ============
// Metà stretching, metà rinforzo: sui due infortuni pregressi l'evidenza
// porta al rinforzo, non all'allungamento.
const POST_CORSA = {
  id: "POST_CORSA", nome: "Post-corsa", durataStimataMin: 12,
  nota: "Fissa, non progredisce. Nei giorni con corsa sostituisce il quotidiano: non si sommano.",
  blocchi: [
    { nome: "Polpaccio e piede", esercizi: ["g2-gastro", "g2-soleo", "g2-heel-drop", "g2-tibiale", "g2-short-foot"] },
    { nome: "Anca (bandelletta destra)", esercizi: ["g5-abduzione", "g5-side-plank-abd", "g6-tfl"] },
    { nome: "Catena posteriore e anteriore", esercizi: ["g4-affondo", "g3-femorale-piedi", "g6-piriforme"] },
    { nome: "Collo, ridotto", esercizi: ["g1-flex-lat", "g1-isometria"] },
  ],
};

// ============ 2 · QUOTIDIANO — progressione 10 → 20 min ============
const PROGRESSIONE = [
  { settimane: [1, 2], minuti: 10, bacino: false, gruppiStretch: 2, note: "Collo + 2 gruppi attivi + blocco attivo." },
  { settimane: [3, 4], minuti: 14, bacino: "ridotto", gruppiStretch: 2, note: "Entra il bacino ridotto (A1, B1, B2)." },
  { settimane: [5, 6], minuti: 17, bacino: "completo", gruppiStretch: 3, note: "Bacino completo (A1-A3, B1-B3)." },
  { settimane: [7, 99], minuti: 20, bacino: "completo", gruppiStretch: 3, note: "Terzo gruppo attivo, rotazione piena." },
];

// Il blocco attivo: ogni giorno se ne fanno 3, a rotazione.
const BLOCCO_ATTIVO = ["g3-aslr", "g3-aslr-ecc", "g5-hip-switch", "g8-prone-liftoff", "g5-cossack", "g2-accosciata"];

const ROTAZIONE = [
  { id: "A", settimane: [1, 4], gruppi: ["G5", "G3"] },
  { id: "B", settimane: [5, 8], gruppi: ["G5", "G4", "G2"] },
  { id: "C", settimane: [9, 12], gruppi: ["G5", "G8", "G7"] },
];

const SOGLIA_COMPLETAMENTO = 0.7; // il tempo sale solo se il blocco è stato fatto al 70% dei giorni

function fasePerSettimana(s) {
  return PROGRESSIONE.find((p) => s >= p.settimane[0] && s <= p.settimane[1]) || PROGRESSIONE[PROGRESSIONE.length - 1];
}

function rotazionePerSettimana(s) {
  return ROTAZIONE.find((r) => s >= r.settimane[0] && s <= r.settimane[1]) || ROTAZIONE[ROTAZIONE.length - 1];
}

function trovaEsercizio(id) {
  for (const g of Object.values(GRUPPI)) {
    const e = g.esercizi.find((x) => x.id === id);
    if (e) return { esercizio: e, gruppo: g };
  }
  return null;
}

function caricoSuggerito(ex, settimana) {
  if (!ex.carico) return null;
  const fatte = Math.max(0, settimana - 1);
  const kg = ex.carico.partenza + Math.floor(fatte / ex.carico.ogniSettimane) * ex.carico.incrementoKg;
  return Math.round(kg * 2) / 2;
}

export {
  GRUPPI, G1, G2, G3, G4, G5, G6, G7, G8, BACINO, LOADED, POST_CORSA,
  PROGRESSIONE, ROTAZIONE, BLOCCO_ATTIVO, SOGLIA_COMPLETAMENTO, DURATA_STD,
  fasePerSettimana, rotazionePerSettimana, trovaEsercizio, caricoSuggerito,
};
