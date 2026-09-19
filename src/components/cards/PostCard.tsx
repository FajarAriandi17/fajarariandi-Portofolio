"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { PostCover } from "@/components/cards/PostCover";
import { ShineBorder } from "@/components/ui/ShineBorder";
import { SpotlightCard } from "@/components/ui/TiltCard";
import { fadeUp } from "@/lib/motion";
import { formatDateShort } from "@/lib/utils";
import type { Post } from "@/types/content";

/**
 * Blog card. Deliberately flatter than `ProjectCard` — no tilt — so the
 * projects section stays the most kinetic part of the page and the reading
 * surfaces stay calm.
 */
export function PostCard({
  post,
  compact = false,
  headingLevel = "h3",
}: {
  post: Post;
  /** Text-only variant for "related posts" and sidebar lists. */
  compact?: boolean;
  /** h2 on /blog where the card sits directly under the page's h1; h3 on Home,
   * where it nests under the section's h2. Keeps the outline gap-free. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  if (compact) {
    return (
      <motion.article variants={fadeUp}>
        <Link
          href={`/blog/${post.slug}`}
          className="group flex flex-col gap-2 border-b border-line py-5 last:border-b-0"
        >
          <div className="flex items-center gap-3 font-mono text-xs text-ink-faint">
            <span className="text-accent-cyan">{post.category}</span>
            <span aria-hidden className="size-1 rounded-full bg-ink-faint/50" />
            <time dateTime={post.publishedAt}>{formatDateShort(post.publishedAt)}</time>
          </div>
          <h3 className="font-display text-base font-semibold leading-snug text-ink transition-colors group-hover:text-accent-cyan">
            {post.title}
          </h3>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article variants={fadeUp} className="h-full">
      <SpotlightCard className="h-full rounded-2xl">
        <Link
          href={`/blog/${post.slug}`}
          className="surface group relative flex h-full flex-col overflow-hidden transition-all duration-500 hover:border-line-strong"
        >
          {/* Travelling highlight on the card's edge. Decorative only — it
              never intercepts pointer events, and stops entirely under
              reduced-motion. */}
          <ShineBorder />
          <PostCover post={post} className="aspect-[16/9]" />

          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="uppercase tracking-wider text-accent-cyan">
                {post.category}
              </span>
              <span aria-hidden className="size-1 rounded-full bg-ink-faint/50" />
              <time dateTime={post.publishedAt} className="text-ink-faint">
                {formatDateShort(post.publishedAt)}
              </time>
            </div>

            <Heading className="mt-3 text-lg font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent-cyan">
              {post.title}
            </Heading>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
              {post.excerpt}
            </p>

            <div className="mt-5 flex items-center justify-between text-xs text-ink-faint">
              <span>{post.readingMinutes} min read</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-ink-muted transition-colors group-hover:text-accent-cyan">
                Read
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="size-3 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </SpotlightCard>
    </motion.article>
  );
}
