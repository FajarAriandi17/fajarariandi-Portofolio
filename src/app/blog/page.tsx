import type { Metadata } from "next";

import { BlogExplorer } from "@/components/sections/BlogExplorer";
import { SectionHeading } from "@/components/ui/Section";
import { getPosts } from "@/lib/content";

// Cloudflare Pages serves this on the Workers runtime (edge) — required by
// @cloudflare/next-on-pages, which has no Node.js runtime to fall back to.
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Working notes on AI tooling, web development, networking, IoT, and the career path between them.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Muhammad Fajar Ariandi",
    description:
      "Notes on AI, web development, networking, IoT, and building a career across them.",
    url: "/blog",
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, posts] = await Promise.all([searchParams, getPosts()]);

  return (
    <div className="relative pt-36 pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(90% 60% at 50% -10%, rgba(34,211,238,0.14) 0%, transparent 65%)",
        }}
      />

      <div className="container-page relative">
        <SectionHeading
          as="h1"
          eyebrow="Writing"
          title={
            <>
              Notes from <span className="text-gradient">the work</span>
            </>
          }
          description="Practical writing on AI tooling, web development, networking, and IoT — the things I'd want to have read before starting."
        />

        <BlogExplorer posts={posts} initialCategory={category ?? "All"} />
      </div>
    </div>
  );
}
