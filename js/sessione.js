// sessione.js — costruisce e guida le sessioni (PROGRAMMA-v2).
//
// Principio guida: la sessione deve essere più corta della resistenza ad
// iniziarla. Il tempo cresce con l'abitudine (5 → 18 min), i gruppi
// ruotano ogni 4 settimane, collo e G5 non escono mai.
//
// Layout: animazione/video, cronometro e pulsante restano fissi; i passi
// e i dettagli scorrono dietro.

import { getState, updateState } from "./storage.js";
import { FollowAlongEngine } from "./engine.js";
import { icona } from "./icone.js";
import { renderAnimazione } from "./animazioni.js";
import {
  GRUPPI, G1, BACINO, CARICO, TIPI_SESSIONE, DISTRETTI_PALESTRA,
  DURATA_STD, gruppiAttiviPerSettimana, fasePerSettimana, caricoSuggerito,
} from "./esercizi.js";

const PREP_PRIMA_VOLTA_SEC = 12;
const PREP_RIPETIZIONE_SEC = 5;

let engineAttivo = null;
let mediaMontato = null;

// ===================== date =====================

const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const oggiISO = () => fmt(new Date());

function addGiorni(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  return fmt(new Date(y, m - 1, d + n));
}

function giorniTra(a, b) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad)) / 86400000);
}

const altroLato = (l) => (l === "sx" ? "dx" : "sx");
const nomeLato = (l) => (l === "dx" ? "Destro" : "Sinistro");

// ===================== settimana di programma =====================

function settimanaCorrente(state) {
  const p = state.programma;
  if (!p.inizioProgramma) return 1;
  return Math.max(1, Math.floor(giorniTra(p.inizioProgramma, oggiISO()) / 7) + 1);
}

function latoStretto(state) {
  const m = state.assessment.baselineTest3.bersagli.farfalla.misure;
  if (m.altezzaGinocchioSxCm == null || m.altezzaGinocchioDxCm == null) return "dx";
  if (m.altezzaGinocchioSxCm === m.altezzaGinocchioDxCm) return null;
  return m.altezzaGinocchioSxCm > m.altezzaGinocchioDxCm ? "sx" : "dx";
}

// ===================== espansione di un esercizio in passi =====================

function espandi(ex, gruppo, stretto) {
  const base = {
    idEsercizio: ex.id, sigla: ex.sigla || null, nome: ex.nome, tag: ex.tag,
    gruppo: gruppo.id, gruppoNome: gruppo.nome,
    muscoli: ex.muscoli || [], serve: ex.serve, animazione: ex.animazione || "generica",
    video: ex.video || null, videoDecide: !!ex.videoDecide,
    passi: ex.passi || [], nota: ex.nota || gruppo.nota || null,
    ripetizioni: ex.ripetizioni || null,
    gruppoMuscolare: (ex.muscoli && ex.muscoli[0]) || gruppo.nome,
  };
  const durata = ex.durataSec || DURATA_STD;

  if (ex.lato) {
    const passi = [];
    for (let v = 0; v < (ex.volte || 1); v++) {
      passi.push({ ...base, lato: ex.lato, durataSec: durata });
    }
    return passi;
  }

  if (!ex.perLato) return [{ ...base, lato: null, durataSec: durata }];

  const passi = [
    { ...base, lato: "sx", durataSec: durata },
    { ...base, lato: "dx", durataSec: durata },
  ];
  if (ex.doppioADestra) passi.push({ ...base, lato: "dx", durataSec: durata, extra: true });
  if (ex.extraLatoStretto && stretto) passi.push({ ...base, lato: stretto, durataSec: durata, extra: true });
  return passi;
}

// ===================== costruzione delle sessioni =====================

function collo(quanti = 99) {
  return G1.esercizi.slice(0, quanti);
}

