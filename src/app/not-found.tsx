import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { GradientText } from "@/components/ui/Typography";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80svh] items-center pt-32 pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(70% 50% at 50% 20%, rgba(139,92,246,0.16) 0%, transparent 65%)",
        }}
      />

      <div className="container-page relative">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-ink-faint">
          Error 404
        </p>

        <h1 className="mt-6 text-6xl font-bold tracking-tight sm:text-8xl">
          <GradientText>Lost in space</GradientText>
        </h1>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-muted">
          This page has drifted out of orbit. The link may be outdated, or the
          page may have moved somewhere else in the galaxy.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/" size="lg">
            Back to home
          </ButtonLink>
          <ButtonLink href="/projects" size="lg" variant="outline">
            Browse projects
          </ButtonLink>
        </div>

        <p className="mt-10 text-sm text-ink-faint">
          Looking for something specific?{" "}
          <Link
            href="/contact"
            className="text-accent-cyan underline decoration-accent-cyan/30 underline-offset-4 hover:decoration-accent-cyan"
          >
            Get in touch
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
