// sessione.js — costruisce e guida la sessione serale (RESET + MICRO).
// Risolve i lati dal verdetto dell'assessment, applica le regole del
// Blocco 0, guida il FollowAlongEngine e registra il risultato: storico,
// streak, volume per gruppo muscolare, avanzamento della settimana.
//
// Ogni esercizio ha una PREPARAZIONE (cosa serve, video, passi, tempo per
// mettersi in posizione) e una TENUTA. Il video resta visibile anche
// durante la tenuta e non viene rimontato tra le due fasi, così non
// riparte da capo.

import { getState, updateState } from "./storage.js";
import { FollowAlongEngine } from "./engine.js";
import { icona } from "./icone.js";
import {
  NOTA_ATTREZZI,
  NOTA_RESPIRO,
  RESET_GRUPPO_A,
  RESET_GRUPPO_B,
  RESET_DURATA_SERIE_SEC,
  MICRO_DURATA_SEC,
  MODULO_M5,
  MODULI_MICRO,
  MODULI_MICRO_BLOCCO_0,
} from "./esercizi.js";

const PREP_PRIMA_VOLTA_SEC = 15;
const PREP_RIPETIZIONE_SEC = 6;

let engineAttivo = null;
let videoMontato = null; // id del video attualmente nell'iframe

// ===================== date (locali, senza fuso UTC) =====================

function formattaData(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function oggiISO() {
  return formattaData(new Date());
}

function addGiorni(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  return formattaData(new Date(y, m - 1, d + n));
}

function giorniTra(aISO, bISO) {
  const [ay, am, ad] = aISO.split("-").map(Number);
  const [by, bm, bd] = bISO.split("-").map(Number);
  return Math.round((new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad)) / 86400000);
}

// ===================== risoluzione lati =====================

function altroLato(lato) { return lato === "sx" ? "dx" : "sx"; }
function nomeLato(lato) { return lato === "dx" ? "Destro" : "Sinistro"; }

function calcolaLatoStrettoFarfalla(state) {
  const m = state.assessment.baselineTest3.bersagli.farfalla.misure;
  if (m.altezzaGinocchioSxCm === null || m.altezzaGinocchioDxCm === null) return null;
  if (m.altezzaGinocchioSxCm === m.altezzaGinocchioDxCm) return null;
  return m.altezzaGinocchioSxCm > m.altezzaGinocchioDxCm ? "sx" : "dx";
}

// ===================== costruzione dei passi =====================

function generaPassiMicro(modulo, ex, latoStretto) {
  const base = {
    fase: "micro", modulo: modulo.id, moduloTitolo: modulo.titolo,
    nome: ex.nome, istruzioni: ex.istruzioni, passi: ex.passi,
    gruppoMuscolare: ex.gruppoMuscolare, muscoli: ex.muscoli,
    serve: ex.serve, video: null, videoDecide: false,
    avviso: modulo.id === "M5" ? modulo.avviso : null,
  };

  if (modulo.id === "M5") {
    const lato = ex.fase === "allungamento" ? modulo.latoAllungamento : modulo.latoRinforzo;
    const passi = [];
    for (let v = 1; v <= ex.volte; v++) {
      passi.push({
        ...base, lato,
        badge: `${modulo.titolo} · ${ex.fase}${ex.volte > 1 ? ` ${v}/${ex.volte}` : ""}`,
        durataSec: MICRO_DURATA_SEC,
      });
    }
    return passi;
  }

  if (ex.dueFasi) {
    return [
      { ...base, lato: null, badge: `${modulo.titolo} · oscillazioni`, durataSec: MICRO_DURATA_SEC },
      { ...base, lato: null, badge: `${modulo.titolo} · tenuta`, durataSec: MICRO_DURATA_SEC },
    ];
  }

  if (!ex.perLato) {
    return [{ ...base, lato: null, badge: modulo.titolo, durataSec: MICRO_DURATA_SEC }];
  }

  const passi = [
    { ...base, lato: "sx", badge: `${modulo.titolo} · sinistro`, durataSec: MICRO_DURATA_SEC },
    { ...base, lato: "dx", badge: `${modulo.titolo} · destro`, durataSec: MICRO_DURATA_SEC },
  ];
  if (ex.extraLatoStretto && latoStretto) {
    passi.push({ ...base, lato: latoStretto, badge: `${modulo.titolo} · extra lato stretto`, durataSec: MICRO_DURATA_SEC });
  }
  return passi;
}

