/** Shared gameplay types. Game-domain code must not import React. */

export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type RotationState = 0 | 1 | 2 | 3;

export type CellValue = TetrominoType | null;

export type Board = CellValue[][];

export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface ActivePiece {
  readonly type: TetrominoType;
  readonly rotation: RotationState;
  readonly position: Position;
}

export type GamePhase = "idle" | "playing" | "paused" | "clearing" | "gameover";

export type InputAction =
  | "moveLeft"
  | "moveRight"
  | "softDrop"
  | "hardDrop"
  | "rotateCW"
  | "rotateCCW"
  | "hold"
  | "pause"
  | "restart";

export type GameEventType =
  | "move"
  | "rotate"
  | "softDrop"
  | "hardDrop"
  | "lock"
  | "hold"
  | "lineClear"
  | "levelUp"
  | "gameOver"
  | "spawn"
  | "pause"
  | "resume"
  | "restart";

export interface GameEvent {
  readonly type: GameEventType;
  readonly linesCleared?: number;
  readonly level?: number;
  readonly pieceType?: TetrominoType;
  readonly hardDropDistance?: number;
}

export interface ClearingAnimation {
  readonly rows: readonly number[];
  readonly startedAt: number;
  readonly durationMs: number;
}

export interface GameState {
  readonly board: Board;
  readonly active: ActivePiece | null;
  readonly hold: TetrominoType | null;
  readonly canHold: boolean;
  readonly nextQueue: readonly TetrominoType[];
  readonly score: number;
  readonly lines: number;
  readonly level: number;
  readonly combo: number;
  readonly phase: GamePhase;
  readonly dropIntervalMs: number;
  readonly lockDelayMs: number;
  readonly lockResets: number;
  readonly clearing: ClearingAnimation | null;
  readonly ghostY: number | null;
  readonly highScore: number;
  readonly lastEvents: readonly GameEvent[];
}

export interface EngineConfig {
  readonly boardWidth: number;
  readonly boardHeight: number;
  readonly bufferRows: number;
  readonly lockDelayMs: number;
  readonly maxLockResets: number;
  readonly clearAnimationMs: number;
  readonly previewCount: number;
  readonly linesPerLevel: number;
  readonly initialDropMs: number;
  readonly minDropMs: number;
}

export type RandomFn = () => number;

export interface EngineDeps {
  readonly random: RandomFn;
  readonly now: () => number;
  readonly highScore?: number;
  readonly config?: Partial<EngineConfig>;
}
