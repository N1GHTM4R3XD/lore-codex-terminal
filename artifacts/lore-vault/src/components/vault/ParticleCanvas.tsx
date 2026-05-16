import { useEffect, useRef } from "react";

interface Props {
  effect: string;
  /** Extra blend layer on top of global — use higher opacity */
  characterLayer?: boolean;
}

export const ParticleCanvas = ({ effect, characterLayer }: Props) => {
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

    type P = {
      x: number; y: number; vx: number; vy: number;
      r: number; a: number; life?: number; hue?: number;
      rot?: number; vrot?: number;
    };
    let particles: P[] = [];

    const count: Record<string, number> = {
      stars: 180, rain: 220, fire: 120, embers: 90, void: 90,
      leaves: 60, fog: 18, bubbles: 55, snow: 150,
    };

    const spawn = (): P => {
      const dpr = devicePixelRatio;
      switch (effect) {
        case "rain":
          return { x: Math.random() * w, y: Math.random() * h, vx: -0.6, vy: 8 + Math.random() * 6, r: 1, a: 0.4 + Math.random() * 0.4 };
        case "stars":
          return { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: Math.random() * 1.4 + 0.3, a: Math.random() };
        case "fire":
          return { x: Math.random() * w, y: h + Math.random() * 40, vx: (Math.random() - 0.5) * 0.6, vy: -1 - Math.random() * 2, r: Math.random() * 2.5 + 1, a: 0.6, life: 1, hue: 15 + Math.random() * 35 };
        case "void":
          return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 2 + 0.5, a: Math.random() * 0.6 };
        case "embers":
          return { x: Math.random() * w, y: h + Math.random() * 60, vx: (Math.random() - 0.5) * 0.4, vy: -0.6 - Math.random() * 1.4, r: Math.random() * 2 + 0.6, a: 0.7, life: 1, hue: 25 + Math.random() * 20 };
        case "leaves":
          return {
            x: Math.random() * w, y: -20 - Math.random() * h,
            vx: (Math.random() - 0.3) * 1.5, vy: 0.6 + Math.random() * 1.2,
            r: (4 + Math.random() * 5) * dpr, a: 0.55 + Math.random() * 0.4,
            hue: 20 + Math.random() * 70,
            rot: Math.random() * Math.PI * 2, vrot: (Math.random() - 0.5) * 0.04,
          };
        case "fog":
          return {
            x: -120 * dpr + Math.random() * w * 1.2, y: Math.random() * h,
            vx: 0.12 + Math.random() * 0.22, vy: (Math.random() - 0.5) * 0.06,
            r: (70 + Math.random() * 110) * dpr, a: 0.025 + Math.random() * 0.045,
          };
        case "bubbles":
          return {
            x: Math.random() * w, y: h + Math.random() * 60,
            vx: (Math.random() - 0.5) * 0.5, vy: -(0.4 + Math.random() * 1.2),
            r: (3 + Math.random() * 7) * dpr, a: 0.15 + Math.random() * 0.35,
          };
        case "snow":
          return {
            x: Math.random() * w, y: -10 - Math.random() * h * 0.2,
            vx: (Math.random() - 0.5) * 0.8, vy: 0.4 + Math.random() * 1.1,
            r: (1 + Math.random() * 2.5) * dpr, a: 0.5 + Math.random() * 0.5,
          };
        default:
          return { x: 0, y: 0, vx: 0, vy: 0, r: 1, a: 1 };
      }
    };

    const n = count[effect] ?? 90;
    particles = Array.from({ length: n }, () => spawn());

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      const dpr = devicePixelRatio;

      for (const p of particles) {
        p.x += p.vx * dpr;
        p.y += p.vy * dpr;

        if (effect === "rain") {
          ctx.strokeStyle = `hsla(200, 80%, 75%, ${p.a})`;
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 4, p.y - 16); ctx.stroke();
          if (p.y > h) { p.y = -20; p.x = Math.random() * w; }

        } else if (effect === "stars") {
          const tw = 0.5 + 0.5 * Math.sin(t * 2 + p.x);
          ctx.fillStyle = `hsla(45, 80%, 80%, ${p.a * tw})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2); ctx.fill();

        } else if (effect === "fire") {
          p.life! -= 0.012;
          ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${p.life! * 0.7})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * dpr * p.life!, 0, Math.PI * 2); ctx.fill();
          if (p.life! <= 0 || p.y < -20) Object.assign(p, spawn());

        } else if (effect === "void") {
          ctx.fillStyle = `hsla(270, 80%, 70%, ${p.a})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2); ctx.fill();
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;

        } else if (effect === "embers") {
          p.life! -= 0.006;
          ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${p.life! * 0.8})`;
          ctx.fillRect(
            Math.round(p.x / dpr) * dpr, Math.round(p.y / dpr) * dpr,
            p.r * dpr, p.r * dpr,
          );
          if (p.life! <= 0 || p.y < -40) Object.assign(p, spawn());

        } else if (effect === "leaves") {
          p.rot! += p.vrot!;
          p.vx += Math.sin(t * 0.7 + p.y * 0.003) * 0.012;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot!);
          const sat = 55 + Math.sin(t + p.hue!) * 15;
          const lit = 38 + Math.sin(t * 0.5 + p.x) * 10;
          ctx.fillStyle = `hsla(${p.hue}, ${sat}%, ${lit}%, ${p.a})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          if (p.y > h + 20) Object.assign(p, spawn());

        } else if (effect === "fog") {
          ctx.fillStyle = `hsla(210, 20%, 85%, ${p.a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          if (p.x > w + p.r) Object.assign(p, { ...spawn(), x: -p.r });

        } else if (effect === "bubbles") {
          const pulse = 0.8 + 0.2 * Math.sin(t * 2 + p.x);
          ctx.strokeStyle = `hsla(195, 70%, 75%, ${p.a * pulse})`;
          ctx.lineWidth = 1.2 * dpr;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = `hsla(200, 80%, 90%, ${p.a * 0.08 * pulse})`;
          ctx.fill();
          p.vx += Math.sin(t + p.r) * 0.008;
          if (p.y < -p.r) Object.assign(p, spawn());

        } else if (effect === "snow") {
          p.vx += Math.sin(t * 0.5 + p.y * 0.004) * 0.008;
          const alpha = p.a * (0.7 + 0.3 * Math.sin(t * 1.5 + p.x));
          ctx.fillStyle = `hsla(200, 60%, 95%, ${alpha})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          if (p.y > h + 10) Object.assign(p, spawn());
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
      className={
        characterLayer
          ? "pointer-events-none fixed inset-0 z-0 opacity-60 mix-blend-screen"
          : "pointer-events-none fixed inset-0 z-0 opacity-70 mix-blend-screen"
      }
    />
  );
};
