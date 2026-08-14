// esercizi.js — LIBRERIA per gruppo muscolare (PROGRAMMA-v2.md §6).
//
// Organizzata per gruppo, non per fonte: gli esercizi del protocollo
// bacino di Harris sono ora UNA parte, non tutto il programma.
//
// Tag:  [S] stretching — passivo, ti tiene qualcos'altro
//       [M] mobility   — attivo, ci arrivi tu
//
// Salvo indicazione diversa: tenute 30", intensità 30-40%.
//
// `video` è valorizzato SOLO dove esiste davvero un video della fonte
// (protocollo bacino). Altrove è null e comanda l'animazione: non
// invento id YouTube, punterebbero a contenuti a caso.

const DURATA_STD = 30;

// ============================ G1 · COLLO ============================
// Sempre attivo, mai in rotazione. Allunga a destra, rinforza a sinistra.
const G1 = {
  id: "G1", nome: "Collo", sempreAttivo: true,
  intensita: "30-40% e mai oltre",
  avviso: "Stop assoluto con vertigini, formicolii alle braccia, cefalea o dolore. Il riflesso miotatico cervicale è particolarmente reattivo: spingere ottiene l'opposto.",
  esercizi: [
    { id: "g1-flex-lat", nome: "Flessione laterale destra", tag: "S", lato: "dx", volte: 2,
      serve: "Una sedia", muscoli: ["Trapezio superiore"], animazione: "collo-flessione-laterale",
      passi: [
        "Seduto, schiena dritta.",
        "Mano sinistra al bordo della sedia: blocca la spalla in basso.",
        "Orecchio sinistro verso la spalla sinistra.",
        "Non ruotare la testa, non alzare il mento.",
      ] },
    { id: "g1-scaleno", nome: "Scaleno destro", tag: "S", lato: "dx",
      serve: "Una sedia", muscoli: ["Scaleni"], animazione: "collo-flessione-laterale",
      passi: [
        "Stessa posizione, spalla bloccata.",
        "Ruota leggermente il mento verso l'ascella sinistra.",
        "Pochi gradi bastano.",
      ] },
    { id: "g1-elevatore", nome: "Elevatore della scapola destro", tag: "S", lato: "dx",
      serve: "Una sedia", muscoli: ["Elevatore della scapola"], animazione: "collo-flessione-laterale",
      passi: [
        "Come la flessione laterale, spalla bloccata.",
        "Porta il naso verso l'ascella sinistra: rotazione opposta allo scaleno.",
      ] },
    { id: "g1-isometria", nome: "Isometria sinistra", tag: "M", lato: "sx",
      serve: "Nessun attrezzo", muscoli: ["Flessori laterali del collo"], animazione: "collo-isometria",
      ripetizioni: "5 × 5\"",
      passi: [
        "Mano sinistra sulla tempia sinistra.",
        "La testa spinge contro la mano, la mano resiste.",
        "La testa non si muove di un millimetro.",
        "Pressione leggera. 5 secondi, poi rilascia.",
      ] },
    { id: "g1-flex-attiva", nome: "Flessione laterale attiva sinistra", tag: "M", lato: "sx",
      serve: "Nessun attrezzo", muscoli: ["Flessori laterali del collo"], animazione: "collo-flessione-laterale",
      ripetizioni: "8 lente",
      passi: [
        "Senza mani, spalle basse.",
        "Orecchio verso la spalla sinistra e ritorno.",
        "Solo i muscoli del collo, nessun aiuto.",
      ] },
    { id: "g1-chin-tuck", nome: "Retrazione cervicale (chin tuck)", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Flessori profondi del collo"], animazione: "collo-chin-tuck",
      ripetizioni: "10 × 3\"",
      passi: [
        "Sguardo all'orizzonte.",
        "Fai scorrere il mento indietro, come un doppio mento.",
        "Il mento non si abbassa: si muove in orizzontale.",
      ] },
  ],
};

