import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Complete your profile", description: "Tell us about your course, branch and what you do." };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
