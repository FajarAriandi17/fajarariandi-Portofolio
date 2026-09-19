import type { Project } from "@/types/content";

/**
 * Project seed data covering every category in the PRD.
 *
 * Thumbnails are generated artwork under `/public/images/projects/`, keyed by
 * slug. Gallery shots are left empty on purpose — `<MediaFrame>` renders a
 * deterministic procedural gradient for them, so the detail pages still read as
 * a designed surface rather than a row of missing images.
 */

const shot = (alt: string, url = "") => ({ url, alt, width: 1600, height: 1000 });

/** Thumbnail path is always the slug — one asset per project, predictable. */
const thumb = (slug: string, alt: string) =>
  shot(alt, `/images/projects/${slug}.jpg`);

export const projects: Project[] = [
  {
    title: "IoT Monitoring Dashboard",
    slug: "iot-monitoring-dashboard",
    summary:
      "Realtime dashboard for a national IoT sensor fleet, with alerting and per-site health views.",
    description:
      "A monitoring platform built to make a distributed IoT deployment legible. Devices report over constrained links; the dashboard normalises that stream into per-site health, signal history, and actionable alerts for the operations team.",
    problem:
      "Devices were deployed across many sites with no unified view. Faults were discovered only when a site stopped reporting, and diagnosis meant travelling to location with no prior signal history.",
    solution:
      "Built a time-series ingestion layer with a normalised device model, then a dashboard that surfaces fleet-wide health at a glance and drills into per-device history. Threshold-based alerting warns before a device goes dark, and every alert carries the context needed to decide whether a site visit is warranted.",
    thumbnail: thumb("iot-monitoring-dashboard", "IoT monitoring dashboard interface"),
    gallery: [
      shot("Fleet overview with per-site status"),
      shot("Device detail with signal history"),
      shot("Alert configuration panel"),
    ],
    category: "IoT",
    techStack: ["Next.js", "TypeScript", "MQTT", "PostgreSQL", "Tailwind CSS"],
    status: "in-progress",
    featured: true,
    year: 2025,
    order: 1,
  },
  {
    title: "AI Content Workflow Toolkit",
    slug: "ai-content-workflow-toolkit",
    summary:
      "An internal toolkit that turns a brief into drafted, on-brand content using generative models behind a review step.",
    description:
      "A workflow tool for producing first drafts at volume without losing editorial control. Generative models handle the mechanical work — expansion, reformatting, translation — while every output passes through a human review queue before it can be published.",
    problem:
      "Content production was bottlenecked on repetitive drafting. Off-the-shelf tools produced output that ignored brand voice and offered no review step, so everything had to be rewritten anyway.",
    solution:
      "Encoded brand voice as a structured system prompt with worked examples, then wrapped generation in a staged pipeline: brief → draft → review → publish. Nothing ships unreviewed, and accepted edits feed back as few-shot examples so output improves over time.",
    thumbnail: thumb("ai-content-workflow-toolkit", "AI content workflow interface"),
    gallery: [
      shot("Brief input and generation controls"),
      shot("Review queue with diff view"),
    ],
    category: "AI Project",
    techStack: ["Next.js", "Claude API", "TypeScript", "Vercel"],
    status: "completed",
    featured: true,
    year: 2025,
    order: 2,
  },
  {
    title: "Multi-Site Network Overhaul",
    slug: "multi-site-network-overhaul",
    summary:
      "Redesigned addressing, segmentation, and failover across a distributed site network.",
    description:
      "A ground-up network redesign for an organisation running several sites on ad-hoc infrastructure. The goal was predictability: a documented addressing plan, sensible segmentation, and failover that behaves the way the runbook says it will.",
    problem:
      "Each site had grown its own addressing scheme, with overlapping subnets and undocumented changes. Adding a site or diagnosing an outage was slow and error-prone.",
    solution:
      "Produced a hierarchical addressing plan with room to grow, implemented VLAN segmentation separating management, guest, and device traffic, and configured failover with tested behaviour. Everything was documented as a runbook the on-site team could follow without escalation.",
    thumbnail: thumb("multi-site-network-overhaul", "Network topology diagram"),
    gallery: [shot("Logical topology and VLAN plan"), shot("Failover test results")],
    category: "Networking",
    techStack: ["Mikrotik", "VLAN", "DHCP", "Firewall", "Network Design"],
    status: "completed",
    featured: true,
    year: 2024,
    order: 3,
  },
  {
    title: "CCTV Deployment & Remote Access",
    slug: "cctv-deployment-remote-access",
    summary:
      "Multi-site CCTV installation with secure remote viewing and retention policy.",
    description:
      "Designed and deployed a CCTV system across several locations, with an emphasis on secure remote access rather than simply exposing camera streams to the internet.",
    problem:
      "The organisation needed remote visibility across sites, but the initial approach — port-forwarding cameras directly — was insecure and unreliable.",
    solution:
      "Segmented cameras onto an isolated VLAN with no direct internet exposure, placed recording and access behind a controlled gateway, and set a retention policy matched to actual requirements. Remote viewing works through an authenticated path rather than open ports.",
    thumbnail: thumb("cctv-deployment-remote-access", "CCTV control room interface"),
    gallery: [shot("Camera placement plan"), shot("Storage and retention configuration")],
    category: "CCTV",
    techStack: ["CCTV", "VLAN", "NVR", "Network Security"],
    status: "maintained",
    featured: false,
    year: 2024,
    order: 4,
  },
  {
    title: "Starlink Connectivity for Remote Sites",
    slug: "starlink-remote-connectivity",
    summary:
      "Deployed satellite connectivity to sites beyond the reach of terrestrial fibre.",
    description:
      "Rolled out Starlink connectivity to locations where running fibre was not economically viable, integrating satellite links into the existing network rather than treating them as a separate island.",
    problem:
      "Several operational sites had no viable wired connectivity. Options considered were prohibitively expensive for the traffic they actually needed.",
    solution:
      "Deployed Starlink terminals with proper mounting and obstruction planning, then integrated them into the existing routing and monitoring so they behave like any other WAN link — including failover behaviour and traffic accounting.",
    thumbnail: thumb("starlink-remote-connectivity", "Satellite terminal installation"),
    gallery: [shot("Mounting and obstruction survey"), shot("Link performance over time")],
    category: "Starlink",
    techStack: ["Starlink", "Routing", "Mikrotik", "Monitoring"],
    status: "maintained",
    featured: false,
    year: 2023,
    order: 5,
  },
  {
    title: "Design System for Product Teams",
    slug: "design-system-product-teams",
    summary:
      "A component library and token set that keeps product surfaces visually consistent.",
    description:
      "A design system built to stop drift: tokens for colour, spacing, and type, plus a documented component library with usage guidance. Adopted by the product team as the source of truth for interface work.",
    problem:
      "Product surfaces had diverged — five button styles, inconsistent spacing, and no shared vocabulary. Every new screen re-litigated decisions that should have been settled.",
    solution:
      "Audited existing surfaces, distilled them into a token set, and built accessible components on top. Documented the reasoning, not just the result, so the team could extend the system without breaking it.",
    thumbnail: thumb("design-system-product-teams", "Design system component sheet"),
    gallery: [shot("Colour and type tokens"), shot("Component states")],
    category: "Design",
    techStack: ["Figma", "Design Tokens", "Accessibility"],
    status: "completed",
    featured: false,
    year: 2024,
    order: 6,
  },
  {
    title: "Company Profile & CMS",
    slug: "company-profile-cms",
    summary:
      "Marketing site with a headless CMS so non-technical staff publish without a developer.",
    description:
      "A company profile site where the content team owns the content. Structured content modelling means pages compose from reusable blocks rather than one-off templates.",
    problem:
      "Every content change required a developer, making the site expensive to keep current and slow to respond to campaigns.",
    solution:
      "Modelled content as structured blocks in a headless CMS, then built a front-end that renders any valid combination. The team publishes independently, and the guardrails in the schema keep pages consistent.",
    thumbnail: thumb("company-profile-cms", "Company profile website"),
    gallery: [shot("Homepage layout"), shot("CMS editing experience")],
    category: "Web Development",
    techStack: ["Next.js", "Sanity", "TypeScript", "Tailwind CSS"],
    status: "completed",
    featured: false,
    year: 2024,
    order: 7,
  },
  {
    title: "Network Monitoring & Alerting",
    slug: "network-monitoring-alerting",
    summary:
      "Self-hosted monitoring that catches link degradation before users report it.",
    description:
      "A monitoring stack covering link health, device availability, and latency trends, with alerting routed to the channels the team actually watches.",
    problem:
      "Faults were reported by users rather than detected by the team. By the time a ticket arrived, the outage had usually been running for a while.",
    solution:
      "Deployed polling and availability checks across the estate, baselined normal behaviour, and alerted on deviation rather than fixed thresholds. Escalation routing means the right person is notified at the right hour.",
    thumbnail: thumb("network-monitoring-alerting", "Monitoring dashboard"),
    gallery: [shot("Link health over time"), shot("Alert routing rules")],
    category: "Networking",
    techStack: ["Linux", "Monitoring", "SNMP", "Alerting"],
    status: "maintained",
    featured: false,
    year: 2023,
    order: 8,
  },
  {
    title: "Smart Device Control Interface",
    slug: "smart-device-control-interface",
    summary:
      "A web interface for controlling and scheduling deployed IoT devices.",
    description:
      "An operator-facing interface for managing device state and schedules across a deployment, designed so routine changes do not require touching configuration files.",
    problem:
      "Device control meant editing config and restarting services. Simple scheduling changes carried real risk of breaking a working device.",
    solution:
      "Built an interface over the device control layer with validation and preview before apply, plus a schedule model matching how operators actually think about time ranges.",
    thumbnail: thumb("smart-device-control-interface", "Device control interface"),
    gallery: [shot("Device list and state"), shot("Schedule editor")],
    category: "IoT",
    techStack: ["React", "TypeScript", "REST", "IoT"],
    status: "completed",
    featured: false,
    year: 2025,
    order: 9,
  },
  {
    title: "Brand & Visual Identity",
    slug: "brand-visual-identity",
    summary:
      "Visual identity work spanning logo, palette, and a social media template system.",
    description:
      "Identity design for a small organisation — logo, colour, type, and a template set that keeps social output recognisable without a designer in the loop for every post.",
    problem:
      "Social and print output looked like it came from different organisations. There was no consistent mark, palette, or template.",
    solution:
      "Developed a compact identity: a mark that works from favicon to signage, a restrained palette, and templates for the formats actually used. Handed over with a short usage guide.",
    thumbnail: thumb("brand-visual-identity", "Brand identity board"),
    gallery: [shot("Logo variations"), shot("Social media templates")],
    category: "Design",
    techStack: ["Figma", "Photoshop", "Canva", "Brand Design"],
    status: "completed",
    featured: false,
    year: 2023,
    order: 10,
  },
];
