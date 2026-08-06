import type { TetrominoType } from "../game/types";

/** Frequencies (Hz) for each piece — a calm C-major-ish piano palette. */
export const PIECE_FREQUENCIES: Readonly<Record<TetrominoType, number>> = {
  I: 261.63, // C4
  O: 293.66, // D4
  T: 329.63, // E4
  S: 349.23, // F4
  Z: 392.0, // G4
  J: 440.0, // A4
  L: 493.88, // B4
};

export type SoundId =
  | "move"
  | "rotate"
  | "softDrop"
  | "hardDrop"
  | "lock"
  | "hold"
  | "lineClear"
  | "levelUp"
  | "gameOver"
  | "ui";

export interface ToneSpec {
  readonly frequency: number;
  readonly duration: number;
  readonly type: OscillatorType;
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
  readonly gain: number;
  readonly detune?: number;
}

export const SOUND_DEFS: Readonly<Record<SoundId, readonly ToneSpec[]>> = {
  move: [
    {
      frequency: 880,
      duration: 0.04,
      type: "sine",
      attack: 0.005,
      decay: 0.03,
      sustain: 0.1,
      release: 0.02,
      gain: 0.08,
    },
  ],
  rotate: [
    {
      frequency: 660,
      duration: 0.06,
      type: "triangle",
      attack: 0.005,
      decay: 0.04,
      sustain: 0.15,
      release: 0.03,
      gain: 0.1,
    },
  ],
  softDrop: [
    {
      frequency: 520,
      duration: 0.03,
      type: "sine",
      attack: 0.002,
      decay: 0.02,
      sustain: 0.05,
      release: 0.02,
      gain: 0.05,
    },
  ],
  hardDrop: [
    {
      frequency: 196,
      duration: 0.12,
      type: "triangle",
      attack: 0.002,
      decay: 0.08,
      sustain: 0.1,
      release: 0.06,
      gain: 0.18,
    },
    {
      frequency: 392,
      duration: 0.08,
      type: "sine",
      attack: 0.002,
      decay: 0.05,
      sustain: 0.05,
      release: 0.04,
      gain: 0.1,
      detune: 8,
    },
  ],
  lock: [
    {
      frequency: 246.94,
      duration: 0.1,
      type: "sine",
      attack: 0.005,
      decay: 0.06,
      sustain: 0.1,
      release: 0.05,
      gain: 0.12,
    },
  ],
  hold: [
    {
      frequency: 370,
      duration: 0.08,
      type: "triangle",
      attack: 0.005,
      decay: 0.05,
      sustain: 0.12,
      release: 0.04,
      gain: 0.1,
    },
  ],
  lineClear: [
    {
      frequency: 523.25,
      duration: 0.12,
      type: "sine",
      attack: 0.01,
      decay: 0.08,
      sustain: 0.2,
      release: 0.08,
      gain: 0.16,
    },
  ],
  levelUp: [
    {
      frequency: 523.25,
      duration: 0.15,
      type: "triangle",
      attack: 0.01,
      decay: 0.08,
      sustain: 0.25,
      release: 0.1,
      gain: 0.14,
    },
    {
      frequency: 659.25,
      duration: 0.15,
      type: "sine",
      attack: 0.02,
      decay: 0.08,
      sustain: 0.2,
      release: 0.1,
      gain: 0.12,
    },
    {
      frequency: 783.99,
      duration: 0.2,
      type: "sine",
      attack: 0.03,
      decay: 0.1,
      sustain: 0.2,
      release: 0.12,
      gain: 0.12,
    },
  ],
  gameOver: [
    {
      frequency: 196,
      duration: 0.35,
      type: "sine",
      attack: 0.02,
      decay: 0.2,
      sustain: 0.15,
      release: 0.2,
      gain: 0.16,
    },
    {
      frequency: 146.83,
      duration: 0.45,
      type: "triangle",
      attack: 0.04,
      decay: 0.25,
      sustain: 0.1,
      release: 0.25,
      gain: 0.12,
    },
  ],
  ui: [
    {
      frequency: 740,
      duration: 0.05,
      type: "sine",
      attack: 0.005,
      decay: 0.03,
      sustain: 0.1,
      release: 0.02,
      gain: 0.08,
    },
  ],
};

/** Ascending arpeggio for multi-line clears (relative to C major triad + high C). */
export const LINE_CLEAR_ARPEGGIO: readonly number[] = [
  523.25, 659.25, 783.99, 1046.5,
];
