import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import styles from './JazzAtmosphere.module.css';

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
 * Full-bleed jazz-lounge backdrop with warm lamps and rising cigar smoke.
 */
export function JazzAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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

    const spawn = (side: 'left' | 'right'): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const source =
        side === 'left'
          ? { x: w * 0.1 + Math.random() * 50, y: h * 0.82 }
          : { x: w * 0.82 + Math.random() * 50, y: h * 0.8 };
      puffs.push({
        x: source.x,
        y: source.y,
        r: 14 + Math.random() * 28,
        vx: (Math.random() - 0.45) * 0.35,
        vy: -0.35 - Math.random() * 0.55,
        life: 0,
        maxLife: 5000 + Math.random() * 4500,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.014,
      });
    };

    const paintStatic = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      for (const [x, y] of [
        [w * 0.12, h * 0.7],
        [w * 0.88, h * 0.68],
      ] as const) {
        const haze = ctx.createRadialGradient(x, y, 8, x, y - h * 0.15, w * 0.28);
        haze.addColorStop(0, 'rgba(210, 195, 170, 0.22)');
        haze.addColorStop(0.5, 'rgba(150, 135, 115, 0.1)');
        haze.addColorStop(1, 'rgba(150, 135, 115, 0)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, w, h);
      }
    };

    let lastSpawn = 0;
    let last = performance.now();
    let sideToggle = false;

    const tick = (now: number): void => {
      if (!running) return;
      const dt = Math.min(32, now - last);
      last = now;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (now - lastSpawn > 180 && puffs.length < 64) {
        spawn(sideToggle ? 'left' : 'right');
        sideToggle = !sideToggle;
        lastSpawn = now;
      }

      for (let i = puffs.length - 1; i >= 0; i -= 1) {
        const p = puffs[i]!;
        p.life += dt;
        p.wobble += p.wobbleSpeed * dt;
        p.x += p.vx * dt + Math.sin(p.wobble) * 0.12 * dt;
        p.y += p.vy * dt;
        p.r += 0.018 * dt;
        p.vy *= 0.9992;

        const t = p.life / p.maxLife;
        if (t >= 1 || p.y < -100) {
          puffs.splice(i, 1);
          continue;
        }

        const alpha = t < 0.12 ? t / 0.12 : t > 0.5 ? 1 - (t - 0.5) / 0.5 : 1;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gradient.addColorStop(0, `rgba(225, 210, 185, ${0.28 * alpha})`);
        gradient.addColorStop(0.4, `rgba(160, 145, 125, ${0.16 * alpha})`);
        gradient.addColorStop(1, `rgba(70, 55, 40, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * 1.15, p.r * 0.85, p.wobble * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      frameId = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion) {
      paintStatic();
      return () => {
        running = false;
        window.removeEventListener('resize', resize);
      };
    }

    for (let i = 0; i < 16; i += 1) {
      spawn(i % 2 === 0 ? 'left' : 'right');
      const p = puffs[puffs.length - 1];
      if (p) {
        p.life = Math.random() * p.maxLife * 0.55;
        p.y -= Math.random() * 180;
        p.r += Math.random() * 20;
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <div className={styles.root} data-testid="jazz-atmosphere" aria-hidden="true">
      <div className={styles.wood} />
      <div className={styles.curtain} />
      <div className={styles.lampLeft} />
      <div className={styles.lampRight} />
      <div className={styles.stageGlow} />
      <div className={styles.floor} />
      <canvas ref={canvasRef} className={styles.smoke} />
      <div className={styles.ashtray} data-side="left">
        <span className={styles.cigar} />
        <span className={styles.ember} />
      </div>
      <div className={styles.ashtray} data-side="right">
        <span className={styles.cigar} />
        <span className={styles.ember} />
      </div>
      <div className={styles.vignette} />
      <div className={styles.grain} />
    </div>
  );
}
