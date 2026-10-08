"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  // Created once per browser session so cached data survives re-renders.
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1, networkMode: "always" } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
