import {
  clearRows,
  createEmptyBoard,
  findFullRows,
  isBoardBlocked,
  lockPiece,
  spawnPosition,
} from "./board";
import {
  canPlace,
  ghostPosition,
  hardDropPosition,
  tryMove,
} from "./collision";
import {
  DEFAULT_ENGINE_CONFIG,
  dropIntervalForLevel,
  PREVIEW_COUNT,
} from "./constants";
import { createSevenBag } from "./randomizer";
import { tryRotate } from "./rotation";
import { computeScoreDelta, levelFromLines } from "./scoring";
import type {
  ActivePiece,
  Board,
  EngineConfig,
  EngineDeps,
  GameEvent,
  GameState,
  InputAction,
  TetrominoType,
} from "./types";

interface InternalEngine {
  state: GameState;
  config: EngineConfig;
  nextPiece: () => TetrominoType;
  now: () => number;
  dropAccumulatorMs: number;
  lockTimerMs: number;
  softDropping: boolean;
}

function withEvents(state: GameState, events: readonly GameEvent[]): GameState {
  return { ...state, lastEvents: events };
}

function updateGhost(state: GameState): GameState {
  if (!state.active || state.phase !== "playing") {
    return { ...state, ghostY: null };
  }
  return { ...state, ghostY: ghostPosition(state.board, state.active).y };
}

function createActive(type: TetrominoType, boardWidth: number): ActivePiece {
  return {
    type,
    rotation: 0,
    position: spawnPosition(type, boardWidth),
  };
}

function fillQueue(
  queue: readonly TetrominoType[],
  nextPiece: () => TetrominoType,
  count: number,
): TetrominoType[] {
  const result = [...queue];
  while (result.length < count) {
    result.push(nextPiece());
  }
  return result;
}

function takeNext(
  queue: readonly TetrominoType[],
  nextPiece: () => TetrominoType,
  previewCount: number,
): { piece: TetrominoType; queue: TetrominoType[] } {
  const filled = fillQueue(queue, nextPiece, previewCount + 1);
  const piece = filled[0]!;
  return { piece, queue: filled.slice(1) };
}

function createInitialState(
  highScore: number,
  config: EngineConfig,
): GameState {
  return {
    board: createEmptyBoard(config.boardWidth, config.boardHeight),
    active: null,
    hold: null,
    canHold: true,
    nextQueue: [],
    score: 0,
    lines: 0,
    level: 1,
    combo: 0,
    phase: "idle",
    dropIntervalMs: dropIntervalForLevel(1, config),
    lockDelayMs: config.lockDelayMs,
    lockResets: 0,
    clearing: null,
    ghostY: null,
    highScore,
    lastEvents: [],
  };
}

function spawnPiece(
  engine: InternalEngine,
  events: GameEvent[] = [],
): GameState {
  const { config, nextPiece } = engine;
  const { piece, queue } = takeNext(
    engine.state.nextQueue,
    nextPiece,
    config.previewCount,
  );
  const active = createActive(piece, config.boardWidth);

  if (!canPlace(engine.state.board, active)) {
    const gameOverState: GameState = {
      ...engine.state,
      active: null,
      nextQueue: queue,
      phase: "gameover",
      ghostY: null,
      highScore: Math.max(engine.state.highScore, engine.state.score),
      lastEvents: [...events, { type: "gameOver" }],
    };
    return gameOverState;
  }

  engine.dropAccumulatorMs = 0;
  engine.lockTimerMs = 0;

  return updateGhost(
    withEvents(
      {
        ...engine.state,
        active,
        nextQueue: queue,
        canHold: true,
        phase: "playing",
        lockResets: 0,
        clearing: null,
      },
      [...events, { type: "spawn", pieceType: piece }],
    ),
  );
}

function beginClear(
  engine: InternalEngine,
  board: ReturnType<typeof lockPiece>,
  events: GameEvent[],
): GameState {
  const rows = findFullRows(board);
  if (rows.length === 0) {
    engine.state = {
      ...engine.state,
      board,
      active: null,
      combo: 0,
      lastEvents: events,
    };
    return spawnPiece(engine, events);
  }

  return withEvents(
    {
      ...engine.state,
      board,
      active: null,
      ghostY: null,
      phase: "clearing",
      clearing: {
        rows,
        startedAt: engine.now(),
        durationMs: engine.config.clearAnimationMs,
      },
    },
    [...events, { type: "lineClear", linesCleared: rows.length }],
  );
}

