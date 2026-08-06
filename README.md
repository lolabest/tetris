# Piano Blocks

An elegant falling-block puzzle game with a premium piano theme. Clear rows like pressing ivory keys — every piece sings its own note.

![Screenshot placeholder](docs/assets/screenshot-placeholder.svg)

> **Live demo:** _Coming soon — add your deployment URL here._

## Features

- Complete 10×20 falling-block engine with seven standard pieces
- Seven-bag randomizer, hold piece, ghost piece, and next-piece preview
- SRS-inspired wall kicks with documented simplifications
- Soft drop, hard drop, scoring, levels, and rising fall speed
- Pause / resume, restart with confirmation, and game-over flow
- Procedural piano audio via the Web Audio API (no copyrighted music)
- Keyboard + responsive touch controls
- High-score and settings persistence
- Accessible UI with reduced-motion support

## Controls

| Action     | Keyboard    | Touch               |
| ---------- | ----------- | ------------------- |
| Move       | ← →         | ← → buttons         |
| Soft drop  | ↓           | ↓ (hold)            |
| Hard drop  | Space       | ⬇                   |
| Rotate CW  | ↑ or X      | ↻                   |
| Rotate CCW | Z           | ↺                   |
| Hold       | C           | Hold                |
| Pause      | P or Escape | Pause               |
| Restart    | R (confirm) | Restart in overlays |

## Technology stack

- React 19 + TypeScript (strict)
- Vite 6
- HTML5 Canvas
- CSS Modules
- Vitest + Testing Library
- Playwright (smoke e2e)
- ESLint + Prettier
- GitHub Actions CI

## Architecture overview

Deterministic game logic lives in `src/game/` with **no React imports**. React owns presentation and orchestration; Canvas frames are drawn imperatively from `requestAnimationFrame` so the UI does not re-render every frame. Audio is isolated in `src/audio/`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/GAME_ENGINE.md](docs/GAME_ENGINE.md).

## Local setup

```bash
npm install
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

## npm scripts

| Script                            | Description                                     |
| --------------------------------- | ----------------------------------------------- |
| `npm run dev`                     | Start Vite dev server                           |
| `npm run build`                   | Typecheck project references + production build |
| `npm run preview`                 | Preview production build                        |
| `npm run lint`                    | ESLint                                          |
| `npm run format` / `format:check` | Prettier write / check                          |
| `npm run typecheck`               | TypeScript project build check                  |
| `npm run test`                    | Vitest unit tests                               |
| `npm run test:coverage`           | Vitest with coverage                            |
| `npm run test:e2e`                | Playwright smoke test                           |
| `npm run check`                   | typecheck + lint + format + unit tests + build  |

## Testing

```bash
npm run test
npm run test:coverage
npx playwright install chromium   # first time only
npm run test:e2e
```

## Project structure

```
src/
  app/           App orchestration
  audio/         Procedural piano engine
  components/    UI + Canvas
  game/          Pure puzzle engine
  hooks/         RAF, keyboard, touch, motion preference
  storage/       localStorage adapters
  styles/        Global + theme tokens
  tests/         Unit tests
docs/            Technical documentation
e2e/             Playwright specs
```

## Accessibility

Semantic controls and dialogs, visible focus states, keyboard play, pause-on-tab-hide, scroll prevention for game keys, and `prefers-reduced-motion` support. Details: [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md).

## Performance considerations

- Canvas draw path is imperative (no per-frame React state for the board)
- Delta-time gravity with clamped `dt`
- DPR-aware canvas sizing capped at 2×
- Audio nodes disconnect on `onended`; AudioContext closed on dispose
- Minimal runtime dependencies (React + React DOM only)

## Known limitations

- Wall kicks are SRS-**inspired**, not a certified Guideline implementation
- Audio uses simple oscillators (not sampled piano)
- No online leaderboard or account system
- Touch layout is optimized for phones in portrait; landscape tablets use hybrid UI
- E2E suite is a single smoke path (not full gameplay coverage)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Roadmap

- Optional DAS/ARR tuning and customization panel
- Replay / seed sharing
- Additional visual themes (still original assets)
- Broader Playwright coverage
- PWA install support

## License

MIT — see [LICENSE](LICENSE).

Piano Blocks is an original open-source project. It is not affiliated with, endorsed by, or a copy of any commercial falling-block trademark or product.
