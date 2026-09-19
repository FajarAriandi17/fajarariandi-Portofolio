# FajarAriandi.com — Portfolio Platform

Premium dark-futuristic portfolio for **Muhammad Fajar Ariandi**, built to the
PRD in the repository root. AI-startup aesthetic, galaxy/space theme, Awwwards
level of motion, and a full CMS behind it.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Motion · GSAP · Three.js / React Three Fiber · Sanity CMS

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

No environment variables are required. Without Sanity the site serves typed
fallback content from `src/content/fallback/*`, and the Studio explains what to
configure.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint .` |

### Enabling the CMS (optional)

Copy `.env.example` to `.env.local` and fill in the Sanity values, then
restart. The site reads the Content Lake only when
`NEXT_PUBLIC_SANITY_PROJECT_ID` is set — the footer shows `cms live` or
`local content` so the source is never ambiguous.

The Studio is at `/studio`. It pins `siteSettings` and `aboutPage` to single
documents so there is no way to create a duplicate the site would ambiguously
resolve.

## Architecture

```
src/
├─ app/                     Routes — every page is a server component
│  ├─ studio/               Embedded Sanity Studio (the Admin Dashboard)
│  ├─ cv/                   Printable résumé
│  └─ api/contact/          Contact endpoint (rate-limited, honeypot, zod)
├─ components/
│  ├─ hero/                 WebGL galaxy + hero
│  ├─ sections/             Page-level blocks
│  ├─ cards/ · layout/ · ui/· cv/
├─ content/fallback/        Typed seed content — the site without a CMS
├─ lib/content.ts           The abstraction layer: Sanity → fallback
├─ sanity/                  Config, schema types, GROQ queries
└─ hooks/                   useEnvironment: hydration, viewport, low-power
```

**Content layer.** Pages never touch Sanity directly. Every getter in
`lib/content.ts` tries the Content Lake and falls back to typed seed data when
Sanity is unconfigured *or unreachable*. The return types are identical either
way, so the UI cannot tell the difference and nothing changes when the CMS goes
live. The Sanity client is imported dynamically, so an unconfigured build never
pulls it into the bundle.

**Imagery.** Hero, social-cover, and all ten project thumbnails are generated
artwork in `public/images/`. `<MediaFrame>` renders a deterministic procedural
gradient when an image URL is empty, so the layout is complete even where real
artwork doesn't exist yet — swap the seed data when screenshots are ready.

## Requirements coverage

| PRD area | Where |
| --- | --- |
| Hero + 3D galaxy | `components/hero/` — custom GLSL, three parallax shells, pointer parallax, parks when off-screen |
| About | `sections/AboutSection.tsx` |
| Skills (5 categories, proficiency) | `sections/SkillsSection.tsx` |
| Projects + detail pages | `sections/ProjectsExplorer.tsx`, `app/projects/[slug]` |
| Experience timeline | `sections/ExperienceSection.tsx` |
| Blog (search, categories, tags, related) | `sections/BlogExplorer.tsx`, `app/blog/[slug]` |
| Social hub | `sections/SocialSection.tsx` |
| Contact + WhatsApp | `sections/ContactSection.tsx`, `app/api/contact` |
| Admin Dashboard | `/studio` — full CRUD for every content type |
| Animation | Galaxy, parallax, scroll reveals, stagger, tilt + magnetic cards, route transitions |
| SEO | `sitemap.xml`, `robots.txt`, canonical, Open Graph, Twitter cards, JSON-LD |
| Security | Rate limiting, honeypot, zod validation, env-isolated secrets |
| Performance | Static/SSG generation, image optimisation, capped DPR, reduced-motion + low-power tiers |

## Accessibility & performance

- Every ambient animation is opt-out via `prefers-reduced-motion`; the galaxy
  renders a single frame and infinite loops stop entirely.
- `prefers-reduced-transparency` replaces glass blur with a solid surface.
- `useLowPowerDevice` drops the particle budget to roughly a third.
- The WebGL canvas mounts post-hydration and sets `frameloop: "never"` when
  scrolled out of view, so it costs nothing once the reader has moved on.
- Visible focus styles are never suppressed; the hero paints a CSS gradient
  base before any JS, so it is never blank on a slow connection.

## Notes

- The "Download CV" CTA points at `/cv`, a real printable page. Use the
  browser's print dialog → Save as PDF; the print stylesheet swaps to a clean
  ink-on-paper layout.
- Contact email delivery uses [Resend](https://resend.com) when configured.
  Without credentials, submissions are logged to the server console so the form
  works end-to-end in development.
- The Studio route is excluded from the index and the sitemap.
