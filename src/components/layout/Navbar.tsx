"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Site header.
 *
 * Transparent over the hero so the galaxy reads full-bleed, then condenses into
 * a glass bar once the reader starts scrolling. Background and border are
 * driven by a motion value rather than React state, so scrolling doesn't
 * re-render the tree on every frame.
 */
export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setCondensed(latest > 24);
  });

  // Close the mobile panel on navigation.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock body scroll while the mobile panel is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-elevated focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          condensed ? "py-3" : "py-5",
        )}
      >
        <div className="container-page">
          <nav
            aria-label="Main"
            className={cn(
              "flex items-center justify-between rounded-full px-4 transition-all duration-500",
              condensed
                ? "glass h-14 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.7)]"
                : "h-16 border border-transparent",
            )}
          >
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="Fajar Ariandi — home"
            >
              <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-accent-blue via-accent-cyan to-accent-violet">
                <Image
                  src="/images/logo-mark.png"
                  alt=""
                  width={36}
                  height={36}
                  // The mark fills its rounded container the way the monogram
                  // did, so the navbar silhouette is unchanged.
                  className="h-full w-full object-cover"
                  priority
                />
              </span>
              <span className="hidden font-display text-sm font-semibold tracking-tight text-ink sm:block">
                Fajar Ariandi
              </span>
            </Link>

            <ul className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm transition-colors duration-200",
                      isActive(link.href)
                        ? "text-ink"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {isActive(link.href) ? (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-white/[0.07]"
                        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      />
                    ) : null}
                    <span className="relative">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <ButtonLink href="/contact" size="sm" className="hidden sm:inline-flex">
                Hire Me
              </ButtonLink>

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="grid size-10 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:text-ink md:hidden"
              >
                <span className="relative block h-3 w-4">
                  <span
                    className={cn(
                      "absolute left-0 block h-px w-4 bg-current transition-all duration-300",
                      menuOpen ? "top-1.5 rotate-45" : "top-0",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 block h-px w-4 bg-current transition-all duration-300",
                      menuOpen ? "top-1.5 -rotate-45" : "top-3",
                    )}
                  />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-base/95 backdrop-blur-xl md:hidden"
          >
            <nav aria-label="Mobile" className="container-page flex h-full flex-col justify-center">
              <ul className="space-y-2">
                {NAV_LINKS.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: EASE_OUT_EXPO,
                      delay: 0.05 + index * 0.06,
                    }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "block py-3 font-display text-4xl font-semibold tracking-tight transition-colors",
                        isActive(link.href) ? "text-gradient" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.4 }}
                className="mt-12"
              >
                <ButtonLink href="/contact" size="lg" className="w-full">
                  Start a project
                </ButtonLink>
              </motion.div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
