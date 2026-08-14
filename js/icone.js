// icone.js — icone di linea in stile SF Symbols: tratto 1.75, estremità
// arrotondate, griglia 24. Inline SVG per restare offline e senza
// dipendenze (SPEC §7).

const TRACCIATI = {
  casa: '<path d="M3.5 10.2 12 3.8l8.5 6.4V19a1.5 1.5 0 0 1-1.5 1.5h-3.2v-6H8.2v6H5A1.5 1.5 0 0 1 3.5 19z"/>',
  grafico: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  ingranaggio: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M4.5 12H2.1M21.9 12h-2.4M6.7 6.7 5 5M19 19l-1.7-1.7M6.7 17.3 5 19M19 5l-1.7 1.7"/>',
  play: '<path d="M7.5 4.8 19 12 7.5 19.2z"/>',
  pausa: '<path d="M8.5 4.5v15M15.5 4.5v15"/>',
  chiudi: '<path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5"/>',
  spunta: '<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',
  fiamma: '<path d="M12 21c3.6 0 6-2.4 6-5.7 0-4.4-4.2-5.6-3.3-10.8-2.6.9-4.2 3-4.2 5.1 0 1.4.6 2.3.6 3.2 0 1-.8 1.8-1.7 1.8s-1.5-.7-1.6-1.8C6.7 14 6 14.9 6 16.4 6 18.9 8.6 21 12 21z"/>',
  fotocamera: '<path d="M3.5 8.5h3.2l1.5-2.4h7.6l1.5 2.4h3.2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"/><circle cx="12" cy="14" r="3.4"/>',
  orologio: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7v5.2l3.3 2"/>',
  freccia: '<path d="M9 5.5 15.5 12 9 18.5"/>',
  corpo: '<circle cx="12" cy="4.6" r="2.1"/><path d="M12 8.4v6.2M12 14.6 8.8 21M12 14.6 15.2 21M7.4 10.2 12 9l4.6 1.2"/>',
  calendario: '<rect x="3.2" y="5" width="17.6" height="15.4" rx="2.4"/><path d="M3.2 9.6h17.6M8 3.4v3.2M16 3.4v3.2"/>',
  bersaglio: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2"/>',
  avviso: '<path d="M12 4.2 21 19.6H3z"/><path d="M12 10v3.6M12 16.6v.6"/>',
  onda: '<path d="M2.5 12h3l2.5-6 4 12 3-8 2 2h4.5"/>',
};

function icona(nome, dimensione = 22, riempito = false) {
  const d = TRACCIATI[nome];
  if (!d) return "";
  const stile = riempito
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg class="icona" width="${dimensione}" height="${dimensione}" viewBox="0 0 24 24" ${stile} aria-hidden="true">${d}</svg>`;
}

export { icona };
