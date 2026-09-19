import type { Education } from "@/types/content";

/**
 * Education history shown on the CV.
 *
 * SEED CONTENT — the résumé PDF in /public is image-only and carries no text
 * layer, so these entries are reconstructed from the career narrative (the
 * bio's "started in networking" path and the modern web stack worked in today)
 * rather than transcribed from a source. Replace them with the real record in
 * Sanity (/studio) or here once the details are to hand — institution names
 * and dates especially.
 *
 * Ordered newest-first by `order`.
 */

export const education: Education[] = [
  {
    institution: "Independent study",
    qualification: "Modern web development & AI tooling",
    period: "2022 — Present",
    start: "2022",
    end: null,
    location: "Indonesia",
    description:
      "Ongoing self-directed study of the production web stack and applied AI tooling, pursued alongside full-time engineering work.",
    highlights: [
      "Shipped production interfaces in TypeScript, React, and Next.js, from component systems to data fetching.",
      "Worked AI tooling into the build process so more attention goes to the parts that need judgement.",
    ],
    order: 1,
  },
  {
    institution: "Vocational high school (SMK)",
    qualification: "Computer & Network Engineering",
    period: "2017 — 2020",
    start: "2017",
    end: "2020",
    location: "Indonesia",
    description:
      "Foundational training in computer systems, cabling, routing, and switching — the direct lead-in to field network engineering.",
    highlights: [
      "Practical lab work in router and switch configuration, structured cabling, and LAN administration.",
      "Field practice that carried straight into the first full-time technician roles.",
    ],
    order: 2,
  },
];
