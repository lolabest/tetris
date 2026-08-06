import type { CSSProperties } from "react";
import {
  achievementForLevel,
  outfitStageForLevel,
} from "../../achievements/levelAchievements";
import styles from "./StageMuse.module.css";

interface StageMuseProps {
  /** Highest unlocked / current display level. */
  readonly level: number;
  readonly compact?: boolean;
  readonly celebrate?: boolean;
}

/**
 * Fictional stage muse — Marilyn-inspired platinum glam.
 * Each level peels another wardrobe layer toward a fair pin-up finale.
 */
export function StageMuse({
  level,
  compact = false,
  celebrate = false,
}: StageMuseProps) {
  const stage = outfitStageForLevel(Math.max(1, level || 1));
  const achievement = achievementForLevel(stage);
  const style = { "--muse-stage": String(stage) } as CSSProperties;

  // Visibility: clothing stays until the stage that removes it
  const showFur = stage < 2;
  const showGloves = stage < 3;
  const showGown = stage < 4;
  const showCocktail = stage >= 4 && stage < 6;
  const showStrapless = stage === 5;
  const showSlip = stage === 6;
  const showCorset = stage === 7;
  const showLingerie = stage === 8;
  const showBikini = stage === 9;
  const showFair = stage >= 10;
  const showStockings = stage >= 7 && stage <= 9;
  const showHeels = stage < 10;

  return (
    <figure
      className={`${styles.root} ${compact ? styles.compact : ""} ${celebrate ? styles.celebrate : ""}`}
      style={style}
      data-testid="stage-muse"
      data-stage={stage}
      aria-label={`Miss Melody, ${achievement?.outfitLabel ?? "stage outfit"}`}
    >
      <div className={styles.frame}>
        <svg
          className={styles.svg}
          viewBox="0 0 160 280"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7e4d4" />
              <stop offset="100%" stopColor="#e8c4a8" />
            </linearGradient>
            <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff6d8" />
              <stop offset="45%" stopColor="#f0d78a" />
              <stop offset="100%" stopColor="#c9a227" />
            </linearGradient>
            <linearGradient id="gown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffaf0" />
              <stop offset="100%" stopColor="#d4c4a8" />
            </linearGradient>
            <linearGradient id="rose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2b8c8" />
              <stop offset="100%" stopColor="#c45a78" />
            </linearGradient>
            <radialGradient id="spot" cx="50%" cy="18%" r="55%">
              <stop offset="0%" stopColor="rgba(255,220,140,0.45)" />
              <stop offset="100%" stopColor="rgba(255,220,140,0)" />
            </radialGradient>
          </defs>

          <ellipse cx="80" cy="250" rx="48" ry="10" fill="rgba(0,0,0,0.35)" />
          <rect x="0" y="0" width="160" height="280" fill="url(#spot)" />

          {/* Legs */}
          <path d="M62 168 L58 248 L70 248 L76 170 Z" fill="url(#skin)" />
          <path d="M98 168 L90 170 L96 248 L108 248 Z" fill="url(#skin)" />

          {showStockings ? (
            <g className={styles.layer}>
              <path
                d="M62 188 L59 248 L70 248 L74 190 Z"
                fill="#1a1210"
                opacity="0.88"
              />
              <path
                d="M98 188 L94 190 L97 248 L108 248 Z"
                fill="#1a1210"
                opacity="0.88"
              />
              <path
                d="M60 188 H74 M94 188 H108"
                stroke="#d4a84b"
                strokeWidth="1.2"
              />
            </g>
          ) : null}

          {showHeels ? (
            <g className={styles.layer}>
              <path d="M56 246 H72 L70 252 H54 Z" fill="#3a1018" />
              <path d="M94 246 H110 L112 252 H96 Z" fill="#3a1018" />
            </g>
          ) : null}

          {/* Torso / hips base (fair skin) */}
          <path
            d="M56 108 C56 100 64 94 80 94 C96 94 104 100 104 108
               L108 168 C108 178 100 186 80 186 C60 186 52 178 52 168 Z"
            fill="url(#skin)"
          />

          {/* Arms */}
          <path
            d="M56 112 C42 130 38 160 44 178 L54 174 C50 158 52 134 62 118 Z"
            fill="url(#skin)"
          />
          <path
            d="M104 112 C118 130 122 160 116 178 L106 174 C110 158 108 134 98 118 Z"
            fill="url(#skin)"
          />

          {/* Fair finale accent — soft highlight */}
          {showFair ? (
            <ellipse
              cx="80"
              cy="140"
              rx="28"
              ry="40"
              fill="rgba(255,236,210,0.22)"
            />
          ) : null}

          {showBikini ? (
            <g className={styles.layer}>
              <path d="M60 128 H100 L96 138 H64 Z" fill="#d4a84b" />
              <path
                d="M62 168 C70 160 90 160 98 168 L96 178 C88 172 72 172 64 178 Z"
                fill="#d4a84b"
              />
            </g>
          ) : null}

          {showLingerie ? (
            <g className={styles.layer}>
              <path
                d="M60 118 C68 126 92 126 100 118 L98 138 C90 146 70 146 62 138 Z"
                fill="#f2d0dc"
                stroke="#c45a78"
                strokeWidth="0.8"
              />
              <path
                d="M64 162 C74 154 86 154 96 162 L94 180 C86 174 74 174 66 180 Z"
                fill="#f2d0dc"
                stroke="#c45a78"
                strokeWidth="0.8"
              />
            </g>
          ) : null}

          {showCorset ? (
            <g className={styles.layer}>
              <path d="M58 112 L102 112 L100 168 L60 168 Z" fill="#2a1018" />
              <path
                d="M80 114 V166 M70 118 V162 M90 118 V162"
                stroke="#d4a84b"
                strokeWidth="1"
              />
            </g>
          ) : null}

          {showSlip ? (
            <path
              className={styles.layer}
              d="M58 108 C66 100 94 100 102 108 L104 175 C96 182 64 182 56 175 Z"
              fill="url(#rose)"
              opacity="0.92"
            />
          ) : null}

          {showCocktail || showStrapless ? (
            <path
              className={styles.layer}
              d={
                showStrapless
                  ? "M54 120 C64 112 96 112 106 120 L110 175 C100 195 60 195 50 175 Z"
                  : "M52 108 C62 98 98 98 108 108 L112 180 C100 205 60 205 48 180 Z"
              }
              fill="url(#rose)"
            />
          ) : null}

          {showGown ? (
            <g className={styles.layer}>
              <path
                d="M52 108 C62 96 98 96 108 108 L118 230 C100 250 60 250 42 230 Z"
                fill="url(#gown)"
              />
              <path
                d="M70 108 L80 150 L90 108"
                fill="none"
                stroke="rgba(212,168,75,0.35)"
                strokeWidth="1"
              />
            </g>
          ) : null}

          {showGloves ? (
            <g className={styles.layer}>
              <path
                d="M44 150 C40 165 42 178 48 182 L56 176 C52 170 50 158 54 148 Z"
                fill="#f3ead8"
              />
              <path
                d="M116 150 C120 165 118 178 112 182 L104 176 C108 170 110 158 106 148 Z"
                fill="#f3ead8"
              />
            </g>
          ) : null}

          {showFur ? (
            <path
              className={styles.layer}
              d="M40 100 C50 88 70 92 80 100 C90 92 110 88 120 100
                 C125 120 118 135 108 128 C100 140 60 140 52 128
                 C42 135 35 120 40 100 Z"
              fill="#f7f0e2"
              stroke="rgba(212,168,75,0.4)"
              strokeWidth="1"
            />
          ) : null}

          {/* Neck & head */}
          <rect x="72" y="78" width="16" height="20" rx="4" fill="url(#skin)" />
          <ellipse cx="80" cy="58" rx="22" ry="26" fill="url(#skin)" />

          {/* Platinum curls */}
          <path
            d="M52 58 C48 30 70 18 80 20 C90 18 112 30 108 58
               C118 70 110 88 96 84 C90 96 70 96 64 84 C50 88 42 70 52 58 Z"
            fill="url(#hair)"
          />
          <path
            d="M58 48 C62 36 74 34 80 36"
            fill="none"
            stroke="#fff8e8"
            strokeWidth="2"
            opacity="0.55"
          />

          {/* Face */}
          <circle cx="72" cy="56" r="1.6" fill="#2a1810" />
          <circle cx="88" cy="56" r="1.6" fill="#2a1810" />
          <path
            d="M74 66 Q80 70 86 66"
            fill="none"
            stroke="#c45a5a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="90" cy="64" r="1.3" fill="#5a3020" />
          <ellipse
            cx="80"
            cy="48"
            rx="10"
            ry="3"
            fill="rgba(255,255,255,0.18)"
          />
        </svg>
      </div>

      <figcaption className={styles.caption}>
        <span className={styles.name}>Miss Melody</span>
        <span className={styles.outfit}>{achievement?.outfitLabel}</span>
        <span className={styles.level}>Level {stage} reveal</span>
      </figcaption>
    </figure>
  );
}
