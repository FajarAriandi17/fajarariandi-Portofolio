import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { getSiteSettings, getSocialLinks } from "@/lib/content";

import "./globals.css";

/* --------------------------------------------------------------------------
   Typography
   Self-hosted through next/font, which inlines the @font-face rules, emits a
   size-adjusted fallback metric, and eliminates the layout shift a <link> to
   Google Fonts would cause. Three roles: display, text, and mono.
   -------------------------------------------------------------------------- */

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
  // Only the weights actually used — each one is a separate file to download.
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

/* --------------------------------------------------------------------------
   Metadata
   -------------------------------------------------------------------------- */

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    `https://${settings.domain}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${settings.name} — ${settings.subheadline}`,
      template: `%s — ${settings.shortName}`,
    },
    description: settings.description,
    keywords: [
      "Muhammad Fajar Ariandi",
      "Fajar Ariandi",
      "web developer Indonesia",
      "IoT engineer",
      "network engineer",
      "AI creator",
      "Next.js developer",
      "portfolio",
    ],
    authors: [{ name: settings.name, url: siteUrl }],
    creator: settings.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: settings.name,
      title: `${settings.name} — ${settings.subheadline}`,
      description: settings.description,
      images: [
        {
          url: settings.ogImage.url,
          width: 1200,
          height: 630,
          alt: settings.ogImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.name} — ${settings.subheadline}`,
      description: settings.description,
      images: [settings.ogImage.url],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    // Sanity Studio is a private authoring surface — keep it out of the index.
    ...(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
      ? {}
      : { category: "technology" }),
  };
}

export const viewport: Viewport = {
  themeColor: "#030712",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/* --------------------------------------------------------------------------
   Layout
   -------------------------------------------------------------------------- */

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [settings, socials] = await Promise.all([
    getSiteSettings(),
    getSocialLinks(),
  ]);

  // Person + WebSite structured data. Helps search engines connect the name,
  // the site, and the social profiles into one entity.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${settings.domain}/#person`,
        name: settings.name,
        alternateName: settings.shortName,
        url: `https://${settings.domain}`,
        email: `mailto:${settings.email}`,
        jobTitle: settings.subheadline,
        description: settings.description,
        knowsAbout: [
          "Web Development",
          "Artificial Intelligence",
          "Computer Networking",
          "Internet of Things",
          "UI/UX Design",
        ],
        sameAs: socials
          .filter((social) => social.platform !== "Email" && social.platform !== "WhatsApp")
          .map((social) => social.url),
      },
      {
        "@type": "WebSite",
        "@id": `${settings.domain}/#website`,
        url: `https://${settings.domain}`,
        name: `${settings.name} — Portfolio`,
        description: settings.description,
        publisher: { "@id": `${settings.domain}/#person` },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="relative min-h-screen antialiased">
        <script
          type="application/ld+json"
          // Serialised from a literal object we control — no user input reaches
          // this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <SmoothScroll />
        <ScrollProgress />
        <Navbar />

        <main id="main">{children}</main>

        <Footer settings={settings} socials={socials} />
      </body>
    </html>
  );
}
