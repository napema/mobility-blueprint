// esercizi.js — catalogo esercizi (dati).
// Scheletro di struttura dati soltanto: nessun esercizio reale ancora.
// I tre binari restano nominalmente distinti qui, anche se in UI RESET+MICRO
// confluiscono in un'unica sessione serale (vedi SPEC §1).

// Forma di un esercizio, a titolo di riferimento:
// {
//   id: "stringa-univoca",
//   nome: "",
//   binario: "reset" | "micro" | "carico",
//   bersagli: [],          // indici/id dei 5 bersagli a cui contribuisce
//   gruppoMuscolare: "",   // per il tracking del volume settimanale
//   lato: "sx" | "dx" | "bilaterale" | null,
//   durataSec: 30,
//   video: null,           // link YouTube esterno, mai iframe
//   note: "",
// }

const CATALOGO = {
  reset: [],
  micro: [],
  carico: [],
};

function getEserciziPerBinario(binario) {
  return CATALOGO[binario] ?? [];
}

export { CATALOGO, getEserciziPerBinario };
