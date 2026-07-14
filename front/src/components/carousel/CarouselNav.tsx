type ChevronProps = {
  direction: "prev" | "next";
  className?: string;
};

function Chevron({ direction, className = "" }: ChevronProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        d={direction === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CarouselArrowProps = {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
  className?: string;
  variant?: "light" | "dark";
};

export function CarouselArrow({
  direction,
  onClick,
  label,
  className = "",
  variant = "light",
}: CarouselArrowProps) {
  const buttonClass =
    variant === "dark"
      ? "flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/25"
      : "flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-accent-soft focus:outline-none focus:ring-2 focus:ring-accent/25";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${buttonClass} ${className}`}
      aria-label={label}
    >
      <Chevron direction={direction} className="size-7" />
    </button>
  );
}

type CarouselNavProps = {
  onPrev: () => void;
  onNext: () => void;
  prevLabel?: string;
  nextLabel?: string;
  className?: string;
  variant?: "light" | "dark";
};

export function CarouselNav({
  onPrev,
  onNext,
  prevLabel = "Previous",
  nextLabel = "Next",
  className = "",
  variant = "light",
}: CarouselNavProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <CarouselArrow
        direction="prev"
        onClick={onPrev}
        label={prevLabel}
        variant={variant}
      />
      <CarouselArrow
        direction="next"
        onClick={onNext}
        label={nextLabel}
        variant={variant}
      />
    </div>
  );
}