// ==================== G2 · CAVIGLIA E POLPACCI ====================
const G2 = {
  id: "G2", nome: "Caviglia e polpacci", priorita: "alta (shin splints)",
  esercizi: [
    { id: "g2-gastro", nome: "Gastrocnemio", tag: "S", perLato: true,
      serve: "Un muro", muscoli: ["Gastrocnemio"], animazione: "polpaccio-muro",
      passi: ["Mani al muro.", "Gamba dietro tesa, ginocchio bloccato.", "Tallone incollato a terra."] },
    { id: "g2-soleo", nome: "Soleo", tag: "S", perLato: true,
      serve: "Un muro", muscoli: ["Soleo"], animazione: "polpaccio-muro",
      nota: "Bersaglio completamente diverso dal gastrocnemio: non saltarlo.",
      passi: ["Stessa posizione del gastrocnemio.", "Piega il ginocchio dietro.", "Tallone sempre a terra."] },
    { id: "g2-knee-wall", nome: "Knee-to-wall", tag: "M", perLato: true,
      serve: "Un muro", muscoli: ["Caviglia"], animazione: "caviglia-knee-to-wall",
      ripetizioni: "10 × 3\"", nota: "È il test e l'esercizio insieme.",
      passi: ["Piede a 10 cm dal muro.", "Ginocchio in avanti oltre le dita.", "Il tallone non si stacca mai."] },
    { id: "g2-talloni", nome: "Sollevamenti sui talloni", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Tibiale anteriore"], animazione: "generica",
      ripetizioni: "15 lente", nota: "Protettivo diretto sugli shin splints: è l'antagonista.",
      passi: ["In piedi, peso sui talloni.", "Solleva le punte più che puoi.", "Scendi lentamente."] },
    { id: "g2-accosciata", nome: "Tenuta in accosciata profonda", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Caviglie", "Adduttori"], animazione: "squat-tenuta", durataSec: 45,
      passi: ["Accosciata piena, talloni a terra.", "Gomiti dentro le ginocchia.", "Spingi le ginocchia in fuori."] },
    { id: "g2-plantare", nome: "Fascia plantare su foam roller", tag: "S", perLato: true,
      serve: "Foam roller o pallina", muscoli: ["Fascia plantare"], animazione: "generica", durataSec: 60,
      passi: ["Piede sopra il roller o la pallina.", "Rotola lentamente dal tallone alle dita.", "Fermati sui punti dolenti."] },
  ],
};

// ======================== G3 · FEMORALI ========================
const G3 = {
  id: "G3", nome: "Femorali", nota: "Il range passivo c'è già. Il limite è il controllo, non la lunghezza.",
  esercizi: [
    { id: "g3-aslr", nome: "Active straight leg raise", tag: "M", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Femorali", "Flessori d'anca"], animazione: "aslr",
      ripetizioni: "8 lente", nota: "L'esercizio più importante di questo gruppo.",
      passi: ["Supino, schiena a terra.", "Una gamba tesa sale il più possibile.", "Senza slancio e senza mani.", "Scendi più lento di quanto sali."] },
    { id: "g3-aslr-ecc", nome: "ASLR eccentrico", tag: "M", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Femorali"], animazione: "aslr", ripetizioni: "6 per lato",
      passi: ["Sali con il ginocchio piegato: superi il limite.", "Arrivato in alto, distendi il ginocchio.", "Scendi lentamente a gamba tesa."] },
    { id: "g3-femorale-piedi", nome: "Femorale in piedi", tag: "S", perLato: true,
      serve: "Un rialzo basso", muscoli: ["Femorali"], animazione: "generica",
      nota: "Inibizione reciproca: contrai il quadricipite mentre allunghi, il femorale si spegne per riflesso.",
      passi: ["Tallone su un rialzo basso.", "Scendi con la schiena DRITTA, non arrotondata.", "Contrai il quadricipite della gamba che allunghi."] },
    { id: "g3-pike", nome: "Pike seduto", tag: "S",
      serve: "Solo il pavimento", muscoli: ["Femorali", "Addominali"], animazione: "pike-seduto",
      ripetizioni: "5 × 5\"",
      passi: ["Seduto, gambe tese unite.", "Tirati giù con gli addominali.", "Le braccia non tirano."] },
    { id: "g3-femorale-supino", nome: "Femorale supino con cinghia", tag: "S", perLato: true,
      serve: "Un asciugamano", muscoli: ["Femorali"], animazione: "generica",
      nota: "Il più controllabile come intensità: usalo per stare davvero al 30-40%.",
      passi: ["Supino, asciugamano attorno al piede.", "Gamba tesa che sale, tirata dall'asciugamano.", "L'altra gamba resta a terra."] },
  ],
};

