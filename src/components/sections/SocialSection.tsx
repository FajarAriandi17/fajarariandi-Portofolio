"use client";

import { motion } from "motion/react";

import { SocialIcon, socialAriaLabel } from "@/components/ui/SocialIcon";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { fadeUp } from "@/lib/motion";
import type { SocialLink } from "@/types/content";

/**
 * Social hub — every place Fajar can be reached, in one grid.
 */
export function SocialSection({ socials }: { socials: SocialLink[] }) {
  return (
    <Section id="connect">
      <SectionHeading
        eyebrow="Elsewhere"
        title={
          <>
            Find me <span className="text-gradient">across the internet</span>
          </>
        }
        description="Code, work, and the occasional build log."
        align="center"
      />

      <StaggerGroup
        stagger={0.06}
        className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {socials.map((social) => (
          <StaggerItem key={social.platform} variants={fadeUp}>
            <motion.a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialAriaLabel(social.platform, social.handle)}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="surface group flex items-center gap-4 p-5 transition-colors duration-300 hover:border-accent-cyan/30"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.03] text-ink-muted transition-colors duration-300 group-hover:border-accent-cyan/40 group-hover:text-accent-cyan">
                <SocialIcon platform={social.platform} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">
                  {social.label}
                </span>
                {social.handle ? (
                  <span className="block truncate font-mono text-xs text-ink-faint">
                    {social.handle}
                  </span>
                ) : null}
              </span>

              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="size-4 shrink-0 text-ink-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent-cyan"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 11 11 5M6 5h5v5" />
              </svg>
            </motion.a>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </Section>
  );
}
