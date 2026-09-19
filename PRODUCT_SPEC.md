# Product Specification — FajarAriandi.com Portfolio Platform

**Version:** 1.0 · **Status:** Built (Phase 1 complete) · **Owner:** Muhammad Fajar Ariandi

This specification describes the portfolio platform as it is **actually implemented**
in `web/`. It is the counterpart to `PRD_FajarAriandi_Portfolio.md` (the original
brief) — where the two differ, this document reflects the code, and the divergence
is called out explicitly.

---

## 1. Product Purpose

A premium personal portfolio for **Muhammad Fajar Ariandi**: designer, developer,
AI creator, and network/IoT engineer. The product serves three commercial ends:

| Goal | Served by |
| --- | --- |
| Personal branding | Hero, About, Skills, Experience |
| Job opportunities | CV page, project case studies, Experience timeline |
| Freelance lead generation | Contact form, WhatsApp quick action, availability indicator |
| Project showcase | Projects explorer + detail pages |
| SEO / inbound reach | Blog, sitemap, structured data, OG cards |

The differentiator is **craft**: an interactive WebGL galaxy hero and Awwwards-level
motion, on a stack that stays fast and is fully manageable through a CMS.

### Personas

- **Recruiters / HR** — scan for role fit in under 30 seconds. Need a printable CV,
  clear role history, and an obvious contact path.
- **Startup founders / agency owners** — evaluating for freelance or full-time hire.
  Led by the work: case studies that state the *problem*, not just the tech.
- **Freelance clients** — want a fast, low-friction first conversation. Served by the
  WhatsApp action with a prefilled message.
- **Developers / designers / AI enthusiasts** — the blog's secondary audience; they
  arrive via search and stay for the writing.

---

## 2. Scope

### In scope (shipped)

- One-page home composition with eight sections; dedicated `/about`, `/projects`,
  `/blog`, `/contact`, and `/cv` routes; dynamic project and article detail pages.
- WebGL galaxy hero (custom GLSL) with pointer parallax and adaptive quality.
- Sanity CMS embedded at `/studio` with full CRUD over every content type.
- A typed fallback content layer that runs the site with **zero** CMS credentials.
- Contact endpoint with validation, rate limiting, honeypot, and optional email.
- SEO surface: sitemap, robots, canonical, Open Graph, Twitter cards, JSON-LD.
- Accessibility and performance tiers (reduced motion, reduced transparency,
  low-power device, off-screen render parking).

### Out of scope (not built — carried to roadmap)

- Visitor analytics dashboard, project analytics.
- Multi-language / i18n.
- AI chatbot assistant, résumé generator, case-study builder.
- Hand-rolled admin authentication — deliberately delegated to Sanity (see §9).
- Full-text search over article bodies (search covers title, excerpt, tags only).

---

## 3. Information Architecture

```
/                        Home — hero + all sections in reading order
/about                   About + Skills + Experience (deep-dive composition)
/projects                Explorer: category tabs, sort, grid
/projects/[slug]         Case study: banner, problem/solution, gallery, tech
/blog                    Explorer: search + category tabs, grid
/blog/[slug]             Article: cover, body, tags, related, CTA
/contact                 Contact form + social hub
/cv                      Printable résumé (print stylesheet → ink on paper)
/studio/[[...index]]     Embedded Sanity Studio (noindex)
/api/contact             POST contact submissions
/sitemap.xml · /robots.txt · /icon.png · /apple-icon.png
```

**Rendering model.** Every page is a React Server Component; client components are
used only where interaction is required (explorers, form, hero, timeline). Detail
pages prerender every slug at build time via `generateStaticParams`.

**Route transitions.** `src/app/template.tsx` wraps every route in
`<PageTransition>` — `template.tsx` re-mounts on navigation, unlike `layout.tsx`,
which is what makes an exit/enter animation possible at all.

---

## 4. Feature Specifications

### 4.1 Hero

Layered, back to front, so the hero is **never blank**:

