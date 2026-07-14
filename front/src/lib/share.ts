import type { SharePlatform } from "@/types";

export function videoShareUrl(videoId: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("v", videoId);
  return url.toString();
}

export function buildSharePayload(
  title: string,
  url: string,
  thumbnailUrl: string,
): { text: string; textWithThumbnail: string } {
  const textWithThumbnail = `${title}\n${url}\n${thumbnailUrl}`;
  return { text: `${title}\n${url}`, textWithThumbnail };
}

export function openShareWindow(
  platform: SharePlatform,
  url: string,
  title: string,
  thumbnailUrl: string,
) {
  const { textWithThumbnail } = buildSharePayload(title, url, thumbnailUrl);
  const targets: Partial<Record<SharePlatform, string>> = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(textWithThumbnail)}`,
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${title}\n${thumbnailUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const target = targets[platform];
  if (target) window.open(target, "_blank", "noopener,noreferrer");
}

export async function shareWithNativeThumbnail(input: {
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
}): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;

  const base: ShareData = {
    title: input.title,
    text: input.description,
    url: input.url,
  };

  try {
    const response = await fetch(input.thumbnailUrl);
    if (!response.ok) {
      await navigator.share(base);
      return true;
    }

    const blob = await response.blob();
    const file = new File([blob], "thumbnail.jpg", {
      type: blob.type || "image/jpeg",
    });

    if (navigator.canShare?.({ ...base, files: [file] })) {
      await navigator.share({ ...base, files: [file] });
      return true;
    }

    await navigator.share({
      ...base,
      text: `${input.description}\n${input.thumbnailUrl}`,
    });
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return true;
    return false;
  }
}
