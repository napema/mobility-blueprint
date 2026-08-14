// app.js — entry point: navigazione tra viste, icone, registrazione del
// service worker, wiring verso gli altri moduli.

import { getState } from "./storage.js";
import { icona } from "./icone.js";
import { renderOggi } from "./oggi.js";
import { renderProgressi } from "./progressi.js";
import { renderAssessment } from "./assessment.js";
import { renderSessione, togglePausa, fermaSessione, valutaAvanzamentoSettimana } from "./sessione.js";

const TAB_VIEWS = ["oggi", "progressi", "impostazioni"];

function mostraVistaTab(nome) {
  for (const v of TAB_VIEWS) {
    document.getElementById(`view-${v}`).hidden = v !== nome;
  }
  for (const btn of document.querySelectorAll(".bottom-nav__item")) {
    btn.classList.toggle("is-active", btn.dataset.navTarget === nome);
  }
  if (nome === "oggi") renderOggi(document.getElementById("oggi-body"));
  if (nome === "progressi") renderProgressi(document.getElementById("progressi-body"));
  if (nome === "impostazioni") aggiornaImpostazioni();
  document.querySelector(".app-main").scrollTop = 0;
}

function apriOverlay(nome) {
  document.getElementById(`view-${nome}`).hidden = false;
  if (nome === "assessment") renderAssessment(document.getElementById("assessment-body"));
  if (nome === "sessione") renderSessione(document.getElementById("sessione-body"));
}

function chiudiOverlay(nome) {
  document.getElementById(`view-${nome}`).hidden = true;
  if (nome === "sessione") fermaSessione();
  aggiornaStreak();
  renderOggi(document.getElementById("oggi-body"));
}

function aggiornaStreak() {
  const { streak } = getState();
  const el = document.getElementById("streak-indicator");
  el.innerHTML = `${icona("fiamma", 15, true)}<span>${streak.giorniConsecutivi}</span>`;
  el.hidden = streak.giorniConsecutivi === 0;
}

function aggiornaImpostazioni() {
  const { programma, assessment } = getState();
  const el = document.getElementById("impostazioni-stato");
  if (!el) return;
  const blocco = programma.blocco === 0
    ? "Blocco 0 — settimana 0, apprendimento"
    : `Blocco ${programma.blocco} — settimana ${programma.settimana}`;
  const lato = assessment.esitoTest2.latoLateralizzato;
  el.innerHTML = `${blocco}<br>Lateralizzato: ${lato ? (lato === "dx" ? "destra" : "sinistra") : "non determinato"}`;
}

function disegnaIcone() {
  for (const el of document.querySelectorAll("[data-icona]")) {
    el.innerHTML = icona(el.dataset.icona, 24);
  }
  document.getElementById("btn-chiudi-sessione").innerHTML = icona("chiudi", 20);
  document.getElementById("btn-chiudi-assessment").innerHTML = icona("chiudi", 20);
}

function initNavigazione() {
  for (const btn of document.querySelectorAll(".bottom-nav__item")) {
    btn.addEventListener("click", () => mostraVistaTab(btn.dataset.navTarget));
  }

  document.getElementById("btn-chiudi-sessione")
    .addEventListener("click", () => chiudiOverlay("sessione"));
  document.getElementById("btn-pausa-sessione")
    .addEventListener("click", () => togglePausa());

  document.getElementById("btn-rifai-assessment")
    .addEventListener("click", () => apriOverlay("assessment"));
  document.getElementById("btn-chiudi-assessment")
    .addEventListener("click", () => chiudiOverlay("assessment"));

  // il pulsante "Inizia" vive dentro la scheda di Oggi, che viene ridisegnata
  document.getElementById("oggi-body").addEventListener("click", (e) => {
    if (e.target.closest("#btn-inizia-sessione")) apriOverlay("sessione");
  });

  document.addEventListener("sessione-chiusa", () => chiudiOverlay("sessione"));
}

function initAssessmentAlPrimoAvvio() {
  if (!getState().assessment.completato) apriOverlay("assessment");
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
  disegnaIcone();
  initNavigazione();
  aggiornaStreak();
  valutaAvanzamentoSettimana();
  renderOggi(document.getElementById("oggi-body"));
  initServiceWorker();
  initAssessmentAlPrimoAvvio();
}

document.addEventListener("DOMContentLoaded", init);
