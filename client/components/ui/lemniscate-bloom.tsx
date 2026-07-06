"use client";

import React, { useEffect, useRef } from 'react';

interface LemniscateBloomProps {
  className?: string;
  particleCount?: number;
  trailSpan?: number;
  durationMs?: number;
  strokeWidth?: number;
  lemniscateA?: number;
  lemniscateBoost?: number;
  color?: string;
}

export const LemniscateBloom: React.FC<LemniscateBloomProps> = ({
  className = '',
  particleCount = 70,
  trailSpan = 0.4,
  durationMs = 5600,
  strokeWidth = 4.8,
  lemniscateA = 20,
  lemniscateBoost = 7,
  color = 'currentColor',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const particlesRef = useRef<SVGCircleElement[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Wait for next tick to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      if (!svgRef.current || !groupRef.current || !pathRef.current) return;

      const SVG_NS = 'http://www.w3.org/2000/svg';
      const group = groupRef.current;
      const path = pathRef.current;

      // Clear existing particles
      particlesRef.current.forEach(p => p.remove());
      particlesRef.current = [];

      // Create particles
      for (let i = 0; i < particleCount; i++) {
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('fill', color);
        group.appendChild(circle);
        particlesRef.current.push(circle);
      }

    const config = {
      particleCount,
      trailSpan,
      durationMs,
      strokeWidth,
      lemniscateA,
      lemniscateBoost,
      pulseDurationMs: 5000,
    };

    function normalizeProgress(progress: number): number {
      return ((progress % 1) + 1) % 1;
    }

    function getDetailScale(time: number): number {
      const pulseProgress = (time % config.pulseDurationMs) / config.pulseDurationMs;
      const pulseAngle = pulseProgress * Math.PI * 2;
      return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48;
    }

    function point(progress: number, detailScale: number) {
      const t = progress * Math.PI * 2;
      const scale = config.lemniscateA + detailScale * config.lemniscateBoost;
      const denom = 1 + Math.sin(t) ** 2;
      return {
        x: 50 + (scale * Math.cos(t)) / denom,
        y: 50 + (scale * Math.sin(t) * Math.cos(t)) / denom,
      };
    }

    function buildPath(detailScale: number, steps = 480): string {
      return Array.from({ length: steps + 1 }, (_, index) => {
        const pt = point(index / steps, detailScale);
        return `${index === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`;
      }).join(' ');
    }

    function getParticle(index: number, progress: number, detailScale: number) {
      const tailOffset = index / (config.particleCount - 1);
      const pt = point(
        normalizeProgress(progress - tailOffset * config.trailSpan),
        detailScale
      );
      const fade = Math.pow(1 - tailOffset, 0.56);
      return {
        x: pt.x,
        y: pt.y,
        radius: 0.9 + fade * 2.7,
        opacity: 0.04 + fade * 0.96,
      };
    }

    const startedAt = performance.now();

    function render(now: number) {
      const time = now - startedAt;
      const progress = (time % config.durationMs) / config.durationMs;
      const detailScale = getDetailScale(time);

      path.setAttribute('d', buildPath(detailScale));

      particlesRef.current.forEach((node, index) => {
        const particle = getParticle(index, progress, detailScale);
        node.setAttribute('cx', particle.x.toFixed(2));
        node.setAttribute('cy', particle.y.toFixed(2));
        node.setAttribute('r', particle.radius.toFixed(2));
        node.setAttribute('opacity', particle.opacity.toFixed(3));
      });

      animationRef.current = requestAnimationFrame(render);
    }

      animationRef.current = requestAnimationFrame(render);
    }, 0);

    return () => {
      clearTimeout(initTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      particlesRef.current.forEach(p => p.remove());
      particlesRef.current = [];
    };
  }, [particleCount, trailSpan, durationMs, strokeWidth, lemniscateA, lemniscateBoost, color]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g ref={groupRef}>
        <path
          ref={pathRef}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.1"
        />
      </g>
    </svg>
  );
};
