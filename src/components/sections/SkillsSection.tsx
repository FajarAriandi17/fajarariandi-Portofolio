"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { Section, SectionHeading } from "@/components/ui/Section";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SkillGroup } from "@/types/content";

/**
 * Skills section.
 *
 * Filtering happens client-side over an already-rendered list — the full skill
 * set is small enough that fetching per category would be slower and would
 * break the layout animation. All five categories are in the DOM payload
 * regardless, so the content is indexable either way.
 */
export function SkillsSection({ groups }: { groups: SkillGroup[] }) {
  const [active, setActive] = useState<string>("All");
  const reduceMotion = useReducedMotion();

  const tabs = ["All", ...groups.map((group) => group.category)];
  const visible =
    active === "All" ? groups : groups.filter((group) => group.category === active);

  return (
    <Section id="skills">
      <SectionHeading
        eyebrow="Capabilities"
        title={
          <>
            Five disciplines, <span className="text-gradient">one toolkit</span>
          </>
        }
        description="Design, code, AI, networking, and IoT. The range is deliberate — it means a project can go from interface to installed hardware without changing hands."
      />

      {/* Category filter */}
      <div
        role="tablist"
        aria-label="Skill categories"
        className="mt-10 flex flex-wrap gap-2"
      >
        {tabs.map((tab) => {
          const isActive = active === tab;
          return (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(tab)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm transition-colors duration-200",
                isActive ? "text-ink" : "text-ink-muted hover:text-ink-soft",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="skill-tab"
                  className="absolute inset-0 rounded-full border border-accent-cyan/30 bg-accent-cyan/10"
                  transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                />
              ) : (
                <span className="absolute inset-0 rounded-full border border-line" />
              )}
              <span className="relative">{tab}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 space-y-10">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((group) => (
            <motion.div
              key={group.category}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            >
              <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                  {group.category}
                </h3>
                <p className="text-sm text-ink-faint sm:max-w-md sm:text-right">
                  {group.blurb}
                </p>
              </div>

              <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.skills.map((skill, index) => (
                  <li key={skill.name}>
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-sm font-medium text-ink-soft">
                        {skill.name}
                      </span>
                      <span className="font-mono text-xs text-ink-faint">
                        {skill.level}%
                      </span>
                    </div>

                    {/* Meter.

                        The fill animates `scaleX`, not `width`. Animating
                        `width` re-runs layout on every frame — the gradient
                        fill is 27 of these on the page, so that added up to a
                        real scroll cost. `scaleX` is compositor-only: the
                        track stays one box and the fill slides over it. */}
                    <div
                      className="h-1 overflow-hidden rounded-full bg-white/[0.06]"
                      role="meter"
                      aria-valuenow={skill.level}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${skill.name} proficiency`}
                    >
                      <motion.div
                        className="h-full origin-left rounded-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-violet will-change-transform"
                        style={{ width: `${skill.level}%` }}
                        initial={reduceMotion ? false : { scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{
                          duration: 0.9,
                          delay: index * 0.05,
                          ease: EASE_OUT_EXPO,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Section>
  );
}