function costruisciQuotidiana(state) {
  const settimana = settimanaCorrente(state);
  const fase = fasePerSettimana(settimana);
  const rotazione = gruppiAttiviPerSettimana(settimana);
  const stretto = latoStretto(state);
  const budget = fase.minuti * 60;
  const passi = [];

  // 1. collo — sempre, per primo, non negoziabile
  for (const ex of collo(fase.minuti <= 5 ? 4 : 6)) passi.push(...espandi(ex, G1, stretto));

  // 2. gruppi attivi del blocco corrente (G1 escluso, già fatto)
  const attivi = rotazione.attivi.filter((g) => g !== "G1");
  let i = 0;
  while (passi.reduce((t, p) => t + p.durataSec, 0) < budget && i < 12) {
    let aggiunto = false;
    for (const idG of attivi) {
      const gruppo = GRUPPI[idG];
      const ex = gruppo.esercizi[i];
      if (!ex) continue;
      passi.push(...espandi(ex, gruppo, stretto));
      aggiunto = true;
      if (passi.reduce((t, p) => t + p.durataSec, 0) >= budget) break;
    }
    if (!aggiunto) break;
    i++;
  }

  // 3. bacino, dalla settimana 3
  if (fase.bacino) {
    const lat = state.assessment.esitoTest2.latoLateralizzato || "dx";
    const away = altroLato(lat);
    const lista = fase.bacino === "ridotto"
      ? BACINO.esercizi.filter((e) => e.ridotto)
      : BACINO.esercizi;
    for (const ex of lista) {
      const lato = ex.ruoloLato === "lat" ? lat : away;
      passi.push({
        idEsercizio: ex.id, sigla: ex.sigla, nome: ex.nome, tag: ex.tag,
        gruppo: "BACINO", gruppoNome: BACINO.nome, gruppoMuscolare: ex.muscoli[0],
        muscoli: ex.muscoli, serve: ex.serve, animazione: ex.animazione,
        video: ex.video, videoDecide: !!ex.videoDecide, passi: ex.passi,
        nota: BACINO.nota, lato, durataSec: ex.durataSec || 40, ripetizioni: null,
      });
    }
  }

  return passi;
}

// POST-CORSA. Tre vincoli dai paper, che prima non rispettavo:
//
// 1. Volume RIDOTTO. La Scala (§9) dice che lo stretching intenso apre i
//    canali del calcio e attiva le calpaine: è biochimicamente identico
//    all'allenamento. Sommarlo a fine corsa richiede "riduzione del
//    volume", non la stessa dose della quotidiana. Prima ne mettevo 25
//    di esercizi: era una seconda sessione, non un defaticamento.
// 2. UN solo esercizio per gruppo, quelli che la corsa accorcia davvero.
// 3. Ordine dal basso verso l'alto (§8 PROGRAMMA-v2): il sangue e il
//    calore sono distali, si parte da lì.
//
// Il collo resta perché è l'obiettivo dichiarato e al 30-40% non affatica.
function costruisciPostCorsa(state) {
  const stretto = latoStretto(state);
  const passi = [];

  // un esercizio per gruppo, scelto per pertinenza alla corsa
  const scelte = [
    ["G2", "g2-gastro"],   // polpaccio: il primo ad accorciarsi
    ["G2", "g2-soleo"],    // bersaglio diverso, protettivo sugli shin splints
    ["G4", "g4-affondo"],  // flessori: il gruppo che la corsa accorcia di piu'
    ["G3", "g3-femorale-piedi"],
    ["G6", "g6-tfl"],      // TFL/gluteo destro: filtro bandelletta
    ["G5", "g5-figure4"],
  ];

  for (const [idG, idEx] of scelte) {
    const gruppo = GRUPPI[idG];
    const ex = gruppo.esercizi.find((e) => e.id === idEx);
    if (ex) passi.push(...espandi(ex, gruppo, stretto));
  }

  // collo ridotto: allungamento + isometria, niente di piu'
  passi.push(...espandi(G1.esercizi[0], G1, stretto));
  passi.push(...espandi(G1.esercizi[3], G1, stretto));
  return passi;
}

