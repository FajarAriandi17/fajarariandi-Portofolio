import type { PostCategory, ProjectCategory, SkillCategoryName } from "@/types/content";

/**
 * Option lists shared by the schemas.
 *
 * These re-declare the domain unions rather than importing them, because Sanity
 * validates its option lists at runtime and a `readonly` tuple from the type
 * layer would fight that. The `satisfies` checks below fail the build if the
 * two ever drift apart, which is the guarantee that actually matters.
 */

export const PROJECT_CATEGORY_OPTIONS = [
  "Web Development",
  "Design",
  "AI Project",
  "Networking",
  "IoT",
  "CCTV",
  "Starlink",
] as const satisfies readonly ProjectCategory[];

export const POST_CATEGORIES = [
  "AI",
  "Web Development",
  "Networking",
  "IoT",
  "Career Journey",
  "Technology",
] as const satisfies readonly PostCategory[];

export const SKILL_CATEGORIES = [
  "Development",
  "Design",
  "AI",
  "Networking",
  "IoT",
] as const satisfies readonly SkillCategoryName[];

export const SOCIAL_PLATFORMS = [
  "GitHub",
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Email",
  "WhatsApp",
] as const;
