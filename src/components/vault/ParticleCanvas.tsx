import { useEffect, useRef } from "react";
import { Effect } from "@/lib/vault-types";

interface Props { effect: Effect; }

export const ParticleCanvas = ({ effect }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (effect === "none") return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; life?: number; hue?: number };
    let particles: P[] = [];
    const count = effect === "stars" ? 180 : effect === "rain" ? 220 : effect === "fire" ? 120 : 90;

    const seed = () => {
      particles = Array.from({ length: count }, () => spawn());
    };
    const spawn = (): P => {
      switch (effect) {
        case "rain":
          return { x: Math.random() * w, y: Math.random() * h, vx: -0.6, vy: 8 + Math.random() * 6, r: 1, a: 0.4 + Math.random() * 0.4 };
        case "stars":
          return { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: Math.random() * 1.4 + 0.3, a: Math.random() };
        case "fire":
          return { x: Math.random() * w, y: h + Math.random() * 40, vx: (Math.random() - 0.5) * 0.6, vy: -1 - Math.random() * 2, r: Math.random() * 2.5 + 1, a: 0.6, life: 1, hue: 15 + Math.random() * 35 };
        case "void":
          return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 2 + 0.5, a: Math.random() * 0.6 };
        default:
          return { x: 0, y: 0, vx: 0, vy: 0, r: 1, a: 1 };
      }
    };
    seed();

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx * devicePixelRatio;
        p.y += p.vy * devicePixelRatio;

        if (effect === "rain") {
          ctx.strokeStyle = `hsla(200, 80%, 75%, ${p.a})`;
          ctx.lineWidth = 1 * devicePixelRatio;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 4, p.y - 16); ctx.stroke();
          if (p.y > h) { p.y = -20; p.x = Math.random() * w; }
        } else if (effect === "stars") {
          const tw = 0.5 + 0.5 * Math.sin(t * 2 + p.x);
          ctx.fillStyle = `hsla(45, 80%, 80%, ${p.a * tw})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
        } else if (effect === "fire") {
          p.life! -= 0.012;
          ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.life! * 0.7})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * devicePixelRatio * p.life!, 0, Math.PI * 2); ctx.fill();
          if (p.life! <= 0 || p.y < -20) Object.assign(p, spawn());
        } else if (effect === "void") {
          ctx.fillStyle = `hsla(270, 80%, 70%, ${p.a})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [effect]);

  if (effect === "none") return null;
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-70 mix-blend-screen"
    />
  );
};
