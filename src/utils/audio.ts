// Web Audio API based sound synthesizer for suspenseful reveals, grand ceremony BGM, and crowd cheers
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundManager = {
  muted: false,

  toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem('vibe_sound_muted', String(this.muted));
    } catch {
      // ignore
    }
    if (this.muted) {
      this.stopCeremonyBgm();
      this.stopSuspenseDrumroll();
      this.stopCrowdApplause();
    }
    return this.muted;
  },

  isMuted(): boolean {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vibe_sound_muted');
        if (stored !== null) {
          this.muted = stored === 'true';
        }
      } catch {
        // ignore
      }
    }
    return this.muted;
  },

  playClick() {
    if (this.muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  },

  playSelect() {
    if (this.muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  },

  playVoteSuccess() {
    if (this.muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  },

  // =========================================================
  // 1. 시상식 웅장한 오케스트라 앰비언트 BGM (Ceremony Grand Ambient BGM)
  // =========================================================
  ceremonyBgmNodes: [] as { stop: (when?: number) => void }[],
  ceremonyBgmLoopTimer: null as NodeJS.Timeout | null,
  isCeremonyBgmPlaying: false,

  startCeremonyBgm() {
    if (this.muted || this.isCeremonyBgmPlaying) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    this.isCeremonyBgmPlaying = true;
    this.scheduleCeremonyBgmProgression(ctx);
  },

  scheduleCeremonyBgmProgression(ctx: AudioContext) {
    if (!this.isCeremonyBgmPlaying || this.muted) return;

    const now = ctx.currentTime;
    const chordDuration = 4.0; // 4초마다 웅장한 영화 시상식 코드 진행 (D minor -> Bb -> C -> D)
    const chords = [
      [146.83, 220.00, 261.63, 349.23, 440.00], // Dm9
      [116.54, 174.61, 233.08, 293.66, 349.23], // Bbmaj7
      [130.81, 196.00, 261.63, 329.63, 392.00], // C add9
      [146.83, 220.00, 293.66, 369.99, 440.00], // D major (Triumphant)
    ];

    const masterBgmGain = ctx.createGain();
    masterBgmGain.gain.setValueAtTime(0.08, now);
    masterBgmGain.connect(ctx.destination);

    chords.forEach((chord, chordIdx) => {
      const chordStart = now + chordIdx * chordDuration;

      // Low cello / bass fundamental
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(chord[0] / 2, chordStart);

      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(220, chordStart);

      bassGain.gain.setValueAtTime(0.01, chordStart);
      bassGain.gain.linearRampToValueAtTime(0.12, chordStart + 1.2);
      bassGain.gain.setValueAtTime(0.12, chordStart + chordDuration - 0.8);
      bassGain.gain.linearRampToValueAtTime(0.01, chordStart + chordDuration);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(masterBgmGain);
      bassOsc.start(chordStart);
      bassOsc.stop(chordStart + chordDuration);
      this.ceremonyBgmNodes.push(bassOsc);

      // Lush string orchestra pad
      chord.forEach((freq, noteIdx) => {
        const strOsc = ctx.createOscillator();
        const strGain = ctx.createGain();
        strOsc.type = noteIdx % 2 === 0 ? 'sawtooth' : 'triangle';
        strOsc.frequency.setValueAtTime(freq, chordStart);

        const strFilter = ctx.createBiquadFilter();
        strFilter.type = 'lowpass';
        strFilter.frequency.setValueAtTime(850 + noteIdx * 100, chordStart);

        strGain.gain.setValueAtTime(0.001, chordStart);
        strGain.gain.linearRampToValueAtTime(0.045, chordStart + 1.5);
        strGain.gain.setValueAtTime(0.045, chordStart + chordDuration - 1.0);
        strGain.gain.linearRampToValueAtTime(0.001, chordStart + chordDuration);

        strOsc.connect(strFilter);
        strFilter.connect(strGain);
        strGain.connect(masterBgmGain);
        strOsc.start(chordStart);
        strOsc.stop(chordStart + chordDuration);
        this.ceremonyBgmNodes.push(strOsc);
      });
    });

    // Loop cycle
    const totalCycleSec = chordDuration * chords.length;
    this.ceremonyBgmLoopTimer = setTimeout(() => {
      if (this.isCeremonyBgmPlaying) {
        this.scheduleCeremonyBgmProgression(ctx);
      }
    }, totalCycleSec * 1000 - 150);
  },

  stopCeremonyBgm() {
    this.isCeremonyBgmPlaying = false;
    if (this.ceremonyBgmLoopTimer) {
      clearTimeout(this.ceremonyBgmLoopTimer);
      this.ceremonyBgmLoopTimer = null;
    }
    this.ceremonyBgmNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // ignore
      }
    });
    this.ceremonyBgmNodes = [];
  },

  // =========================================================
  // 2. 긴장감 극대화 대형 심포닉 팀파니 & 스네어 드럼롤 (웅장한 두구두구)
  // =========================================================
  activeSuspenseOscs: [] as { stop: (when?: number) => void }[],

  stopSuspenseDrumroll() {
    this.activeSuspenseOscs.forEach((node) => {
      try {
        node.stop();
      } catch {
        // ignore
      }
    });
    this.activeSuspenseOscs = [];
  },

  playSuspenseDrumroll(durationMs = 5000) {
    if (this.muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    this.stopSuspenseDrumroll();

    const now = ctx.currentTime;
    const durSec = durationMs / 1000;

    // 1. Reusable White Noise Buffer for crisp snare rattle
    const bufferSize = Math.floor(ctx.sampleRate * 0.15);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // 2. Massive Timpani / Sub-bass cinematic tension swell
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(45, now);
    subOsc.frequency.exponentialRampToValueAtTime(95, now + durSec);

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(100, now);
    subFilter.frequency.linearRampToValueAtTime(320, now + durSec);

    subGain.gain.setValueAtTime(0.06, now);
    subGain.gain.linearRampToValueAtTime(0.35, now + durSec * 0.92);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + durSec);
    this.activeSuspenseOscs.push(subOsc);

    // 3. Timpani Tremolo & Heavy Concert Snare strikes accelerating into a frenzy roll
    let curTime = now + 0.05;
    let step = 0;
    const maxSteps = 150;

    while (curTime < now + durSec - 0.12 && step < maxSteps) {
      const progress = (curTime - now) / durSec; // 0.0 -> 1.0
      const volume = 0.08 + progress * 0.38;

      // Concert Snare noise strike
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const snareFilter = ctx.createBiquadFilter();
      snareFilter.type = 'bandpass';
      snareFilter.frequency.setValueAtTime(1600 + progress * 1400, curTime);
      snareFilter.Q.value = 1.3;

      const snareGain = ctx.createGain();
      snareGain.gain.setValueAtTime(volume * 0.85, curTime);
      snareGain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.048);

      noiseSource.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(ctx.destination);
      noiseSource.start(curTime);
      noiseSource.stop(curTime + 0.05);

      // Deep Orchestral Timpani body punch
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();
      drumOsc.type = step % 2 === 0 ? 'triangle' : 'sine';
      const basePitch = step % 2 === 0 ? 160 : 140;
      drumOsc.frequency.setValueAtTime(basePitch + progress * 70, curTime);
      drumOsc.frequency.exponentialRampToValueAtTime(55, curTime + 0.045);

      drumGain.gain.setValueAtTime(volume * 1.0, curTime);
      drumGain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.045);

      drumOsc.connect(drumGain);
      drumGain.connect(ctx.destination);
      drumOsc.start(curTime);
      drumOsc.stop(curTime + 0.05);
      this.activeSuspenseOscs.push(drumOsc);

      // Heartbeat Bass boom accents every 4 beats
      if (step % 4 === 0) {
        const bassBoom = ctx.createOscillator();
        const boomGain = ctx.createGain();
        bassBoom.type = 'sine';
        bassBoom.frequency.setValueAtTime(120, curTime);
        bassBoom.frequency.exponentialRampToValueAtTime(38, curTime + 0.14);

        boomGain.gain.setValueAtTime(0.28 + progress * 0.25, curTime);
        boomGain.gain.exponentialRampToValueAtTime(0.001, curTime + 0.14);

        bassBoom.connect(boomGain);
        boomGain.connect(ctx.destination);
        bassBoom.start(curTime);
        bassBoom.stop(curTime + 0.15);
        this.activeSuspenseOscs.push(bassBoom);
      }

      // Acceleration: starts around 140ms down to rapid 24ms roll
      const interval = Math.max(0.024, 0.14 * Math.pow(1 - progress, 1.7) + 0.024);
      curTime += interval;
      step++;
    }
  },

  // =========================================================
  // 3. 시상식 관객 박수소리 & 사람들의 열광적인 축하 환호소리 (Crisp Audience Applause & Cheering Crowd)
  // =========================================================
  activeApplauseNodes: [] as { stop: (when?: number) => void }[],

  stopCrowdApplause() {
    this.activeApplauseNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // ignore
      }
    });
    this.activeApplauseNodes = [];
  },

  playCrowdApplause(durationSec = 5.5) {
    if (this.muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.stopCrowdApplause();

    const now = ctx.currentTime;
    const sampleRate = ctx.sampleRate;
    const totalSamples = Math.floor(sampleRate * durationSec);

    // -------------------------------------------------------------
    // 1. Pure Natural Handclapping Engine (맑고 선명한 실제 손뼉 박수 소리)
    // -------------------------------------------------------------
    const clapBuffer = ctx.createBuffer(2, totalSamples, sampleRate);
    const left = clapBuffer.getChannelData(0);
    const right = clapBuffer.getChannelData(1);

    // Scatter ~380 individual realistic handclaps across stereo field
    const totalClaps = Math.floor(durationSec * 75);
    for (let c = 0; c < totalClaps; c++) {
      const t = Math.min(
        durationSec - 0.1,
        0.05 + Math.pow(Math.random(), 0.72) * (durationSec - 0.2)
      );
      const startSample = Math.floor(t * sampleRate);

      // Real handclap lasts ~16-25ms
      const clapLen = Math.floor(sampleRate * (0.016 + Math.random() * 0.01));
      const pan = 0.2 + Math.random() * 0.6; // Stereo panning
      const baseAmp = 0.5 + Math.random() * 0.45;
      
      // Smooth fade towards the end
      const fadeAmp = t > durationSec * 0.65 
        ? Math.max(0.05, 1 - (t - durationSec * 0.65) / (durationSec * 0.35)) 
        : 1.0;
      const amp = baseAmp * fadeAmp;

      // Realistic micro double-tap (fingers slap 2-4ms before palm)
      const flamDelay = Math.floor(sampleRate * (0.002 + Math.random() * 0.0025));
      const palmFreq = 500 + Math.random() * 260;

      for (let s = 0; s < clapLen && startSample + s < totalSamples; s++) {
        const decay = Math.exp(- (s / clapLen) * 9.5);
        const noise = (Math.random() * 2 - 1) * 0.7;
        const pop = Math.sin(2 * Math.PI * palmFreq * (s / sampleRate)) * 0.3;
        
        let flamNoise = 0;
        if (s >= flamDelay) {
          const flamDecay = Math.exp(- ((s - flamDelay) / clapLen) * 11);
          flamNoise = (Math.random() * 2 - 1) * 0.5 * flamDecay;
        }

        const sampleVal = (noise + pop + flamNoise) * decay * amp;
        left[startSample + s] += sampleVal * (1 - pan);
        right[startSample + s] += sampleVal * pan;
      }
    }

    const clapSource = ctx.createBufferSource();
    clapSource.buffer = clapBuffer;

    // Filter to warm natural acoustic theater frequencies for handclapping (1600Hz bandpass)
    const clapFilter = ctx.createBiquadFilter();
    clapFilter.type = 'bandpass';
    clapFilter.frequency.setValueAtTime(1650, now);
    clapFilter.Q.setValueAtTime(0.8, now);

    const clapGain = ctx.createGain();
    clapGain.gain.setValueAtTime(0.01, now);
    clapGain.gain.linearRampToValueAtTime(0.48, now + 0.15); // gentle swell
    clapGain.gain.setValueAtTime(0.48, now + durationSec - 1.0);
    clapGain.gain.linearRampToValueAtTime(0.001, now + durationSec); // smooth fadeout

    clapSource.connect(clapFilter);
    clapFilter.connect(clapGain);
    clapGain.connect(ctx.destination);
    clapSource.start(now);
    clapSource.stop(now + durationSec);
    this.activeApplauseNodes.push(clapSource);

    // -------------------------------------------------------------
    // 2. Joyful Celebration Sparkle Chimes (영롱하고 따뜻한 축하 차임벨 아르페지오)
    // -------------------------------------------------------------
    // 2. Joyful Celebration Sparkle Chimes (영롱하고 따뜻한 축하 차임벨 아르페지오)
    // -------------------------------------------------------------
    const chimePitches = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
    chimePitches.forEach((freq, idx) => {
      const chimeTime = now + 0.10 + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chimeTime);

      gain.gain.setValueAtTime(0.06, chimeTime);
      gain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(chimeTime);
      osc.stop(chimeTime + 0.55);
      this.activeApplauseNodes.push(osc);
    });
  },

  // Helper: 금관악기(트럼펫/혼) 빵빠레 음색 합성 엔진 (Authentic Brass Fanfare Tone)
  _playBrassTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume = 0.20,
    isEnding = false
  ) {
    const saw = ctx.createOscillator();
    const tri = ctx.createOscillator();
    saw.type = 'sawtooth';
    tri.type = 'triangle';
    saw.frequency.setValueAtTime(freq, startTime);
    tri.frequency.setValueAtTime(freq, startTime);
    saw.detune.setValueAtTime(5, startTime); // Rich brass chorus detune

    // Ending note vibrato
    if (isEnding && duration > 0.6) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.5, startTime + 0.25);
      lfoGain.gain.setValueAtTime(6, startTime + 0.25);
      lfo.connect(lfoGain);
      lfoGain.connect(saw.detune);
      lfoGain.connect(tri.detune);
      lfo.start(startTime + 0.25);
      lfo.stop(startTime + duration);
      this.activeApplauseNodes.push(lfo);
    }

    // Dynamic brass lowpass filter (opens quickly on attack to create the trumpet "blat")
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(2.2, startTime);
    filter.frequency.setValueAtTime(800, startTime);
    filter.frequency.exponentialRampToValueAtTime(3400, startTime + 0.035);
    filter.frequency.exponentialRampToValueAtTime(2000, startTime + Math.min(0.25, duration));

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.025);
    gain.gain.setValueAtTime(volume * 0.9, startTime + duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    saw.connect(filter);
    tri.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    saw.start(startTime);
    tri.start(startTime);
    saw.stop(startTime + duration);
    tri.stop(startTime + duration);

    this.activeApplauseNodes.push(saw);
    this.activeApplauseNodes.push(tri);
  },

  // Soft Crash Cymbal effect for celebratory impacts
  playCrashCymbal() {
    if (this.muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dur = 0.8;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(5500, now);
    filter.Q.setValueAtTime(1.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur);
  },

  // 3위 / 2위 순위 공개 빵빠레 (Short Celebratory Fanfare + 박수)
  playDramaticReveal() {
    if (this.muted) return;
    this.stopSuspenseDrumroll();
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.playCrashCymbal();
    this.playCrowdApplause(5.5);

    const now = ctx.currentTime;

    // Low boom impact
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(170, now);
    boomOsc.frequency.exponentialRampToValueAtTime(42, now + 0.7);

    boomGain.gain.setValueAtTime(0.35, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start(now);
    boomOsc.stop(now + 0.7);

    // 🎺 밝고 경쾌한 시상식 트럼펫 빵빠레 멜로디 ("빰! 빠-라-밤~~!")
    const shortFanfare = [
      { f: 392.00, t: 0.00, d: 0.14, v: 0.22, end: false }, // G4 ("빰")
      { f: 523.25, t: 0.15, d: 0.14, v: 0.24, end: false }, // C5 ("빠")
      { f: 659.25, t: 0.29, d: 0.14, v: 0.24, end: false }, // E5 ("라")
      { f: 783.99, t: 0.44, d: 0.90, v: 0.26, end: true },  // G5 ("밤~~!")
      // 화음 서포트 (C Major Harmony)
      { f: 523.25, t: 0.44, d: 0.90, v: 0.16, end: true },  // C5
      { f: 261.63, t: 0.44, d: 0.90, v: 0.14, end: true },  // C4
    ];

    shortFanfare.forEach(({ f, t, d, v, end }) => {
      this._playBrassTone(ctx, f, now + t, d, v, end);
    });
  },

  // 드럼이 휙 뒤로 숨는 순간의 스우시 사운드
  playWhoosh() {
    if (this.muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const dur = 0.35;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + dur);
    filter.Q.setValueAtTime(3, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur);
  },

  // 1위 대상 발표 웅장하고 클래식한 시상식 트럼펫 빵빠레 + 자동 박수
  // ("빰빠라 빰! 빰! 빰! 빰빠라 밤~~~!")
  playWinnerFanfare() {
    if (this.muted) return;
    this.stopSuspenseDrumroll();
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.playCrashCymbal();
    this.playCrowdApplause(6.5);

    const now = ctx.currentTime;

    // 🎺 대한민국 시상식의 대표 빵빠레 멜로디 (Triumphant Royal Brass Fanfare)
    // "빰빠라 빰! 빰! 빰! 빰빠라 밤~~~!"
    const grandFanfareNotes = [
      // 1. "빰-빠-라 빰!"
      { f: 523.25, t: 0.00, d: 0.15, v: 0.24, end: false }, // C5
      { f: 523.25, t: 0.16, d: 0.13, v: 0.22, end: false }, // C5
      { f: 523.25, t: 0.30, d: 0.13, v: 0.22, end: false }, // C5
      { f: 783.99, t: 0.44, d: 0.45, v: 0.28, end: false }, // G5 ("빰!")
      // 1-1. 화음 서포트
      { f: 523.25, t: 0.44, d: 0.45, v: 0.18, end: false }, // C5

      // 2. "빰! 빰!"
      { f: 783.99, t: 0.95, d: 0.20, v: 0.26, end: false }, // G5
      { f: 523.25, t: 0.95, d: 0.20, v: 0.16, end: false }, // C5
      { f: 783.99, t: 1.20, d: 0.20, v: 0.26, end: false }, // G5
      { f: 523.25, t: 1.20, d: 0.20, v: 0.16, end: false }, // C5

      // 3. "빰-빠-라 밤~~~~!" (하이라이트 피날레)
      { f: 523.25, t: 1.50, d: 0.14, v: 0.24, end: false }, // C5
      { f: 659.25, t: 1.65, d: 0.14, v: 0.26, end: false }, // E5
      { f: 783.99, t: 1.80, d: 0.14, v: 0.28, end: false }, // G5
      { f: 1046.50, t: 1.95, d: 1.60, v: 0.32, end: true }, // C6 ("밤~~~!" 최고음)

      // 피날레 웅장한 오케스트라 브라스 C Major 대화음
      { f: 783.99, t: 1.95, d: 1.60, v: 0.22, end: true },  // G5
      { f: 659.25, t: 1.95, d: 1.60, v: 0.20, end: true },  // E5
      { f: 523.25, t: 1.95, d: 1.60, v: 0.18, end: true },  // C5
      { f: 261.63, t: 1.95, d: 1.60, v: 0.18, end: true },  // C4 (Bass)
    ];

    grandFanfareNotes.forEach(({ f, t, d, v, end }) => {
      this._playBrassTone(ctx, f, now + t, d, v, end);
    });
  },
};
