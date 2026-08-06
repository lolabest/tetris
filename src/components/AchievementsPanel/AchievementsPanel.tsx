import {
  LEVEL_ACHIEVEMENTS,
  type LevelAchievement,
} from "../../achievements/levelAchievements";
import {
  isAchievementUnlocked,
  type AchievementProgress,
} from "../../storage/achievementStorage";
import { StageMuse } from "../StageMuse/StageMuse";
import styles from "./AchievementsPanel.module.css";

interface AchievementsPanelProps {
  readonly progress: AchievementProgress;
  readonly onClose: () => void;
}

export function AchievementsPanel({
  progress,
  onClose,
}: AchievementsPanelProps) {
  const displayLevel = Math.max(1, progress.highestLevel || 1);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-title"
      data-testid="achievements-panel"
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Stage rewards</p>
            <h2 id="achievements-title" className={styles.title}>
              Achievements
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close achievements"
          >
            Close
          </button>
        </header>

        <div className={styles.body}>
          <StageMuse level={displayLevel} />

          <ul className={styles.list}>
            {LEVEL_ACHIEVEMENTS.map((achievement) => (
              <AchievementRow
                key={achievement.id}
                achievement={achievement}
                unlocked={isAchievementUnlocked(progress, achievement.id)}
              />
            ))}
          </ul>
        </div>

        <p className={styles.hint}>
          Clear lines to rise through levels — each level unlocks a reward and
          reveals more of Miss Melody&apos;s stage look.
        </p>
      </div>
    </div>
  );
}

function AchievementRow({
  achievement,
  unlocked,
}: {
  readonly achievement: LevelAchievement;
  readonly unlocked: boolean;
}) {
  return (
    <li
      className={`${styles.row} ${unlocked ? styles.unlocked : styles.locked}`}
      data-testid={`achievement-${achievement.id}`}
    >
      <span className={styles.badge}>Lv {achievement.level}</span>
      <div className={styles.meta}>
        <span className={styles.rowTitle}>{achievement.title}</span>
        <span className={styles.rowDesc}>
          {unlocked ? achievement.description : "Locked — keep clearing keys."}
        </span>
        {unlocked ? (
          <span className={styles.outfit}>{achievement.outfitLabel}</span>
        ) : null}
      </div>
      <span className={styles.status}>{unlocked ? "Unlocked" : "Locked"}</span>
    </li>
  );
}
