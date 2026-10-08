import { AttachmentThumb } from "@/components/AttachmentThumb";
import { PreviewButton } from "@/components/PreviewButton";
import { Tag } from "@/components/ui";
import type { Note, NoteType } from "@/lib/notes";

const BADGE: Record<NoteType, string> = {
  PDF: "bg-peach text-peach-text",
  PYQ: "bg-teal-tint text-teal-text",
  IMG: "bg-indigo-tint text-indigo",
  SYL: "bg-sun-tint text-[#7a5b00]",
};

type NoteCardProps = {
  note: Note;
  saved: boolean;
  canSave: boolean;
  onToggleSave: () => void;
  onDownload: () => void;
};

export function NoteCard({ note, saved, canSave, onToggleSave, onDownload }: NoteCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-4">
      {note.fileUrl ? (
        <PreviewButton title={note.title} url={note.fileUrl} mimeType={note.mimeType} onDownload={onDownload} className="block w-full rounded-xl hover:opacity-80">
      <AttachmentThumb
        url={note.fileUrl}
        mimeType={note.mimeType}
        label={note.title}
        className="h-24 w-full rounded-xl"
        fallback={<div className={`flex h-24 items-center justify-center rounded-xl text-sm font-extrabold ${BADGE[note.type]}`}>{note.type}</div>}
      />
        </PreviewButton>
      ) : (
      <AttachmentThumb
        url={note.fileUrl}
        mimeType={note.mimeType}
        label={note.title}
        className="h-24 w-full rounded-xl"
        fallback={<div className={`flex h-24 items-center justify-center rounded-xl text-sm font-extrabold ${BADGE[note.type]}`}>{note.type}</div>}
      />
      )}
      <div>
        <h2 className="text-[15px] font-bold leading-snug">{note.title}</h2>
        <p className="mt-1 text-xs text-muted">{note.uploader}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Tag tone="indigo">{note.topic}</Tag>
          {note.meta ? <Tag tone="teal">{note.meta}</Tag> : null}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 text-[13px]">
        <span className="font-bold text-teal-text">
          {note.downloads !== null ? `${note.downloads} downloads` : `${note.rating} rating`}
        </span>
        <span className="flex items-center gap-3">
          {canSave ? (
            <button type="button" onClick={onToggleSave} aria-pressed={saved} className={`font-bold ${saved ? "text-teal-text" : "text-muted hover:text-primary"}`}>
              {saved ? "Saved" : "Save"}
            </button>
          ) : null}
          {note.fileUrl ? (
            <PreviewButton title={note.title} url={note.fileUrl} mimeType={note.mimeType} onDownload={onDownload} className="font-bold text-indigo hover:text-primary" />
          ) : null}
          {note.fileUrl ? (
            <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" onClick={onDownload} className="font-bold text-primary">
              Get
            </a>
          ) : (
            <span className="text-muted" title="No file attached yet">
              No file
            </span>
          )}
        </span>
      </div>
    </article>
  );
}
