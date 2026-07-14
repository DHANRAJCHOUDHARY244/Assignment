"use client";

import Image from "next/image";
import { useEffect, useRef, type FormEvent, type ReactNode } from "react";

import type { UploadStatus } from "@/lib/uploadVideo";
import { isApiHostedMedia } from "@/lib/media";

type AdminVideoFormModalProps = {
  open: boolean;
  title: string;
  saving: boolean;
  uploadStatus: UploadStatus | null;
  previewThumbnail?: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
};

export function AdminVideoFormModal({
  open,
  title,
  saving,
  uploadStatus,
  previewThumbnail,
  onClose,
  onSubmit,
  children,
}: AdminVideoFormModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, saving]);

  if (!open) return null;

  const showProgress = saving && uploadStatus;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center py-4">
        <div
          ref={dialogRef}
          className="card-soft my-auto w-full max-w-lg p-6 shadow-[var(--shadow-soft)]"
          onClick={(event) => event.stopPropagation()}
        >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-ghost disabled:opacity-50"
          >
            Close
          </button>
        </div>

        {showProgress ? (
          <div className="mb-4 space-y-3 rounded-xl border border-border bg-accent-soft/20 p-4">
            <div className="flex items-center gap-3">
              {previewThumbnail ? (
                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                  <Image
                    src={previewThumbnail}
                    alt="Upload preview"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized={isApiHostedMedia(previewThumbnail)}
                  />
                </div>
              ) : (
                <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-accent-soft/40 text-[10px] text-muted">
                  Processing
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium capitalize text-foreground">
                  {uploadStatus.phase === "done"
                    ? "Ready"
                    : uploadStatus.phase}
                </p>
                <p className="truncate text-xs text-muted">{uploadStatus.message}</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-accent transition-[width]"
                style={{ width: `${uploadStatus.percent}%` }}
              />
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="grid gap-3">
          {children}
        </form>
        </div>
      </div>
    </div>
  );
}
