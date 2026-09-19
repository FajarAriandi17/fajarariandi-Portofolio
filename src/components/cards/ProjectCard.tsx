"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { Badge } from "@/components/ui/Typography";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { SpotlightCard, TiltCard } from "@/components/ui/TiltCard";
import { fadeUp } from "@/lib/motion";
import type { Project } from "@/types/content";

const STATUS_TONE = {
  completed: "success",
  "in-progress": "accent",
  maintained: "neutral",
  archived: "warning",
} as const;

const STATUS_LABEL = {
  completed: "Completed",
  "in-progress": "In progress",
  maintained: "Maintained",
  archived: "Archived",
} as const;

/**
 * Project card.
 *
 * Composition note: the tilt and the spotlight are separate elements on
 * purpose. Tilt rotates the whole card; the spotlight is a flat overlay that
 * must NOT rotate with it, or the highlight smears as the card moves.
 */
export function ProjectCard({
  project,
  index = 0,
  featured = false,
  headingLevel = "h3",
}: {
  project: Project;
  index?: number;
  /** Featured cards span two columns on large screens. */
  featured?: boolean;
  /** h2 on /projects where the card sits directly under the page's h1; h3 on
   * Home, where it nests under the section's h2. Keeps the outline gap-free. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <motion.article variants={fadeUp} className={featured ? "lg:col-span-2" : undefined}>
      <TiltCard intensity={5} className="h-full">
        <SpotlightCard className="h-full rounded-2xl">
          <Link
            href={`/projects/${project.slug}`}
            // The link wraps the whole card, so without a label its accessible
            // name is every piece of text inside it — alt text, badges, summary,
            // tech stack and all. The title alone is what a screen reader needs,
            // and it keeps the name stable for tooling that locates links by name.
            aria-label={project.title}
            className="surface group flex h-full flex-col overflow-hidden transition-all duration-500 hover:border-line-strong"
          >
            <div className="relative">
              <MediaFrame
                image={project.thumbnail}
                seed={project.slug}
                className={featured ? "aspect-[16/9]" : "aspect-[4/3]"}
                sizes={
                  featured
                    ? "(max-width: 1024px) 100vw, 66vw"
                    : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                }
                monogram={initials(project.title)}
              />

              {/* Status sits on the image; category sits below it. */}
              <div className="absolute left-4 top-4">
                <Badge tone={STATUS_TONE[project.status]}>
                  {STATUS_LABEL[project.status]}
                </Badge>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-accent-cyan">
                  {project.category}
                </span>
                <span aria-hidden className="size-1 rounded-full bg-ink-faint/50" />
                <span className="font-mono text-xs text-ink-faint">{project.year}</span>
              </div>

              <Heading className="mt-3 text-xl font-semibold tracking-tight text-ink transition-colors group-hover:text-accent-cyan">
                {project.title}
              </Heading>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                {project.summary}
              </p>

              <ul className="mt-5 flex flex-wrap gap-1.5">
                {project.techStack.slice(0, featured ? 6 : 4).map((tech) => (
                  <li
                    key={tech}
                    className="rounded-md border border-line bg-white/[0.03] px-2 py-0.5 font-mono text-[0.7rem] text-ink-faint"
                  >
                    {tech}
                  </li>
                ))}
                {project.techStack.length > (featured ? 6 : 4) ? (
                  <li className="px-1 py-0.5 font-mono text-[0.7rem] text-ink-faint">
                    +{project.techStack.length - (featured ? 6 : 4)}
                  </li>
                ) : null}
              </ul>

              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors group-hover:text-accent-cyan">
                View case study
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
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
          </Link>
        </SpotlightCard>
      </TiltCard>
    </motion.article>
  );
}

/** Two-letter monogram for the placeholder artwork. */
function initials(title: string) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
