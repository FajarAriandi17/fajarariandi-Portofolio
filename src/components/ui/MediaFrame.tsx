import Image from "next/image";

import { cn, gradientFor } from "@/lib/utils";
import type { ContentImage } from "@/types/content";

/**
 * Renders real artwork when a `ContentImage` has a URL, and a deterministic
 * procedural gradient when it doesn't.
 *
 * Every fallback project/post in the seed data deliberately has `url: ""`, so
 * until real screenshots exist the grid still reads as a designed surface
 * instead of a row of broken images. Because the gradient is derived from the
 * seed string, a given project always looks the same across the site.
 */
export function MediaFrame({
  image,
  seed,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  overlay = true,
  monogram,
}: {
  image: ContentImage;
  /** Stable string the gradient is derived from — usually the slug. */
  seed: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Adds the darkening + grid treatment used on cards. */
  overlay?: boolean;
  /** Short text shown in the placeholder, e.g. initials. */
  monogram?: string;
}) {
  const hasImage = image.url.length > 0;

  return (
    <div className={cn("relative overflow-hidden bg-deep", className)}>
      {hasImage ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          {...(image.blurDataURL
            ? { placeholder: "blur" as const, blurDataURL: image.blurDataURL }
            : {})}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: gradientFor(seed) }}
        >
          {/* Grid + vignette give the flat gradient some structure so it
              reads as an intentional surface rather than a missing asset. */}
          <div className="absolute inset-0 grid-lines opacity-40" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(120% 90% at 50% 0%, transparent 35%, rgba(3,7,18,0.85) 100%)",
            }}
          />

          {monogram ? (
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-display text-4xl font-bold tracking-tight text-white/25 sm:text-5xl">
                {monogram}
              </span>
            </div>
          ) : null}
        </div>
      )}

      {overlay ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/90 via-base/25 to-transparent"
        />
      ) : null}
    </div>
  );
}
