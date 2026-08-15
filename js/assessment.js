// assessment.js — Settimana 0: Test 1 (muscolo/nervo), Test 2 (lateralizzazione,
// portato da asimmetria-bacino-protocollo.html), Test 3 (baseline 5 bersagli).
// Nessun contenuto sugli esercizi qui: solo raccolta e salvataggio dell'assessment.

import { getState, updateState, leggiFotoBlob } from "./storage.js";
import { aggiungiFoto } from "./foto-sync.js";

// --- Test 1: soglia (cm) oltre la quale il peggioramento in mento-al-petto /
// dorsiflessione è considerato "netto" e quindi indicativo di tensione neurale.
const TEST1_SOGLIA_CM = 2;

// --- Test 2: i sette test di lateralizzazione, logica invariata rispetto
// alla pagina originale (TESTS, voteOf, regola di maggioranza, doppio twist).
const LAT_TESTS = [
  { n: "01", yt: "gQXcV3_JQdU", zone: "low", pol: "toward",
    nome: "Rotazione interna d'anca",
    q: "Su quale lato l'anca ruota di più verso l'interno?",
    perche: "La rotazione interna è la posizione dell'appoggio medio. È migliore dove stai piantato." },
  { n: "02", yt: "gQXcV3_JQdU", zone: "low", pol: "away",
    nome: "Rotazione esterna d'anca",
    q: "Su quale lato l'anca ruota di più verso l'esterno?",
    perche: "La rotazione esterna appartiene alla fase di volo. È migliore sul lato che eviti." },
  { n: "03", yt: "O9nkFMg65QE", zone: "low", pol: "toward",
    nome: "Straight leg raise",
    q: "Da supino, quale gamba tesa sale più in alto?",
    perche: "Oltre i 45° circa, alzare la gamba tesa è di fatto rotazione interna d'anca." },
  { n: "04", yt: "9S10ShpPKto", zone: "low", pol: "away",
    nome: "Flessione d'anca",
    q: "Quale ginocchio arriva più vicino al petto?",
    perche: "La flessione profonda d'anca esprime rotazione esterna: è migliore sul lato da cui scappi." },
  { n: "05", yt: "yodnktUmDLk", zone: "up", pol: "away",
    nome: "Rotazione interna di spalla",
    q: "Quale spalla ruota di più verso l'interno?",
    perche: "Il tronco è ruotato: la rotazione interna di spalla è migliore sul lato da cui scappi." },
  { n: "06", yt: "00Yc2iLr1C8", zone: "up", pol: "toward",
    nome: "Rotazione esterna di spalla",
    q: "Quale spalla ruota di più verso l'esterno?",
    perche: "Speculare al test 05: la rotazione esterna è migliore sul lato lateralizzato." },
  { n: "07", yt: "xoI7lEcBspU", zone: "up", pol: "toward",
    nome: "Abduzione di spalla",
    q: "Quale braccio sale più in alto lateralmente?",
    perche: "L'abduzione misura quanto bene il tronco riesce a girarsi verso quel lato." },
];

// --- Test 3: i cinque bersagli fotografici (SPEC §3).
const BERSAGLI = [
  { id: "deep-squat", nome: "Deep squat", posa: "Profilo" },
  { id: "pike", nome: "Pike / forward fold", posa: "Profilo" },
  { id: "overhead-shoulder", nome: "Overhead shoulder flexion", posa: "Profilo" },
  { id: "farfalla", nome: "Simmetria ER anca (farfalla)", posa: "Frontale" },
  { id: "collo", nome: "Simmetria flessione laterale collo", posa: "Frontale" },
];

let parteCorrente = "test1";

function renderAssessment(container) {
  parteCorrente = "test1";
  container.innerHTML = `
    <div class="assess-tabs">
      <button class="assess-tab" data-parte="test1">1 · Nervo o muscolo</button>
      <button class="assess-tab" data-parte="test2">2 · Lateralizzazione</button>
      <button class="assess-tab" data-parte="test3">3 · Bersagli</button>
    </div>
    <div class="assess-part" data-parte="test1"></div>
    <div class="assess-part" data-parte="test2"></div>
    <div class="assess-part" data-parte="test3"></div>
    <div class="assess-footer">
      <button class="btn btn-primary" id="btn-completa-assessment">Completa assessment</button>
      <p class="assess-note">Puoi tornare qui in qualsiasi momento da Impostazioni → Rifai assessment: i valori già inseriti restano.</p>
    </div>
  `;

  container.querySelectorAll(".assess-tab").forEach((tab) => {
    tab.addEventListener("click", () => mostraParte(container, tab.dataset.parte));
  });

  container.querySelector("#btn-completa-assessment").addEventListener("click", () => {
    updateState((state) => {
      state.assessment.completato = true;
      state.metaUp = Date.now();
    });
    document.getElementById("view-assessment").hidden = true;
    document.body.style.overflow = "";
    document.dispatchEvent(new CustomEvent("dati-cambiati"));
    document.dispatchEvent(new CustomEvent("overlay-chiuso"));
  });

  mostraParte(container, "test1");
}

