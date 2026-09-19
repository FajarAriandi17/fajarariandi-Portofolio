import type { AboutPage, SiteSettings, SocialLink } from "@/types/content";

/**
 * Fallback site content. Used verbatim when Sanity is not configured, and
 * replaced field-for-field once `NEXT_PUBLIC_SANITY_PROJECT_ID` is set.
 *
 * Image `url` values are intentionally empty where no real asset exists yet —
 * `<MediaFrame>` renders a deterministic procedural gradient in that case, so
 * the layout is always complete and never shows a broken image. Swap in real
 * artwork from Sanity when it's ready.
 */

export const siteSettings: SiteSettings = {
  name: "Muhammad Fajar Ariandi",
  shortName: "Fajar Ariandi",
  domain: "fajarariandi.com",
  headline: "Muhammad Fajar Ariandi",
  subheadline: "Designer. Developer. AI Creator. Network & IoT Enthusiast.",
  description:
    "Muhammad Fajar Ariandi — designer, developer, and AI creator working across web development, networking, and IoT. Building fast, considered digital products.",
  location: "Indonesia",
  availability: "Open to full-time roles and freelance projects",
  email: "fajarariandi699@gmail.com",
  // Digits only, international format without "+" — wa.me requires this shape.
  whatsapp: "6288213400530",
  // The real CV, served from /public so the download works offline and never
  // depends on a third-party link staying alive.
  resumeUrl: "/cv-muhammad-fajar-ariandi.pdf",
  ogImage: {
    url: "/images/og-cover.jpg",
    alt: "Muhammad Fajar Ariandi — Designer, Developer, AI Creator",
    width: 1200,
    height: 630,
  },
};

export const aboutPage: AboutPage = {
  heading: "Designing and building at the edge of network and intelligence",
  intro:
    "I work where design, code, and infrastructure meet — turning ambiguous problems into products people can actually use.",
  bio: [
    "I'm Fajar, a designer and developer based in Indonesia. My work sits at an unusual intersection: I design interfaces, write the front-end that ships them, and then build the network and IoT infrastructure they run on. That range means I can take an idea from a blank canvas through to a device on a wall that's reporting live data.",
    "I started in networking — configuring routers, deploying fibre, standing up CCTV and Starlink links in places where connectivity is genuinely hard. That work taught me to care about reliability before elegance. Over time I moved toward building the software layer on top: dashboards, monitoring tools, and the interfaces that make infrastructure legible to the people operating it.",
    "These days I spend most of my time in the modern web stack — TypeScript, React, Next.js — and increasingly with AI tooling as part of the build process rather than a novelty. I use it to move faster on the parts of a project that are mechanical, so more of my attention goes to the parts that need judgement.",
  ],
  profileImage: {
    url: "/images/profile.jpg",
    alt: "Portrait of Muhammad Fajar Ariandi",
    width: 768,
    height: 1376,
  },
  highlights: [
    { label: "Years building", value: "5+" },
    { label: "Projects delivered", value: "30+" },
    { label: "Skill areas", value: "5" },
    { label: "Sites connected", value: "50+" },
  ],
  careerSummary:
    "From field network engineering to full-stack product work — a path built on shipping things that have to keep working after the install team leaves.",
};

export const socialLinks: SocialLink[] = [
  {
    platform: "GitHub",
    label: "GitHub",
    url: "https://github.com/FajarAriandi17",
    handle: "@FajarAriandi17",
    order: 1,
  },
  {
    platform: "LinkedIn",
    label: "LinkedIn",
    url: "https://id.linkedin.com/in/fajar-ariandi-90ba5a21a",
    handle: "in/fajar-ariandi-90ba5a21a",
    order: 2,
  },
  {
    platform: "Instagram",
    label: "Instagram",
    url: "https://www.instagram.com/fjrarndii_?stkn=MXJhdTFjbXJiczlybw==",
    handle: "@fjrarndii_",
    order: 3,
  },
  {
    platform: "TikTok",
    label: "TikTok",
    url: "https://www.tiktok.com/@fajardev.ai?_r=1&_t=ZS-99oF4QhPERg",
    handle: "@fajardev.ai",
    order: 4,
  },
  {
    platform: "WhatsApp",
    label: "WhatsApp",
    url: "https://wa.me/6288213400530",
    handle: "Chat directly",
    order: 5,
  },
  {
    platform: "Email",
    label: "Email",
    url: "mailto:fajarariandi699@gmail.com",
    handle: "fajarariandi699@gmail.com",
    order: 6,
  },
];
