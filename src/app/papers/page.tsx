"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PaperCard } from "@/components/PaperCard";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState, Main, Notice, PageHeader, Skeleton } from "@/components/ui";
import { COURSES, SEMESTERS } from "@/lib/profile";
import { ALL, selectPapers } from "@/lib/papers";
import { useMySaves, useNotes, useRecordDownload, useToggleSave } from "@/lib/queries";
import { useSession } from "@/lib/useSession";

function Pills({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-3">
      <span className="hidden w-20 shrink-0 text-[13px] font-bold text-muted sm:block">{label}</span>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={o === value}
            onClick={() => onChange(o)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition-colors ${
              o === value ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary/50"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PapersPage() {
  const { session } = useSession();
  const { data, isPending, error } = useNotes();
  const saves = useMySaves();
  const toggleSave = useToggleSave();
  const recordDownload = useRecordDownload();
  const [course, setCourse] = useState(ALL);
  const [semester, setSemester] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [query, setQuery] = useState("");

  // Years that actually have papers, newest first.
  const years = useMemo(
    () =>
      [...new Set((data ?? []).filter((n) => n.type === "PYQ" && n.examYear).map((n) => String(n.examYear)))].sort((a, b) => Number(b) - Number(a)),
    [data],
  );
  const papers = useMemo(() => selectPapers(data ?? [], { course, semester, year, query }), [data, course, semester, year, query]);
  const filtering = course !== ALL || semester !== ALL || year !== ALL || query.trim() !== "";

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto w-full max-w-5xl px-5 py-8">
        <PageHeader
          title="Previous year papers"
          description="Find past question papers by course, semester and year. Shared by students, free for everyone."
          action={
            <Link href="/papers/new" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:opacity-90">
              + Share a paper
            </Link>
          }
        />

        <div className="mt-7 flex flex-col gap-3 rounded-[20px] border border-line bg-white p-4">
          <Pills label="Course" options={[ALL, ...COURSES]} value={course} onChange={setCourse} />
          <Pills label="Semester" options={[ALL, ...SEMESTERS]} value={semester} onChange={setSemester} />
          {years.length > 0 ? <Pills label="Year" options={[ALL, ...years]} value={year} onChange={setYear} /> : null}
          <label className="sm:ml-[92px]">
            <span className="sr-only">Search by subject</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject, e.g. Data Structures"
              className="w-full rounded-full border-2 border-line bg-ivory px-4 py-2 text-sm outline-none focus:border-primary focus:bg-white sm:max-w-sm"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {isPending && !error ? (
            <div aria-busy="true" aria-label="Loading papers" className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-24 rounded-[18px]" />
              ))}
            </div>
          ) : null}
          {error ? <Notice tone="error">Could not load papers. Check your connection and try again.</Notice> : null}
          {!isPending && !error && papers.length === 0 ? (
            <EmptyState
              title={filtering ? "No papers match these filters" : "No papers shared yet"}
              text={filtering ? "Try another semester or year, or share the paper you have." : "Be the first to share a previous year paper for your classmates."}
              action={{ href: "/papers/new", label: "Share a paper" }}
            />
          ) : null}
          {papers.length > 0 ? <p className="text-sm text-muted">{papers.length === 1 ? "1 paper" : `${papers.length} papers`}</p> : null}
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
      </Main>
    </>
  );
}
