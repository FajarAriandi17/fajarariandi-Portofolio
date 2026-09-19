"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { Section, SectionHeading } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Typography";
import { EASE_OUT_EXPO } from "@/lib/motion";
import type { Experience } from "@/types/content";

/**
 * Experience timeline.
 *
 * Two animation systems cooperate here, each doing what it's best at:
 *   - GSAP ScrollTrigger scrubs the vertical rail's scaleY directly on the
 *     compositor, so the line "draws" in lockstep with scroll position.
 *   - Motion handles the discrete item reveals, which are entrance animations
 *     rather than scroll-scrubbed ones.
 *
 * Both are torn down on unmount; ScrollTrigger keeps global listeners, so
 * skipping `kill()` here would leak them across client-side navigations.
 */
export function ExperienceSection({ experience }: { experience: Experience[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const container = containerRef.current;
    const rail = railRef.current;
    if (!container || !rail) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    // Loaded dynamically so GSAP and its plugin stay out of the initial bundle
    // for a section that may never be scrolled to.
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          rail,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top center",
            scrollTrigger: {
              trigger: container,
              start: "top 70%",
              end: "bottom 60%",
              scrub: 0.6,
            },
          },
        );
      }, container);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduceMotion]);

  return (
    <Section id="experience">
      <SectionHeading
        eyebrow="Experience"
        title={
          <>
            A path through <span className="text-gradient">the stack</span>
          </>
        }
        description="From field installation to full-stack product work — each role added a layer rather than replacing the last."
      />

      <div ref={containerRef} className="relative mt-14">
        {/* Rail — the full-height track, plus the GSAP-scrubbed overlay. */}
        <div
          aria-hidden
          className="absolute bottom-0 left-[7px] top-2 w-px bg-line sm:left-[9px]"
        />
        <div
          ref={railRef}
          aria-hidden
          className="absolute bottom-0 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-accent-blue via-accent-cyan to-accent-violet sm:left-[9px]"
          style={reduceMotion ? { transform: "scaleY(1)" } : undefined}
        />

        <ol className="space-y-12">
          {experience.map((item, index) => (
            <motion.li
              key={`${item.company}-${item.role}`}
              initial={reduceMotion ? false : { opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.65, delay: index * 0.06, ease: EASE_OUT_EXPO }}
              className="relative pl-10 sm:pl-14"
            >
              {/* Node */}
              <span
                aria-hidden
                className={
                  item.current
                    ? "absolute left-0 top-1.5 grid size-[15px] place-items-center rounded-full border-2 border-accent-cyan bg-base sm:size-[19px]"
                    : "absolute left-0 top-1.5 grid size-[15px] place-items-center rounded-full border border-line-strong bg-deep sm:size-[19px]"
                }
              >
                {item.current ? (
                  <span className="size-1.5 rounded-full bg-accent-cyan" />
                ) : null}
              </span>

              <div className="surface p-6 transition-colors duration-300 hover:border-line-strong">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-accent-cyan">{item.period}</span>
                  {item.current ? <Badge tone="accent">Current</Badge> : null}
                  {item.location ? (
                    <span className="font-mono text-xs text-ink-faint">
                      {item.location}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">
                  {item.role}
                </h3>
                <p className="mt-1 text-sm font-medium text-ink-soft">{item.company}</p>

                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  {item.description}
                </p>

                {item.highlights.length > 0 ? (
                  <ul className="mt-5 space-y-2.5">
                    {item.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="relative pl-5 text-sm leading-relaxed text-ink-muted"
                      >
                        <span
                          aria-hidden
                          className="absolute left-0 top-[0.55em] size-1.5 rounded-full bg-accent-violet/70"
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {item.techStack.length > 0 ? (
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {item.techStack.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-md border border-line bg-white/[0.03] px-2 py-0.5 font-mono text-[0.7rem] text-ink-faint"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
