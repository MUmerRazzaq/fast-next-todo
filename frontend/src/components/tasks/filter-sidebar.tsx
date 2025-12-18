"use client";

import { useState, useMemo } from "react";
import type { Priority, Tag } from "@/types/api";

/**
 * Filter state for task filtering.
 */
export interface TaskFilters {
  /** Filter by completion status */
  isCompleted?: boolean;
  /** Filter by priority (multiple allowed) */
  priorities: Priority[];
  /** Filter by tag IDs (multiple allowed) */
  tagIds: string[];
  /** Filter by due date start */
  dueFrom?: string;
  /** Filter by due date end */
  dueTo?: string;
}

/**
 * Props for FilterSidebar component.
 */
interface FilterSidebarProps {
  /** Current filter state */
  filters: TaskFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: TaskFilters) => void;
  /** Available tags for filtering */
  tags: Tag[];
  /** Whether tags are loading */
  tagsLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Status filter options.
 */
const STATUS_OPTIONS = [
  { value: undefined, label: "All Tasks" },
  { value: false, label: "Active" },
  { value: true, label: "Completed" },
] as const;

/**
 * Priority filter options.
 */
const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "bg-red-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "low", label: "Low", color: "bg-green-500" },
];

/**
 * Check if any filters are active.
 */
export function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    filters.isCompleted !== undefined ||
    filters.priorities.length > 0 ||
    filters.tagIds.length > 0 ||
    filters.dueFrom !== undefined ||
    filters.dueTo !== undefined
  );
}

/**
 * Get default empty filter state.
 */
export function getDefaultFilters(): TaskFilters {
  return {
    isCompleted: undefined,
    priorities: [],
    tagIds: [],
    dueFrom: undefined,
    dueTo: undefined,
  };
}

/**
 * FilterSidebar component for task filtering.
 *
 * Includes:
 * - Status filter (All, Active, Completed)
 * - Priority multi-select (High, Medium, Low)
 * - Tag multi-select
 * - Due date range picker
 * - Clear all filters button
 *
 * @example
 * ```tsx
 * function TasksPage() {
 *   const [filters, setFilters] = useState<TaskFilters>(getDefaultFilters());
 *   const { tags } = useTags();
 *
 *   return (
 *     <FilterSidebar
 *       filters={filters}
 *       onFiltersChange={setFilters}
 *       tags={tags}
 *     />
 *   );
 * }
 * ```
 */
export function FilterSidebar({
  filters,
  onFiltersChange,
  tags,
  tagsLoading = false,
  className = "",
}: FilterSidebarProps) {
  const [isDateExpanded, setIsDateExpanded] = useState(
    !!(filters.dueFrom || filters.dueTo)
  );

  const hasFilters = useMemo(() => hasActiveFilters(filters), [filters]);

  const handleStatusChange = (value: boolean | undefined) => {
    onFiltersChange({ ...filters, isCompleted: value });
  };

  const handlePriorityToggle = (priority: Priority) => {
    const priorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    onFiltersChange({ ...filters, priorities });
  };

  const handleTagToggle = (tagId: string) => {
    const tagIds = filters.tagIds.includes(tagId)
      ? filters.tagIds.filter((id) => id !== tagId)
      : [...filters.tagIds, tagId];
    onFiltersChange({ ...filters, tagIds });
  };

  const handleDueFromChange = (value: string) => {
    onFiltersChange({ ...filters, dueFrom: value || undefined });
  };

  const handleDueToChange = (value: string) => {
    onFiltersChange({ ...filters, dueTo: value || undefined });
  };

  const handleClearFilters = () => {
    onFiltersChange(getDefaultFilters());
    setIsDateExpanded(false);
  };

  return (
    <aside
      className={`w-64 shrink-0 space-y-6 border-r border-border bg-background p-4 ${className}`}
    >
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Status</label>
        <div className="space-y-1">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleStatusChange(option.value)}
              className={`flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors ${
                filters.isCompleted === option.value
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <span
                className={`mr-2 h-2 w-2 rounded-full ${
                  filters.isCompleted === option.value
                    ? "bg-primary"
                    : "bg-transparent"
                }`}
              />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Priority</label>
        <div className="space-y-1">
          {PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePriorityToggle(option.value)}
              className={`flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors ${
                filters.priorities.includes(option.value)
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <span className={`mr-2 h-2 w-2 rounded-full ${option.color}`} />
              {option.label}
              {filters.priorities.includes(option.value) && (
                <svg
                  className="ml-auto h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tag Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tags</label>
        {tagsLoading ? (
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags available</p>
        ) : (
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors ${
                  filters.tagIds.includes(tag.id)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <span
                  className={`mr-2 h-2 w-2 rounded-full ${
                    filters.tagIds.includes(tag.id)
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
                {tag.name}
                {filters.tagIds.includes(tag.id) && (
                  <svg
                    className="ml-auto h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Due Date Filter */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setIsDateExpanded(!isDateExpanded)}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          Due Date
          <svg
            className={`h-4 w-4 transition-transform ${
              isDateExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isDateExpanded && (
          <div className="space-y-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                From
              </label>
              <input
                type="date"
                value={filters.dueFrom || ""}
                onChange={(e) => handleDueFromChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                To
              </label>
              <input
                type="date"
                value={filters.dueTo || ""}
                onChange={(e) => handleDueToChange(e.target.value)}
                min={filters.dueFrom || undefined}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasFilters && (
        <div className="space-y-2 border-t border-border pt-4">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Active Filters
          </label>
          <div className="flex flex-wrap gap-1">
            {filters.isCompleted !== undefined && (
              <FilterChip
                label={filters.isCompleted ? "Completed" : "Active"}
                onRemove={() => handleStatusChange(undefined)}
              />
            )}
            {filters.priorities.map((priority) => (
              <FilterChip
                key={priority}
                label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                onRemove={() => handlePriorityToggle(priority)}
              />
            ))}
            {filters.tagIds.map((tagId) => {
              const tag = tags.find((t) => t.id === tagId);
              return (
                <FilterChip
                  key={tagId}
                  label={tag?.name || tagId}
                  onRemove={() => handleTagToggle(tagId)}
                />
              );
            })}
            {filters.dueFrom && (
              <FilterChip
                label={`From: ${filters.dueFrom}`}
                onRemove={() => handleDueFromChange("")}
              />
            )}
            {filters.dueTo && (
              <FilterChip
                label={`To: ${filters.dueTo}`}
                onRemove={() => handleDueToChange("")}
              />
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

/**
 * Small chip component for displaying active filters.
 */
function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-primary/20"
        aria-label={`Remove ${label} filter`}
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </span>
  );
}