1. **CSS gradient base** (`radial-gradient`) — painted before any JavaScript.
2. **Nebula plate** — generated artwork (`public/images/hero-nebula.jpg`).
3. **WebGL galaxy** — mounted only after hydration.
4. **Content** — availability pill, subheadline, animated name, description, CTAs.

CTAs: **View Projects** → `/projects` · **Hire Me** → `/contact` ·
**Download CV** → static PDF (a plain anchor, so `next/link` does not prefetch
1.3 MB on every navigation).

The galaxy (`components/hero/GalaxyCanvas.tsx`) is three cooperating layers —
three parallax starfield shells, three fbm-noise nebula planes in the brand triad,
and a sparse dust layer. All additive-blended and depth-write-free, so the layers
stack as light rather than occluding. One shared clock uniform drives every shader.

| Behaviour | Implementation |
| --- | --- |
| Pointer parallax | Damped rotation toward `pointer.x/y`; `delta`-normalised so feel is identical at 60 and 144 Hz |
| Idle camera drift | Sinusoidal `camera.position` offset — the scene is never fully static |
| Twinkle | Per-star phase attribute in the vertex shader |
| Determinism | `mulberry32` seeded per shell — the field does not reshuffle on reload |

**Render-loop states** (`frameloop`):

| State | When | Cost |
| --- | --- | --- |
| `always` | On screen, motion welcome | Full loop |
| `demand` | `prefers-reduced-motion` | One frame, then stops |
| `never` | Scrolled out of view (`useInViewport`, 160px margin) | Nothing |

DPR is capped at 1.8 — beyond that, extra pixels cost far more than they show.

### 4.2 About

Profile image, intro, bio, career summary, and quantified highlights. Content comes
from the `aboutPage` singleton; the page at `/about` composes About + Skills +
Experience for a recruiter who wants depth without scrolling the home page.

### 4.3 Skills

Five CMS-driven categories — **Development, Design, AI, Networking, IoT** — with a
0–100 proficiency level rendered as an animated meter.

> The fill animates `scaleX`, not `width`. Animating `width` re-runs layout on every
> frame, and there are 27 meters on the page — that added up to real scroll cost.
> `scaleX` is compositor-only.

Filtering is client-side over the already-rendered list. All categories are in the
server-rendered DOM regardless, so the content stays indexable.

### 4.4 Projects

| Attribute | Notes |
| --- | --- |
| `title`, `slug` | Slug becomes `/projects/<slug>`; derived from title in the Studio |
| `summary` | ≤220 chars — the card and the meta description |
| `description` | Overview paragraph |
| `problem` / `solution` | The case-study pair, numbered 01/02 on the detail page |
| `thumbnail` | Required, with mandatory alt text |
| `gallery` | Optional screenshot array with captions |
| `category` | One of 7 — see below |
| `techStack` | Free-form tag array |
| `status` | `completed` \| `in-progress` \| `maintained` \| `archived` |
| `liveUrl`, `githubUrl` | Optional; buttons render only when present |
| `featured` | Surfaces on the home page |
| `year`, `order` | `order` controls grid position (ascending) |

**Categories (7):** Web Development, Design, AI Project, Networking, IoT, CCTV,
Starlink. The list is defined **once** in `src/types/content.ts` and imported by
the Sanity schema — adding a category there updates the CMS and the site together.

**Explorer behaviour:** category tabs show only categories that actually contain
work, each with a live count; sort toggles newest/oldest by year. The first card is
promoted to a 2-column span when the grid is unfiltered and has ≥3 items. An
`aria-live` region announces the visible count. Filtering is in-memory — the set is
small, and instant feedback beats a round trip.

### 4.5 Experience

Animated vertical timeline. Two animation systems cooperate, each doing what it is
best at:

- **GSAP ScrollTrigger** scrubs the rail's `scaleY` on the compositor, so the line
  *draws* in lockstep with scroll position.
- **Motion** handles the discrete item reveals — entrance animations, not scrubbed.

