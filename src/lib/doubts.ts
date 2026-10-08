import { getSupabase } from "@/lib/supabase";
import { timeAgo } from "@/lib/format";

export type QuestionKind = "doubt" | "project";

export type Solution = {
  id: string;
  author: string;
  authorId: string | null;
  role: string;
  text: string;
  votes: number;
  accepted: boolean;
};

export type Question = {
  id: string;
  kind: QuestionKind;
  title: string;
  body: string;
  code?: string;
  topic: string;
  tags: string[];
  semester?: string;
  author: string;
  authorId: string | null;
  timeAgo: string;
  solutions: Solution[];
  /** Public addresses of screenshots attached to the doubt. */
  images: string[];
};

export type NewQuestion = {
  kind: QuestionKind;
  title: string;
  body: string;
  tags: string[];
  anonymous: boolean;
  /** Screenshots or error photos to attach. */
  images?: File[];
};

export const MAX_DOUBT_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function validateDoubtImages(files: File[]): string | null {
  if (files.length > MAX_DOUBT_IMAGES) return `You can attach up to ${MAX_DOUBT_IMAGES} images`;
  for (const f of files) {
    if (!IMAGE_TYPES.includes(f.type)) return "Only PNG, JPG or WebP images are allowed";
    if (f.size > MAX_IMAGE_BYTES) return "Each image can be up to 5 MB";
  }
  return null;
}

export const TOPICS = ["All", "Java", "Python", "C/C++", "DSA", "DBMS", "Web", "OS", "Networks", "AI/ML"] as const;
export const TAG_OPTIONS = ["Java", "Python", "C/C++", "DSA", "DBMS", "Web", "OS", "Networks", "AI/ML", "Exceptions", "Node.js"];
export const MIN_TITLE_LENGTH = 8;
export const MIN_BODY_LENGTH = 10;

type SolutionRow = {
  id: string;
  text: string;
  accepted: boolean;
  author_id: string | null;
  author_label: string | null;
  role_label: string | null;
  created_at: string;
  author: { name: string; headline: string | null } | null;
  votes_count: number;
};

type QuestionRow = {
  id: string;
  kind: QuestionKind;
  title: string;
  body: string;
  code: string | null;
  topic: string;
  tags: string[];
  semester: string | null;
  anonymous: boolean;
  author_id: string | null;
  author_label: string | null;
  created_at: string;
  author: { name: string } | null;
  solutions: SolutionRow[];
};

// Columns are listed on purpose: `questions.created_by` is private and select('*') would be refused.
// Vote totals come from `solutions.votes_count` because who voted is private, so guests cannot read `solution_votes`.
const QUESTION_SELECT = `
  id, kind, title, body, code, topic, tags, semester, anonymous, author_id, author_label, created_at,
  author:profiles(name),
  solutions(
    id, text, accepted, author_id, author_label, role_label, created_at,
    author:profiles(name, headline),
    votes_count
  )
`;

function mapQuestion(row: QuestionRow): Question {
  // Accepted answer first, then the most upvoted.
  const solutions = row.solutions
    .map<Solution>((s) => ({
      id: s.id,
      author: s.author?.name ?? s.author_label ?? "Student",
      authorId: s.author_id,
      role: s.role_label ?? s.author?.headline ?? "Student",
      text: s.text,
      votes: s.votes_count ?? 0,
      accepted: s.accepted,
    }))
    .sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.votes - a.votes);

  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    code: row.code ?? undefined,
    topic: row.topic,
    tags: row.tags,
    semester: row.semester ?? undefined,
    // Anonymous posts have no author_id, so nothing links them back to an account.
    author: row.anonymous ? "Anonymous" : (row.author?.name ?? row.author_label ?? "Student"),
    authorId: row.anonymous ? null : row.author_id,
    timeAgo: timeAgo(row.created_at),
    solutions,
    images: [],
  };
}

const publicUrl = (path: string) => getSupabase().storage.from("notes").getPublicUrl(path).data.publicUrl;

/** Image paths live in `questions.attachments`. Read on its own so the page still works before that column exists. */
async function fetchAttachments(id: string): Promise<string[]> {
  const { data, error } = await getSupabase().from("questions").select("attachments").eq("id", id).maybeSingle<{ attachments: string[] | null }>();
  if (error || !data?.attachments) return [];
  return data.attachments.map(publicUrl);
}