const RENDER_PARTE = { test1: renderParte1, test2: renderParte2, test3: renderParte3 };

function mostraParte(container, nome) {
  parteCorrente = nome;
  container.querySelectorAll(".assess-part").forEach((el) => {
    el.hidden = el.dataset.parte !== nome;
  });
  container.querySelectorAll(".assess-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.parte === nome);
  });
  // Ogni parte si ridisegna con lo stato più recente ogni volta che viene
  // mostrata: la Parte 3 dipende dal risultato del Test 1 (vedi pike).
  // Il selettore va vincolato a .assess-part: anche i pulsanti delle tab
  // portano data-parte e nel DOM vengono prima, quindi un [data-parte]
  // generico finirebbe per disegnare il pannello dentro il pulsante.
  RENDER_PARTE[nome](container.querySelector(`.assess-part[data-parte="${nome}"]`));
}

// ===================== PARTE 1 — muscolo o nervo =====================

function renderParte1(el) {
  const t1 = getState().assessment.esitoTest1;

  el.innerHTML = `
    <p class="assess-intro">
      Flessione in avanti in tre versioni consecutive, a freddo. Misura in ciascuna la
      distanza tra le dita e il pavimento, in centimetri (0 o negativo se le tocchi/superi).
    </p>

    <div class="field">
      <label for="t1-v1">1 — Normale, mento neutro (cm)</label>
      <input type="number" step="0.5" inputmode="decimal" id="t1-v1" value="${t1.variante1Cm ?? ""}">
    </div>
    <div class="field">
      <label for="t1-v2">2 — Mento al petto (cm)</label>
      <input type="number" step="0.5" inputmode="decimal" id="t1-v2" value="${t1.variante2Cm ?? ""}">
    </div>
    <div class="field">
      <label for="t1-v3">3 — Mento al petto + caviglie in dorsiflessione (cm)</label>
      <input type="number" step="0.5" inputmode="decimal" id="t1-v3" value="${t1.variante3Cm ?? ""}">
    </div>

    <div class="esito-box" id="t1-esito"></div>
  `;

  ["t1-v1", "t1-v2", "t1-v3"].forEach((id) => {
    el.querySelector(`#${id}`).addEventListener("input", () => aggiornaTest1(el));
  });

  aggiornaTest1(el, /* salva */ false);
}

function aggiornaTest1(el, salva = true) {
  const v1 = parseNumeroONull(el.querySelector("#t1-v1").value);
  const v2 = parseNumeroONull(el.querySelector("#t1-v2").value);
  const v3 = parseNumeroONull(el.querySelector("#t1-v3").value);
  const box = el.querySelector("#t1-esito");

  let esito = null;
  if (v1 !== null && v2 !== null && v3 !== null) {
    const peggiora2 = v2 - v1 >= TEST1_SOGLIA_CM;
    const peggiora3 = v3 - v1 >= TEST1_SOGLIA_CM;
    esito = (peggiora2 && peggiora3) ? "neurale" : "muscolare";
  }

  if (esito === "neurale") {
    box.className = "esito-box";
    box.innerHTML = `<div class="esito-titolo">Tensione neurale</div>
      <div>Il range peggiora nettamente in 2 e 3. Il modulo posteriore userà nerve flossing dello sciatico, non allungamento prolungato dei femorali.</div>`;
  } else if (esito === "muscolare") {
    box.className = "esito-box";
    box.innerHTML = `<div class="esito-titolo">Lunghezza muscolare</div>
      <div>Il range resta sostanzialmente uguale. Modulo posteriore standard: statico 30" + attivo.</div>`;
  } else {
    box.className = "esito-box is-pending";
    box.textContent = "Compila tutte e tre le misure per vedere l'esito.";
  }

  if (salva) {
    updateState((state) => {
      state.assessment.esitoTest1 = { variante1Cm: v1, variante2Cm: v2, variante3Cm: v3, esito };
    });
  }
}

