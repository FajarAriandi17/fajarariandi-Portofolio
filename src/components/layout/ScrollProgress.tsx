"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * Reading-progress bar, pinned to the very top of the viewport.
 *
 * Driven by `useScroll().scrollYProgress` — a motion value that updates on the
 * compositor, so the bar tracks scroll without touching layout. A spring
 * smooths it so a fast flick of the wheel does not snap the bar.
 *
 * The bar is `transform: scaleX` only (never `width`), which keeps the work
 * compositor-only: animating `width` would re-run layout on every frame and is
 * a classic cause of scroll jank.
 *
 * Decoration, not information — hidden under `prefers-reduced-motion`, and
 * `aria-hidden` because page progress is already conveyed by the scrollbar.
 */
export function ScrollProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 28,
    mass: 0.4,
    restDelta: 0.001,
  });

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left will-change-transform"
      style={{
        scaleX,
        backgroundImage:
          "linear-gradient(90deg, var(--color-accent-blue), var(--color-accent-cyan) 45%, var(--color-accent-violet))",
      }}
    />
  );
}
