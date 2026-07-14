"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchVideos } from "@/lib/videos";
import type { Video } from "@/types";

type UseVideosState = {
  videos: Video[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  patchVideo: (id: string, patch: Partial<Video>) => void;
};

export function useVideos(limit = 40): UseVideosState {
  const [videos, setVideos] = useState<Video[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVideos(1, limit);
      setVideos(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const patchVideo = useCallback((id: string, patch: Partial<Video>) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    );
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { videos, total, loading, error, refetch, patchVideo };
}
