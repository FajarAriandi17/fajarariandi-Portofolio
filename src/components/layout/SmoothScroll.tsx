"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";

/**
 * Lenis smooth scrolling.
 *
 * Mounted once at the root. Skipped entirely under `prefers-reduced-motion` —
 * hijacking scroll is exactly the kind of motion that setting exists to stop,
 * and `globals.css` already forces smooth-scroll off in that case.
 *
 * The instance is destroyed on unmount so React strict mode's double-invoke in
 * development doesn't stack two rAF loops.
 */
export function SmoothScroll() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Exponential ease-out — matches the site's --ease-out-expo token.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices already have momentum scrolling; overriding it feels
      // laggy rather than premium.
      syncTouch: false,
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduceMotion]);

  return null;
}
