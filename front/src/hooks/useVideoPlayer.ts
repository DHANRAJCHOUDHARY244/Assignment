"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useVideoPlayer(shouldPlay: boolean) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (shouldPlay) {
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      return;
    }

    video.pause();
    setPlaying(false);
  }, [shouldPlay]);

  const togglePlay = useCallback(() => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setPlaying(true));
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const onTimeUpdate = useCallback(() => {
    const video = ref.current;
    if (!video?.duration) return;
    setProgress(video.currentTime / video.duration);
  }, []);

  const onCanPlay = useCallback(() => setLoading(false), []);
  const onWaiting = useCallback(() => setLoading(true), []);
  const onPlay = useCallback(() => setPlaying(true), []);
  const onPause = useCallback(() => setPlaying(false), []);

  return {
    ref,
    playing,
    muted,
    loading,
    progress,
    togglePlay,
    toggleMute,
    onTimeUpdate,
    onCanPlay,
    onWaiting,
    onPlay,
    onPause,
  };
}
