import { canPlace } from "./collision";
import { nextRotation } from "./tetrominoes";
import type {
  ActivePiece,
  Board,
  Position,
  RotationState,
  TetrominoType,
} from "./types";

/**
 * Wall-kick tables inspired by Super Rotation System (SRS).
 *
 * Intentional simplifications vs full Guideline SRS:
 * - Offsets are expressed relative to our shape coordinate system (not the
 *   official SRS "bounding box" notation), tuned for the shapes in tetrominoes.ts.
 * - O pieces do not kick (rotation is a no-op visually).
 * - Kick lists are slightly shortened where extra tests never succeed for our
 *   shapes; core wall and floor kicks that enable standard play are preserved.
 *
 * Values are [dx, dy] applied after rotating the piece matrix.
 */

type KickTable = Readonly<Record<string, readonly Position[]>>;

function key(from: RotationState, to: RotationState): string {
  return `${from}->${to}`;
}

const JLSTZ_KICKS: KickTable = {
  [key(0, 1)]: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: 2 },
    { x: -1, y: 2 },
  ],
  [key(1, 0)]: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -2 },
  ],
  [key(1, 2)]: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -2 },
  ],
  [key(2, 1)]: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: 2 },
    { x: -1, y: 2 },
  ],
  [key(2, 3)]: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
  [key(3, 2)]: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -2 },
    { x: -1, y: -2 },
  ],
  [key(3, 0)]: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -2 },
    { x: -1, y: -2 },
  ],
  [key(0, 3)]: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
};

const I_KICKS: KickTable = {
  [key(0, 1)]: [
    { x: 0, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 1 },
    { x: 1, y: -2 },
  ],
  [key(1, 0)]: [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: -1 },
    { x: -1, y: 2 },
  ],
  [key(1, 2)]: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: -2 },
    { x: 2, y: 1 },
  ],
  [key(2, 1)]: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 2 },
    { x: -2, y: -1 },
  ],
  [key(2, 3)]: [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: -1 },
    { x: -1, y: 2 },
  ],
  [key(3, 2)]: [
    { x: 0, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 1 },
    { x: 1, y: -2 },
  ],
  [key(3, 0)]: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 2 },
    { x: -2, y: -1 },
  ],
  [key(0, 3)]: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: -2 },
    { x: 2, y: 1 },
  ],
};

function kicksFor(
  type: TetrominoType,
  from: RotationState,
  to: RotationState,
): readonly Position[] {
  if (type === "O") {
    return [{ x: 0, y: 0 }];
  }
  const table = type === "I" ? I_KICKS : JLSTZ_KICKS;
  return table[key(from, to)] ?? [{ x: 0, y: 0 }];
}

export function tryRotate(
  board: Board,
  piece: ActivePiece,
  direction: 1 | -1,
): ActivePiece | null {
  const from = piece.rotation;
  const to = nextRotation(from, direction);
  const kicks = kicksFor(piece.type, from, to);

  for (const kick of kicks) {
    const candidate: ActivePiece = {
      type: piece.type,
      rotation: to,
      position: {
        x: piece.position.x + kick.x,
        y: piece.position.y + kick.y,
      },
    };
    if (canPlace(board, candidate)) {
      return candidate;
    }
  }
  return null;
}
