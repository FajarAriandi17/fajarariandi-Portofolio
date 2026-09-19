import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { projectId, dataset, apiVersion } from "./env";
import { education } from "./schemaTypes/education";
import { author, post } from "./schemaTypes/post";
import { project } from "./schemaTypes/project";
import { aboutPage, siteSettings, socialLink } from "./schemaTypes/site";
import { experience, skill } from "./schemaTypes/skill";

/**
 * Sanity Studio configuration.
 *
 * Serves the Admin Dashboard requirement in the PRD. The Studio is embedded at
 * `/studio` (see `src/app/studio`), so content management lives inside the same
 * deployment as the site — no separate hosting, and it inherits Sanity's auth
 * rather than a hand-rolled password gate.
 *
 * `projectId` is empty when Sanity is unconfigured; the Studio route refuses to
 * render in that state instead of half-booting against a nonexistent project.
 */

export default defineConfig({
  name: "fajarariandi-portfolio",
  title: "Fajar Ariandi — Portfolio",
  projectId,
  dataset,
  apiVersion,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // Singletons are pinned: exactly one document, no way to create a
            // stray second copy that the site would then ambiguously resolve.
            S.listItem()
              .title("Site settings")
              .icon(IconGear)
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings"),
              ),
            S.listItem()
              .title("About page")
              .icon(IconUser)
              .child(
                S.document().schemaType("aboutPage").documentId("aboutPage"),
              ),
            S.divider(),
            S.documentTypeListItem("project").title("Projects"),
            S.documentTypeListItem("post").title("Blog posts"),
            S.documentTypeListItem("experience").title("Experience"),
            S.documentTypeListItem("education").title("Education"),
            S.documentTypeListItem("skill").title("Skills"),
            S.documentTypeListItem("socialLink").title("Social links"),
          ]),
    }),
  ],
  schema: {
    types: [siteSettings, aboutPage, socialLink, project, post, author, skill, experience, education],
  },
});

/* Minimal inline glyphs — keeps the desk readable without an icon dependency. */
function IconGear() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.6M12 18.9v2.6M4.3 4.3l1.8 1.8M17.9 17.9l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.3 19.7l1.8-1.8M17.9 6.1l1.8-1.8" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.6 20.5c.9-3.6 3.9-5.6 7.4-5.6s6.5 2 7.4 5.6" />
    </svg>
  );
}
