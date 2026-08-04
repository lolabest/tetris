import { BUFFER_ROWS, BOARD_WIDTH, VISIBLE_HEIGHT } from "../../game/constants";
import { getPieceCells } from "../../game/board";
import { getShapeCells } from "../../game/tetrominoes";
import type { ActivePiece, GameState, TetrominoType } from "../../game/types";

export const PIECE_COLORS: Readonly<Record<TetrominoType, string>> = {
  I: "#e8dcc4",
  O: "#d4af37",
  T: "#d9cfc0",
  S: "#8fa382",
  Z: "#9a6b5a",
  J: "#7a8494",
  L: "#c4924a",
};

export interface RenderOptions {
  readonly reducedMotion: boolean;
  readonly hardDropTrail: {
    x: number;
    fromY: number;
    toY: number;
    type: TetrominoType;
    born: number;
  } | null;
  readonly particles: readonly Particle[];
  readonly now: number;
}

export interface Particle {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly life: number;
  readonly born: number;
  readonly color: string;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawKeyBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  options: { alpha?: number; pressed?: number; highlight?: boolean } = {},
): void {
  const alpha = options.alpha ?? 1;
  const pressed = options.pressed ?? 0;
  const inset = size * 0.06;
  const drawY = y + pressed * size * 0.08;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  roundRect(
    ctx,
    x + inset,
    drawY + inset + 2,
    size - inset * 2,
    size - inset * 2,
    3,
  );
  ctx.fill();

  // Body
  const gradient = ctx.createLinearGradient(x, drawY, x, drawY + size);
  gradient.addColorStop(0, shade(color, 1.12));
  gradient.addColorStop(0.45, color);
  gradient.addColorStop(1, shade(color, 0.72));
  ctx.fillStyle = gradient;
  roundRect(
    ctx,
    x + inset,
    drawY + inset,
    size - inset * 2,
    size - inset * 2,
    3,
  );
  ctx.fill();

  // Top gloss (ivory key highlight)
  if (options.highlight !== false) {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    roundRect(
      ctx,
      x + inset + 2,
      drawY + inset + 2,
      size - inset * 2 - 4,
      (size - inset * 2) * 0.28,
      2,
    );
    ctx.fill();
  }

  // Gold edge line
  ctx.strokeStyle = "rgba(201,162,39,0.25)";
  ctx.lineWidth = 1;
  roundRect(
    ctx,
    x + inset + 0.5,
    drawY + inset + 0.5,
    size - inset * 2 - 1,
    size - inset * 2 - 1,
    3,
  );
  ctx.stroke();

  ctx.restore();
}

function shade(hex: string, factor: number): string {
  const raw = hex.replace("#", "");
  const num = Number.parseInt(
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw,
    16,
  );
  const r = Math.min(
    255,
    Math.max(0, Math.round(((num >> 16) & 255) * factor)),
  );
  const g = Math.min(255, Math.max(0, Math.round(((num >> 8) & 255) * factor)));
  const b = Math.min(255, Math.max(0, Math.round((num & 255) * factor)));
  return `rgb(${r},${g},${b})`;
}

function boardOrigin(state: GameState): { offsetY: number } {
  void state;
  return { offsetY: BUFFER_ROWS };
}

