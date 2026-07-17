import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Trang trước"
        className="flex size-10 items-center justify-center rounded-card border border-border text-sm text-foreground transition-colors hover:cursor-pointer hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        ‹
      </button>

      {pages.map((pageNumber) => {
        const isActive = pageNumber === page;
        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex size-10 items-center justify-center rounded-card border text-sm transition-colors hover:cursor-pointer",
              isActive
                ? "border-foreground bg-accent text-accent-foreground"
                : "border-border text-foreground hover:bg-surface",
            )}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Trang sau"
        className="flex size-10 items-center justify-center rounded-card border border-border text-sm text-foreground transition-colors hover:cursor-pointer hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        ›
      </button>
    </nav>
  );
}
