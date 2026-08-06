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
 * One achievement per level. Same locked pose; clothing only changes.
 * Sprites: public/muse/stage-XX.png
 */
export const LEVEL_ACHIEVEMENTS: readonly LevelAchievement[] = [
  {
    level: 1,
    id: "level-1",
    title: "Fully Dressed",
    description: "Jacket, top, trousers, and heels.",
    outfitLabel: "Jacket & trousers",
    imageSrc: "/muse/stage-01.png",
  },
  {
    level: 2,
    id: "level-2",
    title: "Jacket Off",
    description: "Reach level 2 — jacket removed.",
    outfitLabel: "Blouse & trousers",
    imageSrc: "/muse/stage-02.png",
  },
  {
    level: 3,
    id: "level-3",
    title: "Simplified",
    description: "Reach level 3 — accessories cleared.",
    outfitLabel: "Clean blouse look",
    imageSrc: "/muse/stage-03.png",
  },
  {
    level: 4,
    id: "level-4",
    title: "Top & Trousers",
    description: "Reach level 4 — top and trousers.",
    outfitLabel: "Top & trousers",
    imageSrc: "/muse/stage-04.png",
  },
  {
    level: 5,
    id: "level-5",
    title: "Lighter Layer",
    description: "Reach level 5 — lighter fitted top.",
    outfitLabel: "Light top & trousers",
    imageSrc: "/muse/stage-05.png",
  },
  {
    level: 6,
    id: "level-6",
    title: "Barefoot",
    description: "Reach level 6 — shoes and outer layer gone.",
    outfitLabel: "Top, trousers, barefoot",
    imageSrc: "/muse/stage-06.png",
  },
  {
    level: 7,
    id: "level-7",
    title: "Camisole & Shorts",
    description: "Reach level 7 — camisole and shorts.",
    outfitLabel: "Camisole & shorts",
    imageSrc: "/muse/stage-07.png",
  },
  {
    level: 8,
    id: "level-8",
    title: "Sleepwear",
    description: "Reach level 8 — soft sleepwear set.",
    outfitLabel: "Sleepwear set",
    imageSrc: "/muse/stage-08.png",
  },
  {
    level: 9,
    id: "level-9",
    title: "Partial Lace",
    description: "Reach level 9 — coordinated partial coverage.",
    outfitLabel: "Coordinated lingerie set",
    imageSrc: "/muse/stage-09.png",
  },
  {
    level: 10,
    id: "level-10",
    title: "Lace Finale",
    description: "Reach level 10 — elegant opaque lingerie.",
    outfitLabel: "Elegant lingerie",
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
