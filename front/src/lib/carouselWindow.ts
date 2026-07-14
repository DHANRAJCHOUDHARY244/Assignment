import { CAROUSEL } from "@/constants/carousel";

export function getActiveWindow(
  scrollIndex: number,
  total: number,
): { start: number; end: number } {
  const start = Math.max(0, scrollIndex - CAROUSEL.PREFETCH_BEHIND);
  const end = Math.min(
    total,
    start + CAROUSEL.ACTIVE_VIDEO_LIMIT,
  );
  return { start, end };
}

export function scrollIndexFromLeft(
  scrollLeft: number,
  cardSpan: number,
): number {
  return Math.max(0, Math.round(scrollLeft / cardSpan));
}

export function getCenteredIndex(
  scroller: HTMLElement,
  itemSelector: string,
  indexAttr: string,
): number {
  const center = scroller.scrollLeft + scroller.clientWidth / 2;
  let best = 0;
  let bestDist = Infinity;

  scroller.querySelectorAll(itemSelector).forEach((node) => {
    const el = node as HTMLElement;
    const raw = el.getAttribute(indexAttr);
    if (raw == null) return;

    const idx = Number(raw);
    const itemCenter = el.offsetLeft + el.offsetWidth / 2;
    const dist = Math.abs(itemCenter - center);
    if (dist < bestDist) {
      bestDist = dist;
      best = idx;
    }
  });

  return best;
}

export function scrollElementToIndex(
  scroller: HTMLElement | null,
  index: number,
  indexAttr: string,
  behavior: ScrollBehavior = "smooth",
): void {
  if (!scroller) return;

  const slide = scroller.querySelector<HTMLElement>(
    `[${indexAttr}="${index}"]`,
  );
  if (!slide) return;

  slide.scrollIntoView({
    behavior,
    inline: "center",
    block: "nearest",
  });
}
