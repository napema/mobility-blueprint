// app.js — entry point: navigazione tra viste, registrazione service worker,
// wiring dei punti di innesto verso gli altri moduli.

import { getState } from "./storage.js";
import { renderProgressi } from "./progressi.js";
import { renderAssessment } from "./assessment.js";
import { renderSessione, togglePausa, fermaSessione, valutaAvanzamentoSettimana } from "./sessione.js";

const TAB_VIEWS = ["oggi", "progressi", "impostazioni"];
const OVERLAY_VIEWS = ["sessione", "assessment"];

function mostraVistaTab(nome) {
  for (const v of TAB_VIEWS) {
    document.getElementById(`view-${v}`).hidden = v !== nome;
  }
  for (const btn of document.querySelectorAll(".bottom-nav__item")) {
    btn.classList.toggle("is-active", btn.dataset.navTarget === nome);
  }
  if (nome === "progressi") {
    renderProgressi(document.getElementById("progressi-body"));
  }
}

function apriOverlay(nome) {
  document.getElementById(`view-${nome}`).hidden = false;
  if (nome === "assessment") {
    renderAssessment(document.getElementById("assessment-body"));
  }
  if (nome === "sessione") {
    renderSessione(document.getElementById("sessione-body"));
  }
}

function chiudiOverlay(nome) {
  document.getElementById(`view-${nome}`).hidden = true;
  if (nome === "sessione") {
    fermaSessione();
  }
}

function aggiornaStreak() {
  const { streak } = getState();
  document.getElementById("streak-indicator").textContent = `🔥 ${streak.giorniConsecutivi}`;
}

function initNavigazione() {
  for (const btn of document.querySelectorAll(".bottom-nav__item")) {
    btn.addEventListener("click", () => mostraVistaTab(btn.dataset.navTarget));
  }

  document.getElementById("btn-inizia-sessione")
    .addEventListener("click", () => apriOverlay("sessione"));
  document.getElementById("btn-chiudi-sessione")
    .addEventListener("click", () => chiudiOverlay("sessione"));
  document.getElementById("btn-pausa-sessione")
    .addEventListener("click", () => togglePausa());

  document.getElementById("btn-rifai-assessment")
    .addEventListener("click", () => apriOverlay("assessment"));
  document.getElementById("btn-chiudi-assessment")
    .addEventListener("click", () => chiudiOverlay("assessment"));
}

function initAssessmentAlPrimoAvvio() {
  const { assessment } = getState();
  if (!assessment.completato) {
    apriOverlay("assessment");
  }
}

function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // offline al primo avvio: si riprova al prossimo caricamento
      });
    });
  }
}

function init() {
  initNavigazione();
  aggiornaStreak();
  initServiceWorker();
  initAssessmentAlPrimoAvvio();
  valutaAvanzamentoSettimana();
}

document.addEventListener("DOMContentLoaded", init);
