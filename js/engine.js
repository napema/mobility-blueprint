// engine.js — motore del follow-along: timer, audio, wake lock.
// Opera su una lista di "step" generica, indipendente dal catalogo esercizi,
// così da poter essere testato con dati finti prima che il catalogo esista.

// Forma di uno step, a titolo di riferimento:
// { titolo: "", durataSec: 30 }

class FollowAlongEngine {
  constructor({ onTick, onStepChange, onFine } = {}) {
    this.steps = [];
    this.indiceCorrente = 0;
    this.secondiResidui = 0;
    this.inPausa = true;
    this.intervalId = null;
    this.wakeLock = null;

    this.onTick = onTick ?? (() => {});
    this.onStepChange = onStepChange ?? (() => {});
    this.onFine = onFine ?? (() => {});
  }

  carica(steps) {
    this.ferma();
    this.steps = steps;
    this.indiceCorrente = 0;
    this.secondiResidui = steps[0]?.durataSec ?? 0;
    this.onStepChange(this.stepCorrente(), this.indiceCorrente, this.steps.length);
  }

  stepCorrente() {
    return this.steps[this.indiceCorrente] ?? null;
  }

  async avvia() {
    if (this.steps.length === 0) return;
    this.inPausa = false;
    await this._richiediWakeLock();
    this._tick();
    this.intervalId = setInterval(() => this._tick(), 1000);
  }

  pausa() {
    this.inPausa = true;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this._rilasciaWakeLock();
  }

  ferma() {
    this.pausa();
    this.indiceCorrente = 0;
    this.secondiResidui = 0;
  }

  // Salta al passo successivo senza aspettare il timer (pulsante "Sono pronto").
  avanti() {
    if (this.steps.length === 0) return;
    this._prossimoStep();
  }

  _tick() {
    if (this.inPausa) return;
    this.secondiResidui -= 1;
    this.onTick(this.secondiResidui, this.stepCorrente());

    if (this.secondiResidui <= 0) {
      // Il suono dipende da cosa sta per iniziare: doppio acuto quando parte
      // la tenuta vera (è il segnale di "vai"), singolo quando finisce.
      this._beep(this.stepCorrente()?.beep === "inizio" ? "inizio" : "fine");
      this._prossimoStep();
    }
  }

  _prossimoStep() {
    this.indiceCorrente += 1;
    if (this.indiceCorrente >= this.steps.length) {
      this.pausa();
      this.onFine();
      return;
    }
    this.secondiResidui = this.steps[this.indiceCorrente].durataSec;
    this.onStepChange(this.stepCorrente(), this.indiceCorrente, this.steps.length);
  }

  _beep(tipo = "fine") {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const suona = (frequenza, ritardo, durata) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = frequenza;
        gain.gain.setValueAtTime(0.22, ctx.currentTime + ritardo);
        osc.start(ctx.currentTime + ritardo);
        osc.stop(ctx.currentTime + ritardo + durata);
      };

      if (tipo === "inizio") {
        suona(1180, 0, 0.12);
        suona(1180, 0.18, 0.12);
        setTimeout(() => ctx.close(), 600);
      } else {
        suona(760, 0, 0.18);
        setTimeout(() => ctx.close(), 500);
      }
    } catch {
      // audio non disponibile: il follow-along resta comunque utilizzabile via schermo
    }
  }

  async _richiediWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        this.wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch {
      this.wakeLock = null;
    }
  }

  _rilasciaWakeLock() {
    this.wakeLock?.release?.();
    this.wakeLock = null;
  }
}

export { FollowAlongEngine };
