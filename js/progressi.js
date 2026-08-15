// progressi.js — la misura del progresso, su tre piani diversi:
// 1. costanza (l'unica metrica che la SPEC considera di successo)
// 2. volume per gruppo muscolare contro la soglia dei 5 min/settimana
// 3. i cinque bersagli, con la baseline e la scadenza della prossima foto

import { getState, leggiFotoBlob } from "./storage.js";
import { icona } from "./icone.js";
import { oggiISO, addGiorni, giorniTra } from "./sessione.js";

const SOGLIA_SETTIMANALE_SEC = 300; // 5 minuti per gruppo muscolare
const GIORNI_TRA_LE_FOTO = 21;      // protocollo foto: ogni 3 settimane

const NOMI_GRUPPI = {
  "gluteo": "Glutei",
  "anca-laterale": "Anca laterale",
  "quadricipite": "Quadricipiti",
  "obliqui": "Obliqui",
  "adduttori": "Adduttori",
  "femorali": "Femorali",
  "caviglia": "Caviglia",
  "caviglia-anca": "Caviglia e anca",
  "soleo": "Soleo",
  "addominali": "Addominali",
  "dorsali": "Dorsali",
  "spalle": "Spalle",
  "gran-dorsale": "Gran dorsale",
  "rotatori-anca": "Rotatori d'anca",
  "piriforme-gluteo": "Piriforme e gluteo",
  "collo-laterale": "Collo (laterale)",
  "collo-scaleno": "Collo (scaleni)",
};

const BERSAGLI = [
  { id: "deep-squat", nome: "Deep squat" },
  { id: "pike", nome: "Pike / forward fold" },
  { id: "overhead-shoulder", nome: "Overhead shoulder" },
  { id: "farfalla", nome: "Simmetria farfalla" },
  { id: "collo", nome: "Simmetria collo" },
];

function descriviBersaglio(id, misure) {
  const v = (x) => (x === null || x === undefined ? null : x);
  if (id === "deep-squat") {
    const p = v(misure.profonditaLivello);
    if (!p) return null;
    const etichette = { "sopra-parallelo": "Sopra il parallelo", "parallelo": "Al parallelo", "sotto-parallelo": "Sotto il parallelo" };
    return `${etichette[p] || p}${misure.talloniATerra === true ? " · talloni a terra" : misure.talloniATerra === false ? " · talloni sollevati" : ""}`;
  }
  if (id === "pike") {
    return v(misure.distanzaDitaPavimentoCm) === null ? null : `${misure.distanzaDitaPavimentoCm} cm dal pavimento`;
  }
  if (id === "overhead-shoulder") {
    if (v(misure.distanzaPolsoMuroCm) === null) return null;
    return `${misure.distanzaPolsoMuroCm} cm dal muro${misure.lombarePiatta === true ? " · lombare piatta" : ""}`;
  }
  if (id === "farfalla") {
    if (v(misure.altezzaGinocchioSxCm) === null || v(misure.altezzaGinocchioDxCm) === null) return null;
    const diff = Math.abs(misure.altezzaGinocchioSxCm - misure.altezzaGinocchioDxCm);
    return `Sx ${misure.altezzaGinocchioSxCm} cm · Dx ${misure.altezzaGinocchioDxCm} cm · differenza ${diff} cm`;
  }
  if (id === "collo") {
    if (v(misure.angoloDxGradi) === null || v(misure.angoloSxGradi) === null) return null;
    return `Dx ${misure.angoloDxGradi}° · Sx ${misure.angoloSxGradi}°`;
  }
  return null;
}

function volumeUltimi7Giorni(storico, oggi) {
  const finestra = new Set();
  for (let i = 0; i < 7; i++) finestra.add(addGiorni(oggi, -i));
  const totali = {};
  for (const s of storico) {
    if (!finestra.has(s.data)) continue;
    for (const [gruppo, sec] of Object.entries(s.volumePerGruppo || {})) {
      totali[gruppo] = (totali[gruppo] || 0) + sec;
    }
  }
  return totali;
}

function renderProgressi(container) {
  const state = getState();
  const oggi = oggiISO();
  const completate = new Set(state.storicoSessioni.map((s) => s.data));
  const volumi = volumeUltimi7Giorni(state.storicoSessioni, oggi);
  const gruppi = Object.entries(volumi).sort((a, b) => b[1] - a[1]);
  const sottodosati = gruppi.filter(([, sec]) => sec < SOGLIA_SETTIMANALE_SEC).length;

  container.innerHTML = `
    <div class="vista-intestazione">
      <h1 class="titolo-grande">Progressi</h1>
      <p class="sottotitolo">Costanza, volume e i cinque bersagli</p>
    </div>

    <div class="vetro scheda">
      <div class="scheda__testa">${icona("fiamma", 20)}<span class="occhiello">Costanza</span></div>
      <div style="display:flex;gap:32px;align-items:baseline">
        <div>
          <div class="riquadro-oggi__durata">${state.streak.giorniConsecutivi}</div>
          <div class="didascalia">giorni di fila</div>
        </div>
        <div>
          <div class="riquadro-oggi__durata">${state.storicoSessioni.length}</div>
          <div class="didascalia">sessioni totali</div>
        </div>
      </div>
      <p class="didascalia" style="margin-top:16px">È la metrica che conta davvero: il programma riesce se i giorni si accumulano, non se guadagni gradi in fretta.</p>
      ${renderGriglia(completate, oggi)}
    </div>

    <div class="vetro scheda">
      <div class="scheda__testa">${icona("onda", 20)}<span class="occhiello">Volume ultimi 7 giorni</span></div>
      ${gruppi.length === 0
        ? '<p class="didascalia" style="margin:0">Nessuna sessione registrata negli ultimi 7 giorni: qui comparirà quanto lavoro ha ricevuto ogni gruppo muscolare.</p>'
        : gruppi.map(([gruppo, sec]) => renderRigaVolume(gruppo, sec)).join("") +
          `<p class="didascalia" style="margin-top:12px">Soglia di adattamento: 5 minuti a settimana per gruppo. ${
            sottodosati > 0
              ? `<strong>${sottodosati} ${sottodosati === 1 ? "gruppo è" : "gruppi sono"} sotto soglia</strong> — normale nei primi giorni, si riempie con la costanza.`
              : "Tutti i gruppi sono sopra soglia."
          }</p>`}
    </div>

    <div class="vetro scheda">
      <div class="scheda__testa">${icona("bersaglio", 20)}<span class="occhiello">I cinque bersagli</span></div>
      <div id="bersagli-elenco"></div>
      <p class="didascalia" id="prossima-foto" style="margin-top:12px"></p>
    </div>
  `;

  renderBersagli(container, state);
}

