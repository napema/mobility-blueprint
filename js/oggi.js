// oggi.js — la schermata Oggi: dice che giorno è, se il programma è
// quotidiano, cosa si fa stasera, quali muscoli tocca e quanto dura.
// Risponde alle domande che l'app prima lasciava senza risposta.

import { getState } from "./storage.js";
import { icona } from "./icone.js";
import { oggiISO, addGiorni, costruisciPassiLavoro, riepilogoModuli } from "./sessione.js";

const LETTERE = ["L", "M", "M", "G", "V", "S", "D"];

function inizioSettimana(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const data = new Date(y, m - 1, d);
  const giornoSettimana = (data.getDay() + 6) % 7; // lunedì = 0
  return addGiorni(iso, -giornoSettimana);
}

function formattaOggi() {
  return new Date().toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function minutiDa(secondi) {
  return Math.max(1, Math.round(secondi / 60));
}

function renderOggi(container) {
  const state = getState();
  const oggi = oggiISO();
  const fatteOggi = state.storicoSessioni.some((s) => s.data === oggi);
  const { errore, passi } = costruisciPassiLavoro(state);

  if (errore === "assessment-incompleto") {
    container.innerHTML = `
      <div class="vista-intestazione">
        <h1 class="titolo-grande">Oggi</h1>
        <p class="sottotitolo">${formattaOggi()}</p>
      </div>
      <div class="vetro scheda">
        <div class="scheda__testa">${icona("bersaglio", 20)}<span class="occhiello">Da fare per primo</span></div>
        <p class="corpo" style="margin:0 0 16px">Prima di cominciare serve l'assessment: decide da che lato lavori e come è fatto il tuo programma.</p>
        <button class="btn btn-primary" id="btn-vai-assessment">Fai l'assessment</button>
      </div>
    `;
    container.querySelector("#btn-vai-assessment").addEventListener("click", () => {
      document.getElementById("btn-rifai-assessment").click();
    });
    return;
  }

  const durataSec = passi.reduce((tot, p) => tot + p.durataSec, 0);
  const moduli = riepilogoModuli(passi);
  const blocco = state.programma.blocco;
  const settimana = state.programma.settimana;

  container.innerHTML = `
    <div class="vista-intestazione">
      <h1 class="titolo-grande">Oggi</h1>
      <p class="sottotitolo">${formattaOggi()}</p>
    </div>

    ${renderSettimana(state, oggi)}

    <div class="vetro scheda riquadro-oggi">
      <div class="riquadro-oggi__meta">
        ${icona("orologio", 18)}
        <span>Sessione serale · ogni giorno</span>
      </div>
      <div class="riquadro-oggi__durata">${minutiDa(durataSec)} min</div>
      <div class="sess-chip-riga" style="margin-top:12px">
        <span class="pillola is-blu">${blocco === 0 ? "Blocco 0 · settimana 0" : `Blocco ${blocco} · settimana ${settimana}`}</span>
        <span class="pillola">${passi.length} esercizi</span>
        ${fatteOggi ? '<span class="pillola is-verde">Fatta oggi</span>' : ""}
      </div>

      <ul class="elenco-moduli">
        ${moduli.map((m) => `
          <li>
            <div style="min-width:0">
              <div class="modulo__nome">${m.nome}</div>
              <div class="modulo__muscoli">${m.muscoli.join(" · ")}</div>
            </div>
            <div class="modulo__durata">${minutiDa(m.durataSec)} min</div>
          </li>
        `).join("")}
      </ul>

      <button class="btn btn-primary" id="btn-inizia-sessione" style="margin-top:24px">
        ${icona("play", 18, true)} ${fatteOggi ? "Rifai la sessione" : "Inizia"}
      </button>
    </div>

    <div class="vetro scheda">
      <div class="scheda__testa">${icona("onda", 20)}<span class="occhiello">Come deve andare</span></div>
      <p class="corpo" style="margin:0 0 8px">Questa pratica <strong>non deve farti sudare</strong>. Non è un compromesso: al 30-40% della soglia di dolore guadagni più range attivo che spingendo all'80%.</p>
      <p class="didascalia" style="margin:0">Il risultato non si misura in gradi guadagnati, ma in giorni consecutivi completati. Per questo è quotidiana e per questo è corta.</p>
    </div>
  `;
}

function renderSettimana(state, oggi) {
  const inizio = inizioSettimana(oggi);
  const completate = new Set(state.storicoSessioni.map((s) => s.data));

  const giorni = LETTERE.map((lettera, i) => {
    const iso = addGiorni(inizio, i);
    const numero = Number(iso.split("-")[2]);
    const fatto = completate.has(iso);
    const eOggi = iso === oggi;
    const futuro = iso > oggi;
    const classi = ["giorno"];
    if (fatto) classi.push("is-fatto");
    if (eOggi) classi.push("is-oggi");
    if (futuro) classi.push("is-futuro");
    return `
      <div class="${classi.join(" ")}">
        <span class="giorno__lettera">${lettera}</span>
        <span class="giorno__pallino">${fatto ? "✓" : numero}</span>
      </div>
    `;
  }).join("");

  const fatteQuestaSettimana = LETTERE.filter((_, i) => completate.has(addGiorni(inizio, i))).length;

  return `
    <div class="vetro scheda">
      <div class="scheda__testa">${icona("calendario", 20)}<span class="occhiello">Questa settimana · ${fatteQuestaSettimana} di 7</span></div>
      <div class="settimana">${giorni}</div>
    </div>
  `;
}

export { renderOggi };
