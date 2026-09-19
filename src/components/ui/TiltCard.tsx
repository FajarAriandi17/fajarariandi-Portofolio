"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Cursor-tracked 3D tilt.
 *
 * Deliberately inert on touch devices and under `prefers-reduced-motion`: the
 * tilt is a pointer affordance, and on a device with no pointer it would only
 * cost a frame budget. Bails out early rather than animating to zero.
 */
export function TiltCard({
  children,
  className,
  intensity = 10,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Peak rotation in degrees. */
  intensity?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const rotateX = useSpring(0, { stiffness: 240, damping: 24, mass: 0.6 });
  const rotateY = useSpring(0, { stiffness: 240, damping: 24, mass: 0.6 });

  // Glare position, as a percentage across the card.
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.14), transparent 55%)`;

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      // -0.5..0.5 → centred rotation
      rotateY.set((px - 0.5) * intensity * 2);
      rotateX.set((0.5 - py) * intensity * 2);
      glareX.set(px * 100);
      glareY.set(py * 100);
    },
    [glareX, glareY, intensity, rotateX, rotateY],
  );

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  }, [glareX, glareY, rotateX, rotateY]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={cn("relative [transform-style:preserve-3d]", className)}
    >
      {children}
      {glare ? (
        <motion.div
          aria-hidden
          style={{ background: glareBackground }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      ) : null}
    </motion.div>
  );
}

/**
 * Card with a soft radial highlight that follows the cursor. Pure CSS variables
 * rather than a motion value, so the browser handles the paint and there is no
 * React re-render per pointer move.
 */
export function SpotlightCard({
  children,
  className,
  radius = 340,
  color = "rgba(96,165,250,0.12)",
}: {
  children: ReactNode;
  className?: string;
  /** Highlight radius in px. */
  radius?: number;
  color?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={reduceMotion ? undefined : handleMove}
      style={
        {
          "--spot-radius": `${radius}px`,
          "--spot-color": color,
        } as React.CSSProperties
      }
      className={cn(
        "group/spotlight relative overflow-hidden",
        !reduceMotion &&
          "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:[background:radial-gradient(var(--spot-radius)_circle_at_var(--spot-x,50%)_var(--spot-y,50%),var(--spot-color),transparent_70%)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
