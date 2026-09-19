import { Hero } from "@/components/hero/Hero";
import { Parallax } from "@/components/ui/Parallax";
import { AboutSection } from "@/components/sections/AboutSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { SocialSection } from "@/components/sections/SocialSection";
import {
  getAboutPage,
  getExperience,
  getFeaturedProjects,
  getPosts,
  getSiteSettings,
  getSkillGroups,
  getSocialLinks,
} from "@/lib/content";

/**
 * Home page — composes every section in reading order.
 *
 * All content is fetched in parallel on the server; the sections themselves are
 * client components only where they need interaction (tilt, tabs, the form).
 */
export default async function HomePage() {
  const [settings, about, skillGroups, projects, experience, posts, socials] =
    await Promise.all([
      getSiteSettings(),
      getAboutPage(),
      getSkillGroups(),
      getFeaturedProjects(),
      getExperience(),
      getPosts(),
      getSocialLinks(),
    ]);

  return (
    <>
      <Hero settings={settings} />

      <div className="relative">
        {/* Section separators — soft accent glows rather than hard rules. */}
        <AboutSection about={about} settings={settings} />
        <SectionGlow />
        <SkillsSection groups={skillGroups} />
        <SectionGlow />
        <ProjectsSection projects={projects} />
        <SectionGlow />
        <ExperienceSection experience={experience} />
        <SectionGlow />
        <BlogSection posts={posts} />
        <SectionGlow />
        <SocialSection socials={socials} />
        <ContactSection settings={settings} />
      </div>
    </>
  );
}

/** Hairline that fades from the centre, marking a change of subject. */
function SectionGlow() {
  return (
    <div className="container-page" aria-hidden>
      {/* A whisper of drift — reads as depth between sections, nothing more. */}
      <Parallax distance={10} className="rule-fade will-change-transform" />
    </div>
  );
}
