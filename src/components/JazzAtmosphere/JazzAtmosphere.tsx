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
 * Full-bleed jazz-lounge backdrop: warm lamp light, mahogany grain hint,
 * and soft rising cigar smoke (Canvas). Decorative only — aria-hidden.
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

    const spawn = (fromAshtray: boolean): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Two ashtray-ish sources: lower-left lounge corner & near piano stage
      const source = fromAshtray
        ? { x: w * 0.12 + Math.random() * 40, y: h * 0.78 }
        : { x: w * 0.82 + Math.random() * 36, y: h * 0.72 };
      puffs.push({
        x: source.x,
        y: source.y,
        r: 8 + Math.random() * 18,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.25 - Math.random() * 0.45,
        life: 0,
        maxLife: 4200 + Math.random() * 3800,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.008 + Math.random() * 0.012,
      });
    };

    const paintStatic = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      // Soft static haze for reduced motion
      const haze = ctx.createRadialGradient(
        w * 0.2,
        h * 0.75,
        10,
        w * 0.2,
        h * 0.55,
        w * 0.35,
      );
      haze.addColorStop(0, "rgba(180, 170, 150, 0.08)");
      haze.addColorStop(1, "rgba(180, 170, 150, 0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, w, h);
      const haze2 = ctx.createRadialGradient(
        w * 0.85,
        h * 0.7,
        10,
        w * 0.85,
        h * 0.45,
        w * 0.3,
      );
      haze2.addColorStop(0, "rgba(160, 150, 130, 0.07)");
      haze2.addColorStop(1, "rgba(160, 150, 130, 0)");
      ctx.fillStyle = haze2;
      ctx.fillRect(0, 0, w, h);
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

      if (now - lastSpawn > 280 && puffs.length < 48) {
        spawn(Math.random() > 0.45);
        lastSpawn = now;
      }

      for (let i = puffs.length - 1; i >= 0; i -= 1) {
        const p = puffs[i]!;
        p.life += dt;
        p.wobble += p.wobbleSpeed * dt;
        p.x += p.vx * dt + Math.sin(p.wobble) * 0.08 * dt;
        p.y += p.vy * dt;
        p.r += 0.012 * dt;
        p.vy *= 0.999;

        const t = p.life / p.maxLife;
        if (t >= 1 || p.y < -80) {
          puffs.splice(i, 1);
          continue;
        }

        // Fade in, linger, fade out — warm grey cigar smoke
        const alpha =
          t < 0.15 ? t / 0.15 : t > 0.55 ? 1 - (t - 0.55) / 0.45 : 1;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0, `rgba(210, 200, 180, ${0.14 * alpha})`);
        gradient.addColorStop(0.45, `rgba(140, 130, 115, ${0.08 * alpha})`);
        gradient.addColorStop(1, `rgba(80, 70, 55, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
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

    // Seed a few puffs
    for (let i = 0; i < 10; i += 1) {
      spawn(i % 2 === 0);
      const p = puffs[puffs.length - 1];
      if (p) {
        p.life = Math.random() * p.maxLife * 0.5;
        p.y -= Math.random() * 120;
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
    <div className={styles.root} aria-hidden="true">
      <div className={styles.wood} />
      <div className={styles.lampLeft} />
      <div className={styles.lampRight} />
      <div className={styles.stageGlow} />
      <div className={styles.vignette} />
      <canvas ref={canvasRef} className={styles.smoke} />
      <div className={styles.ashtray} data-side="left" />
      <div className={styles.ashtray} data-side="right" />
      <div className={styles.grain} />
    </div>
  );
}
