// Synthesized sound effects using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Pulsing alarm siren — returns a stop function */
export function playAlarmSiren(): () => void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  // Siren sweep via LFO modulating frequency
  osc.type = 'sawtooth';
  osc.frequency.value = 600;
  lfo.type = 'sine';
  lfo.frequency.value = 3; // 3 Hz wobble
  lfoGain.gain.value = 300; // ±300 Hz sweep

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  gain.gain.value = 0.35;
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  lfo.start();

  return () => {
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    setTimeout(() => {
      osc.stop();
      lfo.stop();
    }, 150);
  };
}

/** Explosion boom — deep rumble + noise burst */
export function playExplosion(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Deep sub-bass boom
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(20, now + 1.5);
  oscGain.gain.setValueAtTime(0.6, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 2);

  // Noise burst for crackle/debris
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.3));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.5, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

  // Low-pass filter for rumble
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.exponentialRampToValueAtTime(100, now + 1.5);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);

  // Secondary distorted impact
  const osc2 = ctx.createOscillator();
  const osc2Gain = ctx.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(40, now);
  osc2.frequency.exponentialRampToValueAtTime(10, now + 1);
  osc2Gain.gain.setValueAtTime(0.3, now);
  osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
  osc2.connect(osc2Gain);
  osc2Gain.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 1);
}

/** Single countdown beep — gets more urgent as countdown decreases */
export function playCountdownBeep(remaining: number): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Higher pitch as countdown gets lower
  const freq = 400 + (10 - remaining) * 80;
  osc.type = 'square';
  osc.frequency.value = freq;

  const duration = remaining <= 3 ? 0.15 : 0.08;
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}
