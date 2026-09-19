"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";

import { staggerContainer, wordReveal } from "@/lib/motion";

/**
 * Scroll-triggered word-by-word reveal for headings.
 *
 * Each word sits inside an `overflow-hidden` mask; the word itself rises from
 * below — the same technique the hero name uses (`hero/Hero.tsx`), so the whole
 * site shares one text-animation vocabulary. Splitting happens at the word
 * level rather than per character on purpose: a long section heading split into
 * characters becomes hundreds of compositor layers, which costs more frame
 * budget than the effect is worth.
 *
 * Children may be a plain string or JSX containing inline elements (a gradient
 * `<span>`, an `<em>`, an apostrophe entity). Those elements are treated as
 * opaque tokens and kept whole — the split never reaches inside them — so
 * markup like `Things I've <span class="text-gradient">built</span>` still
 * animates as five words with the styling intact.
 *
 * Text stays in the DOM inside the heading element; the masks are purely
 * visual, so screen readers and search engines see an ordinary heading.
 */
export function AnimatedText({
  children,
  as = "div",
  className,
  stagger = 0.06,
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "div" | "p";
  className?: string;
  /** Seconds between consecutive words. */
  stagger?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const Component = motion[as];

  return (
    <Component
      className={className}
      variants={staggerContainer(stagger)}
      initial="hidden"
      whileInView="visible"
      // Headings are long enough that a word low in the block can enter before
      // the top words have finished; requiring 0.2 visible would leave the tail
      // cut off on short viewports.
      viewport={{ once: true, amount: 0.2 }}
    >
      {splitToWords(children)}
    </Component>
  );
}

/**
 * Flattens children into word tokens, preserving inline elements as opaque
 * units. Whitespace between words is re-inserted as a plain text node between
 * the masked spans — a space between two `inline-block` elements is what keeps
 * the words apart, and whitespace inside a mask span would collapse.
 */
function splitToWords(children: ReactNode): ReactNode[] {
  const words: ReactNode[] = [];

  Children.toArray(children).forEach((child, childIndex) => {
    if (typeof child === "string") {
      // A string splits on whitespace; empty runs (double spaces) are dropped
      // rather than becoming empty mask spans.
      child
        .split(/\s+/)
        .filter((part) => part.length > 0)
        .forEach((part, partIndex) =>
          words.push(<Word key={`${childIndex}-${partIndex}`}>{part}</Word>),
        );
      return;
    }

    // An element is one unit — its text animates together.
    words.push(<Word key={`el-${childIndex}`}>{child}</Word>);
  });

  // Interleave a space between words. Rendered as a sibling text node, not
  // inside a mask, so it survives `inline-block`.
  return words.flatMap((word, index) =>
    index === 0 ? [word] : [word, " "],
  );
}

/** One masked word. The mask clips the word; the inner span moves. */
function Word({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block overflow-hidden align-bottom pb-[0.08em]">
      <motion.span variants={wordReveal} className="inline-block">
        {children}
      </motion.span>
    </span>
  );
}
