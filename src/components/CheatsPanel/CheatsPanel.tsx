import { MAX_MUSE_LEVEL } from "../../achievements/levelAchievements";
import styles from "./CheatsPanel.module.css";

export type CheatAction =
  | { type: "levelUp" }
  | { type: "setLevel"; level: number }
  | { type: "clearBoard" }
  | { type: "addScore"; amount: number }
  | { type: "unlockAll" }
  | { type: "resetAchievements" };

interface CheatsPanelProps {
  readonly currentLevel: number;
  readonly playing: boolean;
  readonly onCheat: (action: CheatAction) => void;
  readonly onClose: () => void;
}

export function CheatsPanel({
  currentLevel,
  playing,
  onCheat,
  onClose,
}: CheatsPanelProps) {
  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheats-title"
      data-testid="cheats-panel"
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Debug</p>
            <h2 id="cheats-title" className={styles.title}>
              Cheats
            </h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose}>
            Close
          </button>
        </header>

        <p className={styles.hint}>
          Press <kbd>`</kbd> or <kbd>F2</kbd> anytime to toggle this panel.
        </p>

        <section className={styles.section} aria-label="Level cheats">
          <h3 className={styles.sectionTitle}>Level & board</h3>
          <div className={styles.row}>
            <button
              type="button"
              className={styles.btn}
              onClick={() => onCheat({ type: "levelUp" })}
            >
              Level up (+1)
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={!playing}
              onClick={() => onCheat({ type: "clearBoard" })}
            >
              Clear board
            </button>
            <button
              type="button"
              className={styles.btn}
              disabled={!playing}
              onClick={() => onCheat({ type: "addScore", amount: 10000 })}
            >
              +10,000 score
            </button>
          </div>
          {!playing ? (
            <p className={styles.hint}>
              Start a game to change the live level/board. Wardrobe unlocks
              still work from here.
            </p>
          ) : null}
          <div className={styles.levels}>
            {Array.from({ length: MAX_MUSE_LEVEL }, (_, i) => i + 1).map(
              (level) => (
                <button
                  key={level}
                  type="button"
                  className={`${styles.levelBtn} ${currentLevel === level ? styles.active : ""}`}
                  onClick={() => onCheat({ type: "setLevel", level })}
                >
                  Lv {level}
                </button>
              ),
            )}
          </div>
        </section>

        <section className={styles.section} aria-label="Achievement cheats">
          <h3 className={styles.sectionTitle}>Miss Melody</h3>
          <div className={styles.row}>
            <button
              type="button"
              className={styles.btn}
              onClick={() => onCheat({ type: "unlockAll" })}
            >
              Unlock all outfits
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.danger}`}
              onClick={() => onCheat({ type: "resetAchievements" })}
            >
              Reset achievements
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
