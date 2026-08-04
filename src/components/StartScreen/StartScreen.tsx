import { useState } from "react";
import { SoundSettings } from "../SoundSettings/SoundSettings";
import styles from "./StartScreen.module.css";

interface StartScreenProps {
  readonly highScore: number;
  readonly musicEnabled: boolean;
  readonly sfxEnabled: boolean;
  readonly volume: number;
  readonly onStart: () => void;
  readonly onMusicChange: (enabled: boolean) => void;
  readonly onSfxChange: (enabled: boolean) => void;
  readonly onVolumeChange: (volume: number) => void;
}

type Panel = "none" | "howto" | "scores" | "sound";

export function StartScreen({
  highScore,
  musicEnabled,
  sfxEnabled,
  volume,
  onStart,
  onMusicChange,
  onSfxChange,
  onVolumeChange,
}: StartScreenProps) {
  const [panel, setPanel] = useState<Panel>("none");

  const togglePanel = (next: Panel): void => {
    setPanel((prev) => (prev === next ? "none" : next));
  };

  return (
    <section className={styles.screen} aria-labelledby="start-title">
      <div className={styles.content}>
        <h1 id="start-title" className={styles.title}>
          Piano Blocks
        </h1>
        <p className={styles.description}>
          Turn falling piano keys into rhythm, clear the stage, and keep the
          melody alive.
        </p>

        <button
          type="button"
          className={styles.play}
          onClick={onStart}
          data-testid="start-button"
        >
          Play
        </button>

        <div className={styles.secondary}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => togglePanel("howto")}
            aria-expanded={panel === "howto"}
          >
            How to Play
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => togglePanel("scores")}
            aria-expanded={panel === "scores"}
          >
            High Scores
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => togglePanel("sound")}
            aria-expanded={panel === "sound"}
          >
            Sound
          </button>
        </div>

        {panel === "howto" ? (
          <div className={styles.panel} role="region" aria-label="How to play">
            <p className={styles.panelLead}>
              Build the rhythm. Clear the keys. Feel the music.
            </p>
            <ul className={styles.list}>
              <li>
                <kbd>←</kbd> <kbd>→</kbd> move · <kbd>↑</kbd>/<kbd>X</kbd>{" "}
                rotate · <kbd>Z</kbd> counter-rotate
              </li>
              <li>
                <kbd>Space</kbd> hard drop · <kbd>↓</kbd> soft drop ·{" "}
                <kbd>C</kbd> hold
              </li>
              <li>
                <kbd>P</kbd> pause — clear full rows of ivory and ebony keys to
                score
              </li>
            </ul>
          </div>
        ) : null}

        {panel === "scores" ? (
          <div className={styles.panel} role="region" aria-label="High scores">
            <p className={styles.scoreLabel}>Best recital</p>
            <p className={styles.scoreValue} data-testid="start-high-score">
              {highScore.toLocaleString("en-US")}
            </p>
            <p className={styles.panelHint}>
              Every block plays a note. Chase a higher score each night.
            </p>
          </div>
        ) : null}

        {panel === "sound" ? (
          <div className={styles.panel} role="region" aria-label="Sound">
            <SoundSettings
              musicEnabled={musicEnabled}
              sfxEnabled={sfxEnabled}
              volume={volume}
              onMusicChange={onMusicChange}
              onSfxChange={onSfxChange}
              onVolumeChange={onVolumeChange}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
