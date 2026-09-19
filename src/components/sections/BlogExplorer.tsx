"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

import { PostCard } from "@/components/cards/PostCard";
import { StaggerGroup } from "@/components/ui/Reveal";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Post, PostCategory } from "@/types/content";

/**
 * Blog list with search and category filtering.
 *
 * Search runs over title, excerpt, and tags — matching against the body too
 * would surface results the user can't see a reason for in the card. Filtering
 * is in-memory for the same reason as the projects grid: the set is small and
 * instant feedback beats a round trip.
 */
export function BlogExplorer({
  posts,
  initialCategory = "All",
}: {
  posts: Post[];
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const reduceMotion = useReducedMotion();

  const categories = useMemo(() => {
    const present = new Set(posts.map((post) => post.category));
    const order: PostCategory[] = [
      "AI",
      "Web Development",
      "Networking",
      "IoT",
      "Career Journey",
      "Technology",
    ];
    return ["All", ...order.filter((candidate) => present.has(candidate))];
  }, [posts]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (category !== "All" && post.category !== category) return false;
      if (!needle) return true;

      return (
        post.title.toLowerCase().includes(needle) ||
        post.excerpt.toLowerCase().includes(needle) ||
        post.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [posts, query, category]);

  return (
    <>
      <div className="mt-10 flex flex-col gap-5">
        <div className="relative">
          <label htmlFor="blog-search" className="sr-only">
            Search articles
          </label>
          <SearchIcon />
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles by title, topic, or tag…"
            className="w-full rounded-xl border border-line bg-white/[0.02] py-3.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink-faint/70 outline-none transition-colors focus:border-accent-cyan/60 focus:bg-white/[0.04]"
          />
        </div>

        <div role="tablist" aria-label="Article categories" className="flex flex-wrap gap-2">
          {categories.map((tab) => {
            const isActive = category === tab;
            const count =
              tab === "All"
                ? posts.length
                : posts.filter((post) => post.category === tab).length;

            return (
              <button
                key={tab}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setCategory(tab)}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm transition-colors duration-200",
                  isActive ? "text-ink" : "text-ink-muted hover:text-ink-soft",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="blog-tab"
                    className="absolute inset-0 rounded-full border border-accent-cyan/30 bg-accent-cyan/10"
                    transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                  />
                ) : (
                  <span className="absolute inset-0 rounded-full border border-line" />
                )}
                <span className="relative">
                  {tab}
                  <span className="ml-1.5 font-mono text-[0.7rem] text-ink-faint">
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {visible.length} {visible.length === 1 ? "article" : "articles"} found.
      </p>

      {visible.length === 0 ? (
        <div className="surface mt-10 p-12 text-center">
          <p className="text-ink-muted">
            Nothing matched {query ? `“${query}”` : "that filter"}.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-4 text-sm text-accent-cyan underline decoration-accent-cyan/30 underline-offset-4 hover:decoration-accent-cyan"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <StaggerGroup stagger={0.07} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((post) => (
              <motion.div
                key={post.slug}
                layout
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              >
                <PostCard post={post} headingLevel="h2" />
              </motion.div>
            ))}
          </AnimatePresence>
        </StaggerGroup>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.5 13.5 3 3" />
    </svg>
  );
}
