"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SignInPrompt } from "@/components/SignInPrompt";
import { SiteHeader } from "@/components/SiteHeader";
import { Button, ChipGroup, Notice, TextArea, TextField, Main } from "@/components/ui";
import { MAX_DOUBT_IMAGES, MIN_BODY_LENGTH, MIN_TITLE_LENGTH, TAG_OPTIONS, type QuestionKind, validateDoubtImages } from "@/lib/doubts";
import { useAddQuestion, useSimilar } from "@/lib/queries";
import { useSession } from "@/lib/useSession";

const KINDS = [
  { label: "Doubt", kind: "doubt" as QuestionKind, tag: undefined },
  { label: "Project help", kind: "project" as QuestionKind, tag: "Project help" },
  { label: "Exam", kind: "doubt" as QuestionKind, tag: "Exam" },
];

export default function AskPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const addQuestion = useAddQuestion();
  const [kindLabel, setKindLabel] = useState("Doubt");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const [formError, setFormError] = useState<string | null>(null);
  const similar = useSimilar(title).data ?? [];

  const toggleTag = (t: string) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  function addImages(list: FileList | null) {
    const next = [...images, ...Array.from(list ?? [])];
    const problem = validateDoubtImages(next);
    setImageError(problem);
    if (!problem) setImages(next);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found: { title?: string; body?: string } = {};
    if (title.trim().length < MIN_TITLE_LENGTH) found.title = `Write at least ${MIN_TITLE_LENGTH} characters`;
    if (body.trim().length < MIN_BODY_LENGTH) found.body = `Explain your problem in at least ${MIN_BODY_LENGTH} characters`;
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    const k = KINDS.find((x) => x.label === kindLabel) ?? KINDS[0];
    try {
      const id = await addQuestion.mutateAsync({
        kind: k.kind,
        title,
        body,
        tags: k.tag ? [k.tag, ...tags] : tags.length ? tags : ["General"],
        anonymous,
        images,
      });
      router.push(`/doubts/${id}`);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not post your doubt. Please try again.");
    }
  }

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-7 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Ask a doubt</h1>
          <p className="mb-7 mt-2 text-muted">Visible to everyone in Karnal. Be specific and show what you tried.</p>

          {loading ? <Notice>Loading…</Notice> : null}
          {!loading && !session ? <SignInPrompt message="Sign in with your college email to ask a doubt." /> : null}

          {session ? (
            <form onSubmit={submit} noValidate className="flex flex-col gap-6 rounded-[22px] border border-line bg-white p-6">
              <ChipGroup label="Type" options={KINDS.map((k) => k.label)} value={kindLabel} onChange={setKindLabel} />
              <TextField
                label="Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((p) => ({ ...p, title: undefined }));
                }}
                error={errors.title}
                placeholder="e.g. Why does my code throw NullPointerException?"
                maxLength={200}
              />
              <TextArea
                label="Explain your problem"
                rows={6}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setErrors((p) => ({ ...p, body: undefined }));
                }}
                error={errors.body}
                placeholder="What did you try? Paste the error or code."
                maxLength={5000}
              />
              <div>
                <label htmlFor="doubt-images" className="mb-1.5 block text-[13px] font-bold">
                  Screenshots or error photos (optional, up to {MAX_DOUBT_IMAGES})
                </label>
                <input
                  id="doubt-images"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={(e) => {
                    addImages(e.target.files);
                    e.target.value = "";
                  }}
                  className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-peach file:px-4 file:py-2 file:font-bold file:text-peach-text"
                />
                {imageError ? (
                  <p role="alert" className="mt-1.5 text-[13px] font-medium text-error">
                    {imageError}
                  </p>
                ) : null}
                {images.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-3">
                    {images.map((f, i) => (
                      <li key={`${f.name}-${i}`} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                        <img src={previews[i]} alt={`Attached image ${i + 1}: ${f.name}`} className="size-24 rounded-xl border border-line object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, j) => j !== i))}
                          className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full border border-line bg-white text-sm font-bold shadow"
                        >
                          <span className="sr-only">Remove {f.name}</span>
                          <span aria-hidden>×</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div role="group" aria-label="Tags">
                <span className="mb-2 block text-[13px] font-bold">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map((t) => {
                    const on = tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleTag(t)}
                        className={`rounded-full border px-3.5 py-2 text-[13px] font-bold ${on ? "border-primary bg-primary text-white" : "border-line bg-white hover:border-primary/50"}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center justify-between gap-4 rounded-[14px] border border-line px-4 py-3 text-sm font-bold">
                Ask anonymously
                <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="size-5 accent-teal" />
              </label>

              {formError ? (
                <p role="alert" className="text-sm text-error">
                  {formError}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link href="/doubts" className="flex min-h-[52px] items-center justify-center rounded-full border-2 border-line px-6 font-bold">
                  Cancel
                </Link>
                <Button type="submit" disabled={addQuestion.isPending}>
                  {addQuestion.isPending ? "Posting…" : "Post doubt"}
                </Button>
              </div>
            </form>
          ) : null}
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          {similar.length > 0 ? (
            <div className="rounded-[20px] bg-teal-tint p-5">
              <h2 className="font-display text-lg font-bold">Already answered?</h2>
              <p className="mt-1 text-[13px] text-teal-text">Similar doubts found while you type:</p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {similar.map((s) => (
                  <li key={s.id}>
                    <Link href={`/doubts/${s.id}`} className="text-sm font-bold text-teal-text underline">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-[20px] border border-line bg-white p-5">
            <h2 className="font-display text-lg font-bold">Get better answers</h2>
            <ul className="mt-2 list-disc pl-5 text-sm leading-7 text-muted">
              <li>Be specific.</li>
              <li>Show your code or error.</li>
              <li>Say what you already tried.</li>
              <li>Add the right tags.</li>
            </ul>
          </div>
        </aside>
      </Main>
    </>
  );
}
