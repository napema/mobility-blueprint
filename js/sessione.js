// sessione.js — costruisce e guida la sessione serale (RESET + MICRO):
// risolve i lati dal verdetto dell'assessment, applica le regole del
// Blocco 0 (volume ridotto, video la prima volta, avviso collo una
// tantum), guida il FollowAlongEngine e registra il risultato (storico,
// streak, avanzamento/ripetizione della settimana).
//
// Ogni esercizio è preceduto da una fase di PREPARAZIONE: dice cosa
// serve, mostra il video dentro l'app (mai una scheda esterna) e dà il
// tempo di mettersi in posizione. La tenuta vera parte con doppio beep e
// schermata diversa, così è sempre chiaro quando si comincia davvero.

import { getState, updateState } from "./storage.js";
import { FollowAlongEngine } from "./engine.js";
import {
  NOTA_ATTREZZI,
  RESET_GRUPPO_A,
  RESET_GRUPPO_B,
  RESET_DURATA_SERIE_SEC,
  MICRO_DURATA_SEC,
  MODULO_M5,
  MODULI_MICRO,
  MODULI_MICRO_BLOCCO_0,
} from "./esercizi.js";

const PREP_PRIMA_VOLTA_SEC = 15; // c'è il video da guardare
const PREP_RIPETIZIONE_SEC = 6;  // solo per riposizionarsi

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

function nomeLato(lato) {
  return lato === "dx" ? "DESTRO" : "SINISTRO";
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
    serve: ex.serve, video: null,
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
          fase: "reset", gruppo: gruppo.sigla, sigla: ex.sigla, nome: ex.nome, video: ex.video,
          lato: latoLavoro, serve: ex.serve,
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

// Intercala una fase di preparazione prima di ogni tenuta. La prima volta
// che un esercizio compare nella sessione la preparazione è più lunga e
// mostra il video; le volte successive serve solo a riposizionarsi.
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
      tipo: "prep",
      rif: { ...p, numero },
      mostraVideo: primaInSessione && !!p.video,
      videoMaiVisto,
      beep: "inizio",
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
    container.innerHTML = `<p class="view-placeholder">Completa prima l'assessment (Impostazioni → Rifai assessment): la sessione di stasera dipende dal risultato del Test 2.</p>`;
    document.getElementById("sessione-progress").textContent = "";
    nascondiControlli();
    return;
  }

  const serveAvvisoCollo = !state.programma.avvisoColloMostrato && passi.some((p) => p.modulo === "M5");
  if (serveAvvisoCollo) {
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
        <h2>Prima del modulo collo</h2>
        <p>${MODULO_M5.avviso}</p>
        <p class="sess-nota">Intensità ${MODULO_M5.intensitaMax}. Questo avviso compare una sola volta.</p>
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

  container.innerHTML = `
    <div class="sess-centro">
      <div class="sess-schermo" id="sess-schermo">
        <div class="sess-tempo-totale" id="sess-tempo-totale"></div>
        <div class="sess-badge" id="sess-badge"></div>
        <h2 class="sess-titolo" id="sess-titolo"></h2>
        <div class="sess-lato" id="sess-lato" hidden></div>
        <div class="sess-countdown" id="sess-countdown">--</div>
        <div class="sess-stato" id="sess-stato"></div>
        <div class="sess-serve" id="sess-serve" hidden></div>
        <p class="sess-istruzioni" id="sess-istruzioni"></p>
        <div class="sess-video" id="sess-video" hidden></div>
        <button class="btn btn-secondary sess-avanti" id="btn-avanti">Sono pronto ›</button>
      </div>
    </div>
  `;

  container.querySelector("#btn-avanti").addEventListener("click", () => {
    if (engineAttivo) engineAttivo.avanti();
  });

  engineAttivo = new FollowAlongEngine({
    onTick: (secondiResidui) => aggiornaCountdown(container, secondiResidui),
    onStepChange: (step) => aggiornaStep(container, step, totaleEsercizi),
    onFine: () => completaSessione(container, passiLavoro),
  });

  engineAttivo.carica(passi);
  engineAttivo.avvia();
  mostraControlli();
  aggiornaPulsantePausa(false);
}

