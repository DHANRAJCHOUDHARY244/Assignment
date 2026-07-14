"use client";

import Image from "next/image";
import { useState } from "react";

import { SHARE_LABELS } from "@/constants/share";
import { useVideoSocial } from "@/hooks/useVideoSocial";
import { isApiHostedMedia } from "@/lib/media";
import type { SocialBarProps } from "@/types";

export function SocialBar({
  video,
  onUpdate,
  variant = "light",
}: SocialBarProps) {
  const { liked, busy, shareNote, like, share, platforms } = useVideoSocial({
    video,
    onUpdate,
  });
  const [previewShare, setPreviewShare] = useState(false);
  const isDark = variant === "dark";

  return (
    <div
      className={`space-y-2 border-t pt-3 ${isDark ? "border-white/10" : "border-border"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void like()}
          disabled={liked || busy === "like"}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
            liked
              ? "bg-white text-black"
              : isDark
                ? "border border-white/15 bg-white/10 text-white hover:bg-white/20"
                : "btn-secondary border-0 bg-accent-soft/40 py-1.5"
          }`}
          aria-pressed={liked}
        >
          {liked ? "Liked" : "Like"} · {video.likesCount}
        </button>

        <span className={`text-xs ${isDark ? "text-white/60" : "text-muted"}`}>
          {video.sharesCount} shares
        </span>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setPreviewShare(true)}
        onMouseLeave={() => setPreviewShare(false)}
      >
        <div className="flex flex-wrap gap-1.5">
          {platforms.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => void share(platform)}
              disabled={busy === platform}
              className={
                isDark
                  ? "rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white transition hover:bg-white/20 disabled:opacity-50"
                  : "rounded-full bg-accent-soft/50 px-2.5 py-1 text-xs text-foreground transition hover:bg-accent-soft disabled:opacity-50"
              }
            >
              {SHARE_LABELS[platform]}
            </button>
          ))}
        </div>

        {previewShare ? (
          <div
            className={`absolute bottom-full left-0 z-10 mb-2 w-36 overflow-hidden rounded-xl border shadow-[var(--shadow-soft)] ${
              isDark ? "border-white/10 bg-zinc-900" : "border-border bg-surface"
            }`}
          >
            <div className="relative aspect-video w-full bg-zinc-900">
              <Image
                src={video.thumbnailUrl}
                alt={`${video.title} share preview`}
                fill
                sizes="144px"
                className="object-cover"
                unoptimized={isApiHostedMedia(video.thumbnailUrl)}
              />
            </div>
            <p
              className={`px-2 py-1.5 text-[10px] ${isDark ? "text-white/60" : "text-muted"}`}
            >
              Thumbnail included when sharing
            </p>
          </div>
        ) : null}
      </div>

      {shareNote ? (
        <p
          className={`text-xs ${isDark ? "text-white/60" : "text-muted"}`}
          role="status"
        >
          {shareNote}
        </p>
      ) : null}
    </div>
  );
}
