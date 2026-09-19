import Link from "next/link";

import { SocialIcon, socialAriaLabel } from "@/components/ui/SocialIcon";
import { contentSource } from "@/sanity/env";
import type { SiteSettings, SocialLink } from "@/types/content";

const FOOTER_LINKS = [
  {
    heading: "Explore",
    links: [
      { href: "/about", label: "About" },
      { href: "/projects", label: "Projects" },
      { href: "/blog", label: "Blog" },
      // The printable résumé is a real page; without this link it is only
      // reachable by typing the URL, which makes it an orphan.
      { href: "/cv", label: "CV" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/blog?category=Career%20Journey", label: "Career notes" },
      { href: "/projects?category=AI%20Project", label: "AI work" },
    ],
  },
] as const;

export function Footer({
  settings,
  socials,
}: {
  settings: SiteSettings;
  socials: SocialLink[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-line">
      {/* Section glow — a single soft accent bleeding up from the footer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent"
      />

      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-accent-blue via-accent-cyan to-accent-violet">
                <span className="font-display text-sm font-bold text-[#04101f]">FA</span>
              </span>
              <span className="font-display text-sm font-semibold text-ink">
                {settings.shortName}
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted">
              {settings.subheadline}
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialAriaLabel(social.platform, social.handle)}
                    className="grid size-10 place-items-center rounded-full border border-line text-ink-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-cyan/40 hover:text-accent-cyan"
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {FOOTER_LINKS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
                {group.heading}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-faint">
            © {year} {settings.name}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-faint">
            <a
              href={`mailto:${settings.email}`}
              className="transition-colors hover:text-ink-muted"
            >
              {settings.email}
            </a>
            <span aria-hidden className="hidden size-1 rounded-full bg-ink-faint/40 sm:block" />
            <span className="font-mono">
              {settings.domain}
            </span>
            {/* Makes it obvious at a glance whether the CMS is live. */}
            <span
              className="inline-flex items-center gap-1.5 font-mono"
              title={
                contentSource === "sanity"
                  ? "Content is served from Sanity"
                  : "Sanity is not configured — serving built-in content"
              }
            >
              <span
                aria-hidden
                className={
                  contentSource === "sanity"
                    ? "size-1.5 rounded-full bg-emerald-400"
                    : "size-1.5 rounded-full bg-amber-400"
                }
              />
              {contentSource === "sanity" ? "cms live" : "local content"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
