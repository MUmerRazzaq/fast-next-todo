"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useTaskMutations } from "@/hooks/use-task-mutations";
import { useNotifications } from "@/hooks/use-notifications";
import { useKeyboardShortcuts, TASK_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { useFilters } from "@/context/filter-context";
import { hasActiveFilters, getDefaultFilters } from "@/components/dashboard/unified-sidebar";
import { TaskList } from "@/components/tasks/task-list";
import { TaskListSkeleton } from "@/components/tasks/task-list-skeleton";
import { EmptyState } from "@/components/tasks/empty-state";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { SearchInput } from "@/components/tasks/search-input";
import { Pagination } from "@/components/tasks/pagination";
import { NoResults } from "@/components/tasks/no-results";
import { ExportButton } from "@/components/tasks/export-button";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";
import type { TaskListParams, Task } from "@/types/api";

const PAGE_SIZE = 20;

export default function TasksPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>(undefined);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<TaskListParams["sortBy"]>("created_at");
  const [sortOrder, setSortOrder] = useState<TaskListParams["sortOrder"]>("desc");

  const { filters, setFilters } = useFilters();
  const { deleteTask, completeTask, uncompleteTask, isDeleting } = useTaskMutations();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { scheduleForTasks } = useNotifications();

  const queryParams = useMemo<TaskListParams>(() => {
    const params: TaskListParams = {
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortOrder,
    };

    if (search) {
      params.search = search;
    }

    if (filters.isCompleted !== undefined) {
      params.isCompleted = filters.isCompleted;
    }
    if (filters.priorities.length > 0) {
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

  const { tasks, isLoading, error, pagination } = useTasks(queryParams);

  useEffect(() => {
    if (tasks.length > 0 && !isLoading) {
      scheduleForTasks(tasks);
    }
  }, [tasks, isLoading, scheduleForTasks]);

  const isFiltered = useMemo(
    () => hasActiveFilters(filters) || !!search,
    [filters, search]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters(getDefaultFilters());
    setSearch("");
    setPage(1);
  }, [setFilters]);

  const handleSortChange = useCallback(
    (newSortBy: TaskListParams["sortBy"]) => {
      if (newSortBy === sortBy) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(newSortBy);
        setSortOrder("desc");
      }
      setPage(1);
    },
    [sortBy]
  );

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
          setTaskToEdit(undefined);
          setSelectedTaskIndex(null);
        },
      },
      {
        ...TASK_SHORTCUTS.NAVIGATE_DOWN,
        handler: () => {
            if (tasks.length === 0) return;
            setSelectedTaskIndex(prev => {
                if (prev === null) return 0;
                return Math.min(prev + 1, tasks.length - 1);
            });
        }
      },
      {
        ...TASK_SHORTCUTS.NAVIGATE_UP,
        handler: () => {
            if (tasks.length === 0) return;
            setSelectedTaskIndex(prev => {
                if (prev === null) return tasks.length - 1;
                return Math.max(prev - 1, 0);
            });
        }
      },
      {
        ...TASK_SHORTCUTS.EDIT_TASK,
        handler: () => {
            if (selectedTaskIndex !== null && tasks[selectedTaskIndex]) {
                setTaskToEdit(tasks[selectedTaskIndex]);
            }
        }
      },
      {
        ...TASK_SHORTCUTS.DELETE_TASK,
        handler: () => {
            if (selectedTaskIndex !== null && tasks[selectedTaskIndex]) {
                setTaskToDelete(tasks[selectedTaskIndex]);
            }
        }
      },
      {
        ...TASK_SHORTCUTS.COMPLETE_TASK,
        handler: () => {
            if (selectedTaskIndex !== null && tasks[selectedTaskIndex]) {
                const task = tasks[selectedTaskIndex];
                if (task.isCompleted) {
                    uncompleteTask(task.id);
                } else {
                    completeTask(task.id);
                }
            }
        }
      }
    ],
    enabled: !showCreateDialog && !taskToEdit,
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
      <div className="flex-1 space-y-6">
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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <SearchInput
              ref={searchInputRef}
              value={search}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="max-w-sm flex-1"
            />
          </div>

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
          <TaskList tasks={tasks} selectedTaskIndex={selectedTaskIndex} onEdit={setTaskToEdit} onDelete={setTaskToDelete} />
        )}

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            className="mt-6"
          />
        )}

        {pagination && pagination.totalPages <= 1 && pagination.total > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        )}

        <CreateTaskDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        <KeyboardShortcutsHelp
          open={showShortcutsHelp}
          onOpenChange={setShowShortcutsHelp}
        />

        {taskToEdit && (
            <EditTaskDialog
            task={taskToEdit}
            open={!!taskToEdit}
            onOpenChange={(isOpen) => !isOpen && setTaskToEdit(undefined)}
            />
        )}

        {taskToDelete && (
            <DeleteTaskDialog
            task={taskToDelete}
            open={!!taskToDelete}
            onOpenChange={(isOpen) => !isOpen && setTaskToDelete(undefined)}
            onConfirm={() => {
                if (taskToDelete) {
                    deleteTask(taskToDelete.id);
                    setTaskToDelete(undefined);
                }
            }}
            isDeleting={isDeleting}
            />
        )}
      </div>
    </div>
  );
}
