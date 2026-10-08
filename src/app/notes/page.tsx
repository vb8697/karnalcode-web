"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NoteCard } from "@/components/NoteCard";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState, Main, Notice, PageHeader, Skeleton } from "@/components/ui";
import { TOPICS } from "@/lib/doubts";
import { NOTE_TYPE_FILTERS, NOTE_TYPE_MAP, type NoteTypeFilter } from "@/lib/notes";
import { useMySaves, useNotes, useRecordDownload, useToggleSave } from "@/lib/queries";
import { useSession } from "@/lib/useSession";

function Pills<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors ${o === value ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary/50"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function NotesPage() {
  const { session } = useSession();
  const { data, isPending, error } = useNotes();
  const saves = useMySaves();
  const toggleSave = useToggleSave();
  const recordDownload = useRecordDownload();
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("All");
  const [type, setType] = useState<NoteTypeFilter>("All types");
  const [query, setQuery] = useState("");

  const notes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const allowed = NOTE_TYPE_MAP[type];
    return (data ?? []).filter(
      (n) =>
        (topic === "All" || n.topic === topic || n.topic === "All") &&
        (!allowed || allowed.includes(n.type)) &&
        (!needle || n.title.toLowerCase().includes(needle)),
    );
  }, [data, topic, type, query]);

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <PageHeader
          title="Notes & PYQs"
          description="Free for everyone. Shared by Karnal students."
          action={
            <Link href="/notes/new" className="rounded-full bg-indigo px-6 py-3 text-sm font-bold text-white hover:opacity-90">
              + Share your notes
            </Link>
          }
        />

        <div className="mt-7 flex flex-col gap-3">
          <Pills label="Topic" options={TOPICS} value={topic} onChange={setTopic} />
          <Pills label="Type" options={NOTE_TYPE_FILTERS} value={type} onChange={setType} />
          <label className="w-full sm:w-72">
            <span className="sr-only">Search notes</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes, PYQs, syllabus"
              className="w-full rounded-full border-2 border-line bg-white px-4 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isPending && !error
            ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-56 rounded-[18px]" />)
            : null}
          {error ? <Notice tone="error">Could not load notes. Check your connection and try again.</Notice> : null}
          {!isPending && !error && notes.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <EmptyState title="No notes match yet" text="Try another topic, or share the first one for your classmates." action={{ href: "/notes/new", label: "Share your notes" }} />
            </div>
          ) : null}
          {notes.map((n) => (
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
      </Main>
    </>
  );
}