// ===================== G4 · FLESSORI D'ANCA =====================
const G4 = {
  id: "G4", nome: "Flessori d'anca", nota: "Il gruppo che la corsa accorcia di più.",
  esercizi: [
    { id: "g4-affondo", nome: "Affondo in ginocchio con retroversione", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Psoas", "Retto femorale"], animazione: "affondo-flessori",
      nota: "Senza la retroversione non allunghi niente: è l'errore più comune in assoluto.",
      passi: ["In ginocchio, l'altro piede avanti.", "Porta il coccige sotto: retroversione del bacino.", "Solo ora spingi il bacino in avanti."] },
    { id: "g4-couch", nome: "Couch stretch", tag: "S", perLato: true,
      serve: "Un rialzo o il divano", muscoli: ["Retto femorale", "Psoas"], animazione: "affondo-flessori",
      nota: "Versione intensa: si esagera facilissimo, tienila al 30-40%.",
      passi: ["Piede posteriore su un rialzo, ginocchio a terra.", "Busto eretto.", "Mantieni il coccige sotto."] },
    { id: "g4-ginocchio-petto", nome: "Ginocchio al petto attivo in piedi", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Flessori d'anca"], animazione: "generica", ripetizioni: "8 × 3\"",
      passi: ["In piedi, senza appoggi.", "Il ginocchio sale il più possibile, senza mani.", "Resta su 3 secondi."] },
    { id: "g4-ponte", nome: "Ponte glutei", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Glutei"], animazione: "ponte-glutei", ripetizioni: "12 lente",
      nota: "L'antagonista: inibizione reciproca sul flessore.",
      passi: ["Supino, piedi a terra vicino ai glutei.", "Spingi il bacino in alto.", "Stringi i glutei in cima."] },
    { id: "g4-psoas-roller", nome: "Psoas su foam roller", tag: "S", perLato: true,
      serve: "Foam roller", muscoli: ["Psoas"], animazione: "generica", durataSec: 60,
      passi: ["A pancia sotto, roller sotto la cresta iliaca.", "Resta fermo e respira.", "Niente rotolamenti veloci."] },
  ],
};

