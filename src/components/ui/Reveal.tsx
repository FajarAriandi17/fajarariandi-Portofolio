"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

import { fadeUp, staggerContainer, transition, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Canonical scroll reveal. Everything that enters the viewport goes through
 * this, so the whole site shares one entrance rhythm.
 *
 * Under `prefers-reduced-motion` the element is rendered already-visible rather
 * than animated to visible — content must never depend on an animation running.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variants = fadeUp,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Seconds. Prefer `StaggerGroup` for sequences rather than manual delays. */
  delay?: number;
  variants?: Variants;
  as?: "div" | "section" | "li" | "article" | "header" | "footer";
}) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ ...transition.base, delay }}
    >
      {children}
    </Component>
  );
}

/**
 * Parent that staggers its `Reveal`/`motion` children. Pair with any child
 * variant — children inherit the `hidden`/`visible` state from this element,
 * so they must NOT set their own `initial`/`whileInView`.
 */
export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  as?: "div" | "ul" | "section";
}) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </Component>
  );
}

/** A child of `StaggerGroup`. Adds no timing of its own. */
export function StaggerItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={cn(className)} variants={variants}>
      {children}
    </motion.div>
  );
}
