import { BUFFER_ROWS, TOTAL_HEIGHT, BOARD_WIDTH } from "./constants";
import { getShapeCells } from "./tetrominoes";
import type { ActivePiece, Board, CellValue, Position } from "./types";

export function createEmptyBoard(
  width: number = BOARD_WIDTH,
  height: number = TOTAL_HEIGHT,
): Board {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => null),
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function getPieceCells(piece: ActivePiece): readonly Position[] {
  const cells = getShapeCells(piece.type, piece.rotation);
  return cells.map(([dx, dy]) => ({
    x: piece.position.x + dx,
    y: piece.position.y + dy,
  }));
}

export function lockPiece(board: Board, piece: ActivePiece): Board {
  const next = cloneBoard(board);
  for (const cell of getPieceCells(piece)) {
    if (
      cell.y >= 0 &&
      cell.y < next.length &&
      cell.x >= 0 &&
      cell.x < (next[0]?.length ?? 0)
    ) {
      const row = next[cell.y];
      if (row) {
        row[cell.x] = piece.type;
      }
    }
  }
  return next;
}

export function findFullRows(board: Board): number[] {
  const full: number[] = [];
  for (let y = 0; y < board.length; y += 1) {
    const row = board[y];
    if (row && row.every((cell) => cell !== null)) {
      full.push(y);
    }
  }
  return full;
}

export function clearRows(board: Board, rows: readonly number[]): Board {
  if (rows.length === 0) {
    return board;
  }
  const width = board[0]?.length ?? BOARD_WIDTH;
  const remove = new Set(rows);
  const kept: CellValue[][] = [];
  for (let y = 0; y < board.length; y += 1) {
    if (!remove.has(y)) {
      kept.push([...(board[y] ?? [])]);
    }
  }
  while (kept.length < board.length) {
    kept.unshift(Array.from({ length: width }, () => null));
  }
  return kept;
}

/** True if any locked cell occupies the visible spawn / buffer zone (game over). */
export function isBoardBlocked(
  board: Board,
  bufferRows: number = BUFFER_ROWS,
): boolean {
  for (let y = 0; y < bufferRows; y += 1) {
    const row = board[y];
    if (row?.some((cell) => cell !== null)) {
      return true;
    }
  }
  return false;
}

export function spawnPosition(
  type: ActivePiece["type"],
  boardWidth: number = BOARD_WIDTH,
): Position {
  // Center-ish spawn; I and O use standard-ish offsets for a 10-wide board.
  const x =
    type === "O"
      ? Math.floor(boardWidth / 2) - 2
      : Math.floor(boardWidth / 2) - 2;
  return { x, y: 0 };
}