function costruisciPostPalestra(state, distretto = "gambe") {
  const stretto = latoStretto(state);
  const passi = [];
  for (const idG of DISTRETTI_PALESTRA[distretto] || DISTRETTI_PALESTRA.gambe) {
    const gruppo = GRUPPI[idG];
    const soloS = gruppo.esercizi.filter((e) => e.tag === "S");
    for (const ex of soloS.slice(0, 2)) passi.push(...espandi(ex, gruppo, stretto));
  }
  for (const ex of collo(2)) passi.push(...espandi(ex, G1, stretto));
  return passi;
}

// MOBILITY = end-range sotto carico, in palestra. È la zona "fortemente
// resistita" della Scala: rinforza il pavimento del range mentre lo
// stretching ne alza il soffitto.
function costruisciMobility(state) {
  const stretto = latoStretto(state);
  const settimana = settimanaCorrente(state);
  const passi = [];

  for (const ex of CARICO.esercizi) {
    const kg = caricoSuggerito(ex, settimana);
    const generati = espandi(ex, CARICO, stretto);
    for (const p of generati) {
      p.carico = kg;
      p.durataSec = ex.durataSec || 45;
    }
    passi.push(...generati);
  }
  return passi;
}

// Regola 1: la dose minima esiste sempre. Collo + un allungamento.
function costruisciMinima(state) {
  const stretto = latoStretto(state);
  const passi = [];
  passi.push(...espandi(G1.esercizi[0], G1, stretto)); // flessione laterale ×2
  passi.push(...espandi(G1.esercizi[3], G1, stretto)); // isometria
  passi.push(...espandi(GRUPPI.G5.esercizi[0], GRUPPI.G5, stretto)); // farfalla
  return passi;
}

function costruisciSessione(state, tipo = "quotidiana") {
  if (!state.assessment.esitoTest2.latoLateralizzato && tipo === "quotidiana") {
    const fase = fasePerSettimana(settimanaCorrente(state));
    if (fase.bacino) return { errore: "assessment-incompleto", passi: [] };
  }
  const costruttori = {
    quotidiana: costruisciQuotidiana,
    "post-corsa": costruisciPostCorsa,
    "post-palestra": costruisciPostPalestra,
    mobility: costruisciMobility,
    minima: costruisciMinima,
  };
  const fn = costruttori[tipo] || costruisciQuotidiana;
  return { errore: null, passi: fn(state) };
}

function riepilogoModuli(passi) {
  const mappa = new Map();
  for (const p of passi) {
    if (!mappa.has(p.gruppo)) mappa.set(p.gruppo, { nome: p.gruppoNome, muscoli: new Set(), durataSec: 0, tag: p.tag });
    const v = mappa.get(p.gruppo);
    v.durataSec += p.durataSec;
    for (const m of p.muscoli || []) v.muscoli.add(m);
  }
  return [...mappa.values()].map((v) => ({ ...v, muscoli: [...v.muscoli] }));
}

function conPreparazione(passiLavoro, visti) {
  const inSessione = new Set();
  const out = [];
  let n = 0;
  for (const p of passiLavoro) {
    const chiave = p.idEsercizio;
    const prima = !inSessione.has(chiave);
    inSessione.add(chiave);
    n += 1;
    out.push({
      tipo: "prep", rif: { ...p, numero: n }, chiave,
      mai: !visti.includes(chiave),
      beep: "inizio",
      durataSec: prima && !visti.includes(chiave) ? PREP_PRIMA_VOLTA_SEC : PREP_RIPETIZIONE_SEC,
    });
    out.push({ ...p, tipo: "lavoro", numero: n, beep: "fine" });
  }
  return out;
}

// ===================== rendering =====================

