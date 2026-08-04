import type { EngineConfig, TetrominoType } from "./types";

export const BOARD_WIDTH = 10;
export const VISIBLE_HEIGHT = 20;
export const BUFFER_ROWS = 2;
export const TOTAL_HEIGHT = VISIBLE_HEIGHT + BUFFER_ROWS;

export const PREVIEW_COUNT = 3;
export const LINES_PER_LEVEL = 10;

export const INITIAL_DROP_MS = 800;
export const MIN_DROP_MS = 80;
export const DROP_CURVE_FACTOR = 0.85;

export const LOCK_DELAY_MS = 500;
export const MAX_LOCK_RESETS = 15;
export const CLEAR_ANIMATION_MS = 320;

export const SOFT_DROP_POINTS = 1;
export const HARD_DROP_POINTS = 2;

/** Base line-clear scores before level multiplier (Guideline-inspired). */
export const LINE_CLEAR_SCORES: Readonly<Record<1 | 2 | 3 | 4, number>> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export const TETROMINO_TYPES: readonly TetrominoType[] = [
  "I",
  "O",
  "T",
  "S",
  "Z",
  "J",
  "L",
] as const;

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  boardWidth: BOARD_WIDTH,
  boardHeight: TOTAL_HEIGHT,
  bufferRows: BUFFER_ROWS,
  lockDelayMs: LOCK_DELAY_MS,
  maxLockResets: MAX_LOCK_RESETS,
  clearAnimationMs: CLEAR_ANIMATION_MS,
  previewCount: PREVIEW_COUNT,
  linesPerLevel: LINES_PER_LEVEL,
  initialDropMs: INITIAL_DROP_MS,
  minDropMs: MIN_DROP_MS,
};

/**
 * Drop interval for a given level (1-indexed).
 * Level 1 starts at INITIAL_DROP_MS and approaches MIN_DROP_MS asymptotically.
 */
export function dropIntervalForLevel(
  level: number,
  config: EngineConfig = DEFAULT_ENGINE_CONFIG,
): number {
  const safeLevel = Math.max(1, level);
  const interval =
    config.initialDropMs * Math.pow(DROP_CURVE_FACTOR, safeLevel - 1);
  return Math.max(config.minDropMs, Math.round(interval));
}
