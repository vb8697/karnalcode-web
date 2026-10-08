import { AttachmentThumb } from "@/components/AttachmentThumb";
import { PreviewButton } from "@/components/PreviewButton";
import { Tag } from "@/components/ui";
import type { Note } from "@/lib/notes";
import { examTypeLabel } from "@/lib/papers";

type PaperCardProps = {
  paper: Note;
  saved: boolean;
  canSave: boolean;
  onToggleSave: () => void;
  onDownload: () => void;
};

export function PaperCard({ paper, saved, canSave, onToggleSave, onDownload }: PaperCardProps) {
  const details = [paper.course, paper.semester ? `Sem ${paper.semester}` : null].filter(Boolean).join(" · ");

  return (
    <article className="flex gap-4 rounded-[18px] border border-line bg-white p-4 transition-shadow hover:shadow-[0_12px_30px_-18px_rgba(31,42,92,0.35)]">
      {paper.fileUrl ? (
        <PreviewButton title={paper.subject ? `${paper.subject} ${paper.examYear ?? ""}`.trim() : paper.title} url={paper.fileUrl} mimeType={paper.mimeType} onDownload={onDownload} className="shrink-0 self-start rounded-2xl hover:opacity-80">
      <AttachmentThumb
        url={paper.fileUrl}
        mimeType={paper.mimeType}
        label={paper.subject ?? paper.title}
        className="h-20 w-16 shrink-0 rounded-2xl"
        fallback={
          <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-teal-tint text-teal-text">
            <span className="font-display text-xl font-extrabold leading-none">{paper.examYear ?? "PYQ"}</span>
            <span className="mt-1 text-[10px] font-bold tracking-wider">PAPER</span>
          </div>
        }
      />
        </PreviewButton>
      ) : (
      <AttachmentThumb
        url={paper.fileUrl}
        mimeType={paper.mimeType}
        label={paper.subject ?? paper.title}
        className="h-20 w-16 shrink-0 rounded-2xl"
        fallback={
          <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-teal-tint text-teal-text">
            <span className="font-display text-xl font-extrabold leading-none">{paper.examYear ?? "PYQ"}</span>
            <span className="mt-1 text-[10px] font-bold tracking-wider">PAPER</span>
          </div>
        }
      />
      )}
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-lg font-extrabold leading-snug">{paper.subject ?? paper.title}</h2>
        <p className="mt-0.5 text-[13px] text-muted">
          {[details, examTypeLabel(paper.examType)].filter(Boolean).join(" · ") || paper.title}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>By {paper.uploader}</span>
          {paper.downloads !== null ? <Tag tone="indigo">{`${paper.downloads} downloads`}</Tag> : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-2 text-[13px] font-bold">
        {paper.fileUrl ? (
          <PreviewButton
            title={paper.subject ? `${paper.subject} ${paper.examYear ?? ""}`.trim() : paper.title}
            url={paper.fileUrl}
            mimeType={paper.mimeType}
            onDownload={onDownload}
            className="rounded-full border-2 border-line px-4 py-1.5 hover:border-primary/50"
          />
        ) : null}
        {paper.fileUrl ? (
          <a
            href={paper.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDownload}
            className="rounded-full bg-primary px-4 py-2 text-white hover:opacity-90"
            aria-label={`Download ${paper.subject ?? paper.title} paper`}
          >
            Download
          </a>
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
