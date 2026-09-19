"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

/**
 * Gentle parallax drift for decorative elements.
 *
 * The element translates on Y as it crosses the viewport. Kept deliberately
 * small in amplitude — this reads as depth, not wobbling — and the movement is
 * a compositor-only `transform`, so it costs nothing on the main thread.
 *
 * Apply only to decoration (`aria-hidden` glows, rules, background plates).
 * Content that must be read or clicked should not drift.
 */
export function Parallax({
  children,
  distance = 24,
  className,
}: {
  /** Optional — the wrapper itself is often the decoration (a glow, a rule). */
  children?: ReactNode;
  /** Pixels of travel across the element's pass through the viewport. */
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // The element is tracked from the moment it enters at the bottom until it
  // leaves at the top, so the drift is spread across its whole time on screen.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <motion.div
      ref={ref}
      // Parallax targets decoration only — never something to be read.
      aria-hidden
      className={className}
      style={reduceMotion ? undefined : { y }}
    >
      {children}
    </motion.div>
  );
}
