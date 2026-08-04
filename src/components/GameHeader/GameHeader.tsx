import { SoundSettings } from "../SoundSettings/SoundSettings";
import styles from "./GameHeader.module.css";

interface GameHeaderProps {
  readonly musicEnabled: boolean;
  readonly sfxEnabled: boolean;
  readonly volume: number;
  readonly onMusicChange: (enabled: boolean) => void;
  readonly onSfxChange: (enabled: boolean) => void;
  readonly onVolumeChange: (volume: number) => void;
  readonly onPause?: () => void;
  readonly showPause?: boolean;
  readonly showBrand?: boolean;
}

export function GameHeader({
  musicEnabled,
  sfxEnabled,
  volume,
  onMusicChange,
  onSfxChange,
  onVolumeChange,
  onPause,
  showPause = false,
  showBrand = true,
}: GameHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.spacer} aria-hidden="true" />

      {showBrand ? (
        <div className={styles.brand}>
          <h1 className={styles.title}>Piano Blocks</h1>
          <p className={styles.slogan}>Every block plays a note.</p>
        </div>
      ) : (
        <div className={styles.brand} aria-hidden="true" />
      )}

      <div className={styles.controls}>
        <SoundSettings
          compact
          musicEnabled={musicEnabled}
          sfxEnabled={sfxEnabled}
          volume={volume}
          onMusicChange={onMusicChange}
          onSfxChange={onSfxChange}
          onVolumeChange={onVolumeChange}
        />
        {showPause && onPause ? (
          <button
            type="button"
            className={styles.pause}
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
