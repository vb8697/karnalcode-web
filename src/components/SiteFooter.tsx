import Link from "next/link";
import { Logo } from "@/components/Logo";

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/doubts", label: "Doubts" },
      { href: "/notes", label: "Notes" },
      { href: "/papers", label: "Previous papers" },
      { href: "/syllabus", label: "Syllabus" },
    ],
  },
  {
    title: "Contribute",
    links: [
      { href: "/ask", label: "Ask a doubt" },
      { href: "/notes/new", label: "Share notes" },
      { href: "/papers/new", label: "Share a paper" },
      { href: "/syllabus/new", label: "Share a syllabus" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/profile", label: "My profile" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-10 sm:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Notes, doubts and placement guidance by the IT students of Karnal, for the IT students of Karnal.
          </p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-xs font-bold tracking-wider text-muted">{c.title.toUpperCase()}</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm font-bold">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">Made in Karnal · KarnalCode</div>
    </footer>
  );
}
