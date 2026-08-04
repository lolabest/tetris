/**
 * Original late-night jazz piano loop for Piano Blocks.
 * Swing-feel salon jazz — not based on any copyrighted composition.
 */

export interface MusicNote {
  readonly freq: number;
  readonly beat: number;
  readonly beats: number;
  readonly gain?: number;
  readonly wave?: OscillatorType;
}

/** Slightly laid-back lounge tempo. */
export const MUSIC_BPM = 88;

/** 8 bars of 4/4 with swing eighths ≈ 32 beats. */
export const MUSIC_LOOP_BEATS = 32;

const C2 = 65.41;
const F2 = 87.31;
const G2 = 98.0;
const A2 = 110.0;
const Bb2 = 116.54;
const B2 = 123.47;
const C3 = 130.81;
const D3 = 146.83;
const Eb3 = 155.56;
const E3 = 164.81;
const F3 = 174.61;
const G3 = 196.0;
const A3 = 220.0;
const Bb3 = 233.08;
const B3 = 246.94;
const C4 = 261.63;
const D4 = 293.66;
const Eb4 = 311.13;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.0;
const A4 = 440.0;
const Bb4 = 466.16;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;

/** Swing: long-short eighth pairs (2/3 + 1/3 of a beat). */
const SWING_LONG = 2 / 3;
const SWING_SHORT = 1 / 3;

function swingPair(
  beat: number,
  a: number,
  b: number,
  gain = 0.26,
): MusicNote[] {
  return [
    { freq: a, beat, beats: SWING_LONG, gain, wave: "sine" },
    {
      freq: b,
      beat: beat + SWING_LONG,
      beats: SWING_SHORT,
      gain: gain * 0.9,
      wave: "sine",
    },
  ];
}

/** Walking / stride-ish left hand with jazz color tones. */
const ACCOMPANIMENT: readonly MusicNote[] = [
  // C7
  { freq: C2, beat: 0, beats: 1.5, gain: 0.2, wave: "triangle" },
  { freq: E3, beat: 0.5, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: Bb3, beat: 1, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: G3, beat: 1.5, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: C3, beat: 2, beats: 1, gain: 0.18, wave: "triangle" },
  { freq: E3, beat: 3, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: Bb2, beat: 3.5, beats: 0.5, gain: 0.12, wave: "triangle" },
  // F7
  { freq: F2, beat: 4, beats: 1.5, gain: 0.2, wave: "triangle" },
  { freq: A3, beat: 4.5, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: Eb3, beat: 5, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: C3, beat: 5.5, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: F3, beat: 6, beats: 1, gain: 0.18, wave: "triangle" },
  { freq: A2, beat: 7, beats: 0.5, gain: 0.12, wave: "triangle" },
  { freq: Eb3, beat: 7.5, beats: 0.5, gain: 0.11, wave: "sine" },
  // C7
  { freq: C2, beat: 8, beats: 1.5, gain: 0.2, wave: "triangle" },
  { freq: G3, beat: 8.5, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: E3, beat: 9, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: Bb3, beat: 9.5, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: C3, beat: 10, beats: 1, gain: 0.18, wave: "triangle" },
  { freq: E3, beat: 11, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: G2, beat: 11.5, beats: 0.5, gain: 0.13, wave: "triangle" },
  // G7
  { freq: G2, beat: 12, beats: 1.5, gain: 0.2, wave: "triangle" },
  { freq: B3, beat: 12.5, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: F3, beat: 13, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: D3, beat: 13.5, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: G3, beat: 14, beats: 1, gain: 0.18, wave: "triangle" },
  { freq: F2, beat: 15, beats: 0.5, gain: 0.13, wave: "triangle" },
  { freq: B2, beat: 15.5, beats: 0.5, gain: 0.12, wave: "triangle" },
  // C7
  { freq: C2, beat: 16, beats: 1.5, gain: 0.2, wave: "triangle" },
  { freq: E3, beat: 16.5, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: Bb3, beat: 17, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: G3, beat: 17.5, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: C3, beat: 18, beats: 1, gain: 0.18, wave: "triangle" },
  { freq: Bb2, beat: 19, beats: 0.5, gain: 0.12, wave: "triangle" },
  { freq: E3, beat: 19.5, beats: 0.5, gain: 0.11, wave: "sine" },
  // A7 (secondary dominant color)
  { freq: A2, beat: 20, beats: 1.5, gain: 0.19, wave: "triangle" },
  { freq: C4, beat: 20.5, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: G3, beat: 21, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: E3, beat: 21.5, beats: 0.5, gain: 0.1, wave: "sine" },
  { freq: A3, beat: 22, beats: 1, gain: 0.17, wave: "triangle" },
  { freq: G2, beat: 23, beats: 0.5, gain: 0.12, wave: "triangle" },
  { freq: C3, beat: 23.5, beats: 0.5, gain: 0.11, wave: "sine" },
  // D7 → G7 turnaround
  { freq: D3, beat: 24, beats: 1, gain: 0.19, wave: "triangle" },
  { freq: F3, beat: 24.5, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: C4, beat: 25, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: A3, beat: 25.5, beats: 0.5, gain: 0.1, wave: "sine" },
  { freq: G2, beat: 26, beats: 1, gain: 0.19, wave: "triangle" },
  { freq: F3, beat: 26.5, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: B3, beat: 27, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: D3, beat: 27.5, beats: 0.5, gain: 0.1, wave: "sine" },
  // C6 / resolve
  { freq: C2, beat: 28, beats: 1.5, gain: 0.22, wave: "triangle" },
  { freq: E3, beat: 28.5, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: A3, beat: 29, beats: 0.5, gain: 0.12, wave: "sine" },
  { freq: G3, beat: 29.5, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: C3, beat: 30, beats: 1, gain: 0.2, wave: "triangle" },
  { freq: E3, beat: 31, beats: 0.5, gain: 0.11, wave: "sine" },
  { freq: G3, beat: 31.5, beats: 0.5, gain: 0.12, wave: "sine" },
];

