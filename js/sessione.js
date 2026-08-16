// sessione.js — costruisce e guida le sessioni (PROGRAMMA-v3).
//
// NON è l'utente a scegliere il programma. L'app decide:
//   · è il giorno di palestra e non l'hai ancora fatta  → LOADED
//   · hai corso oggi                                    → POST-CORSA
//   · altrimenti                                        → QUOTIDIANO
// L'unica domanda è "hai corso oggi?".
//
// Il tempo del quotidiano sale solo se il blocco precedente è stato
// completato almeno al 70% dei giorni: è il controllo che impedisce di
// ritrovarsi 20 minuti sullo schermo e la stessa sensazione di fallimento.

import { getState, updateState, salvaStatoSW } from "./storage.js";
import { FollowAlongEngine } from "./engine.js";
import { icona } from "./icone.js";
import {
  GRUPPI, G1, BACINO, LOADED, POST_CORSA, BLOCCO_ATTIVO, SOGLIA_COMPLETAMENTO,
  fasePerSettimana, rotazionePerSettimana, trovaEsercizio, caricoSuggerito,
} from "./esercizi.js";

const PREP_PRIMA_VOLTA_SEC = 12;
const PREP_RIPETIZIONE_SEC = 5;

let engineAttivo = null;
let videoMontato = null;
let tipoInCorso = null;

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

function giornoSettimana(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7; // lunedì = 0
}

const altroLato = (l) => (l === "sx" ? "dx" : "sx");
const nomeLato = (l) => (l === "dx" ? "DESTRO" : "SINISTRO");

// ===================== stato del programma =====================

function settimanaCorrente(state) {
  const p = state.programma;
  if (!p.inizioProgramma) return 1;
  return Math.max(1, Math.floor(giorniTra(p.inizioProgramma, oggiISO()) / 7) + 1);
}

// Il tempo sale solo se il blocco precedente è stato fatto al 70%.
// Se no, la settimana di programma resta ferma: si ripete.
function settimanaEffettiva(state) {
  const calendario = settimanaCorrente(state);
  const fatte = new Set(state.storicoSessioni.map((s) => s.data));
  let effettiva = 1;
  for (let s = 1; s < calendario; s++) {
    const inizio = addGiorni(state.programma.inizioProgramma, (s - 1) * 7);
    let completati = 0;
    for (let i = 0; i < 7; i++) if (fatte.has(addGiorni(inizio, i))) completati++;
    if (completati / 7 >= SOGLIA_COMPLETAMENTO) effettiva++;
  }
  return effettiva;
}

function latoStretto(state) {
  const m = state.assessment.baselineTest3.bersagli.farfalla.misure;
  if (m.altezzaGinocchioSxCm == null || m.altezzaGinocchioDxCm == null) return "dx";
  if (m.altezzaGinocchioSxCm === m.altezzaGinocchioDxCm) return null;
  return m.altezzaGinocchioSxCm > m.altezzaGinocchioDxCm ? "sx" : "dx";
}

// È l'app a decidere, non l'utente.
function tipoDelGiorno(state, haCorso) {
  const oggi = oggiISO();
  const giaFattoLoaded = state.storicoSessioni.some(
    (s) => s.tipo === "loaded" && giorniTra(s.data, oggi) < 7
  );
  if (giornoSettimana(oggi) === (state.programma.giornoPalestra ?? 2) && !giaFattoLoaded) return "loaded";
  return haCorso ? "post-corsa" : "quotidiano";
}

// ===================== espansione =====================

