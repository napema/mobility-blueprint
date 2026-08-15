// app.js — entry point: navigazione tra viste, icone, service worker,
// wiring verso gli altri moduli.

import { getState, azzeraTutto, azzeraStorico } from "./storage.js";
import { icona } from "./icone.js";
import { renderOggi } from "./oggi.js";
import { renderProgressi } from "./progressi.js";
import { renderAssessment } from "./assessment.js";
import { renderSessione, togglePausa, fermaSessione, settimanaEffettiva } from "./sessione.js";
import * as notifiche from "./notifiche.js";
import * as sync from "./sync.js";

const TAB_VIEWS = ["oggi", "progressi", "impostazioni"];

function mostraVistaTab(nome) {
  for (const v of TAB_VIEWS) document.getElementById(`view-${v}`).hidden = v !== nome;
  for (const btn of document.querySelectorAll(".bottom-nav__item")) {
    btn.classList.toggle("is-active", btn.dataset.navTarget === nome);
  }
  if (nome === "oggi") renderOggi(document.getElementById("oggi-body"));
  if (nome === "progressi") renderProgressi(document.getElementById("progressi-body"));
  if (nome === "impostazioni") aggiornaImpostazioni();
  document.querySelector(".app-main").scrollTop = 0;
}

function apriOverlay(nome, tipo) {
  document.getElementById(`view-${nome}`).hidden = false;
  // blocca lo scorrimento della pagina sotto: l'overlay è a tutto schermo
  // e senza questo il fondo si muove sotto i comandi fissi.
  document.body.style.overflow = "hidden";
  if (nome === "assessment") renderAssessment(document.getElementById("assessment-body"));
  if (nome === "sessione") renderSessione(document.getElementById("sessione-body"), tipo);
}

function chiudiOverlay(nome) {
  document.getElementById(`view-${nome}`).hidden = true;
  document.body.style.overflow = "";
  if (nome === "sessione") fermaSessione();
  aggiornaStreak();
  renderOggi(document.getElementById("oggi-body"));
  document.dispatchEvent(new CustomEvent("overlay-chiuso"));
}

function aggiornaStreak() {
  const { streak } = getState();
  const el = document.getElementById("streak-indicator");
  el.innerHTML = `${icona("fiamma", 15, true)}<span>${streak.giorniConsecutivi}</span>`;
  el.hidden = streak.giorniConsecutivi === 0;
}

function aggiornaImpostazioni() {
  const s = getState();
  const el = document.getElementById("impostazioni-stato");
  if (el) {
    const lato = s.assessment.esitoTest2.latoLateralizzato;
    const giorni = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];
    el.innerHTML = `Settimana ${settimanaEffettiva(s)} del programma<br>`
      + `Lateralizzato: ${lato ? (lato === "dx" ? "destra" : "sinistra") : "non determinato"}<br>`
      + `Giorno di palestra: ${giorni[s.programma.giornoPalestra ?? 2]}<br>`
      + `Aggancio: ${s.programma.aggancio.toLowerCase()}<br>`
      + `Sessioni registrate: ${s.storicoSessioni.length}`;
  }
  aggiornaStatoNotifiche();
}

function aggiornaStatoNotifiche() {
  const stato = notifiche.statoPermesso();
  const testo = document.getElementById("notifiche-stato");
  const nota = document.getElementById("notifiche-nota");
  const attiva = document.getElementById("btn-attiva-notifiche");
  const prova = document.getElementById("btn-prova-notifica");
  if (!testo) return;

  const messaggi = {
    "non-supportate": "Questo browser non supporta le notifiche push.",
    default: "Non ancora attivate. Servono a ricordarti la sessione se a fine serata non l'hai fatta.",
    granted: "Attive. Promemoria alle 21:15, e alle 22:15 la dose da 2 minuti se non hai ancora fatto.",
    denied: "Bloccate dal browser: vanno riattivate dalle impostazioni del sito.",
  };
  testo.textContent = messaggi[stato] || "";
  attiva.hidden = stato === "granted" || stato === "non-supportate";
  prova.hidden = stato !== "granted";

  // Su iOS il push esiste solo con la PWA installata dalla Home: dirlo
  // prima evita mezz'ora persa a chiedersi perché non arriva niente.
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  nota.innerHTML = (iOS && !notifiche.installata())
    ? "<strong>Prima aggiungi l'app alla schermata Home.</strong> Su iPhone, in Safari come scheda normale il push non funziona: Condividi → Aggiungi alla schermata Home, poi apri dall'icona."
    : "Il promemoria ad app chiusa lo invia il workflow GitHub Actions del repo. Serve il secret PUSH_SUBSCRIPTION, che si ottiene qui sotto.";
}

function disegnaIcone() {
  for (const el of document.querySelectorAll("[data-icona]")) el.innerHTML = icona(el.dataset.icona, 24);
  document.getElementById("btn-chiudi-sessione").innerHTML = icona("chiudi", 20);
  document.getElementById("btn-chiudi-assessment").innerHTML = icona("chiudi", 20);
}

