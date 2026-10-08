"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { SiteHeader } from "@/components/SiteHeader";
import { Main } from "@/components/ui";
import { fetchColleges, fetchProfileDetails, saveProfileDetails, type ProfileDetails } from "@/lib/profile";
import { useSession } from "@/lib/useSession";

type State =
  | { status: "loading" }
  | { status: "ready"; details: ProfileDetails; colleges: string[] }
  | { status: "error"; message: string };

/** Friendly text when the database update that adds the profile columns has not been applied yet. */
function explain(message: string) {
  return /column|schema cache/i.test(message)
    ? "Profile fields are not available yet. Apply the latest database migration (20260930070000_profile_details.sql) and reload."
    : message;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [state, setState] = useState<State>({ status: "loading" });
  const userId = session?.user.id;

  useEffect(() => {
    if (loading) return;
    if (!userId) {
      router.replace("/login");
      return;
    }
    let active = true;
    Promise.all([fetchProfileDetails(userId), fetchColleges()])
      .then(([details, colleges]) => {
        if (!active) return;
        if (!details) setState({ status: "error", message: "Your profile could not be found. Sign out and sign in again." });
        else setState({ status: "ready", details, colleges });
      })
      .catch((e: unknown) => {
        if (active) setState({ status: "error", message: explain(e instanceof Error ? e.message : "Could not load your profile.") });
      });
    return () => {
      active = false;
    };
  }, [loading, userId, router]);

  const editing = state.status === "ready" && state.details.completed;

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-16 pt-6">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{editing ? "Edit profile" : "Tell us about you"}</h1>
        <p className="mb-8 mt-2 text-muted">
          {editing
            ? "Keep your details up to date so juniors and seniors can find you."
            : "Seniors, juniors and alumni in Karnal find each other through this. It takes a minute."}
        </p>

        {state.status === "loading" ? <p role="status" className="text-muted">Loading…</p> : null}
        {state.status === "error" ? (
          <div role="alert" className="rounded-2xl border border-line bg-white p-5">
            <p className="text-error">{state.message}</p>
            <Link href="/" className="mt-3 inline-block text-sm font-bold text-primary">
              Back to home
            </Link>
          </div>
        ) : null}
        {state.status === "ready" && userId ? (
          <ProfileForm
            initial={{
              name: state.details.name,
              college: state.details.college,
              course: state.details.course,
              branch: state.details.branch,
              occupation: state.details.occupation,
              semester: state.details.semester,
              jobTitle: state.details.jobTitle,
              company: state.details.company,
              graduationYear: state.details.graduationYear,
              bio: state.details.bio,
            }}
            colleges={state.colleges}
            mode={editing ? "edit" : "onboarding"}
            onSubmit={async (values) => {
              await saveProfileDetails(userId, values);
              // First time: go to the home screen. Editing later: back to the profile page.
              router.push(editing ? "/profile" : "/");
            }}
            onCancel={() => router.push(editing ? "/profile" : "/")}
          />
        ) : null}
      </Main>
    </>
  );
}
