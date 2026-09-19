import { defineField, defineType } from "sanity";

/**
 * Education entry — one row of the Education section on the CV.
 *
 * Kept deliberately parallel to the `experience` schema: the CV renders both
 * with the same layout, so the field shapes mirror each other.
 */
export const education = defineType({
  name: "education",
  title: "Education",
  type: "document",
  fields: [
    defineField({
      name: "institution",
      title: "Institution",
      type: "string",
      description: 'e.g. "Vocational high school (SMK)" or a university name.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "qualification",
      title: "Qualification / field",
      type: "string",
      description: 'e.g. "Computer & Network Engineering".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "period",
      title: "Period",
      type: "string",
      description: 'Displayed as-is, e.g. "2017 — 2020" or "2022 — Present".',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "start", title: "Start", type: "string" }),
    defineField({
      name: "end",
      title: "End",
      type: "string",
      description: "Leave blank for ongoing study.",
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
      description: "Concrete details, one per line.",
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
    select: { title: "qualification", subtitle: "institution" },
  },
});