function finishClear(engine: InternalEngine): GameState {
  const clearing = engine.state.clearing;
  if (!clearing) {
    return engine.state;
  }

  const clearedBoard = clearRows(engine.state.board, clearing.rows);
  const linesCleared = clearing.rows.length;
  const previousLevel = engine.state.level;
  const totalLines = engine.state.lines + linesCleared;
  const level = levelFromLines(totalLines, engine.config.linesPerLevel);
  const combo = engine.state.combo + 1;
  const scoreGain = computeScoreDelta({
    linesCleared,
    level: previousLevel,
    combo: combo > 1 ? combo - 1 : 0,
  });
  const events: GameEvent[] = [];

  if (level > previousLevel) {
    events.push({ type: "levelUp", level });
  }

  // Lock-out: blocks remaining in buffer after gravity means game over.
  if (isBoardBlocked(clearedBoard, engine.config.bufferRows)) {
    return withEvents(
      {
        ...engine.state,
        board: clearedBoard,
        lines: totalLines,
        level,
        combo,
        score: engine.state.score + scoreGain,
        dropIntervalMs: dropIntervalForLevel(level, engine.config),
        phase: "gameover",
        clearing: null,
        highScore: Math.max(
          engine.state.highScore,
          engine.state.score + scoreGain,
        ),
      },
      [...events, { type: "gameOver" }],
    );
  }

  engine.state = {
    ...engine.state,
    board: clearedBoard,
    lines: totalLines,
    level,
    combo,
    score: engine.state.score + scoreGain,
    dropIntervalMs: dropIntervalForLevel(level, engine.config),
    clearing: null,
    phase: "playing",
    lastEvents: events,
  };

  return spawnPiece(engine, events);
}

function lockActive(engine: InternalEngine, events: GameEvent[]): GameState {
  const { active } = engine.state;
  if (!active) {
    return engine.state;
  }

  const board = lockPiece(engine.state.board, active);
  const lockEvents: GameEvent[] = [
    ...events,
    { type: "lock", pieceType: active.type },
  ];
  return beginClear(engine, board, lockEvents);
}

function resetLockIfGrounded(engine: InternalEngine, piece: ActivePiece): void {
  const grounded = !tryMove(engine.state.board, piece, 0, 1);
  if (!grounded) {
    engine.lockTimerMs = 0;
    return;
  }
  if (engine.state.lockResets < engine.config.maxLockResets) {
    engine.lockTimerMs = 0;
    engine.state = { ...engine.state, lockResets: engine.state.lockResets + 1 };
  }
}

function applyPiece(
  engine: InternalEngine,
  piece: ActivePiece,
  events: GameEvent[],
): GameState {
  resetLockIfGrounded(engine, piece);
  return updateGhost(
    withEvents(
      {
        ...engine.state,
        active: piece,
      },
      events,
    ),
  );
}

function handleMove(engine: InternalEngine, dx: number): GameState {
  if (engine.state.phase !== "playing" || !engine.state.active) {
    return withEvents(engine.state, []);
  }
  const moved = tryMove(engine.state.board, engine.state.active, dx, 0);
  if (!moved) {
    return withEvents(engine.state, []);
  }
  return applyPiece(engine, moved, [{ type: "move", pieceType: moved.type }]);
}

function handleSoftDrop(engine: InternalEngine): GameState {
  if (engine.state.phase !== "playing" || !engine.state.active) {
    return withEvents(engine.state, []);
  }
  const moved = tryMove(engine.state.board, engine.state.active, 0, 1);
  if (!moved) {
    return lockActive(engine, [
      { type: "softDrop", pieceType: engine.state.active.type },
    ]);
  }
  const score = engine.state.score + computeScoreDelta({ softDropCells: 1 });
  engine.state = { ...engine.state, score };
  engine.dropAccumulatorMs = 0;
  return applyPiece(engine, moved, [
    { type: "softDrop", pieceType: moved.type },
  ]);
}