// ============ G5 · ADDUTTORI E ROTATORI D'ANCA (bersaglio) ============
const G5 = {
  id: "G5", nome: "Adduttori e rotatori d'anca", sempreAttivo: true,
  nota: "Il gruppo bersaglio: 3 cm di asimmetria in farfalla. Volume doppio sul lato più stretto.",
  esercizi: [
    { id: "g5-farfalla", nome: "Farfalla", tag: "S",
      serve: "Solo il pavimento", muscoli: ["Adduttori"], animazione: "farfalla",
      passi: ["Piante dei piedi unite, talloni verso il bacino.", "Le ginocchia scendono per gravità.", "Non spingerle con le mani: qui si misura."] },
    { id: "g5-frog", nome: "Frog rock back", tag: "S",
      serve: "Solo il pavimento", muscoli: ["Adduttori"], animazione: "frog-rock",
      nota: "Sicuro per il menisco: nessuna torsione.",
      passi: ["Quadrupedia, ginocchia larghe.", "Interno di piedi e ginocchia a terra.", "Spingi il bacino indietro, lento.", "8 oscillazioni, poi tenuta."] },
    { id: "g5-9090", nome: "90/90", tag: "S", perLato: true, extraLatoStretto: true,
      serve: "Solo il pavimento", muscoli: ["Rotatori esterni d'anca"], animazione: "novanta-novanta",
      passi: ["Una gamba davanti a 90°, l'altra di lato a 90°.", "Siediti dritto sulle ossa del bacino.", "Petto verso la gamba davanti, schiena lunga."] },
    { id: "g5-figure4", nome: "Figure-4 supina", tag: "S", perLato: true, extraLatoStretto: true,
      serve: "Solo il pavimento", muscoli: ["Piriforme", "Gluteo"], animazione: "figure-4",
      nota: "Sostituisce la pigeon: stessa rotazione esterna, nessuna torsione del ginocchio (filtro menisco sinistro).",
      passi: ["Supino, ginocchia piegate.", "Caviglia sopra il ginocchio opposto: forma un 4.", "Tira verso di te la coscia sotto."] },
    { id: "g5-hip-switch", nome: "90/90 hip switch", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Rotatori d'anca"], animazione: "novanta-novanta", ripetizioni: "8 passaggi",
      nota: "Il migliore per il pavimento, non per il soffitto: range attivo.",
      passi: ["Dalla posizione 90/90.", "Ruota le gambe fino al 90/90 opposto.", "Senza usare le mani."] },
    { id: "g5-cossack", nome: "Cossack squat", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Adduttori"], animazione: "cossack", ripetizioni: "6 per lato",
      nota: "Adduttore sotto carico in allungamento: è quello che sposta davvero la farfalla.",
      passi: ["Piedi molto larghi.", "Scendi su una gamba, l'altra resta tesa.", "Punta del piede teso verso l'alto."] },
    { id: "g5-affondo-lat", nome: "Adduttore in affondo laterale", tag: "S", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Adduttori"], animazione: "cossack",
      passi: ["Piedi larghi, scendi su un lato.", "La gamba opposta resta tesa.", "Tieni la posizione."] },
    { id: "g5-abduzione", nome: "Abduzione sdraiato", tag: "M", perLato: true, doppioADestra: true,
      serve: "Solo il pavimento", muscoli: ["Medio gluteo"], animazione: "abduzione-laterale",
      nota: "12 a sinistra, 20 a destra: piolo deficit di forza sul lato della bandelletta.",
      passi: ["Sdraiato sul fianco, corpo in linea.", "La gamba sopra sale lenta.", "Non ruotare il bacino indietro."] },
  ],
};

// ================== G6 · GLUTEI E BANDELLETTA ==================
const G6 = {
  id: "G6", nome: "Glutei e bandelletta",
  avviso: "Mai foam-rollare la bandelletta: è tessuto connettivo, non contrattile. Rollarla non la allunga, fa solo male. Si lavora su TFL e gluteo.",
  esercizi: [
    { id: "g6-piriforme", nome: "Gluteo/piriforme figure-4", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Piriforme", "Gluteo"], animazione: "figure-4",
      nota: "A sinistra usa sempre la versione supina (filtro menisco).",
      passi: ["Supino, forma il 4 con le gambe.", "Tira la coscia verso il petto."] },
    { id: "g6-tfl", nome: "TFL e gluteo destro, doppio tempo", tag: "S", perLato: true, doppioADestra: true,
      serve: "Nessun attrezzo", muscoli: ["TFL", "Gluteo"], animazione: "generica",
      nota: "30\" a sinistra, 60\" a destra.",
      passi: ["In piedi, gamba destra incrociata dietro la sinistra.", "Spingi il bacino verso destra.", "Allunga il braccio sopra la testa."] },
    { id: "g6-roller", nome: "Foam roller su TFL e gluteo", tag: "S", perLato: true,
      serve: "Foam roller", muscoli: ["TFL", "Gluteo"], animazione: "generica", durataSec: 60,
      passi: ["Roller sotto il gluteo o appena sotto la cresta iliaca.", "Mai sulla bandelletta laterale.", "Lento, fermandoti sui punti densi."] },
  ],
};

