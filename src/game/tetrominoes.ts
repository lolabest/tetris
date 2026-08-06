import type { RotationState, TetrominoType } from "./types";

/** Cell offsets relative to piece origin for each tetromino and rotation. */
export type ShapeCells = readonly (readonly [number, number])[];

/**
 * Piece shapes use a simplified SRS-like coordinate system.
 * Origin is the top-left of a conceptual bounding box; wall kicks use
 * documented offsets in rotation.ts.
 */
const I_SHAPES: readonly ShapeCells[] = [
  [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
  ],
  [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
  ],
];

const O_SHAPES: readonly ShapeCells[] = [
  [
    [1, 0],
    [2, 0],
    [1, 1],
    [2, 1],
  ],
  [
    [1, 0],
    [2, 0],
    [1, 1],
    [2, 1],
  ],
  [
    [1, 0],
    [2, 0],
    [1, 1],
    [2, 1],
  ],
  [
    [1, 0],
    [2, 0],
    [1, 1],
    [2, 1],
  ],
];

const T_SHAPES: readonly ShapeCells[] = [
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  [
    [1, 0],
    [1, 1],
    [2, 1],
    [1, 2],
  ],
  [
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ],
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],
];

const S_SHAPES: readonly ShapeCells[] = [
  [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [1, 0],
    [1, 1],
    [2, 1],
    [2, 2],
  ],
  [
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],
];

const Z_SHAPES: readonly ShapeCells[] = [
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  [
    [2, 0],
    [1, 1],
    [2, 1],
    [1, 2],
  ],
  [
    [0, 1],
    [1, 1],
    [1, 2],
    [2, 2],
  ],
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [0, 2],
  ],
];

const J_SHAPES: readonly ShapeCells[] = [
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  [
    [1, 0],
    [2, 0],
    [1, 1],
    [1, 2],
  ],
  [
    [0, 1],
    [1, 1],
    [2, 1],
    [2, 2],
  ],
  [
    [1, 0],
    [1, 1],
    [0, 2],
    [1, 2],
  ],
];

const L_SHAPES: readonly ShapeCells[] = [
  [
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 2],
  ],
  [
    [0, 1],
    [1, 1],
    [2, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [1, 2],
  ],
];

export const TETROMINO_SHAPES: Readonly<
  Record<TetrominoType, readonly ShapeCells[]>
> = {
  I: I_SHAPES,
  O: O_SHAPES,
  T: T_SHAPES,
  S: S_SHAPES,
  Z: Z_SHAPES,
  J: J_SHAPES,
  L: L_SHAPES,
};

/** Piano-inspired display colors (CSS hex). Used by renderer only via theme mapping. */
export const PIECE_THEME_KEYS: Readonly<Record<TetrominoType, string>> = {
  I: "ivory",
  O: "gold",
  T: "pearl",
  S: "sage",
  Z: "rosewood",
  J: "slate",
  L: "amber",
};

export function getShapeCells(
  type: TetrominoType,
  rotation: RotationState,
): ShapeCells {
  return TETROMINO_SHAPES[type][rotation]!;
}

export function nextRotation(
  current: RotationState,
  direction: 1 | -1,
): RotationState {
  return ((((current + direction) % 4) + 4) % 4) as RotationState;
}
