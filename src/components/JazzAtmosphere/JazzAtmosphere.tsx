import styles from "./JazzAtmosphere.module.css";

/**
 * Full-bleed night-stage backdrop: piano boy + prominent saxophonist.
 * Dimmed and blurred so the game board stays the primary focus.
 */
export function JazzAtmosphere() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.photo} />
      <div className={styles.vignette} />
      <div className={styles.goldWash} />
      <div className={styles.stageFloor} />
      <div className={styles.haze} />
      <div className={`${styles.smoke} ${styles.smokeA}`} />
      <div className={`${styles.smoke} ${styles.smokeB}`} />
      <div className={`${styles.smoke} ${styles.smokeC}`} />
    </div>
  );
}
