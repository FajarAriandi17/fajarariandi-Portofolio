import type { ReactNode } from "react";

import { AnimatedText } from "@/components/ui/AnimatedText";
import { Eyebrow } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

/**
 * Section header. Used at the top of every major block so headings, eyebrows,
 * and the trailing link sit in the same place throughout the site.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  as = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Trailing element, typically a "view all" link. */
  action?: ReactNode;
  align?: "left" | "center";
  /** Heading level. Defaults to h2; a page's primary heading should pass h1 so
   * the document outline starts at level one (axe `page-has-heading-one`). */
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const centred = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        centred ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centred && "mx-auto")}>
        {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}

        <AnimatedText
          as={as}
          className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          {title}
        </AnimatedText>

        {description ? (
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Consistent vertical rhythm between top-level sections. */
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("cv-auto scroll-mt-24 py-20 sm:py-28", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}
