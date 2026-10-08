"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Main, Skeleton } from "@/components/ui";
import { buildHeadline, fetchProfileDetails, type ProfileDetails } from "@/lib/profile";
import { useSession } from "@/lib/useSession";

type State = { status: "loading" } | { status: "ready"; details: ProfileDetails } | { status: "error"; message: string };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-line py-3 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-[15px] font-bold">{value || "Not added"}</dd>
    </div>
  );
}

export default function ProfilePage() {
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
    fetchProfileDetails(userId)
      .then((details) => {
        if (!active) return;
        setState(details ? { status: "ready", details } : { status: "error", message: "Your profile could not be found." });
      })
      .catch((e: unknown) => {
        if (active) setState({ status: "error", message: e instanceof Error ? e.message : "Could not load your profile." });
      });
    return () => {
      active = false;
    };
  }, [loading, userId, router]);

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-16 pt-6">
        {state.status === "loading" ? (
          <div aria-busy="true" aria-label="Loading profile" className="space-y-4">
            <Skeleton className="h-20 rounded-[20px]" />
            <Skeleton className="h-56 rounded-[22px]" />
          </div>
        ) : null}
        {state.status === "error" ? <p role="alert" className="text-error">{state.message}</p> : null}

        {state.status === "ready" ? (
          <>
            <div className="flex items-center gap-4">
              <div className="flex size-[72px] items-center justify-center rounded-full bg-sun font-display text-3xl font-extrabold">
                {state.details.name.trim().charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight">{state.details.name}</h1>
                <p className="text-muted">{state.details.college || "Karnal"}</p>
                {state.details.completed ? <p className="mt-1 text-sm font-bold text-teal-text">{buildHeadline(state.details)}</p> : null}
              </div>
            </div>

            {!state.details.completed ? (
              <div className="mt-8 rounded-[22px] bg-peach p-6">
                <h2 className="font-display text-xl font-extrabold">Complete your profile</h2>
                <p className="mt-1 text-[15px] text-peach-text">Add your course, branch and what you do so others can find you.</p>
                <Link href="/complete-profile" className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
                  Complete profile
                </Link>
              </div>
            ) : (
              <>
                <dl className="mt-8 rounded-[22px] border border-line bg-white px-6 py-2">
                  <Row label="Course" value={state.details.course} />
                  <Row label="Branch" value={state.details.branch} />
                  <Row label="Status" value={state.details.occupation === "working" ? "Working" : "Student"} />
                  {state.details.occupation === "working" ? (
                    <>
                      <Row label="Job title" value={state.details.jobTitle} />
                      <Row label="Company" value={state.details.company} />
                      <Row label="Graduated" value={state.details.graduationYear} />
                    </>
                  ) : (
                    <Row label="Semester" value={state.details.semester} />
                  )}
                </dl>
                {state.details.bio ? <p className="mt-6 leading-relaxed text-indigo/80">{state.details.bio}</p> : null}
                <Link href="/complete-profile" className="mt-8 inline-block rounded-full border-2 border-line bg-white px-6 py-3 text-sm font-bold">
                  Edit profile
                </Link>
              </>
            )}
          </>
        ) : null}
      </Main>
    </>
  );
}
