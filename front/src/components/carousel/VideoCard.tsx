"use client";

import { useRef, useState } from "react";

import { CarouselThumbnail } from "@/components/carousel/CarouselThumbnail";
import { CAROUSEL } from "@/constants/carousel";
import { useInView } from "@/hooks/useInView";
import { useLazyVideoSrc } from "@/hooks/useLazyVideoSrc";
import { isApiHostedMedia } from "@/lib/media";
import type { VideoCardProps } from "@/types";

export function VideoCard({
  video,
  index,
  onSelect,
  shouldLoadVideo = true,
  suspended = false,
}: VideoCardProps) {
  const [hovered, setHovered] = useState(false);
  const { ref, inView } = useInView<HTMLButtonElement>({
    rootMargin: CAROUSEL.PREFETCH_MARGIN,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const mountVideo = inView && shouldLoadVideo && !suspended;
  const isPlaying = hovered && mountVideo;

  useLazyVideoSrc(videoRef, video.url, mountVideo, {
    autoPlay: isPlaying,
    unload: true,
  });

  return (
    <button
      ref={ref}
      type="button"
      data-card-index={index}
      onClick={() => onSelect(index)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group relative shrink-0 snap-center overflow-hidden rounded-[5px] bg-zinc-900 text-left shadow-[0_8px_30px_-8px_rgba(0,0,0,0.8)] transition duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/25 motion-reduce:transition-none motion-reduce:hover:scale-100"
      style={{
        width: `clamp(168px, ${100 / CAROUSEL.OUTER_SLIDES_PER_VIEW_MOBILE}vw, ${CAROUSEL.CARD_WIDTH}px)`,
        maxWidth: CAROUSEL.CARD_WIDTH,
      }}
      aria-label={`Open ${video.title}`}
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-800">
        <CarouselThumbnail
          src={video.thumbnailUrl}
          alt=""
          sizes="220px"
          className={`object-cover transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}
        />

        {mountVideo ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            loop
            preload="none"
            crossOrigin={
              isApiHostedMedia(video.url) ? "anonymous" : undefined
            }
          />
        ) : null}

        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 transition-opacity duration-300 ${
            isPlaying ? "opacity-40" : "opacity-100"
          }`}
        />

        {!isPlaying ? (
          <div
            className={`absolute left-1/2 top-[45%] flex size-[50px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-opacity duration-300 ${
              hovered ? "opacity-100" : "opacity-0 md:opacity-0"
            } group-focus-visible:opacity-100`}
          >
            <svg
              viewBox="0 0 24 24"
              className="ml-0.5 size-5 fill-current"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2.5">
          <p className="line-clamp-2 text-left text-[11px] font-medium leading-snug text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {video.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-white/90">
            <span className="inline-flex items-center gap-0.5 rounded bg-black/45 px-1.5 py-0.5">
              <svg viewBox="0 0 24 24" className="size-3 fill-current" aria-hidden>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {video.likesCount}
            </span>
            <span className="text-white/75">{video.sharesCount} shares</span>
          </div>
        </div>
      </div>
    </button>
  );
}
