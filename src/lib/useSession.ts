"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type SessionState = { session: Session | null; loading: boolean };

/** Current Supabase session, kept in sync with sign in and sign out. */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ session: null, loading: true });

  useEffect(() => {
    const supabase = getSupabase();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ session: data.session, loading: false });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false });
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}
