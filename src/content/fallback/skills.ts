import type { Skill, SkillGroup } from "@/types/content";

/**
 * Skill seed data, matching the five categories in the PRD.
 * `level` is a self-assessed 0–100 driving the proficiency meter.
 */

export const skills: Skill[] = [
  // --- Development -------------------------------------------------------
  { name: "HTML", level: 95, category: "Development", order: 1 },
  { name: "CSS", level: 92, category: "Development", order: 2 },
  { name: "JavaScript", level: 90, category: "Development", order: 3 },
  { name: "TypeScript", level: 84, category: "Development", order: 4 },
  { name: "React", level: 86, category: "Development", order: 5 },
  { name: "Next.js", level: 82, category: "Development", order: 6 },
  { name: "Python", level: 75, category: "Development", order: 7 },

  // --- Design ------------------------------------------------------------
  { name: "Figma", level: 88, category: "Design", order: 1 },
  { name: "Photoshop", level: 85, category: "Design", order: 2 },
  { name: "Canva", level: 92, category: "Design", order: 3 },
  { name: "Lightroom", level: 80, category: "Design", order: 4 },
  { name: "CapCut", level: 86, category: "Design", order: 5 },

  // --- AI ----------------------------------------------------------------
  { name: "Claude", level: 90, category: "AI", order: 1 },
  { name: "ChatGPT", level: 90, category: "AI", order: 2 },
  { name: "Midjourney", level: 82, category: "AI", order: 3 },
  { name: "Leonardo AI", level: 80, category: "AI", order: 4 },
  { name: "Veo", level: 74, category: "AI", order: 5 },

  // --- Networking --------------------------------------------------------
  { name: "Mikrotik", level: 90, category: "Networking", order: 1 },
  { name: "Router Configuration", level: 92, category: "Networking", order: 2 },
  { name: "DHCP", level: 88, category: "Networking", order: 3 },
  { name: "Linux", level: 82, category: "Networking", order: 4 },
  { name: "Windows Deployment", level: 85, category: "Networking", order: 5 },
  { name: "CCTV", level: 86, category: "Networking", order: 6 },
  { name: "Starlink", level: 84, category: "Networking", order: 7 },

  // --- IoT ---------------------------------------------------------------
  { name: "Device Configuration", level: 86, category: "IoT", order: 1 },
  { name: "Network Deployment", level: 88, category: "IoT", order: 2 },
  { name: "Hardware Installation", level: 84, category: "IoT", order: 3 },
];

const BLURBS: Record<SkillGroup["category"], string> = {
  Development:
    "Building for the web — from semantic markup to typed, component-driven applications.",
  Design:
    "Interface, brand, and media work. The layer where a product becomes legible.",
  AI: "Using generative tooling as part of the craft, not as a novelty.",
  Networking:
    "Designing and operating the infrastructure that keeps everything reachable.",
  IoT: "Sensors, devices, and the physical deployment work that makes them real.",
};

/**
 * Groups a flat skill list by category, preserving each category's declared
 * order. Shared by both the Sanity and fallback paths so the Skills section
 * renders identically either way.
 */
export function groupSkills(skills: Skill[]): SkillGroup[] {
  const order: SkillGroup["category"][] = [
    "Development",
    "Design",
    "AI",
    "Networking",
    "IoT",
  ];

  return order
    .map((category) => ({
      category,
      blurb: BLURBS[category],
      skills: skills
        .filter((s) => s.category === category)
        .sort((a, b) => a.order - b.order),
    }))
    .filter((group) => group.skills.length > 0);
}