// ====================== G7 · QUADRICIPITI ======================
const G7 = {
  id: "G7", nome: "Quadricipiti",
  avviso: "Filtro menisco sinistro: nelle prime 4 settimane niente flessione profonda di ginocchio sotto carico a sinistra.",
  esercizi: [
    { id: "g7-quad-piedi", nome: "Quadricipite in piedi", tag: "S", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Quadricipite"], animazione: "generica",
      passi: ["Tallone verso il gluteo.", "Il ginocchio punta a terra, non in avanti.", "Bacino in retroversione."] },
    { id: "g7-couch", nome: "Couch stretch", tag: "S", perLato: true,
      serve: "Un rialzo", muscoli: ["Quadricipite", "Psoas"], animazione: "affondo-flessori",
      passi: ["Piede posteriore su un rialzo.", "Busto eretto, coccige sotto."] },
    { id: "g7-bulgaro", nome: "Squat bulgaro a corpo libero", tag: "M", perLato: true,
      serve: "Un rialzo", muscoli: ["Quadricipite"], animazione: "generica", ripetizioni: "8 per lato",
      passi: ["Piede dietro su un rialzo.", "Scendi controllando.", "Controllo in allungamento, non profondità."] },
  ],
};

// ================== G8 · TORACICA E DORSALE ==================
const G8 = {
  id: "G8", nome: "Toracica e dorsale", nota: "È il gruppo che porta l'overhead.",
  esercizi: [
    { id: "g8-gran-dorsale", nome: "Gran dorsale con lombare flessa", tag: "S", perLato: true,
      serve: "Una sedia", muscoli: ["Gran dorsale"], animazione: "gran-dorsale",
      nota: "Con la schiena arrotondata, altrimenti allunghi gli estensori invece del bersaglio.",
      passi: ["In ginocchio davanti alla sedia, avambraccio sul sedile.", "ARROTONDA la schiena bassa.", "Lascia scendere il petto."] },
    { id: "g8-estensione", nome: "Estensione toracica su foam roller", tag: "M",
      serve: "Foam roller", muscoli: ["Toracica"], animazione: "estensione-toracica", ripetizioni: "8 lente",
      passi: ["Roller trasversale sotto le scapole.", "Mani dietro la testa.", "Estendi indietro lentamente."] },
    { id: "g8-prone-liftoff", nome: "Prone lift-off", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Trapezio inferiore"], animazione: "prone-liftoff", ripetizioni: "8 × 3\"",
      nota: "È l'esercizio che chiude il gap sull'overhead.",
      passi: ["Pancia sotto, braccia distese avanti.", "Staccale da terra.", "Le costole restano giù, non inarcare."] },
    { id: "g8-wall-slide", nome: "Wall slide", tag: "M",
      serve: "Un muro", muscoli: ["Dentato anteriore", "Cuffia"], animazione: "wall-slide", ripetizioni: "10 lente",
      passi: ["Lombare piatta contro il muro.", "Dorso delle mani e gomiti al muro.", "Scorri in alto senza staccare nulla."] },
    { id: "g8-child", nome: "Child's pose con braccia lunghe", tag: "S",
      serve: "Solo il pavimento", muscoli: ["Gran dorsale", "Toracica"], animazione: "gran-dorsale", durataSec: 45,
      passi: ["Seduto sui talloni, braccia lunghe avanti.", "Petto verso il pavimento.", "Respira lungo."] },
  ],
};

