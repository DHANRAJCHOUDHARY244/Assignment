"use client";

import Image from "next/image";

import { isApiHostedMedia } from "@/lib/media";
import type { AdminUserSummary, UserStatus } from "@/types";

type AdminUserCardProps = {
  user: AdminUserSummary;
  onView: (user: AdminUserSummary) => void;
  onStatusChange: (user: AdminUserSummary, status: UserStatus) => void;
  statusBusy?: boolean;
};

export function AdminUserCard({
  user,
  onView,
  onStatusChange,
  statusBusy = false,
}: AdminUserCardProps) {
  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isBlocked = user.status === "blocked";
  const canToggleStatus = user.role !== "admin";

  return (
    <article className="card-soft flex flex-col overflow-hidden transition hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 border-b border-border bg-accent-soft/20 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-fg">
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-foreground">{user.fullName}</h3>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
        <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
          <span className="pill capitalize">{user.role}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
              isBlocked
                ? "bg-danger/15 text-danger"
                : "bg-emerald-500/15 text-emerald-400"
            }`}
          >
            {user.status}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 p-4 text-center text-xs">
        <div className="rounded-xl bg-surface p-2">
          <dt className="text-muted">Likes</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">
            {user.stats.likes}
          </dd>
        </div>
        <div className="rounded-xl bg-surface p-2">
          <dt className="text-muted">Shares</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">
            {user.stats.shares}
          </dd>
        </div>
        <div className="rounded-xl bg-surface p-2">
          <dt className="text-muted">Comments</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">
            {user.stats.comments}
          </dd>
        </div>
      </dl>

      <div className="mt-auto space-y-2 border-t border-border p-4">
        <p className="text-[11px] text-muted">
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onView(user)}
            className="btn-secondary min-w-0 flex-1 py-1.5 text-xs"
          >
            View activity
          </button>
          {canToggleStatus ? (
            <button
              type="button"
              disabled={statusBusy}
              onClick={() =>
                onStatusChange(user, isBlocked ? "active" : "blocked")
              }
              className={`min-w-0 flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                isBlocked
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20"
              }`}
            >
              {statusBusy ? "…" : isBlocked ? "Unblock" : "Block"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

type ActivityThumbProps = {
  title: string;
  thumbnailUrl: string;
};

export function ActivityThumb({ title, thumbnailUrl }: ActivityThumbProps) {
  if (!thumbnailUrl) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-[10px] text-muted">
        Vid
      </div>
    );
  }

  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
      <Image
        src={thumbnailUrl}
        alt={title}
        fill
        sizes="48px"
        className="object-cover"
        unoptimized={isApiHostedMedia(thumbnailUrl)}
      />
    </div>
  );
}