// ===================== PARTE 2 — sette test di lateralizzazione =====================

function altroLato(lato) {
  return lato === "sx" ? "dx" : "sx";
}

function votoDelTest(test, risposta) {
  if (!risposta) return null;
  return test.pol === "toward" ? risposta : altroLato(risposta);
}

function renderParte2(el) {
  const risposte = getState().assessment.esitoTest2.risposte;

  const cards = LAT_TESTS.map((t, i) => `
    <div class="lat-card">
      <div class="lat-card__meta">Test ${t.n}</div>
      <a class="lat-video" href="https://www.youtube.com/watch?v=${t.yt}" target="_blank" rel="noopener">
        <img loading="lazy" src="https://i.ytimg.com/vi/${t.yt}/hqdefault.jpg" alt="">
        <span>${t.nome} — apri su YouTube ↗</span>
      </a>
      <div class="lat-card__q">${t.q}</div>
      <div class="lat-card__why">${t.perche}</div>
      <div class="choose">
        <button class="btn-side" data-i="${i}" data-v="sx">Sinistro</button>
        <button class="btn-side" data-i="${i}" data-v="dx">Destro</button>
      </div>
    </div>
  `).join("");

  el.innerHTML = `
    <p class="assess-intro">
      Guarda il video, misura tutti e due i lati e segna qual è il migliore — quello con
      più escursione, non quello che fa male. A freddo, non dopo l'allenamento.
    </p>
    <div id="lat-cards">${cards}</div>
    <div class="verdict-box" id="lat-verdict"></div>
  `;

  LAT_TESTS.forEach((_, i) => {
    el.querySelectorAll(`.btn-side[data-i="${i}"]`).forEach((btn) => {
      btn.classList.toggle("is-active", risposte[i] === btn.dataset.v);
    });
  });

  el.querySelector("#lat-cards").addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-side");
    if (!btn) return;
    const i = Number(btn.dataset.i);
    const v = btn.dataset.v;

    const state = getState();
    const attuali = state.assessment.esitoTest2.risposte;
    attuali[i] = attuali[i] === v ? null : v;

    el.querySelectorAll(`.btn-side[data-i="${i}"]`).forEach((b) => {
      b.classList.toggle("is-active", attuali[i] === b.dataset.v);
    });

    aggiornaVerdettoLateralizzazione(el, attuali);
  });

  aggiornaVerdettoLateralizzazione(el, risposte, /* salva */ false);
}

function aggiornaVerdettoLateralizzazione(el, risposte, salva = true) {
  const box = el.querySelector("#lat-verdict");

  let sx = 0, dx = 0, upSx = 0, upDx = 0, lowSx = 0, lowDx = 0, completati = 0;
  LAT_TESTS.forEach((t, i) => {
    const voto = votoDelTest(t, risposte[i]);
    if (!voto) return;
    completati++;
    if (voto === "sx") { sx++; t.zone === "up" ? upSx++ : lowSx++; }
    else { dx++; t.zone === "up" ? upDx++ : lowDx++; }
  });

  const completo = completati === LAT_TESTS.length;

  if (!completo) {
    box.className = "verdict-box is-pending";
    box.innerHTML = `<div class="verdict-titolo">In attesa dei sette test</div>
      <div class="verdict-corpo">Mancano ${LAT_TESTS.length - completati} test su ${LAT_TESTS.length}.</div>`;
    if (salva) {
      updateState((state) => {
        state.assessment.esitoTest2 = {
          risposte, latoLateralizzato: null, punteggio: null,
          doppioTwist: false, latoSopra: null, latoSotto: null,
        };
      });
    }
    return;
  }

  const lato = dx >= sx ? "dx" : "sx";
  const scappa = altroLato(lato);
  const punteggio = lato === "dx" ? dx : sx;
  const latoN = lato === "dx" ? "destro" : "sinistro";
  const scappaN = scappa === "dx" ? "destro" : "sinistro";

  const upSide = upSx === 3 ? "sx" : (upDx === 3 ? "dx" : null);
  const lowSide = lowSx >= 3 ? "sx" : (lowDx >= 3 ? "dx" : null);
  const doppioTwist = !!(upSide && lowSide && upSide !== lowSide);

  box.className = "verdict-box";
  box.innerHTML = `
    <div class="verdict-titolo">Sei lateralizzato a ${latoN.toUpperCase()}</div>
    <div class="verdict-corpo">
      <strong>${punteggio} test su ${LAT_TESTS.length}</strong> puntano al lato ${latoN}.
      Incastrato in appoggio sul lato ${latoN}, scappi dal lato ${scappaN}.
      ${punteggio === 4 ? "<br>4 su 7 è il minimo leggibile: il quadro è debole, vale la pena rimisurare i test in disaccordo." : ""}
      ${doppioTwist ? `<br><strong>Pattern doppio twist rilevato.</strong> Spalle e anche vanno in direzioni opposte (spalle a ${upSide === "dx" ? "destra" : "sinistra"}, anche a ${lowSide === "dx" ? "destra" : "sinistra"}).` : ""}
    </div>
  `;

  if (salva) {
    updateState((state) => {
      state.assessment.esitoTest2 = {
        risposte, latoLateralizzato: lato, punteggio,
        doppioTwist, latoSopra: doppioTwist ? upSide : null, latoSotto: doppioTwist ? lowSide : null,
      };
    });
  }
}

