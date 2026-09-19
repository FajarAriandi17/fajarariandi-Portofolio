import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware class merge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministic gradient derived from a string.
 *
 * Every project and post thumbnail that has no real artwork yet gets one of
 * these, keyed off its slug — so the same card always renders the same colours
 * and the grid reads as designed rather than as a wall of grey placeholders.
 */
export function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;
  const from = `hsl(${hue} 70% 42%)`;
  const via = `hsl(${(hue + 42) % 360} 65% 32%)`;
  const to = `hsl(${(hue + 96) % 360} 60% 18%)`;

  return `linear-gradient(135deg, ${from} 0%, ${via} 48%, ${to} 100%)`;
}

/** "18 November 2025" — long form for article headers. */
export function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** "18 Nov 2025" — compact form for cards and lists. */
export function formatDateShort(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Heading anchor ids derived from titles. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** Builds a wa.me link with a prefilled message. */
export function whatsappLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Clamps a number into a range — used by the proficiency meters. */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}
