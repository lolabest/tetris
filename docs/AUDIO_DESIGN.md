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

## Isolation

`src/audio/` does not import the engine class. The app maps `GameEvent`s to audio calls. Volume and mute are persisted via `settingsStorage`.

## Synthesis notes

Tones use simple oscillators (sine / triangle) with ADSR-like exponential gain envelopes for a soft piano-adjacent timbre—not a sampled piano.
