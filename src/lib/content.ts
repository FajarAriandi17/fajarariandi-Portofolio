import {
  aboutPage as fallbackAbout,
  siteSettings as fallbackSite,
  socialLinks as fallbackSocial,
} from "@/content/fallback/site";
import { experience as fallbackExperience } from "@/content/fallback/experience";
import { education as fallbackEducation } from "@/content/fallback/education";
import { posts as fallbackPosts } from "@/content/fallback/posts";
import { projects as fallbackProjects } from "@/content/fallback/projects";
import { groupSkills, skills as fallbackSkills } from "@/content/fallback/skills";
import { sanityConfigured } from "@/sanity/env";
import { urlForImage, urlForImages } from "@/sanity/image";
import {
  ABOUT_PAGE_QUERY,
  EDUCATION_QUERY,
  EXPERIENCE_QUERY,
  FEATURED_PROJECTS_QUERY,
  POSTS_QUERY,
  POST_BY_SLUG_QUERY,
  POST_SLUGS_QUERY,
  PROJECTS_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PROJECT_SLUGS_QUERY,
  SITE_SETTINGS_QUERY,
  SKILLS_QUERY,
  SOCIAL_LINKS_QUERY,
} from "@/sanity/queries";
import type {
  AboutPage,
  Education,
  Experience,
  Post,
  Project,
  SiteSettings,
  Skill,
  SkillGroup,
  SocialLink,
} from "@/types/content";

/* ============================================================================
   THE ABSTRACTION LAYER

   Every page and component reads content through the getters below — never
   from Sanity directly. Each getter tries Sanity, and falls back to the typed
   seed data in `src/content/fallback/*` when Sanity is unconfigured *or*
   unreachable. The return types are identical either way, so the UI cannot
   tell the difference and there is nothing to change when the CMS goes live.

   The Sanity client is imported dynamically so an unconfigured build never
   pulls it into the bundle, and a CMS outage degrades to fallback content
   rather than a 500.
   ========================================================================== */

async function fetchSanity<T>(
  query: string,
  params?: Record<string, unknown>,
): Promise<T | null> {
  if (!sanityConfigured) return null;

  try {
    const [{ createClient }, env] = await Promise.all([
      import("next-sanity"),
      import("@/sanity/env"),
    ]);

    const client = createClient({
      projectId: env.projectId,
      dataset: env.dataset,
      apiVersion: env.apiVersion,
      useCdn: true,
      token: env.readToken || undefined,
      perspective: "published",
    });

    return await client.fetch<T>(query, params ?? {}, {
      next: { revalidate: 60 },
    });
  } catch (error) {
    // A CMS outage should never take the site down — log and serve seed data.
    console.error("[content] Sanity request failed; serving fallback:", error);
    return null;
  }
}

/* --------------------------------------------------------------------------
   Sanity document shapes (loose — the mappers below narrow them)
   -------------------------------------------------------------------------- */

type SanityProject = Omit<Project, "thumbnail" | "gallery"> & {
  thumbnail: Parameters<typeof urlForImage>[0];
  gallery: Parameters<typeof urlForImages>[0];
};

type SanityPost = Omit<Post, "cover" | "author"> & {
  cover: Parameters<typeof urlForImage>[0];
  author: { name?: string; role?: string; avatar?: Parameters<typeof urlForImage>[0] } | null;
};

type SanitySiteSettings = Omit<SiteSettings, "ogImage"> & {
  ogImage: Parameters<typeof urlForImage>[0];
};

type SanityAbout = Omit<AboutPage, "profileImage"> & {
  profileImage: Parameters<typeof urlForImage>[0];
};

/* --------------------------------------------------------------------------
   Mappers — Sanity document → domain type
   -------------------------------------------------------------------------- */

function mapProject(doc: SanityProject): Project {
  return {
    ...doc,
    thumbnail: urlForImage(doc.thumbnail, { width: 1200, quality: 80 }),
    gallery: urlForImages(doc.gallery, { width: 1600, quality: 80 }),
    techStack: doc.techStack ?? [],
    status: doc.status ?? "completed",
  };
}

