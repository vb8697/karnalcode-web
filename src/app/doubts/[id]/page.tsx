"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PreviewButton } from "@/components/PreviewButton";
import { SignInPrompt } from "@/components/SignInPrompt";
import { SiteHeader } from "@/components/SiteHeader";
import { SolutionCard } from "@/components/SolutionCard";
import { Button, Main, Notice, Skeleton, Tag, TextArea } from "@/components/ui";
import { pluralize } from "@/lib/format";
import { useAddSolution, useMyVotes, useQuestion, useToggleVote } from "@/lib/queries";
import { useSession } from "@/lib/useSession";

export default function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useSession();
  const { data: q, isPending, error } = useQuestion(id);
  const myVotes = useMyVotes();
  const toggleVote = useToggleVote(id);
  const addSolution = useAddSolution(id);
  const [draft, setDraft] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function post(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) {
      setFormError("Write your solution first");
      return;
    }
    setFormError(null);
    try {
      await addSolution.mutateAsync(draft);
      setDraft("");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not post your solution. Please try again.");
    }
  }

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <Link href="/doubts" className="text-sm font-bold text-muted hover:text-primary">
          ‹ All doubts
        </Link>

        {isPending && !error ? (
          <div aria-busy="true" aria-label="Loading doubt" className="mt-8 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-6 h-32 rounded-[18px]" />
          </div>
        ) : null}
        {error ? <div className="mt-6"><Notice tone="error">Could not load this doubt.</Notice></div> : null}
        {!isPending && !error && !q ? <div className="mt-6"><Notice>This doubt does not exist or was removed.</Notice></div> : null}

        {q ? (
          <>
            <div className="mt-5 flex flex-wrap gap-2">
              {q.tags.map((t, i) => (
                <Tag key={t} tone={i === 0 ? "peach" : "indigo"}>
                  {t}
                </Tag>
              ))}
              {q.semester ? <Tag tone="indigo">{q.semester}</Tag> : null}
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{q.title}</h1>
            <p className="mt-3 text-sm text-muted">
              Asked by{" "}
              {q.authorId ? (
                <Link href={`/people/${q.authorId}`} className="font-bold text-indigo hover:text-primary">
                  {q.author}
                </Link>
              ) : (
                q.author
              )}{" "}
              · {q.timeAgo}
            </p>
            <p className="mt-5 whitespace-pre-wrap text-base leading-relaxed">{q.body}</p>
            {q.code ? (
              <pre className="mt-4 overflow-x-auto rounded-xl bg-indigo p-4 font-mono text-[13px] leading-relaxed text-peach">{q.code}</pre>
            ) : null}

            {q.images.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-3">
                {q.images.map((url, i) => (
                  <li key={url}>
                    <PreviewButton title={`Attachment ${i + 1}: ${q.title}`} url={url} mimeType={null} className="block overflow-hidden rounded-xl hover:opacity-80">
                      {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded screenshot */}
                      <img src={url} alt={`Attached screenshot ${i + 1}`} loading="lazy" className="h-32 w-auto max-w-full rounded-xl border border-line object-cover" />
                    </PreviewButton>
                  </li>
                ))}
              </ul>
            ) : null}

            <h2 className="mt-10 font-display text-2xl font-extrabold">{pluralize(q.solutions.length, "solution")}</h2>
            <div className="mt-4 flex flex-col gap-4">
              {q.solutions.length === 0 ? <Notice>No solutions yet. Be the first to help.</Notice> : null}
              {q.solutions.map((s) => (
                <SolutionCard
                  key={s.id}
                  solution={s}
                  voted={myVotes.has(s.id)}
                  voting={toggleVote.isPending}
                  onVote={() => {
                    if (!session) {
                      setFormError("Sign in to upvote.");
                      return;
                    }
                    toggleVote.mutate({ solutionId: s.id, voted: !myVotes.has(s.id) });
                  }}
                />
              ))}
            </div>

            <section id="share" className="mt-10 scroll-mt-6">
              {session ? (
                <form onSubmit={post} noValidate className="flex flex-col gap-4 rounded-[20px] border-2 border-primary bg-white p-5">
                  <h2 className="font-display text-xl font-extrabold">Share your solution</h2>
                  <TextArea
                    label="Your solution"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Explain the why, not just the fix."
                    maxLength={5000}
                  />
                  {formError ? (
                    <p role="alert" className="text-sm text-error">
                      {formError}
                    </p>
                  ) : null}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={addSolution.isPending}>
                      {addSolution.isPending ? "Posting…" : "Post solution"}
                    </Button>
                  </div>
                </form>
              ) : (
                <SignInPrompt message="Sign in with your college email to share a solution." />
              )}
            </section>
          </>
        ) : null}
      </Main>
    </>
  );
}
