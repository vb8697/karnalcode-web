"use client";

import { useEffect, useState, type ReactNode } from "react";
import { fileKind } from "@/lib/filePreview";

type AttachmentThumbProps = {
  url: string | null;
  mimeType: string | null;
  label: string;
  /** Shown when there is no file, or an image fails to load. */
  fallback: ReactNode;
  className?: string;
};

/** Renders page 1 of a PDF to a small image. Loaded on demand so the PDF library stays out of the main bundle. */
async function renderFirstPage(url: string, signal: AbortSignal): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Could not load the file (${res.status})`);
  const task = pdfjs.getDocument({ data: await res.arrayBuffer() });
  const doc = await task.promise;
  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 360 / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvas, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    void task.destroy();
  }
}

/** Small view of a shared file: the image itself, or a PDF tile. */
export function AttachmentThumb({ url, mimeType, label, fallback, className = "" }: AttachmentThumbProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const kind = url ? fileKind(mimeType, url) : "other";
  const [pdfPage, setPdfPage] = useState<string | null>(null);

  useEffect(() => {
    if (!url || kind !== "pdf") return;
    const controller = new AbortController();
    renderFirstPage(url, controller.signal)
      .then(setPdfPage)
      .catch(() => {}); // keep the PDF tile
    return () => controller.abort();
  }, [url, kind]);

  if (pdfPage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- a data URL rendered from the PDF's first page
      <img src={pdfPage} alt={`First page of ${label}`} className={`overflow-hidden border border-line bg-white object-cover object-top ${className}`} />
    );
  }

  if (url && kind === "image" && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- a user-uploaded file from another origin
      <img src={url} alt={`Attached image: ${label}`} loading="lazy" onError={() => setImageFailed(true)} className={`overflow-hidden border border-line bg-segment object-cover ${className}`} />
    );
  }

  if (url && kind === "pdf") {
    return (
      <div role="img" aria-label={`PDF attachment: ${label}`} className={`flex flex-col items-center justify-center gap-1 border border-line bg-peach text-peach-text ${className}`}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        </svg>
        <span className="text-[10px] font-extrabold tracking-wider">PDF</span>
      </div>
    );
  }

  return <>{fallback}</>;
}
