"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OtherChipGroup } from "@/components/OtherChipGroup";
import { SignInPrompt } from "@/components/SignInPrompt";
import { SiteHeader } from "@/components/SiteHeader";
import { Button, ChipGroup, Main, Notice, PageHeader, SelectField, TextArea, TextField } from "@/components/ui";
import { validateNoteFile } from "@/lib/notes";
import { EXAM_TYPES, examYears, paperTitle, validatePaperForm, type PaperErrors } from "@/lib/papers";
import { COURSES, SEMESTERS } from "@/lib/profile";
import { useUploadNote } from "@/lib/queries";
import { useSession } from "@/lib/useSession";

const YEARS = examYears();

/** The database update for papers may not be applied yet; say so plainly instead of a raw error. */
function explain(message: string) {
  return /exam_year|exam_type|schema cache|column/i.test(message)
    ? "Paper details are not available yet. Apply the latest database migration (20260930090000_previous_papers.sql) and try again."
    : message;
}

export default function SharePaperPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const upload = useUploadNote();
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [examYear, setExamYear] = useState("");
  const [examTypeLabel, setExamTypeLabel] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<PaperErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const examType = EXAM_TYPES.find((t) => t.label === examTypeLabel)?.value ?? "";
  const clear = (key: keyof PaperErrors) => setErrors((p) => ({ ...p, [key]: undefined }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = validatePaperForm({ subject, course, semester, examYear, examType });
    const fileError = validateNoteFile(file);
    if (fileError) found.file = fileError;
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0 || !file) return;

    try {
      await upload.mutateAsync({
        title: paperTitle(subject, examType, examYear),
        type: "PYQ",
        topic: "All",
        description: note,
        file,
        paper: { course, semester: Number(semester), subject, examYear: Number(examYear), examType },
      });
      router.push("/papers");
    } catch (e) {
      setFormError(explain(e instanceof Error ? e.message : "Could not upload the paper. Please try again."));
    }
  }

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto w-full max-w-2xl px-5 py-8">
        <PageHeader
          title="Share a previous year paper"
          description="Help the next batch. Share question papers you have, not textbooks or answer keys you do not own."
        />

        <div className="mt-7">
          {loading ? <Notice>Loading…</Notice> : null}
          {!loading && !session ? <SignInPrompt message="Sign in with your college email to share a paper." /> : null}

          {session ? (
            <form onSubmit={submit} noValidate className="flex flex-col gap-6 rounded-[22px] border border-line bg-white p-6">
              <TextField
                label="Subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  clear("subject");
                }}
                error={errors.subject}
                placeholder="e.g. Data Structures"
                maxLength={80}
              />
              <OtherChipGroup label="Course" options={COURSES} value={course} onChange={(v) => { setCourse(v); clear("course"); }} error={errors.course} customPlaceholder="e.g. BBA, B.Sc Computer Science" />
              <ChipGroup label="Semester" options={SEMESTERS} value={semester} onChange={(v) => { setSemester(v); clear("semester"); }} error={errors.semester} />
              <SelectField label="Exam year" options={YEARS} value={examYear} placeholder="Choose the year" onChange={(v) => { setExamYear(v); clear("examYear"); }} error={errors.examYear} />
              <ChipGroup
                label="Kind of exam"
                options={EXAM_TYPES.map((t) => t.label)}
                value={examTypeLabel}
                onChange={(v) => { setExamTypeLabel(v); clear("examType"); }}
                error={errors.examType}
              />
              <TextArea label="Note (optional)" rows={3} value={note} onChange={(e) => setNote(e.target.value)} hint="Anything that helps, like the set or shift" maxLength={1000} />

              <div>
                <label htmlFor="paper-file" className="mb-1.5 block text-[13px] font-bold">
                  Paper file (PDF, PNG, JPG or WebP, up to 20 MB)
                </label>
                <input
                  id="paper-file"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    clear("file");
                  }}
                  aria-describedby={errors.file ? "paper-file-error" : undefined}
                  className="block w-full rounded-[14px] border-2 border-dashed border-primary bg-peach px-4 py-4 text-sm"
                />
                {errors.file ? (
                  <p id="paper-file-error" role="alert" className="mt-1.5 text-[13px] font-medium text-error">
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
                <Link href="/papers" className="flex min-h-[52px] items-center justify-center rounded-full border-2 border-line px-6 font-bold">
                  Cancel
                </Link>
                <Button type="submit" loading={upload.isPending}>
                  {upload.isPending ? "Uploading…" : "Share paper"}
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </Main>
    </>
  );
}