function costruisciPassiLavoro(state) {
  const lat = state.assessment.esitoTest2.latoLateralizzato;
  if (!lat) return { errore: "assessment-incompleto", passi: [] };

  const away = altroLato(lat);
  const risolvi = (ruolo) => (ruolo === "lat" ? lat : away);
  const blocco = state.programma.blocco;
  const serieReset = blocco === 0 ? 1 : 2;
  const passi = [];

  for (const gruppo of [RESET_GRUPPO_A, RESET_GRUPPO_B]) {
    for (const ex of gruppo.esercizi) {
      const latoLavoro = risolvi(ex.lavoraLato);
      for (let s = 1; s <= serieReset; s++) {
        passi.push({
          fase: "reset", gruppo: gruppo.sigla, sigla: ex.sigla, nome: ex.nome,
          video: ex.video, videoDecide: !!ex.videoDecide,
          lato: latoLavoro, serve: ex.serve, muscoli: ex.muscoli,
          istruzioni: ex.istruzioni, passi: ex.passi,
          gruppoMuscolare: ex.gruppoMuscolare,
          badge: `Gruppo ${gruppo.sigla} · serie ${s} di ${serieReset}`,
          nota: NOTA_RESPIRO,
          durataSec: RESET_DURATA_SERIE_SEC,
        });
      }
    }
  }

  const moduli = blocco === 0 ? MODULI_MICRO_BLOCCO_0 : MODULI_MICRO;
  const latoStretto = calcolaLatoStrettoFarfalla(state);
  for (const modulo of moduli) {
    for (const ex of modulo.esercizi) {
      passi.push(...generaPassiMicro(modulo, ex, latoStretto));
    }
  }

  return { errore: null, passi };
}

// Riepilogo per la schermata Oggi: cosa si tocca stasera, muscolo per muscolo.
function riepilogoModuli(passi) {
  const mappa = new Map();
  for (const p of passi) {
    const chiave = p.fase === "reset" ? "reset" : p.modulo;
    const nome = p.fase === "reset" ? "RESET · bacino e respiro" : `${p.modulo} · ${p.moduloTitolo}`;
    if (!mappa.has(chiave)) mappa.set(chiave, { nome, muscoli: new Set(), durataSec: 0 });
    const voce = mappa.get(chiave);
    voce.durataSec += p.durataSec;
    for (const m of p.muscoli || []) voce.muscoli.add(m);
  }
  return [...mappa.values()].map((v) => ({ ...v, muscoli: [...v.muscoli] }));
}

function conPreparazione(passiLavoro, videoGiaVisti) {
  const vistiInSessione = new Set();
  const risultato = [];
  let numero = 0;

  for (const p of passiLavoro) {
    const chiave = p.sigla || p.nome;
    const primaInSessione = !vistiInSessione.has(chiave);
    vistiInSessione.add(chiave);
    const videoMaiVisto = !!p.video && !videoGiaVisti.includes(chiave);
    numero += 1;

    risultato.push({
      tipo: "prep", rif: { ...p, numero }, chiave, videoMaiVisto, beep: "inizio",
      durataSec: (primaInSessione && videoMaiVisto) ? PREP_PRIMA_VOLTA_SEC : PREP_RIPETIZIONE_SEC,
    });
    risultato.push({ ...p, tipo: "lavoro", numero, beep: "fine" });
  }
  return risultato;
}

// ===================== rendering =====================

function renderSessione(container) {
  const state = getState();
  const { errore, passi } = costruisciPassiLavoro(state);

  if (errore === "assessment-incompleto") {
    container.innerHTML = `<p class="view-placeholder">Completa prima l'assessment: la sessione dipende dal risultato del Test 2.</p>`;
    document.getElementById("sessione-progress").textContent = "";
    nascondiControlli();
    return;
  }

  if (!state.programma.avvisoColloMostrato && passi.some((p) => p.modulo === "M5")) {
    mostraAvvisoCollo(container, passi);
  } else {
    avviaMotore(container, passi);
  }
}

function mostraAvvisoCollo(container, passi) {
  document.getElementById("sessione-progress").textContent = "";
  nascondiControlli();
  container.innerHTML = `
    <div class="sess-centro">
      <div class="sess-gate">
        <h2 class="titolo-2">Prima del modulo collo</h2>
        <div class="sess-avviso">${icona("avviso", 20)}<span>${MODULO_M5.avviso}</span></div>
        <p class="didascalia">Intensità ${MODULO_M5.intensitaMax}. Questo avviso compare una sola volta.</p>
        <button class="btn btn-primary" id="btn-gate-continua">Ho capito, continua</button>
      </div>
    </div>
  `;
  container.querySelector("#btn-gate-continua").addEventListener("click", () => {
    updateState((s) => { s.programma.avvisoColloMostrato = true; });
    avviaMotore(container, passi);
  });
}

