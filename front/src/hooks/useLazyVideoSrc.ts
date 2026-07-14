"use client";

import { useEffect, type RefObject } from "react";

type LazyVideoOptions = {
  autoPlay?: boolean;
  unload?: boolean;
};

export function useLazyVideoSrc(
  ref: RefObject<HTMLVideoElement | null>,
  url: string,
  enabled: boolean,
  options: LazyVideoOptions = {},
) {
  const { autoPlay = false, unload = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (enabled) {
      if (el.src !== url) {
        el.src = url;
        el.load();
      }
      if (autoPlay) void el.play().catch(() => undefined);
      else el.pause();
      return;
    }

    el.pause();
    if (unload) {
      el.removeAttribute("src");
      el.load();
    }
  }, [ref, url, enabled, autoPlay, unload]);
}
