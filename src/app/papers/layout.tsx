import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Previous year papers",
  description: "Previous year question papers shared by Karnal students, by course, semester and year.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
