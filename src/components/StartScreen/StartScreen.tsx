import styles from "./StartScreen.module.css";

interface StartScreenProps {
  readonly highScore: number;
  readonly onStart: () => void;
}

export function StartScreen({ highScore, onStart }: StartScreenProps) {
  return (
    <section className={styles.screen} aria-labelledby="start-title">
      <div className={styles.content}>
        <p className={styles.eyebrow}>Every block plays a note.</p>
        <h1 id="start-title" className={styles.title}>
          Piano Blocks
        </h1>
        <p className={styles.tagline}>
          Turn falling piano keys into rhythm, clear the stage, and keep the
          melody alive.
        </p>
        <button
          type="button"
          className={styles.cta}
          onClick={onStart}
          data-testid="start-button"
        >
          Begin recital
        </button>
        <p className={styles.best}>
          Best · {highScore.toLocaleString("en-US")}
        </p>
      </div>
    </section>
  );
}
