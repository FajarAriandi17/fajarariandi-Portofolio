"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Wraps a control so it drifts toward the cursor when the pointer is nearby,
 * then springs back on leave. The pull is capped by `strength` so the control
 * never escapes its own hit area.
 */
export function Magnetic({
  children,
  className,
  strength = 0.35,
  radius = 120,
}: {
  children: ReactNode;
  className?: string;
  /** 0–1. Fraction of the cursor offset the element follows. */
  strength?: number;
  /** Distance in px beyond the element's box where the pull begins. */
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const x = useSpring(0, { stiffness: 260, damping: 22, mass: 0.5 });
  const y = useSpring(0, { stiffness: 260, damping: 22, mass: 0.5 });

  // Tracked on the document so the pull starts before the cursor arrives.
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;

      const dx = event.clientX - centreX;
      const dy = event.clientY - centreY;
      const distance = Math.hypot(dx, dy);
      const threshold = Math.max(rect.width, rect.height) / 2 + radius;

      if (distance > threshold) {
        x.set(0);
        y.set(0);
        return;
      }

      // Ease the pull off as the cursor approaches the threshold edge.
      const falloff = 1 - distance / threshold;
      x.set(dx * strength * falloff);
      y.set(dy * strength * falloff);
    },
    [radius, strength, x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      className={cn("inline-block", className)}
    >
      <motion.div style={{ x, y }}>{children}</motion.div>
    </div>
  );
}

/**
 * Card with a 1px gradient border that lights up on hover. Built with two
 * stacked layers rather than `border-image`, so the radius stays crisp.
 */
export function GlowCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group relative rounded-2xl", className)}>
      <div
        aria-hidden
        className="absolute -inset-px rounded-2xl bg-gradient-to-r from-accent-blue/0 via-accent-cyan/0 to-accent-violet/0 opacity-0 blur-[2px] transition-all duration-500 group-hover:from-accent-blue/40 group-hover:via-accent-cyan/40 group-hover:to-accent-violet/40 group-hover:opacity-100"
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
