import { useEffect, useRef } from "react";
import type { InputAction } from "../game/types";

const KEY_MAP: Readonly<Record<string, InputAction>> = {
  ArrowLeft: "moveLeft",
  ArrowRight: "moveRight",
  ArrowDown: "softDrop",
  ArrowUp: "rotateCW",
  x: "rotateCW",
  X: "rotateCW",
  z: "rotateCCW",
  Z: "rotateCCW",
  " ": "hardDrop",
  c: "hold",
  C: "hold",
  p: "pause",
  P: "pause",
  Escape: "pause",
  r: "restart",
  R: "restart",
};

export interface KeyboardHandlers {
  readonly onAction: (action: InputAction) => void;
  readonly onSoftDropChange: (active: boolean) => void;
  readonly enabled: boolean;
}

/**
 * Keyboard controls. Prevents page scroll for gameplay keys.
 * Uses refs so listeners stay stable across renders.
 */
export function useKeyboardControls(handlers: KeyboardHandlers): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (
        !handlersRef.current.enabled ||
        (event.repeat && event.key !== "ArrowDown")
      ) {
        if (
          event.repeat &&
          event.key === "ArrowDown" &&
          handlersRef.current.enabled
        ) {
          // soft drop held — already active
          event.preventDefault();
        }
        return;
      }
      if (isEditableTarget(event.target)) {
        return;
      }
      const action = KEY_MAP[event.key];
      if (!action) {
        return;
      }
      event.preventDefault();
      if (action === "softDrop") {
        handlersRef.current.onSoftDropChange(true);
        handlersRef.current.onAction("softDrop");
        return;
      }
      handlersRef.current.onAction(action);
    };

    const onKeyUp = (event: KeyboardEvent): void => {
      if (event.key === "ArrowDown") {
        handlersRef.current.onSoftDropChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);
}
