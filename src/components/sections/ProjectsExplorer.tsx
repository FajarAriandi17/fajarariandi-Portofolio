"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/cards/ProjectCard";
import { StaggerGroup } from "@/components/ui/Reveal";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { PROJECT_CATEGORIES, type Project } from "@/types/content";

/**
 * Project grid with category filtering and sorting.
 *
 * Filtering is in-memory rather than route-driven: the whole project set is
 * small, and keeping it client-side makes the filter feel instant and lets
 * `AnimatePresence` handle the reflow. Every card is still in the server-
 * rendered HTML on first paint, so the content stays crawlable.
 */
export function ProjectsExplorer({
  projects,
  initialCategory = "All",
}: {
  projects: Project[];
  initialCategory?: string;
}) {
  const [category, setCategory] = useState<string>(initialCategory);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const reduceMotion = useReducedMotion();

  const tabs = useMemo(() => {
    // Only offer categories that actually have work in them.
    const present = new Set(projects.map((project) => project.category));
    return [
      "All",
      ...PROJECT_CATEGORIES.filter((candidate) => present.has(candidate)),
    ];
  }, [projects]);

  const visible = useMemo(() => {
    const filtered =
      category === "All"
        ? projects
        : projects.filter((project) => project.category === category);

    return [...filtered].sort((a, b) =>
      sort === "newest" ? b.year - a.year : a.year - b.year,
    );
  }, [projects, category, sort]);

  return (
    <>
      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Project categories" className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = category === tab;
            const count =
              tab === "All"
                ? projects.length
                : projects.filter((project) => project.category === tab).length;

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
                    layoutId="project-tab"
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

        <div className="flex items-center gap-2">
          <label
            htmlFor="project-sort"
            className="font-mono text-xs uppercase tracking-wider text-ink-faint"
          >
            Sort
          </label>
          <select
            id="project-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as "newest" | "oldest")}
            className="rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-sm text-ink-soft outline-none transition-colors focus:border-accent-cyan/60"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {visible.length} {visible.length === 1 ? "project" : "projects"} shown
        {category === "All" ? "" : ` in ${category}`}.
      </p>

      {visible.length === 0 ? (
        <div className="surface mt-10 p-12 text-center">
          <p className="text-ink-muted">No projects in this category yet.</p>
        </div>
      ) : (
        <StaggerGroup
          stagger={0.07}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, index) => (
              <motion.div
                key={project.slug}
                layout
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                className={cn(
                  index === 0 && category === "All" && visible.length >= 3
                    ? "lg:col-span-2"
                    : "",
                )}
              >
                <ProjectCard
                  project={project}
                  index={index}
                  headingLevel="h2"
                  featured={index === 0 && category === "All" && visible.length >= 3}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </StaggerGroup>
      )}
    </>
  );
}
