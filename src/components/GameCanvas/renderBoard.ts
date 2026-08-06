import { BUFFER_ROWS, BOARD_WIDTH, VISIBLE_HEIGHT } from "../../game/constants";
import { getPieceCells } from "../../game/board";
import { getShapeCells } from "../../game/tetrominoes";
import type { ActivePiece, GameState, TetrominoType } from "../../game/types";

export type KeyStyle =
  "ivory" | "ebony" | "golden" | "sax" | "vinyl" | "spotlight" | "grand";

export const PIECE_KEY_STYLES: Readonly<Record<TetrominoType, KeyStyle>> = {
  I: "ivory",
  J: "ebony",
  O: "golden",
  S: "sax",
  Z: "vinyl",
  T: "spotlight",
  L: "grand",
};

/** Fallback solid for particles / UI accents */
export const PIECE_COLORS: Readonly<Record<TetrominoType, string>> = {
  I: "#e8dcc4",
  J: "#1a1814",
  O: "#d4af37",
  S: "#c4924a",
  Z: "#2a2420",
  T: "#d9cfc0",
  L: "#0e0c0a",
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

function drawNoteGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  const s = size * 0.18;
  ctx.beginPath();
  ctx.ellipse(
    cx - s * 0.3,
    cy + s * 0.35,
    s * 0.55,
    s * 0.38,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillRect(cx + s * 0.15, cy - s * 0.9, s * 0.18, s * 1.35);
}

function drawSaxGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  const s = size * 0.16;
  ctx.beginPath();
  ctx.moveTo(cx - s, cy + s);
  ctx.quadraticCurveTo(cx - s * 0.2, cy - s * 0.2, cx + s * 0.8, cy - s * 1.1);
  ctx.lineWidth = Math.max(1.2, size * 0.06);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + s * 0.85, cy - s * 1.15, s * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function drawVinylGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
): void {
  const r = size * 0.22;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

export function drawKeyBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: TetrominoType,
  options: { alpha?: number; pressed?: number; highlight?: boolean } = {},
): void {
  const style = PIECE_KEY_STYLES[type];
  const alpha = options.alpha ?? 1;
  const pressed = options.pressed ?? 0;
  const inset = size * 0.07;
  const drawY = y + pressed * size * 0.1;
  const w = size - inset * 2;
  const h = size - inset * 2;
  const bx = x + inset;
  const by = drawY + inset;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  roundRect(ctx, bx, by + 2, w, h, 3);
  ctx.fill();

  const body = ctx.createLinearGradient(bx, by, bx, by + h);

  switch (style) {
    case "ivory":
      body.addColorStop(0, "#f7f0e2");
      body.addColorStop(0.55, "#e8dcc4");
      body.addColorStop(1, "#cfc3a8");
      break;
    case "ebony":
      body.addColorStop(0, "#2a2620");
      body.addColorStop(0.45, "#141210");
      body.addColorStop(1, "#050403");
      break;
    case "golden":
      body.addColorStop(0, "#f0d78a");
      body.addColorStop(0.45, "#d4af37");
      body.addColorStop(1, "#9a7420");
      break;
    case "sax":
      body.addColorStop(0, "#e0b06a");
      body.addColorStop(0.5, "#c4924a");
      body.addColorStop(1, "#8a5a28");
      break;
    case "vinyl":
      body.addColorStop(0, "#3a342e");
      body.addColorStop(0.5, "#1c1814");
      body.addColorStop(1, "#0a0806");
      break;
    case "spotlight":
      body.addColorStop(0, "#efe6d4");
      body.addColorStop(0.4, "#d9cfc0");
      body.addColorStop(1, "#a89a82");
      break;
    case "grand":
      body.addColorStop(0, "#22201c");
      body.addColorStop(0.5, "#0e0c0a");
      body.addColorStop(1, "#050403");
      break;
  }

  ctx.fillStyle = body;
  roundRect(ctx, bx, by, w, h, 3);
  ctx.fill();

  // Top gloss / spotlight
  if (
    style === "ivory" ||
    style === "spotlight" ||
    style === "golden" ||
    style === "sax"
  ) {
    ctx.fillStyle =
      style === "spotlight"
        ? "rgba(255,230,160,0.35)"
        : "rgba(255,255,255,0.22)";
    roundRect(ctx, bx + 2, by + 2, w - 4, h * 0.28, 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, bx + 2, by + 2, w - 4, h * 0.2, 2);
    ctx.fill();
  }

  // Gold rim for grand / golden
  if (style === "grand" || style === "golden") {
    ctx.strokeStyle = "rgba(212,168,75,0.75)";
    ctx.lineWidth = Math.max(1, size * 0.04);
    roundRect(ctx, bx + 0.5, by + 0.5, w - 1, h - 1, 3);
    ctx.stroke();
  } else {
    ctx.strokeStyle = "rgba(212,168,75,0.22)";
    ctx.lineWidth = 1;
    roundRect(ctx, bx + 0.5, by + 0.5, w - 1, h - 1, 3);
    ctx.stroke();
  }

  // Subtle glyphs
  const cx = bx + w / 2;
  const cy = by + h / 2;
  if (style === "golden") {
    ctx.fillStyle = "rgba(40,28,10,0.55)";
    drawNoteGlyph(ctx, cx, cy, size);
  } else if (style === "sax") {
    ctx.strokeStyle = "rgba(40,24,10,0.55)";
    ctx.fillStyle = "rgba(40,24,10,0.55)";
    drawSaxGlyph(ctx, cx, cy, size);
  } else if (style === "vinyl") {
    ctx.strokeStyle = "rgba(212,168,75,0.45)";
    ctx.fillStyle = "rgba(212,168,75,0.55)";
    drawVinylGlyph(ctx, cx, cy, size);
  } else if (style === "spotlight") {
    const glow = ctx.createRadialGradient(
      cx,
      cy - h * 0.1,
      0,
      cx,
      cy,
      w * 0.45,
    );
    glow.addColorStop(0, "rgba(255,220,140,0.28)");
    glow.addColorStop(1, "rgba(255,220,140,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
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
      type,
    );
  }
}

