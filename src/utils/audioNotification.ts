/**
 * Web Audio API synthesized notification chimes.
 * Works seamlessly across all modern browsers without external audio asset dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a cheerful, elegant chime for customer actions (Order placed, Table booked).
 * Synthesized three-tone musical chord (C5 -> E5 -> G5).
 */
export function playUserSuccessChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.22 }, // C5
      { freq: 659.25, time: 0.12, dur: 0.25 }, // E5
      { freq: 783.99, time: 0.24, dur: 0.45 }, // G5
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Smooth attack and exponential decay
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(0.25, now + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  } catch (err) {
    console.warn('Audio notification unavailable:', err);
  }
}

/**
 * Play an attention-grabbing executive bell for the Admin Dashboard
 * when a new order or table reservation arrives.
 * Double ding: 880Hz (A5) -> 1046.5Hz (C6) -> 1318.5Hz (E6) with harmonic resonance.
 */
export function playAdminAlertChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 880.00, time: 0.00, dur: 0.28, type: 'triangle' as OscillatorType }, // A5
      { freq: 1108.73, time: 0.16, dur: 0.35, type: 'sine' as OscillatorType },    // C#6
      { freq: 1318.51, time: 0.30, dur: 0.65, type: 'sine' as OscillatorType },    // E6
    ];

    notes.forEach(({ freq, time, dur, type }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(0.35, now + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  } catch (err) {
    console.warn('Admin audio alert error:', err);
  }
}

/**
 * Optional native browser notification trigger if permission is granted.
 */
export function sendDesktopNotification(title: string, options?: NotificationOptions): void {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          icon: '/images/rashoi_hero_cuisine_1794139786997.jpg',
          badge: '/images/rashoi_hero_cuisine_1794139786997.jpg',
          ...options,
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, {
              icon: '/images/rashoi_hero_cuisine_1794139786997.jpg',
              ...options,
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('Desktop notification not supported or blocked:', e);
  }
}
