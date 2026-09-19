"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reports whether an element is intersecting the viewport.
 *
 * Used to pause the WebGL render loop when the hero scrolls away — a looping
 * canvas off-screen is pure wasted battery, especially on mobile.
 */
export function useInViewport<T extends Element>(
  options: { rootMargin?: string; threshold?: number } = {},
) {
  const { rootMargin = "0px", threshold = 0 } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (very old browsers / SSR edge) — assume visible
    // rather than silently freezing the animation forever.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}

/**
 * Coarse device capability check, run after mount so it can read `window`.
 *
 * Deliberately conservative: a narrow screen, few cores, or a reported
 * low-power signal all drop the particle budget. Being wrong here costs a
 * little visual density — being wrong the other way costs someone's frame rate.
 */
export function useLowPowerDevice() {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
        ?.saveData ?? false;

    setLowPower(narrow || cores <= 4 || saveData);
  }, []);

  return lowPower;
}

/**
 * True once the component has mounted on the client. Gates anything that would
 * otherwise produce a server/client markup mismatch.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
