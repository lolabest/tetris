import { useEffect, useRef } from "react";
import type { TetrominoType } from "../../game/types";
import { drawMiniPiece } from "../GameCanvas/renderBoard";
import styles from "./PiecePanel.module.css";

interface HoldPieceProps {
  readonly hold: TetrominoType | null;
  readonly canHold: boolean;
}

export function HoldPiece({ hold, canHold }: HoldPieceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawMiniPiece(ctx, hold, w, h);
  }, [hold]);

  return (
    <section
      className={`${styles.panel} ${canHold ? "" : styles.disabled}`}
      aria-label="Hold piece"
      data-testid="hold-piece"
    >
      <h2 className={styles.title}>Hold</h2>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label={hold ? `Held piece: ${hold}` : "No held piece"}
      />
      <p className={styles.hint}>
        <kbd>C</kbd> hold key
      </p>
    </section>
  );
}
