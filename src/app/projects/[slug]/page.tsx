import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectCard } from "@/components/cards/ProjectCard";
import { ButtonLink } from "@/components/ui/Button";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { StaggerGroup } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Typography";
import { getProject, getProjectSlugs, getProjects } from "@/lib/content";

/** Prerender every project at build time. */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url: `/projects/${project.slug}`,
      ...(project.thumbnail.url ? { images: [project.thumbnail.url] } : {}),
    },
  };
}

const STATUS_LABEL = {
  completed: "Completed",
  "in-progress": "In progress",
  maintained: "Maintained",
  archived: "Archived",
} as const;

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  // Related work — same category first, then topped up from the rest.
  const all = await getProjects();
  const related = [
    ...all.filter((p) => p.slug !== project.slug && p.category === project.category),
    ...all.filter((p) => p.slug !== project.slug && p.category !== project.category),
  ].slice(0, 3);

  return (
    <article className="relative pb-24">
      {/* Hero banner — full-bleed, with the title sitting over it. */}
      <header className="relative">
        <div className="relative h-[62vh] min-h-[26rem] w-full overflow-hidden">
          <MediaFrame
            image={project.thumbnail}
            seed={project.slug}
            className="absolute inset-0 h-full w-full"
            sizes="100vw"
            priority
            overlay={false}
            monogram={project.title.slice(0, 2).toUpperCase()}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-base/70 via-base/60 to-base"
          />
        </div>

        <div className="container-page relative -mt-40">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 font-mono text-xs text-ink-faint">
              <li>
                <Link href="/projects" className="transition-colors hover:text-ink-muted">
                  Projects
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-ink-muted" aria-current="page">
                {project.title}
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{project.category}</Badge>
            <Badge>{STATUS_LABEL[project.status]}</Badge>
            <span className="font-mono text-xs text-ink-faint">{project.year}</span>
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {project.title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {project.summary}
          </p>

          {(project.liveUrl || project.githubUrl) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl ? (
                <ButtonLink href={project.liveUrl} size="lg">
                  Visit live site
                </ButtonLink>
              ) : null}
              {project.githubUrl ? (
                <ButtonLink href={project.githubUrl} size="lg" variant="secondary">
                  GitHub repository
                </ButtonLink>
              ) : null}
            </div>
          )}
        </div>
      </header>

      <div className="container-page mt-20">
        <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
          {/* Main column */}
          <div>
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">Overview</h2>
              <p className="mt-4 leading-[1.85] text-ink-muted">{project.description}</p>
            </section>

            <div className="rule-fade my-12" />

            <div className="grid gap-10 sm:grid-cols-2">
              <section>
                <h2 className="font-display text-xl font-semibold text-ink">
                  <span className="mr-2 font-mono text-sm text-rose-400">01</span>
                  The problem
                </h2>
                <p className="mt-4 leading-[1.85] text-ink-muted">{project.problem}</p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold text-ink">
                  <span className="mr-2 font-mono text-sm text-emerald-400">02</span>
                  The solution
                </h2>
                <p className="mt-4 leading-[1.85] text-ink-muted">{project.solution}</p>
              </section>
            </div>

            {project.gallery.length > 0 ? (
              <>
                <div className="rule-fade my-12" />
                <section>
                  <h2 className="font-display text-2xl font-semibold text-ink">
                    Screenshots
                  </h2>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {project.gallery.map((image, index) => (
                      <li
                        key={index}
                        className={
                          index === 0 && project.gallery.length > 2
                            ? "sm:col-span-2"
                            : undefined
                        }
                      >
                        <figure>
                          <MediaFrame
                            image={image}
                            seed={`${project.slug}-${index}`}
                            className="aspect-[16/10] rounded-xl border border-line"
                            overlay={false}
                          />
                          <figcaption className="mt-2.5 font-mono text-xs text-ink-faint">
                            {image.alt}
                          </figcaption>
                        </figure>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="surface p-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
                Technology
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-md border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-ink-soft"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface mt-4 p-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
                Details
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-faint">Category</dt>
                  <dd className="text-right text-ink-soft">{project.category}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-faint">Year</dt>
                  <dd className="text-right text-ink-soft">{project.year}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-faint">Status</dt>
                  <dd className="text-right text-ink-soft">
                    {STATUS_LABEL[project.status]}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <ButtonLink href="/contact" variant="outline" className="w-full">
                Discuss a similar project
              </ButtonLink>
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="container-page mt-28">
          <div className="rule-fade mb-14" />
          <h2 className="font-display text-2xl font-semibold text-ink">
            More work
          </h2>
          <StaggerGroup stagger={0.08} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <ProjectCard key={item.slug} project={item} index={index} />
            ))}
          </StaggerGroup>
        </section>
      ) : null}
    </article>
  );
}
