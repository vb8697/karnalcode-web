"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OtherChipGroup } from "@/components/OtherChipGroup";
import { SignInPrompt } from "@/components/SignInPrompt";
import { SiteHeader } from "@/components/SiteHeader";
import { Button, ChipGroup, Main, Notice, PageHeader, SelectField, TextArea, TextField } from "@/components/ui";
import { validateNoteFile } from "@/lib/notes";
import { COURSES, SEMESTERS } from "@/lib/profile";
import { useUploadNote } from "@/lib/queries";
import { schemeYears, syllabusTitle, validateSyllabusForm, WHOLE_COURSE, type SyllabusErrors } from "@/lib/syllabus";
import { useSession } from "@/lib/useSession";

const YEARS = schemeYears();

/** The database update for syllabus may not be applied yet; say so plainly instead of a raw error. */
function explain(message: string) {
  return /scheme_year|schema cache|column/i.test(message)
    ? "Syllabus details are not available yet. Apply the latest database migration (20260930110000_syllabus.sql) and try again."
    : message;
}

export default function ShareSyllabusPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const upload = useUploadNote();
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [schemeYear, setSchemeYear] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<SyllabusErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const clear = (key: keyof SyllabusErrors) => setErrors((p) => ({ ...p, [key]: undefined }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = validateSyllabusForm({ course, semester });
    const fileError = validateNoteFile(file);
    if (fileError) found.file = fileError;
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0 || !file) return;

    const semesterNumber = semester === WHOLE_COURSE ? null : Number(semester);
    try {
      await upload.mutateAsync({
        title: syllabusTitle(course, semesterNumber, subject),
        type: "SYL",
        topic: "All",
        description: note,
        file,
        syllabus: { course, semester: semesterNumber, subject, schemeYear: schemeYear ? Number(schemeYear) : null },
      });
      router.push("/syllabus");
    } catch (e) {
      setFormError(explain(e instanceof Error ? e.message : "Could not upload the syllabus. Please try again."));
    }
  }

  return (
    <>
      <SiteHeader />
      <Main className="mx-auto w-full max-w-2xl px-5 py-8">
        <PageHeader title="Share a syllabus" description="Help others know what to study. Share the official syllabus for a course or semester." />

        <div className="mt-7">
          {loading ? <Notice>Loading…</Notice> : null}
          {!loading && !session ? <SignInPrompt message="Sign in with your college email to share a syllabus." /> : null}

          {session ? (
            <form onSubmit={submit} noValidate className="flex flex-col gap-6 rounded-[22px] border border-line bg-white p-6">
              <OtherChipGroup
                label="Course"
                options={COURSES}
                value={course}
                onChange={(v) => {
                  setCourse(v);
                  clear("course");
                }}
                error={errors.course}
                customPlaceholder="e.g. BBA, B.Sc Computer Science"
              />
              <ChipGroup
                label="Semester"
                options={[WHOLE_COURSE, ...SEMESTERS]}
                value={semester}
                onChange={(v) => {
                  setSemester(v);
                  clear("semester");
                }}
                error={errors.semester}
              />
              <TextField
                label="Subject (optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                hint="Leave empty if the file covers all subjects of the semester"
                placeholder="e.g. Data Structures"
                maxLength={80}
              />
              <SelectField label="Scheme year (optional)" options={YEARS} value={schemeYear} placeholder="Choose the year" onChange={setSchemeYear} />
              <TextArea label="Note (optional)" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />

              <div>
                <label htmlFor="syllabus-file" className="mb-1.5 block text-[13px] font-bold">
                  Syllabus file (PDF, PNG, JPG or WebP, up to 20 MB)
                </label>
                <input
                  id="syllabus-file"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    clear("file");
                  }}
                  aria-describedby={errors.file ? "syllabus-file-error" : undefined}
                  className="block w-full rounded-[14px] border-2 border-dashed border-primary bg-peach px-4 py-4 text-sm"
                />
                {errors.file ? (
                  <p id="syllabus-file-error" role="alert" className="mt-1.5 text-[13px] font-medium text-error">
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
                <Link href="/syllabus" className="flex min-h-[52px] items-center justify-center rounded-full border-2 border-line px-6 font-bold">
                  Cancel
                </Link>
                <Button type="submit" loading={upload.isPending}>
                  {upload.isPending ? "Uploading…" : "Share syllabus"}
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </Main>
    </>
  );
}
