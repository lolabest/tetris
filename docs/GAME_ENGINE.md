# Game Engine

## Board

- Logical board: **10 × 22** (20 visible + 2 buffer rows at the top).
- Cells store a tetromino type or `null`.
- Spawn uses the buffer; locking into the buffer triggers game over on subsequent spawn failure / lock-out checks.

## Pieces

Seven standard shapes: `I O T S Z J L`, each with four rotation states defined in `tetrominoes.ts`.

## Randomizer

Seven-bag: every bag contains each piece once, shuffled with Fisher–Yates via an injected `random()` function. Tests inject `createSeededRandom(seed)`.

## Collision

A placement is illegal if any cell is out of horizontal bounds, below the floor, or overlaps a locked cell. Cells with `y < 0` are allowed during spawn motion.

## Rotation (SRS-inspired)

`rotation.ts` applies wall-kick offset tables inspired by Super Rotation System.

**Intentional simplifications:**

- Offsets are expressed for this project’s shape coordinate system (not official SRS bounding-box notation).
- `O` rotation is a no-op (identical matrices).
- Kick lists are trimmed where extra tests never succeed for these shapes; core wall/floor kicks needed for playable rotations remain.

## Locking & clearing

- Soft drop moves one cell and awards points; failure to move while soft-dropping locks.
- Hard drop teleports to ghost position, awards 2 points per cell, then locks.
- Grounded pieces use lock delay with limited resets on successful moves/rotations.
- Full rows enter `clearing` for an animation duration, then collapse with gravity.

## Scoring

| Action                          | Points                                    |
| ------------------------------- | ----------------------------------------- |
| Soft drop                       | 1 × cells                                 |
| Hard drop                       | 2 × cells                                 |
| Single / Double / Triple / Quad | 100 / 300 / 500 / 800 × **current level** |

Level = `floor(totalLines / 10) + 1`. Drop interval decays toward a minimum (`constants.ts`).

## Hold

Hold swaps the active piece with the hold slot (or takes from the next queue if empty). Hold is disabled until the next piece locks/spawns (`canHold`).

## Determinism

Given the same `random` and `now` injections and the same input sequence, the engine produces identical boards and scores—suitable for unit tests and future replays.
