"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Avatar, Main, Notice, Skeleton, Tag } from "@/components/ui";
import { initialOf } from "@/lib/format";
import { usePublicProfile } from "@/lib/queries";

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 text-center">
      <div className="font-display text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const { data: p, isPending, error } = usePublicProfile(id);

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8">
        {isPending && !error ? (
          <div aria-busy="true" aria-label="Loading profile" className="space-y-4">
            <Skeleton className="h-36 rounded-[24px]" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          </div>
        ) : null}
        {error ? <Notice tone="error">Could not load this profile.</Notice> : null}
        {!isPending && !error && !p ? <Notice>This person does not exist.</Notice> : null}

        {p ? (
          <>
            <section className="flex flex-wrap items-center gap-5 rounded-[24px] border border-line bg-white p-6">
              <Avatar letter={initialOf(p.name)} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl font-extrabold tracking-tight">{p.name}</h1>
                <p className="text-muted">{[p.college, p.headline].filter(Boolean).join(" · ") || "Karnal"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.role !== "student" ? <Tag tone="teal">{p.role.charAt(0).toUpperCase() + p.role.slice(1)}</Tag> : null}
                  {p.acceptedCount > 0 ? <Tag tone="sun">{`${p.acceptedCount} accepted`}</Tag> : null}
                </div>
              </div>
            </section>

            {p.bio ? <p className="mt-6 max-w-2xl leading-relaxed text-indigo/80">{p.bio}</p> : null}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat value={p.solutionsCount} label="Solutions" />
              <Stat value={p.acceptedCount} label="Accepted" />
              <Stat value={p.notesCount} label="Notes shared" />
              {p.points !== null ? <Stat value={p.points} label="Points" /> : null}
            </div>

            <section className="mt-10">
              <h2 className="font-display text-2xl font-extrabold">Recent solutions</h2>
              <div className="mt-4 flex flex-col gap-3">
                {p.solutions.length === 0 ? <Notice>No solutions yet.</Notice> : null}
                {p.solutions.map((s) => (
                  <article key={s.id} className="rounded-2xl border border-line bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/doubts/${s.questionId}`} className="font-display text-lg font-extrabold leading-snug hover:text-primary">
                        {s.questionTitle}
                      </Link>
                      {s.accepted ? <Tag tone="teal">Accepted</Tag> : null}
                    </div>
                    <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted">{s.text}</p>
                    <p className="mt-2 text-xs text-muted">{s.timeAgo}</p>
                  </article>
                ))}
              </div>
            </section>

            {p.notes.length > 0 ? (
              <section className="mt-10">
                <h2 className="font-display text-2xl font-extrabold">Notes shared</h2>
                <ul className="mt-4 flex flex-col gap-2">
                  {p.notes.map((n) => (
                    <li key={n.id} className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-3 text-[15px] font-bold">
                      {n.title}
                      <Tag tone="indigo">{n.type}</Tag>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : null}
      </Main>
    </>
  );
}
