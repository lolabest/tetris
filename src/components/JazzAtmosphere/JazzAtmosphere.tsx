import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import styles from "./JazzAtmosphere.module.css";

interface SmokePuff {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  wobble: number;
  wobbleSpeed: number;
}

/**
 * Jazz bar backdrop: piano boy scene + thick drifting bar smoke.
 * No ashtray / cup props — smoke only.
 */
export function JazzAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    let running = true;
    const puffs: SmokePuff[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Spawn wide horizontal smoke bands like haze in a bar spotlight. */
    const spawn = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const band = Math.random();
      // Concentrated in mid/upper air where stage light cuts through
      const y = h * (0.2 + band * 0.55);
      puffs.push({
        x: -80 + Math.random() * (w + 160),
        y,
        r: 40 + Math.random() * 90,
        vx: 0.04 + Math.random() * 0.12,
        vy: -0.02 - Math.random() * 0.06,
        life: 0,
        maxLife: 7000 + Math.random() * 6000,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.004 + Math.random() * 0.008,
      });
    };

    const paintStatic = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 8; i += 1) {
        const x = w * (0.1 + i * 0.12);
        const y = h * (0.25 + (i % 3) * 0.15);
        const g = ctx.createRadialGradient(x, y, 10, x, y, w * 0.22);
        g.addColorStop(0, "rgba(220, 205, 180, 0.18)");
        g.addColorStop(0.5, "rgba(160, 145, 120, 0.08)");
        g.addColorStop(1, "rgba(160, 145, 120, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    };

    let lastSpawn = 0;
    let last = performance.now();

    const tick = (now: number): void => {
      if (!running) return;
      const dt = Math.min(32, now - last);
      last = now;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (now - lastSpawn > 140 && puffs.length < 70) {
        spawn();
        lastSpawn = now;
      }

      for (let i = puffs.length - 1; i >= 0; i -= 1) {
        const p = puffs[i]!;
        p.life += dt;
        p.wobble += p.wobbleSpeed * dt;
        p.x += p.vx * dt + Math.sin(p.wobble) * 0.05 * dt;
        p.y += p.vy * dt + Math.cos(p.wobble * 0.7) * 0.03 * dt;
        p.r += 0.02 * dt;

        const t = p.life / p.maxLife;
        if (t >= 1 || p.x > w + 120) {
          puffs.splice(i, 1);
          continue;
        }

        const alpha =
          t < 0.15 ? t / 0.15 : t > 0.55 ? 1 - (t - 0.55) / 0.45 : 1;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0, `rgba(230, 215, 190, ${0.22 * alpha})`);
        gradient.addColorStop(0.35, `rgba(170, 155, 130, ${0.14 * alpha})`);
        gradient.addColorStop(1, `rgba(60, 45, 30, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Wide horizontal ellipses — bar smoke drifting through light
        ctx.ellipse(
          p.x,
          p.y,
          p.r * 1.6,
          p.r * 0.55,
          Math.sin(p.wobble) * 0.25,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      frameId = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reducedMotion) {
      paintStatic();
      return () => {
        running = false;
        window.removeEventListener("resize", resize);
      };
    }

    for (let i = 0; i < 24; i += 1) {
      spawn();
      const p = puffs[puffs.length - 1];
      if (p) {
        p.life = Math.random() * p.maxLife * 0.6;
        p.x = Math.random() * window.innerWidth;
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return (
    <div
      className={styles.root}
      data-testid="jazz-atmosphere"
      aria-hidden="true"
    >
      <div className={styles.scene} role="presentation" />
      <div className={styles.sceneShade} />
      <div className={styles.beam} />
      <canvas ref={canvasRef} className={styles.smoke} />
      <div className={styles.vignette} />
      <div className={styles.grain} />
    </div>
  );
}
