import type { Metadata } from "next";

import { AboutSection } from "@/components/sections/AboutSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ButtonLink } from "@/components/ui/Button";
import { getAboutPage, getExperience, getSiteSettings, getSkillGroups } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Fajar Ariandi — designer, developer, and IoT engineer working across web development, networking, and AI. From field installation to full-stack product work.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Muhammad Fajar Ariandi",
    description:
      "From field network engineering to full-stack product work.",
    url: "/about",
  },
};

export default async function AboutPage() {
  const [about, settings, skillGroups, experience] = await Promise.all([
    getAboutPage(),
    getSiteSettings(),
    getSkillGroups(),
    getExperience(),
  ]);

  return (
    <div className="relative pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(90% 60% at 50% -10%, rgba(96,165,250,0.16) 0%, transparent 65%)",
        }}
      />

      <div className="relative">
        <AboutSection about={about} settings={settings} headingLevel="h1" />
        <div className="container-page" aria-hidden>
          <div className="rule-fade" />
        </div>
        <SkillsSection groups={skillGroups} />
        <div className="container-page" aria-hidden>
          <div className="rule-fade" />
        </div>
        <ExperienceSection experience={experience} />

        <div className="container-page pb-24 pt-10">
          <div className="surface flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Want the full picture?
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
                See the work behind the timeline, or get in touch directly.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <ButtonLink href="/projects">View projects</ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Contact
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
