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
          A smoky lounge recital. Clear rows like pressing keys under amber
          light.
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
          Best score · {highScore.toLocaleString("en-US")}
        </p>
        <div className={styles.guide}>
          <h2 className={styles.guideTitle}>Controls</h2>
          <ul className={styles.list}>
            <li>
              <kbd>←</kbd>
              <kbd>→</kbd> Move
            </li>
            <li>
              <kbd>↓</kbd> Soft drop · <kbd>Space</kbd> Hard drop
            </li>
            <li>
              <kbd>↑</kbd>/<kbd>X</kbd> Rotate · <kbd>Z</kbd> Counter-rotate
            </li>
            <li>
              <kbd>C</kbd> Hold · <kbd>P</kbd>/<kbd>Esc</kbd> Pause
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
