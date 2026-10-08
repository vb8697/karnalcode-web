import { getSupabase } from "@/lib/supabase";

export type NoteType = "PDF" | "PYQ" | "IMG" | "SYL";

export type Note = {
  id: string;
  title: string;
  uploader: string;
  meta: string;
  type: NoteType;
  topic: string;
  rating: string;
  downloads: number | null;
  fileUrl: string | null;
  mimeType: string | null;
  // Filled for previous year papers.
  course: string | null;
  semester: number | null;
  subject: string | null;
  examYear: number | null;
  examType: string | null;
  // Filled for syllabus: the year the scheme started.
  schemeYear: number | null;
};

export const NOTE_TYPE_FILTERS = ["All types", "Notes", "PYQs", "Syllabus"] as const;
export type NoteTypeFilter = (typeof NOTE_TYPE_FILTERS)[number];
export const NOTE_TYPE_MAP: Record<NoteTypeFilter, NoteType[] | null> = {
  "All types": null,
  Notes: ["PDF", "IMG"],
  PYQs: ["PYQ"],
  Syllabus: ["SYL"],
};

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

type NoteRow = {
  id: string;
  title: string;
  type: NoteType;
  topic: string;
  meta: string | null;
  rating: number | null;
  uploader_label: string | null;
  uploader: { name: string } | null;
  file_path?: string | null;
  mime_type?: string | null;
  download_count?: number | null;
  course?: string | null;
  semester?: number | null;
  subject?: string | null;
  exam_year?: number | null;
  exam_type?: string | null;
  scheme_year?: number | null;
};

const BASE = "id, title, type, topic, meta, rating, uploader_label, uploader:profiles(name)";
const EXTENDED = `${BASE}, file_path, mime_type, download_count`;
const WITH_PAPERS = `${EXTENDED}, course, semester, subject, exam_year, exam_type`;
const WITH_SYLLABUS = `${WITH_PAPERS}, scheme_year`;

function mapNote(n: NoteRow): Note {
  return {
    id: n.id,
    title: n.title,
    uploader: n.uploader_label ?? n.uploader?.name ?? "Student",
    meta: n.meta ?? "",
    type: n.type,
    topic: n.topic,
    rating: n.rating === null ? "–" : n.rating.toFixed(1),
    downloads: n.download_count ?? null,
    fileUrl: n.file_path ? getSupabase().storage.from("notes").getPublicUrl(n.file_path).data.publicUrl : null,
    mimeType: n.mime_type ?? null,
    course: n.course ?? null,
    semester: n.semester ?? null,
    subject: n.subject ?? null,
    examYear: n.exam_year ?? null,
    examType: n.exam_type ?? null,
    schemeYear: n.scheme_year ?? null,
  };
}

export async function fetchNotes(): Promise<Note[]> {
  const supabase = getSupabase();
  // Files, downloads and paper details come from later migrations, so fall back step by step.
  let result;
  for (const select of [WITH_SYLLABUS, WITH_PAPERS, EXTENDED, BASE]) {
    result = await supabase.from("notes").select(select).order("created_at", { ascending: false }).overrideTypes<NoteRow[], { merge: false }>();
    if (!result.error) break;
  }
  if (!result || result.error) throw result?.error ?? new Error("Could not load notes");
  return result.data.map(mapNote);
}

export async function fetchMySaves(userId: string): Promise<string[]> {
  const { data, error } = await getSupabase().from("note_saves").select("note_id").eq("user_id", userId);
  if (error || !data) return []; // table not created yet
  return (data as { note_id: string }[]).map((r) => r.note_id);
}

export async function setSaved(noteId: string, userId: string, saved: boolean): Promise<void> {
  const query = getSupabase().from("note_saves");
  const { error } = saved
    ? await query.insert({ note_id: noteId, user_id: userId })
    : await query.delete().eq("note_id", noteId).eq("user_id", userId);
  if (error) throw error;
}

export async function recordDownload(noteId: string): Promise<void> {
  await getSupabase().rpc("record_note_download", { p_note_id: noteId });
}

export type PaperDetails = { course: string; semester: number; subject: string; examYear: number; examType: string };

export type NewNote = {
  title: string;
  type: NoteType;
  topic: string;
  description: string;
  file: File;
  /** Set when sharing a previous year paper. */
  paper?: PaperDetails;
  /** Set when sharing a syllabus. `semester` is null for a whole-course syllabus. */
  syllabus?: { course: string; semester: number | null; subject: string; schemeYear: number | null };
};

export function validateNoteFile(file: File | null): string | null {
  if (!file) return "Choose a file to share";
  if (!ALLOWED_TYPES.includes(file.type)) return "Only PDF, PNG, JPG or WebP files are allowed";
  if (file.size > MAX_FILE_BYTES) return "Files can be up to 20 MB";
  return null;
}

/** Uploads the file into the user's own folder, then creates the note row pointing at it. */
export async function uploadNote(input: NewNote, userId: string): Promise<void> {
  const supabase = getSupabase();
  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const path = `${userId}/${Date.now()}-${safeName}`;

  const upload = await supabase.storage.from("notes").upload(path, input.file, { contentType: input.file.type });
  if (upload.error) throw upload.error;

  const { error } = await supabase.from("notes").insert({
    title: input.title.trim(),
    type: input.type,
    topic: input.topic,
    description: input.description.trim() || null,
    uploader_id: userId,
    file_path: path,
    file_size: input.file.size,
    mime_type: input.file.type,
    ...(input.paper
      ? {
          course: input.paper.course.trim(),
          semester: input.paper.semester,
          subject: input.paper.subject.trim(),
          exam_year: input.paper.examYear,
          exam_type: input.paper.examType,
        }
      : {}),
    ...(input.syllabus
      ? {
          course: input.syllabus.course.trim(),
          semester: input.syllabus.semester,
          subject: input.syllabus.subject.trim() || null,
          scheme_year: input.syllabus.schemeYear,
        }
      : {}),
  });
  if (error) {
    await supabase.storage.from("notes").remove([path]); // do not leave an orphaned file
    throw error;
  }
}
