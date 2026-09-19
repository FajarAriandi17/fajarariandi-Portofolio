import type { ReactElement } from "react";

import { MediaFrame } from "@/components/ui/MediaFrame";
import { cn } from "@/lib/utils";
import type { Post, PostCategory } from "@/types/content";

/**
 * Blog cover art, generated rather than photographed.
 *
 * With the image budget spent, the blog gets its own visual language instead of
 * recycling the project screenshots or falling back to the generic procedural
 * gradient. Each cover is an SVG composition derived deterministically from the
 * post slug, with a motif chosen by category — so an AI piece, a networking
 * piece, and an IoT piece each get artwork that means something, and the same
 * post always renders the same art.
 *
 * Server-rendered, no client JS, no network requests.
 */

/* --------------------------------------------------------------------------
   Deterministic randomness — same slug ⇒ same art, on every render.
   -------------------------------------------------------------------------- */

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* --------------------------------------------------------------------------
   Palette
   -------------------------------------------------------------------------- */

const INK = {
  blue: "#60A5FA",
  cyan: "#22D3EE",
  violet: "#8B5CF6",
};

/* A category is carried by one accent, so a grid of covers still reads as
   related: the triplet is constant, only the lead colour changes. */
const ACCENT: Record<PostCategory, string> = {
  AI: INK.violet,
  Networking: INK.cyan,
  IoT: INK.blue,
  "Career Journey": INK.blue,
  "Web Development": INK.cyan,
  Technology: INK.violet,
};

/* --------------------------------------------------------------------------
   Motifs — one per category
   -------------------------------------------------------------------------- */

type MotifProps = {
  rng: () => number;
  accent: string;
};

/** AI — a small neural graph: nodes linked to their nearest neighbours. */
function NeuralMotif({ rng, accent }: MotifProps) {
  const nodes = Array.from({ length: 17 }, () => ({
    x: 1080 + rng() * 400,
    y: 130 + rng() * 640,
  }));

  const links: { a: number; b: number }[] = [];
  nodes.forEach((node, i) => {
    let nearest = -1;
    let best = Infinity;
    nodes.forEach((other, j) => {
      if (i === j) return;
      const d = (node.x - other.x) ** 2 + (node.y - other.y) ** 2;
      if (d < best) {
        best = d;
        nearest = j;
      }
    });
    if (nearest > -1) links.push({ a: i, b: nearest });
  });

  return (
    <g>
      {links.map((link, i) => (
        <line
          key={i}
          x1={nodes[link.a].x}
          y1={nodes[link.a].y}
          x2={nodes[link.b].x}
          y2={nodes[link.b].y}
          stroke={accent}
          strokeWidth={0.8}
          opacity={0.22}
        />
      ))}
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={i % 5 === 0 ? 6 : 2.6}
          fill={i % 5 === 0 ? accent : "#cbd5e1"}
          opacity={i % 5 === 0 ? 0.95 : 0.4}
        />
      ))}
    </g>
  );
}

/** Networking — nodes around an ellipse, linked into a mesh. */
function MeshMotif({ rng, accent }: MotifProps) {
  const count = 15;
  const cx = 1290;
  const cy = 450;
  const rx = 200;
  const ry = 250;

  const nodes = Array.from({ length: count }, (_, i) => {
    const theta = (i / count) * Math.PI * 2 + rng() * 0.28;
    const wobble = 0.82 + rng() * 0.32;
    return {
      x: cx + Math.cos(theta) * rx * wobble,
      y: cy + Math.sin(theta) * ry * wobble,
    };
  });

  const links: { a: number; b: number }[] = [];
  for (let i = 0; i < count; i++) {
    links.push({ a: i, b: (i + 1) % count });
    links.push({ a: i, b: (i + 5) % count });
    if (i % 3 === 0) links.push({ a: i, b: (i + 9) % count });
  }

  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={accent}
        strokeWidth={1}
        opacity={0.14}
      />
      {links.map((link, i) => (
        <line
          key={i}
          x1={nodes[link.a].x}
          y1={nodes[link.a].y}
          x2={nodes[link.b].x}
          y2={nodes[link.b].y}
          stroke={accent}
          strokeWidth={0.7}
          opacity={0.18}
        />
      ))}
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={i % 4 === 0 ? 5 : 2.4}
          fill={i % 4 === 0 ? accent : "#94a3b8"}
          opacity={i % 4 === 0 ? 0.9 : 0.45}
        />
      ))}
    </g>
  );
}

/** IoT — signal waves radiating from a device. */
function SignalMotif({ accent }: MotifProps) {
  const cx = 1290;
  const cy = 450;

  return (
    <g>
      {[0, 1, 2, 3, 4].map((ring) => (
        <circle
          key={ring}
          cx={cx}
          cy={cy}
          r={52 + ring * 62}
          fill="none"
          stroke={ring % 2 === 0 ? accent : INK.violet}
          strokeWidth={ring === 0 ? 2 : 1}
          opacity={0.55 - ring * 0.1}
        />
      ))}
      {/* The device itself. */}
      <rect
        x={cx - 20}
        y={cy - 26}
        width={40}
        height={52}
        rx={6}
        fill="#111827"
        stroke={accent}
        strokeWidth={1.5}
      />
      <circle cx={cx} cy={cy} r={4} fill={accent} />
      <circle cx={cx} cy={cy} r={12} fill="none" stroke={accent} strokeWidth={1} opacity={0.5} />
    </g>
  );
}

