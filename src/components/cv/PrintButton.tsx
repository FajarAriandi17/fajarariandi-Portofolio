"use client";

import { useEffect, useState } from "react";

/**
 * Print-to-PDF affordance. Browsers do not let pages save arbitrary bytes as a
 * download without a user gesture, so the CV is a real, well-set page and this
 * button hands it to the native print dialog — which produces a clean PDF.
 */
export function PrintButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 5V2.5h8V5M4 11H2.5V7h11v4H12M4 8.5h8V14H4z" />
      </svg>
      Download PDF
    </button>
  );
}
