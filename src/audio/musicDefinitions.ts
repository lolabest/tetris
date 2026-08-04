/**
 * Original procedural piano music for Piano Blocks.
 * Not based on any copyrighted composition — calm salon-style loop in C major.
 */

export interface MusicNote {
  /** Frequency in Hz */
  readonly freq: number;
  /** Start time in beats from loop start */
  readonly beat: number;
  /** Length in beats */
  readonly beats: number;
  /** Relative gain (0–1) within the music bus */
  readonly gain?: number;
  /** Oscillator color */
  readonly wave?: OscillatorType;
}

/** Beats per minute for the ambient recital loop. */
export const MUSIC_BPM = 76;

/** Loop length in beats (8 bars of 3/4 waltz feel = 24 beats). */
export const MUSIC_LOOP_BEATS = 24;

const C3 = 130.81;
const E3 = 164.81;
const F3 = 174.61;
const G3 = 196.0;
const A3 = 220.0;
const B3 = 246.94;
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.0;
const A4 = 440.0;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;

/** Soft left-hand accompaniment (broken chords). */
const ACCOMPANIMENT: readonly MusicNote[] = [
  // Bar 1 — C
  { freq: C3, beat: 0, beats: 1.0, gain: 0.22, wave: "triangle" },
  { freq: G3, beat: 1, beats: 0.9, gain: 0.16, wave: "sine" },
  { freq: E4, beat: 2, beats: 0.9, gain: 0.14, wave: "sine" },
  // Bar 2 — Am
  { freq: A3, beat: 3, beats: 1.0, gain: 0.22, wave: "triangle" },
  { freq: E3, beat: 4, beats: 0.9, gain: 0.16, wave: "sine" },
  { freq: C4, beat: 5, beats: 0.9, gain: 0.14, wave: "sine" },
  // Bar 3 — F
  { freq: F3, beat: 6, beats: 1.0, gain: 0.22, wave: "triangle" },
  { freq: C4, beat: 7, beats: 0.9, gain: 0.16, wave: "sine" },
  { freq: A3, beat: 8, beats: 0.9, gain: 0.14, wave: "sine" },
  // Bar 4 — G
  { freq: G3, beat: 9, beats: 1.0, gain: 0.22, wave: "triangle" },
  { freq: D4, beat: 10, beats: 0.9, gain: 0.16, wave: "sine" },
  { freq: B3, beat: 11, beats: 0.9, gain: 0.14, wave: "sine" },
  // Bar 5 — C
  { freq: C3, beat: 12, beats: 1.0, gain: 0.22, wave: "triangle" },
  { freq: G3, beat: 13, beats: 0.9, gain: 0.16, wave: "sine" },
  { freq: E4, beat: 14, beats: 0.9, gain: 0.14, wave: "sine" },
  // Bar 6 — Em
  { freq: E3, beat: 15, beats: 1.0, gain: 0.2, wave: "triangle" },
  { freq: B3, beat: 16, beats: 0.9, gain: 0.15, wave: "sine" },
  { freq: G3, beat: 17, beats: 0.9, gain: 0.13, wave: "sine" },
  // Bar 7 — F
  { freq: F3, beat: 18, beats: 1.0, gain: 0.22, wave: "triangle" },
  { freq: C4, beat: 19, beats: 0.9, gain: 0.16, wave: "sine" },
  { freq: A4, beat: 20, beats: 0.85, gain: 0.12, wave: "sine" },
  // Bar 8 — G → C
  { freq: G3, beat: 21, beats: 1.0, gain: 0.22, wave: "triangle" },
  { freq: D4, beat: 22, beats: 0.9, gain: 0.16, wave: "sine" },
  { freq: B3, beat: 23, beats: 0.85, gain: 0.14, wave: "sine" },
];

/** Right-hand melody — gentle rising phrases. */
const MELODY: readonly MusicNote[] = [
  // Phrase 1
  { freq: E4, beat: 0.0, beats: 1.0, gain: 0.28 },
  { freq: G4, beat: 1.0, beats: 1.0, gain: 0.26 },
  { freq: C5, beat: 2.0, beats: 1.0, gain: 0.3 },
  { freq: B4, beat: 3.0, beats: 1.0, gain: 0.26 },
  { freq: A4, beat: 4.0, beats: 1.0, gain: 0.26 },
  { freq: E4, beat: 5.0, beats: 1.0, gain: 0.24 },
  { freq: F4, beat: 6.0, beats: 1.0, gain: 0.28 },
  { freq: A4, beat: 7.0, beats: 1.0, gain: 0.26 },
  { freq: C5, beat: 8.0, beats: 1.0, gain: 0.3 },
  { freq: D5, beat: 9.0, beats: 1.0, gain: 0.28 },
  { freq: B4, beat: 10.0, beats: 1.0, gain: 0.26 },
  { freq: G4, beat: 11.0, beats: 1.0, gain: 0.24 },
  // Phrase 2
  { freq: E5, beat: 12.0, beats: 1.2, gain: 0.3 },
  { freq: D5, beat: 13.25, beats: 0.75, gain: 0.24 },
  { freq: C5, beat: 14.0, beats: 1.0, gain: 0.28 },
  { freq: B4, beat: 15.0, beats: 1.0, gain: 0.26 },
  { freq: G4, beat: 16.0, beats: 1.0, gain: 0.24 },
  { freq: E4, beat: 17.0, beats: 1.0, gain: 0.22 },
  { freq: A4, beat: 18.0, beats: 1.0, gain: 0.28 },
  { freq: G4, beat: 19.0, beats: 1.0, gain: 0.26 },
  { freq: F4, beat: 20.0, beats: 1.0, gain: 0.24 },
  { freq: E4, beat: 21.0, beats: 1.0, gain: 0.26 },
  { freq: D4, beat: 22.0, beats: 1.0, gain: 0.24 },
  { freq: C4, beat: 23.0, beats: 1.0, gain: 0.28 },
];

/** Full loop: accompaniment + melody. */
export const RECITAL_LOOP: readonly MusicNote[] = [...ACCOMPANIMENT, ...MELODY];

/** Seconds per beat at MUSIC_BPM. */
export function secondsPerBeat(bpm: number = MUSIC_BPM): number {
  return 60 / bpm;
}
