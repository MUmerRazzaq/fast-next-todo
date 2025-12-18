"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useTags } from "@/hooks/use-tags";
import { useNotifications } from "@/hooks/use-notifications";
import { useKeyboardShortcuts, TASK_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { TaskList } from "@/components/tasks/task-list";
import { TaskListSkeleton } from "@/components/tasks/task-list-skeleton";
import { EmptyState } from "@/components/tasks/empty-state";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { SearchInput } from "@/components/tasks/search-input";
import {
  FilterSidebar,
  getDefaultFilters,
  hasActiveFilters,
  type TaskFilters,
} from "@/components/tasks/filter-sidebar";
import { Pagination } from "@/components/tasks/pagination";
import { NoResults } from "@/components/tasks/no-results";
import { ExportButton } from "@/components/tasks/export-button";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";
import type { TaskListParams } from "@/types/api";

const PAGE_SIZE = 20;

export default function TasksPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TaskFilters>(getDefaultFilters());
  const [sortBy, setSortBy] = useState<TaskListParams["sortBy"]>("created_at");
  const [sortOrder, setSortOrder] = useState<TaskListParams["sortOrder"]>("desc");

  // Ref for search input focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch tags for filter sidebar
  const { tags, isLoading: tagsLoading } = useTags({ pageSize: 100 });

  // Notifications
  const { scheduleForTasks } = useNotifications();

  // Build query params from state
  const queryParams = useMemo<TaskListParams>(() => {
    const params: TaskListParams = {
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortOrder,
    };

    // Add search
    if (search) {
      params.search = search;
    }

    // Add filters
    if (filters.isCompleted !== undefined) {
      params.isCompleted = filters.isCompleted;
    }

    if (filters.priorities.length === 1) {
      // Single priority - use direct filter
      params.priority = filters.priorities[0];
    } else if (filters.priorities.length > 1) {
      // Multiple priorities - will need multiple requests or backend support
      // For now, use first priority (backend would need OR support)
      params.priority = filters.priorities[0];
    }

    if (filters.tagIds.length > 0) {
      params.tagIds = filters.tagIds;
    }

    if (filters.dueFrom) {
      params.dueFrom = filters.dueFrom;
    }

    if (filters.dueTo) {
      params.dueTo = filters.dueTo;
    }

    return params;
  }, [page, search, filters, sortBy, sortOrder]);

  // Fetch tasks with current params
  const { tasks, isLoading, error, pagination } = useTasks(queryParams);

  // Schedule notifications for tasks with due dates
  useEffect(() => {
    if (tasks.length > 0 && !isLoading) {
      scheduleForTasks(tasks);
    }
  }, [tasks, isLoading, scheduleForTasks]);

  // Check if any filters are active
  const isFiltered = useMemo(
    () => hasActiveFilters(filters) || !!search,
    [filters, search]
  );

  // Reset page when filters change
  const handleFiltersChange = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters(getDefaultFilters());
    setSearch("");
    setPage(1);
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: TaskListParams["sortBy"]) => {
      if (newSortBy === sortBy) {
        // Toggle order if same field
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(newSortBy);
        setSortOrder("desc");
      }
      setPage(1);
    },
    [sortBy]
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        ...TASK_SHORTCUTS.NEW_TASK,
        handler: () => setShowCreateDialog(true),
      },
      {
        ...TASK_SHORTCUTS.SEARCH,
        handler: () => {
          searchInputRef.current?.focus();
        },
      },
      {
        ...TASK_SHORTCUTS.SHOW_HELP,
        handler: () => setShowShortcutsHelp(true),
      },
      {
        ...TASK_SHORTCUTS.ESCAPE,
        handler: () => {
          setShowCreateDialog(false);
          setShowShortcutsHelp(false);
          if (showFilters) {
            setShowFilters(false);
          }
        },
      },
    ],
    enabled: !showCreateDialog, // Disable most shortcuts when dialog is open
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive">Failed to load tasks</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Filter Sidebar */}
      {showFilters && (
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          tags={tags}
          tagsLoading={tagsLoading}
          className="hidden lg:block"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
            <p className="text-sm text-muted-foreground">
              Manage your tasks and stay organized
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton />
            <button
              onClick={() => setShowCreateDialog(true)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <SearchInput
              ref={searchInputRef}
              value={search}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="max-w-sm flex-1"
            />
            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-md border border-input bg-background p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
              aria-label={showFilters ? "Hide filters" : "Show filters"}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value as TaskListParams["sortBy"])
              }
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="created_at">Created</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="rounded-md border border-input bg-background p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              <svg
                className={`h-4 w-4 transition-transform ${
                  sortOrder === "asc" ? "rotate-180" : ""
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
          </div>
        </div>

        {/* Active filters summary (mobile) */}
        {isFiltered && (
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-sm text-muted-foreground">
              {search && `Search: "${search}"`}
              {hasActiveFilters(filters) && " + filters active"}
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Task List */}
        {isLoading ? (
          <TaskListSkeleton />
        ) : tasks.length === 0 ? (
          isFiltered ? (
            <NoResults
              hasFilters={hasActiveFilters(filters)}
              searchQuery={search}
              onClearFilters={handleClearAll}
            />
          ) : (
            <EmptyState onCreateTask={() => setShowCreateDialog(true)} />
          )
        ) : (
          <TaskList tasks={tasks} />
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            className="mt-6"
          />
        )}

        {/* Simple count when no pagination needed */}
        {pagination && pagination.totalPages <= 1 && pagination.total > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Create Task Dialog */}
        <CreateTaskDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        {/* Keyboard Shortcuts Help Dialog */}
        <KeyboardShortcutsHelp
          open={showShortcutsHelp}
          onOpenChange={setShowShortcutsHelp}
        />
      </div>

      {/* Mobile Filter Sidebar (overlay) */}
      {showFilters && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            tags={tags}
            tagsLoading={tagsLoading}
            className="absolute inset-y-0 left-0 z-50"
          />
        </div>
      )}
    </div>
  );
}
