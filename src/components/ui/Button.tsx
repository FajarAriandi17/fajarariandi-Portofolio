import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Button styling as a standalone function so links, buttons, and the magnetic
 * wrapper all share exactly one visual definition.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  // Solid gradient — one per view, reserved for the primary action.
  primary:
    "bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-violet text-[#04101f] font-semibold shadow-[0_0_28px_-8px_rgba(34,211,238,0.55)] hover:shadow-[0_0_40px_-6px_rgba(34,211,238,0.7)]",
  secondary:
    "glass text-ink hover:bg-white/[0.08] hover:border-line-strong",
  outline:
    "border border-line-strong text-ink-soft hover:text-ink hover:border-accent-cyan/50 hover:bg-accent-cyan/[0.06]",
  ghost: "text-ink-muted hover:text-ink hover:bg-white/[0.05]",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "relative inline-flex items-center justify-center rounded-full",
    "font-medium tracking-tight whitespace-nowrap",
    "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
} & ComponentPropsWithoutRef<"button">;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<"a">, "href">;

/**
 * Anchor styled as a button. Uses `next/link` for internal routes and a plain
 * anchor with safe `rel` for anything leaving the site.
 */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external,
  ...props
}: ButtonLinkProps) {
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href);
  const classes = buttonStyles({ variant, size, className });

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
