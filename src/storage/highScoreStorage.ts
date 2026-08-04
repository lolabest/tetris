const HIGH_SCORE_KEY = "piano-blocks:high-score";

function readNumber(raw: string | null): number | null {
  if (raw === null) {
    return null;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.floor(value);
}

export function getHighScore(): number {
  try {
    return readNumber(localStorage.getItem(HIGH_SCORE_KEY)) ?? 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): number {
  const next = Math.max(0, Math.floor(score));
  const current = getHighScore();
  const best = Math.max(current, next);
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(best));
  } catch {
    // Storage may be unavailable (private mode); ignore.
  }
  return best;
}
