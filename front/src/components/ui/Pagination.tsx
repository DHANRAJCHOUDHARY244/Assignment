type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  total,
  itemLabel = "items",
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(page, totalPages);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 text-sm"
      aria-label="Pagination"
    >
      <p className="text-muted">
        Page {page} of {totalPages} · {total} {itemLabel}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-ghost disabled:opacity-40"
        >
          Previous
        </button>
        {pages.map((item, index) =>
          item === "…" ? (
            <span key={`gap-${index}`} className="px-1 text-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={
                item === page
                  ? "rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg"
                  : "btn-ghost px-3 py-1.5"
              }
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-ghost disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </nav>
  );
}

function buildPageNumbers(current: number, total: number): Array<number | "…"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: Array<number | "…"> = [1];
  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);

  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
