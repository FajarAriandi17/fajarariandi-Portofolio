import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The gradient triplet applied to text. Falls back to solid white if the
 * background-clip technique is unsupported, so the text is never invisible.
 */
export function GradientText({
  children,
  className,
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "div";
}) {
  return <Tag className={cn("text-gradient", className)}>{children}</Tag>;
}

/** Small uppercase mono label — used above section headings. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted",
        className,
      )}
    >
      <span aria-hidden className="size-1 rounded-full bg-accent-cyan" />
      {children}
    </span>
  );
}

/** Pill label for categories, tags, and status. */
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning";
  className?: string;
}) {
  const tones = {
    neutral: "border-line bg-white/[0.04] text-ink-muted",
    accent: "border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan",
    success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    warning: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
