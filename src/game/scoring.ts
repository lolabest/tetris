import {
  HARD_DROP_POINTS,
  LINE_CLEAR_SCORES,
  LINES_PER_LEVEL,
  SOFT_DROP_POINTS,
} from "./constants";

export function softDropScore(cells: number): number {
  return Math.max(0, cells) * SOFT_DROP_POINTS;
}

export function hardDropScore(cells: number): number {
  return Math.max(0, cells) * HARD_DROP_POINTS;
}

export function lineClearScore(linesCleared: number, level: number): number {
  if (linesCleared < 1 || linesCleared > 4) {
    return 0;
  }
  const base = LINE_CLEAR_SCORES[linesCleared as 1 | 2 | 3 | 4];
  return base * Math.max(1, level);
}

export function levelFromLines(
  totalLines: number,
  linesPerLevel: number = LINES_PER_LEVEL,
): number {
  return Math.floor(Math.max(0, totalLines) / linesPerLevel) + 1;
}

/** Combo bonus: 50 × combo × level after the first clear in a chain. */
export function comboScore(combo: number, level: number): number {
  if (combo <= 0) {
    return 0;
  }
  return 50 * combo * Math.max(1, level);
}

export function computeScoreDelta(options: {
  softDropCells?: number;
  hardDropCells?: number;
  linesCleared?: number;
  level?: number;
  combo?: number;
}): number {
  const soft = softDropScore(options.softDropCells ?? 0);
  const hard = hardDropScore(options.hardDropCells ?? 0);
  const lines = lineClearScore(options.linesCleared ?? 0, options.level ?? 1);
  const combo = comboScore(options.combo ?? 0, options.level ?? 1);
  return soft + hard + lines + combo;
}
