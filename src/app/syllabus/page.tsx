"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SyllabusCard } from "@/components/SyllabusCard";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState, Main, Notice, PageHeader, Skeleton } from "@/components/ui";
import { COURSES, SEMESTERS } from "@/lib/profile";
import { ALL, selectSyllabus, WHOLE_COURSE } from "@/lib/syllabus";
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

export default function SyllabusPage() {
  const { session } = useSession();
  const { data, isPending, error } = useNotes();
  const saves = useMySaves();
  const toggleSave = useToggleSave();
  const recordDownload = useRecordDownload();
  const [course, setCourse] = useState(ALL);
  const [semester, setSemester] = useState(ALL);
  const [query, setQuery] = useState("");

  const items = useMemo(() => selectSyllabus(data ?? [], { course, semester, query }), [data, course, semester, query]);
  const filtering = course !== ALL || semester !== ALL || query.trim() !== "";

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto w-full max-w-5xl px-5 py-8">
        <PageHeader
          title="Syllabus"
          description="Find the syllabus for your course and semester, shared by students. Free for everyone."
          action={
            <Link href="/syllabus/new" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:opacity-90">
              + Share a syllabus
            </Link>
          }
        />

        <div className="mt-7 flex flex-col gap-3 rounded-[20px] border border-line bg-white p-4">
          <Pills label="Course" options={[ALL, ...COURSES]} value={course} onChange={setCourse} />
          <Pills label="Semester" options={[ALL, WHOLE_COURSE, ...SEMESTERS]} value={semester} onChange={setSemester} />
          <label className="sm:ml-[92px]">
            <span className="sr-only">Search syllabus</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject or course"
              className="w-full rounded-full border-2 border-line bg-ivory px-4 py-2 text-sm outline-none focus:border-primary focus:bg-white sm:max-w-sm"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {isPending && !error ? (
            <div aria-busy="true" aria-label="Loading syllabus" className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-24 rounded-[18px]" />
              ))}
            </div>
          ) : null}
          {error ? <Notice tone="error">Could not load the syllabus. Check your connection and try again.</Notice> : null}
          {!isPending && !error && items.length === 0 ? (
            <EmptyState
              title={filtering ? "No syllabus matches these filters" : "No syllabus shared yet"}
              text={filtering ? "Try another course or semester, or share the syllabus you have." : "Be the first to share your course syllabus for your classmates."}
              action={{ href: "/syllabus/new", label: "Share a syllabus" }}
            />
          ) : null}
          {items.length > 0 ? <p className="text-sm text-muted">{items.length === 1 ? "1 syllabus" : `${items.length} syllabus files`}</p> : null}
          {items.map((p) => (
            <SyllabusCard
              key={p.id}
              syllabus={p}
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
