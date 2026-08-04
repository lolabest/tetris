# Accessibility

## Semantics & focus

- Start / pause / game-over use dialogs or labelled sections with headings.
- Buttons expose accessible names (`aria-label` / visible text).
- Mute uses `aria-pressed`.
- Visible `:focus-visible` outlines use the gold focus token.

## Keyboard

- Full gameplay is keyboard-driven; menus are button-focused.
- Gameplay keys call `preventDefault()` to avoid page scroll.
- `R` restarts only after confirmation (except from game-over flow).

## Motion

- `prefers-reduced-motion: reduce` disables decorative key animations, fades, particles, and level-flash animation; clear feedback remains via opacity / static states.

## Color

- Piece types differ by hue **and** placement; ghost uses transparency; hold availability uses text (“Ready” / “Used”), not color alone.
- Contrast targets ivory/gold text on charcoal panels.

## Other

- Game pauses when the document becomes hidden (`visibilitychange`).
- Touch controls appear on narrow viewports with large hit targets.
- Canvas has an accessible name via `aria-label` / `role="img"`.