function handleHardDrop(engine: InternalEngine): GameState {
  if (engine.state.phase !== "playing" || !engine.state.active) {
    return withEvents(engine.state, []);
  }
  const { piece, distance } = hardDropPosition(
    engine.state.board,
    engine.state.active,
  );
  const score =
    engine.state.score + computeScoreDelta({ hardDropCells: distance });
  engine.state = { ...engine.state, score, active: piece };
  return lockActive(engine, [
    { type: "hardDrop", pieceType: piece.type, hardDropDistance: distance },
  ]);
}

function handleRotate(engine: InternalEngine, direction: 1 | -1): GameState {
  if (engine.state.phase !== "playing" || !engine.state.active) {
    return withEvents(engine.state, []);
  }
  const rotated = tryRotate(engine.state.board, engine.state.active, direction);
  if (!rotated) {
    return withEvents(engine.state, []);
  }
  return applyPiece(engine, rotated, [
    { type: "rotate", pieceType: rotated.type },
  ]);
}

function handleHold(engine: InternalEngine): GameState {
  if (
    engine.state.phase !== "playing" ||
    !engine.state.active ||
    !engine.state.canHold
  ) {
    return withEvents(engine.state, []);
  }

  const current = engine.state.active.type;
  const held = engine.state.hold;
  let nextActive: ActivePiece;
  let nextQueue = engine.state.nextQueue;

  if (held) {
    nextActive = createActive(held, engine.config.boardWidth);
  } else {
    const taken = takeNext(
      engine.state.nextQueue,
      engine.nextPiece,
      engine.config.previewCount,
    );
    nextActive = createActive(taken.piece, engine.config.boardWidth);
    nextQueue = taken.queue;
  }

  if (!canPlace(engine.state.board, nextActive)) {
    return withEvents(engine.state, []);
  }

  engine.dropAccumulatorMs = 0;
  engine.lockTimerMs = 0;

  return updateGhost(
    withEvents(
      {
        ...engine.state,
        active: nextActive,
        hold: current,
        canHold: false,
        nextQueue,
        lockResets: 0,
      },
      [{ type: "hold", pieceType: current }],
    ),
  );
}

function handlePauseToggle(engine: InternalEngine): GameState {
  if (engine.state.phase === "playing" || engine.state.phase === "clearing") {
    return withEvents({ ...engine.state, phase: "paused" }, [
      { type: "pause" },
    ]);
  }
  if (engine.state.phase === "paused") {
    const resumePhase = engine.state.clearing ? "clearing" : "playing";
    return withEvents({ ...engine.state, phase: resumePhase }, [
      { type: "resume" },
    ]);
  }
  return withEvents(engine.state, []);
}

function gravityStep(engine: InternalEngine): GameState {
  if (!engine.state.active) {
    return engine.state;
  }
  const moved = tryMove(engine.state.board, engine.state.active, 0, 1);
  if (moved) {
    engine.lockTimerMs = 0;
    return updateGhost({ ...engine.state, active: moved, lastEvents: [] });
  }
  // Grounded — start / continue lock delay via tickLock
  return engine.state;
}

function tickLock(engine: InternalEngine, dtMs: number): GameState {
  if (!engine.state.active) {
    return engine.state;
  }
  const grounded = !tryMove(engine.state.board, engine.state.active, 0, 1);
  if (!grounded) {
    engine.lockTimerMs = 0;
    return engine.state;
  }
  engine.lockTimerMs += dtMs;
  if (engine.lockTimerMs >= engine.config.lockDelayMs) {
    return lockActive(engine, []);
  }
  return engine.state;
}

export class GameEngine {
  private readonly engine: InternalEngine;

  constructor(
    deps: EngineDeps = { random: Math.random, now: () => performance.now() },
  ) {
    const config: EngineConfig = { ...DEFAULT_ENGINE_CONFIG, ...deps.config };
    const nextPiece = createSevenBag(deps.random);
    this.engine = {
      state: createInitialState(deps.highScore ?? 0, config),
      config,
      nextPiece,
      now: deps.now,
      dropAccumulatorMs: 0,
      lockTimerMs: 0,
      softDropping: false,
    };
    // Prefill preview queue for idle screen / start
    this.engine.state = {
      ...this.engine.state,
      nextQueue: fillQueue([], nextPiece, config.previewCount || PREVIEW_COUNT),
    };
  }

