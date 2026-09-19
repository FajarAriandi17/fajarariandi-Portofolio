import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/cards/PostCard";
import { PostCover } from "@/components/cards/PostCover";
import { ButtonLink } from "@/components/ui/Button";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { StaggerGroup } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Typography";
import { getPost, getPostSlugs, getRelatedPosts, getSiteSettings } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Article not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      tags: post.tags,
      ...(post.cover?.url ? { images: [post.cover.url] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const [related, settings] = await Promise.all([
    getRelatedPosts(slug, 3),
    getSiteSettings(),
  ]);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    author: {
      "@type": "Person",
      name: post.author.name,
      url: `https://${settings.domain}`,
    },
    publisher: {
      "@type": "Person",
      name: settings.name,
      url: `https://${settings.domain}`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://${settings.domain}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    ...(post.cover?.url ? { image: post.cover.url } : {}),
  };

  return (
    <article className="relative pb-24 pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(80% 55% at 50% -15%, rgba(139,92,246,0.18) 0%, transparent 65%)",
        }}
      />

      <div className="container-page relative">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 font-mono text-xs text-ink-faint">
            <li>
              <Link href="/blog" className="transition-colors hover:text-ink-muted">
                Blog
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="truncate text-ink-muted" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        <header className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{post.category}</Badge>
            <time dateTime={post.publishedAt} className="font-mono text-xs text-ink-faint">
              {formatDate(post.publishedAt)}
            </time>
            <span aria-hidden className="size-1 rounded-full bg-ink-faint/50" />
            <span className="font-mono text-xs text-ink-faint">
              {post.readingMinutes} min read
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            {post.title}
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-ink-muted">{post.excerpt}</p>

          <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
            <MediaFrame
              image={post.author.avatar ?? { url: "", alt: post.author.name }}
              seed={post.author.name}
              className="size-11 shrink-0 rounded-full border border-line"
              sizes="44px"
              overlay={false}
            />
            <div>
              <p className="text-sm font-medium text-ink">{post.author.name}</p>
              <p className="text-xs text-ink-faint">{post.author.role}</p>
            </div>
          </div>
        </header>

        <PostCover
          post={post}
          className="mt-12 aspect-[16/9] rounded-2xl border border-line"
          priority
        />

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-20">
          {/* Body */}
          <div className="max-w-3xl">
            <div className="text-[1.0625rem]">{renderMarkdown(post.body)}</div>

            {post.tags.length > 0 ? (
              <ul className="mt-14 flex flex-wrap gap-2 border-t border-line pt-8">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`/blog?category=${encodeURIComponent(post.category)}`}>
                      <Badge>#{tag}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="surface mt-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-ink">
                  Working on something like this?
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  I&apos;m available for freelance projects and full-time roles.
                </p>
              </div>
              <ButtonLink href="/contact" className="shrink-0">
                Get in touch
              </ButtonLink>
            </div>
          </div>

          {/* Sidebar */}
          {related.length > 0 ? (
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
                Keep reading
              </h2>
              <div className="mt-4">
                {related.map((item) => (
                  <PostCard key={item.slug} post={item} compact />
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="container-page mt-28">
          <div className="rule-fade mb-14" />
          <h2 className="font-display text-2xl font-semibold text-ink">Related articles</h2>
          <StaggerGroup stagger={0.08} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.slug} post={item} />
            ))}
          </StaggerGroup>
        </section>
      ) : null}
    </article>
  );
}
