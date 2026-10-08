"use client";

import { useState, type ReactNode } from "react";
import { PreviewDialog } from "@/components/PreviewDialog";
import { fileKind } from "@/lib/filePreview";

type PreviewButtonProps = {
  title: string;
  url: string;
  mimeType: string | null;
  onDownload?: () => void;
  className?: string;
  children?: ReactNode;
};

/** "Preview" button that opens the file in a dialog without leaving the page. */
export function PreviewButton({ title, url, mimeType, onDownload, className = "", children }: PreviewButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={className} aria-label={`Preview ${title}`}>
        {children ?? "Preview"}
      </button>
      {open ? <PreviewDialog title={title} url={url} kind={fileKind(mimeType, url)} onClose={() => setOpen(false)} onDownload={onDownload} /> : null}
    </>
  );
}
