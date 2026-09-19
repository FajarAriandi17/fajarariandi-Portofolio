"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Route transition shell, mounted from `app/template.tsx`.
 *
 * `template.tsx` (unlike `layout.tsx`) re-mounts on every navigation, which is
 * what makes an enter animation possible without tracking pathname changes by
 * hand. Exit animations are intentionally omitted: Next's App Router unmounts
 * the old tree immediately, and faking an exit would delay every navigation.
 *
 * The overlay sweep is skipped under `prefers-reduced-motion` — the new page
 * simply appears.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Sweep overlay — a single gradient plane that wipes up and off. */}
      <motion.div
        key={`sweep-${pathname}`}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] origin-bottom bg-gradient-to-b from-deep via-base to-base"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
        style={{ willChange: "transform" }}
      />

      <motion.div
        key={`content-${pathname}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.08 }}
      >
        {children}
      </motion.div>
    </>
  );
}
