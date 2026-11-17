let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  durationSeconds: number,
  type: OscillatorType = 'sine',
  gainValue = 0.08,
  delaySeconds = 0
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + delaySeconds;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationSeconds + 0.02);
}

export type SoundEffect =
  | 'correct'
  | 'wrong'
  | 'hint'
  | 'finish'
  | 'reward'
  | 'bomb'
  | 'laser'
  | 'fly'
  | 'blink'
  | 'dodge'
  | 'boss_meteor'
  | 'boss_laser'
  | 'boss_thunder'
  | 'boss_slash'
  | 'whistle';

export function playSound(effect: SoundEffect, enabled: boolean): void {
  if (!enabled) return;

  try {
    if (effect === 'correct') {
      playTone(587.33, 0.11, 'triangle', 0.07, 0);
      playTone(880, 0.16, 'triangle', 0.08, 0.07);
    } else if (effect === 'bomb') {
      playTone(180, 0.14, 'sawtooth', 0.08, 0);
      playTone(95, 0.28, 'sawtooth', 0.09, 0.12);
      playTone(62, 0.34, 'triangle', 0.1, 0.2);
    } else if (effect === 'laser') {
      playTone(1320, 0.09, 'sawtooth', 0.06, 0);
      playTone(980, 0.12, 'sawtooth', 0.06, 0.06);
      playTone(660, 0.18, 'sine', 0.07, 0.12);
    } else if (effect === 'fly') {
      playTone(392, 0.1, 'sine', 0.06, 0);
      playTone(523.25, 0.12, 'sine', 0.06, 0.07);
      playTone(783.99, 0.18, 'triangle', 0.07, 0.14);
    } else if (effect === 'blink') {
      // Flash teleport whoosh + heavy melee sword slash + return blink
      playTone(920, 0.07, 'sine', 0.06, 0);
      playTone(1480, 0.09, 'triangle', 0.05, 0.04);
      playTone(320, 0.11, 'sawtooth', 0.08, 0.18);
      playTone(165, 0.18, 'triangle', 0.09, 0.21);
      playTone(1180, 0.08, 'sine', 0.04, 0.48);
    } else if (effect === 'dodge') {
      playTone(620, 0.09, 'sine', 0.06, 0);
      playTone(880, 0.13, 'sine', 0.06, 0.06);
    } else if (effect === 'boss_meteor') {
      playTone(220, 0.16, 'sawtooth', 0.07, 0);
      playTone(110, 0.32, 'sawtooth', 0.09, 0.12);
      playTone(55, 0.38, 'triangle', 0.09, 0.24);
    } else if (effect === 'boss_laser') {
      playTone(440, 0.12, 'sawtooth', 0.07, 0);
      playTone(290, 0.2, 'sawtooth', 0.07, 0.08);
    } else if (effect === 'boss_thunder') {
      playTone(920, 0.08, 'square', 0.06, 0);
      playTone(210, 0.26, 'sawtooth', 0.08, 0.06);
      playTone(115, 0.28, 'triangle', 0.08, 0.16);
    } else if (effect === 'boss_slash') {
      playTone(340, 0.09, 'sawtooth', 0.07, 0);
      playTone(185, 0.18, 'triangle', 0.08, 0.06);
    } else if (effect === 'wrong') {
      playTone(260, 0.14, 'sine', 0.06, 0);
      playTone(205, 0.18, 'sine', 0.06, 0.09);
    } else if (effect === 'hint') {
      playTone(523.25, 0.12, 'sine', 0.06, 0);
      playTone(659.25, 0.14, 'sine', 0.06, 0.08);
    } else if (effect === 'reward') {
      playTone(523.25, 0.12, 'triangle', 0.07, 0);
      playTone(659.25, 0.12, 'triangle', 0.07, 0.08);
      playTone(783.99, 0.18, 'triangle', 0.08, 0.16);
    } else if (effect === 'finish') {
      playTone(523.25, 0.12, 'triangle', 0.07, 0);
      playTone(659.25, 0.12, 'triangle', 0.07, 0.1);
      playTone(783.99, 0.14, 'triangle', 0.07, 0.2);
      playTone(1046.5, 0.28, 'triangle', 0.08, 0.3);
    } else if (effect === 'whistle') {
      const ctx = getAudioContext();
      if (ctx) {
        const playBlast = (offset: number, dur: number) => {
          const start = ctx.currentTime + offset;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          const master = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(2680, start);
          osc2.frequency.setValueAtTime(2765, start);

          // Pea-whistle trill modulation
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(36, start);
          lfoGain.gain.setValueAtTime(110, start);
          lfo.connect(lfoGain);
          lfoGain.connect(osc1.frequency);

          master.gain.setValueAtTime(0.0001, start);
          master.gain.exponentialRampToValueAtTime(0.055, start + 0.025);
          master.gain.setValueAtTime(0.05, start + dur - 0.05);
          master.gain.exponentialRampToValueAtTime(0.0001, start + dur);

          osc1.connect(master);
          osc2.connect(master);
          master.connect(ctx.destination);

          osc1.start(start);
          osc2.start(start);
          lfo.start(start);
          osc1.stop(start + dur + 0.02);
          osc2.stop(start + dur + 0.02);
          lfo.stop(start + dur + 0.02);
        };
        playBlast(0, 0.14);
        playBlast(0.18, 0.36);
      }
    }
  } catch {
    // Ignore audio context restrictions
  }
}