function renderSessione(container, tipo = "quotidiana") {
  const state = getState();
  const { errore, passi } = costruisciSessione(state, tipo);

  if (errore === "assessment-incompleto") {
    container.innerHTML = `<div class="sess-layout"><div class="sess-scorre"><p class="view-placeholder">Il protocollo del bacino richiede l'assessment (Test 2). Completalo da Impostazioni.</p></div></div>`;
    return;
  }
  if (passi.length === 0) {
    container.innerHTML = `<div class="sess-layout"><div class="sess-scorre"><p class="view-placeholder">Nessun esercizio per questa sessione.</p></div></div>`;
    return;
  }

  const avvisoCollo = !state.programma.avvisoColloMostrato && passi.some((p) => p.gruppo === "G1");
  if (avvisoCollo) mostraAvvisoCollo(container, passi, tipo);
  else avviaMotore(container, passi, tipo);
}

function mostraAvvisoCollo(container, passi, tipo) {
  container.innerHTML = `
    <div class="sess-layout">
      <div class="sess-scorre">
        <div class="sess-gate">
          <h2 class="titolo-2">Prima del modulo collo</h2>
          <div class="sess-avviso">${icona("avviso", 20)}<span>${G1.avviso}</span></div>
          <p class="didascalia">Intensità ${G1.intensita}. Questo avviso compare una sola volta.</p>
        </div>
      </div>
      <div class="sess-piede"><button class="btn btn-primary" id="btn-gate-continua">Ho capito, continua</button></div>
    </div>
  `;
  container.querySelector("#btn-gate-continua").addEventListener("click", () => {
    updateState((s) => { s.programma.avvisoColloMostrato = true; });
    avviaMotore(container, passi, tipo);
  });
}

function avviaMotore(container, passiLavoro, tipo) {
  const state = getState();
  const visti = state.programma.videoVistiObbligatori || [];
  const totale = passiLavoro.length;
  const passi = conPreparazione(passiLavoro, visti);
  mediaMontato = null;

  container.innerHTML = `
    <div class="sess-layout" id="sess-schermo">
      <div class="sess-testa">
        <div class="sess-anello"><div class="sess-anello__pieno" id="sess-avanzamento"></div></div>
        <div class="sess-media" id="sess-media"></div>
        <div class="sess-riga-timer">
          <div style="min-width:0">
            <div class="occhiello" id="sess-stato"></div>
            <h2 class="testata" id="sess-titolo" style="margin-top:2px"></h2>
          </div>
          <div class="sess-countdown-compatto" id="sess-countdown">--</div>
        </div>
      </div>

      <div class="sess-scorre">
        <div class="sess-chip-riga" id="sess-chip" style="margin-bottom:16px"></div>
        <ol class="sess-passi" id="sess-passi"></ol>
        <p class="didascalia" id="sess-nota" style="margin-top:16px" hidden></p>
        <div id="sess-anim-extra" style="margin-top:16px" hidden></div>
      </div>

      <div class="sess-piede"><button class="btn btn-primary" id="btn-avanti"></button></div>
    </div>
  `;

  container.querySelector("#btn-avanti").addEventListener("click", () => {
    if (engineAttivo) engineAttivo.avanti();
  });

  engineAttivo = new FollowAlongEngine({
    onTick: (r) => aggiornaCountdown(container, r),
    onStepChange: (step) => aggiornaStep(container, step, totale),
    onFine: () => completaSessione(container, passiLavoro, tipo),
  });

  engineAttivo.carica(passi);
  engineAttivo.avvia();
  mostraControlli();
  aggiornaPulsantePausa(false);
}

