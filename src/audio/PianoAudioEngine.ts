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

/** Optional licensed track path — never fetched unless present on the server. */
const FILE_MUSIC_URL = "/audio/dear-simon.mp3";

export interface PianoAudioOptions {
  readonly volume?: number;
  readonly musicEnabled?: boolean;
  readonly sfxEnabled?: boolean;
  /** @deprecated use musicEnabled/sfxEnabled */
  readonly muted?: boolean;
  readonly musicVolume?: number;
}

/**
 * Procedural piano + sax tones, optional licensed file music, and SFX.
 * Falls back silently when dear-simon.mp3 is absent.
 */
export class PianoAudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private volume: number;
  private musicVolume: number;
  private musicEnabled: boolean;
  private sfxEnabled: boolean;
  private unlocked = false;

  private musicPlaying = false;
  private musicPaused = false;
  private musicTimer: ReturnType<typeof setTimeout> | null = null;
  private scheduledMusicNodes: Array<{ osc: OscillatorNode; gain: GainNode }> =
    [];

  private fileProbe: Promise<boolean> | null = null;
  private useFileMusic = false;
  private fileElement: HTMLAudioElement | null = null;
  /** Kept so the MediaElementSource is not GC'd while connected. */
  private fileSourceNode: MediaElementAudioSourceNode | null = null;
  private fileObjectUrl: string | null = null;

  constructor(options: PianoAudioOptions = {}) {
    this.volume = options.volume ?? 0.55;
    this.musicVolume = options.musicVolume ?? 0.42;
    if (
      options.musicEnabled !== undefined ||
      options.sfxEnabled !== undefined
    ) {
      this.musicEnabled = options.musicEnabled ?? true;
      this.sfxEnabled = options.sfxEnabled ?? true;
    } else if (options.muted !== undefined) {
      this.musicEnabled = !options.muted;
      this.sfxEnabled = !options.muted;
    } else {
      this.musicEnabled = true;
      this.sfxEnabled = true;
    }
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

      this.sfxBus.gain.value = this.sfxEnabled ? 1 : 0;
      this.musicBus.gain.value = this.musicEnabled ? this.musicVolume : 0.0001;
      this.master.gain.value = this.volume;

      this.sfxBus.connect(this.master);
      this.musicBus.connect(this.master);
      this.master.connect(this.context.destination);

      if (this.context.state === "suspended") {
        await this.context.resume();
      }
      this.unlocked = true;
      void this.ensureFileMusicProbe();
    } catch {
      this.context = null;
      this.master = null;
      this.sfxBus = null;
      this.musicBus = null;
      this.unlocked = false;
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!this.context || !this.musicBus) {
      return;
    }
    if (!enabled) {
      this.clearMusicTimer();
      this.stopScheduledMusic(0.12);
      this.pauseFileElement(0.12);
      this.musicBus.gain.setTargetAtTime(
        0.0001,
        this.context.currentTime,
        0.08,
      );
      return;
    }
    if (this.musicPlaying && !this.musicPaused) {
      this.musicBus.gain.setTargetAtTime(
        this.musicVolume,
        this.context.currentTime,
        0.08,
      );
      void this.beginMusicPlayback();
    }
  }

  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    if (this.sfxBus && this.context) {
      this.sfxBus.gain.setTargetAtTime(
        enabled ? 1 : 0,
        this.context.currentTime,
        0.02,
      );
    }
  }

  /** @deprecated prefer setMusicEnabled / setSfxEnabled */
  setMuted(muted: boolean): void {
    this.setMusicEnabled(!muted);
    this.setSfxEnabled(!muted);
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.02,
      );
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.min(1, Math.max(0, volume));
    if (
      this.musicBus &&
      this.context &&
      this.musicEnabled &&
      !this.musicPaused
    ) {
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
    return this.musicPlaying && !this.musicPaused && this.musicEnabled;
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

  /** Start looping music (file if licensed asset exists, else procedural). */
  startMusic(): void {
    this.musicPlaying = true;
    this.musicPaused = false;
    if (!this.context || !this.musicBus || !this.musicEnabled) {
      return;
    }
    this.musicBus.gain.setTargetAtTime(
      this.musicVolume,
      this.context.currentTime,
      0.08,
    );
    void this.beginMusicPlayback();
  }

  pauseMusic(): void {
    if (!this.musicPlaying || this.musicPaused) {
      return;
    }
    this.musicPaused = true;
    this.clearMusicTimer();
    this.stopScheduledMusic(0.15);
    this.pauseFileElement(0.2);
    if (this.musicBus && this.context) {
      this.musicBus.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.1);
    }
  }

  resumeMusic(): void {
    if (!this.musicPlaying) {
      this.startMusic();
      return;
    }
    if (!this.musicPaused) {
      return;
    }
    this.musicPaused = false;
    if (!this.context || !this.musicBus || !this.musicEnabled) {
      return;
    }
    this.musicBus.gain.setTargetAtTime(
      this.musicVolume,
      this.context.currentTime,
      0.12,
    );
    void this.beginMusicPlayback();
  }

  stopMusic(): void {
    this.musicPlaying = false;
    this.musicPaused = false;
    this.clearMusicTimer();
    this.stopScheduledMusic(0.25);
    this.stopFileElement(0.25);
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
    if (this.fileObjectUrl) {
      URL.revokeObjectURL(this.fileObjectUrl);
      this.fileObjectUrl = null;
    }
    this.fileElement = null;
    if (this.fileSourceNode) {
      try {
        this.fileSourceNode.disconnect();
      } catch {
        // ignore
      }
      this.fileSourceNode = null;
    }
    if (this.context) {
      void this.context.close().catch(() => undefined);
    }
    this.context = null;
    this.master = null;
    this.sfxBus = null;
    this.musicBus = null;
    this.unlocked = false;
  }

  private async beginMusicPlayback(): Promise<void> {
    if (
      !this.context ||
      !this.musicBus ||
      !this.musicPlaying ||
      this.musicPaused ||
      !this.musicEnabled
    ) {
      return;
    }
    const hasFile = await this.ensureFileMusicProbe();
    if (
      !this.musicPlaying ||
      this.musicPaused ||
      !this.musicEnabled ||
      !this.context
    ) {
      return;
    }
    if (hasFile && this.fileElement) {
      this.clearMusicTimer();
      this.stopScheduledMusic(0.05);
      try {
        this.fileElement.loop = true;
        this.fileElement.currentTime = this.fileElement.currentTime || 0;
        await this.fileElement.play();
      } catch {
        // Autoplay / decode failure — fall back to procedural silently
        this.useFileMusic = false;
        this.scheduleMusicLoop(this.context.currentTime + 0.08);
      }
      return;
    }
    this.stopFileElement(0.05);
    this.scheduleMusicLoop(this.context.currentTime + 0.08);
  }

  private ensureFileMusicProbe(): Promise<boolean> {
    if (this.fileProbe) {
      return this.fileProbe;
    }
    this.fileProbe = this.probeFileMusic();
    return this.fileProbe;
  }

  /**
   * Silently probe for a licensed track. Missing files must not throw or spam the console.
   * Uses fetch (not an <audio> 404) so browsers do not log media load errors.
   */
  private async probeFileMusic(): Promise<boolean> {
    if (!this.context || !this.musicBus) {
      return false;
    }
    try {
      const response = await fetch(FILE_MUSIC_URL, { cache: "force-cache" });
      if (!response.ok) {
        this.useFileMusic = false;
        return false;
      }
      const headerType = response.headers.get("content-type") ?? "";
      // Vite SPA fallback serves index.html with 200 for missing public files.
      if (
        headerType.includes("text/html") ||
        headerType.includes("application/json")
      ) {
        this.useFileMusic = false;
        return false;
      }
      const blob = await response.blob();
      const blobType = blob.type || headerType;
      if (
        blob.size < 1024 ||
        (blobType.length > 0 &&
          !blobType.startsWith("audio/") &&
          !blobType.includes("octet-stream") &&
          !blobType.includes("mpeg"))
      ) {
        this.useFileMusic = false;
        return false;
      }
      const objectUrl = URL.createObjectURL(blob);
      const element = new Audio();
      element.preload = "auto";
      element.loop = true;
      element.src = objectUrl;
      await new Promise<void>((resolve, reject) => {
        const onReady = (): void => {
          cleanup();
          resolve();
        };
        const onError = (): void => {
          cleanup();
          reject(new Error("decode"));
        };
        const cleanup = (): void => {
          element.removeEventListener("canplaythrough", onReady);
          element.removeEventListener("error", onError);
        };
        element.addEventListener("canplaythrough", onReady, { once: true });
        element.addEventListener("error", onError, { once: true });
        element.load();
      });
      const source = this.context.createMediaElementSource(element);
      source.connect(this.musicBus);
      this.fileObjectUrl = objectUrl;
      this.fileElement = element;
      this.fileSourceNode = source;
      this.useFileMusic = true;
      return true;
    } catch {
      if (this.fileObjectUrl) {
        URL.revokeObjectURL(this.fileObjectUrl);
        this.fileObjectUrl = null;
      }
      this.fileElement = null;
      this.fileSourceNode = null;
      this.useFileMusic = false;
      return false;
    }
  }

  private pauseFileElement(fadeSeconds: number): void {
    if (!this.fileElement || !this.context || !this.musicBus) {
      return;
    }
    // Bus fade handles ducking; pause after a short delay for smoothness
    const el = this.fileElement;
    window.setTimeout(() => {
      try {
        el.pause();
      } catch {
        // ignore
      }
    }, fadeSeconds * 1000);
    void fadeSeconds;
  }

  private stopFileElement(fadeSeconds: number): void {
    if (!this.fileElement) {
      return;
    }
    const el = this.fileElement;
    window.setTimeout(
      () => {
        try {
          el.pause();
          el.currentTime = 0;
        } catch {
          // ignore
        }
      },
      Math.min(50, fadeSeconds * 200),
    );
  }

  private scheduleMusicLoop(startAt: number): void {
    if (
      !this.context ||
      !this.musicBus ||
      !this.musicPlaying ||
      this.musicPaused ||
      !this.musicEnabled ||
      this.useFileMusic
    ) {
      return;
    }

    this.clearMusicTimer();
    const spb = secondsPerBeat(MUSIC_BPM);
    const loopDuration = MUSIC_LOOP_BEATS * spb;

    for (const note of RECITAL_LOOP) {
      this.scheduleMusicNote(note, startAt, spb);
    }

    const delayMs = Math.max(50, (loopDuration - 0.08) * 1000);
    this.musicTimer = setTimeout(() => {
      if (this.musicPlaying && !this.musicPaused && this.musicEnabled) {
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
    const isSax = note.wave === "sawtooth";

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = isSax ? 1800 : 3200;
    filter.Q.value = isSax ? 1.1 : 0.7;

    osc.type = note.wave ?? "sine";
    osc.frequency.value = note.freq;

    const attack = Math.min(isSax ? 0.08 : 0.05, duration * 0.12);
    const release = Math.min(0.7, Math.max(0.18, duration * 0.65));
    const sustainEnd =
      startTime + Math.max(duration - release * 0.35, attack + 0.03);
    const end = sustainEnd + release;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, peak),
      startTime + attack,
    );
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, peak * (isSax ? 0.55 : 0.62)),
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
    if (!this.context || !this.sfxBus || !this.sfxEnabled) {
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
    if (!this.context || !this.sfxBus || !this.sfxEnabled) {
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
