import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Syllabus",
  description: "Course syllabus for Karnal colleges, by course and semester.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
