"use client";

import Link from "next/link";
import { useSession } from "@/lib/useSession";

/** Landing page buttons: join buttons when signed out; nothing once signed in. */
export function HeroActions() {
  const { session, loading } = useSession();

  if (loading) return <div className="mt-8 h-[54px]" aria-hidden />;

  if (session) return null;

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href="/login" className="rounded-full bg-primary px-7 py-4 text-base font-bold text-white">
        Join with college email
      </Link>
      <Link href="/doubts" className="rounded-full border-2 border-line bg-white px-7 py-3.5 text-base font-bold">
        Browse doubts
      </Link>
    </div>
  );
}