GSAP and its plugin are imported dynamically, so they stay out of the initial bundle
for a section the reader may never scroll to. `ScrollTrigger` keeps global listeners;
`gsap.context()` + `revert()` on unmount prevents them leaking across client-side
navigations. The current role carries a "Current" badge and an accented node.

### 4.6 Blog

Articles with category, tags, author, cover, reading time, and related posts.

**Categories (6):** AI, Web Development, Networking, IoT, Career Journey, Technology.

**Explorer behaviour:** search runs over title, excerpt, and tags — *deliberately
not* the body, which would surface results the reader cannot see a reason for in the
card. Empty results offer a "Clear filters" reset.

**Cover art:** each cover is a **procedural SVG composition** derived deterministically
from the post slug, with a motif chosen by category (neural mesh, network topology,
signal waves, career path, stacked layers). Server-rendered, no client JS, no network
requests. This is an intentional visual language, not a placeholder — the same post
always renders the same art.

**Body rendering:** a deliberately small Markdown renderer
(`src/lib/markdown.tsx`) emits **React elements, not an HTML string**. There is no
`dangerouslySetInnerHTML` anywhere in the body, so a post can never inject markup —
which matters because bodies are authored in the CMS by a non-developer. Supported:
h2/h3, paragraphs, ordered/unordered lists, blockquotes, rules, and inline
bold/italic/code/link.

**Detail page:** breadcrumb, category badge, date, reading time, author block, cover,
body, tag list, a freelance CTA, a sticky related-articles sidebar, and a related
grid. Related posts are same-category first, topped up with recent posts so the block
is never partially empty. Emits `BlogPosting` JSON-LD.

### 4.7 Social Hub

Six platforms — GitHub, LinkedIn, Instagram, TikTok, WhatsApp, Email — each with
label, URL, and handle. Email and WhatsApp are excluded from the JSON-LD `sameAs`
(social *profiles* only). The CV page likewise filters to profile links.

### 4.8 Contact

Fields: name, email, subject, message — plus a hidden **honeypot** named `company`.

The contract is defined once in `src/lib/validation.ts` (Zod) and shared by the
client form and the API route, so client-side validation can never drift from what
the server accepts.

| Field | Constraint |
| --- | --- |
| name | 2–80 chars |
| email | valid, ≤160 chars |
| subject | 3–120 chars |
| message | 20–4000 chars |
| company | honeypot — must be empty |

**Endpoint contract** (`POST /api/contact`):

| Response | When |
| --- | --- |
| `200 { ok: true }` | Sent, **or** honeypot tripped (silently accepted and discarded) |
| `422` | Validation failed — returns per-field `errors` map |
| `429` | Rate limit exceeded — includes `Retry-After` |
| `400` | Malformed JSON body |
| `405` | Any non-POST method — includes `Allow: POST` |

**Order of operations matters:** rate limit *before* parsing, validate *before*
sending, and never reveal whether an address exists. The honeypot is checked last
and returns success — telling a bot it was caught only helps it adapt.