// --- Ambient Lobby Soundscape (Gentle Wind + Occasional Birdsong) ---
interface AmbientState {
  active: boolean;
  desired: boolean;
  masterGain: GainNode | null;
  windSource: AudioBufferSourceNode | null;
  lfoOsc: OscillatorNode | null;
  birdTimer: number | null;
  unlockBound: boolean;
}

const ambient: AmbientState = {
  active: false,
  desired: false,
  masterGain: null,
  windSource: null,
  lfoOsc: null,
  birdTimer: null,
  unlockBound: false,
};

function createWindNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 3;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Soft brown-filtered noise with seamless loop fade at boundaries
  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.025 * white) / 1.025;
    data[i] = lastOut * 2.4;
  }

  const fadeSamples = Math.floor(sampleRate * 0.15);
  for (let i = 0; i < fadeSamples; i++) {
    const t = i / fadeSamples;
    const blended = data[i] * t + data[length - fadeSamples + i] * (1 - t);
    data[i] = blended;
    data[length - fadeSamples + i] = blended;
  }

  return buffer;
}

function playBirdChirp(ctx: AudioContext, dest: AudioNode): void {
  if (ctx.state !== 'running') return;
  const baseTime = ctx.currentTime;
  const notesCount = 2 + Math.floor(Math.random() * 3);
  const baseFreq = 2200 + Math.random() * 950;

  for (let i = 0; i < notesCount; i++) {
    const t = baseTime + i * (0.095 + Math.random() * 0.045);
    const dur = 0.07 + Math.random() * 0.04;
    const fStart = baseFreq * (0.92 + Math.random() * 0.2);
    const fEnd = fStart * (1.14 + Math.random() * 0.16);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(fStart, t);
    osc.frequency.exponentialRampToValueAtTime(fEnd, t + dur * 0.75);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.022, t + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
}

function scheduleNextBird(): void {
  if (!ambient.active || typeof window === 'undefined') return;
  if (ambient.birdTimer !== null) {
    window.clearTimeout(ambient.birdTimer);
  }
  const delayMs = 2800 + Math.random() * 3800;
  ambient.birdTimer = window.setTimeout(() => {
    if (!ambient.active || !ambient.masterGain || !audioCtx) return;
    if (typeof document === 'undefined' || document.visibilityState === 'visible') {
      try {
        playBirdChirp(audioCtx, ambient.masterGain);
      } catch {
        // Ignore transient Web Audio scheduling errors
      }
    }
    scheduleNextBird();
  }, delayMs);
}

function startAmbientNodes(): void {
  if (ambient.active) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.9);
    masterGain.connect(ctx.destination);

    // Gentle wind layer
    const windBuffer = createWindNoiseBuffer(ctx);
    const windSource = ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(340, ctx.currentTime);
    windFilter.Q.setValueAtTime(1.35, ctx.currentTime);

    const lfoOsc = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfoOsc.type = 'sine';
    lfoOsc.frequency.setValueAtTime(0.14, ctx.currentTime);
    lfoGain.gain.setValueAtTime(135, ctx.currentTime);
    lfoOsc.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.045, ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);

    windSource.start();
    lfoOsc.start();

    ambient.active = true;
    ambient.masterGain = masterGain;
    ambient.windSource = windSource;
    ambient.lfoOsc = lfoOsc;

    scheduleNextBird();
  } catch {
    ambient.active = false;
  }
}

