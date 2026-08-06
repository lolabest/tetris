import {
  achievementForLevel,
  museImageForLevel,
  outfitStageForLevel,
} from "../../achievements/levelAchievements";
import styles from "./StageMuse.module.css";

interface StageMuseProps {
  /** Highest unlocked / current display level. */
  readonly level: number;
  readonly compact?: boolean;
  readonly celebrate?: boolean;
  /** Larger portrait presentation (achievements panel / lightbox). */
  readonly large?: boolean;
}

/**
 * Photoreal stage muse — hi-res portraits that change with each level.
 */
export function StageMuse({
  level,
  compact = false,
  celebrate = false,
  large = false,
}: StageMuseProps) {
  const stage = outfitStageForLevel(Math.max(1, level || 1));
  const achievement = achievementForLevel(stage);
  // Cache-bust when sprite pack updates
  const src = `${museImageForLevel(stage)}?v=burlesque-1`;

  return (
    <figure
      className={`${styles.root} ${compact ? styles.compact : ""} ${large ? styles.large : ""} ${celebrate ? styles.celebrate : ""}`}
      data-testid="stage-muse"
      data-stage={stage}
      aria-label={`Miss Melody, ${achievement?.outfitLabel ?? "stage outfit"}`}
    >
      <div className={styles.frame}>
        <img
          className={styles.photo}
          src={src}
          alt={`Miss Melody — ${achievement?.outfitLabel ?? `level ${stage}`}`}
          width={1536}
          height={2304}
          decoding="async"
          loading={compact ? "lazy" : "eager"}
          draggable={false}
        />
        <div className={styles.vignette} aria-hidden="true" />
      </div>

      <figcaption className={styles.caption}>
        <span className={styles.name}>Miss Melody</span>
        <span className={styles.outfit}>{achievement?.outfitLabel}</span>
        <span className={styles.level}>Level {stage} reveal</span>
      </figcaption>
    </figure>
  );
}
