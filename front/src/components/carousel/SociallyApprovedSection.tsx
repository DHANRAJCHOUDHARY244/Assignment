"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ErrorState } from "@/components/ui/ErrorState";
import { InnerModal } from "@/components/carousel/InnerModal";
import { OuterCarousel } from "@/components/carousel/OuterCarousel";
import { useVideos } from "@/hooks/useVideos";

export function CarouselPlaceholder() {
  return (
    <section className="w-full bg-black py-16">
      <div className="mx-auto max-w-lg px-5 text-center text-sm text-muted">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent motion-reduce:animate-none" />
        Loading socially approved clips…
      </div>
    </section>
  );
}

function SociallyApprovedContent() {
  const { videos, loading, error, refetch, patchVideo } = useVideos(40);
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [deepLinked, setDeepLinked] = useState(false);

  function handleSelect(index: number) {
    setActiveIndex(index);
    setOpen(true);
  }

  useEffect(() => {
    if (deepLinked || loading || videos.length === 0) return;

    const videoId = searchParams.get("v");
    if (!videoId) return;

    const index = videos.findIndex((video) => video.id === videoId);
    if (index >= 0) {
      setActiveIndex(index);
      setOpen(true);
    }
    setDeepLinked(true);
  }, [deepLinked, loading, searchParams, videos]);

  if (loading) {
    return <CarouselPlaceholder />;
  }

  if (error) {
    return (
      <div className="page-shell">
        <ErrorState message={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="page-shell">
        <ErrorState
          message="No videos yet. Seed the backend and refresh."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <>
      <OuterCarousel
        videos={videos}
        onSelect={handleSelect}
        suspended={open}
      />
      <InnerModal
        videos={videos}
        index={activeIndex}
        open={open}
        onClose={() => setOpen(false)}
        onChangeIndex={setActiveIndex}
        onPatchVideo={patchVideo}
      />
    </>
  );
}

export function SociallyApprovedSection() {
  return (
    <Suspense fallback={<CarouselPlaceholder />}>
      <SociallyApprovedContent />
    </Suspense>
  );
}
