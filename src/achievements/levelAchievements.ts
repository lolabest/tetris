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
 * One achievement per level. Same microphone stage scene;
 * each level removes / changes the outfit. Level 10 = lingerie.
 */
export const LEVEL_ACHIEVEMENTS: readonly LevelAchievement[] = [
  {
    level: 1,
    id: "level-1",
    title: "First Ivory",
    description: "Open the recital — full gown, fur, and gloves.",
    outfitLabel: "Gown, fur & gloves",
    imageSrc: "/muse/stage-01.png",
  },
  {
    level: 2,
    id: "level-2",
    title: "Stole Away",
    description: "Reach level 2 — the fur stole comes off.",
    outfitLabel: "Ivory evening gown",
    imageSrc: "/muse/stage-02.png",
  },
  {
    level: 3,
    id: "level-3",
    title: "Midnight Gown",
    description: "Reach level 3 — black gown under the lights.",
    outfitLabel: "Black evening gown",
    imageSrc: "/muse/stage-03.png",
  },
  {
    level: 4,
    id: "level-4",
    title: "Cocktail Hour",
    description: "Reach level 4 — hem rises to a cocktail dress.",
    outfitLabel: "Champagne cocktail",
    imageSrc: "/muse/stage-04.png",
  },
  {
    level: 5,
    id: "level-5",
    title: "Strapless Glow",
    description: "Reach level 5 — shoulders bare, strapless satin.",
    outfitLabel: "White strapless dress",
    imageSrc: "/muse/stage-05.png",
  },
  {
    level: 6,
    id: "level-6",
    title: "Blush Satin",
    description: "Reach level 6 — soft blush satin on the mic.",
    outfitLabel: "Blush satin dress",
    imageSrc: "/muse/stage-06.png",
  },
  {
    level: 7,
    id: "level-7",
    title: "Robe Interlude",
    description: "Reach level 7 — silk robe between numbers.",
    outfitLabel: "Ivory silk robe",
    imageSrc: "/muse/stage-07.png",
  },
  {
    level: 8,
    id: "level-8",
    title: "Emerald Spark",
    description: "Reach level 8 — short emerald sequin mini.",
    outfitLabel: "Emerald sequin mini",
    imageSrc: "/muse/stage-08.png",
  },
  {
    level: 9,
    id: "level-9",
    title: "Silver Encore",
    description: "Reach level 9 — silver sequins catch the spotlight.",
    outfitLabel: "Silver sequin mini",
    imageSrc: "/muse/stage-09.png",
  },
  {
    level: 10,
    id: "level-10",
    title: "Lace Finale",
    description: "Reach level 10 — white lace lingerie at the mic.",
    outfitLabel: "White lace lingerie",
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
