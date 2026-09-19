"use client";

import { PostCard } from "@/components/cards/PostCard";
import { ButtonLink } from "@/components/ui/Button";
import { StaggerGroup } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { Post } from "@/types/content";

/** Latest writing, three up on desktop. */
export function BlogSection({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <Section id="blog">
      <SectionHeading
        eyebrow="Writing"
        title={
          <>
            Notes on <span className="text-gradient">building things</span>
          </>
        }
        description="Working notes on AI tooling, web development, networking, and IoT — written for people doing the work."
        action={
          <ButtonLink href="/blog" variant="outline" size="md">
            All articles
          </ButtonLink>
        }
      />

      <StaggerGroup
        stagger={0.1}
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {posts.slice(0, 3).map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </StaggerGroup>
    </Section>
  );
}
