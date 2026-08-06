# Audio Design

## Goals

Provide calm, piano-and-sax feedback that reinforces actions without requiring external audio assets. Copyrighted music is never bundled by default.

## Lifecycle

1. `PianoAudioEngine` is constructed from `musicEnabled`, `sfxEnabled`, and `volume` settings.
2. `unlock()` must run inside a user gesture (Play, sound toggles, etc.).
3. An `AudioContext` plus master / SFX / music buses are created; resume if suspended.
4. Optional licensed file `public/audio/dear-simon.mp3` is probed via `fetch` after unlock. If absent or invalid, the engine falls back to the procedural loop with no console errors.
5. `dispose()` closes the context on app unmount.

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

Priority:

1. Licensed file at `/audio/dear-simon.mp3` when the user supplies it (looped through the music bus).
2. Otherwise an original procedural piano-and-saxophone loop (`musicDefinitions.ts`).

Behaviour:

- Starts when a session begins; fades down on pause; resumes smoothly; stops on game over / menu
- Music On/Off and SFX On/Off are independent; volume is persisted
- Loop handoff for the procedural track avoids hard cuts
