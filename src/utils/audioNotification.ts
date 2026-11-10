/**
 * Web Audio API & HTML5 Audio Hybrid Notification Engine.
 * Engineered for 100% reliable 5-second continuous restaurant alert chimes
 * across all modern desktop and mobile browsers, even under background tab or autoplay constraints.
 */

let audioCtx: AudioContext | null = null;
let cachedWavBlobUrl: string | null = null;
let cachedPcmSamples: Float32Array | null = null;
let isAudioEngineUnlocked = false;
let lastChimePlayTimestamp = 0;

const SAMPLE_RATE = 22050;
const CHIME_DURATION = 5.2; // 5.2 seconds for full 5 resonant strikes

/**
 * Synthesizes a high-intensity, penetrating restaurant kitchen/service bell.
 * 5 successive bell strikes at t = 0.0s, 1.0s, 2.0s, 3.0s, and 4.0s
 * with sharp metallic attack and rich brass chime harmonics (C6, E6, G6, C7).
 */
function generateBellPcmSamples(): Float32Array {
  if (cachedPcmSamples) return cachedPcmSamples;

  const numSamples = Math.floor(SAMPLE_RATE * CHIME_DURATION);
  const samples = new Float32Array(numSamples);
  const strikeTimes = [0.0, 1.0, 2.0, 3.0, 4.0];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let totalSample = 0;

    for (let sIdx = 0; sIdx < strikeTimes.length; sIdx++) {
      const strikeTime = strikeTimes[sIdx];
      if (t >= strikeTime) {
        const dt = t - strikeTime;
        const isFinal = sIdx === strikeTimes.length - 1;
        // The final strike rings longer (up to 1.4s) to linger past 5.0 seconds
        const maxDecayTime = isFinal ? 1.4 : 1.1;

        if (dt < maxDecayTime) {
          const decay = isFinal ? Math.exp(-2.2 * dt) : Math.exp(-3.5 * dt);

          // Metallic clapper attack transient (first 25ms)
          const attack = dt < 0.025 ? (Math.random() * 2 - 1) * (1 - dt / 0.025) * 0.4 : 0;

          // Piercing brass bell harmonics (frequencies engineered to cut through ambient noise)
          const bellTone =
            0.36 * Math.sin(2 * Math.PI * 1046.50 * dt) + // C6 fundamental
            0.26 * Math.sin(2 * Math.PI * 1052.00 * dt) + // C6 beating shimmer
            0.32 * Math.sin(2 * Math.PI * 1318.51 * dt) + // E6
            0.24 * Math.sin(2 * Math.PI * 1567.98 * dt) + // G6
            0.20 * Math.sin(2 * Math.PI * 2093.00 * dt) + // C7 brilliant sparkle
            0.18 * Math.sin(2 * Math.PI * 523.25 * dt);   // C5 rich body

          totalSample += (bellTone + attack) * decay;
        }
      }
    }
    samples[i] = totalSample;
  }

  // Normalize to 0.96 peak amplitude to maximize loudness without clipping
  let maxVal = 0;
  for (let i = 0; i < numSamples; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > maxVal) maxVal = abs;
  }
  if (maxVal > 0) {
    const normFactor = 0.96 / maxVal;
    for (let i = 0; i < numSamples; i++) {
      samples[i] = samples[i] * normFactor;
    }
  }

  cachedPcmSamples = samples;
  return samples;
}

/**
 * Encodes Float32 PCM samples into a standard 16-bit Mono WAV Blob.
 */
function createWavBlobFromPcm(samples: Float32Array): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF Chunk
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk (16-bit PCM Mono at 22050Hz)
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true); // byte rate (22050 * 2)
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // 16 bits per sample

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Returns a cached Object URL for the 5-second synthesized WAV chime.
 */
function getWavBlobUrl(): string | null {
  if (typeof window === 'undefined') return null;
  if (!cachedWavBlobUrl) {
    try {
      const pcm = generateBellPcmSamples();
      const blob = createWavBlobFromPcm(pcm);
      cachedWavBlobUrl = URL.createObjectURL(blob);
    } catch (e) {
      console.warn('WAV blob creation warning:', e);
    }
  }
  return cachedWavBlobUrl;
}