export async function fetchQuestions(): Promise<Question[]> {
  const { data, error } = await getSupabase()
    .from("questions")
    .select(QUESTION_SELECT)
    .order("created_at", { ascending: false })
    .overrideTypes<QuestionRow[], { merge: false }>();
  if (error) throw error;
  return data.map(mapQuestion);
}

export async function fetchQuestion(id: string): Promise<Question | null> {
  const { data, error } = await getSupabase()
    .from("questions")
    .select(QUESTION_SELECT)
    .eq("id", id)
    .maybeSingle<QuestionRow>();
  if (error) throw error;
  if (!data) return null;
  return { ...mapQuestion(data), images: await fetchAttachments(id) };
}

/** Ids of the solutions this user has upvoted. */
export async function fetchMyVotes(userId: string): Promise<string[]> {
  const { data, error } = await getSupabase()
    .from("solution_votes")
    .select("solution_id")
    .eq("user_id", userId)
    .overrideTypes<{ solution_id: string }[], { merge: false }>();
  if (error) throw error;
  return data.map((v) => v.solution_id);
}

export async function createQuestion(input: NewQuestion, userId: string): Promise<string> {
  const supabase = getSupabase();
  const paths: string[] = [];
  for (const file of input.images ?? []) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const path = `${userId}/doubts/${Date.now()}-${paths.length}-${safeName}`;
    const upload = await supabase.storage.from("notes").upload(path, file, { contentType: file.type });
    if (upload.error) {
      if (paths.length > 0) await supabase.storage.from("notes").remove(paths);
      throw upload.error;
    }
    paths.push(path);
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({
      kind: input.kind,
      title: input.title.trim(),
      body: input.body.trim(),
      topic: input.tags.find((t) => (TOPICS as readonly string[]).includes(t)) ?? "All",
      tags: input.tags,
      anonymous: input.anonymous,
      // Left empty for anonymous posts so nothing public links them to the account.
      author_id: input.anonymous ? null : userId,
      ...(paths.length > 0 ? { attachments: paths } : {}),
    })
    .select("id")
    .single();
  if (error) {
    if (paths.length > 0) await supabase.storage.from("notes").remove(paths); // do not leave orphaned files
    throw error;
  }
  return data.id as string;
}

export async function createSolution(questionId: string, text: string, userId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("solutions")
    .insert({ question_id: questionId, text: text.trim(), author_id: userId });
  if (error) throw error;
}

export async function setVote(solutionId: string, userId: string, voted: boolean): Promise<void> {
  const query = getSupabase().from("solution_votes");
  const { error } = voted
    ? await query.insert({ solution_id: solutionId, user_id: userId })
    : await query.delete().eq("solution_id", solutionId).eq("user_id", userId);
  if (error) throw error;
}

export type SimilarQuestion = { id: string; title: string };

/** Duplicate hint while asking. Uses the database search function when it exists, else nothing. */
export async function fetchSimilar(title: string): Promise<SimilarQuestion[]> {
  const { data, error } = await getSupabase().rpc("similar_questions", { p_title: title, p_limit: 3 });
  if (error || !data) return [];
  return (data as { id: string; title: string }[]).map((r) => ({ id: r.id, title: r.title }));
}

export type Helper = { id: string; name: string; points: number };

/** Top students by points. Empty when the leaderboard view is not available yet. */
export async function fetchTopHelpers(): Promise<Helper[]> {
  const { data, error } = await getSupabase()
    .from("leaderboard")
    .select("id, name, points")
    .order("points", { ascending: false })
    .limit(3);
  if (error || !data) return [];
  return data as Helper[];
}

export type DoubtHour = { id: string; title: string; startsAt: string };

/** Next upcoming Doubt Hour, if any. */
export async function fetchNextDoubtHour(): Promise<DoubtHour | null> {
  const { data, error } = await getSupabase()
    .from("doubt_hours")
    .select("id, title, starts_at")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string; title: string; starts_at: string }>();
  if (error || !data) return null;
  return { id: data.id, title: data.title, startsAt: data.starts_at };
}
