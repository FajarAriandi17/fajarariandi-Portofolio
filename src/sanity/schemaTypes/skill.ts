import { defineField, defineType } from "sanity";

import { SKILL_CATEGORIES } from "./constants";

/** Skill document — flat list, grouped by category on the site. */
export const skill = defineType({
  name: "skill",
  title: "Skill",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: SKILL_CATEGORIES.map((value) => ({ title: value, value })),
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "level",
      title: "Proficiency",
      type: "number",
      description: "0–100. Drives the meter on the site.",
      initialValue: 80,
      validation: (rule) => rule.required().min(0).max(100),
    }),
    defineField({
      name: "order",
      title: "Order within category",
      type: "number",
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: "Category, then order",
      name: "categoryOrder",
      by: [
        { field: "category", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "category", level: "level" },
    prepare: ({ title, subtitle, level }) => ({
      title,
      subtitle: `${subtitle} — ${level ?? 0}%`,
    }),
  },
});

/** Experience entry — one role in the timeline. */
export const experience = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "period",
      title: "Period",
      type: "string",
      description: 'Displayed as-is, e.g. "2022 — 2024" or "2024 — Present".',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "start", title: "Start", type: "string" }),
    defineField({
      name: "end",
      title: "End",
      type: "string",
      description: "Leave blank for a current role.",
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [{ type: "string" }],
      description: "Concrete outcomes, one per line.",
    }),
    defineField({
      name: "techStack",
      title: "Tech / tools",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "current",
      title: "Current role",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first (newest at the top).",
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: "Manual order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "role", subtitle: "company" },
  },
});
