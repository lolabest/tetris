import {
  LINE_CLEAR_ARPEGGIO,
  PIECE_FREQUENCIES,
  SOUND_DEFS,
  type SoundId,
  type ToneSpec,
} from "./soundDefinitions";
import type { TetrominoType } from "../game/types";

export interface PianoAudioOptions {
  readonly volume?: number;
  readonly muted?: boolean;
}

/**
 * Procedural piano-like tones via Web Audio API.
 * Isolated from the game engine; safe no-op when AudioContext is unavailable.
 */
export class PianoAudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private volume: number;
  private muted: boolean;
  private unlocked = false;

  constructor(options: PianoAudioOptions = {}) {
    this.volume = options.volume ?? 0.55;
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
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(this.context.destination);
      if (this.context.state === "suspended") {
        await this.context.resume();
      }
      this.unlocked = true;
    } catch {
      this.context = null;
      this.master = null;
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

  isUnlocked(): boolean {
    return this.unlocked;
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
    // Stagger arpeggio
    void this.playStaggered(tones, 0.07);
  }

  dispose(): void {
    if (this.context) {
      void this.context.close().catch(() => undefined);
    }
    this.context = null;
    this.master = null;
    this.unlocked = false;
  }

  private playTones(tones: readonly ToneSpec[], whenOffset = 0): void {
    if (!this.context || !this.master || this.muted) {
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
    if (!this.context || !this.master || this.muted) {
      return;
    }
    tones.forEach((tone, index) => {
      this.scheduleTone(tone, this.context!.currentTime + index * gap);
    });
  }

  private scheduleTone(tone: ToneSpec, startTime: number): void {
    if (!this.context || !this.master) {
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
    gain.connect(this.master);
    osc.start(startTime);
    osc.stop(end + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}