function renderRigaVolume(gruppo, sec) {
  const nome = NOMI_GRUPPI[gruppo] || gruppo;
  const percentuale = Math.min(100, (sec / SOGLIA_SETTIMANALE_SEC) * 100);
  const sotto = sec < SOGLIA_SETTIMANALE_SEC;
  const minuti = Math.floor(sec / 60);
  const secondi = String(sec % 60).padStart(2, "0");
  return `
    <div class="riga-volume">
      <div class="riga-volume__testa">
        <span>${nome}</span>
        <span class="riga-volume__valore">${minuti}:${secondi} / 5:00</span>
      </div>
      <div class="barra-volume">
        <div class="barra-volume__pieno ${sotto ? "is-sotto" : ""}" style="width:${percentuale}%"></div>
      </div>
    </div>
  `;
}

function renderGriglia(completate, oggi) {
  const celle = [];
  for (let i = 27; i >= 0; i--) {
    const iso = addGiorni(oggi, -i);
    const classi = ["cella"];
    if (completate.has(iso)) classi.push("is-fatto");
    if (iso === oggi) classi.push("is-oggi");
    celle.push(`<div class="${classi.join(" ")}" title="${iso}"></div>`);
  }
  return `<div class="griglia-mesi">${celle.join("")}</div>
          <p class="mini" style="margin-top:8px">Ultime quattro settimane</p>`;
}

async function renderBersagli(container, state) {
  const elenco = container.querySelector("#bersagli-elenco");
  const bersagli = state.assessment.baselineTest3.bersagli;
  let dataFotoPiuRecente = null;

  elenco.innerHTML = BERSAGLI.map((b) => {
    const dati = bersagli[b.id] || { misure: {} };
    const descrizione = descriviBersaglio(b.id, dati.misure || {});
    if (dati.fotoData && (!dataFotoPiuRecente || dati.fotoData > dataFotoPiuRecente)) {
      dataFotoPiuRecente = dati.fotoData;
    }
    return `
      <div class="bersaglio" data-bersaglio="${b.id}">
        <div class="bersaglio__foto">${icona("fotocamera", 18)}</div>
        <div class="bersaglio__testo">
          <div class="bersaglio__nome">${b.nome}</div>
          <div class="bersaglio__valore">${descrizione || "Baseline non ancora inserita"}</div>
        </div>
      </div>
    `;
  }).join("");

  const nota = container.querySelector("#prossima-foto");
  if (dataFotoPiuRecente) {
    const giornoFoto = dataFotoPiuRecente.slice(0, 10);
    const passati = giorniTra(giornoFoto, oggiISO());
    const mancano = GIORNI_TRA_LE_FOTO - passati;
    nota.innerHTML = mancano > 0
      ? `Prossimo controllo fotografico tra <strong>${mancano} giorni</strong>. Stessa posa, stessa distanza, stessa luce.`
      : `<strong>È ora di rifare le foto</strong> (sono passati ${passati} giorni). Stessa posa, stessa distanza, stessa luce.`;
  } else {
    nota.textContent = "Aggiungi le foto baseline dall'assessment: sono il termine di paragone per capire se stai migliorando.";
  }

  // Anteprime: la più recente e, se c'è, la prima — è il confronto che
  // serve davvero fra tre settimane.
  for (const b of BERSAGLI) {
    const record = (state.foto || [])
      .filter((f) => !f.del && f.bersaglioId === b.id)
      .sort((a, b2) => (a.up || 0) - (b2.up || 0));
    if (record.length === 0) continue;

    const riquadro = elenco.querySelector(`[data-bersaglio="${b.id}"] .bersaglio__foto`);
    if (!riquadro) continue;
    const ultima = await leggiFotoBlob(record[record.length - 1].id);
    if (!ultima) continue;
    riquadro.innerHTML = "";
    riquadro.style.backgroundImage = `url("${URL.createObjectURL(ultima)}")`;

    if (record.length > 1) {
      const prima = await leggiFotoBlob(record[0].id);
      if (!prima) continue;
      const riga = elenco.querySelector(`[data-bersaglio="${b.id}"]`);
      const confronto = document.createElement("div");
      confronto.className = "confronto-foto";
      confronto.innerHTML = `
        <figure><img src="${URL.createObjectURL(prima)}" alt=""><figcaption>${record[0].data.slice(0, 10)}</figcaption></figure>
        <figure><img src="${URL.createObjectURL(ultima)}" alt=""><figcaption>${record[record.length - 1].data.slice(0, 10)}</figcaption></figure>`;
      riga.insertAdjacentElement("afterend", confronto);
    }
  }
}

export { renderProgressi };
