// oggi.js — la home. Non chiede quale programma seguire: lo decide.
// L'unica domanda è "hai corso oggi?", perché è l'unica cosa che l'app
// non può sapere da sola.

import { getState, updateState } from "./storage.js";
import { icona } from "./icone.js";
import {
  oggiISO, addGiorni, giorniTra, costruisciSessione, riepilogoModuli,
  settimanaCorrente, settimanaEffettiva, tipoDelGiorno, streakAncoraValida, giornoSettimana,
} from "./sessione.js";
import { fasePerSettimana, rotazionePerSettimana, GRUPPI, PROGRESSIONE } from "./esercizi.js";

const LETTERE = ["L", "M", "M", "G", "V", "S", "D"];
const NOMI_TIPO = {
  "post-corsa": { nome: "Post-corsa", perche: "Hai corso: questa sostituisce il quotidiano, non si somma." },
  quotidiano: { nome: "Quotidiano", perche: "Sul tappeto, la sera. Non deve farti sudare." },
  loaded: { nome: "Loaded mobility", perche: "È il giorno di palestra. È allenamento vero: mai il giorno dopo le gambe." },
  minima: { nome: "Dose minima", perche: "Per i giorni storti. Meglio due minuti che zero." },
};

const dataLunga = () => new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
const minuti = (sec) => Math.max(1, Math.round(sec / 60));

function inizioSettimana(iso) {
  return addGiorni(iso, -giornoSettimana(iso));
}

function renderOggi(container) {
  const state = getState();
  const oggi = oggiISO();
  const haCorso = state.giornoCorrente?.data === oggi ? !!state.giornoCorrente.haCorso : false;
  const forzata = state.giornoCorrente?.data === oggi ? state.giornoCorrente.forza : null;

  const tipo = forzata || tipoDelGiorno(state, haCorso);
  const { passi } = costruisciSessione(state, tipo);
  const moduli = riepilogoModuli(passi);
  const durata = passi.reduce((t, p) => t + p.durataSec, 0);
  const fattoOggi = state.storicoSessioni.some((s) => s.data === oggi);
  const settimana = settimanaEffettiva(state);
  const fase = fasePerSettimana(settimana);

  container.innerHTML = `
    <div class="vista-intestazione">
      <h1 class="titolo-grande">Oggi</h1>
      <p class="sottotitolo">${dataLunga()} · settimana ${settimana}</p>
    </div>

    ${renderSettimana(state, oggi)}

    <div class="vetro scheda">
      <div class="scheda__testa">${icona("corpo", 20)}<span class="occhiello">Hai corso oggi?</span></div>
      <div class="sess-chip-riga">
        <button class="chip-scelta ${!haCorso ? "is-active" : ""}" data-corso="no">No</button>
        <button class="chip-scelta ${haCorso ? "is-active" : ""}" data-corso="si">Sì, ho corso</button>
      </div>
      <p class="didascalia" style="margin:12px 0 0">È l'unica cosa che devi dirmi: il resto lo decido io.</p>
    </div>

    <div class="vetro scheda riquadro-oggi">
      <div class="riquadro-oggi__meta">${icona("orologio", 18)}<span>${NOMI_TIPO[tipo].nome}</span></div>
      <div class="riquadro-oggi__durata">${minuti(durata)} min</div>
      <div class="sess-chip-riga" style="margin-top:12px">
        <span class="pillola is-blu">${passi.length} esercizi</span>
        ${fattoOggi ? '<span class="pillola is-verde">Già fatta oggi</span>' : ""}
      </div>
      <p class="didascalia" style="margin-top:12px">${NOMI_TIPO[tipo].perche}</p>

      <ul class="elenco-moduli">
        ${moduli.map((m) => `
          <li>
            <div style="min-width:0">
              <div class="modulo__nome">${m.nome}</div>
              <div class="modulo__muscoli">${m.muscoli.slice(0, 5).join(" · ")}</div>
            </div>
            <div class="modulo__durata">${minuti(m.durataSec)} min</div>
          </li>`).join("")}
      </ul>

      <button class="btn btn-primary" id="btn-inizia-sessione" data-tipo="${tipo}" style="margin-top:24px">
        ${icona("play", 18, true)} ${fattoOggi ? "Rifai" : "Inizia"}
      </button>
      ${tipo !== "minima" ? `
        <button class="btn btn-secondary" id="btn-dose-minima" style="margin-top:8px">Non ce la faccio — 2 minuti</button>` : ""}
    </div>

    ${renderPiano(settimana, fase)}
  `;

  container.querySelector(".sess-chip-riga").addEventListener("click", (e) => {
    const b = e.target.closest("[data-corso]");
    if (!b) return;
    updateState((s) => {
      s.giornoCorrente = { data: oggi, haCorso: b.dataset.corso === "si", forza: null };
    });
    renderOggi(container);
  });

  const minima = container.querySelector("#btn-dose-minima");
  if (minima) minima.addEventListener("click", () => {
    updateState((s) => { s.giornoCorrente = { data: oggi, haCorso, forza: "minima" }; });
    renderOggi(container);
  });
}

