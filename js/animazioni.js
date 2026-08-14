// animazioni.js — figure schematiche animate in SVG, due angolazioni dove
// serve (fronte + profilo), loop continuo, con evidenziato il punto che
// conta (SPEC §7). Sono la fonte primaria: i video di terzi mancano per
// la maggior parte degli esercizi, l'animazione no.
//
// Le figure sono stilizzate di proposito: servono a far capire la forma
// del movimento e cosa non deve muoversi, non a essere anatomiche.
// Il movimento è in CSS (@keyframes in style.css), non in SMIL.

const TESTA = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;

function telaio(contenuto, etichetta) {
  return `<figure class="anim">
    <svg viewBox="0 0 240 130" class="anim__svg" role="img" aria-label="${etichetta}">
      ${contenuto}
    </svg>
    <figcaption class="anim__cap">${etichetta}</figcaption>
  </figure>`;
}

// pannello: g traslato, con titolino della vista
function vista(x, titolo, contenuto) {
  return `<g transform="translate(${x},0)">
    <text class="anim__vista" x="60" y="124" text-anchor="middle">${titolo}</text>
    ${contenuto}
  </g>`;
}

const ANIMAZIONI = {
  // ---------- COLLO ----------
  "collo-flessione-laterale": () => telaio(
    vista(0, "fronte", `
      <g class="a-collo-tilt">
        ${TESTA(60, 28)}
        <path d="M60 37 V52"/>
      </g>
      <path d="M36 54 H84"/>
      <path d="M60 54 V88"/>
      <path d="M36 54 V70" class="anim__fisso"/>
      <path d="M84 54 V70"/>
      <circle cx="36" cy="72" r="3.4" class="anim__punto"/>
    `) +
    vista(120, "cosa non si muove", `
      ${TESTA(60, 28)}
      <path d="M60 37 V52"/>
      <path d="M36 54 H84" class="anim__fisso"/>
      <path d="M60 54 V88"/>
      <text class="anim__nota" x="60" y="104" text-anchor="middle">spalla giù</text>
    `),
    "Orecchio verso la spalla, spalla opposta bloccata in basso"
  ),

  "collo-isometria": () => telaio(
    vista(0, "fronte", `
      ${TESTA(60, 30)}
      <path d="M60 39 V54"/>
      <path d="M36 56 H84"/>
      <path d="M60 56 V90"/>
      <path d="M44 34 H51" class="a-spinta"/>
      <circle cx="69" cy="30" r="3.4" class="anim__punto a-pulsa"/>
    `) +
    vista(120, "la testa non si muove", `
      ${TESTA(60, 30)}
      <path d="M60 39 V54"/>
      <path d="M36 56 H84" class="anim__fisso"/>
      <text class="anim__nota" x="60" y="104" text-anchor="middle">isometria</text>
    `),
    "La mano resiste, la testa spinge ma resta ferma"
  ),

  "collo-chin-tuck": () => telaio(
    vista(60, "profilo", `
      <g class="a-chin">
        ${TESTA(58, 30)}
        <path d="M66 30 h6" class="anim__punto"/>
      </g>
      <path d="M58 39 V54"/>
      <path d="M58 54 V92"/>
      <path d="M44 54 H72"/>
      <text class="anim__nota" x="60" y="108" text-anchor="middle">doppio mento</text>
    `),
    "Il mento scorre indietro in orizzontale, senza abbassarsi"
  ),

  // ---------- CAVIGLIA ----------
  "caviglia-knee-to-wall": () => telaio(
    vista(60, "profilo", `
      <path d="M22 12 V116" class="anim__muro"/>
      <path d="M30 116 H104"/>
      <g class="a-ginocchio">
        <path d="M64 60 L44 88"/>
      </g>
      <path d="M64 60 V34"/>
      ${TESTA(64, 25, 7)}
      <path d="M44 88 L40 108"/>
      <path d="M40 108 H62"/>
      <circle cx="40" cy="108" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="66" y="122" text-anchor="middle">tallone incollato</text>
    `),
    "Il ginocchio va oltre le dita, il tallone non si stacca"
  ),

  "polpaccio-muro": () => telaio(
    vista(60, "profilo", `
      <path d="M20 12 V116" class="anim__muro"/>
      <path d="M24 116 H108"/>
      ${TESTA(58, 30, 7)}
      <path d="M58 37 L70 74"/>
      <path d="M58 40 L28 34"/>
      <path d="M70 74 L92 106" class="a-tesa"/>
      <path d="M70 74 L52 100"/>
      <path d="M52 100 L46 110"/>
      <circle cx="92" cy="106" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="64" y="122" text-anchor="middle">gamba dietro tesa</text>
    `),
    "Gamba dietro distesa, tallone a terra"
  ),

  // ---------- FEMORALI ----------
  "aslr": () => telaio(
    vista(60, "profilo", `
      <path d="M18 96 H112" class="anim__suolo"/>
      ${TESTA(30, 86, 7)}
      <path d="M38 90 H84"/>
      <g class="a-gamba-su">
        <path d="M84 90 L112 84"/>
      </g>
      <path d="M84 92 L112 96"/>
      <circle cx="112" cy="84" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="60" y="116" text-anchor="middle">niente mani, niente slancio</text>
    `),
    "La gamba tesa sale da sola, l'altra resta a terra"
  ),

  "pike-seduto": () => telaio(
    vista(60, "profilo", `
      <path d="M18 100 H112" class="anim__suolo"/>
      <path d="M40 100 H104"/>
      <g class="a-piega">
        <path d="M40 100 L46 62"/>
        ${TESTA(48, 54, 7)}
        <path d="M46 66 L74 84" class="anim__leggero"/>
      </g>
      <circle cx="52" cy="82" r="3.6" class="anim__punto a-pulsa"/>
      <text class="anim__nota" x="60" y="118" text-anchor="middle">tirano gli addominali</text>
    `),
    "Ci si tira giù con gli addominali, non con le braccia"
  ),

  // ---------- ANCA: adduttori e rotatori ----------
  "farfalla": () => telaio(
    vista(60, "fronte", `
      ${TESTA(60, 24, 8)}
      <path d="M60 32 V62"/>
      <g class="a-ginocchia-giu">
        <path d="M60 62 L28 82"/>
        <path d="M60 62 L92 82"/>
      </g>
      <path d="M28 82 L60 96"/>
      <path d="M92 82 L60 96"/>
      <circle cx="28" cy="82" r="3.6" class="anim__punto"/>
      <circle cx="92" cy="82" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="60" y="116" text-anchor="middle">scendono da sole</text>
    `),
    "Piante unite, le ginocchia scendono per gravità"
  ),

  "frog-rock": () => telaio(
    vista(60, "profilo", `
      <path d="M14 104 H114" class="anim__suolo"/>
      <g class="a-rock">
        ${TESTA(38, 52, 7)}
        <path d="M46 56 H84"/>
        <path d="M46 56 L40 88"/>
        <path d="M84 56 L92 88"/>
        <path d="M40 88 H30"/>
        <path d="M92 88 H102"/>
      </g>
      <text class="anim__nota" x="60" y="120" text-anchor="middle">il bacino va indietro</text>
    `),
    "Ginocchia larghe, il bacino oscilla verso i talloni"
  ),

  "novanta-novanta": () => telaio(
    vista(60, "dall'alto", `
      ${TESTA(60, 26, 8)}
      <path d="M60 34 V58"/>
      <path d="M60 58 L26 58"/>
      <path d="M26 58 L26 88"/>
      <path d="M60 58 L94 66"/>
      <path d="M94 66 L94 96"/>
      <circle cx="26" cy="58" r="3.6" class="anim__punto a-pulsa"/>
      <text class="anim__nota" x="60" y="116" text-anchor="middle">due angoli retti</text>
    `),
    "Una gamba davanti a 90°, l'altra di lato a 90°"
  ),

  "figure-4": () => telaio(
    vista(60, "profilo", `
      <path d="M14 104 H114" class="anim__suolo"/>
      ${TESTA(26, 92, 7)}
      <path d="M34 96 H70"/>
      <g class="a-tira">
        <path d="M70 96 L88 70"/>
        <path d="M88 70 L74 50"/>
        <path d="M78 82 L100 66"/>
      </g>
      <circle cx="86" cy="74" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="60" y="120" text-anchor="middle">caviglia sopra il ginocchio</text>
    `),
    "Figura a 4, si tira la coscia verso il petto"
  ),

  "abduzione-laterale": () => telaio(
    vista(60, "profilo", `
      <path d="M14 104 H114" class="anim__suolo"/>
      ${TESTA(26, 88, 7)}
      <path d="M34 92 H76"/>
      <path d="M76 92 L104 100"/>
      <g class="a-abduce">
        <path d="M76 90 L104 76"/>
      </g>
      <circle cx="104" cy="76" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="60" y="120" text-anchor="middle">sale e scende lenta</text>
    `),
    "Sdraiato sul fianco, la gamba sopra si alza"
  ),

  // ---------- FLESSORI D'ANCA ----------
  "affondo-flessori": () => telaio(
    vista(60, "profilo", `
      <path d="M14 108 H114" class="anim__suolo"/>
      ${TESTA(56, 30, 7)}
      <g class="a-bacino">
        <path d="M56 38 V66"/>
        <path d="M56 66 L34 88"/>
        <path d="M56 66 L84 84"/>
      </g>
      <path d="M34 88 L34 108"/>
      <path d="M84 84 L100 108"/>
      <circle cx="56" cy="66" r="4" class="anim__punto a-pulsa"/>
      <text class="anim__nota" x="60" y="122" text-anchor="middle">coccige sotto</text>
    `),
    "Senza retroversione del bacino non allunghi niente"
  ),

  "ponte-glutei": () => telaio(
    vista(60, "profilo", `
      <path d="M14 104 H114" class="anim__suolo"/>
      ${TESTA(26, 92, 7)}
      <g class="a-ponte">
        <path d="M34 96 L74 76"/>
      </g>
      <path d="M74 78 L86 100"/>
      <path d="M86 100 H98"/>
      <circle cx="66" cy="80" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="60" y="120" text-anchor="middle">il bacino sale</text>
    `),
    "I glutei spingono il bacino verso l'alto"
  ),

  // ---------- TORACICA / SPALLE ----------
  "wall-slide": () => telaio(
    vista(60, "fronte", `
      <path d="M12 14 V112" class="anim__muro"/>
      ${TESTA(60, 28, 8)}
      <path d="M60 36 V84"/>
      <g class="a-braccia-su">
        <path d="M60 50 L34 40"/>
        <path d="M60 50 L86 40"/>
      </g>
      <path d="M44 92 L60 84 L76 92"/>
      <text class="anim__nota" x="62" y="120" text-anchor="middle">lombare piatta</text>
    `),
    "Le braccia scorrono senza staccare i contatti dal muro"
  ),

  "prone-liftoff": () => telaio(
    vista(60, "profilo", `
      <path d="M14 96 H114" class="anim__suolo"/>
      <path d="M28 88 H86"/>
      ${TESTA(24, 84, 7)}
      <g class="a-braccia-stacco">
        <path d="M86 88 L114 82"/>
      </g>
      <circle cx="112" cy="82" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="60" y="116" text-anchor="middle">costole giù</text>
    `),
    "Le braccia si staccano da terra, le costole restano basse"
  ),

  "estensione-toracica": () => telaio(
    vista(60, "profilo", `
      <path d="M14 104 H114" class="anim__suolo"/>
      <circle cx="62" cy="88" r="9" class="anim__attrezzo"/>
      <g class="a-estende">
        <path d="M40 92 L86 76"/>
        ${TESTA(34, 90, 7)}
      </g>
      <path d="M86 78 L96 100"/>
      <text class="anim__nota" x="60" y="120" text-anchor="middle">roller sotto le scapole</text>
    `),
    "Estensione sopra il roller, lenta e controllata"
  ),

  "gran-dorsale": () => telaio(
    vista(60, "profilo", `
      <path d="M14 108 H114" class="anim__suolo"/>
      <path d="M84 74 H112" class="anim__attrezzo"/>
      <g class="a-scende">
        <path d="M46 62 L86 72"/>
        ${TESTA(40, 60, 7)}
      </g>
      <path d="M46 64 L44 96"/>
      <path d="M44 96 H62"/>
      <path d="M52 66 q 6 10 -2 18" class="anim__punto-linea"/>
      <text class="anim__nota" x="60" y="122" text-anchor="middle">schiena ARROTONDATA</text>
    `),
    "Con la lombare flessa, altrimenti alleni gli estensori"
  ),

  // ---------- SQUAT ----------
  "squat-tenuta": () => telaio(
    vista(60, "fronte", `
      <path d="M14 106 H114" class="anim__suolo"/>
      ${TESTA(60, 24, 8)}
      <path d="M60 32 V58"/>
      <g class="a-spinge-fuori">
        <path d="M60 58 L34 82"/>
        <path d="M60 58 L86 82"/>
      </g>
      <path d="M34 82 L34 104"/>
      <path d="M86 82 L86 104"/>
      <path d="M60 62 L44 76"/>
      <path d="M60 62 L76 76"/>
      <circle cx="34" cy="82" r="3.6" class="anim__punto"/>
      <circle cx="86" cy="82" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="60" y="120" text-anchor="middle">gomiti spingono fuori</text>
    `),
    "Accosciata piena, i gomiti aprono le ginocchia"
  ),

  "cossack": () => telaio(
    vista(60, "fronte", `
      <path d="M10 104 H116" class="anim__suolo"/>
      ${TESTA(52, 28, 8)}
      <path d="M52 36 V60"/>
      <g class="a-cossack">
        <path d="M52 60 L34 84"/>
        <path d="M52 60 L98 92"/>
      </g>
      <path d="M34 84 L34 104"/>
      <circle cx="98" cy="92" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="60" y="120" text-anchor="middle">l'altra gamba resta tesa</text>
    `),
    "Si scende su una gamba, l'altra distesa di lato"
  ),

  // ---------- BACINO (protocollo laterale) ----------
  "sidelying-gluteo": () => telaio(
    vista(60, "profilo", `
      <path d="M14 104 H114" class="anim__suolo"/>
      ${TESTA(26, 86, 7)}
      <path d="M34 90 H74"/>
      <path d="M74 90 L92 74"/>
      <path d="M74 92 L94 100"/>
      <g class="a-spinta-piede">
        <path d="M92 74 L104 84"/>
      </g>
      <circle cx="102" cy="84" r="3.6" class="anim__punto a-pulsa"/>
      <text class="anim__nota" x="60" y="120" text-anchor="middle">tallone interno + alluce</text>
    `),
    "Spinta dai due contatti del piede, il gluteo si accende"
  ),

  "allungo-sopra-testa": () => telaio(
    vista(60, "fronte", `
      <path d="M14 110 H114" class="anim__suolo"/>
      ${TESTA(60, 34, 8)}
      <path d="M60 42 V78"/>
      <g class="a-allunga">
        <path d="M60 50 L44 20"/>
      </g>
      <path d="M60 50 L78 66"/>
      <path d="M60 78 L48 108"/>
      <path d="M60 78 L74 108"/>
      <circle cx="44" cy="20" r="3.6" class="anim__punto"/>
      <circle cx="74" cy="108" r="3.6" class="anim__punto"/>
      <text class="anim__nota" x="60" y="124" text-anchor="middle">peso sul tallone opposto</text>
    `),
    "Il braccio allunga in alto, il peso trasla sul tallone opposto"
  ),

  // fallback: figura neutra, meglio di uno spazio vuoto
  "generica": () => telaio(
    vista(60, "posizione", `
      <path d="M14 106 H114" class="anim__suolo"/>
      ${TESTA(60, 28, 8)}
      <path d="M60 36 V70"/>
      <path d="M60 44 L38 58"/>
      <path d="M60 44 L82 58"/>
      <path d="M60 70 L46 104"/>
      <path d="M60 70 L74 104"/>
      <text class="anim__nota" x="60" y="122" text-anchor="middle">segui i passi qui sotto</text>
    `),
    "Posizione descritta nei passi"
  ),
};

function renderAnimazione(chiave) {
  const fn = ANIMAZIONI[chiave] || ANIMAZIONI["generica"];
  return `<div class="anim-wrap anim-${chiave || "generica"}">${fn()}</div>`;
}

function haAnimazione(chiave) {
  return Boolean(ANIMAZIONI[chiave]);
}

export { renderAnimazione, haAnimazione, ANIMAZIONI };
