import { TETROMINO_TYPES } from "./constants";
import type { RandomFn, TetrominoType } from "./types";

/**
 * Seven-bag randomizer: each bag contains all seven piece types exactly once,
 * shuffled with Fisher–Yates using the injected random function.
 */
export function createSevenBag(random: RandomFn): () => TetrominoType {
  let bag: TetrominoType[] = [];

  const refill = (): void => {
    bag = [...TETROMINO_TYPES];
    for (let i = bag.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const tmp = bag[i]!;
      bag[i] = bag[j]!;
      bag[j] = tmp;
    }
  };

  return (): TetrominoType => {
    if (bag.length === 0) {
      refill();
    }
    return bag.pop()!;
  };
}

/**
 * Mulberry32 — small seeded PRNG for deterministic tests.
 * Returns values in [0, 1).
 */
export function createSeededRandom(seed: number): RandomFn {
  let state = seed >>> 0;
  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
