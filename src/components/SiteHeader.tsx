"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/ui";
import { getSupabase } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";

const links = [
  { href: "/doubts", label: "Doubts" },
  { href: "/notes", label: "Notes" },
  { href: "/papers", label: "Papers" },
  { href: "/syllabus", label: "Syllabus" },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading } = useSession();
  // The menu is open only on the page where it was opened, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const menuOpen = openOn === pathname;

  async function signOut() {
    await getSupabase().auth.signOut();
    router.push("/");
  }

  function search(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/doubts?q=${encodeURIComponent(q)}` : "/doubts");
  }

  const email = session?.user.email ?? "";
  const name = (session?.user.user_metadata?.name as string | undefined) ?? email;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur supports-[not(backdrop-filter:blur(1px))]:bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 text-[15px] font-bold md:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-[10px] px-3.5 py-2 transition-colors ${active ? "bg-peach text-peach-text" : "text-muted hover:bg-ivory hover:text-indigo"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <form role="search" onSubmit={search} className="ml-2 hidden max-w-xs flex-1 lg:block">
          <label htmlFor="header-search" className="sr-only">
            Search doubts
          </label>
          <input
            id="header-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doubts"
            enterKeyHint="search"
            className="w-full rounded-full border-2 border-line bg-ivory px-4 py-2 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
          />
        </form>

        <div className="ml-auto hidden items-center gap-3 text-sm font-bold md:flex">
          <Link href="/ask" className="rounded-full bg-primary px-5 py-2.5 text-white hover:opacity-90">
            Ask a doubt
          </Link>
          {loading ? null : session ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-ivory" aria-label="My profile">
                <Avatar letter={name.trim().charAt(0).toUpperCase() || "?"} size="sm" />
                <span className="max-w-[8rem] truncate">{name.split("@")[0]}</span>
              </Link>
              <button type="button" onClick={signOut} className="text-muted hover:text-primary">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full border-2 border-line px-4 py-2 hover:border-primary/50">
              Sign in
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpenOn(menuOpen ? null : pathname)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="ml-auto flex size-11 items-center justify-center rounded-full border border-line md:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {menuOpen ? (
        <nav id="mobile-menu" aria-label="Menu" className="border-t border-line bg-white px-5 pb-5 pt-3 md:hidden">
          <ul className="flex flex-col text-base font-bold">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-xl px-3 py-3 hover:bg-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
            {session ? (
              <li>
                <Link href="/profile" className="block rounded-xl px-3 py-3 hover:bg-ivory">
                  My profile
                </Link>
              </li>
            ) : null}
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/ask" className="rounded-full bg-primary py-3 text-center font-bold text-white">
              Ask a doubt
            </Link>
            {loading ? null : session ? (
              <button type="button" onClick={signOut} className="rounded-full border-2 border-line py-3 font-bold">
                Sign out
              </button>
            ) : (
              <Link href="/login" className="rounded-full border-2 border-line py-3 text-center font-bold">
                Sign in
              </Link>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
