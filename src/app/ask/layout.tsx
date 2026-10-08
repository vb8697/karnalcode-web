import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Ask a doubt", description: "Post a doubt and get answers from seniors and alumni." };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