// ==================== G9 · PETTO E SPALLE ====================
const G9 = {
  id: "G9", nome: "Petto e spalle",
  esercizi: [
    { id: "g9-pettorale", nome: "Pettorale su stipite", tag: "S", perLato: true,
      serve: "Uno stipite", muscoli: ["Pettorale"], animazione: "generica",
      nota: "Tre altezze diverse (basso, medio, alto): sono tre porzioni diverse del muscolo.",
      passi: ["Gomito a 90° contro lo stipite.", "Ruota il busto in avanti.", "Cambia altezza del gomito a ogni serie."] },
    { id: "g9-rot-esterna", nome: "Rotazione esterna di spalla", tag: "S", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Sottoscapolare", "Grande rotondo"], animazione: "generica",
      passi: ["Braccio a 90°, gomito al fianco.", "Ruota l'avambraccio verso l'esterno.", "Senza staccare il gomito."] },
    { id: "g9-circonduzioni", nome: "Circonduzioni con bastone", tag: "M",
      serve: "Un manico di scopa", muscoli: ["Spalle"], animazione: "generica", ripetizioni: "8 lente",
      nota: "Il bastone rende il range misurabile: si stringe la presa nel tempo.",
      passi: ["Presa larga sul bastone.", "Porta le braccia sopra e dietro la testa.", "Braccia sempre tese."] },
    { id: "g9-tricipite", nome: "Tricipite overhead", tag: "S", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Tricipite"], animazione: "generica",
      passi: ["Gomito in alto vicino all'orecchio.", "La mano scende dietro la schiena.", "L'altra mano accompagna il gomito."] },
  ],
};

// ============= PROTOCOLLO BACINO (entra dalla settimana 3) =============
const BACINO = {
  id: "BACINO", nome: "Bacino — protocollo laterale",
  nota: "L'espirazione è l'esercizio: lunga e completa, finché le costole scendono e gli addominali si chiudono.",
  // ridotto = i 3 esercizi delle settimane 3-4
  esercizi: [
    { id: "A1", sigla: "A1", nome: "Sdraiato sul fianco, spinta di gluteo", tag: "M",
      ruoloLato: "lat", video: "pPmIKpPJP7c", serve: "Solo il pavimento", ridotto: true,
      muscoli: ["Gluteo medio"], animazione: "sidelying-gluteo", durataSec: 40,
      passi: [
        "Sdraiati sul fianco d'appoggio, ginocchia piegate.",
        "Cerca i due contatti: tallone interno e cuscinetto sotto l'alluce.",
        "Espira fino in fondo, poi spingi su quei punti.",
        "5-10 respiri.",
      ] },
    { id: "A2", sigla: "A2", nome: "Esercizio A2", tag: "M", ruoloLato: "lat", video: "O9PSPzyhozs",
      serve: "Solo il pavimento", videoDecide: true, muscoli: ["Anca laterale"], animazione: "generica", durataSec: 40,
      passi: ["Guarda il video e assumi quella posizione.", "Carica il lato indicato.", "Espira lungo, 5-10 respiri."] },
    { id: "A3", sigla: "A3", nome: "Esercizio A3", tag: "M", ruoloLato: "lat", video: "r8t2tgUnF9k",
      serve: "Solo il pavimento", videoDecide: true, muscoli: ["Quadricipite"], animazione: "generica", durataSec: 40,
      passi: ["Guarda il video e assumi quella posizione.", "Carica il lato indicato.", "Espira lungo, 5-10 respiri."] },
    { id: "B1", sigla: "B1", nome: "Allungo sopra la testa", tag: "M", ruoloLato: "away", video: "bb1poiG5DFA",
      serve: "Solo il pavimento", ridotto: true, muscoli: ["Obliqui"], animazione: "allungo-sopra-testa", durataSec: 40,
      passi: [
        "Peso sul tallone del lato di lavoro.",
        "Allunga sopra la testa il braccio del lato opposto.",
        "Espira fino in fondo mentre allunghi.",
        "5-10 respiri.",
      ] },
    { id: "B2", sigla: "B2", nome: "Esercizio B2", tag: "M", ruoloLato: "away", video: "IiIF7jpAj1U",
      serve: "Solo il pavimento", videoDecide: true, muscoli: ["Adduttori"], animazione: "generica", durataSec: 40,
      passi: ["Guarda il video e assumi quella posizione.", "Il contatto che comanda è il tallone.", "Espira lungo, 5-10 respiri."] },
    { id: "B3", sigla: "B3", nome: "Esercizio B3", tag: "M", ruoloLato: "away", video: "5-NPvHbyf7c",
      serve: "Solo il pavimento", ridotto: true, videoDecide: true, muscoli: ["Femorali"], animazione: "generica", durataSec: 40,
      passi: ["Guarda il video e assumi quella posizione.", "Il contatto che comanda è il tallone.", "Espira lungo, 5-10 respiri."] },
  ],
};

