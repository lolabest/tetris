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
import { NextPiece } from "../components/NextPiece/NextPiece";
import { PauseOverlay } from "../components/PauseOverlay/PauseOverlay";
import { StartScreen } from "../components/StartScreen/StartScreen";
import { TouchControls } from "../components/TouchControls/TouchControls";
import { createGameEngine, type GameEngine } from "../game/engine";
import type { GameEvent, GameState, InputAction } from "../game/types";
import { useGameLoop } from "../hooks/useGameLoop";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useTouchControls } from "../hooks/useTouchControls";
import { getHighScore, saveHighScore } from "../storage/highScoreStorage";
import { loadSettings, saveSettings } from "../storage/settingsStorage";
import styles from "./App.module.css";

type Screen = "start" | "playing";

interface UiSnapshot {
  score: number;
  level: number;
  lines: number;
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
    highScore: getHighScore(),
    hold: null,
    canHold: true,
    nextQueue: [],
    phase: "idle",
  }));
  const [muted, setMuted] = useState(() => loadSettings().muted);
  const [volume, setVolume] = useState(() => loadSettings().volume);
  const [levelFlash, setLevelFlash] = useState(false);

  useEffect(() => {
    engineRef.current = createGameEngine({
      random: Math.random,
      now: () => performance.now(),
      highScore: getHighScore(),
    });
    audioRef.current = new PianoAudioEngine({ muted, volume });
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.setMuted(muted);
    audio.setVolume(volume);
    saveSettings({ muted, volume });
    // If unmuted during an active recital, keep the loop going
    if (!muted && screen === "playing" && ui.phase === "playing") {
      if (!audio.isMusicPlaying()) {
        audio.startMusic();
      }
    }
  }, [muted, volume, screen, ui.phase]);

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
    [],
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
    audioRef.current?.startMusic();
    commitState(state);
  }, [commitState, ensureAudio]);

  const returnToMenu = useCallback(() => {
    audioRef.current?.stopMusic();
    setScreen("start");
    setUi((prev) => ({
      ...prev,
      phase: "idle",
      score: 0,
      lines: 0,
      level: 1,
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

  // Draw once when entering play screen (canvas mounts)
  useEffect(() => {
    if (screen !== "playing") return;
    const state = engineRef.current?.getState();
    if (state) {
      // Defer to after canvas mount
      const id = requestAnimationFrame(() => draw(state, performance.now()));
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [screen, draw]);

  return (
    <div className={styles.app}>
      <GameHeader
        muted={muted}
        volume={volume}
        onToggleMute={() => {
          void ensureAudio();
          setMuted((m) => !m);
        }}
        onVolumeChange={(v) => {
          void ensureAudio();
          setVolume(v);
          if (v > 0 && muted) {
            setMuted(false);
          }
        }}
        showPause={screen === "playing" && ui.phase === "playing"}
        onPause={() => onAction("pause")}
      />

      {screen === "start" ? (
        <StartScreen
          highScore={ui.highScore}
          onStart={() => void startGame()}
        />
      ) : (
        <main
          className={`${styles.game} ${levelFlash ? styles.levelFlash : ""}`}
        >
          <div className={styles.holdSlot}>
            <HoldPiece hold={ui.hold} canHold={ui.canHold} />
          </div>

          <div className={styles.statsSlot}>
            <GameStats
              score={ui.score}
              level={ui.level}
              lines={ui.lines}
              highScore={Math.max(ui.highScore, ui.score)}
            />
            <div
              className={styles.guide}
              aria-label="Keyboard controls summary"
            >
              <p>
                <kbd>←→</kbd> move · <kbd>↑/X</kbd> rotate · <kbd>Z</kbd> CCW
              </p>
              <p>
                <kbd>Space</kbd> drop · <kbd>C</kbd> hold · <kbd>P</kbd> pause
              </p>
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

          <div className={styles.nextSlot}>
            <NextPiece queue={ui.nextQueue} />
          </div>

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
  );
}