  getState(): GameState {
    return this.engine.state;
  }

  start(): GameState {
    if (
      this.engine.state.phase === "playing" ||
      this.engine.state.phase === "clearing"
    ) {
      return withEvents(this.engine.state, []);
    }
    const highScore = Math.max(
      this.engine.state.highScore,
      this.engine.state.score,
    );
    this.engine.state = createInitialState(highScore, this.engine.config);
    this.engine.state = {
      ...this.engine.state,
      nextQueue: fillQueue(
        [],
        this.engine.nextPiece,
        this.engine.config.previewCount,
      ),
    };
    this.engine.dropAccumulatorMs = 0;
    this.engine.lockTimerMs = 0;
    this.engine.softDropping = false;
    this.engine.state = spawnPiece(this.engine, [{ type: "restart" }]);
    return this.engine.state;
  }

  restart(): GameState {
    return this.start();
  }

  setSoftDropping(active: boolean): void {
    this.engine.softDropping = active;
  }

  handleInput(action: InputAction): GameState {
    const { engine } = this;
    switch (action) {
      case "moveLeft":
        engine.state = handleMove(engine, -1);
        break;
      case "moveRight":
        engine.state = handleMove(engine, 1);
        break;
      case "softDrop":
        engine.state = handleSoftDrop(engine);
        break;
      case "hardDrop":
        engine.state = handleHardDrop(engine);
        break;
      case "rotateCW":
        engine.state = handleRotate(engine, 1);
        break;
      case "rotateCCW":
        engine.state = handleRotate(engine, -1);
        break;
      case "hold":
        engine.state = handleHold(engine);
        break;
      case "pause":
        engine.state = handlePauseToggle(engine);
        break;
      case "restart":
        engine.state = this.restart();
        break;
      default: {
        const _exhaustive: never = action;
        void _exhaustive;
      }
    }
    return engine.state;
  }

  /**
   * Advance simulation by delta milliseconds.
   * Call from requestAnimationFrame; rendering should read getState().
   */
  update(dtMs: number): GameState {
    const { engine } = this;
    const clamped = Math.min(Math.max(dtMs, 0), 100);

    if (engine.state.phase === "clearing") {
      const clearing = engine.state.clearing;
      if (
        clearing &&
        engine.now() - clearing.startedAt >= clearing.durationMs
      ) {
        engine.state = finishClear(engine);
      }
      return engine.state;
    }

    if (engine.state.phase !== "playing") {
      return withEvents(engine.state, []);
    }

    const interval = engine.softDropping
      ? Math.min(engine.state.dropIntervalMs, 50)
      : engine.state.dropIntervalMs;

    engine.dropAccumulatorMs += clamped;
    while (
      engine.dropAccumulatorMs >= interval &&
      engine.state.phase === "playing"
    ) {
      engine.dropAccumulatorMs -= interval;
      if (engine.softDropping && engine.state.active) {
        engine.state = handleSoftDrop(engine);
      } else {
        engine.state = gravityStep(engine);
      }
      if (engine.state.phase !== "playing") {
        break;
      }
    }

    if (engine.state.phase === "playing") {
      engine.state = tickLock(engine, clamped);
    }

    return engine.state;
  }

  /**
   * Test helper: replace the board and attempt to spawn the next piece.
   * Used to exercise game-over without playing through a full stack-out.
   */
  forceSpawnWithBoard(board: Board): GameState {
    this.engine.state = {
      ...this.engine.state,
      board: board.map((row) => [...row]),
      active: null,
      phase: "playing",
      clearing: null,
      lastEvents: [],
    };
    this.engine.state = spawnPiece(this.engine, []);
    return this.engine.state;
  }
}

/** Factory used by tests and the React host. */
export function createGameEngine(deps?: EngineDeps): GameEngine {
  return new GameEngine(deps);
}
