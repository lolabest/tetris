# Contributing to Piano Blocks

Thank you for helping improve Piano Blocks.

## Development setup

```bash
npm install
npm run dev
```

## Quality gates

Before opening a pull request, run:

```bash
npm run check
```

This runs typecheck, lint, format check, unit tests, and a production build.

## Guidelines

- Keep game-domain logic in `src/game/` free of React imports.
- Prefer pure functions and injectable dependencies (random, clock) for testability.
- Do not add proprietary music, fonts beyond the documented stack, or trademarked branding.
- Add or update Vitest coverage for engine and storage changes.
- Match existing TypeScript strictness; avoid `any`.
- Keep components focused; put orchestration in `src/app/App.tsx` and hooks.

## Commit style

Use clear, descriptive commit messages focused on why the change exists.

## Pull requests

Use the PR template. Include screenshots for visual changes when practical.
