// animazioni.js — rendering delle animazioni SVG 2D (fronte + profilo).
// Scheletro: nessuna animazione reale ancora, solo il punto di innesto.

function renderAnimazione(container, esercizioId) {
  container.innerHTML = `
    <div class="animazione-placeholder" data-esercizio="${esercizioId ?? ""}">
      <p class="view-placeholder">Animazione non ancora disponibile per questo esercizio.</p>
    </div>
  `;
}

export { renderAnimazione };
