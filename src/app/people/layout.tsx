import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Profile", description: "A KarnalCode student profile." };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
