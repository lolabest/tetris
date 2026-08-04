import type { InputAction } from "../../game/types";
import styles from "./TouchControls.module.css";

interface TouchControlsProps {
  readonly onPress: (action: InputAction) => void;
  readonly onSoftDropStart: () => void;
  readonly onSoftDropEnd: () => void;
  readonly disabled?: boolean;
}

export function TouchControls({
  onPress,
  onSoftDropStart,
  onSoftDropEnd,
  disabled = false,
}: TouchControlsProps) {
  return (
    <div
      className={styles.root}
      aria-label="Touch controls"
      data-testid="touch-controls"
    >
      <div className={styles.row}>
        <button
          type="button"
          className={styles.btn}
          disabled={disabled}
          aria-label="Move left"
          onPointerDown={(e) => {
            e.preventDefault();
            onPress("moveLeft");
          }}
        >
          ←
        </button>
        <button
          type="button"
          className={styles.btn}
          disabled={disabled}
          aria-label="Soft drop"
          onPointerDown={(e) => {
            e.preventDefault();
            onSoftDropStart();
          }}
          onPointerUp={onSoftDropEnd}
          onPointerLeave={onSoftDropEnd}
          onPointerCancel={onSoftDropEnd}
        >
          ↓
        </button>
        <button
          type="button"
          className={styles.btn}
          disabled={disabled}
          aria-label="Move right"
          onPointerDown={(e) => {
            e.preventDefault();
            onPress("moveRight");
          }}
        >
          →
        </button>
      </div>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.btn}
          disabled={disabled}
          aria-label="Rotate counterclockwise"
          onPointerDown={(e) => {
            e.preventDefault();
            onPress("rotateCCW");
          }}
        >
          ↺
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.primary}`}
          disabled={disabled}
          aria-label="Hard drop"
          onPointerDown={(e) => {
            e.preventDefault();
            onPress("hardDrop");
          }}
        >
          ⬇
        </button>
        <button
          type="button"
          className={styles.btn}
          disabled={disabled}
          aria-label="Rotate clockwise"
          onPointerDown={(e) => {
            e.preventDefault();
            onPress("rotateCW");
          }}
        >
          ↻
        </button>
      </div>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.btn}
          disabled={disabled}
          aria-label="Hold piece"
          onPointerDown={(e) => {
            e.preventDefault();
            onPress("hold");
          }}
        >
          Hold
        </button>
        <button
          type="button"
          className={styles.btn}
          disabled={disabled}
          aria-label="Pause"
          onPointerDown={(e) => {
            e.preventDefault();
            onPress("pause");
          }}
        >
          Pause
        </button>
      </div>
    </div>
  );
}
