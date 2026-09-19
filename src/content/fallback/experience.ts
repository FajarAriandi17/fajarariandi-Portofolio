import type { Experience } from "@/types/content";

/**
 * Career timeline, derived from the roles named in the PRD.
 * Ordered newest-first by `order`.
 */

export const experience: Experience[] = [
  {
    role: "IoT & Network Engineer",
    company: "Project IoT BGN — PERURI",
    period: "2024 — Present",
    start: "2024",
    end: null,
    location: "Indonesia",
    description:
      "Deployed and configured IoT device networks for a national-scale monitoring programme, working alongside PERURI as the delivery partner.",
    highlights: [
      "Configured and commissioned IoT device fleets across multiple sites, including sensor calibration and gateway provisioning.",
      "Built the network layer — addressing, DHCP scoping, and segmented access — so devices report reliably over constrained links.",
      "Documented deployment procedures that reduced on-site setup time for subsequent batches.",
    ],
    techStack: ["IoT", "Mikrotik", "DHCP", "Linux", "Network Design"],
    current: true,
    order: 1,
  },
  {
    role: "Network & Infrastructure Technician",
    company: "PT Fiber Star",
    period: "2022 — 2024",
    start: "2022",
    end: "2024",
    location: "Indonesia",
    description:
      "Installed, configured, and maintained fibre and wireless connectivity for residential and business customers.",
    highlights: [
      "Configured routers, switches, and access points — including Mikrotik routing, NAT, and firewall rules.",
      "Diagnosed connectivity faults end-to-end, from physical layer through to customer premises equipment.",
      "Deployed CCTV and Starlink installations in locations without reliable terrestrial coverage.",
    ],
    techStack: ["Mikrotik", "Fibre", "Starlink", "CCTV", "Router Configuration"],
    current: false,
    order: 2,
  },
  {
    role: "IT Support & Deployment",
    company: "PT Darun Raynor Istafajar",
    period: "2021 — 2022",
    start: "2021",
    end: "2022",
    location: "Indonesia",
    description:
      "Handled Windows deployment, endpoint configuration, and day-to-day IT support across the organisation.",
    highlights: [
      "Standardised Windows deployment images, cutting per-machine setup time significantly.",
      "Maintained local network services including file sharing, printing, and DHCP.",
      "Provided first-line support and hardware troubleshooting for staff endpoints.",
    ],
    techStack: ["Windows Deployment", "DHCP", "Hardware", "IT Support"],
    current: false,
    order: 3,
  },
  {
    role: "Operations Staff",
    company: "J&T Express",
    period: "2020 — 2021",
    start: "2020",
    end: "2021",
    location: "Indonesia",
    description:
      "Logistics operations role — where the discipline around process, accuracy, and working under volume pressure started.",
    highlights: [
      "Handled high-volume parcel processing with a focus on accuracy and turnaround time.",
      "Coordinated with couriers and sorting teams to resolve exceptions in the delivery pipeline.",
    ],
    techStack: ["Operations", "Logistics", "Process"],
    current: false,
    order: 4,
  },
];
