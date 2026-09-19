import type { Transition, Variants } from "motion/react";

/**
 * Shared motion vocabulary.
 *
 * Every reveal on the site is built from these variants so sections animate
 * with one consistent rhythm instead of each component inventing its own
 * timing. `prefers-reduced-motion` is handled globally by `MotionProvider`,
 * not per-component.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_QUINT = [0.83, 0, 0.17, 1] as const;

export const transition = {
  /** Default for scroll reveals. */
  base: { duration: 0.7, ease: EASE_OUT_EXPO } satisfies Transition,
  /** Slightly slower, for hero-scale elements. */
  slow: { duration: 1.1, ease: EASE_OUT_EXPO } satisfies Transition,
  /** For hover/press feedback. */
  snap: { duration: 0.25, ease: EASE_OUT_EXPO } satisfies Transition,
  spring: { type: "spring", stiffness: 220, damping: 26, mass: 0.9 } satisfies Transition,
};

/** Fades up into place. The default entrance for almost everything. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transition.base },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.base },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transition.base },
};

/** Slides in from the side — used for the timeline and split layouts. */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: transition.base },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: transition.base },
};

/**
 * Parent variant that staggers its children. Pair with any child variant:
 * `<motion.div variants={staggerContainer}>` holding `<motion.div variants={fadeUp}>`.
 */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Viewport config shared by every scroll-triggered reveal. */
export const viewportOnce = { once: true, amount: 0.25 } as const;

/**
 * Word-level reveal for headline text. Each word is masked by its parent and
 * rises into place — the same move the hero name uses, but scroll-triggered.
 *
 * Chosen over `letterReveal` for section headings: splitting a long heading into
 * characters means hundreds of compositor layers, which costs more frame budget
 * than the effect earns back.
 */
export const wordReveal: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

/** Character-level reveal for headline text. */
export const letterReveal: Variants = {
  hidden: { opacity: 0, y: "0.4em", rotateX: -40 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.8, ease: EASE_OUT_EXPO },
  },
};
