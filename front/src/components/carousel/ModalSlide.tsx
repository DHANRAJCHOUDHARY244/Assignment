"use client";

import { CarouselThumbnail } from "@/components/carousel/CarouselThumbnail";
import { VideoControls } from "@/components/carousel/VideoControls";
import { CommentBox } from "@/components/carousel/CommentBox";
import { SocialBar } from "@/components/carousel/SocialBar";
import { CAROUSEL } from "@/constants/carousel";
import { useInView } from "@/hooks/useInView";
import { useLazyVideoSrc } from "@/hooks/useLazyVideoSrc";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { isApiHostedMedia } from "@/lib/media";
import type { ModalSlideProps } from "@/types";

export function ModalSlide({
  video,
  index,
  activeIndex,
  shouldLoad,
  shouldPlay,
  onUpdate,
  onSelect,
}: ModalSlideProps) {
  const { ref: viewRef, inView } = useInView<HTMLDivElement>({
    threshold: 0.55,
  });
  const player = useVideoPlayer(shouldPlay && inView && index === activeIndex);

  useLazyVideoSrc(player.ref, video.url, shouldLoad, {
    autoPlay: false,
    unload: true,
  });

  const isCenter = index === activeIndex;

  return (
    <div
      ref={viewRef}
      data-slide-index={index}
      data-active={isCenter ? "true" : "false"}
      role={isCenter ? undefined : "button"}
      tabIndex={isCenter ? undefined : 0}
      onClick={() => {
        if (!isCenter) onSelect?.(index);
      }}
      onKeyDown={(event) => {
        if (isCenter || !onSelect) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(index);
        }
      }}
      className={`relative shrink-0 snap-center overflow-hidden rounded-[5px] bg-zinc-900 transition-all duration-300 motion-reduce:transition-none ${
        isCenter
          ? "z-10 scale-100 opacity-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)]"
          : "z-0 scale-[0.88] opacity-45 cursor-pointer hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-white/30"
      }`}
      style={{ width: `min(${CAROUSEL.INNER_SLIDE_WIDTH}px, 30vw)` }}
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-800">
        <CarouselThumbnail
          src={video.thumbnailUrl}
          alt=""
          sizes="300px"
          className={`object-cover transition-opacity duration-300 ${shouldLoad && player.playing ? "opacity-0" : "opacity-100"}`}
        />

        {shouldLoad ? (
          <video
            ref={player.ref}
            className="absolute inset-0 h-full w-full object-cover"
            muted={player.muted}
            playsInline
            loop
            preload="none"
            crossOrigin={
              isApiHostedMedia(video.url) ? "anonymous" : undefined
            }
            onTimeUpdate={player.onTimeUpdate}
            onCanPlay={player.onCanPlay}
            onWaiting={player.onWaiting}
            onPlay={player.onPlay}
            onPause={player.onPause}
          />
        ) : null}

        {player.loading && shouldLoad && isCenter ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div
              className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
              aria-hidden
            />
          </div>
        ) : null}

        {isCenter && shouldLoad ? (
          <VideoControls
            playing={player.playing}
            muted={player.muted}
            loading={player.loading}
            progress={player.progress}
            onTogglePlay={player.togglePlay}
            onToggleMute={player.toggleMute}
          />
        ) : null}
      </div>

      {isCenter ? (
        <div className="max-h-[32vh] space-y-2 overflow-y-auto border-t border-white/10 bg-zinc-950 p-3 text-white sm:p-4">
          <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
          <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
            {video.description}
          </p>
          <SocialBar video={video} onUpdate={onUpdate} variant="dark" />
          <CommentBox
            videoId={video.id}
            commentsCount={video.commentsCount}
            variant="dark"
            onCommentAdded={() =>
              onUpdate({ commentsCount: video.commentsCount + 1 })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
