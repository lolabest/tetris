import {
  LINE_CLEAR_ARPEGGIO,
  PIECE_FREQUENCIES,
  SOUND_DEFS,
  type SoundId,
  type ToneSpec,
} from "./soundDefinitions";
import {
  MUSIC_BPM,
  MUSIC_LOOP_BEATS,
  RECITAL_LOOP,
  secondsPerBeat,
  type MusicNote,
} from "./musicDefinitions";
import type { TetrominoType } from "../game/types";

export interface PianoAudioOptions {
  readonly volume?: number;
  readonly muted?: boolean;
  readonly musicVolume?: number;
}

/**
 * Procedural piano-like tones + original ambient recital loop via Web Audio API.
 * Isolated from the game engine; safe no-op when AudioContext is unavailable.
 */
export class PianoAudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private volume: number;
  private musicVolume: number;
  private muted: boolean;
  private unlocked = false;

  private musicPlaying = false;
  private musicPaused = false;
  private musicTimer: ReturnType<typeof setTimeout> | null = null;
  private nextLoopTime = 0;
  private scheduledMusicNodes: Array<{ osc: OscillatorNode; gain: GainNode }> =
    [];

  constructor(options: PianoAudioOptions = {}) {
    this.volume = options.volume ?? 0.55;
    this.musicVolume = options.musicVolume ?? 0.32;
    this.muted = options.muted ?? false;
  }

  /** Must be called from a user gesture before sound can play. */
  async unlock(): Promise<void> {
    if (this.unlocked && this.context) {
      if (this.context.state === "suspended") {
        try {
          await this.context.resume();
        } catch {
          // ignore
        }
      }
      return;
    }
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) {
        return;
      }
      this.context = new Ctx();
      this.master = this.context.createGain();
      this.sfxBus = this.context.createGain();
      this.musicBus = this.context.createGain();

      this.sfxBus.gain.value = 1;
      this.musicBus.gain.value = this.musicVolume;
      this.master.gain.value = this.muted ? 0 : this.volume;

      this.sfxBus.connect(this.master);
      this.musicBus.connect(this.master);
      this.master.connect(this.context.destination);

      if (this.context.state === "suspended") {
        await this.context.resume();
      }
      this.unlocked = true;
    } catch {
      this.context = null;
      this.master = null;
      this.sfxBus = null;
      this.musicBus = null;
      this.unlocked = false;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(
        muted ? 0 : this.volume,
        this.context.currentTime,
        0.02,
      );
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.master && this.context && !this.muted) {
      this.master.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.02,
      );
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.min(1, Math.max(0, volume));
    if (this.musicBus && this.context) {
      this.musicBus.gain.setTargetAtTime(
        this.musicVolume,
        this.context.currentTime,
        0.05,
      );
    }
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  isMusicPlaying(): boolean {
    return this.musicPlaying && !this.musicPaused;
  }

  play(sound: SoundId): void {
    const tones = SOUND_DEFS[sound];
    this.playTones(tones);
  }

  playPieceNote(type: TetrominoType, kind: "spawn" | "lock" = "spawn"): void {
    const frequency = PIECE_FREQUENCIES[type];
    const tone: ToneSpec = {
      frequency,
      duration: kind === "lock" ? 0.14 : 0.1,
      type: "sine",
      attack: 0.008,
      decay: 0.08,
      sustain: 0.2,
      release: 0.1,
      gain: kind === "lock" ? 0.14 : 0.11,
    };
    this.playTones([tone]);
  }

  playLineClear(lines: number): void {
    const count = Math.min(4, Math.max(1, lines));
    const tones: ToneSpec[] = LINE_CLEAR_ARPEGGIO.slice(0, count).map(
      (frequency, index) => ({
        frequency,
        duration: 0.14 + index * 0.04,
        type: "sine" as OscillatorType,
        attack: 0.01,
        decay: 0.08,
        sustain: 0.22,
        release: 0.12,
        gain: 0.14,
        detune: index * 2,
      }),
    );
    void this.playStaggered(tones, 0.07);
  }

  /** Start the looping ambient piano recital (idempotent). */
  startMusic(): void {
    if (!this.context || !this.musicBus || this.muted) {
      // Still mark intent so unmute / unlock can resume
      this.musicPlaying = true;
      this.musicPaused = false;
      if (this.context && this.musicBus && !this.muted) {
        this.scheduleMusicLoop(this.context.currentTime + 0.05);
      }
      return;
    }
    if (this.musicPlaying && !this.musicPaused) {
      return;
    }
    this.musicPlaying = true;
    this.musicPaused = false;
    if (this.musicBus) {
      this.musicBus.gain.setTargetAtTime(
        this.musicVolume,
        this.context.currentTime,
        0.08,
      );
    }
    this.scheduleMusicLoop(this.context.currentTime + 0.08);
  }

  pauseMusic(): void {
    if (!this.musicPlaying || this.musicPaused) {
      return;
    }
    this.musicPaused = true;
    this.clearMusicTimer();
    this.stopScheduledMusic(0.15);
    if (this.musicBus && this.context) {
      this.musicBus.gain.setTargetAtTime(
        0.0001,
        this.context.currentTime,
        0.08,
      );
    }
  }

  resumeMusic(): void {
    if (!this.musicPlaying || !this.musicPaused) {
      if (this.musicPlaying && !this.musicPaused) {
        return;
      }
      if (!this.musicPlaying) {
        this.startMusic();
        return;
      }
    }
    this.musicPaused = false;
    if (!this.context || !this.musicBus || this.muted) {
      return;
    }
    this.musicBus.gain.setTargetAtTime(
      this.musicVolume,
      this.context.currentTime,
      0.1,
    );
    this.scheduleMusicLoop(this.context.currentTime + 0.1);
  }

  stopMusic(): void {
    this.musicPlaying = false;
    this.musicPaused = false;
    this.clearMusicTimer();
    this.stopScheduledMusic(0.25);
    if (this.musicBus && this.context) {
      this.musicBus.gain.setTargetAtTime(
        0.0001,
        this.context.currentTime,
        0.12,
      );
    }
  }

  dispose(): void {
    this.stopMusic();
    if (this.context) {
      void this.context.close().catch(() => undefined);
    }
    this.context = null;
    this.master = null;
    this.sfxBus = null;
    this.musicBus = null;
    this.unlocked = false;
  }

  private scheduleMusicLoop(startAt: number): void {
    if (
      !this.context ||
      !this.musicBus ||
      !this.musicPlaying ||
      this.musicPaused ||
      this.muted
    ) {
      return;
    }

    this.clearMusicTimer();
    const spb = secondsPerBeat(MUSIC_BPM);
    const loopDuration = MUSIC_LOOP_BEATS * spb;

    for (const note of RECITAL_LOOP) {
      this.scheduleMusicNote(note, startAt, spb);
    }

    // Schedule next loop slightly before this one ends
    const delayMs = Math.max(50, (loopDuration - 0.05) * 1000);
    this.clearMusicTimer();
    this.musicTimer = setTimeout(() => {
      if (this.musicPlaying && !this.musicPaused) {
        this.scheduleMusicLoop(startAt + loopDuration);
      }
    }, delayMs);
  }

  private scheduleMusicNote(
    note: MusicNote,
    loopStart: number,
    spb: number,
  ): void {
    if (!this.context || !this.musicBus) {
      return;
    }
    const startTime = loopStart + note.beat * spb;
    const duration = note.beats * spb;
    const peak = (note.gain ?? 0.25) * 0.85;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    // Soft lowpass for a mellower piano-ish body
    const filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3200;
    filter.Q.value = 0.7;

    osc.type = note.wave ?? "sine";
    osc.frequency.value = note.freq;

    const attack = Math.min(0.04, duration * 0.15);
    const release = Math.min(0.45, duration * 0.55);
    const sustainEnd = startTime + Math.max(duration - release, attack + 0.02);
    const end = sustainEnd + release;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, peak),
      startTime + attack,
    );
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, peak * 0.55),
      sustainEnd,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);
    osc.start(startTime);
    osc.stop(end + 0.03);

    this.scheduledMusicNodes.push({ osc, gain });
    osc.onended = () => {
      try {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {
        // ignore
      }
      this.scheduledMusicNodes = this.scheduledMusicNodes.filter(
        (n) => n.osc !== osc,
      );
    };
  }

  private stopScheduledMusic(fadeSeconds: number): void {
    if (!this.context) {
      this.scheduledMusicNodes = [];
      return;
    }
    const now = this.context.currentTime;
    for (const node of this.scheduledMusicNodes) {
      try {
        node.gain.gain.cancelScheduledValues(now);
        node.gain.gain.setTargetAtTime(0.0001, now, fadeSeconds / 3);
        node.osc.stop(now + fadeSeconds + 0.05);
      } catch {
        // already stopped
      }
    }
    this.scheduledMusicNodes = [];
  }

  private clearMusicTimer(): void {
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playTones(tones: readonly ToneSpec[], whenOffset = 0): void {
    if (!this.context || !this.sfxBus || this.muted) {
      return;
    }
    const now = this.context.currentTime + whenOffset;
    for (const tone of tones) {
      this.scheduleTone(tone, now);
    }
  }

  private async playStaggered(
    tones: readonly ToneSpec[],
    gap: number,
  ): Promise<void> {
    if (!this.context || !this.sfxBus || this.muted) {
      return;
    }
    tones.forEach((tone, index) => {
      this.scheduleTone(tone, this.context!.currentTime + index * gap);
    });
  }

  private scheduleTone(tone: ToneSpec, startTime: number): void {
    if (!this.context || !this.sfxBus) {
      return;
    }
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = tone.type;
    osc.frequency.value = tone.frequency;
    if (tone.detune !== undefined) {
      osc.detune.value = tone.detune;
    }

    const peak = tone.gain;
    const attackEnd = startTime + tone.attack;
    const decayEnd = attackEnd + tone.decay;
    const sustainEnd =
      startTime + Math.max(tone.duration, tone.attack + tone.decay);
    const end = sustainEnd + tone.release;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), attackEnd);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, peak * tone.sustain),
      decayEnd,
    );
    gain.gain.setValueAtTime(Math.max(0.0001, peak * tone.sustain), sustainEnd);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(startTime);
    osc.stop(end + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}