/** Right-hand swing melody with blue notes. */
const MELODY: readonly MusicNote[] = [
  ...swingPair(0, E4, G4, 0.28),
  { freq: Bb4, beat: 1, beats: 0.75, gain: 0.3 },
  { freq: A4, beat: 1.75, beats: 0.25, gain: 0.22 },
  { freq: G4, beat: 2, beats: 1, gain: 0.28 },
  { freq: E4, beat: 3, beats: 1, gain: 0.26 },
  ...swingPair(4, F4, A4, 0.28),
  { freq: C5, beat: 5, beats: 1, gain: 0.3 },
  { freq: Bb4, beat: 6, beats: 0.75, gain: 0.28 },
  { freq: A4, beat: 6.75, beats: 0.25, gain: 0.22 },
  { freq: F4, beat: 7, beats: 1, gain: 0.26 },
  ...swingPair(8, E4, G4, 0.28),
  { freq: C5, beat: 9, beats: 1.25, gain: 0.32 },
  { freq: Bb4, beat: 10.25, beats: 0.75, gain: 0.26 },
  { freq: G4, beat: 11, beats: 1, gain: 0.26 },
  ...swingPair(12, D4, F4, 0.26),
  { freq: B4, beat: 13, beats: 1, gain: 0.3 },
  { freq: A4, beat: 14, beats: 0.5, gain: 0.24 },
  { freq: G4, beat: 14.5, beats: 0.5, gain: 0.24 },
  { freq: F4, beat: 15, beats: 1, gain: 0.26 },
  // Second chorus — higher flourish
  { freq: E5, beat: 16, beats: 0.75, gain: 0.3 },
  { freq: D5, beat: 16.75, beats: 0.25, gain: 0.22 },
  { freq: C5, beat: 17, beats: 1, gain: 0.28 },
  { freq: Bb4, beat: 18, beats: 1, gain: 0.28 },
  { freq: G4, beat: 19, beats: 1, gain: 0.26 },
  ...swingPair(20, A4, C5, 0.28),
  { freq: E5, beat: 21, beats: 1, gain: 0.3 },
  { freq: D5, beat: 22, beats: 0.75, gain: 0.26 },
  { freq: C5, beat: 22.75, beats: 0.25, gain: 0.2 },
  { freq: A4, beat: 23, beats: 1, gain: 0.26 },
  ...swingPair(24, D5, C5, 0.28),
  { freq: B4, beat: 25, beats: 1, gain: 0.28 },
  { freq: A4, beat: 26, beats: 0.5, gain: 0.24 },
  { freq: G4, beat: 26.5, beats: 0.5, gain: 0.24 },
  { freq: F4, beat: 27, beats: 1, gain: 0.26 },
  { freq: E4, beat: 28, beats: 1.25, gain: 0.3 },
  { freq: G4, beat: 29.25, beats: 0.75, gain: 0.26 },
  { freq: C5, beat: 30, beats: 1.5, gain: 0.32 },
  { freq: Eb4, beat: 31.5, beats: 0.5, gain: 0.18 },
];

export const RECITAL_LOOP: readonly MusicNote[] = [...ACCOMPANIMENT, ...MELODY];

export function secondsPerBeat(bpm: number = MUSIC_BPM): number {
  return 60 / bpm;
}
