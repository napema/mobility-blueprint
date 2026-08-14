// animazioni.js — figure schematiche in SVG.
//
// COSA È CAMBIATO E PERCHÉ.
// La versione precedente animava un singolo segmento (una gamba che
// ruota, un braccio che trasla) lasciando fermo il resto: il risultato
// non si leggeva come un corpo, ma come pezzi che si muovono scollegati.
//
// Qui una posa è uno SCHELETRO COMPLETO definito per coordinate di
// giunto. Il disegno nasce sempre dallo stesso codice, quindi la figura
// è sempre un corpo coerente. Il movimento è una transizione tra due
// pose complete (flipbook), non la rotazione di un pezzo.
//
// Per le tenute statiche non c'è movimento da mostrare: c'è una POSIZIONE
// da capire. Lì la figura è una sola, con una freccia che indica la
// direzione dell'intenzione e un marcatore su ciò che NON deve muoversi.

// ---------------------------------------------------------------------
// Sistema di coordinate: viewBox 200x150. Suolo y=134, muro x=16.
// Giunti: testa, collo, bacino, spalla/gomito/mano (v=vicino, l=lontano),
// ginocchio/piede (v/l). "v" = arto più vicino a chi guarda.
// ---------------------------------------------------------------------

const SUOLO = 134;
const MURO = 16;

function disegnaFigura(p, classe = "") {
  const seg = (a, b, cls = "") => (a && b) ? `<path class="fig__arto ${cls}" d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}"/>` : "";
  return `<g class="fig ${classe}">
    ${seg(p.spallaL, p.gomitoL, "fig__lontano")}
    ${seg(p.gomitoL, p.manoL, "fig__lontano")}
    ${seg(p.bacino, p.ginocchioL, "fig__lontano")}
    ${seg(p.ginocchioL, p.piedeL, "fig__lontano")}
    ${seg(p.collo, p.bacino, "fig__tronco")}
    ${p.spallaV && p.spallaL ? seg(p.spallaV, p.spallaL) : ""}
    ${seg(p.bacino, p.ginocchioV)}
    ${seg(p.ginocchioV, p.piedeV)}
    ${seg(p.spallaV, p.gomitoV)}
    ${seg(p.gomitoV, p.manoV)}
    <circle class="fig__testa" cx="${p.testa[0]}" cy="${p.testa[1]}" r="11"/>
  </g>`;
}

