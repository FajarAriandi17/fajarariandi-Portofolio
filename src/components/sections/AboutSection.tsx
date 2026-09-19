"use client";

import { motion, useReducedMotion } from "motion/react";

import { MediaFrame } from "@/components/ui/MediaFrame";
import { Parallax } from "@/components/ui/Parallax";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Typography";
import { fadeUp } from "@/lib/motion";
import type { AboutPage, SiteSettings } from "@/types/content";

/**
 * About section — portrait, narrative, and the headline stats.
 */
export function AboutSection({
  about,
  settings,
  headingLevel = "h2",
}: {
  about: AboutPage;
  settings: SiteSettings;
  /** h1 on /about where this is the page title; the Home page already has the
   * hero's h1, so it stays h2 there. */
  headingLevel?: "h1" | "h2";
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="about">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Portrait */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="relative">
            {/* Gradient frame glow behind the portrait. Drifts on scroll —
                decoration only, so the movement is a cheap transform. */}
            <Parallax
              distance={18}
              className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-accent-blue/25 via-accent-cyan/15 to-accent-violet/25 opacity-60 blur-2xl"
            />
            <MediaFrame
              image={about.profileImage}
              seed="fajar-portrait"
              className="relative aspect-[4/5] rounded-2xl border border-line"
              sizes="(max-width: 1024px) 100vw, 40vw"
              overlay={false}
              monogram="FA"
            />
          </div>

          {/* Location + availability chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="glass rounded-full px-3 py-1.5 font-mono text-xs text-ink-muted">
              {settings.location}
            </span>
            <span className="glass rounded-full px-3 py-1.5 font-mono text-xs text-ink-muted">
              Remote friendly
            </span>
          </div>
        </motion.div>

        {/* Narrative */}
        <div>
          <SectionHeading
            as={headingLevel}
            eyebrow="About"
            title={about.heading}
            className="mb-8"
          />

          <p className="text-lg leading-relaxed text-ink-soft">{about.intro}</p>

          <div className="mt-6 space-y-5">
            {about.bio.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="leading-[1.8] text-ink-muted"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <StaggerGroup className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {about.highlights.map((item) => (
              <StaggerItem key={item.label} variants={fadeUp} className="bg-deep/80 p-5">
                <div className="font-display text-3xl font-bold tracking-tight text-gradient">
                  {item.value}
                </div>
                <div className="mt-1 text-xs text-ink-faint">{item.label}</div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <p className="mt-8 border-l-2 border-accent-violet/50 pl-5 text-sm italic leading-relaxed text-ink-muted">
            {about.careerSummary}
          </p>

          <Eyebrow className="mt-8">Currently — {settings.availability}</Eyebrow>
        </div>
      </div>
    </Section>
  );
}