function stopAmbientNodes(): void {
  if (ambient.birdTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(ambient.birdTimer);
    ambient.birdTimer = null;
  }
  if (!ambient.active) return;

  const ctx = audioCtx;
  const master = ambient.masterGain;
  const wind = ambient.windSource;
  const lfo = ambient.lfoOsc;

  ambient.active = false;
  ambient.masterGain = null;
  ambient.windSource = null;
  ambient.lfoOsc = null;

  try {
    if (ctx && master) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.0001, now + 0.35);
      window.setTimeout(() => {
        try {
          wind?.stop();
          lfo?.stop();
          master.disconnect();
        } catch {
          // Already stopped
        }
      }, 400);
    } else {
      wind?.stop();
      lfo?.stop();
    }
  } catch {
    // Ignore cleanup errors
  }
}

function ensureGestureUnlock(): void {
  if (ambient.unlockBound || typeof window === 'undefined') return;
  ambient.unlockBound = true;

  const handleGesture = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (ambient.desired && !ambient.active) {
      startAmbientNodes();
    }
    if (music.mode !== 'off' && !music.running) {
      startMusicLoop();
    }
  };

  window.addEventListener('pointerdown', handleGesture, { passive: true });
  window.addEventListener('keydown', handleGesture, { passive: true });
}

export function setAmbientSound(enabled: boolean): void {
  ambient.desired = enabled;
  if (typeof window === 'undefined') return;

  if (enabled) {
    ensureGestureUnlock();
    startAmbientNodes();
  } else {
    stopAmbientNodes();
  }
}

// --- Upbeat Arena & Festival Music Sequencer (Web Audio Lookahead) ---
export type MusicMode = 'off' | 'lobby' | 'battle';

interface MusicState {
  mode: MusicMode;
  running: boolean;
  masterGain: GainNode | null;
  noiseBuffer: AudioBuffer | null;
  timer: number | null;
  nextStepTime: number;
  step: number;
}

const music: MusicState = {
  mode: 'off',
  running: false,
  masterGain: null,
  noiseBuffer: null,
  timer: null,
  nextStepTime: 0,
  step: 0,
};

function getPercussionNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (music.noiseBuffer && music.noiseBuffer.sampleRate === ctx.sampleRate) {
    return music.noiseBuffer;
  }
  const len = Math.floor(ctx.sampleRate * 0.25);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    ch[i] = Math.random() * 2 - 1;
  }
  music.noiseBuffer = buf;
  return buf;
}

function triggerKick(ctx: AudioContext, dest: AudioNode, time: number, level = 0.24): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(145, time);
  osc.frequency.exponentialRampToValueAtTime(48, time + 0.14);

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.exponentialRampToValueAtTime(level, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.2);
}

function triggerSnare(ctx: AudioContext, dest: AudioNode, time: number, level = 0.09): void {
  const noise = ctx.createBufferSource();
  noise.buffer = getPercussionNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1100, time);
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(level, time);
  nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

  noise.connect(filter);
  filter.connect(nGain);
  nGain.connect(dest);
  noise.start(time);
  noise.stop(time + 0.12);

  const bodyOsc = ctx.createOscillator();
  const bGain = ctx.createGain();
  bodyOsc.type = 'triangle';
  bodyOsc.frequency.setValueAtTime(220, time);
  bodyOsc.frequency.exponentialRampToValueAtTime(115, time + 0.07);
  bGain.gain.setValueAtTime(level * 0.8, time);
  bGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

  bodyOsc.connect(bGain);
  bGain.connect(dest);
  bodyOsc.start(time);
  bodyOsc.stop(time + 0.09);
}