function aggiornaStep(container, step, totale) {
  const d = step.tipo === "prep" ? step.rif : step;
  const inPrep = step.tipo === "prep";
  const schermo = container.querySelector("#sess-schermo");

  schermo.classList.toggle("is-prep", inPrep);
  schermo.classList.toggle("is-lavoro", !inPrep);

  document.getElementById("sessione-progress").textContent = `${d.numero} di ${totale}`;
  container.querySelector("#sess-stato").textContent = inPrep ? "Preparati" : "Tieni la posizione";
  container.querySelector("#sess-titolo").textContent = d.nome;
  container.querySelector("#btn-avanti").textContent = inPrep ? "Sono pronto" : "Avanti";

  const chip = [];
  chip.push(`<span class="pillola ${d.tag === "M" ? "is-verde" : "is-blu"}">${d.tag === "M" ? "Mobility · attivo" : "Stretching · passivo"}</span>`);
  if (d.lato) chip.push(`<span class="pillola is-blu">Lato ${nomeLato(d.lato)}${d.extra ? " · extra" : ""}</span>`);
  if (d.carico != null && d.carico > 0) chip.push(`<span class="pillola is-arancio">${d.carico} kg</span>`);
  if (d.ripetizioni) chip.push(`<span class="pillola is-arancio">${d.ripetizioni}</span>`);
  if (d.serve) chip.push(`<span class="pillola">${d.serve}</span>`);
  for (const m of d.muscoli || []) chip.push(`<span class="pillola">${m}</span>`);
  container.querySelector("#sess-chip").innerHTML = chip.join("");

  container.querySelector("#sess-passi").innerHTML = (d.passi || []).map((t) => `<li>${t}</li>`).join("");

  const nota = container.querySelector("#sess-nota");
  nota.hidden = !d.nota;
  if (d.nota) nota.textContent = d.nota;

  // Media in cima: il video parte da solo se esiste, altrimenti comanda
  // l'animazione. Non si rimonta tra preparazione e tenuta.
  const media = container.querySelector("#sess-media");
  const extra = container.querySelector("#sess-anim-extra");
  const chiaveMedia = d.video ? `v:${d.video}` : `a:${d.animazione}`;

  if (mediaMontato !== chiaveMedia) {
    if (d.video) {
      // Il video comanda: parte da solo (muto, come impongono i browser)
      // e va in loop. L'animazione non si mostra: dove c'è il video vero
      // uno schema affiancato è solo rumore.
      media.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${d.video}?autoplay=1&mute=1&loop=1&playlist=${d.video}&rel=0&playsinline=1&controls=1"
        title="${d.nome}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      // Nessun video verificabile per questo esercizio: ripiego sullo schema.
      media.innerHTML = renderAnimazione(d.animazione);
    }
    extra.hidden = true;
    extra.innerHTML = "";
    mediaMontato = chiaveMedia;
  }

  if (inPrep && step.mai) {
    updateState((s) => {
      s.programma.videoVistiObbligatori = s.programma.videoVistiObbligatori || [];
      if (!s.programma.videoVistiObbligatori.includes(step.chiave)) s.programma.videoVistiObbligatori.push(step.chiave);
    });
  }

  container.querySelector(".sess-scorre").scrollTop = 0;
  aggiornaAvanzamento(container);
}

function aggiornaCountdown(container, r) {
  const el = container.querySelector("#sess-countdown");
  if (el) el.textContent = Math.max(r, 0);
  aggiornaAvanzamento(container);
}

function aggiornaAvanzamento(container) {
  const barra = container.querySelector("#sess-avanzamento");
  if (!barra || !engineAttivo) return;
  const tot = engineAttivo.steps.reduce((t, s) => t + s.durataSec, 0);
  const rest = engineAttivo.steps.slice(engineAttivo.indiceCorrente + 1).reduce((t, s) => t + s.durataSec, 0)
    + Math.max(engineAttivo.secondiResidui, 0);
  barra.parentElement.style.setProperty("--p", tot ? (((tot - rest) / tot) * 100).toFixed(1) : 0);
}

// ===================== fine sessione =====================

