import Link from "next/link";
import type { Route } from "next";

type PaginationControlsProps = {
  count: number;
  hrefForPage: (page: number) => Route;
  itemLabel: string;
  page: number;
  pageCount: number;
};

export function PaginationControls({
  count,
  hrefForPage,
  itemLabel,
  page,
  pageCount,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page {page} of {pageCount}, {count} {itemLabel}
      </p>
      <nav className="flex items-center gap-2" aria-label={`${itemLabel} pagination`}>
        {page > 1 ? (
          <Link
            className="rounded-md border border-border px-3 py-2 font-medium text-foreground hover:bg-accent"
            href={hrefForPage(page - 1)}
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md border border-border px-3 py-2 text-muted-foreground opacity-60">
            Previous
          </span>
        )}
        {page < pageCount ? (
          <Link
            className="rounded-md border border-border px-3 py-2 font-medium text-foreground hover:bg-accent"
            href={hrefForPage(page + 1)}
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md border border-border px-3 py-2 text-muted-foreground opacity-60">
            Next
          </span>
        )}
      </nav>
    </div>
  );
}
