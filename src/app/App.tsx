import { useCallback, useEffect, useRef, useState } from "react";
import { PianoAudioEngine } from "../audio/PianoAudioEngine";
import {
  GameCanvas,
  type GameCanvasHandle,
  type HardDropTrail,
} from "../components/GameCanvas/GameCanvas";
import {
  PIECE_COLORS,
  type Particle,
} from "../components/GameCanvas/renderBoard";
import { GameHeader } from "../components/GameHeader/GameHeader";
import { GameOverModal } from "../components/GameOverModal/GameOverModal";
import { GameStats } from "../components/GameStats/GameStats";
import { HoldPiece } from "../components/HoldPiece/HoldPiece";
import { JazzAtmosphere } from "../components/JazzAtmosphere/JazzAtmosphere";
import { NextPiece } from "../components/NextPiece/NextPiece";
import { PauseOverlay } from "../components/PauseOverlay/PauseOverlay";
import { AchievementsPanel } from "../components/AchievementsPanel/AchievementsPanel";
import { AchievementToast } from "../components/AchievementToast/AchievementToast";
import { StageMuse } from "../components/StageMuse/StageMuse";
import { StartScreen } from "../components/StartScreen/StartScreen";
import { TouchControls } from "../components/TouchControls/TouchControls";
import type { LevelAchievement } from "../achievements/levelAchievements";
import { createGameEngine, type GameEngine } from "../game/engine";
import type { GameEvent, GameState, InputAction } from "../game/types";
import { useGameLoop } from "../hooks/useGameLoop";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useTouchControls } from "../hooks/useTouchControls";
import {
  loadAchievementProgress,
  unlockLevelAchievements,
  type AchievementProgress,
} from "../storage/achievementStorage";
import { getHighScore, saveHighScore } from "../storage/highScoreStorage";
import {
  loadSettings,
  saveSettings,
  type UserSettings,
} from "../storage/settingsStorage";
import styles from "./App.module.css";

type Screen = "start" | "playing";

interface UiSnapshot {
  score: number;
  level: number;
  lines: number;
  combo: number;
  highScore: number;
  hold: GameState["hold"];
  canHold: boolean;
  nextQueue: GameState["nextQueue"];
  phase: GameState["phase"];
}

function toSnapshot(state: GameState): UiSnapshot {
  return {
    score: state.score,
    level: state.level,
    lines: state.lines,
    combo: state.combo,
    highScore: state.highScore,
    hold: state.hold,
    canHold: state.canHold,
    nextQueue: state.nextQueue,
    phase: state.phase,
  };
}

function snapshotsEqual(a: UiSnapshot, b: UiSnapshot): boolean {
  return (
    a.score === b.score &&
    a.level === b.level &&
    a.lines === b.lines &&
    a.combo === b.combo &&
    a.highScore === b.highScore &&
    a.hold === b.hold &&
    a.canHold === b.canHold &&
    a.phase === b.phase &&
    a.nextQueue.join() === b.nextQueue.join()
  );
}

