"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignInPrompt } from "@/components/SignInPrompt";
import { SiteHeader } from "@/components/SiteHeader";
import { Button, ChipGroup, Notice, TextArea, TextField, Main } from "@/components/ui";
import { TOPICS } from "@/lib/doubts";
import { validateNoteFile, type NoteType } from "@/lib/notes";
import { useUploadNote } from "@/lib/queries";
import { useSession } from "@/lib/useSession";

const TYPES: { label: string; value: NoteType }[] = [
  { label: "Notes (PDF)", value: "PDF" },
  { label: "Previous year paper", value: "PYQ" },
  { label: "Handwritten / image", value: "IMG" },
  { label: "Syllabus", value: "SYL" },
];

export default function ShareNotesPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const upload = useUploadNote();
  const [title, setTitle] = useState("");
  const [typeLabel, setTypeLabel] = useState(TYPES[0].label);
  const [topic, setTopic] = useState("All");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ title?: string; file?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found: { title?: string; file?: string } = {};
    if (title.trim().length < 3) found.title = "Give the note a title";
    const fileError = validateNoteFile(file);
    if (fileError) found.file = fileError;
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0 || !file) return;

    try {
      await upload.mutateAsync({
        title,
        type: TYPES.find((t) => t.label === typeLabel)?.value ?? "PDF",
        topic,
        description,
        file,
      });
      router.push("/notes");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not upload your note. Please try again.");
    }
  }

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Share your notes</h1>
        <p className="mb-7 mt-2 text-muted">Only share your own work or papers you may share. Textbook PDFs are not allowed.</p>

        {loading ? <Notice>Loading…</Notice> : null}
        {!loading && !session ? <SignInPrompt message="Sign in with your college email to share notes." /> : null}

        {session ? (
          <form onSubmit={submit} noValidate className="flex flex-col gap-6 rounded-[22px] border border-line bg-white p-6">
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder="e.g. DBMS Unit 3: Normalization" maxLength={120} />
            <ChipGroup label="Kind of file" options={TYPES.map((t) => t.label)} value={typeLabel} onChange={setTypeLabel} />
            <ChipGroup label="Topic" options={TOPICS} value={topic} onChange={setTopic} />
            <TextArea label="Description (optional)" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
            <div>
              <label htmlFor="note-file" className="mb-1.5 block text-[13px] font-bold">
                File (PDF, PNG, JPG or WebP, up to 20 MB)
              </label>
              <input
                id="note-file"
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setErrors((p) => ({ ...p, file: undefined }));
                }}
                aria-describedby={errors.file ? "note-file-error" : undefined}
                className="block w-full rounded-[14px] border-2 border-dashed border-primary bg-peach px-4 py-4 text-sm"
              />
              {errors.file ? (
                <p id="note-file-error" role="alert" className="mt-1.5 text-xs text-error">
                  {errors.file}
                </p>
              ) : null}
            </div>
            {formError ? (
              <p role="alert" className="text-sm text-error">
                {formError}
              </p>
            ) : null}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link href="/notes" className="flex min-h-[52px] items-center justify-center rounded-full border-2 border-line px-6 font-bold">
                Cancel
              </Link>
              <Button type="submit" disabled={upload.isPending}>
                {upload.isPending ? "Uploading…" : "Share note"}
              </Button>
            </div>
          </form>
        ) : null}
      </Main>
    </>
  );
}