function initNavigazione() {
  for (const btn of document.querySelectorAll(".bottom-nav__item")) {
    btn.addEventListener("click", () => mostraVistaTab(btn.dataset.navTarget));
  }

  document.getElementById("btn-chiudi-sessione").addEventListener("click", () => chiudiOverlay("sessione"));
  document.getElementById("btn-pausa-sessione").addEventListener("click", () => togglePausa());
  document.getElementById("btn-rifai-assessment").addEventListener("click", () => apriOverlay("assessment"));
  document.getElementById("btn-chiudi-assessment").addEventListener("click", () => chiudiOverlay("assessment"));

  // Il tipo di sessione lo decide l'app e viaggia sul pulsante stesso.
  document.getElementById("oggi-body").addEventListener("click", (e) => {
    const btn = e.target.closest("#btn-inizia-sessione");
    if (btn) apriOverlay("sessione", btn.dataset.tipo || "quotidiano");
  });

  document.addEventListener("sessione-chiusa", () => chiudiOverlay("sessione"));

  initAzzeramento();

  // Il permesso DEVE partire da un tap: chiesto al caricamento, iOS lo
  // rifiuta in silenzio e non si può più richiedere.
  document.getElementById("btn-attiva-notifiche").addEventListener("click", async () => {
    const esito = await notifiche.attivaNotifiche();
    aggiornaStatoNotifiche();
    if (!esito.ok) return;
    const blocco = document.getElementById("sub-blocco");
    const area = document.getElementById("subOut");
    blocco.hidden = false;
    area.value = esito.iscrizione;
    try { await navigator.clipboard.writeText(esito.iscrizione); } catch { /* resta da copiare a mano */ }
  });

  document.getElementById("btn-prova-notifica").addEventListener("click", () => notifiche.provaNotifica());

  document.getElementById("btn-copia-sub").addEventListener("click", async () => {
    const area = document.getElementById("subOut");
    area.select();
    try {
      await navigator.clipboard.writeText(area.value);
      const b = document.getElementById("btn-copia-sub");
      b.textContent = "Copiato";
      setTimeout(() => { b.textContent = "Copia negli appunti"; }, 2000);
    } catch { /* la textarea è già selezionata */ }
  });

  document.getElementById("btn-sync-ora").addEventListener("click", () => sync.syncNow());
  document.getElementById("btn-svuota-cache").addEventListener("click", () => sync.svuotaCacheERicarica());
}

// Azzeramento a due livelli, entrambi protetti: lo storico si cancella
// con una conferma, tutto il resto richiede anche di scrivere la parola.
function initAzzeramento() {
  const btnStorico = document.getElementById("btn-reset-storico");
  const btnTutto = document.getElementById("btn-reset-tutto");
  const blocco = document.getElementById("reset-conferma");
  const parola = document.getElementById("reset-parola");
  const conferma = document.getElementById("btn-reset-conferma");
  const annulla = document.getElementById("btn-reset-annulla");
  if (!btnStorico) return;

  let armatoStorico = false;
  btnStorico.addEventListener("click", () => {
    if (!armatoStorico) {
      armatoStorico = true;
      btnStorico.textContent = "Sicuro? Tocca di nuovo per cancellare lo storico";
      btnStorico.classList.add("btn-pericolo");
      setTimeout(() => {
        armatoStorico = false;
        btnStorico.textContent = "Cancella solo lo storico delle sessioni";
        btnStorico.classList.remove("btn-pericolo");
      }, 5000);
      return;
    }
    azzeraStorico();
    armatoStorico = false;
    btnStorico.textContent = "Storico cancellato";
    btnStorico.classList.remove("btn-pericolo");
    aggiornaStreak();
    aggiornaImpostazioni();
    renderOggi(document.getElementById("oggi-body"));
    setTimeout(() => { btnStorico.textContent = "Cancella solo lo storico delle sessioni"; }, 2500);
  });

  btnTutto.addEventListener("click", () => {
    blocco.hidden = false;
    btnTutto.hidden = true;
    parola.value = "";
    conferma.disabled = true;
    parola.focus();
  });

  parola.addEventListener("input", () => {
    conferma.disabled = parola.value.trim().toUpperCase() !== "AZZERA";
  });

  annulla.addEventListener("click", () => {
    blocco.hidden = true;
    btnTutto.hidden = false;
  });

  conferma.addEventListener("click", async () => {
    conferma.disabled = true;
    conferma.textContent = "Azzeramento…";
    await azzeraTutto();
    location.reload();
  });
}

function initAssessmentAlPrimoAvvio() {
  if (!getState().assessment.completato) apriOverlay("assessment");
}

function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then(() => notifiche.sincronizzaStato())
        .catch(() => { /* offline al primo avvio: si riprova dopo */ });
    });
  }
}

// Il sync porta dati nuovi anche mentre l'app è aperta: qui si decide
// come ridisegnare senza strappare l'interfaccia sotto le dita.
function ridisegnaDopoSync() {
  aggiornaStreak();
  const oggiVisibile = !document.getElementById("view-oggi").hidden;
  if (oggiVisibile) renderOggi(document.getElementById("oggi-body"));
  const progressiVisibile = !document.getElementById("view-progressi").hidden;
  if (progressiVisibile) renderProgressi(document.getElementById("progressi-body"));
}

function init() {
  disegnaIcone();
  initNavigazione();
  aggiornaStreak();
  renderOggi(document.getElementById("oggi-body"));
  initServiceWorker();
  initAssessmentAlPrimoAvvio();

  sync.initSync(ridisegnaDopoSync);
  // Ogni modifica locale fa partire una push in debounce.
  document.addEventListener("dati-cambiati", () => sync.segnalaModifica());
  // Alla chiusura di un overlay si recupera il ridisegno rimandato.
  document.addEventListener("overlay-chiuso", () => sync.renderSeInSospeso());
}

document.addEventListener("DOMContentLoaded", init);
