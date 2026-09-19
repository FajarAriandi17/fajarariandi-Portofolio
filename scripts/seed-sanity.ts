/**
 * Seeds the Sanity dataset from the typed fallback content in
 * `src/content/fallback/*`.
 *
 * One-time bootstrapping, but written to be re-runnable: every document gets a
 * deterministic `_id` and every write is a `createOrReplace`, so running this
 * twice converges on the same state instead of duplicating rows. Image files
 * are uploaded as assets — Sanity keys asset IDs by content hash, so repeated
 * uploads of the same file land on the same asset.
 *
 * Fields the fallback leaves empty on purpose (blog covers, gallery shots, the
 * author avatar) are omitted rather than faked — `<MediaFrame>` renders a
 * procedural gradient for them, exactly as it does in fallback mode.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-sanity.ts            # apply
 *   node --env-file=.env.local scripts/seed-sanity.ts --dry-run  # plan only
 */

import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { aboutPage as fallbackAbout, siteSettings as fallbackSite, socialLinks as fallbackSocial } from "../src/content/fallback/site.ts";
import { experience as fallbackExperience } from "../src/content/fallback/experience.ts";
import { education as fallbackEducation } from "../src/content/fallback/education.ts";
import { posts as fallbackPosts } from "../src/content/fallback/posts.ts";
import { projects as fallbackProjects } from "../src/content/fallback/projects.ts";
import { skills as fallbackSkills } from "../src/content/fallback/skills.ts";

const DRY_RUN = process.argv.includes("--dry-run");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2025-01-01";
const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim();

if (!projectId) {
  console.error("✗ NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Check .env.local.");
  process.exit(1);
}
if (!writeToken) {
  console.error(
    "✗ SANITY_API_WRITE_TOKEN is not set. Create a token with write access at\n" +
      "  https://www.sanity.io/manage/project/<projectId>/api/tokens\n" +
      "  and add it to .env.local.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: writeToken,
  useCdn: false,
  maxRetries: 3,
});

const PUBLIC_DIR = join(process.cwd(), "public");

const plan: string[] = [];
const note = (line: string) => plan.push(line);

/** Uploads a local image, returning a Sanity image value (or null if absent). */
async function uploadImage(
  relativePath: string,
  alt: string,
): Promise<{ _type: "image"; asset: { _ref: string }; alt: string } | null> {
  const absPath = join(PUBLIC_DIR, relativePath);
  const body = await readFile(absPath).catch(() => null);
  if (!body) {
    note(`  ! skipped (file not found): public${relativePath}`);
    return null;
  }

  if (DRY_RUN) {
    note(`  + asset public${relativePath} (${(body.length / 1024).toFixed(0)} KB)`);
    return null;
  }

  const asset = await client.assets.upload("image", body, {
    filename: relativePath.split("/").pop(),
    contentType: "image/jpeg",
  });
  note(`  + asset ${asset._id}  ← public${relativePath}`);
  return { _type: "image", asset: { _ref: asset._id }, alt };
}

/** Writes (or plans) one document. */
async function writeDoc(doc: { _id: string; _type: string } & Record<string, unknown>): Promise<void> {
  note(`  = ${doc._type}/${doc._id}`);
  if (DRY_RUN) return;
  await client.createOrReplace(doc);
}

