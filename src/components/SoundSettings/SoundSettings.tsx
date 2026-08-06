import styles from "./SoundSettings.module.css";

export interface SoundSettingsProps {
  readonly musicEnabled: boolean;
  readonly sfxEnabled: boolean;
  readonly volume: number;
  readonly onMusicChange: (enabled: boolean) => void;
  readonly onSfxChange: (enabled: boolean) => void;
  readonly onVolumeChange: (volume: number) => void;
  readonly compact?: boolean;
}

export function SoundSettings({
  musicEnabled,
  sfxEnabled,
  volume,
  onMusicChange,
  onSfxChange,
  onVolumeChange,
  compact = false,
}: SoundSettingsProps) {
  return (
    <div
      className={`${styles.root} ${compact ? styles.compact : ""}`}
      role="group"
      aria-label="Music and sound settings"
    >
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={musicEnabled}
        onClick={() => onMusicChange(!musicEnabled)}
      >
        Music {musicEnabled ? "On" : "Off"}
      </button>
      <button
        type="button"
        className={styles.toggle}
        aria-pressed={sfxEnabled}
        onClick={() => onSfxChange(!sfxEnabled)}
      >
        SFX {sfxEnabled ? "On" : "Off"}
      </button>
      <label className={styles.volume}>
        <span className={styles.volumeLabel}>Volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          aria-label="Volume"
        />
      </label>
    </div>
  );
}
