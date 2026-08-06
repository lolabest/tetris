/** Level achievements & stage-muse outfit progression for Piano Blocks. */

export interface LevelAchievement {
  readonly level: number;
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly outfitLabel: string;
  /** High-resolution portrait under /muse/ (transparent PNG sprites). */
  readonly imageSrc: string;
}

/**
 * Vintage pin-up / theatrical burlesque wardrobe ladder.
 * Same locked pose; clothing only changes.
 */
export const LEVEL_ACHIEVEMENTS: readonly LevelAchievement[] = [
  {
    level: 1,
    id: "level-1",
    title: "Cabaret Entrance",
    description: "Velvet jacket, pencil skirt, gloves, and fascinator.",
    outfitLabel: "Velvet jacket & fascinator",
    imageSrc: "/muse/stage-01.png",
  },
  {
    level: 2,
    id: "level-2",
    title: "Jacket Off",
    description: "Jacket removed — glamorous satin top revealed.",
    outfitLabel: "Satin top & gloves",
    imageSrc: "/muse/stage-02.png",
  },
  {
    level: 3,
    id: "level-3",
    title: "Bare Hands",
    description: "Fascinator and opera gloves removed.",
    outfitLabel: "Satin top & pencil skirt",
    imageSrc: "/muse/stage-03.png",
  },
  {
    level: 4,
    id: "level-4",
    title: "Midnight Velvet",
    description: "Structured black velvet cabaret silhouette.",
    outfitLabel: "Black velvet stage look",
    imageSrc: "/muse/stage-04.png",
  },
  {
    level: 5,
    id: "level-5",
    title: "Crimson Slit",
    description: "Red satin skirt with gold trim takes the spotlight.",
    outfitLabel: "Crimson satin skirt",
    imageSrc: "/muse/stage-05.png",
  },
  {
    level: 6,
    id: "level-6",
    title: "Gold Spotlight",
    description: "Gold satin skirt and bare arms under the lights.",
    outfitLabel: "Gold satin cabaret",
    imageSrc: "/muse/stage-06.png",
  },
  {
    level: 7,
    id: "level-7",
    title: "Ruby Gown",
    description: "Deep red satin pin-up gown.",
    outfitLabel: "Ruby satin gown",
    imageSrc: "/muse/stage-07.png",
  },
  {
    level: 8,
    id: "level-8",
    title: "Noir Velvet",
    description: "Black velvet with crimson accents.",
    outfitLabel: "Black velvet & crimson",
    imageSrc: "/muse/stage-08.png",
  },
  {
    level: 9,
    id: "level-9",
    title: "Ivory Lace",
    description: "Ivory satin with black lace trim.",
    outfitLabel: "Ivory lace satin",
    imageSrc: "/muse/stage-09.png",
  },
  {
    level: 10,
    id: "level-10",
    title: "Finale Noir",
    description: "Final black velvet burlesque finale look.",
    outfitLabel: "Black velvet finale",
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
