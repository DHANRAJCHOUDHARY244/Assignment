export const UPLOAD = {
  CHUNK_SIZE: 5 * 1024 * 1024,
  MAX_BYTES: 2 * 1024 * 1024 * 1024,
  DIRECT_MAX_BYTES: 50 * 1024 * 1024,
  VIDEO_MIMES: ["video/mp4", "video/webm", "video/quicktime"] as const,
  VIDEO_EXT: [".mp4", ".webm", ".mov"] as const,
} as const;
