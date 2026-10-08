"use client";

import type { ReactNode } from "react";
import { useSession } from "@/lib/useSession";

/** Shows its content to visitors who are not signed in. It renders while the session loads, so the page is complete on first paint. */
export function SignedOutOnly({ children }: { children: ReactNode }) {
  const { session } = useSession();
  return session ? null : <>{children}</>;
}
