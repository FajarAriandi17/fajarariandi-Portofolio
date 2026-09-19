/**
 * GROQ queries. Each one selects exactly the fields the domain types need, so
 * the mapping step in `src/lib/content.ts` stays thin.
 */

const PROJECT_FIELDS = /* groq */ `
  title,
  "slug": slug.current,
  summary,
  description,
  problem,
  solution,
  thumbnail,
  gallery,
  category,
  techStack,
  status,
  liveUrl,
  githubUrl,
  featured,
  year,
  order
`;

export const PROJECTS_QUERY = /* groq */ `
  *[_type == "project"] | order(order asc, year desc) {
    ${PROJECT_FIELDS}
  }
`;

export const PROJECT_BY_SLUG_QUERY = /* groq */ `
  *[_type == "project" && slug.current == $slug][0] {
    ${PROJECT_FIELDS}
  }
`;

export const PROJECT_SLUGS_QUERY = /* groq */ `
  *[_type == "project" && defined(slug.current)][].slug.current
`;

export const FEATURED_PROJECTS_QUERY = /* groq */ `
  *[_type == "project" && featured == true] | order(order asc) {
    ${PROJECT_FIELDS}
  }
`;

export const SKILLS_QUERY = /* groq */ `
  *[_type == "skill"] | order(category asc, order asc) {
    name,
    level,
    category,
    order
  }
`;

export const EXPERIENCE_QUERY = /* groq */ `
  *[_type == "experience"] | order(order asc) {
    role,
    company,
    period,
    start,
    end,
    location,
    description,
    highlights,
    techStack,
    current,
    order
  }
`;

export const EDUCATION_QUERY = /* groq */ `
  *[_type == "education"] | order(order asc) {
    institution,
    qualification,
    period,
    start,
    end,
    location,
    description,
    highlights,
    order
  }
`;

const POST_FIELDS = /* groq */ `
  title,
  "slug": slug.current,
  excerpt,
  body,
  cover,
  category,
  tags,
  author->{ name, role, avatar },
  publishedAt,
  updatedAt,
  readingMinutes,
  featured
`;

export const POSTS_QUERY = /* groq */ `
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
    ${POST_FIELDS}
  }
`;

export const POST_BY_SLUG_QUERY = /* groq */ `
  *[_type == "post" && slug.current == $slug][0] {
    ${POST_FIELDS}
  }
`;

export const POST_SLUGS_QUERY = /* groq */ `
  *[_type == "post" && defined(slug.current)][].slug.current
`;

export const SOCIAL_LINKS_QUERY = /* groq */ `
  *[_type == "socialLink"] | order(order asc) {
    platform,
    label,
    url,
    handle,
    order
  }
`;

export const SITE_SETTINGS_QUERY = /* groq */ `
  *[_type == "siteSettings"][0] {
    name,
    shortName,
    domain,
    headline,
    subheadline,
    description,
    location,
    availability,
    email,
    whatsapp,
    resumeUrl,
    ogImage
  }
`;

export const ABOUT_PAGE_QUERY = /* groq */ `
  *[_type == "aboutPage"][0] {
    heading,
    intro,
    bio,
    profileImage,
    highlights,
    careerSummary
  }
`;
