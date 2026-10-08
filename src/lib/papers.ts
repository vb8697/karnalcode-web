import type { Note } from "@/lib/notes";

export const EXAM_TYPES = [
  { label: "Mid-term", value: "midterm" },
  { label: "End-semester", value: "endsem" },
  { label: "University exam", value: "university" },
  { label: "Other", value: "other" },
] as const;

export const examTypeLabel = (value: string | null) => EXAM_TYPES.find((t) => t.value === value)?.label ?? "";

/** Years offered when sharing a paper: this year back to 2005. */
export function examYears(now = new Date()): string[] {
  const years: string[] = [];
  for (let y = now.getFullYear(); y >= 2005; y -= 1) years.push(String(y));
  return years;
}

export function paperTitle(subject: string, examType: string, year: string) {
  return `${subject.trim()} · ${examTypeLabel(examType)} ${year}`.replace(/\s+/g, " ").trim();
}

export type PaperFormValues = { subject: string; course: string; semester: string; examYear: string; examType: string };
export type PaperErrors = Partial<Record<keyof PaperFormValues | "file", string>>;

export function validatePaperForm(v: PaperFormValues): PaperErrors {
  const errors: PaperErrors = {};
  if (v.subject.trim().length < 2) errors.subject = "Enter the subject name";
  if (!v.course.trim()) errors.course = "Choose or type the course";
  else if (v.course.trim().length > 60) errors.course = "Keep it under 60 characters";
  if (!v.semester) errors.semester = "Choose the semester";
  if (!v.examYear) errors.examYear = "Choose the exam year";
  if (!v.examType) errors.examType = "Choose the kind of exam";
  return errors;
}

export type PaperFilters = { course: string; semester: string; year: string; query: string };

export const ALL = "All";

/** Only PYQ notes, filtered and sorted newest exam first. */
export function selectPapers(notes: readonly Note[], f: PaperFilters): Note[] {
  const needle = f.query.trim().toLowerCase();
  return notes
    .filter((n) => n.type === "PYQ")
    .filter(
      (n) =>
        (f.course === ALL || n.course === f.course) &&
        (f.semester === ALL || String(n.semester) === f.semester) &&
        (f.year === ALL || String(n.examYear) === f.year) &&
        (!needle || `${n.title} ${n.subject ?? ""}`.toLowerCase().includes(needle)),
    )
    .sort((a, b) => (b.examYear ?? 0) - (a.examYear ?? 0));
}

/** Papers for the home page: the user's own course and semester first, then newest exam year. */
export function papersForYou(notes: readonly Note[], course: string | null, semester: string | null, limit = 4): Note[] {
  const score = (n: Note) => (course && n.course === course ? 2 : 0) + (semester && String(n.semester) === semester ? 1 : 0);
  return notes
    .filter((n) => n.type === "PYQ")
    .sort((a, b) => score(b) - score(a) || (b.examYear ?? 0) - (a.examYear ?? 0))
    .slice(0, limit);
}
