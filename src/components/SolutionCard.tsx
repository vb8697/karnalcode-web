import Link from "next/link";
import type { Solution } from "@/lib/doubts";

type SolutionCardProps = { solution: Solution; voted: boolean; onVote: () => void; voting?: boolean };

export function SolutionCard({ solution: s, voted, onVote, voting }: SolutionCardProps) {
  return (
    <article className={`rounded-[18px] p-5 ${s.accepted ? "border-2 border-teal bg-teal-tint" : "border border-line bg-white"}`}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {s.accepted ? <span className="rounded-full bg-teal px-2.5 py-1 text-xs font-bold text-white">Accepted solution</span> : null}
        <span className="font-bold">
          {s.authorId ? (
            <Link href={`/people/${s.authorId}`} className="hover:text-primary">
              {s.author}
            </Link>
          ) : (
            s.author
          )}
        </span>
        <span className="text-muted">· {s.role}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{s.text}</p>
      <button
        type="button"
        onClick={onVote}
        disabled={voting}
        aria-pressed={voted}
        className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-bold disabled:opacity-60 ${
          voted ? "border-primary text-primary" : "border-line text-muted hover:border-primary/50"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 15l6-6 6 6" />
        </svg>
        Upvote · {s.votes}
      </button>
    </article>
  );
}
