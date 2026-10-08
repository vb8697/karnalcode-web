import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Doubts", description: "Ask and answer doubts from IT students across Karnal." };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
