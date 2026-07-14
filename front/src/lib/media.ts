import { API_BASE_URL } from "@/constants/api";

export function isApiHostedMedia(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const api = new URL(API_BASE_URL);
    return parsed.origin === api.origin;
  } catch {
    return false;
  }
}

/** Skip Next image optimizer for URLs that are not real image assets. */
export function shouldUnoptimizeImage(url: string): boolean {
  if (!url) return true;
  if (isApiHostedMedia(url)) return true;

  try {
    const parsed = new URL(url);
    if (
      /pexels\.com/i.test(parsed.hostname) &&
      parsed.pathname.includes("/download")
    ) {
      return true;
    }
    if (/\.(mp4|webm|mov|m3u8)(\?|$)/i.test(parsed.pathname)) {
      return true;
    }
  } catch {
    return true;
  }

  return false;
}
