// sessione.js — costruisce e guida la sessione serale (RESET + MICRO):
// risolve i lati dal verdetto dell'assessment, applica le regole del
// Blocco 0 (volume ridotto, video obbligatorio la prima volta, avviso
// collo una tantum), guida il FollowAlongEngine e registra il risultato
// (storico, streak, avanzamento/ripetizione della settimana).

import { getState, updateState } from "./storage.js";
import { FollowAlongEngine } from "./engine.js";
import {
  RESET_GRUPPO_A,
  RESET_GRUPPO_B,
  RESET_DURATA_SERIE_SEC,
  MICRO_DURATA_SEC,
  MODULO_M5,
  MODULI_MICRO,
  MODULI_MICRO_BLOCCO_0,
} from "./esercizi.js";

let engineAttivo = null;

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
  const diff = new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad);
  return Math.round(diff / 86400000);
}

// ===================== risoluzione lati =====================

function altroLato(lato) {
  return lato === "sx" ? "dx" : "sx";
}

function calcolaLatoStrettoFarfalla(state) {
  const m = state.assessment.baselineTest3.bersagli.farfalla.misure;
  if (m.altezzaGinocchioSxCm === null || m.altezzaGinocchioDxCm === null) return null;
  if (m.altezzaGinocchioSxCm === m.altezzaGinocchioDxCm) return null;
  // più distanza da terra = meno rotazione esterna = lato più stretto
  return m.altezzaGinocchioSxCm > m.altezzaGinocchioDxCm ? "sx" : "dx";
}

// ===================== costruzione dei passi =====================

