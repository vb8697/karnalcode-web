import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: { default: "KarnalCode", template: "%s · KarnalCode" },
  description: "Notes, doubts and placement guidance for IT students across Karnal colleges.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <QueryProvider>{children}</QueryProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