function espandi(ex, gruppo, stretto, settimana) {
  const base = {
    idEsercizio: ex.id, sigla: ex.sigla || null, nome: ex.nome, tag: ex.tag,
    gruppo: gruppo.id, gruppoNome: gruppo.nome,
    muscoli: ex.muscoli || [], serve: ex.serve, video: ex.video || null,
    fonte: ex.fonte || null,
    passi: ex.passi || [], nota: ex.nota || null, ripetizioni: ex.ripetizioni || null,
    gruppoMuscolare: (ex.muscoli && ex.muscoli[0]) || gruppo.nome,
    carico: caricoSuggerito(ex, settimana),
  };
  // In palestra un esercizio è più serie: il tempo deve tenerne conto,
  // altrimenti la sessione sembra durare un terzo di quanto dura.
  const durata = (ex.durataSec || 30) * (ex.serie || 1);

  // Esercizi a ripetizioni cronometrate (spinta / rilascio / spinta…):
  // servono passi separati, altrimenti è un blocco unico e non sai
  // quando spingere e quando mollare.
  if (ex.ripetuto) {
    const out = [];
    for (let i = 1; i <= ex.ripetuto.volte; i++) {
      out.push({
        ...base, lato: ex.lato || null, durataSec: ex.ripetuto.lavoroSec,
        badgeExtra: `spinta ${i} di ${ex.ripetuto.volte}`, faseRipetuta: "lavoro",
      });
      if (i < ex.ripetuto.volte) {
        out.push({
          ...base, lato: ex.lato || null, durataSec: ex.ripetuto.pausaSec,
          badgeExtra: "rilascia", faseRipetuta: "pausa",
          passi: ["Molla completamente.", "Senti il collo scendere di qualche grado.", "Non ricominciare prima del segnale."],
        });
      }
    }
    return out;
  }

  if (ex.lato) {
    const out = [];
    for (let v = 0; v < (ex.volte || 1); v++) out.push({ ...base, lato: ex.lato, durataSec: durata });
    return out;
  }
  if (!ex.perLato) return [{ ...base, lato: null, durataSec: durata }];

  const out = [
    { ...base, lato: "sx", durataSec: durata },
    { ...base, lato: "dx", durataSec: durata },
  ];
  if (ex.doppioADestra) out.push({ ...base, lato: "dx", durataSec: durata, extra: true });
  if (ex.extraLatoStretto && stretto) out.push({ ...base, lato: stretto, durataSec: durata, extra: true });
  return out;
}

function espandiPerId(id, stretto, settimana) {
  const t = trovaEsercizio(id);
  return t ? espandi(t.esercizio, t.gruppo, stretto, settimana) : [];
}

// ===================== le tre sessioni =====================

function costruisciPostCorsa(state) {
  const stretto = latoStretto(state);
  const s = settimanaEffettiva(state);
  const passi = [];
  for (const blocco of POST_CORSA.blocchi) {
    for (const id of blocco.esercizi) passi.push(...espandiPerId(id, stretto, s));
  }
  return passi;
}

