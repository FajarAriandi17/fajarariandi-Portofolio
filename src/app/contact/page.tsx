import type { Metadata } from "next";

import { ContactSection } from "@/components/sections/ContactSection";
import { SocialSection } from "@/components/sections/SocialSection";
import { getSiteSettings, getSocialLinks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Muhammad Fajar Ariandi about full-time roles, freelance projects, or technical collaboration.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Muhammad Fajar Ariandi",
    description: "Available for full-time roles and freelance projects.",
    url: "/contact",
  },
};

export default async function ContactPage() {
  const [settings, socials] = await Promise.all([
    getSiteSettings(),
    getSocialLinks(),
  ]);

  return (
    <div className="relative pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(90% 60% at 50% -10%, rgba(34,211,238,0.15) 0%, transparent 65%)",
        }}
      />

      <div className="relative">
        <ContactSection settings={settings} headingLevel="h1" />
        <div className="container-page" aria-hidden>
          <div className="rule-fade" />
        </div>
        <SocialSection socials={socials} />
      </div>
    </div>
  );
}
