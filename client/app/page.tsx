'use client'

import CustomStickyBanner from "@/components/custom/CustomStickyBanner";
import { HeroPage } from "@/components/custom/HeroPage";
import { SpiralIntro } from "@/components/custom/SpiralIntro";
import { useState, useEffect } from 'react';

// Lenis will be dynamically imported on the client to enable smooth scrolling

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);

  // Check if user has already visited (using localStorage)
  useEffect(() => {
    const visited = localStorage.getItem('adhyayan-visited');
    if (visited === 'true') {
      setShowIntro(false);
      setHasVisited(true);
    }
  }, []);

  const handleEnter = () => {
    // Mark as visited in localStorage
    localStorage.setItem('adhyayan-visited', 'true');
    setShowIntro(false);
    setHasVisited(true);
  };

  // Show spiral intro on first visit
  if (showIntro && !hasVisited) {
    return <SpiralIntro onEnter={handleEnter} />;
  }

  // Show main app content
  return (
    <div className="relative flex w-full flex-col overflow-y-auto home-page-container">
      <CustomStickyBanner />
      {/* Main content */}
      <HeroPage />
    </div>
  );
}

// Initialize Lenis for smooth scrolling on the home page. We use a dynamic
// import inside a useEffect so this runs only on the client and doesn't break
// server-side rendering.
export function useLenis() {
  useEffect(() => {
    let rafId: number | null = null;
    let lenisInstance: any = null;

    (async () => {
      try {
        const LenisModule = await import('lenis');
        const Lenis = LenisModule?.default ?? LenisModule;

        lenisInstance = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smooth: true,
        });

        function raf(time: number) {
          if (lenisInstance) lenisInstance.raf(time);
          rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);
      } catch (err) {
        // If lenis isn't installed or fails to initialize, silently fail and
        // keep the native scroll behavior.
        console.warn('Lenis failed to initialize:', err);
      }
    })();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      try {
        if (lenisInstance && typeof lenisInstance.destroy === 'function') {
          lenisInstance.destroy();
        }
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, []);
}
