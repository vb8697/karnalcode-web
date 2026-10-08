"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Main } from "@/components/ui";
import { routeAfterSignIn } from "@/lib/profile";
import { useSession } from "@/lib/useSession";

/** Google sends people back here. The Supabase client exchanges the code, then we route by profile state. */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [timedOut, setTimedOut] = useState(false);
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    routeAfterSignIn(userId).then((path) => {
      if (active) router.replace(path);
    });
    return () => {
      active = false;
    };
  }, [userId, router]);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const reason = params?.get("error_description") ?? null;
  const failed = !userId && (timedOut || (!loading && params?.has("error")));

  return (
    <Main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 text-center">
      {failed ? (
        <div role="alert">
          <p className="text-error">Google sign-in did not finish.</p>
          {reason ? <p className="mt-2 text-sm text-muted">{reason}</p> : null}
          <Link href="/login" className="mt-3 inline-block text-sm font-bold text-primary">
            Back to sign in
          </Link>
        </div>
      ) : (
        <p role="status" className="text-muted">Signing you in…</p>
      )}
    </Main>
  );
}