function completaSessione(container, passiLavoro, tipo) {
  const durata = passiLavoro.reduce((t, p) => t + p.durataSec, 0);
  const oggi = oggiISO();
  const volume = {};
  for (const p of passiLavoro) {
    if (!p.gruppoMuscolare) continue;
    volume[p.gruppoMuscolare] = (volume[p.gruppoMuscolare] || 0) + p.durataSec;
  }

  updateState((s) => {
    s.storicoSessioni.push({
      data: oggi, tipo, durataSec: durata,
      esercizi: [...new Set(passiLavoro.map((p) => p.idEsercizio))],
      volumePerGruppo: volume,
    });
    if (!s.programma.inizioProgramma) s.programma.inizioProgramma = oggi;
    aggiornaStreakTollerante(s, oggi);
  });

  engineAttivo = null;
  mediaMontato = null;
  nascondiControlli();

  const streak = getState().streak.giorniConsecutivi;
  container.innerHTML = `
    <div class="sess-layout">
      <div class="sess-scorre">
        <div class="sess-fine">
          <div style="color:var(--verde)">${icona("spunta", 44)}</div>
          <h2 class="titolo-2">Sessione completata</h2>
          <p class="corpo">${Math.round(durata / 60)} minuti · ${streak} ${streak === 1 ? "giorno" : "giorni"} di fila.</p>
          <p class="didascalia">Il programma è tarato su 5 giorni su 7: due buchi sono dentro il piano.</p>
        </div>
      </div>
      <div class="sess-piede"><button class="btn btn-primary" id="btn-fine-sessione">Chiudi</button></div>
    </div>
  `;
  document.getElementById("sessione-progress").textContent = "";
  container.querySelector("#btn-fine-sessione").addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("sessione-chiusa"));
  });
}

// Regola 2: lo streak tollera un buco. Si azzera solo dopo 3 giorni
// consecutivi a zero — uno streak che si rompe al primo giorno storto
// insegna solo a smettere.
function aggiornaStreakTollerante(s, oggi) {
  const ultima = s.streak.ultimaDataCompletata;
  if (ultima === oggi) return;
  const buco = ultima ? giorniTra(ultima, oggi) : 99;
  if (buco <= 3) s.streak.giorniConsecutivi += 1;
  else s.streak.giorniConsecutivi = 1;
  s.streak.ultimaDataCompletata = oggi;
}

function streakAncoraValida(state) {
  const ultima = state.streak.ultimaDataCompletata;
  if (!ultima) return true;
  return giorniTra(ultima, oggiISO()) <= 3;
}

// ===================== controlli =====================

function togglePausa() {
  if (!engineAttivo) return;
  if (engineAttivo.inPausa) { engineAttivo.avvia(); aggiornaPulsantePausa(false); }
  else { engineAttivo.pausa(); aggiornaPulsantePausa(true); }
}

function fermaSessione() {
  if (engineAttivo) { engineAttivo.ferma(); engineAttivo = null; }
  mediaMontato = null;
  const body = document.getElementById("sessione-body");
  if (body) body.innerHTML = "";
  nascondiControlli();
}

function aggiornaPulsantePausa(inPausa) {
  const btn = document.getElementById("btn-pausa-sessione");
  if (!btn) return;
  btn.hidden = false;
  btn.innerHTML = icona(inPausa ? "play" : "pausa", 20, inPausa);
  btn.setAttribute("aria-label", inPausa ? "Riprendi" : "Pausa");
}

const mostraControlli = () => { const b = document.getElementById("btn-pausa-sessione"); if (b) b.hidden = false; };
const nascondiControlli = () => { const b = document.getElementById("btn-pausa-sessione"); if (b) b.hidden = true; };

export {
  renderSessione, togglePausa, fermaSessione,
  costruisciSessione, riepilogoModuli, settimanaCorrente,
  streakAncoraValida, oggiISO, addGiorni, giorniTra,
};
