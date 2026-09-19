/**
 * Sanity environment resolution.
 *
 * `sanityConfigured` is the single switch the whole content layer reads. When it
 * is false the site serves typed fallback content and never touches the network;
 * when true, `src/lib/content.ts` fetches from the Content Lake instead.
 *
 * Nothing here throws when the variables are missing — an unconfigured Sanity
 * is a supported state, not an error.
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2025-01-01";

/** Read-only token. Only needed if the dataset is private. */
export const readToken = process.env.SANITY_API_READ_TOKEN?.trim() ?? "";

export const sanityConfigured = projectId.length > 0;

/** Surfaced in the footer/dev overlay so it's obvious which source is live. */
export const contentSource: "sanity" | "fallback" = sanityConfigured
  ? "sanity"
  : "fallback";
