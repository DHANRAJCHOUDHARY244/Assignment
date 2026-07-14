"use client";

import { useEffect, useRef, useState } from "react";

import { CAROUSEL } from "@/constants/carousel";

type UseInViewOptions = {
  rootMargin?: string;
  threshold?: number;
};

export function useInView<T extends HTMLElement>(
  options: UseInViewOptions = {},
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      {
        root: null,
        rootMargin: options.rootMargin ?? CAROUSEL.PREFETCH_MARGIN,
        threshold: options.threshold ?? 0.25,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold]);

  return { ref, inView };
}
