/**
 * The single source of truth for every content shape on the site.
 *
 * Both the Sanity schemas (`src/sanity/schemaTypes/*`) and the local fallback
 * seed data (`src/content/fallback/*`) are written *against* these types. The
 * components only ever see these shapes — never a Sanity document. That is what
 * lets the site run with zero CMS credentials today and switch to live content
 * by changing one environment variable.
 */

/* --------------------------------------------------------------------------
   Images
   Sanity serves images from its CDN with its own asset reference shape. The
   `sanity/image.ts` adapter normalises those into `ContentImage`, so nothing
   downstream needs to know where an image came from.
   -------------------------------------------------------------------------- */

export type ContentImage = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  /** Tiny base64 preview for next/image placeholder="blur". */
  blurDataURL?: string;
  /** Set when the image came from Sanity, so the CDN loader can be used. */
  sanityRef?: string;
};

/* --------------------------------------------------------------------------
   Projects
   -------------------------------------------------------------------------- */

export const PROJECT_CATEGORIES = [
  "Web Development",
  "Design",
  "AI Project",
  "Networking",
  "IoT",
  "CCTV",
  "Starlink",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export type ProjectStatus = "completed" | "in-progress" | "maintained" | "archived";

export type Project = {
  title: string;
  slug: string;
  /** Short one-liner for cards and meta descriptions. */
  summary: string;
  /** Long-form body, rendered as Portable Text from Sanity or plain blocks locally. */
  description: string;
  /** The problem the project solves — shown on the detail page. */
  problem: string;
  /** How it was solved — shown on the detail page. */
  solution: string;
  thumbnail: ContentImage;
  gallery: ContentImage[];
  category: ProjectCategory;
  techStack: string[];
  status: ProjectStatus;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  year: number;
  /** Ascending. Controls grid order. */
  order: number;
};

/* --------------------------------------------------------------------------
   Skills
   -------------------------------------------------------------------------- */

export type SkillCategoryName =
  | "Development"
  | "Design"
  | "AI"
  | "Networking"
  | "IoT";

export type Skill = {
  name: string;
  /** 0–100. Drives the proficiency meter. */
  level: number;
  category: SkillCategoryName;
  order: number;
};

export type SkillGroup = {
  category: SkillCategoryName;
  /** Short blurb shown under the category heading. */
  blurb: string;
  skills: Skill[];
};

/* --------------------------------------------------------------------------
   Experience
   -------------------------------------------------------------------------- */

export type Experience = {
  role: string;
  company: string;
  /** e.g. "2023" or "Jan 2023" — free text, rendered as-is. */
  period: string;
  start: string;
  end: string | null;
  location?: string;
  description: string;
  highlights: string[];
  techStack: string[];
  current: boolean;
  order: number;
};

/* --------------------------------------------------------------------------
   Education
   -------------------------------------------------------------------------- */

export type Education = {
  institution: string;
  /** Qualification awarded or field of study, e.g. "Computer & Network Engineering". */
  qualification: string;
  /** e.g. "2017 — 2020" — free text, rendered as-is. */
  period: string;
  start: string;
  end: string | null;
  location?: string;
  description: string;
  highlights: string[];
  /** Ascending. Controls order on the CV. */
  order: number;
};

/* --------------------------------------------------------------------------
   Blog
   -------------------------------------------------------------------------- */

export type PostCategory =
  | "AI"
  | "Web Development"
  | "Networking"
  | "IoT"
  | "Career Journey"
  | "Technology";

export type Author = {
  name: string;
  avatar?: ContentImage;
  role: string;
};

export type Post = {
  title: string;
  slug: string;
  excerpt: string;
  /** Markdown-ish body. Rendered by the same renderer in both data paths. */
  body: string;
  cover?: ContentImage;
  category: PostCategory;
  tags: string[];
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  featured: boolean;
};

/* --------------------------------------------------------------------------
   Site-wide
   -------------------------------------------------------------------------- */

export type SocialPlatform =
  | "GitHub"
  | "Instagram"
  | "TikTok"
  | "LinkedIn"
  | "Email"
  | "WhatsApp";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  url: string;
  /** Handle shown under the label, e.g. "@fajarariandi". */
  handle?: string;
  order: number;
};

export type SiteSettings = {
  name: string;
  shortName: string;
  domain: string;
  headline: string;
  subheadline: string;
  /** Meta description used as the site-wide SEO fallback. */
  description: string;
  location: string;
  availability: string;
  email: string;
  whatsapp: string;
  resumeUrl?: string;
  ogImage: ContentImage;
};

export type AboutPage = {
  heading: string;
  intro: string;
  bio: string[];
  profileImage: ContentImage;
  highlights: { label: string; value: string }[];
  careerSummary: string;
};
