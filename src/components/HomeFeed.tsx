"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { NoteCard } from "@/components/NoteCard";
import { PaperCard } from "@/components/PaperCard";
import { SyllabusCard } from "@/components/SyllabusCard";
import { Avatar, EmptyState, Notice, Skeleton, Tag } from "@/components/ui";
import type { Question } from "@/lib/doubts";
import { initialOf, pluralize } from "@/lib/format";
import { papersForYou } from "@/lib/papers";
import { syllabusForYou } from "@/lib/syllabus";
import { useLiveQuestions, useMyProfile, useMySaves, useNextDoubtHour, useNotes, useRecordDownload, useToggleSave } from "@/lib/queries";
import { useSession } from "@/lib/useSession";

function SectionHeader({ title, href, linkLabel, live }: { title: string; href: string; linkLabel: string; live?: boolean }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight">
        {title}
        {live ? (
          <span className="flex items-center gap-1.5 rounded-full bg-teal-tint px-2.5 py-1 text-xs font-bold text-teal-text">
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-teal" />
            </span>
            Live
          </span>
        ) : null}
      </h2>
      <Link href={href} className="shrink-0 text-sm font-bold text-primary hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}

function LiveDoubt({ q }: { q: Question }) {
  const solved = q.solutions.some((s) => s.accepted);
  const count = q.solutions.length;
  return (
    <li>
      <Link href={`/doubts/${q.id}`} className="group flex gap-3 rounded-[16px] border border-line bg-white p-4 transition-shadow hover:shadow-[0_12px_30px_-18px_rgba(31,42,92,0.35)]">
        <Avatar letter={initialOf(q.author)} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-extrabold leading-snug group-hover:text-primary">{q.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{q.author}</span>
            <span aria-hidden>·</span>
            <span>{q.timeAgo}</span>
            <Tag tone="peach">{q.topic === "All" ? "General" : q.topic}</Tag>
            {count > 0 ? <Tag tone={solved ? "teal" : "sun"}>{pluralize(count, "solution")}</Tag> : <Tag tone="indigo">Needs an answer</Tag>}
          </div>
        </div>
      </Link>
    </li>
  );
}

function Cards({ loading, error, errorText, children }: { loading: boolean; error: boolean; errorText: string; children: ReactNode }) {
  if (loading) return null;
  if (error) return <Notice tone="error">{errorText}</Notice>;
  return <>{children}</>;
}

/** Home screen content: live doubts, previous papers picked for you, and fresh notes. */
export function HomeFeed() {
  const { session } = useSession();
  const questions = useLiveQuestions();
  const notes = useNotes();
  const profile = useMyProfile().data;
  const doubtHour = useNextDoubtHour().data;
  const saves = useMySaves();
  const toggleSave = useToggleSave();
  const recordDownload = useRecordDownload();

  const all = notes.data ?? [];
  const papers = papersForYou(all, profile?.course || null, profile?.semester || null, 4);
  const syllabus = syllabusForYou(all, profile?.course || null, profile?.semester || null, 2);
  const freshNotes = all.filter((n) => n.type !== "PYQ").slice(0, 4);
  // Unanswered doubts first, because those are where help is needed most.
  const doubts = [...(questions.data ?? [])].sort((a, b) => Number(a.solutions.length > 0) - Number(b.solutions.length > 0)).slice(0, 5);
  const personalised = !!profile?.course;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-6">
      {doubtHour ? (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-teal-tint p-5">
          <div>
            <p className="text-xs font-bold tracking-wider text-teal-text">NEXT DOUBT HOUR</p>
            <p className="mt-1 font-display text-lg font-bold">{doubtHour.title}</p>
          </div>
          <p className="text-sm font-bold text-teal-text">
            {new Date(doubtHour.startsAt).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section aria-labelledby="live-doubts" className="min-w-0">
          <SectionHeader title="Live doubts" href="/doubts" linkLabel="See all doubts" live />
          <span id="live-doubts" className="sr-only">
            Live doubts, updated every 30 seconds
          </span>
          {questions.isPending && !questions.error ? (
            <div aria-busy="true" className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-20 rounded-[16px]" />
              ))}
            </div>
          ) : null}
          <Cards loading={questions.isPending && !questions.error} error={!!questions.error} errorText="Could not load doubts right now.">
            {doubts.length === 0 ? (
              <EmptyState title="No doubts yet" text="Be the first to ask, and someone will answer." action={{ href: "/ask", label: "Ask a doubt" }} />
            ) : (
              <ul className="flex flex-col gap-3">
                {doubts.map((q) => (
                  <LiveDoubt key={q.id} q={q} />
                ))}
              </ul>
            )}
          </Cards>
        </section>

        <section aria-labelledby="home-papers" className="min-w-0">
          <SectionHeader title={personalised ? "Papers for you" : "Previous year papers"} href="/papers" linkLabel="All papers" />
          <span id="home-papers" className="sr-only">
            Previous year papers
          </span>
          {personalised ? (
            <p className="-mt-2 mb-4 text-sm text-muted">
              Matching your course{profile?.semester ? ` and semester ${profile.semester}` : ""} first.
            </p>
          ) : null}
          {notes.isPending && !notes.error ? (
            <div aria-busy="true" className="flex flex-col gap-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-24 rounded-[18px]" />
              ))}
            </div>
          ) : null}
          <Cards loading={notes.isPending && !notes.error} error={!!notes.error} errorText="Could not load papers right now.">
            {papers.length === 0 ? (
              <EmptyState title="No papers yet" text="Share a previous year paper for your classmates." action={{ href: "/papers/new", label: "Share a paper" }} />
            ) : (
              <div className="flex flex-col gap-3">
                {papers.map((p) => (
                  <PaperCard
                    key={p.id}
                    paper={p}
                    saved={saves.has(p.id)}
                    canSave={!!session}
                    onToggleSave={() => toggleSave.mutate({ noteId: p.id, saved: !saves.has(p.id) })}
                    onDownload={() => recordDownload.mutate(p.id)}
                  />
                ))}
              </div>
            )}
          </Cards>
        </section>
      </div>

      <section aria-labelledby="home-syllabus" className="mt-12">
        <SectionHeader title={personalised ? "Your syllabus" : "Syllabus"} href="/syllabus" linkLabel="All syllabus" />
        <span id="home-syllabus" className="sr-only">
          Syllabus
        </span>
        {notes.isPending && !notes.error ? (
          <div aria-busy="true" className="grid gap-3 md:grid-cols-2">
            <Skeleton className="h-24 rounded-[18px]" />
            <Skeleton className="h-24 rounded-[18px]" />
          </div>
        ) : null}
        <Cards loading={notes.isPending && !notes.error} error={!!notes.error} errorText="Could not load the syllabus right now.">
          {syllabus.length === 0 ? (
            <EmptyState title="No syllabus yet" text="Share your course syllabus so others know what to study." action={{ href: "/syllabus/new", label: "Share a syllabus" }} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {syllabus.map((n) => (
                <SyllabusCard
                  key={n.id}
                  syllabus={n}
                  saved={saves.has(n.id)}
                  canSave={!!session}
                  onToggleSave={() => toggleSave.mutate({ noteId: n.id, saved: !saves.has(n.id) })}
                  onDownload={() => recordDownload.mutate(n.id)}
                />
              ))}
            </div>
          )}
        </Cards>
      </section>

      <section aria-labelledby="home-notes" className="mt-12">
        <SectionHeader title="Fresh notes" href="/notes" linkLabel="All notes" />
        <span id="home-notes" className="sr-only">
          Fresh notes
        </span>
        {notes.isPending && !notes.error ? (
          <div aria-busy="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-56 rounded-[18px]" />
            ))}
          </div>
        ) : null}
        <Cards loading={notes.isPending && !notes.error} error={!!notes.error} errorText="Could not load notes right now.">
          {freshNotes.length === 0 ? (
            <EmptyState title="No notes yet" text="Share your notes and help the next batch." action={{ href: "/notes/new", label: "Share notes" }} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {freshNotes.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  saved={saves.has(n.id)}
                  canSave={!!session}
                  onToggleSave={() => toggleSave.mutate({ noteId: n.id, saved: !saves.has(n.id) })}
                  onDownload={() => recordDownload.mutate(n.id)}
                />
              ))}
            </div>
          )}
        </Cards>
      </section>
    </div>
  );
}