function freccia(da, a) {
  const dx = a[0] - da[0], dy = a[1] - da[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const p1 = [a[0] - ux * 11 + px * 6, a[1] - uy * 11 + py * 6];
  const p2 = [a[0] - ux * 11 - px * 6, a[1] - uy * 11 - py * 6];
  return `<g class="acc__freccia">
    <path d="M${da[0]} ${da[1]} L${a[0]} ${a[1]}"/>
    <path d="M${a[0]} ${a[1]} L${p1[0]} ${p1[1]} M${a[0]} ${a[1]} L${p2[0]} ${p2[1]}"/>
  </g>`;
}

const fisso = ([x, y]) => `<g class="acc__fisso"><circle cx="${x}" cy="${y}" r="8"/><path d="M${x - 5} ${y} h10"/></g>`;
const punto = ([x, y]) => `<circle class="acc__punto" cx="${x}" cy="${y}" r="5"/>`;

function ambiente(tipo) {
  if (tipo === "suolo") return `<path class="amb" d="M8 ${SUOLO} H192"/>`;
  if (tipo === "muro") return `<path class="amb" d="M${MURO} 10 V${SUOLO}"/><path class="amb" d="M${MURO} ${SUOLO} H192"/>`;
  if (tipo === "sedia") return `<path class="amb" d="M8 ${SUOLO} H192"/><path class="amb" d="M120 ${SUOLO} V96 H176"/>`;
  if (tipo === "rialzo") return `<path class="amb" d="M8 ${SUOLO} H192"/><path class="amb" d="M140 ${SUOLO} V108 H188"/>`;
  return "";
}

// ---------------------------------------------------------------------
// Pose di base, poi variate. Coordinate scelte per leggere come un corpo.
// ---------------------------------------------------------------------

const inPiedi = {
  testa: [100, 30], collo: [100, 44], bacino: [100, 84],
  spallaV: [100, 50], gomitoV: [100, 68], manoV: [100, 86],
  spallaL: [100, 50], gomitoL: [100, 68], manoL: [100, 86],
  ginocchioV: [96, 110], piedeV: [96, SUOLO],
  ginocchioL: [104, 110], piedeL: [104, SUOLO],
};

const supino = {
  testa: [42, 116], collo: [56, 118], bacino: [104, 120],
  spallaV: [60, 116], gomitoV: [76, 122], manoV: [92, 126],
  spallaL: [60, 116], gomitoL: [76, 122], manoL: [92, 126],
  ginocchioV: [136, 120], piedeV: [168, 122],
  ginocchioL: [136, 122], piedeL: [168, 124],
};

const seduto = {
  testa: [72, 52], collo: [74, 66], bacino: [78, 118],
  spallaV: [74, 72], gomitoV: [92, 88], manoV: [112, 104],
  spallaL: [74, 72], gomitoL: [92, 88], manoL: [112, 104],
  ginocchioV: [126, 120], piedeV: [166, 122],
  ginocchioL: [126, 122], piedeL: [166, 124],
};

const quadrupedia = {
  testa: [46, 74], collo: [60, 78], bacino: [128, 76],
  spallaV: [62, 80], gomitoV: [62, 106], manoV: [62, SUOLO],
  spallaL: [62, 80], gomitoL: [62, 106], manoL: [62, SUOLO],
  ginocchioV: [132, 108], piedeV: [150, SUOLO],
  ginocchioL: [132, 108], piedeL: [150, SUOLO],
};

const sulFianco = {
  testa: [40, 104], collo: [56, 106], bacino: [110, 110],
  spallaV: [58, 104], gomitoV: [52, 120], manoV: [64, SUOLO],
  spallaL: [58, 104], gomitoL: [52, 120], manoL: [64, SUOLO],
  ginocchioV: [140, 116], piedeV: [168, 124],
  ginocchioL: [140, 118], piedeL: [168, 126],
};

const v = (base, delta) => ({ ...base, ...delta });

// ---------------------------------------------------------------------
// Catalogo. `pose`: 1 = posizione da capire, 2 = movimento (flipbook).
// ---------------------------------------------------------------------

const ANIMAZIONI = {
  // ---------------- COLLO ----------------
  "collo-flessione-laterale": {
    vista: "fronte", ambiente: null,
    etichetta: "Orecchio verso la spalla. La spalla opposta resta bloccata in basso.",
    pose: [
      v(inPiedi, { testa: [100, 30], collo: [100, 44] }),
      v(inPiedi, {
        testa: [84, 36], collo: [98, 46],
        spallaV: [80, 52], gomitoV: [76, 72], manoV: [74, 92],
        spallaL: [120, 50], gomitoL: [124, 70], manoL: [126, 90],
      }),
    ],
    accenti: (p) => freccia([116, 26], [86, 26]) + fisso([120, 50]),
  },

  "collo-isometria": {
    vista: "fronte", ambiente: null,
    etichetta: "La mano resiste, la testa spinge. La testa non si muove.",
    pose: [v(inPiedi, {
      spallaV: [80, 52], gomitoV: [64, 44], manoV: [86, 30],
      spallaL: [120, 50], gomitoL: [124, 70], manoL: [126, 90],
    })],
    accenti: () => freccia([70, 30], [84, 30]) + fisso([100, 30]),
  },

  "collo-chin-tuck": {
    vista: "profilo", ambiente: null,
    etichetta: "Il mento scorre indietro in orizzontale, senza abbassarsi.",
    pose: [
      v(inPiedi, { testa: [108, 30] }),
      v(inPiedi, { testa: [96, 30] }),
    ],
    accenti: () => freccia([124, 30], [110, 30]),
  },

  // ---------------- CAVIGLIA ----------------
  "caviglia-knee-to-wall": {
    vista: "profilo", ambiente: "muro",
    etichetta: "Il ginocchio va oltre le dita. Il tallone non si stacca.",
    pose: [
      v(inPiedi, {
        testa: [86, 34], collo: [86, 48], bacino: [88, 88],
        spallaV: [86, 54], gomitoV: [72, 68], manoV: [40, 66],
        spallaL: [86, 54], gomitoL: [72, 68], manoL: [40, 66],
        ginocchioV: [66, 104], piedeV: [46, SUOLO],
        ginocchioL: [96, 108], piedeL: [104, SUOLO],
      }),
      v(inPiedi, {
        testa: [82, 34], collo: [82, 48], bacino: [86, 88],
        spallaV: [82, 54], gomitoV: [68, 68], manoV: [38, 66],
        spallaL: [82, 54], gomitoL: [68, 68], manoL: [38, 66],
        ginocchioV: [48, 104], piedeV: [46, SUOLO],
        ginocchioL: [94, 108], piedeL: [104, SUOLO],
      }),
    ],
    accenti: () => freccia([70, 96], [44, 96]) + fisso([46, SUOLO]),
  },

  "polpaccio-muro": {
    vista: "profilo", ambiente: "muro",
    etichetta: "Gamba dietro tesa, tallone incollato a terra.",
    pose: [v(inPiedi, {
      testa: [76, 40], collo: [80, 54], bacino: [96, 88],
      spallaV: [80, 58], gomitoV: [58, 56], manoV: [24, 52],
      spallaL: [80, 58], gomitoL: [58, 56], manoL: [24, 52],
      ginocchioV: [70, 104], piedeV: [56, SUOLO],
      ginocchioL: [136, 108], piedeL: [166, SUOLO],
    })],
    accenti: () => punto([166, SUOLO]) + freccia([150, 96], [166, 122]),
  },

  "polpaccio-soleo": {
    vista: "profilo", ambiente: "muro",
    etichetta: "Come sopra ma col ginocchio dietro PIEGATO: cambia bersaglio.",
    pose: [v(inPiedi, {
      testa: [72, 46], collo: [76, 60], bacino: [92, 94],
      spallaV: [76, 64], gomitoV: [56, 60], manoV: [24, 54],
      spallaL: [76, 64], gomitoL: [56, 60], manoL: [24, 54],
      ginocchioV: [66, 108], piedeV: [54, SUOLO],
      ginocchioL: [126, 104], piedeL: [158, SUOLO],
    })],
    accenti: () => punto([158, SUOLO]) + punto([126, 104]),
  },

  "talloni-su": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Le punte si alzano, i talloni restano a terra.",
    pose: [
      v(inPiedi, { piedeV: [96, SUOLO], piedeL: [104, SUOLO] }),
      v(inPiedi, { ginocchioV: [96, 108], piedeV: [92, 126], ginocchioL: [104, 108], piedeL: [100, 126] }),
    ],
    accenti: () => freccia([120, 130], [120, 116]),
  },

  "squat-tenuta": {
    vista: "fronte", ambiente: "suolo",
    etichetta: "Accosciata piena. I gomiti spingono le ginocchia in fuori.",
    pose: [v(inPiedi, {
      testa: [100, 52], collo: [100, 66], bacino: [100, 100],
      spallaV: [86, 72], gomitoV: [76, 92], manoV: [100, 84],
      spallaL: [114, 72], gomitoL: [124, 92], manoL: [100, 84],
      ginocchioV: [66, 104], piedeV: [74, SUOLO],
      ginocchioL: [134, 104], piedeL: [126, SUOLO],
    })],
    accenti: () => freccia([80, 104], [58, 104]) + freccia([120, 104], [142, 104]),
  },

  // ---------------- FEMORALI ----------------
  "aslr": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "La gamba tesa sale da sola: niente slancio, niente mani.",
    pose: [
      v(supino, { ginocchioV: [136, 118], piedeV: [168, 120] }),
      v(supino, { ginocchioV: [132, 84], piedeV: [150, 46] }),
    ],
    accenti: () => freccia([168, 110], [162, 62]),
  },

  "aslr-eccentrico": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Sale a ginocchio piegato, scende a gamba tesa.",
    pose: [
      v(supino, { ginocchioV: [126, 78], piedeV: [104, 52] }),
      v(supino, { ginocchioV: [132, 84], piedeV: [150, 46] }),
    ],
    accenti: () => freccia([120, 56], [148, 50]),
  },

  "pike-seduto": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Ti tiri giù con gli addominali, non con le braccia.",
    pose: [
      seduto,
      v(seduto, {
        testa: [100, 84], collo: [96, 94], bacino: [78, 118],
        spallaV: [96, 96], gomitoV: [118, 104], manoV: [140, 114],
        spallaL: [96, 96], gomitoL: [118, 104], manoL: [140, 114],
      }),
    ],
    accenti: () => freccia([100, 60], [112, 88]) + punto([88, 106]),
  },

  "femorale-piedi": {
    vista: "profilo", ambiente: "rialzo",
    etichetta: "Schiena DRITTA, non arrotondata. Il petto scende verso il piede.",
    pose: [v(inPiedi, {
      testa: [110, 54], collo: [106, 66], bacino: [92, 96],
      spallaV: [106, 70], gomitoV: [122, 84], manoV: [140, 100],
      spallaL: [106, 70], gomitoL: [122, 84], manoL: [140, 100],
      ginocchioV: [88, 116], piedeV: [86, SUOLO],
      ginocchioL: [130, 104], piedeL: [156, 108],
    })],
    accenti: () => freccia([118, 48], [136, 76]) + fisso([100, 80]),
  },

  "femorale-supino": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "L'asciugamano tira: così controlli davvero l'intensità.",
    pose: [v(supino, {
      ginocchioV: [130, 86], piedeV: [148, 50],
      manoV: [128, 74], gomitoV: [98, 96], manoL: [128, 74], gomitoL: [98, 96],
    })],
    accenti: () => freccia([160, 74], [152, 56]),
  },

  // ---------------- FLESSORI D'ANCA ----------------
  "affondo-flessori": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Prima porta il coccige SOTTO, poi spingi avanti. Senza, non allunghi.",
    pose: [
      v(inPiedi, {
        testa: [96, 46], collo: [96, 60], bacino: [96, 96],
        spallaV: [96, 64], gomitoV: [98, 82], manoV: [100, 100],
        spallaL: [96, 64], gomitoL: [98, 82], manoL: [100, 100],
        ginocchioV: [132, 106], piedeV: [132, SUOLO],
        ginocchioL: [66, SUOLO], piedeL: [42, 126],
      }),
      v(inPiedi, {
        testa: [102, 46], collo: [102, 60], bacino: [104, 96],
        spallaV: [102, 64], gomitoV: [104, 82], manoV: [106, 100],
        spallaL: [102, 64], gomitoL: [104, 82], manoL: [106, 100],
        ginocchioV: [138, 106], piedeV: [136, SUOLO],
        ginocchioL: [66, SUOLO], piedeL: [42, 126],
      }),
    ],
    accenti: () => freccia([96, 108], [96, 92]) + punto([104, 96]),
  },

  "couch-stretch": {
    vista: "profilo", ambiente: "rialzo",
    etichetta: "Busto eretto, coccige sotto. Si esagera facilissimo: 30-40%.",
    pose: [v(inPiedi, {
      testa: [96, 44], collo: [96, 58], bacino: [98, 96],
      spallaV: [96, 62], gomitoV: [98, 80], manoV: [100, 98],
      spallaL: [96, 62], gomitoL: [98, 80], manoL: [100, 98],
      ginocchioV: [64, 118], piedeV: [56, SUOLO],
      ginocchioL: [132, 116], piedeL: [162, 106],
    })],
    accenti: () => freccia([96, 108], [96, 92]),
  },

  "ginocchio-petto": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Il ginocchio sale e RESTA su, senza mani.",
    pose: [
      inPiedi,
      v(inPiedi, { ginocchioV: [124, 82], piedeV: [110, 106] }),
    ],
    accenti: () => freccia([124, 104], [124, 84]),
  },

  "ponte-glutei": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Il bacino sale spinto dai glutei, non dalla schiena.",
    pose: [
      v(supino, { bacino: [104, 120], ginocchioV: [140, 100], piedeV: [146, SUOLO] }),
      v(supino, { bacino: [104, 96], collo: [56, 116], ginocchioV: [142, 92], piedeV: [146, SUOLO] }),
    ],
    accenti: () => freccia([104, 118], [104, 92]) + punto([104, 100]),
  },

  // ---------------- ADDUTTORI E ROTATORI ----------------
  "farfalla": {
    vista: "fronte", ambiente: "suolo",
    etichetta: "Piante unite. Le ginocchia scendono da sole, non spingerle.",
    pose: [
      v(inPiedi, {
        testa: [100, 42], collo: [100, 56], bacino: [100, 100],
        spallaV: [88, 62], gomitoV: [76, 84], manoV: [92, 106],
        spallaL: [112, 62], gomitoL: [124, 84], manoL: [108, 106],
        ginocchioV: [60, 108], piedeV: [100, 122],
        ginocchioL: [140, 108], piedeL: [100, 122],
      }),
      v(inPiedi, {
        testa: [100, 42], collo: [100, 56], bacino: [100, 100],
        spallaV: [88, 62], gomitoV: [76, 84], manoV: [92, 106],
        spallaL: [112, 62], gomitoL: [124, 84], manoL: [108, 106],
        ginocchioV: [56, 118], piedeV: [100, 122],
        ginocchioL: [144, 118], piedeL: [100, 122],
      }),
    ],
    accenti: () => freccia([56, 100], [52, 120]) + freccia([144, 100], [148, 120]),
  },

  "frog-rock": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Ginocchia larghe. Il bacino va indietro verso i talloni.",
    pose: [
      quadrupedia,
      v(quadrupedia, {
        bacino: [104, 88], testa: [46, 82], collo: [58, 84],
        ginocchioV: [132, 108], piedeV: [150, SUOLO],
        ginocchioL: [132, 108], piedeL: [150, SUOLO],
      }),
    ],
    accenti: () => freccia([146, 78], [112, 84]),
  },

  "novanta-novanta": {
    vista: "fronte", ambiente: "suolo",
    etichetta: "Una gamba davanti a 90°, l'altra di lato a 90°. Siedi dritto.",
    pose: [v(seduto, {
      testa: [92, 46], collo: [92, 60], bacino: [92, 104],
      spallaV: [80, 66], gomitoV: [66, 86], manoV: [58, 108],
      spallaL: [104, 66], gomitoL: [118, 86], manoL: [126, 108],
      ginocchioV: [48, 112], piedeV: [56, SUOLO],
      ginocchioL: [136, 110], piedeL: [166, 124],
    })],
    accenti: () => punto([48, 112]) + punto([136, 110]),
  },

  "hip-switch": {
    vista: "fronte", ambiente: "suolo",
    etichetta: "Passaggio attivo da un lato all'altro, senza usare le mani.",
    pose: [
      v(seduto, {
        testa: [92, 46], collo: [92, 60], bacino: [92, 104],
        spallaV: [80, 66], gomitoV: [66, 86], manoV: [58, 108],
        spallaL: [104, 66], gomitoL: [118, 86], manoL: [126, 108],
        ginocchioV: [48, 112], piedeV: [56, SUOLO],
        ginocchioL: [136, 110], piedeL: [166, 124],
      }),
      v(seduto, {
        testa: [108, 46], collo: [108, 60], bacino: [108, 104],
        spallaV: [96, 66], gomitoV: [82, 86], manoV: [74, 108],
        spallaL: [120, 66], gomitoL: [134, 86], manoL: [142, 108],
        ginocchioV: [152, 112], piedeV: [144, SUOLO],
        ginocchioL: [64, 110], piedeL: [34, 124],
      }),
    ],
    accenti: () => freccia([72, 126], [128, 126]),
  },

  "figure-4": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Caviglia sopra il ginocchio opposto. Tiri la coscia verso il petto.",
    pose: [v(supino, {
      ginocchioV: [124, 86], piedeV: [104, 66],
      ginocchioL: [138, 70], piedeL: [160, 84],
      gomitoV: [104, 96], manoV: [124, 82], gomitoL: [104, 96], manoL: [124, 82],
    })],
    accenti: () => freccia([146, 96], [126, 78]) + punto([128, 78]),
  },

  "cossack": {
    vista: "fronte", ambiente: "suolo",
    etichetta: "Scendi su una gamba, l'altra resta TESA con la punta in su.",
    pose: [
      v(inPiedi, {
        bacino: [100, 92], ginocchioV: [70, 112], piedeV: [66, SUOLO],
        ginocchioL: [130, 112], piedeL: [134, SUOLO],
      }),
      v(inPiedi, {
        testa: [76, 62], collo: [76, 76], bacino: [76, 108],
        spallaV: [64, 82], gomitoV: [70, 100], manoV: [88, 104],
        spallaL: [88, 82], gomitoL: [94, 100], manoL: [88, 104],
        ginocchioV: [58, 120], piedeV: [58, SUOLO],
        ginocchioL: [130, 122], piedeL: [166, SUOLO],
      }),
    ],
    accenti: () => freccia([100, 84], [78, 104]) + punto([166, SUOLO]),
  },

  "affondo-laterale": {
    vista: "fronte", ambiente: "suolo",
    etichetta: "Scendi su un lato, la gamba opposta resta tesa.",
    pose: [v(inPiedi, {
      testa: [76, 62], collo: [76, 76], bacino: [76, 108],
      spallaV: [64, 82], gomitoV: [70, 100], manoV: [88, 106],
      spallaL: [88, 82], gomitoL: [94, 100], manoL: [88, 106],
      ginocchioV: [58, 120], piedeV: [58, SUOLO],
      ginocchioL: [130, 122], piedeL: [166, SUOLO],
    })],
    accenti: () => punto([166, SUOLO]),
  },

  "abduzione-laterale": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Sdraiato sul fianco, la gamba sopra sale lenta. Bacino fermo.",
    pose: [
      v(sulFianco, { ginocchioV: [140, 116], piedeV: [168, 124] }),
      v(sulFianco, { ginocchioV: [138, 88], piedeV: [166, 78] }),
    ],
    accenti: () => freccia([170, 116], [170, 82]) + fisso([110, 110]),
  },

  // ---------------- GLUTEI / TFL ----------------
  "tfl-in-piedi": {
    vista: "fronte", ambiente: "suolo",
    etichetta: "Gamba incrociata dietro, bacino spinto di lato, braccio lungo sopra.",
    pose: [v(inPiedi, {
      testa: [92, 30], collo: [94, 44], bacino: [112, 86],
      spallaV: [82, 50], gomitoV: [72, 32], manoV: [70, 14],
      spallaL: [106, 50], gomitoL: [112, 70], manoL: [116, 90],
      ginocchioV: [110, 110], piedeV: [104, SUOLO],
      ginocchioL: [122, 110], piedeL: [86, SUOLO],
    })],
    accenti: () => freccia([132, 86], [150, 86]) + punto([112, 86]),
  },

  "piriforme-seduto": {
    vista: "fronte", ambiente: "sedia",
    etichetta: "Caviglia sopra il ginocchio, il petto scende in avanti.",
    pose: [v(seduto, {
      testa: [86, 56], collo: [88, 70], bacino: [96, 106],
      spallaV: [76, 76], gomitoV: [82, 96], manoV: [100, 104],
      spallaL: [100, 76], gomitoL: [106, 96], manoL: [100, 104],
      ginocchioV: [66, 108], piedeV: [116, 100],
      ginocchioL: [124, 112], piedeL: [124, SUOLO],
    })],
    accenti: () => freccia([86, 48], [92, 74]) + punto([66, 108]),
  },

  // ---------------- QUADRICIPITI ----------------
  "quad-in-piedi": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Tallone al gluteo, ginocchio che punta a TERRA, bacino sotto.",
    pose: [v(inPiedi, {
      ginocchioV: [104, 112], piedeV: [92, 88],
      manoV: [98, 90], gomitoV: [100, 70],
      ginocchioL: [96, 110], piedeL: [96, SUOLO],
    })],
    accenti: () => freccia([116, 100], [110, 118]) + punto([100, 84]),
  },

  "bulgaro": {
    vista: "profilo", ambiente: "rialzo",
    etichetta: "Piede dietro sul rialzo. Controllo in discesa, non profondità.",
    pose: [
      v(inPiedi, {
        bacino: [96, 92], ginocchioV: [92, 112], piedeV: [88, SUOLO],
        ginocchioL: [128, 112], piedeL: [156, 110],
      }),
      v(inPiedi, {
        testa: [96, 46], collo: [96, 60], bacino: [96, 104],
        ginocchioV: [86, 120], piedeV: [88, SUOLO],
        ginocchioL: [134, 122], piedeL: [156, 110],
      }),
    ],
    accenti: () => freccia([76, 96], [76, 116]),
  },

  // ---------------- TORACICA E SPALLE ----------------
  "gran-dorsale": {
    vista: "profilo", ambiente: "sedia",
    etichetta: "Schiena ARROTONDATA: senza questo alleni gli estensori, non il bersaglio.",
    pose: [v(quadrupedia, {
      testa: [58, 96], collo: [70, 92], bacino: [116, 104],
      spallaV: [74, 90], gomitoV: [104, 92], manoV: [140, 94],
      spallaL: [74, 90], gomitoL: [104, 92], manoL: [140, 94],
      ginocchioV: [120, 124], piedeV: [148, 126],
      ginocchioL: [120, 124], piedeL: [148, 126],
    })],
    accenti: () => freccia([88, 74], [88, 92]) + punto([96, 96]),
  },

  "estensione-toracica": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Roller sotto le scapole. L'estensione parte da lì, non dalla lombare.",
    pose: [
      v(supino, {
        testa: [46, 108], collo: [60, 108], bacino: [116, 120],
        gomitoV: [58, 96], manoV: [46, 96], gomitoL: [58, 96], manoL: [46, 96],
        ginocchioV: [142, 100], piedeV: [150, SUOLO],
        ginocchioL: [142, 100], piedeL: [150, SUOLO],
      }),
      v(supino, {
        testa: [44, 122], collo: [60, 116], bacino: [116, 120],
        gomitoV: [56, 106], manoV: [44, 110], gomitoL: [56, 106], manoL: [44, 110],
        ginocchioV: [142, 100], piedeV: [150, SUOLO],
        ginocchioL: [142, 100], piedeL: [150, SUOLO],
      }),
    ],
    accenti: () => `<circle class="acc__attrezzo" cx="82" cy="116" r="10"/>` + freccia([40, 96], [40, 116]),
  },

  "prone-liftoff": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Le braccia si staccano. Le costole restano giù: non inarcare.",
    pose: [
      v(supino, {
        testa: [46, 124], collo: [60, 124], bacino: [116, 126],
        spallaV: [62, 122], gomitoV: [36, 124], manoV: [14, 126],
        spallaL: [62, 122], gomitoL: [36, 124], manoL: [14, 126],
        ginocchioV: [146, 126], piedeV: [176, 128],
        ginocchioL: [146, 126], piedeL: [176, 128],
      }),
      v(supino, {
        testa: [46, 122], collo: [60, 122], bacino: [116, 126],
        spallaV: [62, 120], gomitoV: [36, 112], manoV: [14, 106],
        spallaL: [62, 120], gomitoL: [36, 112], manoL: [14, 106],
        ginocchioV: [146, 126], piedeV: [176, 128],
        ginocchioL: [146, 126], piedeL: [176, 128],
      }),
    ],
    accenti: () => freccia([14, 124], [14, 104]) + fisso([104, 126]),
  },

  "wall-slide": {
    vista: "fronte", ambiente: "muro",
    etichetta: "Lombare piatta al muro. Se si stacca, sei salito troppo.",
    pose: [
      v(inPiedi, {
        testa: [104, 34], collo: [104, 48], bacino: [104, 92],
        spallaV: [88, 54], gomitoV: [70, 66], manoV: [64, 44],
        spallaL: [120, 54], gomitoL: [138, 66], manoL: [144, 44],
        ginocchioV: [100, 112], piedeV: [96, SUOLO],
        ginocchioL: [110, 112], piedeL: [114, SUOLO],
      }),
      v(inPiedi, {
        testa: [104, 34], collo: [104, 48], bacino: [104, 92],
        spallaV: [88, 54], gomitoV: [76, 38], manoV: [72, 18],
        spallaL: [120, 54], gomitoL: [132, 38], manoL: [136, 18],
        ginocchioV: [100, 112], piedeV: [96, SUOLO],
        ginocchioL: [110, 112], piedeL: [114, SUOLO],
      }),
    ],
    accenti: () => freccia([158, 60], [158, 26]) + fisso([104, 86]),
  },

  "child-pose": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Seduto sui talloni, braccia lunghe, petto verso il pavimento.",
    pose: [v(quadrupedia, {
      testa: [54, 116], collo: [68, 112], bacino: [130, 110],
      spallaV: [70, 110], gomitoV: [44, 116], manoV: [16, 122],
      spallaL: [70, 110], gomitoL: [44, 116], manoL: [16, 122],
      ginocchioV: [132, 124], piedeV: [158, 126],
      ginocchioL: [132, 124], piedeL: [158, 126],
    })],
    accenti: () => freccia([90, 96], [90, 112]),
  },

  "pettorale-stipite": {
    vista: "fronte", ambiente: "muro",
    etichetta: "Gomito a 90° contro lo stipite, il busto ruota in avanti.",
    pose: [v(inPiedi, {
      testa: [110, 34], collo: [110, 48], bacino: [108, 90],
      spallaV: [94, 54], gomitoV: [64, 54], manoV: [58, 30],
      spallaL: [124, 54], gomitoL: [132, 74], manoL: [136, 94],
      ginocchioV: [104, 112], piedeV: [100, SUOLO],
      ginocchioL: [114, 112], piedeL: [118, SUOLO],
    })],
    accenti: () => freccia([120, 66], [140, 74]) + punto([80, 54]),
  },

  "rotazione-esterna-spalla": {
    vista: "fronte", ambiente: null,
    etichetta: "Gomito fermo al fianco, l'avambraccio ruota in fuori.",
    pose: [
      v(inPiedi, { spallaV: [86, 52], gomitoV: [82, 76], manoV: [108, 82] }),
      v(inPiedi, { spallaV: [86, 52], gomitoV: [82, 76], manoV: [52, 74] }),
    ],
    accenti: () => freccia([106, 92], [58, 90]) + fisso([82, 76]),
  },

  "circonduzioni-bastone": {
    vista: "fronte", ambiente: null,
    etichetta: "Braccia sempre tese. Il bastone passa sopra e dietro la testa.",
    pose: [
      v(inPiedi, { spallaV: [86, 52], gomitoV: [70, 74], manoV: [56, 96], spallaL: [114, 52], gomitoL: [130, 74], manoL: [144, 96] }),
      v(inPiedi, { spallaV: [86, 52], gomitoV: [70, 34], manoV: [56, 16], spallaL: [114, 52], gomitoL: [130, 34], manoL: [144, 16] }),
    ],
    accenti: () => `<path class="acc__attrezzo-linea" d="M52 96 H148"/>` + freccia([164, 92], [164, 30]),
  },

  "tricipite-overhead": {
    vista: "fronte", ambiente: null,
    etichetta: "Gomito in alto vicino all'orecchio, la mano scende dietro.",
    pose: [v(inPiedi, {
      spallaV: [88, 52], gomitoV: [92, 20], manoV: [112, 40],
      spallaL: [112, 52], gomitoL: [108, 26], manoL: [96, 22],
    })],
    accenti: () => freccia([124, 30], [110, 44]) + fisso([92, 20]),
  },

  // ---------------- BACINO ----------------
  "sidelying-gluteo": {
    vista: "profilo", ambiente: "suolo",
    etichetta: "Spinta dai due contatti del piede: tallone interno e alluce.",
    pose: [
      v(sulFianco, { ginocchioV: [132, 112], piedeV: [156, 126] }),
      v(sulFianco, { ginocchioV: [134, 100], piedeV: [162, 112] }),
    ],
    accenti: () => punto([160, 118]) + freccia([172, 108], [172, 90]),
  },

  "allungo-sopra-testa": {
    vista: "fronte", ambiente: "suolo",
    etichetta: "Il braccio allunga in alto, il peso trasla sul tallone opposto.",
    pose: [v(inPiedi, {
      testa: [96, 34], collo: [98, 48], bacino: [106, 88],
      spallaV: [86, 54], gomitoV: [76, 32], manoV: [70, 12],
      spallaL: [110, 54], gomitoL: [116, 74], manoL: [120, 94],
      ginocchioV: [102, 110], piedeV: [98, SUOLO],
      ginocchioL: [112, 110], piedeL: [116, SUOLO],
    })],
    accenti: () => freccia([70, 30], [70, 12]) + punto([116, SUOLO]),
  },

  // fallback
  "generica": {
    vista: "fronte", ambiente: "suolo",
    etichetta: "Segui i passi qui sotto.",
    pose: [inPiedi],
    accenti: () => "",
  },
};

// ---------------------------------------------------------------------

function renderAnimazione(chiave) {
  const a = ANIMAZIONI[chiave] || ANIMAZIONI["generica"];
  const doppia = a.pose.length > 1;

  const strati = a.pose
    .map((p, i) => disegnaFigura(p, doppia ? `fig--fase${i}` : ""))
    .join("");

  return `<figure class="anim ${doppia ? "anim--doppia" : "anim--singola"}">
    <svg viewBox="0 0 200 150" class="anim__svg" role="img" aria-label="${a.etichetta}">
      ${ambiente(a.ambiente)}
      ${strati}
      ${a.accenti ? a.accenti() : ""}
    </svg>
    <figcaption class="anim__cap">${a.etichetta}</figcaption>
  </figure>`;
}

const haAnimazione = (c) => Boolean(ANIMAZIONI[c]);
const elencoAnimazioni = () => Object.keys(ANIMAZIONI);

export { renderAnimazione, haAnimazione, elencoAnimazioni, ANIMAZIONI };
