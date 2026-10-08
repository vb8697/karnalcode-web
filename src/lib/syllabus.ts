import type { Note } from "@/lib/notes";

export const WHOLE_COURSE = "Whole course";

export function syllabusTitle(course: string, semester: number | null, subject: string) {
  const scope = semester ? `Semester ${semester}` : "full course";
  const subjectPart = subject.trim() ? ` · ${subject.trim()}` : "";
  return `${course.trim()} ${scope} syllabus${subjectPart}`;
}

/** Years offered for the scheme: this year back to 2010. */
export function schemeYears(now = new Date()): string[] {
  const years: string[] = [];
  for (let y = now.getFullYear(); y >= 2010; y -= 1) years.push(String(y));
  return years;
}

export type SyllabusFormValues = { course: string; semester: string };
export type SyllabusErrors = Partial<Record<keyof SyllabusFormValues | "file", string>>;

export function validateSyllabusForm(v: SyllabusFormValues): SyllabusErrors {
  const errors: SyllabusErrors = {};
  if (!v.course.trim()) errors.course = "Choose or type the course";
  else if (v.course.trim().length > 60) errors.course = "Keep it under 60 characters";
  if (!v.semester) errors.semester = "Choose a semester, or Whole course";
  return errors;
}

export type SyllabusFilters = { course: string; semester: string; query: string };
export const ALL = "All";

/** Only syllabus notes, filtered, with whole-course files first and then by semester. */
export function selectSyllabus(notes: readonly Note[], f: SyllabusFilters): Note[] {
  const needle = f.query.trim().toLowerCase();
  return notes
    .filter((n) => n.type === "SYL")
    .filter(
      (n) =>
        (f.course === ALL || n.course === f.course) &&
        (f.semester === ALL || (f.semester === WHOLE_COURSE ? n.semester === null : String(n.semester) === f.semester)) &&
        (!needle || `${n.title} ${n.subject ?? ""}`.toLowerCase().includes(needle)),
    )
    .sort((a, b) => (a.course ?? "").localeCompare(b.course ?? "") || (a.semester ?? 0) - (b.semester ?? 0));
}

/** Syllabus for the home page: the user's course and semester first. */
export function syllabusForYou(notes: readonly Note[], course: string | null, semester: string | null, limit = 3): Note[] {
  const score = (n: Note) => (course && n.course === course ? 2 : 0) + (semester && String(n.semester) === semester ? 1 : 0);
  return notes
    .filter((n) => n.type === "SYL")
    .sort((a, b) => score(b) - score(a) || (b.schemeYear ?? 0) - (a.schemeYear ?? 0))
    .slice(0, limit);
}