function triggerHat(ctx: AudioContext, dest: AudioNode, time: number, level = 0.032): void {
  const noise = ctx.createBufferSource();
  noise.buffer = getPercussionNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(6200, time);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(level, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  noise.start(time);
  noise.stop(time + 0.05);
}

function triggerSynthNote(
  ctx: AudioContext,
  dest: AudioNode,
  time: number,
  freq: number,
  dur: number,
  type: OscillatorType,
  level: number
): void {
  if (freq <= 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);

  gain.gain.setValueAtTime(0.0005, time);
  gain.gain.exponentialRampToValueAtTime(level, time + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0005, time + dur);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

// Upbeat 16-step patterns (16th notes)
const LOBBY_MELODY = [
  523.25, 0, 659.25, 587.33, 523.25, 0, 783.99, 659.25,
  880.0, 0, 783.99, 659.25, 587.33, 659.25, 783.99, 0,
];
const LOBBY_BASS = [
  130.81, 0, 130.81, 0, 196.0, 0, 196.0, 0,
  174.61, 0, 174.61, 0, 196.0, 0, 196.0, 146.83,
];

const BATTLE_MELODY = [
  587.33, 0, 698.46, 880.0, 783.99, 0, 698.46, 587.33,
  659.25, 783.99, 880.0, 0, 1046.5, 880.0, 783.99, 698.46,
];
const BATTLE_BASS = [
  146.83, 146.83, 0, 146.83, 174.61, 174.61, 0, 174.61,
  196.0, 196.0, 0, 196.0, 220.0, 196.0, 174.61, 164.81,
];

function scheduleMusicStep(ctx: AudioContext, dest: AudioNode, time: number, stepIdx: number): void {
  const isBattle = music.mode === 'battle';
  const s = stepIdx % 16;

  // Energetic Taiko & Festival Drums
  if (s === 0 || s === 8 || (isBattle && (s === 6 || s === 14)) || (!isBattle && s === 10)) {
    triggerKick(ctx, dest, time, isBattle ? 0.24 : 0.2);
  }
  if (s === 4 || s === 12 || (isBattle && s === 15)) {
    triggerSnare(ctx, dest, time, isBattle ? 0.085 : 0.065);
  }
  if (s % 2 === 1 || isBattle) {
    triggerHat(ctx, dest, time, s % 2 === 0 ? 0.02 : 0.032);
  }

  // Bouncy bass & upbeat lead melody
  const bassFreq = isBattle ? BATTLE_BASS[s] : LOBBY_BASS[s];
  if (bassFreq > 0) {
    triggerSynthNote(ctx, dest, time, bassFreq, isBattle ? 0.14 : 0.19, 'triangle', 0.11);
  }

  const leadFreq = isBattle ? BATTLE_MELODY[s] : LOBBY_MELODY[s];
  if (leadFreq > 0) {
    triggerSynthNote(
      ctx,
      dest,
      time,
      leadFreq,
      isBattle ? 0.16 : 0.21,
      isBattle ? 'triangle' : 'sine',
      isBattle ? 0.068 : 0.06
    );
  }
}

function startMusicLoop(): void {
  if (music.running || music.mode === 'off') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 0.5);
    masterGain.connect(ctx.destination);

    music.masterGain = masterGain;
    music.running = true;
    music.step = 0;
    music.nextStepTime = ctx.currentTime + 0.05;

    music.timer = window.setInterval(() => {
      if (!music.running || !music.masterGain || !audioCtx) return;
      if (audioCtx.state !== 'running') {
        music.nextStepTime = audioCtx.currentTime + 0.05;
        return;
      }
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        music.nextStepTime = audioCtx.currentTime + 0.05;
        return;
      }

      const bpm = music.mode === 'battle' ? 136 : 120;
      const stepDuration = 60 / bpm / 4; // 16th note

      while (music.nextStepTime < audioCtx.currentTime + 0.15) {
        scheduleMusicStep(audioCtx, music.masterGain, music.nextStepTime, music.step);
        music.nextStepTime += stepDuration;
        music.step = (music.step + 1) % 16;
      }
    }, 50);
  } catch {
    music.running = false;
  }
}

function stopMusicLoop(): void {
  if (music.timer !== null && typeof window !== 'undefined') {
    window.clearInterval(music.timer);
    music.timer = null;
  }
  if (!music.running) return;

  const ctx = audioCtx;
  const master = music.masterGain;
  music.running = false;
  music.masterGain = null;

  try {
    if (ctx && master) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.0001, now + 0.25);
      window.setTimeout(() => {
        try {
          master.disconnect();
        } catch {
          // Already disconnected
        }
      }, 300);
    }
  } catch {
    // Ignore cleanup errors
  }
}

export function setMusicMode(mode: MusicMode): void {
  music.mode = mode;
  if (typeof window === 'undefined') return;

  if (mode === 'off') {
    stopMusicLoop();
  } else {
    ensureGestureUnlock();
    if (!music.running) {
      startMusicLoop();
    }
  }
}
