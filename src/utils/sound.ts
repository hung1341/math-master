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

export function playSound(
  effect: 'correct' | 'wrong' | 'hint' | 'finish' | 'reward',
  enabled: boolean
): void {
  if (!enabled) return;

  try {
    if (effect === 'correct') {
      playTone(587.33, 0.11, 'triangle', 0.07, 0);
      playTone(880, 0.16, 'triangle', 0.08, 0.07);
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
    }
  } catch {
    // Ignore audio context restrictions
  }
}