function generaPassiMicro(modulo, ex, latoStretto) {
  const base = {
    fase: "micro", modulo: modulo.id, moduloTitolo: modulo.titolo,
    nome: ex.nome, istruzioni: ex.istruzioni, gruppoMuscolare: ex.gruppoMuscolare,
    video: null,
  };

  if (modulo.id === "M5") {
    const lato = ex.fase === "allungamento" ? modulo.latoAllungamento : modulo.latoRinforzo;
    const passi = [];
    for (let v = 1; v <= ex.volte; v++) {
      passi.push({
        ...base, lato,
        badge: `${modulo.titolo} · ${ex.fase === "allungamento" ? "allungamento" : "rinforzo"}${ex.volte > 1 ? ` ${v}/${ex.volte}` : ""}`,
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
    passi.push({ ...base, lato: latoStretto, badge: `${modulo.titolo} · extra sul lato stretto`, durataSec: MICRO_DURATA_SEC });
  }
  return passi;
}

function costruisciSessione(state) {
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
          fase: "reset", gruppo: gruppo.sigla, sigla: ex.sigla, nome: ex.nome, video: ex.video,
          lato: latoLavoro,
          istruzioni: ex.istruzioni, gruppoMuscolare: ex.gruppoMuscolare,
          badge: `Gruppo ${gruppo.sigla} · serie ${s} di ${serieReset}`,
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

function calcolaGateVideo(state, passi) {
  if (state.programma.blocco !== 0) return [];
  const viste = new Set(state.programma.videoVistiObbligatori);
  const aggiungiInQuestaCoda = new Set();
  const gate = [];
  for (const p of passi) {
    if (p.fase === "reset" && p.video && !viste.has(p.sigla) && !aggiungiInQuestaCoda.has(p.sigla)) {
      gate.push(p);
      aggiungiInQuestaCoda.add(p.sigla);
    }
  }
  return gate;
}

// ===================== rendering =====================

function renderSessione(container) {
  const state = getState();
  const { errore, passi } = costruisciSessione(state);

  if (errore === "assessment-incompleto") {
    container.innerHTML = `<p class="view-placeholder">Completa prima l'assessment (Impostazioni → Rifai assessment): la sessione di stasera dipende dal risultato del Test 2.</p>`;
    document.getElementById("sessione-progress").textContent = "";
    nascondiPulsantePausa();
    return;
  }

  const gateCollo = !state.programma.avvisoColloMostrato && passi.some((p) => p.modulo === "M5");
  const gateVideo = calcolaGateVideo(state, passi);
  const coda = [];
  if (gateCollo) coda.push({ tipo: "collo" });
  for (const p of gateVideo) coda.push({ tipo: "video", passo: p });

  mostraPulsantePausa();
  if (coda.length > 0) {
    mostraGate(container, coda, 0, passi);
  } else {
    avviaMotore(container, passi);
  }
}

function mostraGate(container, coda, indice, passi) {
  if (indice >= coda.length) {
    avviaMotore(container, passi);
    return;
  }
  document.getElementById("sessione-progress").textContent = "";
  const gate = coda[indice];

  if (gate.tipo === "collo") {
    container.innerHTML = `
      <div class="sess-gate">
        <h2>Prima del modulo collo</h2>
        <p>${MODULO_M5.avviso}</p>
        <p class="assess-note">Intensità ${MODULO_M5.intensitaMax}. Questo avviso compare una sola volta.</p>
        <button class="btn btn-primary" id="btn-gate-continua">Ho capito, continua</button>
      </div>
    `;
    container.querySelector("#btn-gate-continua").addEventListener("click", () => {
      updateState((s) => { s.programma.avvisoColloMostrato = true; });
      mostraGate(container, coda, indice + 1, passi);
    });
    return;
  }

  const p = gate.passo;
  container.innerHTML = `
    <div class="sess-gate">
      <div class="sess-badge">${p.sigla}</div>
      <h2>${p.nome}</h2>
      <a class="lat-video" href="https://www.youtube.com/watch?v=${p.video}" target="_blank" rel="noopener">
        <img loading="lazy" src="https://i.ytimg.com/vi/${p.video}/hqdefault.jpg" alt="">
        <span>Guarda il video ↗</span>
      </a>
      <p class="assess-note">In Blocco 0 il video va visto almeno una volta prima di iniziare l'esercizio.</p>
      <button class="btn btn-primary" id="btn-gate-continua">Ho visto, continua</button>
    </div>
  `;
  container.querySelector("#btn-gate-continua").addEventListener("click", () => {
    updateState((s) => { s.programma.videoVistiObbligatori.push(p.sigla); });
    mostraGate(container, coda, indice + 1, passi);
  });
}

function avviaMotore(container, passi) {
  container.innerHTML = `
    <div class="sess-tempo-totale" id="sess-tempo-totale"></div>
    <div class="sess-badge" id="sess-badge"></div>
    <h2 class="sess-titolo" id="sess-titolo"></h2>
    <p class="sess-istruzioni" id="sess-istruzioni"></p>
    <a class="lat-video" id="sess-video" href="#" target="_blank" rel="noopener" hidden><span>Guarda il video ↗</span></a>
    <div class="sess-countdown" id="sess-countdown">--</div>
  `;

  engineAttivo = new FollowAlongEngine({
    onTick: (secondiResidui) => aggiornaCountdown(container, secondiResidui),
    onStepChange: (step, indice, totale) => aggiornaStep(container, step, indice, totale),
    onFine: () => completaSessione(container, passi),
  });

  engineAttivo.carica(passi);
  engineAttivo.avvia();
  aggiornaPulsantePausa(false);
}

function aggiornaStep(container, step, indice, totale) {
  document.getElementById("sessione-progress").textContent = `Esercizio ${indice + 1} di ${totale}`;
  container.querySelector("#sess-badge").textContent =
    step.badge + (step.lato ? ` · ${step.lato === "dx" ? "DESTRO" : "SINISTRO"}` : "");
  container.querySelector("#sess-titolo").textContent = step.nome;
  container.querySelector("#sess-istruzioni").textContent = step.istruzioni;

  const video = container.querySelector("#sess-video");
  if (step.video) {
    video.href = `https://www.youtube.com/watch?v=${step.video}`;
    video.hidden = false;
  } else {
    video.hidden = true;
  }
  aggiornaTempoTotale(container);
}

function aggiornaCountdown(container, secondiResidui) {
  const el = container.querySelector("#sess-countdown");
  if (el) el.textContent = Math.max(secondiResidui, 0);
  aggiornaTempoTotale(container);
}

function aggiornaTempoTotale(container) {
  const el = container.querySelector("#sess-tempo-totale");
  if (!el || !engineAttivo) return;
  const restanti = engineAttivo.steps
    .slice(engineAttivo.indiceCorrente + 1)
    .reduce((tot, s) => tot + s.durataSec, 0);
  const totale = restanti + Math.max(engineAttivo.secondiResidui, 0);
  const min = Math.floor(totale / 60);
  const sec = String(totale % 60).padStart(2, "0");
  el.textContent = `Tempo residuo: ${min}:${sec}`;
}

// ===================== fine sessione e avanzamento =====================

function completaSessione(container, passi) {
  const durataTotale = passi.reduce((tot, p) => tot + p.durataSec, 0);
  const oggi = oggiISO();

  updateState((s) => {
    s.storicoSessioni.push({
      data: oggi,
      tipo: "reset+micro",
      durataSec: durataTotale,
      esercizi: [...new Set(passi.map((p) => p.sigla || p.nome))],
    });

    if (s.streak.ultimaDataCompletata === oggi) {
      // sessione già registrata oggi, streak invariata
    } else if (s.streak.ultimaDataCompletata === addGiorni(oggi, -1)) {
      s.streak.giorniConsecutivi += 1;
    } else {
      s.streak.giorniConsecutivi = 1;
    }
    s.streak.ultimaDataCompletata = oggi;

    if (!s.programma.settimanaIniziataIl) {
      s.programma.settimanaIniziataIl = oggi;
    }
  });

  valutaAvanzamentoSettimana();
  engineAttivo = null;
  nascondiPulsantePausa();

  const streakAggiornata = getState().streak.giorniConsecutivi;
  container.innerHTML = `
    <div class="sess-fine">
      <h2>Sessione completata</h2>
      <p>${streakAggiornata} giorni consecutivi.</p>
      <button class="btn btn-primary" id="btn-fine-sessione">Chiudi</button>
    </div>
  `;
  document.getElementById("sessione-progress").textContent = "";
  container.querySelector("#btn-fine-sessione").addEventListener("click", () => {
    document.getElementById("view-sessione").hidden = true;
  });
}

function contaGiorniCompletatiInFinestra(storico, inizioISO, giorni) {
  const dateFinestra = new Set();
  for (let i = 0; i < giorni; i++) dateFinestra.add(addGiorni(inizioISO, i));
  const dateCompletate = new Set(
    storico.filter((s) => s.tipo === "reset+micro").map((s) => s.data)
  );
  let count = 0;
  for (const d of dateFinestra) if (dateCompletate.has(d)) count++;
  return count;
}

// Blocco 0 ripete la settimana se in 7 giorni si è saltato più di un
// giorno; oltre il Blocco 0 la settimana avanza senza questa regola
// (non richiesta per i blocchi successivi).
function valutaAvanzamentoSettimana() {
  const state = getState();
  const inizio = state.programma.settimanaIniziataIl;

  if (!inizio) {
    updateState((s) => { s.programma.settimanaIniziataIl = oggiISO(); });
    return;
  }

  const passati = giorniTra(inizio, oggiISO());
  if (passati < 7) return;

  const giorniCompletati = contaGiorniCompletatiInFinestra(state.storicoSessioni, inizio, 7);
  const giorniSaltati = 7 - giorniCompletati;

  updateState((s) => {
    if (s.programma.blocco === 0) {
      if (giorniSaltati > 1) {
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

// ===================== controlli esterni (pausa, chiusura) =====================

function togglePausa() {
  if (!engineAttivo) return;
  if (engineAttivo.inPausa) {
    engineAttivo.avvia();
    aggiornaPulsantePausa(false);
  } else {
    engineAttivo.pausa();
    aggiornaPulsantePausa(true);
  }
}

function fermaSessione() {
  if (engineAttivo) {
    engineAttivo.ferma();
    engineAttivo = null;
  }
  nascondiPulsantePausa();
}

function aggiornaPulsantePausa(inPausa) {
  const btn = document.getElementById("btn-pausa-sessione");
  if (!btn) return;
  btn.hidden = false;
  btn.textContent = inPausa ? "▶" : "⏸";
  btn.setAttribute("aria-label", inPausa ? "Riprendi" : "Pausa");
}

function mostraPulsantePausa() {
  const btn = document.getElementById("btn-pausa-sessione");
  if (btn) btn.hidden = false;
}

function nascondiPulsantePausa() {
  const btn = document.getElementById("btn-pausa-sessione");
  if (btn) btn.hidden = true;
}

export { renderSessione, togglePausa, fermaSessione, valutaAvanzamentoSettimana };
