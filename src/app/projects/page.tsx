import type { Metadata } from "next";

import { ProjectsExplorer } from "@/components/sections/ProjectsExplorer";
import { SectionHeading } from "@/components/ui/Section";
import { getProjects } from "@/lib/content";

// Cloudflare Pages serves this on the Workers runtime (edge) — required by
// @cloudflare/next-on-pages, which has no Node.js runtime to fall back to.
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Web platforms, AI tooling, networking infrastructure, CCTV, Starlink, and IoT deployments — with the problem and the reasoning behind each.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects — Muhammad Fajar Ariandi",
    description:
      "Selected work across web development, AI, networking, and IoT.",
    url: "/projects",
  },
};

export default async function ProjectsPage({
  searchParams,
}: {
  // Next 15: searchParams is a Promise and must be awaited.
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, projects] = await Promise.all([
    searchParams,
    getProjects(),
  ]);

  return (
    <div className="relative pt-36 pb-24">
      {/* Ambient wash so inner pages keep the hero's atmosphere. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(90% 60% at 50% -10%, rgba(139,92,246,0.16) 0%, transparent 65%)",
        }}
      />

      <div className="container-page relative">
        <SectionHeading
          as="h1"
          eyebrow="Portfolio"
          title={
            <>
              Work that spans <span className="text-gradient">the whole stack</span>
            </>
          }
          description="From interface design to installed infrastructure. Each project below documents the problem it solves, not just the technology it uses."
        />

        <ProjectsExplorer projects={projects} initialCategory={category ?? "All"} />
      </div>
    </div>
  );
}