export function drawMiniPiece(
  ctx: CanvasRenderingContext2D,
  type: TetrominoType | null,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  if (!type) {
    return;
  }
  const cells = getShapeCells(type, 0);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of cells) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const cell = Math.min(width / (bw + 1), height / (bh + 1), 22);
  const ox = (width - bw * cell) / 2;
  const oy = (height - bh * cell) / 2;
  for (const [x, y] of cells) {
    drawKeyBlock(
      ctx,
      ox + (x - minX) * cell,
      oy + (y - minY) * cell,
      cell,
      PIECE_COLORS[type],
    );
  }
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
  options: RenderOptions,
): void {
  const cellW = width / BOARD_WIDTH;
  const cellH = height / VISIBLE_HEIGHT;
  const { offsetY } = boardOrigin(state);

  ctx.clearRect(0, 0, width, height);

  // Board background — polished wood / charcoal
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#1a1713");
  bg.addColorStop(1, "#100e0c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle key-lane stripes
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    if (x % 2 === 0) {
      ctx.fillStyle = "rgba(243,234,216,0.03)";
      ctx.fillRect(x * cellW, 0, cellW, height);
    }
  }

  // Grid lines
  ctx.strokeStyle = "rgba(58,52,44,0.55)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= BOARD_WIDTH; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * cellW + 0.5, 0);
    ctx.lineTo(x * cellW + 0.5, height);
    ctx.stroke();
  }
  for (let y = 0; y <= VISIBLE_HEIGHT; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellH + 0.5);
    ctx.lineTo(width, y * cellH + 0.5);
    ctx.stroke();
  }

  const clearingRows = new Set(state.clearing?.rows ?? []);
  const clearProgress =
    state.clearing && state.clearing.durationMs > 0
      ? Math.min(
          1,
          (options.now - state.clearing.startedAt) / state.clearing.durationMs,
        )
      : 0;

  // Locked cells
  for (let y = offsetY; y < state.board.length; y += 1) {
    const row = state.board[y];
    if (!row) continue;
    const visibleY = y - offsetY;
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const cell = row[x];
      if (!cell) continue;
      const pressed = clearingRows.has(y)
        ? options.reducedMotion
          ? 1
          : Math.sin(clearProgress * Math.PI)
        : 0;
      const alpha = clearingRows.has(y)
        ? options.reducedMotion
          ? 0.3
          : 1 - clearProgress * 0.85
        : 1;
      drawKeyBlock(
        ctx,
        x * cellW,
        visibleY * cellH,
        Math.min(cellW, cellH),
        PIECE_COLORS[cell],
        { alpha, pressed },
      );
    }
  }

  // Hard-drop trail
  if (options.hardDropTrail && !options.reducedMotion) {
    const trail = options.hardDropTrail;
    const age = options.now - trail.born;
    if (age < 180) {
      const alpha = 1 - age / 180;
      ctx.save();
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = PIECE_COLORS[trail.type];
      const cells = getShapeCells(trail.type, state.active?.rotation ?? 0);
      // approximate using last known shape — use trail type spawn shape
      for (const [dx] of cells) {
        const x = (trail.x + dx) * cellW + cellW * 0.25;
        const y1 = (trail.fromY - offsetY) * cellH;
        const y2 = (trail.toY - offsetY) * cellH;
        ctx.fillRect(x, Math.min(y1, y2), cellW * 0.5, Math.abs(y2 - y1));
      }
      ctx.restore();
    }
  }

  // Ghost
  if (state.active && state.ghostY !== null && state.phase === "playing") {
    const ghost: ActivePiece = {
      ...state.active,
      position: { x: state.active.position.x, y: state.ghostY },
    };
    for (const cell of getPieceCells(ghost)) {
      if (cell.y < offsetY) continue;
      drawKeyBlock(
        ctx,
        cell.x * cellW,
        (cell.y - offsetY) * cellH,
        Math.min(cellW, cellH),
        PIECE_COLORS[ghost.type],
        { alpha: 0.28, highlight: false },
      );
    }
  }

  // Active piece
  if (state.active && (state.phase === "playing" || state.phase === "paused")) {
    for (const cell of getPieceCells(state.active)) {
      if (cell.y < offsetY) continue;
      drawKeyBlock(
        ctx,
        cell.x * cellW,
        (cell.y - offsetY) * cellH,
        Math.min(cellW, cellH),
        PIECE_COLORS[state.active.type],
      );
    }
  }

  // Particles
  if (!options.reducedMotion) {
    for (const p of options.particles) {
      const age = options.now - p.born;
      const t = age / p.life;
      if (t >= 1) continue;
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = p.color;
      const px = p.x + p.vx * (age / 1000);
      const py = p.y + p.vy * (age / 1000) + 40 * (age / 1000) ** 2;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Frame gold edge
  ctx.strokeStyle = "rgba(201,162,39,0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);
}
