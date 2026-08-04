import styles from "./GameStats.module.css";

interface GameStatsProps {
  readonly score: number;
  readonly level: number;
  readonly lines: number;
  readonly highScore: number;
}

function formatScore(n: number): string {
  return n.toLocaleString("en-US");
}

export function GameStats({ score, level, lines, highScore }: GameStatsProps) {
  return (
    <section
      className={styles.stats}
      aria-label="Game statistics"
      data-testid="game-stats"
    >
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
      <div className={styles.item}>
        <span className={styles.label}>Best</span>
        <span className={styles.value} data-testid="stat-high-score">
          {formatScore(highScore)}
        </span>
      </div>
    </section>
  );
}
