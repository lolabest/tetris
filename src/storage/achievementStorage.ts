import {
  LEVEL_ACHIEVEMENTS,
  MAX_MUSE_LEVEL,
  type LevelAchievement,
} from "../achievements/levelAchievements";

const ACHIEVEMENTS_KEY = "piano-blocks:achievements";

export interface AchievementProgress {
  /** Highest level ever reached (1-indexed). */
  readonly highestLevel: number;
  /** Achievement ids unlocked. */
  readonly unlockedIds: readonly string[];
}

const defaultProgress: AchievementProgress = {
  highestLevel: 0,
  unlockedIds: [],
};

function normalize(raw: unknown): AchievementProgress {
  if (typeof raw !== "object" || raw === null) {
    return defaultProgress;
  }
  const obj = raw as Record<string, unknown>;
  const highestLevel =
    typeof obj["highestLevel"] === "number" &&
    Number.isFinite(obj["highestLevel"])
      ? Math.max(0, Math.min(MAX_MUSE_LEVEL, Math.floor(obj["highestLevel"])))
      : 0;
  const unlockedIds = Array.isArray(obj["unlockedIds"])
    ? obj["unlockedIds"].filter((id): id is string => typeof id === "string")
    : [];
  return { highestLevel, unlockedIds };
}

export function loadAchievementProgress(): AchievementProgress {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) {
      return defaultProgress;
    }
    return normalize(JSON.parse(raw) as unknown);
  } catch {
    return defaultProgress;
  }
}

function saveProgress(progress: AchievementProgress): AchievementProgress {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
  return progress;
}

/**
 * Record that the player reached `level`. Returns newly unlocked achievements.
 */
export function unlockLevelAchievements(level: number): {
  progress: AchievementProgress;
  newlyUnlocked: readonly LevelAchievement[];
} {
  const safeLevel = Math.max(0, Math.floor(level));
  const prev = loadAchievementProgress();
  if (safeLevel <= prev.highestLevel) {
    return { progress: prev, newlyUnlocked: [] };
  }

  const nextHighest = Math.min(MAX_MUSE_LEVEL, safeLevel);
  const unlocked = new Set(prev.unlockedIds);
  const newlyUnlocked: LevelAchievement[] = [];

  for (const achievement of LEVEL_ACHIEVEMENTS) {
    if (achievement.level <= nextHighest && !unlocked.has(achievement.id)) {
      unlocked.add(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  const progress = saveProgress({
    highestLevel: Math.max(prev.highestLevel, nextHighest),
    unlockedIds: [...unlocked],
  });

  return { progress, newlyUnlocked };
}

export function isAchievementUnlocked(
  progress: AchievementProgress,
  id: string,
): boolean {
  return progress.unlockedIds.includes(id);
}

/** Cheat / debug: wipe saved achievement progress. */
export function resetAchievementProgress(): AchievementProgress {
  return saveProgress({ ...defaultProgress });
}