const GRUPPI = { G1, G2, G3, G4, G5, G6, G7, G8, G9 };

// ==================== ROTAZIONE DEI GRUPPI ATTIVI ====================
// G5 e collo non escono mai: sono le due asimmetrie vere.
const BLOCCHI_ROTAZIONE = [
  { id: "A", settimane: [1, 4], attivi: ["G1", "G5", "G2"] },
  { id: "B", settimane: [5, 8], attivi: ["G1", "G5", "G4", "G3"] },
  { id: "C", settimane: [9, 12], attivi: ["G1", "G5", "G8", "G6"] },
];

// ================== PROGRESSIONE DEL TEMPO ==================
// Il tempo cresce con l'abitudine, non parte al massimo.
const PROGRESSIONE = [
  { settimane: [1, 2], minuti: 5, bacino: false, note: "Solo collo + 2 gruppi attivi. Nient'altro." },
  { settimane: [3, 4], minuti: 8, bacino: "ridotto", note: "Entra il bacino in versione ridotta." },
  { settimane: [5, 6], minuti: 12, bacino: "completo", note: "Bacino completo, terzo gruppo attivo." },
  { settimane: [7, 8], minuti: 15, bacino: "completo", note: "Entra la sessione MOBILITY in palestra." },
  { settimane: [9, 99], minuti: 18, bacino: "completo", note: "Stabile. Ruotano i gruppi, non il tempo." },
];

const TIPI_SESSIONE = {
  quotidiana: { id: "quotidiana", nome: "Quotidiana", domanda: "Niente di particolare", icona: "casa" },
  "post-corsa": { id: "post-corsa", nome: "Post-corsa", domanda: "Ho corso", icona: "onda", tag: "S", minuti: 10,
    ordine: ["G2", "G4", "G7", "G3", "G6", "G5"], nota: "Sei caldo: è il momento migliore. Sostituisce la quotidiana, non si somma." },
  "post-palestra": { id: "post-palestra", nome: "Post-palestra", domanda: "Sono stato in palestra", icona: "corpo", tag: "S", minuti: 8,
    nota: "I distretti allenati oggi, poi collo ridotto." },
  mobility: { id: "mobility", nome: "Mobility", domanda: "È il giorno mobility", icona: "bersaglio", tag: "M", minuti: 25,
    nota: "È allenamento, va sul calendario Fitness. Mai il giorno dopo le gambe." },
  minima: { id: "minima", nome: "Dose minima", domanda: "Non ce la faccio", icona: "orologio", minuti: 2,
    nota: "Collo + un allungamento. La sessione non è mai zero." },
};

const DISTRETTI_PALESTRA = {
  spinta: ["G9", "G8"],
  trazione: ["G8", "G9"],
  gambe: ["G2", "G4", "G3", "G6"],
};

function gruppiAttiviPerSettimana(settimana) {
  const blocco = BLOCCHI_ROTAZIONE.find((b) => settimana >= b.settimane[0] && settimana <= b.settimane[1]);
  return blocco || BLOCCHI_ROTAZIONE[BLOCCHI_ROTAZIONE.length - 1];
}

function fasePerSettimana(settimana) {
  return PROGRESSIONE.find((p) => settimana >= p.settimane[0] && settimana <= p.settimane[1]) || PROGRESSIONE[0];
}

export {
  GRUPPI, G1, G2, G3, G4, G5, G6, G7, G8, G9, BACINO,
  BLOCCHI_ROTAZIONE, PROGRESSIONE, TIPI_SESSIONE, DISTRETTI_PALESTRA,
  DURATA_STD, gruppiAttiviPerSettimana, fasePerSettimana,
};
