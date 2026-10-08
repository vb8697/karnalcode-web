import { PreviewButton } from "@/components/PreviewButton";
import { Tag } from "@/components/ui";
import type { Note } from "@/lib/notes";

type SyllabusCardProps = {
  syllabus: Note;
  saved: boolean;
  canSave: boolean;
  onToggleSave: () => void;
  onDownload: () => void;
};

export function SyllabusCard({ syllabus, saved, canSave, onToggleSave, onDownload }: SyllabusCardProps) {
  const scope = syllabus.semester ? `Semester ${syllabus.semester}` : "Whole course";

  return (
    <article className="flex gap-4 rounded-[18px] border border-line bg-white p-4 transition-shadow hover:shadow-[0_12px_30px_-18px_rgba(31,42,92,0.35)]">
      <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-sun-tint text-[#7a5b00]">
        <span className="font-display text-xl font-extrabold leading-none">{syllabus.semester ?? "All"}</span>
        <span className="mt-1 text-[10px] font-bold tracking-wider">{syllabus.semester ? "SEM" : "SEMS"}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-lg font-extrabold leading-snug">
          {syllabus.course ?? "Course"} · {scope}
        </h2>
        <p className="mt-0.5 text-[13px] text-muted">{syllabus.subject ? syllabus.subject : "All subjects"}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>By {syllabus.uploader}</span>
          {syllabus.schemeYear ? <Tag tone="sun">{`Scheme ${syllabus.schemeYear}`}</Tag> : null}
          {syllabus.downloads !== null ? <Tag tone="indigo">{`${syllabus.downloads} downloads`}</Tag> : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-2 text-[13px] font-bold">
        {syllabus.fileUrl ? (
          <>
            <PreviewButton
              title={`${syllabus.course ?? ""} ${scope} syllabus`.trim()}
              url={syllabus.fileUrl}
              mimeType={syllabus.mimeType}
              onDownload={onDownload}
              className="rounded-full border-2 border-line px-4 py-1.5 hover:border-primary/50"
            />
            <a
              href={syllabus.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onDownload}
              className="rounded-full bg-primary px-4 py-2 text-white hover:opacity-90"
              aria-label={`Download ${syllabus.course ?? ""} ${scope} syllabus`}
            >
              Download
            </a>
          </>
        ) : (
          <span className="text-muted" title="No file attached yet">
            No file
          </span>
        )}
        {canSave ? (
          <button type="button" onClick={onToggleSave} aria-pressed={saved} className={saved ? "text-teal-text" : "text-muted hover:text-primary"}>
            {saved ? "Saved" : "Save"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
