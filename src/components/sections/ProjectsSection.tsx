"use client";

import { ProjectCard } from "@/components/cards/ProjectCard";
import { StaggerGroup } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import type { Project } from "@/types/content";

/**
 * Featured projects grid.
 *
 * The first project spans two columns so the grid has a focal point rather
 * than reading as a uniform matrix — the layout signals which piece of work
 * to look at first.
 */
export function ProjectsSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <Section id="projects">
      <SectionHeading
        eyebrow="Selected work"
        title={
          <>
            Things I&apos;ve <span className="text-gradient">built and shipped</span>
          </>
        }
        description="Web platforms, AI tooling, network infrastructure, and IoT deployments — with the problem and the reasoning behind each."
        action={
          <ButtonLink href="/projects" variant="outline" size="md">
            All projects
          </ButtonLink>
        }
      />

      <StaggerGroup
        stagger={0.1}
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={index}
            // Only the very first card is oversized, and only when there are
            // enough cards that the grid still balances.
            featured={index === 0 && projects.length >= 3}
          />
        ))}
      </StaggerGroup>
    </Section>
  );
}
