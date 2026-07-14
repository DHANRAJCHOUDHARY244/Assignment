import { STORAGE_KEYS } from "@/constants/api";

function readLikedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIKED_VIDEOS);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeLikedIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEYS.LIKED_VIDEOS, JSON.stringify([...ids]));
}

export function isVideoLiked(videoId: string): boolean {
  return readLikedIds().has(videoId);
}

export function markVideoLiked(videoId: string): void {
  const ids = readLikedIds();
  ids.add(videoId);
  writeLikedIds(ids);
}

export function unmarkVideoLiked(videoId: string): void {
  const ids = readLikedIds();
  ids.delete(videoId);
  writeLikedIds(ids);
}
