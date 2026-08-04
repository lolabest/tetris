import { useEffect, useRef } from "react";

/**
 * requestAnimationFrame loop with delta-time, pausing when the tab is hidden.
 * Keeps a stable callback ref to avoid stale closures.
 */
export function useGameLoop(
  running: boolean,
  onFrame: (dtMs: number, now: number) => void,
): void {
  const callbackRef = useRef(onFrame);
  callbackRef.current = onFrame;

  useEffect(() => {
    if (!running) {
      return;
    }

    let frameId = 0;
    let last = performance.now();
    let active = true;

    const tick = (now: number): void => {
      if (!active) {
        return;
      }
      const dt = now - last;
      last = now;
      callbackRef.current(dt, now);
      frameId = requestAnimationFrame(tick);
    };

    const onVisibility = (): void => {
      if (document.hidden) {
        active = false;
        cancelAnimationFrame(frameId);
      } else {
        active = true;
        last = performance.now();
        frameId = requestAnimationFrame(tick);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    frameId = requestAnimationFrame(tick);

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [running]);
}
