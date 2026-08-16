// esercizi.js — LIBRERIA (PROGRAMMA-v3), costruita su GOWOD.
//
// TRE SESSIONI, non un menu:
//   1. POST-CORSA   — fissa, nessuna progressione, dopo ogni corsa
//   2. QUOTIDIANO   — a casa, ogni giorno, progressione 10 → 20 min
//   3. LOADED       — palestra, 1×/settimana, progressione a carichi
// È l'app a scegliere quale: l'unica domanda è "hai corso oggi?".
//
// VIDEO — priorità assoluta al canale GOWOD (@gowod_mobilityfirst).
// Sono follow-along brevi, un esercizio per video, formato identico su
// tutta la libreria: è esattamente il formato che serve qui. Tutti gli
// id sono stati verificati con l'API oEmbed di YouTube: esistono e il
// canale risulta GOWOD.
//
// DOVE NON È GOWOD, ed è dichiarato esercizio per esercizio:
//   · il COLLO — sul canale c'è solo il Trap Stretch, e il collo è
//     l'obiettivo non negoziabile: gli altri quattro restano su video
//     di fisioterapia, anch'essi verificati;
//   · la palestra (LOADED) — GOWOD non fa lavoro sotto carico.
//
// ESCLUSI DI PROPOSITO: tutti gli esercizi GOWOD "Banded". Servono un
// elastico, che non hai (SPEC §2: foam roller, muro, sedia, pavimento).
// Dove esisteva la versione con e senza elastico, ho preso quella senza.

const DURATA_STD = 30;
const FONTE_GOWOD = "GOWOD";

