"use client";

import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Shine border — an animated gradient that travels around the element's edge.
 *
 * The trick is a radial gradient painted on a layer masked to show only the
 * border ring (mask-composite "exclude" punches out the interior), animating
 * `background-position` so the highlight orbits. It is `pointer-events-none`
 * and sits above the card's own surface, so it never intercepts a click.
 *
 * Defaults to the site's accent triplet so it reads as part of the design
 * language rather than an imported widget. As with every ambient animation
 * here, `motion-safe:` keeps it from running under `prefers-reduced-motion`,
 * and the global reduced-motion rule shortens it to nothing as a backstop.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = ["#60A5FA", "#22D3EE", "#8B5CF6"],
  className,
  style,
  ...props
}: {
  /**
   * Width of the border in pixels.
   * @default 1
   */
  borderWidth?: number;
  /**
   * Duration of one orbit, in seconds.
   * @default 14
   */
  duration?: number;
  /**
   * Colour of the travelling highlight — a single colour or a gradient stop
   * list.
   * @default the accent triplet
   */
  shineColor?: string | string[];
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          backgroundImage: `radial-gradient(transparent,transparent, ${
            Array.isArray(shineColor) ? shineColor.join(",") : shineColor
          },transparent,transparent)`,
          backgroundSize: "300% 300%",
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width)",
          ...style,
        } as CSSProperties
      }
      className={cn(
        "motion-safe:animate-shine pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position]",
        className,
      )}
      {...props}
    />
  );
}
