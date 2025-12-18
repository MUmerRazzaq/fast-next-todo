"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { taskKeys } from "./use-tasks";
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  CompleteTaskResponse,
} from "@/types/api";

/**
 * API functions for task mutations.
 */
const taskApi = {
  create: (data: TaskCreate) => api.post<Task>("/tasks", data),
  update: (id: string, data: TaskUpdate) => api.patch<Task>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete<void>(`/tasks/${id}`),
  complete: (id: string) => api.post<CompleteTaskResponse>(`/tasks/${id}/complete`),
  uncomplete: (id: string) => api.post<Task>(`/tasks/${id}/uncomplete`),
};

/**
 * Options for mutation hooks.
 */
interface MutationOptions<TData = unknown> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for creating a new task.
 *
 * @example
 * ```tsx
 * function CreateTaskForm() {
 *   const { createTask, isCreating } = useCreateTask({
 *     onSuccess: () => toast.success("Task created!"),
 *   });
 *
 *   return (
 *     <form onSubmit={(e) => {
 *       e.preventDefault();
 *       createTask({ title: "New task" });
 *     }}>
 *       <button disabled={isCreating}>Create</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateTask(options: MutationOptions<Task> = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: TaskCreate) => taskApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });

  return {
    createTask: mutation.mutate,
    createTaskAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook for updating a task.
 *
 * Supports optimistic updates for immediate UI feedback.
 */
export function useUpdateTask(options: MutationOptions<Task> = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskUpdate }) =>
      taskApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

      // Snapshot previous value
      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(id));

      // Optimistically update
      if (previousTask) {
        queryClient.setQueryData<Task>(taskKeys.detail(id), {
          ...previousTask,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousTask };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), context.previousTask);
      }
      options.onError?.(err);
    },
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onSettled: (_, __, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });

  return {
    updateTask: mutation.mutate,
    updateTaskAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook for deleting a task.
 *
 * Uses optimistic updates to immediately remove from UI.
 */
export function useDeleteTask(options: MutationOptions<void> = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });

  return {
    deleteTask: mutation.mutate,
    deleteTaskAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook for completing a task.
 *
 * Returns the completed task and optionally the next recurring task.
 */
export function useCompleteTask(
  options: MutationOptions<CompleteTaskResponse> = {}
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => taskApi.complete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(id));

      // Optimistically mark as completed
      if (previousTask) {
        queryClient.setQueryData<Task>(taskKeys.detail(id), {
          ...previousTask,
          isCompleted: true,
          completedAt: new Date().toISOString(),
        });
      }

      return { previousTask };
    },
    onError: (err, id, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), context.previousTask);
      }
      options.onError?.(err);
    },
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });

  return {
    completeTask: mutation.mutate,
    completeTaskAsync: mutation.mutateAsync,
    isCompleting: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook for uncompleting a task.
 */
export function useUncompleteTask(options: MutationOptions<Task> = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => taskApi.uncomplete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(id));

      // Optimistically mark as incomplete
      if (previousTask) {
        queryClient.setQueryData<Task>(taskKeys.detail(id), {
          ...previousTask,
          isCompleted: false,
          completedAt: null,
        });
      }

      return { previousTask };
    },
    onError: (err, id, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), context.previousTask);
      }
      options.onError?.(err);
    },
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });

  return {
    uncompleteTask: mutation.mutate,
    uncompleteTaskAsync: mutation.mutateAsync,
    isUncompleting: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook that combines all task mutations for convenience.
 *
 * @example
 * ```tsx
 * function TaskActions({ task }: { task: Task }) {
 *   const { completeTask, deleteTask, isLoading } = useTaskMutations();
 *
 *   return (
 *     <>
 *       <button onClick={() => completeTask(task.id)} disabled={isLoading}>
 *         Complete
 *       </button>
 *       <button onClick={() => deleteTask(task.id)} disabled={isLoading}>
 *         Delete
 *       </button>
 *     </>
 *   );
 * }
 * ```
 */
export function useTaskMutations() {
  const create = useCreateTask();
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const complete = useCompleteTask();
  const uncomplete = useUncompleteTask();

  return {
    createTask: create.createTask,
    updateTask: update.updateTask,
    deleteTask: remove.deleteTask,
    completeTask: complete.completeTask,
    uncompleteTask: uncomplete.uncompleteTask,
    isLoading:
      create.isCreating ||
      update.isUpdating ||
      remove.isDeleting ||
      complete.isCompleting ||
      uncomplete.isUncompleting,
  };
}
