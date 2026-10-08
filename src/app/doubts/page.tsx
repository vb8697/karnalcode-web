"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { QuestionCard, QuestionCardSkeleton } from "@/components/QuestionCard";
import { SignInPrompt } from "@/components/SignInPrompt";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState, Main, Notice } from "@/components/ui";
import { TOPICS, type Question } from "@/lib/doubts";
import { useNextDoubtHour, useQuestions, useTopHelpers } from "@/lib/queries";
import { useSession } from "@/lib/useSession";

const TABS = ["Latest", "Unanswered", "Solved", "Projects"] as const;
type Tab = (typeof TABS)[number];

function matchesTab(q: Question, tab: Tab) {
  if (tab === "Unanswered") return q.solutions.length === 0;
  if (tab === "Solved") return q.solutions.some((s) => s.accepted);
  if (tab === "Projects") return q.kind === "project";
  return true;
}

function DoubtsFeed() {
  const { session, loading: sessionLoading } = useSession();
  const { data, isPending, error } = useQuestions();
  const helpers = useTopHelpers().data ?? [];
  const doubtHour = useNextDoubtHour().data;
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("All");
  const [tab, setTab] = useState<Tab>("Latest");
  const [query, setQuery] = useState(useSearchParams().get("q") ?? "");

  const questions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data ?? []).filter(
      (q) =>
        (topic === "All" || q.topic === topic) &&
        matchesTab(q, tab) &&
        (!needle || q.title.toLowerCase().includes(needle) || q.body.toLowerCase().includes(needle)),
    );
  }, [data, topic, tab, query]);

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-7 px-5 py-8 lg:grid-cols-[180px_minmax(0,1fr)_300px]">
        <aside aria-label="Topics" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 text-xs font-bold tracking-wider text-muted">TOPICS</p>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={t === topic}
                onClick={() => setTopic(t)}
                className={`shrink-0 rounded-[10px] px-3 py-2 text-left text-[15px] font-bold ${
                  t === topic ? "border border-line bg-white text-primary" : "border border-transparent text-indigo hover:bg-white"
                }`}
              >
                {t === "All" ? "All doubts" : t}
              </button>
            ))}
          </div>
        </aside>

        <section aria-label="Doubts" className="flex min-w-0 flex-col gap-4">
          <Link
            href="/ask"
            className="flex items-center gap-4 rounded-[20px] border border-line bg-white p-4 text-[15px] text-muted hover:border-primary/40"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sun font-extrabold text-indigo">?</span>
            Stuck on something? Ask the Karnal community
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={t === tab}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-[13px] font-bold ${
                  t === tab ? "bg-indigo text-white" : "border border-line bg-white hover:border-primary/40"
                }`}
              >
                {t}
              </button>
            ))}
            <label className="ml-auto w-full sm:w-64">
              <span className="sr-only">Search doubts</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search doubts"
                className="w-full rounded-full border-2 border-line bg-white px-4 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          {isPending && !error ? (
            <div aria-busy="true" aria-label="Loading doubts" className="flex flex-col gap-4">
              <QuestionCardSkeleton />
              <QuestionCardSkeleton />
              <QuestionCardSkeleton />
            </div>
          ) : null}
          {error ? <Notice tone="error">Could not load doubts. Check your connection and try again.</Notice> : null}
          {!isPending && !error && questions.length === 0 ? (
            <EmptyState
              title={query.trim() ? "No doubts match your search" : "Nothing here yet"}
              text={query.trim() ? "Try different words, or ask it yourself." : "Be the first to ask or answer in this topic."}
              action={{ href: "/ask", label: "Ask a doubt" }}
            />
          ) : null}
          {questions.map((q) => (
            <QuestionCard key={q.id} q={q} />
          ))}
        </section>

        <aside aria-label="Community" className="flex min-w-0 flex-col gap-4">
          {!sessionLoading && !session ? <SignInPrompt message="Anyone can read. Verified students can answer." /> : null}

          {helpers.length > 0 ? (
            <div className="rounded-[20px] border border-line bg-white p-5">
              <h2 className="font-display text-lg font-bold">Top helpers</h2>
              <ol className="mt-3 flex flex-col gap-2 text-[15px]">
                {helpers.map((h) => (
                  <li key={h.id} className="flex justify-between">
                    <Link href={`/people/${h.id}`} className="hover:text-primary">
                      {h.name}
                    </Link>
                    <b>{h.points}</b>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {doubtHour ? (
            <div className="rounded-[20px] bg-teal-tint p-5">
              <p className="text-xs font-bold tracking-wider text-teal-text">NEXT DOUBT HOUR</p>
              <p className="mt-1 font-display text-lg font-bold">{doubtHour.title}</p>
              <p className="mt-1 text-sm text-teal-text">
                {new Date(doubtHour.startsAt).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          ) : null}
        </aside>
      </Main>
    </>
  );
}

export default function DoubtsPage() {
  // useSearchParams needs a Suspense boundary so the rest of the page can render first.
  return (
    <Suspense>
      <DoubtsFeed />
    </Suspense>
  );
}
