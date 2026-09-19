import type { Metadata } from "next";
import Link from "next/link";

import { PrintButton } from "@/components/cv/PrintButton";
import {
  getAboutPage,
  getEducation,
  getExperience,
  getProjects,
  getSiteSettings,
  getSkillGroups,
  getSocialLinks,
} from "@/lib/content";

/**
 * Printable résumé.
 *
 * The "Download CV" CTA points here rather than at a stale binary PDF. On
 * screen this is a branded dark document; when printed (or saved as PDF from
 * the print dialog) the print stylesheet below swaps to a clean, low-ink,
 * ink-on-paper layout, because a gradient-bleeding résumé is not what a
 * recruiter wants in a dossier.
 */

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "CV",
    description: `Résumé of ${settings.name}, ${settings.subheadline}`,
    robots: { index: false, follow: false },
  };
}

export default async function CVPage() {
  const [settings, about, experience, education, skillGroups, projects, socials] =
    await Promise.all([
      getSiteSettings(),
      getAboutPage(),
      getExperience(),
      getEducation(),
      getSkillGroups(),
      getProjects(),
      getSocialLinks(),
    ]);

  const featured = projects.filter((p) => p.featured);
  const showcase = featured.length > 0 ? featured : projects.slice(0, 4);
  const contactSocials = socials.filter(
    (s) => s.platform !== "Email" && s.platform !== "WhatsApp",
  );

  // Not a <main>: the root layout already provides the page's main landmark, so
  // a second one here would nest and duplicate it (axe landmark-* rules).
  return (
    <div className="cv-page container-page py-16 sm:py-24">
      <style
        // Print styles: strip the dark UI chrome and lay the document out for
        // A4/Letter. Kept here rather than in globals.css because no other page
        // should ever print this way.
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: #fff !important; color: #111 !important; }
              header, footer, nav, .no-print { display: none !important; }
              .cv-page { padding: 0 !important; max-width: none !important; }
              .cv-sheet {
                background: #fff !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                columns: 1 !important;
              }
              .cv-sheet * { color: #111 !important; }
              .cv-name { color: #000 !important; -webkit-text-fill-color: #000 !important; }
              .cv-rule { border-color: #999 !important; }
              .cv-col { columns: 1 !important; gap: 0 !important; }
              .cv-block { break-inside: avoid; }
              a { color: #111 !important; text-decoration: none !important; }
              .text-gradient, .cv-gradient {
                background: none !important;
                color: #000 !important;
                -webkit-text-fill-color: #000 !important;
              }
            }
          `,
        }}
      />

      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
        >
          ← Back to site
        </Link>
        <PrintButton />
      </div>

      <div className="cv-sheet surface overflow-hidden p-8 sm:p-12 lg:p-16">
        {/* Header ---------------------------------------------------------- */}
        <header className="cv-block">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink-faint">
            Curriculum Vitae
          </p>
          <h1 className="cv-name cv-gradient text-gradient mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {settings.name}
          </h1>
          <p className="mt-3 text-lg text-ink-soft">{settings.subheadline}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-ink-muted">
            <span>{settings.email}</span>
            <span aria-hidden className="size-1 rounded-full bg-ink-faint/50" />
            <span>{settings.location}</span>
            <span aria-hidden className="size-1 rounded-full bg-ink-faint/50" />
            <span>{settings.domain}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-ink-muted">
            {contactSocials.map((social) => (
              <span key={social.platform}>
                {social.platform} · {social.handle}
              </span>
            ))}
          </div>
        </header>

        <hr className="cv-rule my-10 border-t border-line" />

        <div className="cv-col gap-10 sm:columns-2 sm:[column-fill:_balance]">
          {/* Summary -------------------------------------------------------- */}
          <section className="cv-block break-inside-avoid">
            <CVHeading>Summary</CVHeading>
            <p className="mt-4 text-sm leading-[1.8] text-ink-muted">
              {about.intro} {about.careerSummary}
            </p>
          </section>

          {/* Experience ----------------------------------------------------- */}
          <section className="cv-block">
            <CVHeading>Experience</CVHeading>
            <div className="mt-6 space-y-7">
              {experience.map((role) => (
                <div key={`${role.company}-${role.order}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="text-base font-semibold text-ink">
                      {role.role}
                    </h3>
                    <span className="font-mono text-xs text-ink-faint">
                      {role.period}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-accent-cyan">
                    {role.company} · {role.location}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {role.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="pl-4 text-sm leading-relaxed text-ink-muted [background:linear-gradient(var(--color-accent-cyan),var(--color-accent-cyan))_left_0.55em/_0.375em_0.375em_no-repeat]"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Education ------------------------------------------------------ */}
          <section className="cv-block break-inside-avoid">
            <CVHeading>Education</CVHeading>
            <div className="mt-6 space-y-6">
              {education.map((entry) => (
                <div key={`${entry.institution}-${entry.order}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="text-base font-semibold text-ink">
                      {entry.qualification}
                    </h3>
                    <span className="font-mono text-xs text-ink-faint">
                      {entry.period}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-accent-cyan">
                    {entry.institution}
                    {entry.location ? ` · ${entry.location}` : ""}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {entry.description}
                  </p>
                  {entry.highlights.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {entry.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="pl-4 text-sm leading-relaxed text-ink-muted [background:linear-gradient(var(--color-accent-cyan),var(--color-accent-cyan))_left_0.55em/_0.375em_0.375em_no-repeat]"
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Skills --------------------------------------------------------- */}
          <section className="cv-block break-inside-avoid">
            <CVHeading>Skills</CVHeading>
            <div className="mt-5 space-y-5">
              {skillGroups.map((group) => (
                <div key={group.category}>
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-ink-faint">
                    {group.category}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-soft">
                    {group.skills.map((s) => s.name).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Selected projects ---------------------------------------------- */}
          <section className="cv-block">
            <CVHeading>Selected Projects</CVHeading>
            <div className="mt-5 space-y-5">
              {showcase.map((project) => (
                <div key={project.slug}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="text-sm font-semibold text-ink">
                      {project.title}
                    </h3>
                    <span className="font-mono text-xs text-ink-faint">
                      {project.year}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {project.summary}
                  </p>
                  <p className="mt-1.5 font-mono text-[0.7rem] text-ink-faint">
                    {project.category} · {project.techStack.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <hr className="cv-rule my-10 border-t border-line" />

        <footer className="flex flex-wrap items-center justify-between gap-3 font-mono text-[0.7rem] text-ink-faint">
          <span>{settings.availability}</span>
          <span>Generated from fajarariandi.com</span>
        </footer>
      </div>
    </div>
  );
}

function CVHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-ink">{children}</h2>
  );
}
