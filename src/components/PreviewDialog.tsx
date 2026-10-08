"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui";
import type { FileKind } from "@/lib/filePreview";

type PreviewDialogProps = {
  title: string;
  url: string;
  kind: FileKind;
  onClose: () => void;
  onDownload?: () => void;
};

type PdfState = { status: "loading" } | { status: "ready"; src: string } | { status: "error" };

/**
 * Modal viewer for a shared file. Images show directly. PDFs are fetched and shown from a local
 * blob, because the storage server marks its files as sandboxed, which stops browsers from
 * rendering a PDF embedded straight from its address.
 */
export function PreviewDialog({ title, url, kind, onClose, onDownload }: PreviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pdf, setPdf] = useState<PdfState>({ status: "loading" });
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (kind !== "pdf") return;
    const controller = new AbortController();
    let objectUrl: string | null = null;
    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load the file (${r.status})`);
        return r.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        setPdf({ status: "ready", src: objectUrl });
      })
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) setPdf({ status: "error" });
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [kind, url]);

  const failed = (kind === "pdf" && pdf.status === "error") || (kind === "image" && imageFailed) || kind === "other";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="preview-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close(); // click on the dimmed backdrop
      }}
      className="m-auto h-[88vh] w-[min(94vw,980px)] flex-col overflow-hidden rounded-[22px] border border-line bg-white p-0 text-indigo backdrop:bg-indigo/60 open:flex"
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <h2 id="preview-title" className="truncate font-display text-lg font-extrabold">
          {title}
        </h2>
        <button type="button" onClick={() => dialogRef.current?.close()} className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line hover:border-primary/50">
          <span className="sr-only">Close preview</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="relative min-h-0 flex-1 bg-segment/50">
        {kind === "pdf" && pdf.status === "loading" ? (
          <div role="status" className="flex h-full items-center justify-center gap-3 text-muted">
            <Spinner className="size-6" /> Loading preview…
          </div>
        ) : null}
        {kind === "pdf" && pdf.status === "ready" ? <iframe src={pdf.src} title={`${title} (PDF preview)`} className="size-full border-0 bg-white" /> : null}
        {kind === "image" && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- a user-uploaded file from another origin, shown at its real size
          <img src={url} alt={`Preview of ${title}`} onError={() => setImageFailed(true)} className="size-full object-contain" />
        ) : null}
        {failed ? (
          <div role="alert" className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="font-bold">
              {kind === "other" ? "This file type cannot be previewed here." : "The preview could not be loaded."}
            </p>
            <p className="text-sm text-muted">You can still open or download the file.</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-5 py-3 text-sm font-bold">
        <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 border-line px-5 py-2.5 hover:border-primary/50">
          Open in new tab
        </a>
        <a href={url} target="_blank" rel="noopener noreferrer" onClick={onDownload} className="rounded-full bg-primary px-5 py-2.5 text-white hover:opacity-90">
          Download
        </a>
      </div>
    </dialog>
  );
}
