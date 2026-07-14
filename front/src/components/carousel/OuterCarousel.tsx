"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CarouselArrow, CarouselNav } from "@/components/carousel/CarouselNav";
import { VideoCard } from "@/components/carousel/VideoCard";
import {
  getActiveWindow,
  getCenteredIndex,
  scrollElementToIndex,
} from "@/lib/carouselWindow";
import type { OuterCarouselProps } from "@/types";

export function OuterCarousel({
  videos,
  onSelect,
  suspended = false,
}: OuterCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  const scrollByCards = useCallback((direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const current = getCenteredIndex(
      scroller,
      "[data-card-index]",
      "data-card-index",
    );
    const next = Math.max(0, Math.min(videos.length - 1, current + direction));
    scrollElementToIndex(scroller, next, "data-card-index");
  }, [videos.length]);

  const handleCardSelect = useCallback(
    (index: number) => {
      scrollElementToIndex(scrollerRef.current, index, "data-card-index");
      onSelect(index);
    },
    [onSelect],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    function onScroll() {
      const centered = getCenteredIndex(
        scroller!,
        "[data-card-index]",
        "data-card-index",
      );
      setScrollIndex(centered);
    }

    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [videos.length]);

  const activeWindow = getActiveWindow(scrollIndex, videos.length);

  return (
    <section
      className="carousel-section relative left-1/2 w-screen -translate-x-1/2 bg-background"
      aria-label="Socially approved videos"
    >
      <div className="mx-auto mb-8 max-w-6xl px-5 text-center md:mb-10 md:px-8">
        <h2 className="carousel-title">Socially Approved</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Real guest moments · hover to preview · tap to watch
        </p>
      </div>

      <div className="carousel-track-wrap">
        <div className="carousel-fade-left" aria-hidden />
        <div className="carousel-fade-right" aria-hidden />

        <CarouselArrow
          variant="dark"
          direction="prev"
          onClick={() => scrollByCards(-1)}
          label="Scroll carousel left"
          className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 md:left-4 md:flex"
        />
        <CarouselArrow
          variant="dark"
          direction="next"
          onClick={() => scrollByCards(1)}
          label="Scroll carousel right"
          className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 md:right-4 md:flex"
        />

        <div ref={scrollerRef} className="carousel-track">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              index={index}
              onSelect={handleCardSelect}
              shouldLoadVideo={
                index >= activeWindow.start && index < activeWindow.end
              }
              suspended={suspended}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center md:hidden">
          <CarouselNav
            variant="dark"
            onPrev={() => scrollByCards(-1)}
            onNext={() => scrollByCards(1)}
            prevLabel="Scroll carousel left"
            nextLabel="Scroll carousel right"
          />
        </div>
      </div>
    </section>
  );
}
