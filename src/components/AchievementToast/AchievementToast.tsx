import type { LevelAchievement } from "../../achievements/levelAchievements";
import styles from "./AchievementToast.module.css";

interface AchievementToastProps {
  readonly achievement: LevelAchievement;
}

export function AchievementToast({ achievement }: AchievementToastProps) {
  return (
    <div
      className={styles.toast}
      role="status"
      aria-live="polite"
      data-testid="achievement-toast"
    >
      <p className={styles.eyebrow}>Level {achievement.level} unlocked</p>
      <p className={styles.title}>{achievement.title}</p>
      <p className={styles.detail}>{achievement.outfitLabel}</p>
    </div>
  );
}
