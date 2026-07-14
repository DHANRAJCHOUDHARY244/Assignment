"use client";

import { useCallback, useEffect, useRef } from "react";

import { CarouselNav } from "@/components/carousel/CarouselNav";
import { ModalSlide } from "@/components/carousel/ModalSlide";
import { CAROUSEL } from "@/constants/carousel";
import { getCenteredIndex, scrollElementToIndex } from "@/lib/carouselWindow";
import { useModalLock } from "@/hooks/useModalLock";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { InnerModalProps } from "@/types";

export function InnerModal({
  videos,
  index,
  open,
  onClose,
  onChangeIndex,
  onPatchVideo,
}: InnerModalProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const scrollLockRef = useRef(false);
  const reducedMotion = useReducedMotion();

  const scrollToIndex = useCallback(
    (targetIndex: number) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      scrollLockRef.current = true;
      scrollElementToIndex(
        scroller,
        targetIndex,
        "data-slide-index",
        reducedMotion ? "instant" : "smooth",
      );
      window.setTimeout(() => {
        scrollLockRef.current = false;
      }, reducedMotion ? 0 : 500);
    },
    [reducedMotion],
  );

  const goPrev = useCallback(
    () => onChangeIndex(Math.max(0, index - 1)),
    [index, onChangeIndex],
  );
  const goNext = useCallback(
    () => onChangeIndex(Math.min(videos.length - 1, index + 1)),
    [index, onChangeIndex, videos.length],
  );

  const selectSlide = useCallback(
    (slideIndex: number) => {
      if (slideIndex === index) return;
      onChangeIndex(slideIndex);
      scrollToIndex(slideIndex);
    },
    [index, onChangeIndex, scrollToIndex],
  );

  const toggleActivePlay = useCallback(() => {
    const video = scrollerRef.current?.querySelector<HTMLVideoElement>(
      `[data-active="true"] video`,
    );
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }, []);

  useModalLock(open, {
    onClose,
    onPrev: goPrev,
    onNext: goNext,
    onTogglePlay: toggleActivePlay,
  });

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToIndex(index));
    });
    return () => cancelAnimationFrame(frame);
  }, [open, index, scrollToIndex]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !open) return;

    let timer: number;

    function onScroll() {
      if (scrollLockRef.current) return;

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const next = getCenteredIndex(
          scroller!,
          "[data-slide-index]",
          "data-slide-index",
        );
        if (next !== index && next >= 0 && next < videos.length) {
          onChangeIndex(next);
        }
      }, 100);
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [open, index, videos.length, onChangeIndex]);

  if (!open || videos.length === 0) return null;

  const slidePad = `max(1rem, calc(50% - ${CAROUSEL.INNER_SLIDE_WIDTH / 2}px))`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
      onClick={onClose}
    >
      <div className="flex min-h-full flex-col items-center justify-center py-4 md:py-8">
        <div
          className="w-full max-w-[1100px] px-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-2">
            <p className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
              {index + 1} / {videos.length}
            </p>
            <div className="flex items-center gap-2">
              <CarouselNav
                variant="dark"
                onPrev={goPrev}
                onNext={goNext}
                prevLabel="Previous video"
                nextLabel="Next video"
              />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white transition hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="flex touch-pan-x snap-x snap-mandatory items-center gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto"
            style={{
              paddingLeft: slidePad,
              paddingRight: slidePad,
              gap: CAROUSEL.INNER_GAP,
            }}
          >
            {videos.map((video, i) => (
              <ModalSlide
                key={video.id}
                video={video}
                index={i}
                activeIndex={index}
                shouldLoad={
                  Math.abs(i - index) <= CAROUSEL.INNER_NEIGHBOR_RANGE
                }
                shouldPlay={i === index}
                onUpdate={(patch) => onPatchVideo(video.id, patch)}
                onSelect={selectSlide}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
