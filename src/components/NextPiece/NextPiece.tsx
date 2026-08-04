import { useEffect, useRef } from "react";
import type { TetrominoType } from "../../game/types";
import { drawMiniPiece } from "../GameCanvas/renderBoard";
import styles from "./PiecePanel.module.css";

interface NextPieceProps {
  readonly queue: readonly TetrominoType[];
}

export function NextPiece({ queue }: NextPieceProps) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    queue.slice(0, 3).forEach((type, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawMiniPiece(ctx, type, w, h);
    });
  }, [queue]);

  return (
    <section
      className={styles.panel}
      aria-label="Next pieces"
      data-testid="next-piece"
    >
      <h2 className={styles.title}>Next</h2>
      <div className={styles.stack}>
        {queue.slice(0, 3).map((type, index) => (
          <canvas
            key={`${type}-${index}`}
            ref={(el) => {
              canvasRefs.current[index] = el;
            }}
            className={styles.canvas}
            aria-label={`Next piece ${index + 1}: ${type}`}
          />
        ))}
      </div>
    </section>
  );
}
