import { getSupabase } from "@/lib/supabase";
import { timeAgo } from "@/lib/format";

export type PublicProfile = {
  id: string;
  name: string;
  college: string;
  headline: string;
  bio: string;
  role: string;
  points: number | null;
  solutionsCount: number;
  acceptedCount: number;
  notesCount: number;
  solutions: { id: string; text: string; accepted: boolean; questionId: string; questionTitle: string; timeAgo: string }[];
  notes: { id: string; title: string; type: string }[];
};

type ProfileRow = {
  name: string;
  college: string | null;
  headline: string | null;
  bio?: string | null;
  role?: string | null;
  points?: number | null;
};

async function count(table: "solutions" | "notes", column: "author_id" | "uploader_id", id: string, accepted = false) {
  let query = getSupabase().from(table).select("id", { count: "exact", head: true }).eq(column, id);
  if (accepted) query = query.eq("accepted", true);
  const { count: total, error } = await query;
  if (error) throw error;
  return total ?? 0;
}

export async function fetchPublicProfile(id: string): Promise<PublicProfile | null> {
  const supabase = getSupabase();

  // bio, role and points come from later migrations; fall back to the basics without them.
  let profile = await supabase.from("profiles").select("name, college, headline, bio, role, points").eq("id", id).maybeSingle<ProfileRow>();
  if (profile.error) {
    profile = await supabase.from("profiles").select("name, college, headline").eq("id", id).maybeSingle<ProfileRow>();
  }
  if (profile.error) throw profile.error;
  if (!profile.data) return null;

  const [solutionsCount, acceptedCount, notesCount, recent, notes] = await Promise.all([
    count("solutions", "author_id", id),
    count("solutions", "author_id", id, true),
    count("notes", "uploader_id", id),
    supabase
      .from("solutions")
      .select("id, text, accepted, created_at, question:questions(id, title)")
      .eq("author_id", id)
      .order("created_at", { ascending: false })
      .limit(10)
      .overrideTypes<{ id: string; text: string; accepted: boolean; created_at: string; question: { id: string; title: string } | null }[], { merge: false }>(),
    supabase.from("notes").select("id, title, type").eq("uploader_id", id).order("created_at", { ascending: false }).limit(10),
  ]);

  const p = profile.data;
  return {
    id,
    name: p.name,
    college: p.college ?? "",
    headline: p.headline ?? "",
    bio: p.bio ?? "",
    role: p.role ?? "student",
    points: p.points ?? null,
    solutionsCount,
    acceptedCount,
    notesCount,
    solutions: (recent.data ?? [])
      .filter((s) => s.question)
      .map((s) => ({
        id: s.id,
        text: s.text,
        accepted: s.accepted,
        questionId: s.question!.id,
        questionTitle: s.question!.title,
        timeAgo: timeAgo(s.created_at),
      })),
    notes: (notes.data ?? []) as { id: string; title: string; type: string }[],
  };
}