// ===================== PARTE 3 — baseline dei cinque bersagli =====================

function renderParte3(el) {
  const state = getState();
  const bersagli = state.assessment.baselineTest3.bersagli;

  // Comodità: se il Test 1 ha già una misura "normale" e il pike è ancora vuoto,
  // la propone come default (stessa misura, stesso gesto).
  if (bersagli.pike.misure.distanzaDitaPavimentoCm === null && state.assessment.esitoTest1.variante1Cm !== null) {
    bersagli.pike.misure.distanzaDitaPavimentoCm = state.assessment.esitoTest1.variante1Cm;
    updateState((s) => {
      s.assessment.baselineTest3.bersagli.pike.misure.distanzaDitaPavimentoCm = state.assessment.esitoTest1.variante1Cm;
    });
  }

  el.innerHTML = `
    <p class="assess-intro">
      Stessa posa, stessa distanza, stessa luce — sarà il riferimento per il confronto ogni 3 settimane.
    </p>
    ${BERSAGLI.map((b) => renderCardBersaglio(b, bersagli[b.id])).join("")}
  `;

  BERSAGLI.forEach((b) => {
    const card = el.querySelector(`[data-target="${b.id}"]`);

    card.querySelectorAll(".btn-side[data-misura]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const misura = btn.dataset.misura;
        const valore = parseValoreScelta(btn.dataset.val);
        card.querySelectorAll(`.btn-side[data-misura="${misura}"]`).forEach((x) => {
          x.classList.toggle("is-active", x.dataset.val === btn.dataset.val);
        });
        updateState((state2) => {
          state2.assessment.baselineTest3.bersagli[b.id].misure[misura] = valore;
        });
      });
    });

    card.querySelectorAll("input[type='number'][data-misura]").forEach((input) => {
      input.addEventListener("input", () => {
        const valore = parseNumeroONull(input.value);
        updateState((state2) => {
          state2.assessment.baselineTest3.bersagli[b.id].misure[input.dataset.misura] = valore;
        });
      });
    });

    const fileInput = card.querySelector("input[type='file']");
    fileInput.addEventListener("change", () => salvaFotoBersaglio(card, b.id, fileInput));

    caricaAnteprimaFoto(card, b.id);
  });
}

