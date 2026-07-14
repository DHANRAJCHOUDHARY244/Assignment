"use client";

import { useEffect } from "react";

import { ActivityThumb } from "@/components/admin/AdminUserCard";
import type { AdminUserDetail } from "@/types";

type AdminUserDetailModalProps = {
  open: boolean;
  loading: boolean;
  detail: AdminUserDetail | null;
  onClose: () => void;
};

export function AdminUserDetailModal({
  open,
  loading,
  detail,
  onClose,
}: AdminUserDetailModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="User activity"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center py-4 md:items-center">
        <div
          className="card-soft my-auto w-full max-w-2xl p-6"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">
                {detail?.user.fullName ?? "User activity"}
              </h3>
              <p className="text-sm text-muted">
                {detail?.user.email ?? "Loading…"}
                {detail?.user.status ? (
                  <span className="ml-2 capitalize">· {detail.user.status}</span>
                ) : null}
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn-ghost">
              Close
            </button>
          </div>

          {loading || !detail ? (
            <p className="text-sm text-muted">Loading user activity…</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-xl bg-accent-soft/30 p-3">
                  <p className="text-muted">Likes</p>
                  <p className="mt-1 text-xl font-semibold">{detail.stats.likes}</p>
                </div>
                <div className="rounded-xl bg-accent-soft/30 p-3">
                  <p className="text-muted">Shares</p>
                  <p className="mt-1 text-xl font-semibold">{detail.stats.shares}</p>
                </div>
                <div className="rounded-xl bg-accent-soft/30 p-3">
                  <p className="text-muted">Comments</p>
                  <p className="mt-1 text-xl font-semibold">{detail.stats.comments}</p>
                </div>
              </div>

              <ActivitySection
                title="Liked videos"
                empty="No likes yet."
                items={detail.likes.map((item) => ({
                  id: item.id,
                  title: item.title,
                  thumbnailUrl: item.thumbnailUrl,
                  meta: new Date(item.createdAt).toLocaleString(),
                }))}
              />

              <ActivitySection
                title="Shares"
                empty="No shares yet."
                items={detail.shares.map((item) => ({
                  id: item.id,
                  title: item.title,
                  thumbnailUrl: item.thumbnailUrl,
                  meta: `${item.platform ?? "share"} · ${new Date(item.createdAt).toLocaleString()}`,
                }))}
              />

              <ActivitySection
                title="Comments"
                empty="No comments yet."
                items={detail.comments.map((item) => ({
                  id: item.id,
                  title: item.title,
                  thumbnailUrl: item.thumbnailUrl,
                  meta: item.body ?? "",
                  sub: new Date(item.createdAt).toLocaleString(),
                }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type ActivityItem = {
  id: string;
  title: string;
  thumbnailUrl: string;
  meta: string;
  sub?: string;
};

function ActivitySection({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: ActivityItem[];
}) {
  return (
    <section>
      <h4 className="mb-2 text-sm font-medium text-foreground">{title}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-muted">{empty}</p>
      ) : (
        <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface p-2.5"
            >
              <ActivityThumb
                title={item.title}
                thumbnailUrl={item.thumbnailUrl}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.meta}</p>
                {item.sub ? (
                  <p className="mt-1 text-[10px] text-muted">{item.sub}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