function mapPost(doc: SanityPost): Post {
  return {
    ...doc,
    cover: urlForImage(doc.cover, { width: 1600, quality: 80 }),
    tags: doc.tags ?? [],
    author: {
      name: doc.author?.name ?? fallbackPosts[0].author.name,
      role: doc.author?.role ?? fallbackPosts[0].author.role,
      avatar: urlForImage(doc.author?.avatar ?? null, { width: 200 }),
    },
  };
}

/* --------------------------------------------------------------------------
   Public getters
   -------------------------------------------------------------------------- */

export async function getProjects(): Promise<Project[]> {
  const docs = await fetchSanity<SanityProject[]>(PROJECTS_QUERY);
  if (!docs?.length) return fallbackProjects;
  return docs.map(mapProject);
}

export async function getProject(slug: string): Promise<Project | null> {
  const doc = await fetchSanity<SanityProject>(PROJECT_BY_SLUG_QUERY, { slug });
  if (doc) return mapProject(doc);
  return fallbackProjects.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const docs = await fetchSanity<SanityProject[]>(FEATURED_PROJECTS_QUERY);
  if (docs?.length) return docs.map(mapProject);
  return fallbackProjects.filter((p) => p.featured);
}

export async function getProjectSlugs(): Promise<string[]> {
  const slugs = await fetchSanity<string[]>(PROJECT_SLUGS_QUERY);
  if (slugs?.length) return slugs;
  return fallbackProjects.map((p) => p.slug);
}

export async function getSkills(): Promise<Skill[]> {
  const docs = await fetchSanity<Skill[]>(SKILLS_QUERY);
  if (!docs?.length) return fallbackSkills;
  return docs;
}

/** Skills grouped by category, ordered per the PRD's five categories. */
export async function getSkillGroups(): Promise<SkillGroup[]> {
  return groupSkills(await getSkills());
}

export async function getExperience(): Promise<Experience[]> {
  const docs = await fetchSanity<Experience[]>(EXPERIENCE_QUERY);
  if (!docs?.length) return fallbackExperience;
  return docs;
}

export async function getEducation(): Promise<Education[]> {
  const docs = await fetchSanity<Education[]>(EDUCATION_QUERY);
  if (!docs?.length) return fallbackEducation;
  return docs;
}

export async function getPosts(): Promise<Post[]> {
  const docs = await fetchSanity<SanityPost[]>(POSTS_QUERY);
  if (!docs?.length) return fallbackPosts;
  return docs.map(mapPost);
}

export async function getPost(slug: string): Promise<Post | null> {
  const doc = await fetchSanity<SanityPost>(POST_BY_SLUG_QUERY, { slug });
  if (doc) return mapPost(doc);
  return fallbackPosts.find((p) => p.slug === slug) ?? null;
}

export async function getPostSlugs(): Promise<string[]> {
  const slugs = await fetchSanity<string[]>(POST_SLUGS_QUERY);
  if (slugs?.length) return slugs;
  return fallbackPosts.map((p) => p.slug);
}

/**
 * Related posts: same category first, then topped up with recent posts so the
 * block is never partially empty.
 */
export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  const all = await getPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return all.slice(0, limit);

  const sameCategory = all.filter(
    (p) => p.slug !== slug && p.category === current.category,
  );
  const others = all.filter(
    (p) => p.slug !== slug && p.category !== current.category,
  );

  return [...sameCategory, ...others].slice(0, limit);
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const docs = await fetchSanity<SocialLink[]>(SOCIAL_LINKS_QUERY);
  if (!docs?.length) return fallbackSocial;
  return docs;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await fetchSanity<SanitySiteSettings>(SITE_SETTINGS_QUERY);
  if (!doc) return fallbackSite;
  return { ...doc, ogImage: urlForImage(doc.ogImage, { width: 1200 }) };
}

export async function getAboutPage(): Promise<AboutPage> {
  const doc = await fetchSanity<SanityAbout>(ABOUT_PAGE_QUERY);
  if (!doc) return fallbackAbout;
  return {
    ...doc,
    profileImage: urlForImage(doc.profileImage, { width: 800 }),
  };
}
