/**
 * Original late-night jazz piano loop for Piano Blocks.
 * Melody-forward lounge jazz — not based on any copyrighted composition.
 */

export interface MusicNote {
  readonly freq: number;
  readonly beat: number;
  readonly beats: number;
  readonly gain?: number;
  readonly wave?: OscillatorType;
}

/** Laid-back lounge tempo — room for lyrical phrases. */
export const MUSIC_BPM = 84;

/** 16 bars of 4/4 = 64 beats (full A–A–B–A melody form). */
export const MUSIC_LOOP_BEATS = 64;

const C2 = 65.41;
const F2 = 87.31;
const G2 = 98.0;
const A2 = 110.0;
const D3 = 146.83;
const Eb3 = 155.56;
const E3 = 164.81;
const F3 = 174.61;
const G3 = 196.0;
const A3 = 220.0;
const Bb3 = 233.08;
const B3 = 246.94;
const C4 = 261.63;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.0;
const A4 = 440.0;
const Bb4 = 466.16;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const Eb5 = 622.25;
const E5 = 659.25;
const F5 = 698.46;
const G5 = 783.99;

const SWING_LONG = 2 / 3;
const SWING_SHORT = 1 / 3;

function n(
  freq: number,
  beat: number,
  beats: number,
  gain = 0.34,
  wave: OscillatorType = "sine",
): MusicNote {
  return { freq, beat, beats, gain, wave };
}

function swingPair(
  beat: number,
  a: number,
  b: number,
  gain = 0.34,
): MusicNote[] {
  return [
    n(a, beat, SWING_LONG, gain),
    n(b, beat + SWING_LONG, SWING_SHORT, gain * 0.92),
  ];
}

/** Soft left-hand bed — quieter so the melody leads. */
function compBar(
  root: number,
  color: number,
  fifth: number,
  start: number,
): MusicNote[] {
  return [
    n(root, start, 1.5, 0.14, "triangle"),
    n(color, start + 0.5, 0.5, 0.08),
    n(fifth, start + 1, 0.5, 0.08),
    n(root * 2, start + 2, 1, 0.12, "triangle"),
    n(color, start + 3, 0.5, 0.07),
    n(fifth * 0.5, start + 3.5, 0.5, 0.08, "triangle"),
  ];
}

const ACCOMPANIMENT: readonly MusicNote[] = [
  ...compBar(C2, E3, Bb3, 0),
  ...compBar(F2, A3, Eb3, 4),
  ...compBar(C2, G3, Bb3, 8),
  ...compBar(G2, B3, F3, 12),
  ...compBar(C2, E3, Bb3, 16),
  ...compBar(F2, A3, Eb3, 20),
  ...compBar(C2, G3, Bb3, 24),
  ...compBar(G2, B3, F3, 28),
  ...compBar(A2, C4, G3, 32),
  ...compBar(D3, F3, C4, 36),
  ...compBar(G2, B3, F3, 40),
  ...compBar(C2, E3, A3, 44),
  ...compBar(C2, E3, Bb3, 48),
  ...compBar(F2, A3, Eb3, 52),
  ...compBar(G2, B3, F3, 56),
  ...compBar(C2, E3, G3, 60),
];

/**
 * Clear singable theme — "Ivory Midnight"
 * A–A–B–A form with a strong hook and lyrical bridge.
 */
const MELODY_LEAD: readonly MusicNote[] = [
  // A1
  n(E4, 0, 0.75, 0.42),
  n(G4, 0.75, 0.25, 0.34),
  n(C5, 1, 1.5, 0.48),
  n(Bb4, 2.5, 0.5, 0.38),
  n(A4, 3, 0.5, 0.36),
  n(G4, 3.5, 0.5, 0.36),

  n(F4, 4, 0.75, 0.4),
  n(A4, 4.75, 0.25, 0.34),
  n(D5, 5, 1.25, 0.48),
  n(C5, 6.25, 0.75, 0.4),
  n(A4, 7, 1, 0.38),

  n(E4, 8, 0.5, 0.38),
  n(G4, 8.5, 0.5, 0.36),
  n(C5, 9, 1, 0.44),
  n(E5, 10, 1.5, 0.5),
  n(D5, 11.5, 0.5, 0.38),

  n(B4, 12, 1, 0.42),
  n(A4, 13, 0.5, 0.36),
  n(G4, 13.5, 0.5, 0.36),
  n(F4, 14, 0.75, 0.38),
  n(E4, 14.75, 1.25, 0.42),

  // A2 ornamented
  n(E4, 16, 0.5, 0.4),
  ...swingPair(16.5, G4, Bb4, 0.38),
  n(C5, 17.5, 1.5, 0.48),
  n(D5, 19, 0.5, 0.38),
  n(Eb5, 19.5, 0.5, 0.36),

  n(F5, 20, 0.75, 0.46),
  n(E5, 20.75, 0.25, 0.34),
  n(D5, 21, 1, 0.42),
  n(C5, 22, 0.75, 0.4),
  n(A4, 22.75, 0.25, 0.32),
  n(F4, 23, 1, 0.38),

  n(G4, 24, 0.5, 0.38),
  n(C5, 24.5, 0.5, 0.4),
  n(E5, 25, 1.25, 0.5),
  n(G5, 26.25, 0.75, 0.46),
  n(E5, 27, 1, 0.42),

  n(D5, 28, 0.75, 0.42),
  n(B4, 28.75, 0.25, 0.32),
  n(A4, 29, 0.5, 0.36),
  n(G4, 29.5, 0.5, 0.36),
  n(F4, 30, 0.5, 0.36),
  n(E4, 30.5, 1.5, 0.42),

  // B bridge
  n(A4, 32, 1, 0.42),
  n(C5, 33, 1, 0.44),
  n(E5, 34, 1.5, 0.5),
  n(D5, 35.5, 0.5, 0.38),

  n(C5, 36, 0.75, 0.42),
  n(A4, 36.75, 0.25, 0.32),
  n(F5, 37, 1.25, 0.48),
  n(E5, 38.25, 0.75, 0.4),
  n(D5, 39, 1, 0.42),

  n(B4, 40, 0.75, 0.42),
  n(D5, 40.75, 0.25, 0.34),
  n(G5, 41, 1.5, 0.5),
  n(F5, 42.5, 0.5, 0.38),
  n(E5, 43, 0.5, 0.38),
  n(D5, 43.5, 0.5, 0.36),

  n(C5, 44, 1.25, 0.44),
  n(Bb4, 45.25, 0.75, 0.38),
  n(A4, 46, 0.75, 0.38),
  n(G4, 46.75, 1.25, 0.42),

  // A3 return
  n(E4, 48, 0.5, 0.4),
  n(G4, 48.5, 0.5, 0.38),
  n(C5, 49, 1.5, 0.5),
  n(E5, 50.5, 0.5, 0.42),
  n(G5, 51, 1, 0.48),

  n(F5, 52, 0.75, 0.46),
  n(D5, 52.75, 0.25, 0.34),
  n(C5, 53, 1, 0.42),
  n(A4, 54, 0.75, 0.38),
  n(F4, 54.75, 0.25, 0.3),
  n(A4, 55, 1, 0.4),

  n(G4, 56, 0.5, 0.38),
  n(B4, 56.5, 0.5, 0.38),
  n(D5, 57, 1, 0.44),
  n(F5, 58, 0.75, 0.42),
  n(E5, 58.75, 0.25, 0.34),
  n(D5, 59, 1, 0.4),

  n(C5, 60, 1.5, 0.5),
  n(G4, 61.5, 0.5, 0.36),
  n(E4, 62, 0.75, 0.4),
  n(C4, 62.75, 1.25, 0.44),
];

