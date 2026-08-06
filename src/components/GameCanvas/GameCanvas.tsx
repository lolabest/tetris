import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { GameState } from "../../game/types";
import { renderGame, type Particle } from "./renderBoard";
import styles from "./GameCanvas.module.css";
import type { TetrominoType } from "../../game/types";

export interface HardDropTrail {
  x: number;
  fromY: number;
  toY: number;
  type: TetrominoType;
  born: number;
}

export interface GameCanvasHandle {
  draw: (
    state: GameState,
    options: {
      reducedMotion: boolean;
      hardDropTrail: HardDropTrail | null;
      particles: readonly Particle[];
      now: number;
    },
  ) => void;
}

export const GameCanvas = forwardRef<GameCanvasHandle>(
  function GameCanvas(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sizeRef = useRef({ width: 0, height: 0 });
    const lastDrawRef = useRef<{
      state: GameState;
      options: {
        reducedMotion: boolean;
        hardDropTrail: HardDropTrail | null;
        particles: readonly Particle[];
        now: number;
      };
    } | null>(null);

    const paint = (): void => {
      const canvas = canvasRef.current;
      const last = lastDrawRef.current;
      if (!canvas || !last || sizeRef.current.width <= 0) {
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      renderGame(
        ctx,
        last.state,
        sizeRef.current.width,
        sizeRef.current.height,
        last.options,
      );
    };

    useImperativeHandle(ref, () => ({
      draw(state, options) {
        lastDrawRef.current = { state, options };
        paint();
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        return;
      }

      const resize = (): void => {
        const rect = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        sizeRef.current = { width: rect.width, height: rect.height };
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        paint();
      };

      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      return () => observer.disconnect();
    }, []);

    return (
      <div ref={containerRef} className={styles.frame} data-testid="game-board">
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label="Piano Blocks game board"
        />
      </div>
    );
  },
);