**Delivery:** [Resend](https://resend.com) when `RESEND_API_KEY` and
`CONTACT_TO_EMAIL` are set; `reply_to` is the sender, so replying in a mail client
goes straight back. Without credentials the submission is logged to the server
console, so the form works end-to-end in development. A provider outage surfaces an
honest 502 rather than claiming a delivery that did not happen.

**WhatsApp quick action** builds a `wa.me` link with a prefilled message — labelled
"Fastest reply".

### 4.9 CV Page

The "Download CV" CTA points at `/cv`, a real printable page, rather than a stale
binary PDF. On screen it is a branded dark document; when printed, a scoped print
stylesheet strips the dark chrome and lays out clean ink-on-paper for A4/Letter —
because a gradient-bleeding résumé is not what a recruiter wants in a dossier. The
page is `noindex`. A static PDF also remains in `public/` as a fallback target.

### 4.10 Admin Dashboard (Sanity Studio)

Served at `/studio` from the same deployment as the site — no separate hosting, and
authentication is **Sanity's**, not a hand-rolled credential store.

Structure: Site settings and About page are pinned **singletons** (exactly one
document each), so there is no way to create a stray second copy the site would
ambiguously resolve. Projects, Blog posts, Experience, Skills, and Social links are
document lists.

If the Sanity environment variables are absent, the Studio route renders an
**UnconfiguredNotice** naming exactly which variables to set — instead of
half-booting against a nonexistent project and failing inside the browser.

---

## 5. Content Architecture

### The abstraction layer

**Pages and components never touch Sanity directly.** Every getter in
`src/lib/content.ts` tries the Content Lake and falls back to typed seed data when
Sanity is unconfigured *or unreachable*. Return types are identical either way, so
the UI cannot tell the difference. The Sanity client is imported dynamically, so an
unconfigured build never pulls it into the bundle, and a CMS outage degrades to
fallback content rather than a 500.

```
Sanity Content Lake ─┐
                     ├─→ lib/content.ts getters ─→ domain types ─→ components
Typed fallback seed ─┘        (the only path)
```

`src/types/content.ts` is the **single source of truth** for every content shape.
Both the Sanity schemas and the local seed data are written against it, and
components only ever see these types — never a Sanity document.

`sanityConfigured` (in `src/sanity/env.ts`) is the single switch the whole layer
reads. An unconfigured Sanity is a **supported state, not an error** — nothing throws
when variables are missing. The footer exposes `cms live` / `local content` so the
active source is never ambiguous.

### Content model

| Document | Cardinality | Notes |
| --- | --- | --- |
| `siteSettings` | singleton | Identity, headline, SEO fallback, contact details, OG image |
| `aboutPage` | singleton | Heading, intro, bio, profile image, highlights, career summary |
| `project` | many | See §4.4 |
| `post` | many | References `author` |
| `author` | many | Referenced by posts |
| `skill` | many | name, level, category, order |
| `experience` | many | role, company, period, highlights, techStack, `current` |
| `socialLink` | many | platform, label, url, handle, order |

### Seeding

`scripts/seed-sanity.ts` bootstraps the dataset from the typed fallback content. It
is **idempotent**: deterministic `_id`s + `createOrReplace`, and Sanity keys image
asset IDs by content hash, so re-running converges on the same state instead of
duplicating rows. Fields the fallback leaves empty on purpose (blog covers, gallery
shots, the author avatar) are omitted rather than faked — `<MediaFrame>` renders a
procedural gradient for them.

```bash
npm run seed       # apply
npm run seed:dry   # plan only, write nothing
```

> **Operating note:** once documents exist in the dataset, **the fallback files are
> shadowed** — editing `src/content/fallback/*` no longer changes what the site
> serves. Edits must go through the Studio. The seed is a one-time bootstrap, not a
> watch.

### Imagery

`<MediaFrame>` renders real artwork when a `ContentImage` carries a URL, and a
**deterministic procedural gradient** when it does not — derived from a seed string
(usually the slug), so a given card always looks the same. A grid overlay and
vignette give the flat gradient enough structure to read as an intentional surface
rather than a missing asset.

---

## 6. Design System

The palette is fixed in `@theme` in `src/app/globals.css`. The three accents
(blue → cyan → violet) are **always used as a gradient triplet** — that single
device makes every surface read as one product.

| Token | Value | Role |
| --- | --- | --- |
| `base` / `deep` / `elevated` | `#030712` / `#0B1020` / `#111827` | Three surface depths; base is the void |
| `accent-blue` / `cyan` / `violet` | `#60A5FA` / `#22D3EE` / `#8B5CF6` | Gradient triplet |
| `ink` / `soft` / `muted` / `faint` | `#FFFFFF` / `#CBD5E1` / `#94A3B8` / `#64748B` | Text hierarchy |
| `line` / `line-strong` | white 8% / 14% | Hairlines |

**Typography** — three roles, self-hosted through `next/font` (inlined `@font-face`,
size-adjusted fallback metrics, zero layout shift): **Sora** (display, 5 weights),
**Inter** (text), **JetBrains Mono** (mono, 2 weights). Only the weights actually
used — each is a separate download.

**Motion** — one easing curve for the whole site (`--ease-out-expo`), plus a small
set of named ambient keyframes (`drift`, `float`, `shimmer`, `pulse-glow`, `scan`,
`shine`). `--duration` is set per-element by `<ShineBorder>` so one orbit can be
re-timed without redefining keyframes.

**References:** Linear, Vercel, Stripe, Framer, Apple Vision Pro, Awwwards-winning
portfolios. Theme: galaxy / space.

---

## 7. Non-Functional Requirements

### Performance

| Target | Value |
| --- | --- |
| Lighthouse, desktop | 90+ |
| Lighthouse, mobile | 85+ |
| Core Web Vitals | Green |

How it is earned:

- Static / SSG generation for every route; content revalidated every 60s, sitemap
  every 3600s (content changes far more slowly than traffic).
- `next/image` with AVIF + WebP, `sizes` on every image, `priority` only where it
  matters, `blur` placeholders when a preview exists.
- Capped DPR (1.8) and `frameloop: "never"` when the hero is off-screen.
- Dynamic imports for Three.js-adjacent weight, GSAP, and the Sanity client.
- `experimental.optimizePackageImports` for `@react-three/drei`, `motion`, `gsap`.
- `transpilePackages: ["three"]` — three.js ships untranspiled ESM in places.

### Accessibility

- Every ambient animation is opt-out via `prefers-reduced-motion`; the galaxy renders
  a single frame and infinite loops stop entirely.
- `prefers-reduced-transparency` replaces glass blur with a solid surface.
- `useLowPowerDevice` drops the particle budget to roughly a third (narrow screen,
  ≤4 cores, or `Save-Data`).
- Every form input has a real `<label>`; errors are wired through `aria-describedby`
  and announced in a live region.
- Skill meters use `role="meter"` with `aria-valuemin/max/now` and a descriptive
  `aria-label`.
- Explorer results are announced via `role="status"` / `aria-live="polite"`.
- Visible focus styles are never suppressed.
- Interactive tab groups use `role="tablist"` / `role="tab"` / `aria-selected`.

### Security

| Control | Implementation |
| --- | --- |
| Admin authentication | Sanity's own auth — no credentials stored by this app |
| Input validation | Zod schema shared by client and server; server is the actual gate |
| Rate limiting | 5 requests / 60s sliding window per client identifier |
| Bot deterrence | Hidden honeypot field, silently accepted and discarded |
| Secret isolation | Only `NEXT_PUBLIC_*` reaches the client bundle |
| XSS | No `dangerouslySetInnerHTML` on any content path; Markdown renders React elements |
| Crawling surface | `robots.txt` disallows `/studio` and `/api/` |

> **Known limitation:** the rate limiter is in-memory and **per-instance**. On a
> serverless host each cold instance gets its own counter, so it raises the cost of
> abuse rather than preventing it outright. For a hard guarantee, back it with a
> shared store (Upstash Redis, Vercel KV) — the two functions are the whole
> interface, so call sites do not change.

### SEO

- `sitemap.xml` — static routes + every project and post slug, with per-route
  priority and change frequency.
- `robots.txt` — allows `/`, disallows `/studio` and `/api/`, declares the sitemap
  and host.
- Canonical URLs on every page via `alternates.canonical`.
- Open Graph (per-page, `website` / `article`) and Twitter `summary_large_image`.
- JSON-LD: `Person` + `WebSite` site-wide; `BlogPosting` per article. The Studio
  route is excluded from the index and the sitemap.
- Per-page `metadata` with a title template (`%s — Short Name`).

---

## 8. Technology Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript 5.7 — strict |
| Styling | Tailwind CSS v4 (`@theme` tokens), `clsx` + `tailwind-merge` |
| Animation | Motion 12, GSAP 3.12 + ScrollTrigger, Lenis smooth scroll |
| 3D | Three.js 0.173, React Three Fiber 9, Drei 10 — custom GLSL |
| CMS | Sanity 3.75 (`next-sanity` 9.12, `@sanity/client` 8.6) |
| Rich text | `@portabletext/react` + a bespoke Markdown renderer |
| Validation | Zod 3.24 |
| Email | Resend (optional) |
| Deployment | Vercel, Cloudflare DNS |

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `next lint` |
| `npm run seed` / `seed:dry` | Bootstrap Sanity from fallback content |

### Environment variables

No variables are **required**. The site runs on fallback content without them.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | to enable CMS | The single switch the content layer reads |
| `NEXT_PUBLIC_SANITY_DATASET` | — | Defaults to `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | — | Defaults to `2025-01-01` |
| `SANITY_API_READ_TOKEN` | private datasets only | Read access |
| `SANITY_API_WRITE_TOKEN` | seeding only | Used by `scripts/seed-sanity.ts` |
| `NEXT_PUBLIC_SITE_URL` | — | Canonical/OG/JSON-LD; falls back to site settings domain |
| `RESEND_API_KEY` | to send email | Contact delivery |
| `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` | to send email | Delivery addresses |

---

## 9. Divergences from the original PRD

Recorded so the brief and the build can be reconciled:

| PRD says | Built instead | Why |
| --- | --- | --- |
| Admin authentication (hand-rolled) | Sanity's built-in auth at `/studio` | No credential store to secure, no session surface to maintain; the Studio is embedded in the same deployment |
| "Download CV" → a file | `/cv`, a real printable page | A PDF goes stale the moment a project ships; the page is generated from live CMS content |
| Project `description` as the body | Split into `description` + `problem` + `solution` | A case study that states the problem is what founders evaluate on |
| Blog covers as images | Procedural SVG per category | The image budget was exhausted; the covers are a deliberate visual language, deterministic per slug |
| React Three Fiber + Drei | Plus **custom GLSL shaders** for stars and nebula | Drei helpers could not deliver the twinkle / fbm-nebula look at the budget required |
| "Search" (blog) | Search over title, excerpt, tags — not body | Body matches surface results the reader cannot see a reason for in the card |

---

## 10. Roadmap

**Phase 2**
- Project analytics and a visitor dashboard
- Multi-language (i18n)
- Shared-store rate limiting (Upstash Redis / Vercel KV)
- Real screenshots for the galleries still on procedural gradients

**Phase 3**
- AI chatbot assistant
- Résumé generator (derive from `/cv` content)
- Case-study builder

---

## 11. Success Metrics

- Recruiter inquiries and freelance leads via the contact form and WhatsApp
- Portfolio visits; blog traffic and search impressions
- Social follower growth from the hub
- Lighthouse scores held at target across releases
- Time-to-first-contact for a first-time visitor (design goal: one scroll + one click)

---

## 12. Key Files

| Area | Path |
| --- | --- |
| Content abstraction layer | `src/lib/content.ts` |
| Domain types (source of truth) | `src/types/content.ts` |
| GROQ queries | `src/sanity/queries.ts` |
| Sanity schemas | `src/sanity/schemaTypes/*` |
| Studio config | `src/sanity/sanity.config.tsx` |
| Galaxy scene | `src/components/hero/GalaxyCanvas.tsx` |
| Contact endpoint | `src/app/api/contact/route.ts` |
| Validation contract | `src/lib/validation.ts` |
| Rate limiter | `src/lib/rate-limit.ts` |
| Markdown renderer | `src/lib/markdown.tsx` |
| Procedural cover art | `src/components/cards/PostCover.tsx` |
| Image / placeholder | `src/components/ui/MediaFrame.tsx` |
| Capability hooks | `src/hooks/useEnvironment.ts` |
| Seed script | `scripts/seed-sanity.ts` |
| Design tokens | `src/app/globals.css` |