function costruisciQuotidiano(state) {
  const settimana = settimanaEffettiva(state);
  const fase = fasePerSettimana(settimana);
  const rot = rotazionePerSettimana(settimana);
  const stretto = latoStretto(state);
  const passi = [];

  // 1. BLOCCO ATTIVO — 3 al giorno, a rotazione sul giorno dell'anno.
  // Apre la sessione: è il lavoro che alza il pavimento, e va fatto da
  // freschi. (Prima apriva il collo, e siccome il collo è l'unica parte
  // non coperta dai video del canale, sembrava che il canale non ci fosse.)
  const giorno = giorniTra(state.programma.inizioProgramma || oggiISO(), oggiISO());
  for (let i = 0; i < 3; i++) {
    const id = BLOCCO_ATTIVO[(giorno * 3 + i) % BLOCCO_ATTIVO.length];
    passi.push(...espandiPerId(id, stretto, settimana));
  }

  // 2. STRETCHING dei gruppi attivi del blocco corrente
  for (const idG of rot.gruppi.slice(0, fase.gruppiStretch)) {
    const gruppo = GRUPPI[idG];
    if (!gruppo) continue;
    for (const ex of gruppo.esercizi.filter((e) => e.tag === "S")) {
      passi.push(...espandi(ex, gruppo, stretto, settimana));
    }
  }

  // 3. BACINO — dalla settimana 3
  if (fase.bacino) {
    const lat = state.assessment.esitoTest2.latoLateralizzato || "dx";
    const away = altroLato(lat);
    const lista = fase.bacino === "ridotto" ? BACINO.esercizi.filter((e) => e.ridotto) : BACINO.esercizi;
    for (const ex of lista) {
      passi.push({
        idEsercizio: ex.id, sigla: ex.sigla, nome: ex.nome, tag: ex.tag,
        gruppo: "BACINO", gruppoNome: BACINO.nome, gruppoMuscolare: ex.muscoli[0],
        muscoli: ex.muscoli, serve: ex.serve, video: ex.video, passi: ex.passi,
        nota: BACINO.nota, lato: ex.ruoloLato === "lat" ? lat : away,
        durataSec: ex.durataSec || 40, ripetizioni: null, carico: null,
      });
    }
  }

  // 4. COLLO — in coda, non in testa. Resta ogni giorno e non esce mai
  // dalla rotazione, ma va dopo: al 30-40% non ha bisogno di essere
  // fatto da freschi, e i paper mettono lo statico DOPO il riscaldamento.
  // Nelle settimane corte se ne fanno 4 su 6, per stare nei 3 minuti che
  // il programma gli assegna.
  const quantiCollo = fase.minuti <= 14 ? 4 : G1.esercizi.length;
  for (const ex of G1.esercizi.slice(0, quantiCollo)) {
    passi.push(...espandi(ex, G1, stretto, settimana));
  }

  return passi;
}

function costruisciLoaded(state) {
  const stretto = latoStretto(state);
  const s = settimanaEffettiva(state);
  const passi = [];
  for (const ex of LOADED.esercizi) passi.push(...espandi(ex, LOADED, stretto, s));
  return passi;
}

// Dose minima: collo + un allungamento. Mai zero.
function costruisciMinima(state) {
  const stretto = latoStretto(state);
  const s = settimanaEffettiva(state);
  const passi = [];
  passi.push(...espandi(G1.esercizi[0], G1, stretto, s));
  passi.push(...espandi(G1.esercizi[3], G1, stretto, s));
  passi.push(...espandiPerId("g5-farfalla", stretto, s));
  return passi;
}

const COSTRUTTORI = {
  "post-corsa": costruisciPostCorsa,
  quotidiano: costruisciQuotidiano,
  loaded: costruisciLoaded,
  minima: costruisciMinima,
};

function costruisciSessione(state, tipo) {
  const fn = COSTRUTTORI[tipo] || costruisciQuotidiano;
  return { errore: null, passi: fn(state) };
}

function riepilogoModuli(passi) {
  const mappa = new Map();
  for (const p of passi) {
    if (!mappa.has(p.gruppo)) mappa.set(p.gruppo, { nome: p.gruppoNome, muscoli: new Set(), durataSec: 0 });
    const v = mappa.get(p.gruppo);
    v.durataSec += p.durataSec;
    for (const m of p.muscoli || []) v.muscoli.add(m);
  }
  return [...mappa.values()].map((v) => ({ ...v, muscoli: [...v.muscoli] }));
}

// Marca i cambi di lato: senza, due serie identiche di fila sembrano una
// ripetizione inutile invece che "ora l'altra gamba".
function conPreparazione(passiLavoro, visti) {
  const out = [];
  let n = 0;
  passiLavoro.forEach((p, i) => {
    const prec = passiLavoro[i - 1];
    const cambioLato = !!(prec && prec.idEsercizio === p.idEsercizio && prec.lato !== p.lato && p.lato);
    const primaVolta = !visti.includes(p.idEsercizio) && !passiLavoro.slice(0, i).some((q) => q.idEsercizio === p.idEsercizio);
    n += 1;
    out.push({
      tipo: "prep", rif: { ...p, numero: n }, chiave: p.idEsercizio,
      cambioLato, mai: !visti.includes(p.idEsercizio), beep: "inizio",
      durataSec: primaVolta ? PREP_PRIMA_VOLTA_SEC : PREP_RIPETIZIONE_SEC,
    });
    out.push({ ...p, tipo: "lavoro", numero: n, beep: "fine", cambioLato });
  });
  return out;
}

