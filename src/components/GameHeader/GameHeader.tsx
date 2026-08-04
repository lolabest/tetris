import styles from "./GameHeader.module.css";

interface GameHeaderProps {
  readonly muted: boolean;
  readonly volume: number;
  readonly onToggleMute: () => void;
  readonly onVolumeChange: (volume: number) => void;
  readonly onPause?: () => void;
  readonly showPause?: boolean;
}

export function GameHeader({
  muted,
  volume,
  onToggleMute,
  onVolumeChange,
  onPause,
  showPause = false,
}: GameHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden="true" />
        <h1 className={styles.title}>Piano Blocks</h1>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Unmute sound" : "Mute sound"}
        >
          {muted ? "Muted" : "Sound"}
        </button>
        <label className={styles.volume}>
          <span className={styles.srOnly}>Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            aria-label="Volume"
            disabled={muted}
          />
        </label>
        {showPause && onPause ? (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onPause}
            aria-label="Pause game"
          >
            Pause
          </button>
        ) : null}
      </div>
    </header>
  );
}
