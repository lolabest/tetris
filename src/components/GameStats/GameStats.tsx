import styles from "./GameStats.module.css";

interface GameStatsProps {
  readonly score: number;
  readonly level: number;
  readonly lines: number;
  readonly combo: number;
}

function formatScore(n: number): string {
  return n.toLocaleString("en-US");
}

export function GameStats({ score, level, lines, combo }: GameStatsProps) {
  return (
    <section
      className={styles.stats}
      aria-label="Concert program"
      data-testid="game-stats"
    >
      <h2 className={styles.heading}>Program</h2>
      <div className={styles.item}>
        <span className={styles.label}>Score</span>
        <span className={styles.value} data-testid="stat-score">
          {formatScore(score)}
        </span>
      </div>
      <div className={styles.item}>
        <span className={styles.label}>Level</span>
        <span className={styles.value} data-testid="stat-level">
          {level}
        </span>
      </div>
      <div className={styles.item}>
        <span className={styles.label}>Lines</span>
        <span className={styles.value} data-testid="stat-lines">
          {lines}
        </span>
      </div>
      <div className={`${styles.item} ${combo > 0 ? styles.comboHot : ""}`}>
        <span className={styles.label}>Combo</span>
        <span className={styles.value} data-testid="stat-combo">
          {combo > 0 ? `×${combo}` : "—"}
        </span>
      </div>
    </section>
  );
}