// ====================== G1 · COLLO ======================
// Allunga a DESTRA, rinforza a SINISTRA.
const G1 = {
  id: "G1", nome: "Collo", sempreAttivo: true,
  intensita: "30-40% e mai oltre",
  avviso: "Stop assoluto con vertigini, formicolii alle braccia, cefalea o dolore. Il riflesso cervicale è particolarmente reattivo: spingere ottiene l'opposto.",
  esercizi: [
    { id: "g1-trap", video: "Rv0IddxviE0", fonte: FONTE_GOWOD, nome: "Trap stretch destro", tag: "S", lato: "dx", volte: 2,
      serve: "Una sedia", muscoli: ["Trapezio superiore"],
      passi: ["Seduto, schiena dritta.", "Mano sinistra sotto la sedia: blocca la spalla in basso.", "Orecchio sinistro verso la spalla sinistra.", "Non ruotare la testa, non alzare il mento."] },
    { id: "g1-scaleno", video: "DwdEkATOppo", nome: "Scaleno destro", tag: "S", lato: "dx",
      serve: "Una sedia", muscoli: ["Scaleni"],
      nota: "Non è GOWOD: sul canale il collo è coperto solo dal trap stretch.",
      passi: ["Stessa posizione, spalla bloccata.", "Ruota il mento verso l'ascella sinistra.", "Pochi gradi bastano."] },
    { id: "g1-elevatore", video: "ZsFdEpVKu_c", nome: "Elevatore della scapola destro", tag: "S", lato: "dx",
      serve: "Una sedia", muscoli: ["Elevatore della scapola"],
      passi: ["Spalla destra bloccata in basso.", "Naso verso l'ascella sinistra: rotazione opposta allo scaleno."] },
    // Protocollo del fisioterapista, non da video: spingi con l'orecchio
    // sinistro verso la spalla sinistra mentre la mano contrasta, 5
    // secondi, stop, e si riprende. Il ROM del collo scende a ogni
    // ripetizione — è quello il segnale che sta funzionando.
    // Niente video di proposito: la descrizione basta, e nessun video
    // trovato mostrava questa versione.
    { id: "g1-isometria", video: null, nome: "Isometria del collo — 5 spinte", tag: "M", lato: "sx",
      serve: "Nessun attrezzo", muscoli: ["Flessori laterali sinistri"],
      ripetuto: { volte: 5, lavoroSec: 5, pausaSec: 5 },
      nota: "A ogni ripetizione il collo scende un po' di più: è il segno che il riflesso si sta spegnendo. Pressione leggera, mai forte.",
      passi: [
        "Mano SINISTRA aperta contro la tempia sinistra.",
        "Spingi l'orecchio sinistro VERSO la spalla sinistra, la mano contrasta.",
        "La testa non si muove: è isometria. Cinque secondi.",
        "Rilascia del tutto e senti il collo scendere. Poi riparti.",
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
    { id: "g2-calf-wall", video: "5C24Pv4ahVg", fonte: FONTE_GOWOD, nome: "Calf stretch al muro", tag: "S", perLato: true,
      serve: "Un muro", muscoli: ["Gastrocnemio"],
      passi: ["Mani al muro.", "Gamba dietro tesa, ginocchio bloccato.", "Tallone incollato a terra."] },
    { id: "g2-achilleo", video: "D9QiY_FejM0", fonte: FONTE_GOWOD, nome: "Achilleo assistito al muro", tag: "S", perLato: true,
      serve: "Un muro", muscoli: ["Soleo", "Achilleo"],
      nota: "Ginocchio piegato: bersaglio diverso dal gastrocnemio, non saltarlo.",
      passi: ["Avampiede contro il muro, tallone a terra.", "Piega il ginocchio e avvicina il bacino.", "Tallone sempre a terra."] },
    { id: "g2-ankle-mob", video: "lwSExRmYENQ", fonte: FONTE_GOWOD, nome: "Mobilizzazione di caviglia", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Caviglia"], ripetizioni: "10 × 3\"",
      nota: "È il knee-to-wall: test ed esercizio insieme.",
      passi: ["Ginocchio in avanti oltre le dita.", "Il tallone non si stacca mai.", "Se si stacca, arretra il ginocchio."] },
    { id: "g2-calf-ecc", video: "2DlMhr-gY60", fonte: FONTE_GOWOD, nome: "Calf activation eccentrica", tag: "M", perLato: true,
      serve: "Un gradino", muscoli: ["Polpaccio", "Achilleo"], ripetizioni: "15 per lato",
      nota: "L'eccentrica è il pezzo che conta: 3-4 secondi in discesa.",
      passi: ["Avampiede sul gradino.", "Sali con due piedi.", "Scendi lentamente con UNO solo.", "Risali sempre con due."] },
    { id: "g2-calf-att", video: "paqfvHciOTs", fonte: FONTE_GOWOD, nome: "Calf activation alternata", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Polpaccio", "Tibiale anteriore"], ripetizioni: "15 lente",
      passi: ["In piedi, peso distribuito.", "Alterna sollevamento su punte e su talloni.", "Controllato, senza rimbalzare."] },
    { id: "g2-calf-roll", video: "Zr4nzhFQKtA", fonte: FONTE_GOWOD, nome: "Calf roll (foam roller)", tag: "R", perLato: true,
      serve: "Foam roller", muscoli: ["Polpaccio"], durataSec: 60,
      passi: ["Polpaccio sopra il roller, seduto a terra.", "Rotola lento dalla caviglia al ginocchio.", "Fermati sui punti densi e respira."] },
    { id: "g2-ankle-rolls", video: "zHqfCkjDyXA", fonte: FONTE_GOWOD, nome: "Ankle rolls", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Caviglia"], ripetizioni: "10 per verso",
      passi: ["Piede sollevato.", "Circonduzioni ampie e lente della caviglia.", "Dieci per verso."] },
    { id: "g2-deep-squat", video: "_kTB1ilKMuA", fonte: FONTE_GOWOD, nome: "Active deep squat", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Caviglie", "Adduttori"], durataSec: 45,
      passi: ["Accosciata piena, talloni a terra.", "Gomiti dentro le ginocchia.", "Spingi le ginocchia in fuori."] },
    { id: "g2-dog-calf", video: "pA7xyM3S7LI", fonte: FONTE_GOWOD, nome: "Calf stretch nel cane a testa in giù", tag: "M", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Polpaccio", "Achilleo", "Femorali"], ripetizioni: "8 pedalate per lato",
      nota: "La pedalata: un tallone scende mentre l'altro ginocchio si piega. Polpacci e femorali insieme, che dopo la corsa è quello che serve.",
      passi: ["Cane a testa in giù, mani ben piantate.", "Piega un ginocchio e spingi il tallone opposto a terra.", "Alterna lentamente, senza rimbalzare."] },
    { id: "g2-squat-stand", video: "bpdav7vOpDw", fonte: FONTE_GOWOD, nome: "Squat to stand", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Femorali", "Anche"], ripetizioni: "8 lente",
      passi: ["Mani sotto le punte dei piedi.", "Scendi in accosciata tenendo il petto alto.", "Risali distendendo le gambe senza mollare le mani."] },
  ],
};

// ====================== G3 · FEMORALI ======================
const G3 = {
  id: "G3", nome: "Femorali", nota: "Il range passivo c'è già: il limite è il controllo, non la lunghezza.",
  esercizi: [
    { id: "g3-ham-att", video: "-OCqZevoVPM", fonte: FONTE_GOWOD, nome: "Hamstrings activation", tag: "M", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Femorali"], ripetizioni: "8 lente",
      nota: "È il range ATTIVO: l'esercizio che conta di più per il pike.",
      passi: ["Supino, schiena a terra.", "Gamba tesa che sale il più possibile.", "Senza slancio e senza mani.", "Scendi più lento di quanto sali."] },
    { id: "g3-ham-din", video: "RD0M6RtKsVw", fonte: FONTE_GOWOD, nome: "Hamstring stretch dinamico", tag: "M", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Femorali"], ripetizioni: "8 per lato",
      passi: ["Alterna le gambe con controllo.", "Nessuno slancio: comanda la muscolatura.", "Arriva al limite e torna."] },
    { id: "g3-ham-kneel", video: "yKj1k5SmfE4", fonte: FONTE_GOWOD, nome: "Kneeling hamstring stretch", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Femorali"],
      nota: "Inibizione reciproca: contrai il quadricipite mentre allunghi.",
      passi: ["In ginocchio, una gamba tesa avanti.", "Scendi con la schiena DRITTA, non arrotondata.", "Punta del piede verso di te."] },
    { id: "g3-ham", video: "x-e3GGj4O0M", fonte: FONTE_GOWOD, nome: "Hamstring stretch", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Femorali"],
      passi: ["Allunga il femorale a terra.", "Intensità 30-40%: quasi comodo.", "Respira, non trattenere."] },
    { id: "g3-knight-ham", video: "d50TF_8Wvv4", fonte: FONTE_GOWOD, nome: "Standing knight to hamstring", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Femorali", "Flessori d'anca"], ripetizioni: "8 per lato",
      passi: ["Dall'affondo, sposta il peso indietro.", "Gamba avanti che si distende.", "Alterna avanti e indietro con controllo."] },
    { id: "g3-ham-roll", video: "jDIytIZhuxE", fonte: FONTE_GOWOD, nome: "Hamstring roll (foam roller)", tag: "R", perLato: true,
      serve: "Foam roller", muscoli: ["Femorali"], durataSec: 60,
      passi: ["Seduto, femorale sopra il roller.", "Rotola dal ginocchio al gluteo.", "Fermati sui punti densi."] },
    { id: "g3-forward-bend", video: "xHazy-ZcsKE", fonte: FONTE_GOWOD, nome: "Standing forward bend", tag: "S",
      serve: "Nessun attrezzo", muscoli: ["Femorali", "Catena posteriore"],
      passi: ["In piedi, scendi in avanti.", "Lascia andare il collo.", "Ginocchia morbide se serve."] },
    { id: "g3-hinge", video: "lxFJEdmh8tQ", fonte: FONTE_GOWOD, nome: "Active hinge", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Femorali", "Erettori"], ripetizioni: "10 lente",
      passi: ["Schiena neutra, ginocchia morbide.", "Bacino indietro, petto avanti.", "Senti caricare i femorali."] },
  ],
};

// =================== G4 · FLESSORI D'ANCA ===================
const G4 = {
  id: "G4", nome: "Flessori d'anca", nota: "Il gruppo che la corsa accorcia di più.",
  esercizi: [
    { id: "g4-knight", video: "hscXjknpoCs", fonte: FONTE_GOWOD, nome: "Knight stretch", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Psoas", "Retto femorale"],
      nota: "Porta il coccige SOTTO prima di spingere: senza retroversione non allunghi niente.",
      passi: ["In ginocchio, l'altro piede avanti.", "Coccige sotto: retroversione.", "Solo ora spingi il bacino avanti."] },
    { id: "g4-samson", video: "e40H2lwxRD8", fonte: FONTE_GOWOD, nome: "Active samson stretch", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Psoas"], ripetizioni: "8 per lato",
      passi: ["Affondo profondo, braccia sopra la testa.", "Bacino che scende in avanti.", "Busto eretto, costole giù."] },
    { id: "g4-forward-lunge", video: "V7tnmLBjyr0", fonte: FONTE_GOWOD, nome: "Forward lunge", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Flessori d'anca", "Quadricipite"], ripetizioni: "8 per lato",
      passi: ["Affondo avanti controllato.", "Ginocchio dietro che sfiora terra.", "Risali spingendo col tallone avanti."] },
    { id: "g4-lunge-twist", video: "z90_c4D8ILU", fonte: FONTE_GOWOD, nome: "Lunge twist", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Psoas", "Toracica"], ripetizioni: "6 per lato",
      passi: ["Dall'affondo, ruota il busto verso la gamba avanti.", "Il bacino resta fermo.", "Torna e ripeti."] },
    { id: "g4-hip-axle", video: "ewrqdxJ0BF4", fonte: FONTE_GOWOD, nome: "The hip axle", tag: "M", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Flessori d'anca", "Rotatori"], ripetizioni: "8 per lato",
      passi: ["Segui il movimento del video.", "Lento, senza compensare con la schiena."] },
    { id: "g4-quad-roll", video: "jLx4kGk9x_M", fonte: FONTE_GOWOD, nome: "Quad roll (foam roller)", tag: "R", perLato: true,
      serve: "Foam roller", muscoli: ["Quadricipite", "Retto femorale"], durataSec: 60,
      passi: ["A pancia sotto, quadricipite sopra il roller.", "Rotola dal ginocchio all'anca.", "Fermati sui punti densi."] },
  ],
};

// ========= G5 · ADDUTTORI E ROTATORI D'ANCA (bersaglio) =========
const G5 = {
  id: "G5", nome: "Adduttori e rotatori d'anca", sempreAttivo: true,
  nota: "Il gruppo bersaglio: 3 cm di asimmetria in farfalla. Volume doppio sul lato più stretto.",
  esercizi: [
    { id: "g5-9090", video: "_I6vFSlcyPY", fonte: FONTE_GOWOD, nome: "90 to 90", tag: "S", perLato: true, extraLatoStretto: true,
      serve: "Solo il pavimento", muscoli: ["Rotatori esterni d'anca"],
      passi: ["Gamba davanti a 90°, l'altra di lato a 90°.", "Siedi dritto sulle ossa del bacino.", "Petto verso la gamba davanti."] },
    { id: "g5-0-90", video: "x4B4eGzo4ME", fonte: FONTE_GOWOD, nome: "0 to 90", tag: "M", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Rotatori d'anca"], ripetizioni: "8 per lato",
      passi: ["Dalla posizione seduta, porta le gambe da 0 a 90.", "Senza usare le mani.", "Controllo, non velocità."] },
    { id: "g5-hip-rot", video: "OPGkLUq65ag", fonte: FONTE_GOWOD, nome: "Hip rotations", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Rotatori d'anca"], ripetizioni: "8 passaggi",
      nota: "È l'hip switch: range attivo, il migliore per il pavimento.",
      passi: ["Dalla 90/90, ruota fino alla 90/90 opposta.", "Senza mani.", "Lento e controllato."] },
    { id: "g5-frog", video: "VBMhdjfG-7M", fonte: FONTE_GOWOD, nome: "The frog", tag: "S",
      serve: "Solo il pavimento", muscoli: ["Adduttori"], nota: "Sicuro per il menisco: nessuna torsione.",
      passi: ["Quadrupedia, ginocchia larghe.", "Interno di piedi e ginocchia a terra.", "Bacino indietro, lento."] },
    { id: "g5-frog-att", video: "1t_LbiqHLEg", fonte: FONTE_GOWOD, nome: "Active frog", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Adduttori"], ripetizioni: "8 oscillazioni",
      passi: ["Dalla posizione della rana.", "Oscilla indietro e torna, attivo.", "Fermati prima che la schiena si arrotondi."] },
    { id: "g5-frog-rot", video: "iJ8_yq9lmjM", fonte: FONTE_GOWOD, nome: "Frog rotation alternata", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Adduttori", "Rotatori"], ripetizioni: "6 per lato",
      passi: ["Dalla rana, ruota il bacino da un lato.", "Alterna con controllo."] },
    { id: "g5-add-roll", video: "jT1lvBxzkTw", fonte: FONTE_GOWOD, nome: "Adductor roll (foam roller)", tag: "R", perLato: true,
      serve: "Foam roller", muscoli: ["Adduttori"], durataSec: 60,
      passi: ["A pancia sotto, interno coscia sopra il roller.", "Rotola dall'inguine al ginocchio.", "Lento, fermandoti sui punti densi."] },
    { id: "g5-cossack", video: "xXwdKm5uLAM", fonte: FONTE_GOWOD, nome: "Cossack squat", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Adduttori"], ripetizioni: "6 per lato",
      nota: "Adduttore sotto carico in allungamento: è quello che sposta davvero la farfalla.",
      passi: ["Piedi molto larghi.", "Scendi su una gamba, l'altra tesa.", "Punta del piede teso verso l'alto."] },
    { id: "g5-half-lotus", video: "5_cOwOuSsxI", fonte: FONTE_GOWOD, nome: "Half lotus al muro", tag: "S", perLato: true, extraLatoStretto: true,
      serve: "Un muro", muscoli: ["Piriforme", "Rotatori esterni"],
      nota: "Versione supina: stessa rotazione esterna della pigeon, senza torcere il ginocchio (filtro menisco sinistro).",
      passi: ["Supino con i piedi al muro.", "Caviglia sopra il ginocchio opposto.", "Avvicina il bacino al muro per aumentare."] },
    { id: "g5-piriforme", video: "6sx9hFoP1lg", fonte: FONTE_GOWOD, nome: "Seated piriformis stretch", tag: "S", perLato: true,
      serve: "Una sedia", muscoli: ["Piriforme", "Gluteo"],
      passi: ["Seduto, caviglia sopra il ginocchio opposto.", "Petto in avanti con la schiena lunga.", "Il ginocchio resta aperto."] },
    { id: "g5-t-hip", video: "CKj_0TdVcsQ", fonte: FONTE_GOWOD, nome: "T-hip opener", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Rotatori d'anca"],
      passi: ["Segui la posizione del video.", "Il bacino resta appoggiato.", "Respira nella posizione."] },
    { id: "g5-v-stretch", video: "siK37i0QDvA", fonte: FONTE_GOWOD, nome: "Standing V stretch", tag: "S",
      serve: "Nessun attrezzo", muscoli: ["Adduttori", "Femorali"],
      passi: ["Piedi molto larghi, gambe tese.", "Scendi in mezzo con la schiena lunga.", "Al 30-40%."] },
    { id: "g5-v-sit", video: "W2k8DMxK7zI", fonte: FONTE_GOWOD, nome: "V sit (divaricata seduta)", tag: "S",
      serve: "Solo il pavimento", muscoli: ["Adduttori", "Femorali"], durataSec: 45,
      nota: "La chiusura della routine post-corsa: interno coscia e femorali insieme, da fermo.",
      passi: ["Seduto, gambe aperte il più possibile.", "Mani dietro il bacino per spingerlo avanti e raddrizzare la schiena.", "Poi, se ci arrivi, mani avanti a terra.", "Respira lento e resta."] },
  ],
};

// =============== G6 · GLUTEI E BANDELLETTA ===============
const G6 = {
  id: "G6", nome: "Glutei e bandelletta",
  avviso: "Mai foam-rollare la bandelletta: è tessuto fibroso, sotto massima contrazione si allunga meno dello 0,2%. Si lavora su TFL e gluteo.",
  esercizi: [
    { id: "g6-glute-roll", video: "vB2SCMJPXp8", fonte: FONTE_GOWOD, nome: "Glute roll (foam roller)", tag: "R", perLato: true, doppioADestra: true,
      serve: "Foam roller", muscoli: ["Gluteo", "TFL"], durataSec: 60,
      nota: "Doppio tempo a destra: è il lato della bandelletta. Sul gluteo e sul TFL, MAI sulla banda laterale.",
      passi: ["Seduto sul roller, caviglia sul ginocchio opposto.", "Rotola sul gluteo.", "Fermati sui punti densi e respira."] },
    // La Glute Activation di GOWOD usa un elastico che non hai: qui il
    // video è di Medbridge, stesso movimento a corpo libero.
    { id: "g6-glute-att", video: "UmmBtOG2N_s", nome: "Abduzione sul fianco", tag: "M", perLato: true, doppioADestra: true,
      serve: "Solo il pavimento", muscoli: ["Medio gluteo"], ripetizioni: "15 sx · 25 dx",
      nota: "Volume doppio a destra: deficit di forza sul lato della bandelletta. Niente elastico, solo il peso della gamba.",
      passi: [
        "Sul fianco, corpo in linea, testa appoggiata.",
        "La gamba sopra sale lenta, tenendo la punta in avanti.",
        "Il bacino NON ruota indietro: è l'errore che sposta il lavoro sul TFL.",
        "Scendi controllando, senza appoggiare del tutto.",
      ] },
  ],
};

// ==================== G7 · QUADRICIPITI ====================
const G7 = {
  id: "G7", nome: "Quadricipiti",
  avviso: "Filtro menisco sinistro: nelle prime 4 settimane niente flessione profonda di ginocchio sotto carico a sinistra.",
  esercizi: [
    { id: "g7-quad", video: "3bWWW81IbPI", fonte: FONTE_GOWOD, nome: "Quad stretch", tag: "S", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Quadricipite"],
      passi: ["Tallone verso il gluteo.", "Il ginocchio punta a terra, non avanti.", "Bacino in retroversione."] },
    { id: "g7-quad-att", video: "7X5BPoaGY38", fonte: FONTE_GOWOD, nome: "Active quad stretch", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Quadricipite"], ripetizioni: "8 per lato",
      passi: ["Senza mani, porta il tallone al gluteo.", "Il bacino resta sotto.", "Controllo in salita e in discesa."] },
    { id: "g7-quad-roll", video: "jLx4kGk9x_M", fonte: FONTE_GOWOD, nome: "Quad roll (foam roller)", tag: "R", perLato: true,
      serve: "Foam roller", muscoli: ["Quadricipite"], durataSec: 60,
      passi: ["A pancia sotto, quadricipite sopra il roller.", "Rotola dal ginocchio all'anca.", "Fermati sui punti densi."] },
  ],
};

// ================ G8 · TORACICA E SPALLE ================
const G8 = {
  id: "G8", nome: "Toracica e spalle", nota: "È il gruppo che porta l'overhead.",
  esercizi: [
    { id: "g8-lat-att", video: "44XRvMezRk0", fonte: FONTE_GOWOD, nome: "Active lat stretch", tag: "M", perLato: true,
      serve: "Nessun attrezzo", muscoli: ["Gran dorsale"], ripetizioni: "8 per lato",
      passi: ["Braccio sopra la testa.", "Allunga attivamente senza inarcare.", "Costole giù."] },
    { id: "g8-prayer-lat", video: "NgCMAnKFm8U", fonte: FONTE_GOWOD, nome: "Prayer lat stretch", tag: "S",
      serve: "Una sedia", muscoli: ["Gran dorsale"],
      nota: "Con la schiena arrotondata: altrimenti allunghi gli estensori invece del bersaglio.",
      passi: ["In ginocchio, avambracci sul sedile.", "ARROTONDA la schiena bassa.", "Lascia scendere il petto."] },
    { id: "g8-prayer-lat-att", video: "6RuHrpxrzlY", fonte: FONTE_GOWOD, nome: "Active prayer lat stretch", tag: "M",
      serve: "Una sedia", muscoli: ["Gran dorsale"], ripetizioni: "8 lente",
      passi: ["Come il prayer lat, ma spingendo attivamente.", "Entra e esci dalla posizione con controllo."] },
    { id: "g8-lat-roll", video: "dxH7xejXRoU", fonte: FONTE_GOWOD, nome: "Lat roll (foam roller)", tag: "R", perLato: true,
      serve: "Foam roller", muscoli: ["Gran dorsale"], durataSec: 60,
      passi: ["Sul fianco, roller sotto l'ascella.", "Rotola lungo il fianco.", "Braccio disteso sopra la testa."] },
    { id: "g8-back-roll-oh", video: "pJ-vGyiymvw", fonte: FONTE_GOWOD, nome: "Back roll in overhead (foam roller)", tag: "M",
      serve: "Foam roller", muscoli: ["Toracica"], ripetizioni: "8 lente",
      nota: "È l'estensione toracica sopra il roller: parte da lì, non dalla lombare.",
      passi: ["Roller trasversale sotto le scapole.", "Braccia sopra la testa.", "Estendi indietro lentamente."] },
    { id: "g8-lower-back-roll", video: "rtQL5rF1fyU", fonte: FONTE_GOWOD, nome: "Lower back roll (foam roller)", tag: "R",
      serve: "Foam roller", muscoli: ["Erettori lombari"], durataSec: 60,
      passi: ["Roller sotto la zona lombo-sacrale.", "Movimenti piccoli e lenti.", "Non rotolare sulla lombare in estensione."] },
    { id: "g8-pec-smash", video: "49EQ5UQJ4yM", fonte: FONTE_GOWOD, nome: "Pec smash (pallina o roller)", tag: "R", perLato: true,
      serve: "Pallina o foam roller", muscoli: ["Pettorale"], durataSec: 60,
      passi: ["Pallina tra pettorale e muro (o pavimento).", "Piccoli movimenti sul punto denso.", "Muovi il braccio mentre premi."] },
    { id: "g8-pec", video: "sHb_7bk6N40", fonte: FONTE_GOWOD, nome: "Pec stretch a terra", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Pettorale"],
      passi: ["A pancia sotto, braccio aperto di lato.", "Ruota il busto sopra il braccio.", "Al 30-40%."] },
    { id: "g8-blackburn", video: "lwX-ko0-wFg", fonte: FONTE_GOWOD, nome: "Blackburn", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Trapezio inferiore"], ripetizioni: "8 × 3\"",
      nota: "È l'esercizio che chiude il gap sull'overhead.",
      passi: ["Pancia sotto, braccia staccate da terra.", "Costole giù: non inarcare.", "Muovi le braccia lentamente nelle posizioni."] },
    { id: "g8-scap", video: "Vd5O44_lrgE", fonte: FONTE_GOWOD, nome: "Scap mobilization", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Dentato anteriore", "Scapole"], ripetizioni: "10 lente",
      passi: ["Scapole che si allontanano e si avvicinano.", "Le braccia restano ferme.", "Movimento solo scapolare."] },
    { id: "g8-shoulders-global", video: "hOLQd1-9OwQ", fonte: FONTE_GOWOD, nome: "Shoulders global", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Spalle"], ripetizioni: "8 lente",
      passi: ["Circonduzioni complete di spalla.", "Ampiezza massima, lentezza massima."] },
    { id: "g8-overhead-att", video: "RSJfJ793m0I", fonte: FONTE_GOWOD, nome: "Overhead activation", tag: "M",
      serve: "Nessun attrezzo", muscoli: ["Spalle", "Toracica"], ripetizioni: "8 × 3\"",
      passi: ["Braccia sopra la testa, attive.", "Lombare che non si inarca.", "Tieni 3 secondi in cima."] },
    { id: "g8-cobra", video: "9Y8bRpzNc40", fonte: FONTE_GOWOD, nome: "Downward dog to cobra", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Toracica", "Addominali"], ripetizioni: "6 lente",
      nota: "Apre l'anteriore dopo la corsa e riporta il respiro in addominale.",
      passi: ["Dal cane a testa in giù, scendi in cobra.", "Petto avanti, spalle lontane dalle orecchie.", "Glutei leggermente contratti: proteggono la lombare.", "Torna indietro e ripeti."] },
    { id: "g8-prayer", video: "7sCNw5OK3mw", fonte: FONTE_GOWOD, nome: "Prayer stretch (posizione del bambino)", tag: "S",
      serve: "Solo il pavimento", muscoli: ["Gran dorsale", "Lombare"], durataSec: 45,
      passi: ["Seduto sui talloni, ginocchia larghe.", "Braccia lunghe avanti, fronte a terra.", "Piccoli spostamenti del bacino a destra e sinistra."] },
    { id: "g8-cat-cow", video: "_tXe5N6-MgM", fonte: FONTE_GOWOD, nome: "Cat & cow", tag: "M",
      serve: "Solo il pavimento", muscoli: ["Colonna"], ripetizioni: "10 lente",
      passi: ["Quadrupedia.", "Alterna schiena inarcata e arrotondata.", "Segui il respiro."] },
    { id: "g8-thread", video: "PJRGjHPo0tI", fonte: FONTE_GOWOD, nome: "Thread the needle", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Toracica"],
      passi: ["Quadrupedia, un braccio passa sotto l'altro.", "Spalla e tempia verso terra.", "Il bacino resta alto."] },
    { id: "g8-supine-twist", video: "U-1HgIUZm6w", fonte: FONTE_GOWOD, nome: "Supine twist", tag: "S", perLato: true,
      serve: "Solo il pavimento", muscoli: ["Toracica", "Lombare"],
      passi: ["Supino, ginocchia che cadono da un lato.", "Spalle a terra.", "Respira lungo."] },
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
// GOWOD non fa lavoro sotto carico: qui i video restano di altri canali.
const LOADED = {
  id: "LOADED", nome: "Loaded mobility",
  nota: "Carico, non varietà. Sei esercizi fatti bene che progrediscono nel tempo. Mai il giorno dopo le gambe.",
  esercizi: [
    { id: "l-jefferson", video: "YGlAdtSKQaU", nome: "Jefferson curl", tag: "M", serie: 3, serve: "Bilanciere o manubrio",
      muscoli: ["Catena posteriore"], durataSec: 60, ripetizioni: "3 × 5 lentissime",
      carico: { partenza: 5, incrementoKg: 1.5, ogniSettimane: 2 },
      nota: "È l'esercizio che chiude il pike: carico su un range che già possiedi.",
      passi: ["In piedi su un rialzo, peso a braccia distese.", "Arrotola la colonna una vertebra alla volta.", "Gambe tese.", "Risali srotolando nello stesso ordine."] },
    { id: "l-aslr-zav", video: "WXs5HoRPvm0", nome: "ASLR zavorrato", tag: "M", perLato: true, serie: 3,
      serve: "Cavigliera o disco", muscoli: ["Femorali"], durataSec: 45, ripetizioni: "3 × 8 per lato",
      carico: { partenza: 2, incrementoKg: 0.5, ogniSettimane: 3 },
      passi: ["Supino, zavorra alla caviglia.", "Gamba tesa che sale, senza slancio.", "Scendi lentissimo."] },
    { id: "l-cossack", video: "nLNqEQ4B6XI", nome: "Cossack squat con goblet", tag: "M", perLato: true, serie: 3,
      serve: "Manubrio o kettlebell", muscoli: ["Adduttori"], durataSec: 45, ripetizioni: "3 × 6 per lato",
      carico: { partenza: 8, incrementoKg: 2, ogniSettimane: 2 },
      passi: ["Peso al petto, piedi molto larghi.", "Scendi su una gamba, l'altra tesa.", "Petto alto, tallone a terra."] },
    { id: "l-goblet", video: "4khBSY-0Tis", nome: "Deep squat goblet, tenuta attiva", tag: "M", serie: 3,
      serve: "Manubrio o kettlebell", muscoli: ["Caviglie", "Anche"], durataSec: 30, ripetizioni: "3 × 30\"",
      carico: { partenza: 8, incrementoKg: 2, ogniSettimane: 3 },
      passi: ["Peso al petto, accosciata piena.", "Gomiti dentro le ginocchia.", "Talloni a terra, petto alto."] },
    { id: "l-overhead", video: "htphsDzpWcc", nome: "Overhead con bastone", tag: "M", serie: 3,
      serve: "Bastone o bilanciere vuoto", muscoli: ["Spalle", "Gran dorsale"], durataSec: 45, ripetizioni: "3 × 8 lente",
      nota: "Il bastone rende il range misurabile: nel tempo si stringe la presa.",
      passi: ["Presa larga, braccia tese.", "Bastone sopra e dietro la testa.", "Non inarcare la lombare."] },
    { id: "l-copenhagen", video: "1NNqUQvMYGc", nome: "Copenhagen plank", tag: "M", perLato: true, serie: 3,
      serve: "Una panca o un rialzo", muscoli: ["Adduttori"], durataSec: 20, ripetizioni: "3 × 20\" per lato",
      nota: "Il più duro della lista, ed è quello che sposta la farfalla. Si parte col ginocchio sul rialzo.",
      passi: ["Sul fianco, gamba sopra sul rialzo.", "Solleva il bacino: corpo in linea.", "GINOCCHIO sul rialzo all'inizio, caviglia solo dopo."] },
    { id: "l-abduzione-cavo", video: "bGlm-qTnfTI", nome: "Abduzione al cavo, destra doppia", tag: "M", perLato: true, doppioADestra: true, serie: 2,
      serve: "Cavo", muscoli: ["Medio gluteo"], durataSec: 40, ripetizioni: "2×12 sx · 3×12 dx",
      carico: { partenza: 5, incrementoKg: 2.5, ogniSettimane: 2 },
      passi: ["Cavigliera al cavo basso.", "Gamba tesa che si allontana.", "Il busto resta fermo."] },
  ],
};

const GRUPPI = { G1, G2, G3, G4, G5, G6, G7, G8 };

// ============ 1 · POST-CORSA — fissa, ~12 min ============
// Metà stretching, metà rinforzo: sui due infortuni pregressi l'evidenza
// porta al rinforzo, non all'allungamento.
// La sequenza segue la logica della routine deep-stretch post-run:
// si apre dal basso e in carico (squat, forward fold, cane a testa in
// giù) finché il corpo è caldo, si passa a terra man mano che si
// raffredda, e si chiude seduti. Il foam roller sta in mezzo, quando i
// tessuti sono ancora caldi ed è il momento in cui rende di più.
//
// Con il rinforzo dentro, non solo allungamento: sui due infortuni
// pregressi (bandelletta e shin splints) l'evidenza porta lì.
const POST_CORSA = {
  id: "POST_CORSA", nome: "Post-corsa", durataStimataMin: 25,
  nota: "Fissa, non progredisce. Nei giorni con corsa sostituisce il quotidiano: non si sommano.",
  blocchi: [
    // 1. In piedi e in carico, finché sei caldo
    { nome: "Apertura in carico", esercizi: ["g2-deep-squat", "g3-forward-bend", "g2-dog-calf"] },
    // 2. Il rinforzo va prima che il corpo si raffreddi
    { nome: "Rinforzo (bandelletta e caviglia)", esercizi: ["g6-glute-att", "g2-calf-ecc"] },
    // 3. Foam roller a muscoli caldi
    { nome: "Foam roller", esercizi: ["g2-calf-roll", "g3-ham-roll", "g7-quad-roll", "g6-glute-roll"] },
    // 4. A terra: anteriore, poi posteriore
    { nome: "Anteriore", esercizi: ["g8-cobra", "g7-quad", "g4-knight"] },
    { nome: "Posteriore e anca", esercizi: ["g3-ham-kneel", "g5-frog", "g5-piriforme"] },
    // 5. Chiusura seduta e collo
    { nome: "Chiusura", esercizi: ["g5-v-sit", "g8-prayer"] },
    { nome: "Collo", esercizi: ["g1-trap", "g1-isometria"] },
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
const BLOCCO_ATTIVO = ["g3-ham-att", "g5-hip-rot", "g8-blackburn", "g5-cossack", "g2-deep-squat", "g3-hinge"];

const ROTAZIONE = [
  { id: "A", settimane: [1, 4], gruppi: ["G5", "G3"] },
  { id: "B", settimane: [5, 8], gruppi: ["G5", "G4", "G2"] },
  { id: "C", settimane: [9, 12], gruppi: ["G5", "G8", "G7"] },
];

const SOGLIA_COMPLETAMENTO = 0.7;

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
