import React, { useEffect, useRef } from 'react';

interface AntiGravityDotsProps {
  dotSize?: number;
  gap?: number;
  repulsionRadius?: number;
  repulsionStrength?: number;
}

export const AntiGravityDots: React.FC<AntiGravityDotsProps> = ({
  dotSize = 2.0,
  gap = 32,
  repulsionRadius = 220,
  repulsionStrength = 100
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    interface Particle {
      ox: number;
      oy: number;
      x: number;
      y: number;
      size: number;
      baseSize: number;
      opacity: number;
      phase: number; // per-particle phase offset for organic drift
    }

    let particles: Particle[] = [];

    const initParticles = (w: number, h: number) => {
      particles = [];
      const cols = Math.ceil(w / gap) + 2;
      const rows = Math.ceil(h / gap) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // Stagger alternate rows by half a gap for a hexagonal feel
          const stagger = j % 2 === 0 ? 0 : gap * 0.5;
          const x = i * gap + stagger;
          const y = j * gap;

          // Vary dot sizes for a sense of depth
          const sizeVariance = 0.5 + Math.random() * 1.0; // 0.5× to 1.5×
          const base = dotSize * sizeVariance;

          particles.push({
            ox: x,
            oy: y,
            x,
            y,
            size: base,
            baseSize: base,
            opacity: 0.25 + Math.random() * 0.25,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles(width, height);
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const time = { value: 0 };

    const animate = () => {
      // Slow tick — 0.003 instead of 0.01 for much slower idle drift
      time.value += 0.003;
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        // Organic idle drift using per-particle phase offsets
        const driftAmp = 2.5;
        const idleX = p.ox + Math.sin(time.value + p.phase) * driftAmp;
        const idleY = p.oy + Math.cos(time.value * 0.8 + p.phase * 1.3) * driftAmp;

        // Distance to mouse
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = idleX;
        let targetY = idleY;
        let targetOpacity = p.opacity;
        let targetSize = p.baseSize;

        if (dist < repulsionRadius) {
          // Smooth quadratic falloff for force
          const t = 1 - dist / repulsionRadius;
          const force = t * t;

          const pushAngle = Math.atan2(dy, dx);
          const pushDist = force * repulsionStrength;

          targetX = idleX + Math.cos(pushAngle) * pushDist;
          targetY = idleY + Math.sin(pushAngle) * pushDist;

          // Brighten and grow dots closest to cursor
          targetOpacity = 0.3 + force * 0.65;
          targetSize = p.baseSize * (1 + force * 0.8);
        }

        // Very smooth lerp — slow physical settle
        const lerpSpeed = 0.045;
        p.x += (targetX - p.x) * lerpSpeed;
        p.y += (targetY - p.y) * lerpSpeed;
        p.opacity += (targetOpacity - p.opacity) * lerpSpeed;
        p.size += (targetSize - p.size) * lerpSpeed;

        // Draw with glow — a warm white core with soft halo
        const glow = p.opacity * 0.5;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // Radial gradient for a glowing sphere look
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        grad.addColorStop(0, `rgba(230, 235, 255, ${p.opacity})`);
        grad.addColorStop(0.5, `rgba(200, 215, 255, ${p.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(180, 200, 255, 0)`);

        ctx.fillStyle = grad;
        ctx.shadowColor = `rgba(200, 215, 255, ${glow})`;
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dotSize, gap, repulsionRadius, repulsionStrength]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 block w-full h-full"
    />
  );
};
