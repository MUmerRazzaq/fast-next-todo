"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Task, TaskListResponse, TaskListParams } from "@/types/api";

/**
 * Query key factory for tasks.
 */
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

/**
 * Convert TaskListParams to API query params.
 * Serializes tagIds array to comma-separated string.
 */
function serializeParams(params: TaskListParams): Record<string, string | number | boolean | undefined> {
  const {
    tagIds,
    pageSize,
    isCompleted,
    sortBy,
    sortOrder,
    dueFrom,
    dueTo,
    ...rest
  } = params;

  return {
    ...rest,
    // Convert tagIds array to comma-separated string for API
    tag_ids: tagIds?.length ? tagIds.join(",") : undefined,
    // Convert camelCase to snake_case for API
    page_size: pageSize,
    is_completed: isCompleted,
    sort_by: sortBy,
    sort_order: sortOrder,
    due_from: dueFrom,
    due_to: dueTo,
  };
}

/**
 * Fetch tasks list from API.
 */
async function fetchTasks(params: TaskListParams): Promise<TaskListResponse> {
  return api.get<TaskListResponse>("/tasks", { params: serializeParams(params) });
}

/**
 * Fetch a single task by ID.
 */
async function fetchTask(id: string): Promise<Task> {
  return api.get<Task>(`/tasks/${id}`);
}

/**
 * Options for useTasks hook.
 */
export interface UseTasksOptions extends TaskListParams {
  enabled?: boolean;
}

/**
 * Hook for fetching paginated task list.
 *
 * Uses React Query for caching, deduplication, and background refresh.
 *
 * @example
 * ```tsx
 * function TaskList() {
 *   const { tasks, isLoading, error, pagination } = useTasks({
 *     page: 1,
 *     pageSize: 20,
 *     isCompleted: false,
 *   });
 *
 *   if (isLoading) return <TaskListSkeleton />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return tasks.map(task => <TaskCard key={task.id} task={task} />);
 * }
 * ```
 */
export function useTasks(options: UseTasksOptions = {}) {
  const { enabled = true, ...params } = options;

  const query = useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => fetchTasks(params),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    tasks: query.data?.items ?? [],
    pagination: query.data
      ? {
          page: query.data.page,
          pageSize: query.data.pageSize,
          total: query.data.total,
          totalPages: query.data.totalPages,
          hasNext: query.data.page < query.data.totalPages,
          hasPrevious: query.data.page > 1,
        }
      : null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching a single task.
 *
 * @example
 * ```tsx
 * function TaskDetail({ taskId }: { taskId: string }) {
 *   const { task, isLoading, error } = useTask(taskId);
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   if (!task) return <NotFound />;
 *
 *   return <TaskView task={task} />;
 * }
 * ```
 */
export function useTask(taskId: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => fetchTask(taskId),
    enabled: enabled && !!taskId,
    staleTime: 30 * 1000,
  });

  return {
    task: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to prefetch tasks for a page.
 *
 * Useful for prefetching the next page in pagination.
 */
export function usePrefetchTasks() {
  const queryClient = useQueryClient();

  return (params: TaskListParams) => {
    queryClient.prefetchQuery({
      queryKey: taskKeys.list(params),
      queryFn: () => fetchTasks(params),
      staleTime: 30 * 1000,
    });
  };
}

/**
 * Hook to invalidate all task queries.
 *
 * Call after mutations to refresh the task list.
 */
export function useInvalidateTasks() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.all });
  };
}
