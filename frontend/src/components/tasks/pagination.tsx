"use client";

/**
 * Pagination info from useTasks hook.
 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Props for Pagination component.
 */
interface PaginationProps {
  /** Current pagination state */
  pagination: PaginationInfo;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Generate visible page numbers for pagination.
 * Shows current page with neighbors and ellipsis for large ranges.
 */
function getVisiblePages(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  const delta = 1; // Number of pages to show on each side
  const range: (number | "ellipsis")[] = [];

  // Always show first page
  range.push(1);

  // Calculate start and end of visible range
  const start = Math.max(2, currentPage - delta);
  const end = Math.min(totalPages - 1, currentPage + delta);

  // Add ellipsis if there's a gap after first page
  if (start > 2) {
    range.push("ellipsis");
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  // Add ellipsis if there's a gap before last page
  if (end < totalPages - 1) {
    range.push("ellipsis");
  }

  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
}

/**
 * Pagination component for navigating through pages.
 *
 * Features:
 * - Previous/Next buttons
 * - Page number buttons with ellipsis
 * - Current page indicator
 * - Disabled states at boundaries
 * - Showing items count
 *
 * @example
 * ```tsx
 * function TaskList() {
 *   const [page, setPage] = useState(1);
 *   const { tasks, pagination } = useTasks({ page, pageSize: 20 });
 *
 *   return (
 *     <>
 *       <TaskList tasks={tasks} />
 *       {pagination && (
 *         <Pagination
 *           pagination={pagination}
 *           onPageChange={setPage}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function Pagination({
  pagination,
  onPageChange,
  className = "",
}: PaginationProps) {
  const { page, pageSize, total, totalPages, hasNext, hasPrevious } = pagination;

  // Calculate item range being shown
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // Don't render if only one page
  if (totalPages <= 1 && total <= pageSize) {
    return (
      <div className={`text-center text-sm text-muted-foreground ${className}`}>
        Showing {total} task{total !== 1 ? "s" : ""}
      </div>
    );
  }

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav
      className={`flex flex-col items-center gap-4 sm:flex-row sm:justify-between ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Items info */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{startItem}</span>
        {" - "}
        <span className="font-medium text-foreground">{endItem}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> tasks
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevious}
          aria-label="Go to previous page"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page numbers */}
        {visiblePages.map((pageNum, index) =>
          pageNum === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              disabled={pageNum === page}
              aria-label={`Go to page ${pageNum}`}
              aria-current={pageNum === page ? "page" : undefined}
              className={`flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors ${
                pageNum === page
                  ? "bg-primary text-primary-foreground"
                  : "border border-input bg-background hover:bg-accent"
              }`}
            >
              {pageNum}
            </button>
          )
        )}

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          aria-label="Go to next page"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
