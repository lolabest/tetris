import styles from "./Overlay.module.css";

interface GameOverModalProps {
  readonly score: number;
  readonly highScore: number;
  readonly lines: number;
  readonly level: number;
  readonly onRestart: () => void;
  readonly onMenu: () => void;
}

export function GameOverModal({
  score,
  highScore,
  lines,
  level,
  onRestart,
  onMenu,
}: GameOverModalProps) {
  const isNewBest = score >= highScore && score > 0;
  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
      data-testid="game-over-modal"
    >
      <div className={styles.card}>
        <h2 id="gameover-title" className={styles.title}>
          Recital ended
        </h2>
        <p className={styles.copy}>
          {isNewBest
            ? "A new high score — beautifully played."
            : "The final chord has settled."}
        </p>
        <dl className={styles.stats}>
          <div>
            <dt>Score</dt>
            <dd>{score.toLocaleString("en-US")}</dd>
          </div>
          <div>
            <dt>Best</dt>
            <dd>{highScore.toLocaleString("en-US")}</dd>
          </div>
          <div>
            <dt>Lines</dt>
            <dd>{lines}</dd>
          </div>
          <div>
            <dt>Level</dt>
            <dd>{level}</dd>
          </div>
        </dl>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={onRestart}
            data-testid="play-again-button"
          >
            Play again
          </button>
          <button type="button" className={styles.secondary} onClick={onMenu}>
            Main menu
          </button>
        </div>
      </div>
    </div>
  );
}
