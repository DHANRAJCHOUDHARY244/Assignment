"use client";

import { useCallback, useEffect, useState } from "react";

import { SHARE_PLATFORMS } from "@/constants/api";
import { isVideoLiked, markVideoLiked, unmarkVideoLiked } from "@/lib/likedVideos";
import {
  buildSharePayload,
  openShareWindow,
  shareWithNativeThumbnail,
  videoShareUrl,
} from "@/lib/share";
import { likeVideo, shareVideo } from "@/lib/videos";
import type { SharePlatform, Video } from "@/types";

type UseVideoSocialOptions = {
  video: Video;
  onUpdate: (patch: Partial<Video>) => void;
};

export function useVideoSocial({ video, onUpdate }: UseVideoSocialOptions) {
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState<"like" | SharePlatform | null>(null);
  const [shareNote, setShareNote] = useState<string | null>(null);

  useEffect(() => {
    setLiked(isVideoLiked(video.id));
    setShareNote(null);
  }, [video.id]);

  const like = useCallback(async () => {
    if (liked || busy) return;

    const prev = video.likesCount;
    onUpdate({ likesCount: prev + 1 });
    setLiked(true);
    markVideoLiked(video.id);
    setBusy("like");

    try {
      const res = await likeVideo(video.id);
      onUpdate({ likesCount: res.likesCount });
    } catch {
      onUpdate({ likesCount: prev });
      setLiked(false);
      unmarkVideoLiked(video.id);
    } finally {
      setBusy(null);
    }
  }, [busy, liked, onUpdate, video.id, video.likesCount]);

  const share = useCallback(
    async (platform: SharePlatform) => {
      if (busy) return;

      const url = videoShareUrl(video.id);
      const { textWithThumbnail } = buildSharePayload(
        video.title,
        url,
        video.thumbnailUrl,
      );
      const prev = video.sharesCount;
      onUpdate({ sharesCount: prev + 1 });
      setBusy(platform);

      try {
        if (platform === "copy") {
          const usedNative = await shareWithNativeThumbnail({
            title: video.title,
            description: video.description,
            url,
            thumbnailUrl: video.thumbnailUrl,
          });
          if (!usedNative) {
            await navigator.clipboard.writeText(textWithThumbnail);
            setShareNote("Link and thumbnail URL copied");
          } else {
            setShareNote("Shared with thumbnail");
          }
        } else if (platform === "instagram") {
          await navigator.clipboard.writeText(textWithThumbnail);
          setShareNote("Link and thumbnail copied for Instagram");
        } else {
          openShareWindow(platform, url, video.title, video.thumbnailUrl);
          setShareNote(null);
        }

        const res = await shareVideo(video.id, platform);
        onUpdate({ sharesCount: res.sharesCount });
      } catch {
        onUpdate({ sharesCount: prev });
        setShareNote(null);
      } finally {
        setBusy(null);
        window.setTimeout(() => setShareNote(null), 2500);
      }
    },
    [
      busy,
      onUpdate,
      video.description,
      video.id,
      video.sharesCount,
      video.thumbnailUrl,
      video.title,
    ],
  );

  return {
    liked,
    busy,
    shareNote,
    like,
    share,
    platforms: SHARE_PLATFORMS,
  };
}
