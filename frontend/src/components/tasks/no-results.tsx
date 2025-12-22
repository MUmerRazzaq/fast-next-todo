"use client";

/**
 * Props for NoResults component.
 */
interface NoResultsProps {
  /** Main message to display */
  message?: string;
  /** Description text */
  description?: string;
  /** Whether filters are active (affects messaging) */
  hasFilters?: boolean;
  /** Search query (for display) */
  searchQuery?: string;
  /** Callback when clear filters is clicked */
  onClearFilters?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * NoResults component displayed when search/filter returns empty.
 *
 * Provides contextual messaging based on whether filters are active
 * and offers a clear filters action.
 *
 * @example
 * ```tsx
 * function TaskList() {
 *   const { tasks } = useTasks({ search, ...filters });
 *
 *   if (tasks.length === 0) {
 *     return (
 *       <NoResults
 *         hasFilters={hasActiveFilters(filters)}
 *         searchQuery={search}
 *         onClearFilters={handleClearFilters}
 *       />
 *     );
 *   }
 *
 *   return <TaskList tasks={tasks} />;
 * }
 * ```
 */
export function NoResults({
  message,
  description,
  hasFilters = false,
  searchQuery,
  onClearFilters,
  className = "",
}: NoResultsProps) {
  const defaultMessage = hasFilters || searchQuery
    ? "No tasks found"
    : "No tasks yet";

  const defaultDescription = hasFilters || searchQuery
    ? "Try adjusting your search or filters to find what you're looking for."
    : "Create your first task to get started.";

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
    >
      {/* Icon */}
      <div className="mb-4 rounded-full bg-muted p-4">
        {hasFilters || searchQuery ? (
          // Search/Filter icon
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        ) : (
          // Empty state icon
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
            />
          </svg>
        )}
      </div>

      {/* Message */}
      <h3 className="mb-1 text-lg font-semibold text-foreground">
        {message || defaultMessage}
      </h3>

      {/* Description */}
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        {description || defaultDescription}
      </p>

      {/* Search query display */}
      {searchQuery && (
        <p className="mb-4 text-sm">
          <span className="text-muted-foreground">Searched for: </span>
          <span className="font-medium text-foreground">&quot;{searchQuery}&quot;</span>
        </p>
      )}

      {/* Clear filters button */}
      {(hasFilters || searchQuery) && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