/** Career journey — an ascending path with milestones. */
function PathMotif({ rng, accent }: MotifProps) {
  const steps = 6;
  const points = Array.from({ length: steps }, (_, i) => ({
    x: 1030 + i * 92 + (rng() - 0.5) * 26,
    y: 660 - i * 92 - (rng() - 0.5) * 26,
  }));

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <g>
      <path d={path} fill="none" stroke={accent} strokeWidth={2.5} opacity={0.5} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={14} fill={accent} opacity={0.14} />
          <circle
            cx={p.x}
            cy={p.y}
            r={i === steps - 1 ? 7 : 4.5}
            fill={i === steps - 1 ? accent : "#cbd5e1"}
            opacity={i === steps - 1 ? 0.95 : 0.6}
          />
        </g>
      ))}
    </g>
  );
}

/** Web development — stacked, receding layers. */
function LayersMotif({ accent }: MotifProps) {
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={1060 + i * 34}
          y={640 - i * 46}
          width={360 - i * 26}
          height={230 - i * 24}
          rx={10}
          fill="none"
          stroke={i % 2 === 0 ? accent : INK.violet}
          strokeWidth={1.4}
          opacity={0.75 - i * 0.14}
        />
      ))}
      {/* A code-bracket mark on the front layer. */}
      <path
        d="M 1160 470 l -34 38 l 34 38 M 1270 470 l 34 38 l -34 38"
        fill="none"
        stroke={accent}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </g>
  );
}

const MOTIFS: Record<PostCategory, (props: MotifProps) => ReactElement> = {
  AI: NeuralMotif,
  Networking: MeshMotif,
  IoT: SignalMotif,
  "Career Journey": PathMotif,
  "Web Development": LayersMotif,
  Technology: SignalMotif,
};

/* --------------------------------------------------------------------------
   The artwork itself
   -------------------------------------------------------------------------- */

function PostArt({ post, className }: { post: Post; className?: string }) {
  const rng = mulberry32(hashString(post.slug));
  const accent = ACCENT[post.category] ?? INK.cyan;
  const Motif = MOTIFS[post.category] ?? SignalMotif;

  const gradientId = `cover-grad-${post.slug}`;
  const glowId = `cover-glow-${post.slug}`;
  const shadeId = `cover-shade-${post.slug}`;
  const vigId = `cover-vig-${post.slug}`;

  return (
    <div className={cn("relative overflow-hidden bg-deep", className)}>
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        role="img"
        aria-label={post.cover?.alt || `Cover art for “${post.title}”`}
      >
        <defs>
          <radialGradient id={gradientId} cx="62%" cy="38%" r="78%">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="55%" stopColor="#0B1020" />
            <stop offset="100%" stopColor="#030712" />
          </radialGradient>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="34" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Left-side darkening keeps a title legible over the art. */}
          <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#030712" stopOpacity={0.92} />
            <stop offset="42%" stopColor="#030712" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#030712" stopOpacity={0.05} />
          </linearGradient>
          {/* Edge vignette so the composition never hits the frame hard. */}
          <radialGradient id={vigId} cx="50%" cy="46%" r="76%">
            <stop offset="60%" stopColor="#030712" stopOpacity={0} />
            <stop offset="100%" stopColor="#030712" stopOpacity={0.7} />
          </radialGradient>
        </defs>

        <rect width="1600" height="900" fill={`url(#${gradientId})`} />

        {/* Dot grid — structure without a hard box. */}
        <g opacity={0.3}>
          {Array.from({ length: 12 }, (_, row) =>
            Array.from({ length: 20 }, (_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={60 + col * 80}
                cy={60 + row * 74}
                r={1.1}
                fill="#94a3b8"
                opacity={0.35}
              />
            )),
          )}
        </g>

        {/* Soft accent bloom behind the motif. */}
        <circle
          cx={1290}
          cy={430}
          r={210}
          fill={accent}
          opacity={0.1}
          filter={`url(#${glowId})`}
        />

        <Motif rng={rng} accent={accent} />

        {/* Vignette + left-side darkening so a title stays legible. */}
        <rect width="1600" height="900" fill={`url(#${shadeId})`} />
        <rect width="1600" height="900" fill={`url(#${vigId})`} />
      </svg>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Public component
   -------------------------------------------------------------------------- */

/**
 * Renders authored cover art when the post has one, and generated art when it
 * does not. Drop-in replacement for `<MediaFrame>` on post cards and article
 * headers.
 */
export function PostCover({
  post,
  className,
  priority = false,
}: {
  post: Post;
  className?: string;
  priority?: boolean;
}) {
  if (post.cover?.url) {
    return (
      <MediaFrame
        image={post.cover}
        seed={post.slug}
        className={className}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        overlay={false}
      />
    );
  }

  return <PostArt post={post} className={className} />;
}
