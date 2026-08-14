// oggi.js — la home: che giorno è, cosa c'è da fare oggi, e come è fatto
// il programma nel tempo. La scelta della sessione parte da una domanda
// concreta ("cosa hai fatto oggi?"), non da un menu astratto.

import { getState, updateState } from "./storage.js";
import { icona } from "./icone.js";
import { renderAnimazione } from "./animazioni.js";
import {
  oggiISO, addGiorni, costruisciSessione, riepilogoModuli, settimanaCorrente, streakAncoraValida,
} from "./sessione.js";
import { TIPI_SESSIONE, PROGRESSIONE, BLOCCHI_ROTAZIONE, GRUPPI, gruppiAttiviPerSettimana, fasePerSettimana } from "./esercizi.js";

const LETTERE = ["L", "M", "M", "G", "V", "S", "D"];
let tipoScelto = "quotidiana";

function inizioSettimana(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return addGiorni(iso, -((new Date(y, m - 1, d).getDay() + 6) % 7));
}

const dataLunga = () => new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
const minuti = (sec) => Math.max(1, Math.round(sec / 60));

function renderOggi(container) {
  const state = getState();
  const oggi = oggiISO();
  const settimana = settimanaCorrente(state);
  const fase = fasePerSettimana(settimana);
  const fattoOggi = state.storicoSessioni.some((s) => s.data === oggi);
  const { passi } = costruisciSessione(state, tipoScelto);
  const moduli = riepilogoModuli(passi);
  const durata = passi.reduce((t, p) => t + p.durataSec, 0);

  container.innerHTML = `
    <div class="vista-intestazione">
      <h1 class="titolo-grande">Oggi</h1>
      <p class="sottotitolo">${dataLunga()} · settimana ${settimana}</p>
    </div>

    ${renderSettimana(state, oggi)}

    <div class="vetro scheda">
      <div class="scheda__testa">${icona("corpo", 20)}<span class="occhiello">Cosa hai fatto oggi?</span></div>
      <div class="sess-chip-riga" id="scelta-tipo">
        ${Object.values(TIPI_SESSIONE).map((t) => `
          <button class="chip-scelta ${t.id === tipoScelto ? "is-active" : ""}" data-tipo="${t.id}">${t.domanda}</button>
        `).join("")}
      </div>
    </div>

    <div class="vetro scheda riquadro-oggi">
      <div class="riquadro-oggi__meta">
        ${icona("orologio", 18)}
        <span>${TIPI_SESSIONE[tipoScelto].nome}${tipoScelto === "quotidiana" ? " · ogni giorno" : ""}</span>
      </div>
      <div class="riquadro-oggi__durata">${minuti(durata)} min</div>
      <div class="sess-chip-riga" style="margin-top:12px">
        <span class="pillola is-blu">${passi.length} esercizi</span>
        ${fattoOggi ? '<span class="pillola is-verde">Già fatta oggi</span>' : ""}
        ${TIPI_SESSIONE[tipoScelto].tag ? `<span class="pillola ${TIPI_SESSIONE[tipoScelto].tag === "M" ? "is-verde" : ""}">${TIPI_SESSIONE[tipoScelto].tag === "M" ? "Tutto mobility" : "Tutto stretching"}</span>` : ""}
      </div>

      ${TIPI_SESSIONE[tipoScelto].nota ? `<p class="didascalia" style="margin-top:12px">${TIPI_SESSIONE[tipoScelto].nota}</p>` : ""}

      <ul class="elenco-moduli">
        ${moduli.map((m) => `
          <li>
            <div style="min-width:0">
              <div class="modulo__nome">${m.nome}</div>
              <div class="modulo__muscoli">${m.muscoli.slice(0, 5).join(" · ")}</div>
            </div>
            <div class="modulo__durata">${minuti(m.durataSec)} min</div>
          </li>
        `).join("")}
      </ul>

      <button class="btn btn-primary" id="btn-inizia-sessione" style="margin-top:24px">
        ${icona("play", 18, true)} ${fattoOggi ? "Rifai" : "Inizia"}
      </button>
      ${tipoScelto !== "minima" ? `
        <button class="btn btn-secondary" id="btn-dose-minima" style="margin-top:8px">
          Non ce la faccio — dose minima 2 min
        </button>` : ""}
    </div>

    ${renderPiano(settimana, fase)}

    <div class="vetro scheda">
      <div class="scheda__testa">${icona("onda", 20)}<span class="occhiello">Come deve andare</span></div>
      <p class="corpo" style="margin:0 0 8px">Questa pratica <strong>non deve farti sudare</strong>: al 30-40% della soglia guadagni più range attivo che spingendo all'80%.</p>
      <p class="didascalia" style="margin:0">Tarato su <strong>5 giorni su 7</strong>. Due giorni di buco sono dentro il piano, non un fallimento. L'aggancio è <strong>${state.programma.aggancio.toLowerCase()}</strong>.</p>
    </div>
  `;

  container.querySelector("#scelta-tipo").addEventListener("click", (e) => {
    const btn = e.target.closest(".chip-scelta");
    if (!btn) return;
    tipoScelto = btn.dataset.tipo;
    renderOggi(container);
  });

  const minima = container.querySelector("#btn-dose-minima");
  if (minima) minima.addEventListener("click", () => {
    tipoScelto = "minima";
    renderOggi(container);
    container.querySelector("#btn-inizia-sessione").click();
  });
}

