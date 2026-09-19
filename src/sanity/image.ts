import type { ContentImage } from "@/types/content";

import { dataset, projectId } from "./env";

/**
 * Sanity image asset references arrive as `image-<hash>-<WxH>-<format>`.
 * We build the CDN URL directly rather than pulling in `@sanity/image-url` —
 * the format is stable and this keeps the dependency surface smaller.
 */
export type SanityImageRef = {
  _type?: "image";
  asset?: { _ref?: string; _id?: string } | null;
  alt?: string;
  caption?: string;
} | null;

const REF_PATTERN = /^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/;

/**
 * Normalises a Sanity image document into the site's `ContentImage`.
 * Returns an empty-URL image (which `<MediaFrame>` renders as a procedural
 * gradient) for anything malformed, so a bad CMS value can never crash a page.
 */
export function urlForImage(
  source: SanityImageRef,
  options: { width?: number; quality?: number } = {},
): ContentImage {
  const alt = source?.alt ?? "";
  const ref = source?.asset?._ref ?? "";

  const match = REF_PATTERN.exec(ref);
  if (!match || !projectId) {
    return { url: "", alt };
  }

  const [, hash, dimensions, format] = match;

  const params = new URLSearchParams({ auto: "format" });
  if (options.width) params.set("w", String(options.width));
  if (options.quality) params.set("q", String(options.quality));

  return {
    url: `https://cdn.sanity.io/images/${projectId}/${dataset}/${hash}-${dimensions}.${format}?${params}`,
    alt,
    sanityRef: ref,
  };
}

/** Maps an array of Sanity gallery images, dropping any that fail to resolve. */
export function urlForImages(
  sources: SanityImageRef[] | null | undefined,
  options?: { width?: number; quality?: number },
): ContentImage[] {
  if (!Array.isArray(sources)) return [];
  return sources
    .map((s) => urlForImage(s, options))
    .filter((img) => img.url.length > 0);
}
