import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Notes and PYQs", description: "Free notes and previous year papers shared by Karnal students." };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
