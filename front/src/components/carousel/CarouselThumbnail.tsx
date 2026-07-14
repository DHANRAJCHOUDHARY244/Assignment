"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { shouldUnoptimizeImage } from "@/lib/media";

const FALLBACK_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='390' viewBox='0 0 220 390'%3E%3Crect fill='%231a1a1a' width='220' height='390'/%3E%3C/svg%3E";

type CarouselThumbnailProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function CarouselThumbnail({
  src,
  alt,
  sizes,
  className,
  priority,
}: CarouselThumbnailProps) {
  const [url, setUrl] = useState(src || FALLBACK_THUMB);

  useEffect(() => {
    setUrl(src || FALLBACK_THUMB);
  }, [src]);

  return (
    <Image
      src={url}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={shouldUnoptimizeImage(url)}
      onError={() => setUrl(FALLBACK_THUMB)}
    />
  );
}
