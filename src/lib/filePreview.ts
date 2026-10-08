export type FileKind = "pdf" | "image" | "other";

/** What kind of file a note is, from its saved type or, failing that, its file extension. */
export function fileKind(mimeType: string | null, url: string | null): FileKind {
  const type = (mimeType ?? "").toLowerCase();
  const ext = (url ?? "").split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "image";
  return "other";
}
