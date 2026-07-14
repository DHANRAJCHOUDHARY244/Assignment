"use client";

import dynamic from "next/dynamic";

import { CarouselPlaceholder } from "@/components/carousel/SociallyApprovedSection";

const SociallyApprovedSection = dynamic(
  () =>
    import("@/components/carousel/SociallyApprovedSection").then((mod) => ({
      default: mod.SociallyApprovedSection,
    })),
  { ssr: false, loading: () => <CarouselPlaceholder /> },
);

export function SociallyApprovedClient() {
  return <SociallyApprovedSection />;
}
