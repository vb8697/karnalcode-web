import { getSupabase } from "@/lib/supabase";

export type Occupation = "student" | "working";

/** Everything on the profile form, as text so inputs can hold partial values. */
export type ProfileFormValues = {
  name: string;
  college: string;
  course: string;
  branch: string;
  occupation: Occupation;
  semester: string;
  jobTitle: string;
  company: string;
  graduationYear: string;
  bio: string;
};

export type ProfileDetails = ProfileFormValues & { completed: boolean };

export type FormErrors = Partial<Record<keyof ProfileFormValues, string>>;

/** Built-in suggestions. Empty on purpose: colleges come from the `colleges` table, or people type their own. */
export const COLLEGES: string[] = [];
export const COURSES = ["BCA", "MCA", "B.Tech", "M.Tech", "BSc IT", "Diploma", "Other"];
export const BRANCHES = ["CSE", "IT", "AI / ML", "Data Science", "Cyber Security", "Electronics", "Other"];
export const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const MAX_BIO_LENGTH = 500;
export const MAX_COLLEGE_LENGTH = 120;
export const MAX_CHOICE_LENGTH = 60;

export const emptyProfileForm: ProfileFormValues = {
  name: "",
  college: "",
  course: "",
  branch: "",
  occupation: "student",
  semester: "",
  jobTitle: "",
  company: "",
  graduationYear: "",
  bio: "",
};

const isBlank = (v: string) => v.trim().length === 0;
const isWholeNumber = (v: string) => /^\d+$/.test(v.trim());

/** The same rules the database enforces, so people see a problem before saving. */
export function validateProfileForm(v: ProfileFormValues, now = new Date()): FormErrors {
  const errors: FormErrors = {};
  if (v.name.trim().length < 2) errors.name = "Enter your name";
  if (isBlank(v.college)) errors.college = "Choose your college or type its name";
  else if (v.college.trim().length < 3 || v.college.trim().length > MAX_COLLEGE_LENGTH) {
    errors.college = `College name must be 3 to ${MAX_COLLEGE_LENGTH} characters`;
  }
  if (isBlank(v.course)) errors.course = "Choose or type your course";
  else if (v.course.trim().length > MAX_CHOICE_LENGTH) errors.course = `Keep it under ${MAX_CHOICE_LENGTH} characters`;
  if (isBlank(v.branch)) errors.branch = "Choose or type your branch";
  else if (v.branch.trim().length > MAX_CHOICE_LENGTH) errors.branch = `Keep it under ${MAX_CHOICE_LENGTH} characters`;

  if (v.occupation === "student") {
    if (!isWholeNumber(v.semester) || Number(v.semester) < 1 || Number(v.semester) > 12) {
      errors.semester = "Choose your semester";
    }
  } else {
    if (isBlank(v.jobTitle)) errors.jobTitle = "Enter your job title";
    if (isBlank(v.company)) errors.company = "Enter your company";
    if (!isBlank(v.graduationYear)) {
      const year = Number(v.graduationYear);
      const max = now.getFullYear() + 1;
      if (!isWholeNumber(v.graduationYear) || year < 1990 || year > max) {
        errors.graduationYear = `Enter a year between 1990 and ${max}`;
      }
    }
  }

  if (v.bio.trim().length > MAX_BIO_LENGTH) errors.bio = `Keep it under ${MAX_BIO_LENGTH} characters`;
  return errors;
}

/** Short line shown under the name, e.g. "BCA CSE · Sem 4" or "Software Engineer at Example Tech". */
export function buildHeadline(v: ProfileFormValues): string {
  if (v.occupation === "working") {
    return [v.jobTitle.trim(), v.company.trim()].filter(Boolean).join(" at ");
  }
  return [[v.course, v.branch].filter(Boolean).join(" "), v.semester ? `Sem ${v.semester}` : ""]
    .filter(Boolean)
    .join(" · ");
}

type DetailsRow = {
  name: string;
  college: string | null;
  course: string | null;
  branch: string | null;
  occupation: Occupation;
  semester: number | null;
  job_title: string | null;
  company: string | null;
  graduation_year: number | null;
  bio: string | null;
  profile_completed: boolean;
};

const COLUMNS =
  "name, college, course, branch, occupation, semester, job_title, company, graduation_year, bio, profile_completed";

export async function fetchProfileDetails(userId: string): Promise<ProfileDetails | null> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select(COLUMNS)
    .eq("id", userId)
    .maybeSingle<DetailsRow>();
  if (error) throw error;
  if (!data) return null;
  return {
    name: data.name,
    college: data.college ?? "",
    course: data.course ?? "",
    branch: data.branch ?? "",
    occupation: data.occupation,
    semester: data.semester === null ? "" : String(data.semester),
    jobTitle: data.job_title ?? "",
    company: data.company ?? "",
    graduationYear: data.graduation_year === null ? "" : String(data.graduation_year),
    bio: data.bio ?? "",
    completed: data.profile_completed,
  };
}

/** Saves the form and marks the profile complete. Fields of the other kind (job vs semester) are cleared. */
export async function saveProfileDetails(userId: string, v: ProfileFormValues): Promise<void> {
  const working = v.occupation === "working";
  const { data, error } = await getSupabase()
    .from("profiles")
    .update({
      name: v.name.trim(),
      college: v.college.trim(),
      course: v.course.trim(),
      branch: v.branch.trim(),
      occupation: v.occupation,
      semester: working ? null : Number(v.semester),
      job_title: working ? v.jobTitle.trim() : null,
      company: working ? v.company.trim() : null,
      graduation_year: working && v.graduationYear.trim() ? Number(v.graduationYear) : null,
      bio: v.bio.trim() || null,
      headline: buildHeadline(v),
      profile_completed: true,
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Your profile could not be found. Sign out and sign in again.");
}

/** College names from the database, falling back to the built-in list when empty or unreachable. */
export async function fetchColleges(): Promise<string[]> {
  const { data, error } = await getSupabase().from("colleges").select("name").order("name");
  if (error || !data || data.length === 0) return COLLEGES;
  return data.map((c: { name: string }) => c.name);
}

/** Where to send someone right after signing in: finish the profile first, otherwise the home screen. */
export async function routeAfterSignIn(userId: string): Promise<"/" | "/complete-profile"> {
  try {
    return (await fetchProfileDetails(userId))?.completed ? "/" : "/complete-profile";
  } catch {
    return "/"; // profile unreadable: do not block sign-in
  }
}
