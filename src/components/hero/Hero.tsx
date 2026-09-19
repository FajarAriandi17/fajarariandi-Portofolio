"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Typography";
import { useHydrated, useInViewport, useLowPowerDevice } from "@/hooks/useEnvironment";
import { EASE_OUT_EXPO, transition } from "@/lib/motion";
import type { SiteSettings } from "@/types/content";

/**
 * The galaxy is ~200 kB of three.js. Splitting it into its own chunk means the
 * home page's first load pays for the shell and content first, and the WebGL
 * scene arrives in the same post-hydration window it mounts in anyway — it was
 * never server-rendered, so this costs nothing visible.
 */
const GalaxyCanvas = dynamic(
  () => import("@/components/hero/GalaxyCanvas").then((m) => m.GalaxyCanvas),
  { ssr: false, loading: () => null },
);

/**
 * Hero section.
 *
 * Layering, back to front:
 *   1. CSS gradient base — painted immediately, before any JS, so the hero is
 *      never blank on a slow connection.
 *   2. Generated nebula plate — adds photographic depth the shader can't fake.
 *   3. WebGL galaxy — mounted only after hydration.
 *   4. Content.
 *
 * The canvas mounts post-hydration and parks itself (`frameloop: "never"`) when
 * scrolled out of view, so it costs nothing once the reader has moved on.
 */
export function Hero({ settings }: { settings: SiteSettings }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const lowPower = useLowPowerDevice();
  const { ref: frameRef, inView } = useInViewport<HTMLDivElement>({
    rootMargin: "160px",
  });

  // Content drifts up and fades slightly as the hero scrolls away — a shallow
  // parallax that reads as depth without becoming a distraction.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Paused entirely when off-screen; rendered once (not looped) when the
  // reader has asked for reduced motion.
  const frameloop = !hydrated ? "never" : reduceMotion ? "demand" : inView ? "always" : "never";

  const nameWords = settings.name.split(" ");

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20"
    >
      {/* 1 — CSS base. Always present, so there is no flash of empty page. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-30"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 50% -10%, #111827 0%, #0B1020 38%, #030712 78%)",
        }}
      />

      {/* 2 — Generated nebula plate. */}
      <div aria-hidden className="absolute inset-0 -z-20 opacity-60">
        <Image
          src="/images/hero-nebula.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-base/40 via-base/70 to-base" />
      </div>

      {/* 3 — WebGL galaxy. */}
      <div ref={frameRef} aria-hidden className="absolute inset-0 -z-10">
        {hydrated ? (
          <GalaxyCanvas
            quality={lowPower ? "low" : "high"}
            animate={frameloop === "always" || frameloop === "demand"}
            frameloop={frameloop}
          />
        ) : null}
      </div>

      {/* 4 — Content. */}
      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="container-page relative"
      >
        <div className="max-w-3xl">
          {/* Availability strip */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.base, delay: 0.1 }}
            className="mb-8"
          >
            <span className="glass inline-flex items-center gap-2.5 rounded-full py-1.5 pl-2.5 pr-4 text-xs text-ink-soft">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              {settings.availability}
            </span>
          </motion.div>

          <Eyebrow className="mb-6">{settings.subheadline}</Eyebrow>

          <h1 className="text-5xl leading-[0.95] font-bold tracking-[-0.04em] sm:text-6xl lg:text-8xl">
            {nameWords.map((word, index) => (
              <span key={word} className="inline-block overflow-hidden pb-1">
                <motion.span
                  className="inline-block"
                  initial={reduceMotion ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 1,
                    ease: EASE_OUT_EXPO,
                    delay: 0.15 + index * 0.09,
                  }}
                >
                  {index === nameWords.length - 1 ? (
                    <span className="text-gradient">{word}</span>
                  ) : (
                    <>{word}</>
                  )}
                  {index < nameWords.length - 1 ? " " : ""}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.base, delay: 0.55 }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl"
          >
            {settings.description}
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.base, delay: 0.7 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <ButtonLink href="/projects" size="lg">
              View Projects
              <ArrowIcon />
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              Hire Me
            </ButtonLink>
            <ButtonLink
              href={settings.resumeUrl ?? "/cv-muhammad-fajar-ariandi.pdf"}
              size="lg"
              variant="outline"
              // A static file, not a route: a plain anchor lets the browser own
              // the download and keeps `next/link` from prefetching 1.3 MB.
              external
              download
            >
              Download CV
            </ButtonLink>
          </motion.div>
        </div>
      </motion.div>

      <ScrollCue />
    </section>
  );
}

/** Bottom-of-hero scroll affordance. Hidden from assistive tech — it's decoration. */
function ScrollCue() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-8 hidden justify-center md:flex"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-ink-faint">
          Scroll
        </span>
        <span className="relative h-12 w-px overflow-hidden bg-line-strong">
          {!reduceMotion ? (
            <span className="absolute inset-x-0 top-0 h-1/2 animate-scan bg-gradient-to-b from-transparent via-accent-cyan to-transparent" />
          ) : null}
        </span>
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