async function main(): Promise<void> {
  console.log(
    `\n${DRY_RUN ? "DRY RUN" : "SEEDING"} → ${projectId}/${dataset}\n` +
      `fallback content → Sanity documents\n`,
  );

  /* -- Singletons: site settings + about ------------------------------ */
  note("site settings + about (singletons)");
  const ogImage = await uploadImage(fallbackSite.ogImage.url, fallbackSite.ogImage.alt);
  await writeDoc({
    _id: "siteSettings",
    _type: "siteSettings",
    name: fallbackSite.name,
    shortName: fallbackSite.shortName,
    domain: fallbackSite.domain,
    headline: fallbackSite.headline,
    subheadline: fallbackSite.subheadline,
    description: fallbackSite.description,
    location: fallbackSite.location,
    availability: fallbackSite.availability,
    email: fallbackSite.email,
    whatsapp: fallbackSite.whatsapp,
    resumeUrl: fallbackSite.resumeUrl,
    ...(ogImage ? { ogImage } : {}),
  });

  const profileImage = await uploadImage(
    fallbackAbout.profileImage.url,
    fallbackAbout.profileImage.alt,
  );
  await writeDoc({
    _id: "aboutPage",
    _type: "aboutPage",
    heading: fallbackAbout.heading,
    intro: fallbackAbout.intro,
    bio: fallbackAbout.bio,
    ...(profileImage ? { profileImage } : {}),
    highlights: fallbackAbout.highlights,
    careerSummary: fallbackAbout.careerSummary,
  });

  /* -- Author (referenced by posts) ------------------------------------ */
  note("author");
  await writeDoc({
    _id: "author-fajar-ariandi",
    _type: "author",
    name: fallbackPosts[0].author.name,
    role: fallbackPosts[0].author.role,
  });

  /* -- Projects -------------------------------------------------------- */
  note(`projects (${fallbackProjects.length})`);
  for (const p of fallbackProjects) {
    const thumbnail = await uploadImage(
      `/images/projects/${p.slug}.jpg`,
      p.thumbnail.alt,
    );
    await writeDoc({
      _id: `project-${p.slug}`,
      _type: "project",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      summary: p.summary,
      description: p.description,
      problem: p.problem,
      solution: p.solution,
      ...(thumbnail ? { thumbnail } : {}),
      // Fallback gallery shots carry no real artwork yet; leaving the array
      // unset renders the procedural placeholder on detail pages.
      category: p.category,
      techStack: p.techStack,
      status: p.status,
      featured: p.featured,
      year: p.year,
      order: p.order,
    });
  }

  /* -- Posts ----------------------------------------------------------- */
  note(`posts (${fallbackPosts.length})`);
  for (const p of fallbackPosts) {
    await writeDoc({
      _id: `post-${p.slug}`,
      _type: "post",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      excerpt: p.excerpt,
      body: p.body,
      category: p.category,
      tags: p.tags,
      author: { _type: "reference", _ref: "author-fajar-ariandi" },
      // Time component keeps the ordering deterministic; the date is what the
      // card and sitemap show.
      publishedAt: `${p.publishedAt}T09:00:00Z`,
      readingMinutes: p.readingMinutes,
      featured: p.featured,
    });
  }

  /* -- Skills ---------------------------------------------------------- */
  note(`skills (${fallbackSkills.length})`);
  for (const s of fallbackSkills) {
    await writeDoc({
      _id: `skill-${s.category.toLowerCase()}-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      _type: "skill",
      name: s.name,
      category: s.category,
      level: s.level,
      order: s.order,
    });
  }

  /* -- Experience ------------------------------------------------------ */
  note(`experience (${fallbackExperience.length})`);
  for (const e of fallbackExperience) {
    await writeDoc({
      _id: `experience-${e.order}`,
      _type: "experience",
      role: e.role,
      company: e.company,
      period: e.period,
      start: e.start,
      // `end` is null on the current role — the schema leaves it blank.
      ...(e.end ? { end: e.end } : {}),
      location: e.location,
      description: e.description,
      highlights: e.highlights,
      techStack: e.techStack,
      current: e.current,
      order: e.order,
    });
  }

  /* -- Education -------------------------------------------------------- */
  note(`education (${fallbackEducation.length})`);
  for (const e of fallbackEducation) {
    await writeDoc({
      _id: `education-${e.order}`,
      _type: "education",
      institution: e.institution,
      qualification: e.qualification,
      period: e.period,
      start: e.start,
      // `end` is null on ongoing study — the schema leaves it blank.
      ...(e.end ? { end: e.end } : {}),
      location: e.location,
      description: e.description,
      highlights: e.highlights,
      order: e.order,
    });
  }

  /* -- Social links ---------------------------------------------------- */
  note(`social links (${fallbackSocial.length})`);
  for (const s of fallbackSocial) {
    await writeDoc({
      _id: `social-${s.platform.toLowerCase()}`,
      _type: "socialLink",
      platform: s.platform,
      label: s.label,
      url: s.url,
      handle: s.handle,
      order: s.order,
    });
  }

  console.log(plan.join("\n"));

  if (DRY_RUN) {
    console.log(
      "\nDry run only — nothing was written. Re-run without --dry-run to apply.\n",
    );
    return;
  }

  const counts = await client.fetch<Record<string, number>>(
    `{
      "project": count(*[_type == "project"]),
      "post": count(*[_type == "post"]),
      "skill": count(*[_type == "skill"]),
      "experience": count(*[_type == "experience"]),
      "education": count(*[_type == "education"]),
      "socialLink": count(*[_type == "socialLink"]),
      "author": count(*[_type == "author"]),
      "siteSettings": count(*[_type == "siteSettings"]),
      "aboutPage": count(*[_type == "aboutPage"]),
      "assets": count(*[_type == "sanity.imageAsset"])
    }`,
  );
  console.log("\nDataset now contains:");
  for (const [type, count] of Object.entries(counts)) {
    console.log(`  ${type.padEnd(14)} ${count}`);
  }
  console.log("\nDone. The site reads the Content Lake on next request.\n");
}

main().catch((error) => {
  console.error("\n✗ Seed failed:", error.message);
  if (error.statusCode === 401 || error.message.includes("Unauthorized")) {
    console.error(
      "  The write token was rejected. Create a token with Editor or Admin role at\n" +
        "  https://www.sanity.io/manage/project/" + projectId + "/api/tokens",
    );
  }
  process.exit(1);
});
