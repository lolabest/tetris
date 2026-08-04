import { getPieceCells } from "./board";
import type { ActivePiece, Board, Position } from "./types";

export function isInsideBoard(x: number, y: number, board: Board): boolean {
  const height = board.length;
  const width = board[0]?.length ?? 0;
  return x >= 0 && x < width && y < height;
}

/**
 * A cell is colliding if it is outside the board horizontally / below,
 * or overlaps a locked cell. Cells above y=0 (in buffer / above) are allowed
 * for spawn motion as long as x is in range and the cell is empty when on-board.
 */
export function isCellBlocked(x: number, y: number, board: Board): boolean {
  const width = board[0]?.length ?? 0;
  if (x < 0 || x >= width) {
    return true;
  }
  if (y < 0) {
    return false;
  }
  if (y >= board.length) {
    return true;
  }
  return board[y]![x] !== null;
}

export function collides(board: Board, piece: ActivePiece): boolean {
  for (const cell of getPieceCells(piece)) {
    if (isCellBlocked(cell.x, cell.y, board)) {
      return true;
    }
  }
  return false;
}

export function canPlace(board: Board, piece: ActivePiece): boolean {
  return !collides(board, piece);
}

export function tryMove(
  board: Board,
  piece: ActivePiece,
  dx: number,
  dy: number,
): ActivePiece | null {
  const moved: ActivePiece = {
    ...piece,
    position: {
      x: piece.position.x + dx,
      y: piece.position.y + dy,
    },
  };
  return canPlace(board, moved) ? moved : null;
}

/** Drop the piece as far as possible; returns the resulting piece and distance. */
export function hardDropPosition(
  board: Board,
  piece: ActivePiece,
): { piece: ActivePiece; distance: number } {
  let distance = 0;
  let current = piece;
  for (;;) {
    const next = tryMove(board, current, 0, 1);
    if (!next) {
      break;
    }
    current = next;
    distance += 1;
  }
  return { piece: current, distance };
}

export function ghostPosition(board: Board, piece: ActivePiece): Position {
  return hardDropPosition(board, piece).piece.position;
}
