import type { ReactNode } from "react";

import { PageTransition } from "@/components/layout/PageTransition";

/**
 * `template.tsx` re-mounts on every navigation (unlike `layout.tsx`), which is
 * what makes a route transition animation possible. See `PageTransition` for
 * why exiting pages aren't animated.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
