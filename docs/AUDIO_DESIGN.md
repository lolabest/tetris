# Audio Design

## Goals

Provide calm, piano-like feedback that reinforces actions without depending on external audio assets or copyrighted music.

## Lifecycle

1. `PianoAudioEngine` is constructed muted/unmuted from settings.
2. `unlock()` must run inside a user gesture (start button, mute toggle, etc.).
3. An `AudioContext` + master `GainNode` are created; resume if suspended.
4. `dispose()` closes the context on app unmount.

If Web Audio is missing or fails, all play methods no-op — gameplay continues.

## Mapping

| Event                            | Feedback                                                           |
| -------------------------------- | ------------------------------------------------------------------ |
| Piece spawn / lock               | Piece-specific pitch (`PIECE_FREQUENCIES`)                         |
| Move / rotate / soft drop / hold | Short soft tones                                                   |
| Hard drop                        | Low + overtone hit                                                 |
| Line clear                       | Ascending arpeggio (`LINE_CLEAR_ARPEGGIO`), length = lines cleared |
| Level up                         | Rising triad                                                       |
| Game over                        | Descending low tones                                               |

## Background music

An original late-night jazz piano loop (`musicDefinitions.ts`) plays during active gameplay:

- Swing-feel melody with blue notes + stride/walking accompaniment (C blues / dominant cycle)
- Generated entirely with oscillators — no sampled or copyrighted audio
- Starts when a session begins; pauses with the game; stops on game over / menu
- Routed through a separate music bus (quieter than SFX) under the master gain
- Respects mute / volume; safe no-op if Web Audio is unavailable

SFX remain event-driven and unchanged in role.
