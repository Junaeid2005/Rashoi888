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

export function getAdminAlertVolume(): number {
  if (typeof window === 'undefined') return 0.9;
  try {
    const saved = localStorage.getItem('rashoi_admin_volume');
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    }
  } catch (e) {}
  return 0.9;
}

export function setAdminAlertVolume(volume: number): void {
  if (typeof window === 'undefined') return;
  try {
    const clamped = Math.max(0, Math.min(1, volume));
    localStorage.setItem('rashoi_admin_volume', clamped.toFixed(2));
  } catch (e) {}
}

/**
 * Play a high-visibility, 5-second continuous executive restaurant alert bell.
 * Designed so staff members and managers can reliably hear incoming orders/bookings.
 * Multi-pulse harmonic chime lasting a full 5.0 seconds with adjustable volume.
 */
export function playAdminAlertChime(volumeOverride?: number): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const currentVolume = volumeOverride !== undefined ? volumeOverride : getAdminAlertVolume();
    if (currentVolume <= 0.01) return; // Muted

    const now = ctx.currentTime;
    // Base loudness scaling factor (boosted for restaurant environment)
    const maxGain = 0.85 * currentVolume;

    // 4 successive bell chime cycles spaced across 5.0 seconds
    const cycles = [0.0, 1.25, 2.50, 3.75];

    cycles.forEach((cycleStart, index) => {
      const isFinal = index === cycles.length - 1;
      const decayDur = isFinal ? 1.25 : 0.85;

      const harmonics = [
        { freq: 880.00, offset: 0.00, dur: decayDur, type: 'triangle' as OscillatorType, gainMult: 0.9 }, // Fundamental A5
        { freq: 1108.73, offset: 0.08, dur: decayDur * 0.9, type: 'sine' as OscillatorType, gainMult: 0.8 }, // C#6
        { freq: 1318.51, offset: 0.16, dur: decayDur, type: 'sine' as OscillatorType, gainMult: 0.85 }, // E6
        { freq: 1760.00, offset: 0.22, dur: decayDur * 0.8, type: 'triangle' as OscillatorType, gainMult: 0.7 }, // A6 sparkle
      ];

      harmonics.forEach(({ freq, offset, dur, type, gainMult }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + cycleStart + offset);

        const targetGain = maxGain * gainMult;
        gain.gain.setValueAtTime(0.001, now + cycleStart + offset);
        gain.gain.linearRampToValueAtTime(targetGain, now + cycleStart + offset + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, now + cycleStart + offset + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + cycleStart + offset);
        osc.stop(now + cycleStart + offset + dur + 0.05);
      });
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
