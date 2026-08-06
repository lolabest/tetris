import styles from "./Overlay.module.css";

interface PauseOverlayProps {
  readonly onResume: () => void;
  readonly onRestart: () => void;
}

export function PauseOverlay({ onResume, onRestart }: PauseOverlayProps) {
  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      data-testid="pause-overlay"
    >
      <div className={styles.card}>
        <h2 id="pause-title" className={styles.title}>
          Paused
        </h2>
        <p className={styles.copy}>Take a breath. The keys will wait.</p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={onResume}
            data-testid="resume-button"
          >
            Resume
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={onRestart}
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
