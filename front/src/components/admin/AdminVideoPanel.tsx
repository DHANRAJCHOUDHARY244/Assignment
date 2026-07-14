"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { AdminVideoFormModal } from "@/components/admin/AdminVideoFormModal";
import { AdminVideoCard } from "@/components/admin/AdminVideoCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import {
  ADMIN_PAGE_SIZE,
  createAdminVideo,
  deactivateAdminVideo,
  fetchAdminVideos,
  updateAdminVideo,
} from "@/lib/adminVideos";
import {
  uploadAdminVideo,
  type UploadStatus,
} from "@/lib/uploadVideo";
import type { AdminVideo, VideoFormInput } from "@/types";

type SourceMode = "url" | "upload";

const emptyForm: VideoFormInput = {
  title: "",
  description: "",
  url: "",
  thumbnailUrl: "",
  sortOrder: 0,
  isActive: true,
};

export function AdminVideoPanel() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoFormInput>(emptyForm);
  const [mode, setMode] = useState<SourceMode>("upload");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickVideoFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  function handleFileSelected(file: File | null) {
    setUploadFile(file);
    setUploadStatus(null);
    setPreviewThumbnail(null);
    if (file && !form.title.trim()) {
      const name = file.name.replace(/\.[^.]+$/, "");
      setForm((current) => ({ ...current, title: name }));
    }
  }

  const loadPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminVideos(targetPage, ADMIN_PAGE_SIZE);
      setVideos(data.items);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(page);
  }, [page, loadPage]);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setUploadFile(null);
    setUploadStatus(null);
    setPreviewThumbnail(null);
    setMode("upload");
    setModalOpen(true);
  }

  function openEditModal(video: AdminVideo) {
    setEditingId(video.id);
    setMode("url");
    setUploadFile(null);
    setUploadStatus(null);
    setPreviewThumbnail(video.thumbnailUrl);
    setForm({
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl,
      sortOrder: video.sortOrder,
      isActive: video.isActive,
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setUploadStatus(null);
    setPreviewThumbnail(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setUploadStatus(null);

    try {
      let payload = { ...form };

      if (!editingId && mode === "upload") {
        if (!uploadFile) {
          pickVideoFile();
          return;
        }

        const uploaded = await uploadAdminVideo(uploadFile, setUploadStatus);

        setPreviewThumbnail(uploaded.thumbnailUrl);
        setUploadStatus({
          phase: "saving",
          percent: 95,
          message: "Saving video record…",
        });

        payload = {
          ...payload,
          url: uploaded.url,
          thumbnailUrl: uploaded.thumbnailUrl,
        };
      }

      if (mode === "url" && !payload.thumbnailUrl.trim()) {
        throw new Error("Thumbnail URL is required in URL mode");
      }

      if (editingId) {
        await updateAdminVideo(editingId, payload);
        await loadPage(page);
      } else {
        await createAdminVideo(payload);
        if (page === 1) {
          await loadPage(1);
        } else {
          setPage(1);
        }
      }

      setUploadStatus({
        phase: "done",
        percent: 100,
        message: editingId ? "Video updated" : "Video created",
      });

      window.setTimeout(() => {
        setModalOpen(false);
        setForm(emptyForm);
        setUploadFile(null);
        setUploadStatus(null);
        setPreviewThumbnail(null);
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setUploadStatus(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm("Deactivate this video?")) return;
    try {
      await deactivateAdminVideo(id);
      const nextPage =
        videos.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await loadPage(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deactivate failed");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div className="space-y-6">
      {error ? (
        <ErrorState message={error} onRetry={() => void loadPage(page)} />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Videos</h2>
          <p className="text-sm text-muted">{total} total videos</p>
        </div>
        <button type="button" onClick={openCreateModal} className="btn-primary">
          New video
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handleFileSelected(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      <AdminVideoFormModal
        open={modalOpen}
        title={editingId ? "Edit video" : "Create video"}
        saving={saving}
        uploadStatus={uploadStatus}
        previewThumbnail={previewThumbnail}
        onClose={closeModal}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="title"
          className="input-field"
        />
        <input
          required
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="description"
          className="input-field"
        />

        {!editingId ? (
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode("upload");
                pickVideoFile();
              }}
              className={`rounded-full px-4 py-1.5 text-sm transition ${mode === "upload" ? "bg-accent text-accent-fg" : "btn-secondary border-0 bg-accent-soft/30"}`}
            >
              Upload file
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`rounded-full px-4 py-1.5 text-sm transition ${mode === "url" ? "bg-accent text-accent-fg" : "btn-secondary border-0 bg-accent-soft/30"}`}
            >
              Paste URLs
            </button>
          </div>
        ) : null}

        {!editingId && mode === "upload" ? (
          <div className="space-y-2">
            {uploadFile ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-accent-soft/20 px-3 py-2.5 text-sm">
                <span className="truncate text-foreground">{uploadFile.name}</span>
                <button
                  type="button"
                  onClick={pickVideoFile}
                  className="shrink-0 text-xs text-muted underline"
                >
                  Change file
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={pickVideoFile}
                className="w-full rounded-xl border border-dashed border-accent/30 bg-accent-soft/10 px-3 py-5 text-sm text-muted transition hover:border-accent/50 hover:bg-accent-soft/25"
              >
                Click to choose a video (up to 2 GB)
              </button>
            )}
            <p className="text-xs text-muted">
              Large files upload in chunks. Thumbnail is auto-generated from the
              first frame when you click Upload &amp; create.
            </p>
          </div>
        ) : (
          <>
            <input
              required
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="video url"
              className="input-field"
            />
            <input
              required={mode === "url"}
              value={form.thumbnailUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))
              }
              placeholder="thumbnail url"
              className="input-field"
            />
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm">
            Sort
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
              }
              className="w-20 rounded-md border border-border px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
            />
            Active
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-fit disabled:opacity-50"
        >
          {saving
            ? uploadStatus?.message ?? "Saving…"
            : editingId
              ? "Update"
              : mode === "upload"
                ? "Upload & create"
                : "Create"}
        </button>
      </AdminVideoFormModal>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: ADMIN_PAGE_SIZE }).map((_, index) => (
            <div
              key={index}
              className="card-soft h-80 animate-pulse bg-accent-soft/20 motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="card-soft p-10 text-center text-sm text-muted">
          No videos yet. Create one or run the backend seed script.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <AdminVideoCard
              key={video.id}
              video={video}
              onEdit={openEditModal}
              onDeactivate={(id) => void handleDeactivate(id)}
            />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        itemLabel="videos"
        onPageChange={setPage}
      />
    </div>
  );
}
