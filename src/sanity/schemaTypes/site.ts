import { defineField, defineType } from "sanity";

import { SOCIAL_PLATFORMS } from "./constants";

/**
 * Site settings — a singleton. The desk structure pins it to a single editable
 * document so there is no way to accidentally create a second one and have the
 * site pick the wrong copy.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Full name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortName",
      title: "Short name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "domain",
      title: "Domain",
      type: "string",
      initialValue: "fajarariandi.com",
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subheadline",
      title: "Subheadline",
      type: "string",
      description: 'e.g. "Designer. Developer. AI Creator."',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Site description",
      type: "text",
      rows: 3,
      description: "Used for SEO metadata and the hero paragraph.",
      validation: (rule) => rule.required().max(320),
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      initialValue: "Open to full-time roles and freelance projects",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "whatsapp",
      title: "WhatsApp number",
      type: "string",
      description: "Digits only, international format without +. e.g. 6281234567890",
      validation: (rule) => rule.required().regex(/^\d{8,15}$/, {
        name: "digits only",
      }),
    }),
    defineField({
      name: "resumeUrl",
      title: "Résumé / CV URL",
      type: "string",
      description: "Path to a PDF in /public, or a full URL.",
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description: "1200×630. Shown when the site is shared.",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
    }),
  ],
  preview: { select: { title: "name", subtitle: "subheadline" } },
});

/** About page — a singleton. */
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      description: "The lead sentence, shown in larger type.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Bio paragraphs",
      type: "array",
      of: [{ type: "text", rows: 4 }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "profileImage",
      title: "Profile image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
    }),
    defineField({
      name: "highlights",
      title: "Headline stats",
      type: "array",
      of: [
        {
          type: "object",
          name: "highlight",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "careerSummary",
      title: "Career summary",
      type: "text",
      rows: 3,
      description: "The pull-quote at the end of the About section.",
    }),
  ],
  preview: { select: { title: "heading" } },
});

/** Social link — one row per platform in the social hub. */
export const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "document",
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: { list: [...SOCIAL_PLATFORMS] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["http", "https", "mailto"] }),
    }),
    defineField({ name: "handle", title: "Handle", type: "string" }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 99,
    }),
  ],
  orderings: [
    { title: "Manual order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "label", subtitle: "handle" } },
});
