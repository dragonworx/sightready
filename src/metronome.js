const pulse = {};

class Metronome {
  constructor () {
    this.bpm = 60;
    this.meterNumerator = 4;
    this.meterDenominator = 4;
    this.subdivs = 4;
    this.beatMs = 0;
    this.tempoBeat = 0;
    this.seed = 0;
    this.pulse = 1;
    this.measure = 1;
    this.beat = 1;
    this.isNewBeat = false;
    this.pulses = 4;
    this.expectedNextSysMs = 0;
    this.latency = 0;
    this.timeoutId = null;
    this.listeners = {};
    this.running = false;

    this.onPulse = this.onPulse.bind(this);
  }

  on (eventType, handler) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(handler);
  }
  
  dispatchEvent (eventType, data) {
    const handlers = this.listeners[eventType];
    if (handlers) {
      for (let i = 0; i < handlers.length; i++) {
        handlers[i](data);
      }
    }
  }
  
  init (opts = {}) {
    this.bpm = opts.bpm || this.bpm;
    this.meterNumerator = opts.meterNumerator || this.meterNumerator;
    this.meterDenominator = opts.meterDenominator || this.meterDenominator; 
    this.subdivs = opts.subdivs || this.subdivs;
    this.pulses = this.meterNumerator * this.subdivs;
    this.dispatchEvent('init', {
      bpm: this.bpm,
      meterNumerator: this.meterNumerator,
      meterDenominator: this.meterDenominator,
      subdivs: this.subdivs,
      pulses: this.pulses
    });
  }

  onPulse () {
    if (!this.running) {
      return;
    }

    // figure beat
    const sysMs = Date.now();
    this.latency = sysMs - this.expectedNextSysMs;

    // reuse pulse object to reduce GC
    pulse.pulse = this.pulse;
    pulse.pulses = this.pulses;
    pulse.subdivs = this.subdivs;
    pulse.complete = (this.pulse - 1) / this.pulses;
    pulse.measure = this.measure;
    pulse.beat = ((this.beat - 1) % this.meterNumerator) + 1;
    pulse.beats = this.beat;
    pulse.isNewBeat = this.isNewBeat;

    this.dispatchEvent('pulse', pulse);

    if (this.pulse % this.subdivs === 0) {
      this.beat++;
      this.isNewBeat = true;
    } else {
      this.isNewBeat = false;
    }

    // increment beat
    this.pulse++;
    if (this.pulse === (this.meterNumerator * this.subdivs) + 1) {
      this.pulse = 1;
      this.measure++;
    }

    this.expectedNextSysMs = sysMs + this.tempoBeat;

    // set next pulse
    this.timeoutId = setTimeout(this.onPulse, this.tempoBeat - this.latency);
  }

  start () {
    // how many beats per minute?
    // find duration of one beat in ms
    this.beatMs = (60000 / this.bpm) / this.subdivs;
    this.tempoBeat = this.beatMs * (4 / this.meterDenominator);
    this.seed = Date.now();
    this.pulse = 1;
    this.measure = 1;
    this.beat = 1;
    this.expectedNextSysMs = Date.now() + this.tempoBeat;
    this.running = true;

    this.dispatchEvent('start', {
      beatMs: this.beatMs,
      tempoBeat: this.tempoBeat,
      seed: this.seed
    });

    // start cycle
    this.onPulse();
  }

  stop () {
    this.running = false;
    this.dispatchEvent('stop');
    this.pulse = 1;
    this.measure = 1;
    this.beat = 1;
    this.expectedNextSysMs = 0;
  }

  pause () {
    this.running = false;
    this.dispatchEvent('pause');
  }

  resume () {
    this.running  = true;
    this.expectedNextSysMs = 0;
    this.dispatchEvent('resume');
    this.onPulse();
  }
}

export default Metronome;