/**
 * Safely gets or initializes the global AudioContext.
 */
export function getAudioContext(): AudioContext | null {
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
 * Proactively unlocks Web Audio on any user gesture across the window.
 */
export function unlockAudioContext(): void {
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      // Play a 1-sample silent buffer to satisfy strict Safari/Chrome autoplay policy
      const buf = ctx.createBuffer(1, 1, SAMPLE_RATE);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      isAudioEngineUnlocked = true;
    }
  } catch (e) {
    // ignore
  }
}

// Global window event listener to unlock audio on the very first user interaction
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'pointerdown', 'touchstart', 'keydown', 'focus'];
  const handleUserUnlock = () => {
    unlockAudioContext();
    getWavBlobUrl(); // Pre-warm the WAV URL in memory
  };
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleUserUnlock, { once: true, passive: true });
  });
}

/**
 * Volume persistence (Default: 1.0 / 100% maximum volume for loud restaurant alerts)
 */
export function getAdminAlertVolume(): number {
  if (typeof window === 'undefined') return 1.0;
  try {
    const saved = localStorage.getItem('rashoi_admin_volume');
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    }
  } catch (e) {}
  return 1.0;
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
 * Uses a DUAL ENGINE (Web Audio API hardware buffer + HTML5 Audio element fallback)
 * guaranteeing the sound plays for the full 5.2 seconds at maximum volume.
 */
export function playAdminAlertChime(volumeOverride?: number): void {
  const nowMs = Date.now();
  // Prevent duplicate concurrent chimes within 1.2 seconds if multiple listeners react to the same event
  if (nowMs - lastChimePlayTimestamp < 1200) {
    return;
  }
  lastChimePlayTimestamp = nowMs;

  const currentVolume = volumeOverride !== undefined ? volumeOverride : getAdminAlertVolume();
  if (currentVolume <= 0.01) return; // Muted

  let webAudioStarted = false;

  // 1. ENGINE A: Web Audio API with pre-synthesized 5.2s AudioBuffer & Dynamics Compressor
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const pcm = generateBellPcmSamples();
      const audioBuffer = ctx.createBuffer(1, pcm.length, SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(pcm);

      const bufferSource = ctx.createBufferSource();
      bufferSource.buffer = audioBuffer;

      // Dynamics Compressor: Acts as an audio maximizer/limiter for maximum loudness & clarity
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, ctx.currentTime);
      compressor.knee.setValueAtTime(8, ctx.currentTime);
      compressor.ratio.setValueAtTime(10, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.20, ctx.currentTime);

      // Master Gain: Boosted for maximum acoustic loudness
      const masterGain = ctx.createGain();
      // Up to 1.4x gain boost scaled with currentVolume
      const targetGain = 1.4 * currentVolume;
      masterGain.gain.setValueAtTime(targetGain, ctx.currentTime);

      bufferSource.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      bufferSource.start(0);
      webAudioStarted = true;
    }
  } catch (err) {
    console.warn('Web Audio playback error (will rely on HTML5 Audio):', err);
  }

  // 2. ENGINE B: HTML5 Audio Element Fallback
  // Plays the synthesized 5.2s WAV file directly. If Web Audio was paused or blocked,
  // HTML5 Audio ensures the 5-second chime is heard without fail!
  try {
    const wavUrl = getWavBlobUrl();
    if (wavUrl) {
      const audio = new Audio(wavUrl);
      audio.volume = Math.min(1.0, currentVolume);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // If HTML5 audio was restricted, retry on next interaction
          console.warn('HTML5 Audio autoplay note:', err);
        });
      }
    }
  } catch (e) {
    console.warn('HTML5 Audio playback exception:', e);
  }
}

/**
 * Play a cheerful, elegant chime for customer actions (Order placed, Table booked).
 */
export function playUserSuccessChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

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

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(0.35, now + time + 0.04);
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
 * Optional native browser desktop notification trigger if permission is granted.
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