export function App() {
  const reducedMotion = usePrefersReducedMotion();
  const engineRef = useRef<GameEngine | null>(null);
  const audioRef = useRef<PianoAudioEngine | null>(null);
  const canvasRef = useRef<GameCanvasHandle>(null);
  const trailRef = useRef<HardDropTrail | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const [screen, setScreen] = useState<Screen>("start");
  const [ui, setUi] = useState<UiSnapshot>(() => ({
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    highScore: getHighScore(),
    hold: null,
    canHold: true,
    nextQueue: [],
    phase: "idle",
  }));
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [levelFlash, setLevelFlash] = useState(false);
  const [achievementProgress, setAchievementProgress] =
    useState<AchievementProgress>(() => loadAchievementProgress());
  const [showAchievements, setShowAchievements] = useState(false);
  const [toast, setToast] = useState<LevelAchievement | null>(null);
  const [museCelebrate, setMuseCelebrate] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    engineRef.current = createGameEngine({
      random: Math.random,
      now: () => performance.now(),
      highScore: getHighScore(),
    });
    const initial = loadSettings();
    audioRef.current = new PianoAudioEngine({
      musicEnabled: initial.musicEnabled,
      sfxEnabled: initial.sfxEnabled,
      volume: initial.volume,
    });
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.setMusicEnabled(settings.musicEnabled);
    audio.setSfxEnabled(settings.sfxEnabled);
    audio.setVolume(settings.volume);
    saveSettings(settings);
    if (
      settings.musicEnabled &&
      screen === "playing" &&
      ui.phase === "playing"
    ) {
      if (!audio.isMusicPlaying()) {
        audio.startMusic();
      }
    }
  }, [settings, screen, ui.phase]);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const syncUi = useCallback((state: GameState) => {
    setUi((prev) => {
      const next = toSnapshot(state);
      return snapshotsEqual(prev, next) ? prev : next;
    });
  }, []);

  const draw = useCallback((state: GameState, now: number) => {
    canvasRef.current?.draw(state, {
      reducedMotion: reducedMotionRef.current,
      hardDropTrail: trailRef.current,
      particles: particlesRef.current,
      now,
    });
  }, []);

  const applyLevelAchievements = useCallback((level: number) => {
    const { progress, newlyUnlocked } = unlockLevelAchievements(level);
    setAchievementProgress(progress);
    if (newlyUnlocked.length === 0) {
      return;
    }
    const latest = newlyUnlocked[newlyUnlocked.length - 1];
    if (!latest) {
      return;
    }
    setToast(latest);
    setMuseCelebrate(true);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      setMuseCelebrate(false);
      toastTimerRef.current = null;
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleEvents = useCallback(
    (events: readonly GameEvent[], state: GameState) => {
      const audio = audioRef.current;
      for (const event of events) {
        switch (event.type) {
          case "move":
            audio?.play("move");
            break;
          case "rotate":
            audio?.play("rotate");
            break;
          case "softDrop":
            audio?.play("softDrop");
            break;
          case "hardDrop":
            audio?.play("hardDrop");
            break;
          case "lock":
            if (event.pieceType) {
              audio?.playPieceNote(event.pieceType, "lock");
            } else {
              audio?.play("lock");
            }
            break;
          case "hold":
            audio?.play("hold");
            break;
          case "lineClear": {
            const lines = event.linesCleared ?? 1;
            audio?.playLineClear(lines);
            if (!reducedMotionRef.current && lines >= 3) {
              const born = performance.now();
              const created: Particle[] = Array.from(
                { length: 16 * lines },
                () => ({
                  x: 24 + Math.random() * 220,
                  y: 100 + Math.random() * 300,
                  vx: (Math.random() - 0.5) * 140,
                  vy: -50 - Math.random() * 140,
                  life: 650 + Math.random() * 400,
                  born,
                  color: Math.random() > 0.5 ? "#c9a227" : PIECE_COLORS.I,
                }),
              );
              particlesRef.current = [
                ...particlesRef.current.slice(-40),
                ...created,
              ];
            }
            break;
          }
          case "levelUp":
            audio?.play("levelUp");
            applyLevelAchievements(event.level ?? state.level);
            setLevelFlash(true);
            window.setTimeout(
              () => setLevelFlash(false),
              reducedMotionRef.current ? 0 : 700,
            );
            break;
          case "gameOver":
            audio?.stopMusic();
            audio?.play("gameOver");
            saveHighScore(state.score);
            applyLevelAchievements(state.level);
            break;
          case "pause":
            audio?.pauseMusic();
            break;
          case "resume":
            audio?.resumeMusic();
            break;
          case "spawn":
            if (event.pieceType) {
              audio?.playPieceNote(event.pieceType, "spawn");
            }
            break;
          default:
            break;
        }
      }
    },
    [applyLevelAchievements],
  );

  const commitState = useCallback(
    (state: GameState, now = performance.now()) => {
      if (state.lastEvents.length > 0) {
        handleEvents(state.lastEvents, state);
      }
      syncUi(state);
      draw(state, now);
    },
    [draw, handleEvents, syncUi],
  );

  const ensureAudio = useCallback(async () => {
    await audioRef.current?.unlock();
  }, []);

  const startGame = useCallback(async () => {
    await ensureAudio();
    audioRef.current?.play("ui");
    const engine = engineRef.current;
    if (!engine) return;
    const state = engine.start();
    particlesRef.current = [];
    trailRef.current = null;
    setScreen("playing");
    applyLevelAchievements(1);
    audioRef.current?.startMusic();
    commitState(state);
  }, [applyLevelAchievements, commitState, ensureAudio]);

  const returnToMenu = useCallback(() => {
    audioRef.current?.stopMusic();
    setScreen("start");
    setUi((prev) => ({
      ...prev,
      phase: "idle",
      score: 0,
      lines: 0,
      level: 1,
      combo: 0,
      hold: null,
      highScore: getHighScore(),
    }));
  }, []);

  const onAction = useCallback(
    (action: InputAction) => {
      const engine = engineRef.current;
      if (!engine || screen !== "playing") {
        return;
      }

      if (action === "restart") {
        if (engine.getState().phase === "gameover") {
          void startGame();
          return;
        }
        if (window.confirm("Restart the current recital?")) {
          void startGame();
        }
        return;
      }

      if (action === "hardDrop") {
        const before = engine.getState();
        if (before.active) {
          trailRef.current = {
            x: before.active.position.x,
            fromY: before.active.position.y,
            toY: before.ghostY ?? before.active.position.y,
            type: before.active.type,
            born: performance.now(),
          };
        }
      }

      commitState(engine.handleInput(action));
    },
    [commitState, screen, startGame],
  );

  const onSoftDropChange = useCallback((active: boolean) => {
    engineRef.current?.setSoftDropping(active);
  }, []);

  useKeyboardControls({
    enabled: screen === "playing" && ui.phase !== "gameover",
    onAction,
    onSoftDropChange,
  });

  const touch = useTouchControls(onAction, onSoftDropChange);

  useEffect(() => {
    const onVisibility = (): void => {
      const engine = engineRef.current;
      if (!engine || screen !== "playing") return;
      if (document.hidden) {
        const phase = engine.getState().phase;
        if (phase === "playing" || phase === "clearing") {
          commitState(engine.handleInput("pause"));
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [commitState, screen]);

  const loopRunning =
    screen === "playing" && (ui.phase === "playing" || ui.phase === "clearing");

  useGameLoop(loopRunning, (dtMs, now) => {
    const engine = engineRef.current;
    if (!engine) return;
    const state = engine.update(dtMs);
    if (state.lastEvents.length > 0) {
      handleEvents(state.lastEvents, state);
    }
    particlesRef.current = particlesRef.current.filter(
      (p) => now - p.born < p.life,
    );
    if (trailRef.current && now - trailRef.current.born >= 200) {
      trailRef.current = null;
    }
    syncUi(state);
    draw(state, now);
  });

  useEffect(() => {
    if (screen !== "playing") return;
    const state = engineRef.current?.getState();
    if (state) {
      const id = requestAnimationFrame(() => draw(state, performance.now()));
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [screen, draw]);

  const soundHandlers = {
    musicEnabled: settings.musicEnabled,
    sfxEnabled: settings.sfxEnabled,
    volume: settings.volume,
    onMusicChange: (enabled: boolean) => {
      void ensureAudio();
      updateSettings({ musicEnabled: enabled });
    },
    onSfxChange: (enabled: boolean) => {
      void ensureAudio();
      updateSettings({ sfxEnabled: enabled });
    },
    onVolumeChange: (v: number) => {
      void ensureAudio();
      updateSettings({ volume: v });
    },
  };

  return (
    <>
      <JazzAtmosphere />
      <div className={styles.app}>
        {screen === "playing" ? (
          <GameHeader
            {...soundHandlers}
            showBrand
            showPause={ui.phase === "playing"}
            onPause={() => onAction("pause")}
          />
        ) : (
          <GameHeader {...soundHandlers} showBrand={false} />
        )}

        {screen === "start" ? (
          <StartScreen
            highScore={ui.highScore}
            onStart={() => void startGame()}
            onOpenAchievements={() => setShowAchievements(true)}
            highestLevel={achievementProgress.highestLevel}
          />
        ) : (
          <main
            className={`${styles.game} ${levelFlash ? styles.levelFlash : ""}`}
          >
            <div className={styles.holdSlot}>
              <HoldPiece hold={ui.hold} canHold={ui.canHold} />
              <div className={styles.museSlot}>
                <StageMuse
                  compact
                  level={Math.max(
                    ui.level,
                    achievementProgress.highestLevel,
                    1,
                  )}
                  celebrate={museCelebrate}
                />
                <button
                  type="button"
                  className={styles.achievementsLink}
                  onClick={() => setShowAchievements(true)}
                >
                  Achievements
                </button>
              </div>
            </div>

            <div className={styles.stage}>
              <GameCanvas ref={canvasRef} />
              {ui.phase === "paused" ? (
                <PauseOverlay
                  onResume={() => onAction("pause")}
                  onRestart={() => {
                    if (window.confirm("Restart the current recital?")) {
                      void startGame();
                    }
                  }}
                />
              ) : null}
              {ui.phase === "gameover" ? (
                <GameOverModal
                  score={ui.score}
                  highScore={Math.max(ui.highScore, ui.score)}
                  lines={ui.lines}
                  level={ui.level}
                  onRestart={() => void startGame()}
                  onMenu={returnToMenu}
                />
              ) : null}
            </div>

            <aside className={styles.rightRail} aria-label="Next and program">
              <NextPiece queue={ui.nextQueue} />
              <GameStats
                score={ui.score}
                level={ui.level}
                lines={ui.lines}
                combo={ui.combo}
              />
            </aside>

            <div className={styles.touch}>
              <TouchControls
                onPress={touch.press}
                onSoftDropStart={touch.startSoftDrop}
                onSoftDropEnd={touch.releaseSoftDrop}
                disabled={ui.phase === "paused" || ui.phase === "gameover"}
              />
            </div>
          </main>
        )}
      </div>

      {showAchievements ? (
        <AchievementsPanel
          progress={achievementProgress}
          onClose={() => setShowAchievements(false)}
        />
      ) : null}
      {toast ? <AchievementToast achievement={toast} /> : null}
    </>
  );
}