// ===================== rendering =====================

function renderSessione(container, tipo = "quotidiano") {
  const state = getState();
  const { passi } = costruisciSessione(state, tipo);

  if (passi.length === 0) {
    container.innerHTML = `<div class="sess-layout"><div class="sess-scorre"><p class="view-placeholder">Nessun esercizio per questa sessione.</p></div></div>`;
    return;
  }

  // Sessione lasciata a metà oggi, dello stesso tipo: si offre di
  // riprendere invece di ricominciare da capo.
  const p = state.sessioneInCorso;
  if (p && p.tipo === tipo && p.data === oggiISO() && p.indice > 0) {
    mostraRipresa(container, passi, tipo, p);
    return;
  }

  if (!state.programma.avvisoColloMostrato && passi.some((x) => x.gruppo === "G1")) {
    mostraAvvisoCollo(container, passi, tipo);
  } else {
    avviaMotore(container, passi, tipo);
  }
}

function mostraRipresa(container, passi, tipo, progresso) {
  const totale = passi.length;
  const fatti = Math.min(progresso.numero || 1, totale);
  const prossimo = passi[Math.min(fatti - 1, totale - 1)];

  container.innerHTML = `
    <div class="sess-layout">
      <div class="sess-scorre">
        <div class="sess-gate">
          <div style="color:var(--blu)">${icona("orologio", 40)}</div>
          <h2 class="titolo-2">Avevi lasciato a metà</h2>
          <p class="corpo">Eri all'esercizio <strong>${fatti} di ${totale}</strong>: ${prossimo ? prossimo.nome : ""}.</p>
          <p class="didascalia">Il resto della sessione è ancora quello di prima.</p>
        </div>
      </div>
      <div class="sess-piede">
        <button class="btn btn-primary" id="btn-riprendi">Riprendi da qui</button>
        <button class="btn btn-secondary" id="btn-ricomincia" style="margin-top:8px">Ricomincia da capo</button>
      </div>
    </div>`;

  container.querySelector("#btn-riprendi").addEventListener("click", () => {
    avviaMotore(container, passi, tipo, progresso);
  });
  container.querySelector("#btn-ricomincia").addEventListener("click", () => {
    updateState((s) => { s.sessioneInCorso = null; });
    avviaMotore(container, passi, tipo);
  });
}

function mostraAvvisoCollo(container, passi, tipo) {
  container.innerHTML = `
    <div class="sess-layout">
      <div class="sess-scorre">
        <div class="sess-gate">
          <h2 class="titolo-2">Prima del modulo collo</h2>
          <div class="sess-avviso">${icona("avviso", 20)}<span>${G1.avviso}</span></div>
          <p class="didascalia">Intensità ${G1.intensita}. Compare una sola volta.</p>
        </div>
      </div>
      <div class="sess-piede"><button class="btn btn-primary" id="btn-gate-continua">Ho capito, continua</button></div>
    </div>`;
  container.querySelector("#btn-gate-continua").addEventListener("click", () => {
    updateState((s) => { s.programma.avvisoColloMostrato = true; });
    avviaMotore(container, passi, tipo);
  });
}

