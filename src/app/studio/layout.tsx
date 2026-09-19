import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Studio layout — a server component so the route can still export metadata,
 * while the page itself is a client component (the Studio needs React context
 * and browser APIs that do not exist during server rendering).
 *
 * The Studio is the Admin Dashboard from the PRD. It is deliberately excluded
 * from the index and the sitemap.
 */
export const metadata: Metadata = {
  title: "Studio — Fajar Ariandi",
  description: "Content management for fajarariandi.com",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="studio-root">{children}</div>;
}
