import { useCallback, useRef } from "react";
import type { InputAction } from "../game/types";

export interface TouchControlApi {
  readonly press: (action: InputAction) => void;
  readonly releaseSoftDrop: () => void;
  readonly startSoftDrop: () => void;
}

export function useTouchControls(
  onAction: (action: InputAction) => void,
  onSoftDropChange: (active: boolean) => void,
): TouchControlApi {
  const onActionRef = useRef(onAction);
  const onSoftRef = useRef(onSoftDropChange);
  onActionRef.current = onAction;
  onSoftRef.current = onSoftDropChange;

  const press = useCallback((action: InputAction) => {
    if (action === "softDrop") {
      onSoftRef.current(true);
    }
    onActionRef.current(action);
  }, []);

  const releaseSoftDrop = useCallback(() => {
    onSoftRef.current(false);
  }, []);

  const startSoftDrop = useCallback(() => {
    onSoftRef.current(true);
    onActionRef.current("softDrop");
  }, []);

  return { press, releaseSoftDrop, startSoftDrop };
}