function drawPianoSkirt(
  ctx: CanvasRenderingContext2D,
  width: number,
  boardBottom: number,
  skirtH: number,
  litColumns: ReadonlySet<number>,
  pressAmount: number,
): void {
  const keyW = width / BOARD_WIDTH;
  // Lacquer shelf
  ctx.fillStyle = "#0a0908";
  ctx.fillRect(0, boardBottom, width, skirtH);
  ctx.fillStyle = "rgba(212,168,75,0.25)";
  ctx.fillRect(0, boardBottom, width, 1.5);

  for (let i = 0; i < BOARD_WIDTH; i += 1) {
    const lit = litColumns.has(i);
    const press = lit ? pressAmount * 4 : 0;
    const x = i * keyW;
    const y = boardBottom + 4 + press;
    const h = skirtH - 8 - press;
    const g = ctx.createLinearGradient(x, y, x, y + h);
    if (i % 2 === 0) {
      g.addColorStop(0, lit ? "#fff6d8" : "#f3ead8");
      g.addColorStop(1, lit ? "#e0c56a" : "#c9bfa8");
    } else {
      g.addColorStop(0, lit ? "#3a3428" : "#1a1612");
      g.addColorStop(1, lit ? "#1a140e" : "#080706");
    }
    ctx.fillStyle = g;
    roundRect(ctx, x + 1, y, keyW - 2, h, 2);
    ctx.fill();
    if (lit) {
      ctx.fillStyle = "rgba(212,168,75,0.35)";
      roundRect(ctx, x + 1, y, keyW - 2, h, 2);
      ctx.fill();
    }
  }
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
  options: RenderOptions,
): void {
  const skirtH = Math.max(28, Math.floor(height * 0.09));
  const boardH = height - skirtH;
  const cellW = width / BOARD_WIDTH;
  const cellH = boardH / VISIBLE_HEIGHT;
  const offsetY = BUFFER_ROWS;
  const cell = Math.min(cellW, cellH);

  ctx.clearRect(0, 0, width, height);

  // Lacquer piano body
  const lacquer = ctx.createLinearGradient(0, 0, 0, boardH);
  lacquer.addColorStop(0, "#1a1612");
  lacquer.addColorStop(0.5, "#100e0c");
  lacquer.addColorStop(1, "#080706");
  ctx.fillStyle = lacquer;
  ctx.fillRect(0, 0, width, boardH);

  // Soft key lanes
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    if (x % 2 === 0) {
      ctx.fillStyle = "rgba(243,234,216,0.025)";
      ctx.fillRect(x * cellW, 0, cellW, boardH);
    }
  }

  // Hairline grid
  ctx.strokeStyle = "rgba(58,52,44,0.4)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= BOARD_WIDTH; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * cellW + 0.5, 0);
    ctx.lineTo(x * cellW + 0.5, boardH);
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

  const litColumns = new Set<number>();
  if (state.clearing) {
    for (const row of state.clearing.rows) {
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        litColumns.add(x);
      }
      void row;
    }
  }

  // Locked cells
  for (let y = offsetY; y < state.board.length; y += 1) {
    const row = state.board[y];
    if (!row) continue;
    const visibleY = y - offsetY;
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const cellType = row[x];
      if (!cellType) continue;
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
      drawKeyBlock(ctx, x * cellW, visibleY * cellH, cell, cellType, {
        alpha,
        pressed,
      });
    }
  }

  // Hard-drop trail
  if (options.hardDropTrail && !options.reducedMotion) {
    const trail = options.hardDropTrail;
    const age = options.now - trail.born;
    if (age < 180) {
      const a = 1 - age / 180;
      ctx.save();
      ctx.globalAlpha = a * 0.3;
      ctx.fillStyle = PIECE_COLORS[trail.type];
      const cells = getShapeCells(trail.type, 0);
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
    for (const c of getPieceCells(ghost)) {
      if (c.y < offsetY) continue;
      drawKeyBlock(
        ctx,
        c.x * cellW,
        (c.y - offsetY) * cellH,
        cell,
        ghost.type,
        {
          alpha: 0.22,
          highlight: false,
        },
      );
    }
  }

  // Active
  if (state.active && (state.phase === "playing" || state.phase === "paused")) {
    for (const c of getPieceCells(state.active)) {
      if (c.y < offsetY) continue;
      drawKeyBlock(
        ctx,
        c.x * cellW,
        (c.y - offsetY) * cellH,
        cell,
        state.active.type,
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

  // Gold lacquer frame
  ctx.strokeStyle = "rgba(212,168,75,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, width - 3, boardH - 3);
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.strokeRect(4, 4, width - 8, boardH - 8);

  const pressAmount = state.clearing
    ? options.reducedMotion
      ? 1
      : Math.sin(clearProgress * Math.PI)
    : 0;
  drawPianoSkirt(ctx, width, boardH, skirtH, litColumns, pressAmount);
}
