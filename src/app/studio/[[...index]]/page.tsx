"use client";

import { NextStudio } from "next-sanity/studio";

import config from "@/sanity/sanity.config";
import { sanityConfigured } from "@/sanity/env";

/**
 * Embedded Sanity Studio — the Admin Dashboard from the PRD.
 *
 * Client component: the Studio is a large React app that needs context and
 * browser-only APIs, so it cannot be server-rendered. It is served from the
 * same deployment as the site, and authentication is handled by Sanity rather
 * than a hand-rolled credential store.
 */

export const dynamic = "force-static";
// Cloudflare Pages serves this on the Workers runtime (edge) — required by
// @cloudflare/next-on-pages, which has no Node.js runtime to fall back to.
export const runtime = "edge";

export default function StudioPage() {
  if (!sanityConfigured) {
    return <UnconfiguredNotice />;
  }

  return <NextStudio config={config} />;
}

/**
 * Shown when the Sanity env vars are absent. Rather than letting the Studio
 * boot against a nonexistent project and fail inside the browser, this states
 * exactly which variables to set — the public site keeps running on fallback
 * content either way.
 */
function UnconfiguredNotice() {
  const vars = [
    "NEXT_PUBLIC_SANITY_PROJECT_ID",
    "NEXT_PUBLIC_SANITY_DATASET",
    "SANITY_API_READ_TOKEN (only if the dataset is private)",
  ];

  return (
    <main className="container-page grid min-h-screen place-items-center py-24">
      <div className="surface max-w-xl p-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-cyan">
          Studio
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">
          Sanity is not configured
        </h1>
        <p className="mt-4 leading-relaxed text-ink-muted">
          The site is running on its built-in fallback content and works without
          a CMS. To manage content here, add these variables to{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-sm text-ink-soft">
            .env.local
          </code>
          :
        </p>
        <ul className="mt-6 space-y-2">
          {vars.map((name) => (
            <li
              key={name}
              className="rounded-lg border border-line bg-white/[0.02] px-4 py-2.5 font-mono text-sm text-ink-soft"
            >
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-ink-faint">
          Then restart the dev server. The public site is unaffected — it reads
          the Content Lake only when a project ID is present.
        </p>
      </div>
    </main>
  );
}