function avviaMotore(container, passiLavoro) {
  const state = getState();
  const videoGiaVisti = state.programma.videoVistiObbligatori || [];
  const totaleEsercizi = passiLavoro.length;
  const passi = conPreparazione(passiLavoro, videoGiaVisti);
  videoMontato = null;

  container.innerHTML = `
    <div class="sess-centro">
      <div class="sess-schermo" id="sess-schermo">
        <div class="sess-anello"><div class="sess-anello__pieno" id="sess-avanzamento"></div></div>

        <div class="sess-video" id="sess-video" hidden></div>

        <div class="sess-cronometro">
          <div class="sess-countdown" id="sess-countdown">--</div>
          <div class="sess-stato" id="sess-stato"></div>
        </div>

        <div>
          <div class="occhiello" id="sess-badge" style="margin-bottom:4px"></div>
          <h2 class="titolo-2" id="sess-titolo"></h2>
          <div class="sess-chip-riga" id="sess-chip" style="margin-top:8px"></div>
        </div>

        <div class="vetro scheda" style="margin:0">
          <ol class="sess-passi" id="sess-passi"></ol>
          <p class="didascalia" id="sess-nota" style="margin-top:8px" hidden></p>
        </div>

        <button class="btn btn-primary" id="btn-avanti"></button>
      </div>
    </div>
  `;

  container.querySelector("#btn-avanti").addEventListener("click", () => {
    if (engineAttivo) engineAttivo.avanti();
  });

  engineAttivo = new FollowAlongEngine({
    onTick: (residui) => aggiornaCountdown(container, residui),
    onStepChange: (step) => aggiornaStep(container, step, totaleEsercizi),
    onFine: () => completaSessione(container, passiLavoro),
  });

  engineAttivo.carica(passi);
  engineAttivo.avvia();
  mostraControlli();
  aggiornaPulsantePausa(false);
}

function aggiornaStep(container, step, totaleEsercizi) {
  const dati = step.tipo === "prep" ? step.rif : step;
  const inPrep = step.tipo === "prep";
  const schermo = container.querySelector("#sess-schermo");

  schermo.classList.toggle("is-prep", inPrep);
  schermo.classList.toggle("is-lavoro", !inPrep);

  document.getElementById("sessione-progress").textContent = `${dati.numero} di ${totaleEsercizi}`;
  container.querySelector("#sess-badge").textContent = dati.badge;
  container.querySelector("#sess-titolo").textContent = dati.nome;
  container.querySelector("#sess-stato").textContent = inPrep ? "Preparati" : "Tieni la posizione";
  container.querySelector("#btn-avanti").textContent = inPrep ? "Sono pronto" : "Avanti";

  // chip: lato, attrezzatura, muscoli
  const chip = [];
  if (dati.lato) chip.push(`<span class="pillola is-blu">Lato ${nomeLato(dati.lato)}</span>`);
  if (dati.serve) chip.push(`<span class="pillola">${dati.serve}</span>`);
  for (const m of dati.muscoli || []) chip.push(`<span class="pillola">${m}</span>`);
  container.querySelector("#sess-chip").innerHTML = chip.join("");

  // passi numerati
  container.querySelector("#sess-passi").innerHTML =
    (dati.passi || []).map((t) => `<li>${t}</li>`).join("");

  const nota = container.querySelector("#sess-nota");
  const testoNota = dati.video ? `${dati.nota ? dati.nota + " " : ""}${NOTA_ATTREZZI}` : dati.nota;
  nota.hidden = !testoNota;
  if (testoNota) nota.textContent = testoNota;

  // Video: resta montato anche durante la tenuta e non riparte da capo
  // quando si passa da preparazione a tenuta dello stesso esercizio.
  const contenitore = container.querySelector("#sess-video");
  if (dati.video) {
    contenitore.hidden = false;
    if (videoMontato !== dati.video) {
      contenitore.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${dati.video}?rel=0&playsinline=1&loop=1&playlist=${dati.video}"
        title="${dati.nome}" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
      videoMontato = dati.video;
    }
    if (inPrep && step.videoMaiVisto) {
      updateState((s) => {
        s.programma.videoVistiObbligatori = s.programma.videoVistiObbligatori || [];
        if (!s.programma.videoVistiObbligatori.includes(step.chiave)) {
          s.programma.videoVistiObbligatori.push(step.chiave);
        }
      });
    }
  } else {
    contenitore.hidden = true;
    contenitore.innerHTML = "";
    videoMontato = null;
  }

  aggiornaAvanzamento(container);
}

function aggiornaCountdown(container, residui) {
  const el = container.querySelector("#sess-countdown");
  if (el) el.textContent = Math.max(residui, 0);
  aggiornaAvanzamento(container);
}