function renderCardBersaglio(b, dati) {
  const m = dati.misure;
  let campiHtml = "";

  if (b.id === "deep-squat") {
    campiHtml = `
      <div class="field">
        <label>Profondità</label>
        ${scelta("deep-squat", "profonditaLivello", m.profonditaLivello, [
          ["sopra-parallelo", "Sopra il parallelo"],
          ["parallelo", "Al parallelo"],
          ["sotto-parallelo", "Sotto il parallelo"],
        ])}
      </div>
      <div class="field">
        <label>Talloni a terra</label>
        ${scelta("deep-squat", "talloniATerra", m.talloniATerra, [["true", "Sì"], ["false", "No"]])}
      </div>
    `;
  } else if (b.id === "pike") {
    campiHtml = `
      <div class="field">
        <label>Distanza dita-pavimento (cm)</label>
        <input type="number" step="0.5" inputmode="decimal" data-misura="distanzaDitaPavimentoCm" value="${m.distanzaDitaPavimentoCm ?? ""}">
      </div>
    `;
  } else if (b.id === "overhead-shoulder") {
    campiHtml = `
      <div class="field">
        <label>Distanza polso-muro a braccia sopra la testa (cm)</label>
        <input type="number" step="0.5" inputmode="decimal" data-misura="distanzaPolsoMuroCm" value="${m.distanzaPolsoMuroCm ?? ""}">
      </div>
      <div class="field">
        <label>Lombare resta piatta contro il muro</label>
        ${scelta("overhead-shoulder", "lombarePiatta", m.lombarePiatta, [["true", "Sì"], ["false", "No"]])}
      </div>
    `;
  } else if (b.id === "farfalla") {
    campiHtml = `
      <p class="assess-note" style="margin-top:0">Esiste già una foto baseline (frontale, specchio, 14 ago 2026): se ce l'hai sul telefono, selezionala qui come punto zero invece di scattarne una nuova.</p>
      <div class="field">
        <label>Altezza ginocchio sinistro da terra (cm)</label>
        <input type="number" step="0.5" inputmode="decimal" data-misura="altezzaGinocchioSxCm" value="${m.altezzaGinocchioSxCm ?? ""}">
      </div>
      <div class="field">
        <label>Altezza ginocchio destro da terra (cm)</label>
        <input type="number" step="0.5" inputmode="decimal" data-misura="altezzaGinocchioDxCm" value="${m.altezzaGinocchioDxCm ?? ""}">
      </div>
    `;
  } else if (b.id === "collo") {
    campiHtml = `
      <p class="assess-note" style="margin-top:0">Se durante la misura compaiono vertigini, formicolii alle braccia, cefalea o dolore, fermati.</p>
      <div class="field">
        <label>Angolo orecchio-spalla destro (gradi)</label>
        <input type="number" step="1" inputmode="decimal" data-misura="angoloDxGradi" value="${m.angoloDxGradi ?? ""}">
      </div>
      <div class="field">
        <label>Angolo orecchio-spalla sinistro (gradi)</label>
        <input type="number" step="1" inputmode="decimal" data-misura="angoloSxGradi" value="${m.angoloSxGradi ?? ""}">
      </div>
    `;
  }

  return `
    <div class="target-card" data-target="${b.id}">
      <h3>${b.nome}</h3>
      <div class="target-sub">${b.posa}</div>
      ${campiHtml}
      <div class="photo-row">
        <div class="photo-thumb is-empty" id="thumb-${b.id}">foto</div>
        <label class="photo-input-label">
          Aggiungi/sostituisci foto
          <input type="file" accept="image/*" capture="environment">
        </label>
      </div>
    </div>
  `;
}

function scelta(target, misura, valoreCorrente, opzioni) {
  const correnteStr = valoreCorrente === null || valoreCorrente === undefined ? null : String(valoreCorrente);
  return `<div class="choose">${opzioni.map(([val, label]) => `
    <button type="button" class="btn-side${correnteStr === val ? " is-active" : ""}" data-target="${target}" data-misura="${misura}" data-val="${val}">${label}</button>
  `).join("")}</div>`;
}

function parseValoreScelta(val) {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}

async function salvaFotoBersaglio(card, bersaglioId, fileInput) {
  const file = fileInput.files?.[0];
  if (!file) return;
  const thumb = card.querySelector(".photo-thumb");
  thumb.textContent = "…";
  // aggiungiFoto comprime, salva in locale e mette in coda il caricamento
  const { blob } = await aggiungiFoto(bersaglioId, file);
  mostraAnteprima(card, URL.createObjectURL(blob));
}

// L'ultima foto di questo bersaglio, presa dai riferimenti sincronizzati.
async function caricaAnteprimaFoto(card, bersaglioId) {
  const record = (getState().foto || [])
    .filter((f) => !f.del && f.bersaglioId === bersaglioId)
    .sort((a, b) => (a.up || 0) - (b.up || 0));
  if (record.length === 0) return;
  const blob = await leggiFotoBlob(record[record.length - 1].id);
  if (blob) mostraAnteprima(card, URL.createObjectURL(blob));
}

function mostraAnteprima(card, url) {
  const thumb = card.querySelector(".photo-thumb");
  thumb.classList.remove("is-empty");
  thumb.textContent = "";
  thumb.style.backgroundImage = `url("${url}")`;
  thumb.style.backgroundSize = "cover";
  thumb.style.backgroundPosition = "center";
}

// ===================== utilità =====================

function parseNumeroONull(str) {
  if (str === "" || str === null || str === undefined) return null;
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

export { renderAssessment };