function avviaMotore(container, passiLavoro, tipo, riprendiDa = null) {
  const state = getState();
  const visti = state.programma.videoVistiObbligatori || [];
  const totale = passiLavoro.length;
  const passi = conPreparazione(passiLavoro, visti);
  videoMontato = null;
  tipoInCorso = tipo;

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
        <div id="sess-cambio" class="sess-cambio" hidden></div>
        <div class="sess-chip-riga" id="sess-chip" style="margin-bottom:16px"></div>
        <ol class="sess-passi" id="sess-passi"></ol>
        <p class="didascalia" id="sess-nota" style="margin-top:16px" hidden></p>
      </div>
      <div class="sess-piede"><button class="btn btn-primary" id="btn-avanti"></button></div>
    </div>`;

  container.querySelector("#btn-avanti").addEventListener("click", () => {
    if (engineAttivo) engineAttivo.avanti();
  });

  engineAttivo = new FollowAlongEngine({
    onTick: (r) => aggiornaCountdown(container, r),
    onStepChange: (step) => aggiornaStep(container, step, totale),
    onFine: () => completaSessione(container, passiLavoro, tipo),
  });
  engineAttivo.carica(passi);
  if (riprendiDa && riprendiDa.indice > 0 && riprendiDa.indice < passi.length) {
    engineAttivo.indiceCorrente = riprendiDa.indice;
    engineAttivo.secondiResidui = passi[riprendiDa.indice].durataSec;
    aggiornaStep(container, passi[riprendiDa.indice], totale);
  }
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
  const statoTesto = inPrep
    ? "Preparati"
    : d.faseRipetuta === "pausa" ? "Rilascia"
    : d.faseRipetuta === "lavoro" ? "Spingi"
    : "Tieni la posizione";
  container.querySelector("#sess-stato").textContent = statoTesto;
  // Il lato entra nel titolo: leggerlo solo in una pillola non bastava.
  container.querySelector("#sess-titolo").textContent = d.lato ? `${d.nome} — ${nomeLato(d.lato)}` : d.nome;
  container.querySelector("#btn-avanti").textContent = inPrep ? "Sono pronto" : "Avanti";

  const cambio = container.querySelector("#sess-cambio");
  cambio.hidden = !step.cambioLato;
  if (step.cambioLato) cambio.innerHTML = `${icona("freccia", 18)}<span>Cambia lato: ora il ${nomeLato(d.lato).toLowerCase()}</span>`;

  const chip = [];
  if (d.fonte) chip.push(`<span class="pillola is-verde">${d.fonte}</span>`);
  const etichettaTag = { M: "Attivo", S: "Passivo", R: "Rilascio" }[d.tag] || "";
  const classeTag = { M: "is-verde", S: "is-blu", R: "is-arancio" }[d.tag] || "";
  if (etichettaTag) chip.push(`<span class="pillola ${classeTag}">${etichettaTag}</span>`);
  if (d.badgeExtra) chip.push(`<span class="pillola is-arancio">${d.badgeExtra}</span>`);
  if (d.lato) chip.push(`<span class="pillola is-blu">Lato ${nomeLato(d.lato).toLowerCase()}${d.extra ? " · extra" : ""}</span>`);
  if (d.carico) chip.push(`<span class="pillola is-arancio">${d.carico} kg</span>`);
  if (d.ripetizioni) chip.push(`<span class="pillola is-arancio">${d.ripetizioni}</span>`);
  if (d.serve) chip.push(`<span class="pillola">${d.serve}</span>`);
  for (const m of d.muscoli || []) chip.push(`<span class="pillola">${m}</span>`);
  container.querySelector("#sess-chip").innerHTML = chip.join("");

  container.querySelector("#sess-passi").innerHTML = (d.passi || []).map((t) => `<li>${t}</li>`).join("");

  const nota = container.querySelector("#sess-nota");
  nota.hidden = !d.nota;
  if (d.nota) nota.textContent = d.nota;

  const media = container.querySelector("#sess-media");
  if (videoMontato !== d.video && d.video) {
    media.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${d.video}?autoplay=1&mute=1&loop=1&playlist=${d.video}&rel=0&playsinline=1&controls=1"
      title="${d.nome}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    videoMontato = d.video;
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

// ===================== fine =====================

function completaSessione(container, passiLavoro, tipo) {
  const durata = passiLavoro.reduce((t, p) => t + p.durataSec, 0);
  const oggi = oggiISO();
  const volume = {};
  for (const p of passiLavoro) {
    if (!p.gruppoMuscolare) continue;
    volume[p.gruppoMuscolare] = (volume[p.gruppoMuscolare] || 0) + p.durataSec;
  }

  updateState((s) => {
    // id stabile e `up`: servono al merge per record del sync.
    s.storicoSessioni.push({
      id: `${oggi}|${tipo}`, up: Date.now(),
      data: oggi, tipo, durataSec: durata,
      esercizi: [...new Set(passiLavoro.map((p) => p.idEsercizio))],
      volumePerGruppo: volume,
    });
    s.metaUp = Date.now();
    if (!s.programma.inizioProgramma) s.programma.inizioProgramma = oggi;
    s.sessioneInCorso = null;   // finita: non c'è più niente da riprendere
    const ultima = s.streak.ultimaDataCompletata;
    if (ultima !== oggi) {
      s.streak.giorniConsecutivi = (!ultima || giorniTra(ultima, oggi) <= 3) ? s.streak.giorniConsecutivi + 1 : 1;
      s.streak.ultimaDataCompletata = oggi;
    }
  });

  salvaStatoSW({ ultimaSessione: oggi });
  document.dispatchEvent(new CustomEvent("dati-cambiati"));
  engineAttivo = null;
  videoMontato = null;
  nascondiControlli();

  const streak = getState().streak.giorniConsecutivi;
  container.innerHTML = `
    <div class="sess-layout">
      <div class="sess-scorre">
        <div class="sess-fine">
          <div style="color:var(--verde)">${icona("spunta", 44)}</div>
          <h2 class="titolo-2">Fatta</h2>
          <p class="corpo">${Math.round(durata / 60)} minuti · ${streak} ${streak === 1 ? "giorno" : "giorni"} di fila.</p>
          <p class="didascalia">Due buchi a settimana sono dentro il piano.</p>
        </div>
      </div>
      <div class="sess-piede"><button class="btn btn-primary" id="btn-fine-sessione">Chiudi</button></div>
    </div>`;
  document.getElementById("sessione-progress").textContent = "";
  container.querySelector("#btn-fine-sessione").addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("sessione-chiusa"));
  });
}

function streakAncoraValida(state) {
  const u = state.streak.ultimaDataCompletata;
  return !u || giorniTra(u, oggiISO()) <= 3;
}

// ===================== controlli =====================

function togglePausa() {
  if (!engineAttivo) return;
  if (engineAttivo.inPausa) { engineAttivo.avvia(); aggiornaPulsantePausa(false); }
  else { engineAttivo.pausa(); aggiornaPulsantePausa(true); }
}

// Uscire da una sessione non deve buttare via il lavoro fatto: il punto
// in cui eri viene salvato e la volta dopo l'app propone di riprendere.
function fermaSessione() {
  if (engineAttivo && engineAttivo.steps.length > 0) {
    const i = engineAttivo.indiceCorrente;
    const finita = i >= engineAttivo.steps.length - 1;
    if (!finita && i > 0) {
      const step = engineAttivo.steps[i];
      updateState((s) => {
        s.sessioneInCorso = {
          tipo: tipoInCorso,
          indice: i,
          numero: (step.tipo === "prep" ? step.rif.numero : step.numero) || 1,
          data: oggiISO(),
          salvataIl: Date.now(),
        };
      });
    }
    engineAttivo.ferma();
  }
  engineAttivo = null;
  videoMontato = null;
  tipoInCorso = null;
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
  renderSessione, togglePausa, fermaSessione, costruisciSessione, riepilogoModuli,
  settimanaCorrente, settimanaEffettiva, tipoDelGiorno, streakAncoraValida,
  oggiISO, addGiorni, giorniTra, giornoSettimana,
};