function renderSettimana(state, oggi) {
  const inizio = inizioSettimana(oggi);
  const fatte = new Set(state.storicoSessioni.map((s) => s.data));
  const valida = streakAncoraValida(state);

  const giorni = LETTERE.map((L, i) => {
    const iso = addGiorni(inizio, i);
    const cl = ["giorno"];
    if (fatte.has(iso)) cl.push("is-fatto");
    if (iso === oggi) cl.push("is-oggi");
    if (iso > oggi) cl.push("is-futuro");
    return `<div class="${cl.join(" ")}">
      <span class="giorno__lettera">${L}</span>
      <span class="giorno__pallino">${fatte.has(iso) ? "✓" : Number(iso.split("-")[2])}</span>
    </div>`;
  }).join("");

  const n = LETTERE.filter((_, i) => fatte.has(addGiorni(inizio, i))).length;

  return `
    <div class="vetro scheda">
      <div class="scheda__testa">
        ${icona("calendario", 20)}
        <span class="occhiello">Questa settimana · ${n} di 7</span>
        <span class="pillola ${n >= 5 ? "is-verde" : ""}" style="margin-left:auto">obiettivo 5</span>
      </div>
      <div class="settimana">${giorni}</div>
      ${!valida ? '<p class="didascalia" style="margin:0">Più di 3 giorni fermi: lo streak riparte, ma il programma no. Riprendi da dove eri.</p>' : ""}
    </div>
  `;
}

// Il piano nel tempo: cosa c'è oggi, cosa entra dopo, e quando.
function renderPiano(settimana, faseCorrente) {
  const rotazione = gruppiAttiviPerSettimana(settimana);
  const nomiAttivi = rotazione.attivi.map((g) => GRUPPI[g].nome).join(" · ");

  const righe = PROGRESSIONE.map((f) => {
    const corrente = f === faseCorrente;
    const passata = settimana > f.settimane[1];
    const etichetta = f.settimane[1] === 99 ? `Sett. ${f.settimane[0]}+` : `Sett. ${f.settimane[0]}–${f.settimane[1]}`;
    return `
      <li class="piano-riga ${corrente ? "is-ora" : ""} ${passata ? "is-passata" : ""}">
        <span class="piano-quando">${etichetta}</span>
        <span class="piano-cosa">
          <strong>${f.minuti} min</strong> · ${f.note}
        </span>
        ${corrente ? '<span class="pillola is-blu">ora</span>' : ""}
      </li>
    `;
  }).join("");

  const blocchi = BLOCCHI_ROTAZIONE.map((b) => {
    const corrente = settimana >= b.settimane[0] && settimana <= b.settimane[1];
    return `<li class="piano-riga ${corrente ? "is-ora" : ""}">
      <span class="piano-quando">Blocco ${b.id}</span>
      <span class="piano-cosa">${b.attivi.map((g) => GRUPPI[g].nome).join(" · ")}</span>
      ${corrente ? '<span class="pillola is-blu">ora</span>' : ""}
    </li>`;
  }).join("");

  return `
    <div class="vetro scheda">
      <div class="scheda__testa">${icona("grafico", 20)}<span class="occhiello">Il programma nel tempo</span></div>
      <p class="didascalia" style="margin:0 0 12px">Il tempo cresce con l'abitudine, non parte al massimo. Adesso sei a <strong>${faseCorrente.minuti} minuti</strong>, con questi gruppi sopra soglia: <strong>${nomiAttivi}</strong>.</p>
      <ul class="piano">${righe}</ul>
      <p class="didascalia" style="margin:16px 0 8px">I gruppi ruotano ogni 4 settimane. Collo e adduttori/rotatori non escono mai: sono le due asimmetrie vere.</p>
      <ul class="piano">${blocchi}</ul>
    </div>
  `;
}

export { renderOggi };
