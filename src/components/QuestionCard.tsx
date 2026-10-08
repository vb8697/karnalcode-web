import Link from "next/link";
import { Avatar, Tag } from "@/components/ui";
import type { Question } from "@/lib/doubts";
import { initialOf, pluralize } from "@/lib/format";

export function QuestionCard({ q }: { q: Question }) {
  const solved = q.solutions.some((s) => s.accepted);
  const count = q.solutions.length;

  return (
    <article className="group rounded-[18px] border border-line bg-white p-5 transition-shadow hover:shadow-[0_12px_30px_-18px_rgba(31,42,92,0.35)]">
      <div className="flex gap-4">
        <Avatar letter={initialOf(q.author)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
            {q.authorId ? (
              <Link href={`/people/${q.authorId}`} className="font-bold text-indigo hover:text-primary">
                {q.author}
              </Link>
            ) : (
              <span className="font-bold text-indigo">{q.author}</span>
            )}
            <span aria-hidden>·</span>
            <span>{q.timeAgo}</span>
            {q.kind === "project" ? <Tag tone="indigo">Project help</Tag> : null}
          </div>

          <h2 className="mt-1.5">
            <Link href={`/doubts/${q.id}`} className="font-display text-xl font-extrabold leading-snug group-hover:text-primary">
              {q.title}
            </Link>
          </h2>
          <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted">{q.body}</p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {q.tags
                .filter((t) => !(q.kind === "project" && t === "Project help"))
                .map((t, i) => (
                  <Tag key={t} tone={i === 0 ? "peach" : "indigo"}>
                    {t}
                  </Tag>
                ))}
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              {count > 0 ? (
                <Tag tone={solved ? "teal" : "sun"}>{`${pluralize(count, "solution")}${solved ? " · Solved" : ""}`}</Tag>
              ) : (
                <Tag tone="peach">Needs help</Tag>
              )}
              <Link href={`/doubts/${q.id}#share`} className="font-bold text-primary hover:underline">
                Share solution
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function QuestionCardSkeleton() {
  return (
    <div aria-hidden className="rounded-[18px] border border-line bg-white p-5">
      <div className="flex gap-4">
        <div className="size-11 shrink-0 animate-pulse rounded-full bg-segment motion-reduce:animate-none" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-40 animate-pulse rounded bg-segment motion-reduce:animate-none" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-segment motion-reduce:animate-none" />
          <div className="h-3 w-full animate-pulse rounded bg-segment motion-reduce:animate-none" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-segment motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