function aggiornaStep(container, step, totaleEsercizi) {
  const schermo = container.querySelector("#sess-schermo");
  const dati = step.tipo === "prep" ? step.rif : step;
  const inPreparazione = step.tipo === "prep";

  schermo.classList.toggle("is-prep", inPreparazione);
  schermo.classList.toggle("is-lavoro", !inPreparazione);

  document.getElementById("sessione-progress").textContent =
    `Esercizio ${dati.numero} di ${totaleEsercizi}`;

  container.querySelector("#sess-badge").textContent = dati.badge;
  container.querySelector("#sess-titolo").textContent = dati.nome;

  const lato = container.querySelector("#sess-lato");
  lato.hidden = !dati.lato;
  if (dati.lato) lato.textContent = `Lato ${nomeLato(dati.lato)}`;

  container.querySelector("#sess-stato").textContent = inPreparazione ? "Preparati" : "Tieni";
  container.querySelector("#sess-istruzioni").textContent = dati.istruzioni;

  const serve = container.querySelector("#sess-serve");
  serve.hidden = !(inPreparazione && dati.serve);
  if (!serve.hidden) serve.textContent = `Ti serve: ${dati.serve}`;

  const avanti = container.querySelector("#btn-avanti");
  avanti.textContent = inPreparazione ? "Sono pronto ›" : "Avanti ›";

  const video = container.querySelector("#sess-video");
  if (inPreparazione && step.mostraVideo) {
    video.hidden = false;
    video.innerHTML = `
      <iframe src="https://www.youtube-nocookie.com/embed/${dati.video}?rel=0&playsinline=1"
              title="${dati.nome}" allowfullscreen loading="lazy"></iframe>
      <p class="sess-nota">${NOTA_ATTREZZI}</p>
    `;
    if (step.videoMaiVisto) {
      const chiave = dati.sigla || dati.nome;
      updateState((s) => {
        s.programma.videoVistiObbligatori = s.programma.videoVistiObbligatori || [];
        if (!s.programma.videoVistiObbligatori.includes(chiave)) {
          s.programma.videoVistiObbligatori.push(chiave);
        }
      });
    }
  } else {
    video.hidden = true;
    video.innerHTML = ""; // scarica l'iframe: non deve continuare a suonare sotto
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
  el.textContent = `Mancano ${min}:${sec}`;
}

// ===================== fine sessione e avanzamento =====================

function completaSessione(container, passiLavoro) {
  const durataTotale = passiLavoro.reduce((tot, p) => tot + p.durataSec, 0);
  const oggi = oggiISO();

  updateState((s) => {
    s.storicoSessioni.push({
      data: oggi,
      tipo: "reset+micro",
      durataSec: durataTotale,
      esercizi: [...new Set(passiLavoro.map((p) => p.sigla || p.nome))],
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
  nascondiControlli();

  const streakAggiornata = getState().streak.giorniConsecutivi;
  container.innerHTML = `
    <div class="sess-centro">
      <div class="sess-fine">
        <h2>Sessione completata</h2>
        <p>${streakAggiornata} ${streakAggiornata === 1 ? "giorno" : "giorni"} di fila.</p>
        <button class="btn btn-primary" id="btn-fine-sessione">Chiudi</button>
      </div>
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
  const body = document.getElementById("sessione-body");
  if (body) body.innerHTML = ""; // ferma anche l'eventuale video incorporato
  nascondiControlli();
}

function aggiornaPulsantePausa(inPausa) {
  const btn = document.getElementById("btn-pausa-sessione");
  if (!btn) return;
  btn.hidden = false;
  btn.textContent = inPausa ? "▶" : "⏸";
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

export { renderSessione, togglePausa, fermaSessione, valutaAvanzamentoSettimana };