function renderSettimana(state, oggi) {
  const inizio = inizioSettimana(oggi);
  const fatte = new Map(state.storicoSessioni.map((s) => [s.data, s.tipo]));
  const giornoPalestra = state.programma.giornoPalestra ?? 2;

  const giorni = LETTERE.map((L, i) => {
    const iso = addGiorni(inizio, i);
    const cl = ["giorno"];
    if (fatte.has(iso)) cl.push("is-fatto");
    if (iso === oggi) cl.push("is-oggi");
    if (iso > oggi) cl.push("is-futuro");
    const palestra = i === giornoPalestra;
    return `<div class="${cl.join(" ")}">
      <span class="giorno__lettera">${L}${palestra ? " ·" : ""}</span>
      <span class="giorno__pallino">${fatte.has(iso) ? "✓" : Number(iso.split("-")[2])}</span>
    </div>`;
  }).join("");

  const n = LETTERE.filter((_, i) => fatte.has(addGiorni(inizio, i))).length;

  return `
    <div class="vetro scheda">
      <div class="scheda__testa">
        ${icona("calendario", 20)}
        <span class="occhiello">Questa settimana · ${n} di 7</span>
      </div>
      <div class="settimana">${giorni}</div>
      <p class="didascalia" style="margin:0">Il puntino segna il giorno di palestra. ${
        !streakAncoraValida(state) ? "Più di 3 giorni fermi: lo streak riparte, il programma no." : ""
      }</p>
    </div>`;
}

function renderPiano(settimana, faseCorrente) {
  const rot = rotazionePerSettimana(settimana);
  const nomi = rot.gruppi.map((g) => GRUPPI[g]?.nome).filter(Boolean).join(" · ");

  const righe = PROGRESSIONE.map((f) => {
    const ora = f === faseCorrente;
    const passata = settimana > f.settimane[1];
    const et = f.settimane[1] === 99 ? `Sett. ${f.settimane[0]}+` : `Sett. ${f.settimane[0]}–${f.settimane[1]}`;
    return `<li class="piano-riga ${ora ? "is-ora" : ""} ${passata ? "is-passata" : ""}">
      <span class="piano-quando">${et}</span>
      <span class="piano-cosa"><strong>${f.minuti} min</strong> · ${f.note}</span>
      ${ora ? '<span class="pillola is-blu">ora</span>' : ""}
    </li>`;
  }).join("");

  return `
    <div class="vetro scheda">
      <div class="scheda__testa">${icona("grafico", 20)}<span class="occhiello">Il programma nel tempo</span></div>
      <p class="didascalia" style="margin:0 0 12px">
        Il tempo sale <strong>solo se la settimana precedente è stata fatta almeno al 70%</strong>. Altrimenti si ripete.
        Adesso: <strong>${faseCorrente.minuti} minuti</strong>, gruppi sopra soglia <strong>collo · ${nomi}</strong>.
      </p>
      <ul class="piano">${righe}</ul>
    </div>`;
}

export { renderOggi };