const MELODY_DOUBLE: readonly MusicNote[] = [
  n(C4, 1, 1.5, 0.16),
  n(C5, 1, 1.5, 0.14, "triangle"),
  n(D5, 5, 1.25, 0.12, "triangle"),
  n(E4, 10, 1.5, 0.16),
  n(E5, 10, 1.5, 0.14, "triangle"),
  n(C4, 17.5, 1.5, 0.14),
  n(E4, 25, 1.25, 0.16),
  n(E5, 25, 1.25, 0.14, "triangle"),
  n(A3, 32, 1, 0.12),
  n(E4, 34, 1.5, 0.16),
  n(E5, 34, 1.5, 0.14, "triangle"),
  n(G4, 41, 1.5, 0.16),
  n(G5, 41, 1.5, 0.14, "triangle"),
  n(C4, 49, 1.5, 0.16),
  n(C5, 49, 1.5, 0.18, "triangle"),
  n(G4, 51, 1, 0.16),
  n(C4, 60, 1.5, 0.18),
  n(C5, 60, 1.5, 0.2, "triangle"),
  n(E4, 62.75, 1.25, 0.16),
];

const COUNTER_MELODY: readonly MusicNote[] = [
  n(G3, 2.5, 0.5, 0.11),
  n(E3, 3.5, 0.5, 0.1),
  n(A3, 6.25, 0.5, 0.11),
  n(F3, 7.5, 0.5, 0.1),
  n(Bb3, 11.5, 0.5, 0.11),
  n(G3, 15.5, 0.5, 0.1),
  n(C4, 19.5, 0.5, 0.11),
  n(A3, 23.5, 0.5, 0.1),
  n(D3, 27.5, 0.5, 0.1),
  n(B3, 31.5, 0.5, 0.1),
  n(E4, 35.5, 0.5, 0.11),
  n(C4, 39.5, 0.5, 0.1),
  n(F4, 43.5, 0.5, 0.11),
  n(D3, 47.5, 0.5, 0.1),
  n(G3, 55.5, 0.5, 0.1),
  n(B3, 59.5, 0.5, 0.1),
];

/** Warm saxophone answers — original phrases, not a copyrighted tune. */
const SAX_VOICE: readonly MusicNote[] = [
  n(G4, 2, 1.25, 0.22, "sawtooth"),
  n(E4, 3.5, 0.75, 0.18, "sawtooth"),
  n(A4, 6, 1.5, 0.24, "sawtooth"),
  n(F4, 10.5, 1.25, 0.2, "sawtooth"),
  n(C5, 14, 1.5, 0.22, "triangle"),
  n(Bb4, 18.5, 1, 0.2, "sawtooth"),
  n(G4, 22, 1.25, 0.22, "sawtooth"),
  n(E5, 26.5, 1.5, 0.24, "triangle"),
  n(D5, 33, 1.25, 0.22, "sawtooth"),
  n(C5, 37.5, 1.5, 0.24, "sawtooth"),
  n(A4, 42, 1.25, 0.2, "triangle"),
  n(G4, 46.5, 1, 0.18, "sawtooth"),
  n(E4, 50.5, 1.25, 0.2, "sawtooth"),
  n(C5, 54.5, 1.5, 0.24, "triangle"),
  n(G4, 61, 2, 0.22, "sawtooth"),
];

export const RECITAL_LOOP: readonly MusicNote[] = [
  ...ACCOMPANIMENT,
  ...MELODY_LEAD,
  ...MELODY_DOUBLE,
  ...COUNTER_MELODY,
  ...SAX_VOICE,
];

export function secondsPerBeat(bpm: number = MUSIC_BPM): number {
  return 60 / bpm;
}
