# Architecture

## Overview

Piano Blocks separates a **deterministic game engine** from React UI and Canvas rendering.

```
src/
  game/       Pure TypeScript engine (no React)
  audio/      Web Audio procedural piano (no engine imports of React)
  storage/    localStorage adapters
  hooks/      RAF loop, keyboard, touch, reduced-motion
  components/ Presentational UI + Canvas host
  app/        Orchestration: wires engine ↔ UI ↔ audio
```

## Game-state model

Authoritative state lives inside `GameEngine` (`src/game/engine.ts`). React holds a **UI snapshot** (score, level, lines, hold, next queue, phase) updated only when those values change. Canvas frames are drawn imperatively via `GameCanvas`’s `draw()` handle from `requestAnimationFrame`, avoiding per-frame React commits.

Phases: `idle` → `playing` ↔ `paused` → `clearing` → `playing` | `gameover`.

## Update loop

1. `useGameLoop` runs RAF while phase is `playing` or `clearing`.
2. Each frame calls `engine.update(dtMs)` with clamped delta time.
3. Gravity accumulates against `dropIntervalMs` (soft-drop uses a faster interval).
4. Lock delay ticks while the active piece is grounded.
5. Events on `state.lastEvents` drive audio and particles in the host.

## Rendering

`renderBoard.ts` paints the visible 10×20 region (board includes 2 buffer rows). Ghost piece, clear animations, hard-drop trail, and particles are render-only concerns.

## Dependency rules

- `src/game/**` must not import React, DOM (except where unavoidable), or audio.
- Audio consumes event types conceptually but is invoked only from the app layer.
- Storage adapters catch quota / private-mode failures and degrade gracefully.

## Extending gameplay safely

1. Add pure helpers under `src/game/`.
2. Expose transitions through `GameEngine.handleInput` / `update`.
3. Emit `GameEvent`s for side effects (sound, particles).
4. Cover behavior with Vitest using `createSeededRandom`.
5. Update docs in `docs/GAME_ENGINE.md` if rules change.
