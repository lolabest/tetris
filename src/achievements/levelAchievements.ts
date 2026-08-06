/** Level achievements & stage-muse outfit progression for Piano Blocks. */

export interface LevelAchievement {
  readonly level: number;
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly outfitLabel: string;
  /** High-resolution portrait under /muse/ */
  readonly imageSrc: string;
}

/**
 * One achievement per level. Reaching the level unlocks the reward and
 * advances Miss Melody's hi-res stage wardrobe.
 */
export const LEVEL_ACHIEVEMENTS: readonly LevelAchievement[] = [
  {
    level: 1,
    id: "level-1",
    title: "First Ivory",
    description: "Open the recital at level 1.",
    outfitLabel: "Ivory gown & fur",
    imageSrc: "/muse/stage-01.png",
  },
  {
    level: 2,
    id: "level-2",
    title: "Warm Spotlight",
    description: "Reach level 2 — the stole comes off.",
    outfitLabel: "Ivory evening gown",
    imageSrc: "/muse/stage-02.png",
  },
  {
    level: 3,
    id: "level-3",
    title: "Satin Hands",
    description: "Reach level 3 — gloves slip away.",
    outfitLabel: "Gown, bare hands",
    imageSrc: "/muse/stage-03.png",
  },
  {
    level: 4,
    id: "level-4",
    title: "Cocktail Hour",
    description: "Reach level 4 — the gown becomes a cocktail dress.",
    outfitLabel: "Cream cocktail dress",
    imageSrc: "/muse/stage-04.png",
  },
  {
    level: 5,
    id: "level-5",
    title: "Strapless Glow",
    description: "Reach level 5 — shoulders bare under the lights.",
    outfitLabel: "Strapless satin dress",
    imageSrc: "/muse/stage-05.png",
  },
  {
    level: 6,
    id: "level-6",
    title: "Silk Slip",
    description: "Reach level 6 — dress gives way to a silk slip.",
    outfitLabel: "Blush silk slip",
    imageSrc: "/muse/stage-06.png",
  },
  {
    level: 7,
    id: "level-7",
    title: "Robe Interlude",
    description: "Reach level 7 — silk robe between sets.",
    outfitLabel: "Ivory silk robe",
    imageSrc: "/muse/stage-07.png",
  },
  {
    level: 8,
    id: "level-8",
    title: "Sequin Motif",
    description: "Reach level 8 — champagne sequins catch the light.",
    outfitLabel: "Champagne sequin dress",
    imageSrc: "/muse/stage-08.png",
  },
  {
    level: 9,
    id: "level-9",
    title: "Closer Spotlight",
    description: "Reach level 9 — the spotlight pulls in tight.",
    outfitLabel: "Spotlight encore dress",
    imageSrc: "/muse/stage-09.png",
  },
  {
    level: 10,
    id: "level-10",
    title: "Final Fair",
    description: "Reach level 10 — cashmere wrap for the final bow.",
    outfitLabel: "Fair wrap encore",
    imageSrc: "/muse/stage-10.png",
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

export function museImageForLevel(level: number): string {
  return (
    achievementForLevel(level)?.imageSrc ?? LEVEL_ACHIEVEMENTS[0]!.imageSrc
  );
}
