import styles from "./StartScreen.module.css";

interface StartScreenProps {
  readonly highScore: number;
  readonly onStart: () => void;
}

export function StartScreen({ highScore, onStart }: StartScreenProps) {
  return (
    <section className={styles.screen} aria-labelledby="start-title">
      <div className={styles.content}>
        <p className={styles.eyebrow}>Old jazz · late ivory</p>
        <h1 id="start-title" className={styles.title}>
          Piano Blocks
        </h1>
        <p className={styles.tagline}>
          A smoky lounge recital under amber light.
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
