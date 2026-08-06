/** Level achievements & stage-muse outfit progression for Piano Blocks. */

export interface LevelAchievement {
  readonly level: number;
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly outfitLabel: string;
}

/**
 * One achievement per level. Reaching the level unlocks the reward and
 * advances Miss Melody's stage wardrobe (Marilyn-inspired glam, fictional).
 */
export const LEVEL_ACHIEVEMENTS: readonly LevelAchievement[] = [
  {
    level: 1,
    id: "level-1",
    title: "First Ivory",
    description: "Open the recital at level 1.",
    outfitLabel: "White evening gown & fur",
  },
  {
    level: 2,
    id: "level-2",
    title: "Warm Spotlight",
    description: "Reach level 2 — the stole comes off.",
    outfitLabel: "Evening gown",
  },
  {
    level: 3,
    id: "level-3",
    title: "Satin Hands",
    description: "Reach level 3 — gloves slip away.",
    outfitLabel: "Gown, bare hands",
  },
  {
    level: 4,
    id: "level-4",
    title: "Cocktail Hour",
    description: "Reach level 4 — gown becomes a cocktail dress.",
    outfitLabel: "Cocktail dress",
  },
  {
    level: 5,
    id: "level-5",
    title: "Strapless Glow",
    description: "Reach level 5 — shoulders bare under the lights.",
    outfitLabel: "Strapless dress",
  },
  {
    level: 6,
    id: "level-6",
    title: "Silk Slip",
    description: "Reach level 6 — dress gives way to a silk slip.",
    outfitLabel: "Silk slip",
  },
  {
    level: 7,
    id: "level-7",
    title: "Corset Cadence",
    description: "Reach level 7 — corset and stockings only.",
    outfitLabel: "Corset & stockings",
  },
  {
    level: 8,
    id: "level-8",
    title: "Lingerie Motif",
    description: "Reach level 8 — lingerie under the amber glow.",
    outfitLabel: "Lingerie",
  },
  {
    level: 9,
    id: "level-9",
    title: "Stage Bikini",
    description: "Reach level 9 — swimsuit sparkle on the boards.",
    outfitLabel: "Stage bikini",
  },
  {
    level: 10,
    id: "level-10",
    title: "Fair Spotlight",
    description: "Reach level 10 — fair skin under the final spotlight.",
    outfitLabel: "Fair pin-up",
  },
] as const;

export const MAX_MUSE_LEVEL = LEVEL_ACHIEVEMENTS.length;

export function achievementForLevel(
  level: number,
): LevelAchievement | undefined {
  const capped = Math.min(Math.max(1, Math.floor(level)), MAX_MUSE_LEVEL);
  return LEVEL_ACHIEVEMENTS[capped - 1];
}

/** Outfit stage index 1..MAX_MUSE_LEVEL from highest unlocked level. */
export function outfitStageForLevel(level: number): number {
  return Math.min(Math.max(1, Math.floor(level)), MAX_MUSE_LEVEL);
}