function aggiornaAvanzamento(container) {
  const barra = container.querySelector("#sess-avanzamento");
  if (!barra || !engineAttivo) return;
  const totale = engineAttivo.steps.reduce((t, s) => t + s.durataSec, 0);
  const restanti = engineAttivo.steps
    .slice(engineAttivo.indiceCorrente + 1)
    .reduce((t, s) => t + s.durataSec, 0) + Math.max(engineAttivo.secondiResidui, 0);
  const percentuale = totale === 0 ? 0 : ((totale - restanti) / totale) * 100;
  barra.parentElement.style.setProperty("--p", percentuale.toFixed(1));
}

// ===================== fine sessione =====================

function completaSessione(container, passiLavoro) {
  const durataTotale = passiLavoro.reduce((t, p) => t + p.durataSec, 0);
  const oggi = oggiISO();

  // volume per gruppo muscolare: serve alla soglia dei 5 minuti a settimana
  const volume = {};
  for (const p of passiLavoro) {
    if (!p.gruppoMuscolare) continue;
    volume[p.gruppoMuscolare] = (volume[p.gruppoMuscolare] || 0) + p.durataSec;
  }

  updateState((s) => {
    s.storicoSessioni.push({
      data: oggi, tipo: "reset+micro", durataSec: durataTotale,
      esercizi: [...new Set(passiLavoro.map((p) => p.sigla || p.nome))],
      volumePerGruppo: volume,
    });

    if (s.streak.ultimaDataCompletata === oggi) {
      // già registrata oggi
    } else if (s.streak.ultimaDataCompletata === addGiorni(oggi, -1)) {
      s.streak.giorniConsecutivi += 1;
    } else {
      s.streak.giorniConsecutivi = 1;
    }
    s.streak.ultimaDataCompletata = oggi;
    if (!s.programma.settimanaIniziataIl) s.programma.settimanaIniziataIl = oggi;
  });

  valutaAvanzamentoSettimana();
  engineAttivo = null;
  videoMontato = null;
  nascondiControlli();

  const streak = getState().streak.giorniConsecutivi;
  container.innerHTML = `
    <div class="sess-centro">
      <div class="sess-fine">
        <div style="color:var(--verde)">${icona("spunta", 44)}</div>
        <h2 class="titolo-2">Sessione completata</h2>
        <p class="corpo">${streak} ${streak === 1 ? "giorno" : "giorni"} di fila.</p>
        <button class="btn btn-primary" id="btn-fine-sessione">Chiudi</button>
      </div>
    </div>
  `;
  document.getElementById("sessione-progress").textContent = "";
  container.querySelector("#btn-fine-sessione").addEventListener("click", () => {
    document.getElementById("view-sessione").hidden = true;
    document.dispatchEvent(new CustomEvent("sessione-chiusa"));
  });
}

function contaGiorniCompletatiInFinestra(storico, inizioISO, giorni) {
  const finestra = new Set();
  for (let i = 0; i < giorni; i++) finestra.add(addGiorni(inizioISO, i));
  const completate = new Set(storico.filter((s) => s.tipo === "reset+micro").map((s) => s.data));
  let n = 0;
  for (const d of finestra) if (completate.has(d)) n++;
  return n;
}

function valutaAvanzamentoSettimana() {
  const state = getState();
  const inizio = state.programma.settimanaIniziataIl;
  if (!inizio) {
    updateState((s) => { s.programma.settimanaIniziataIl = oggiISO(); });
    return;
  }
  if (giorniTra(inizio, oggiISO()) < 7) return;

  const completati = contaGiorniCompletatiInFinestra(state.storicoSessioni, inizio, 7);
  const saltati = 7 - completati;

  updateState((s) => {
    if (s.programma.blocco === 0) {
      if (saltati > 1) {
        s.programma.settimanaIniziataIl = oggiISO(); // ripete la settimana 0
      } else {
        s.programma.blocco = 1;
        s.programma.settimana = 1;
        s.programma.settimanaIniziataIl = oggiISO();
      }
    } else {
      s.programma.settimana += 1;
      s.programma.settimanaIniziataIl = oggiISO();
    }
  });
}

// ===================== controlli =====================

function togglePausa() {
  if (!engineAttivo) return;
  if (engineAttivo.inPausa) { engineAttivo.avvia(); aggiornaPulsantePausa(false); }
  else { engineAttivo.pausa(); aggiornaPulsantePausa(true); }
}

function fermaSessione() {
  if (engineAttivo) { engineAttivo.ferma(); engineAttivo = null; }
  videoMontato = null;
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

function mostraControlli() {
  const btn = document.getElementById("btn-pausa-sessione");
  if (btn) btn.hidden = false;
}

function nascondiControlli() {
  const btn = document.getElementById("btn-pausa-sessione");
  if (btn) btn.hidden = true;
}

export {
  renderSessione, togglePausa, fermaSessione, valutaAvanzamentoSettimana,
  costruisciPassiLavoro, riepilogoModuli, oggiISO, addGiorni, giorniTra,
};
