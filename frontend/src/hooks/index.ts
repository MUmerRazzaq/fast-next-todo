/**
 * Custom React hooks.
 */

export { useAuth } from "./use-auth";
export type { UseAuthReturn, User } from "./use-auth";

export { useTasks, useTask, usePrefetchTasks, useInvalidateTasks, taskKeys } from "./use-tasks";
export type { UseTasksOptions } from "./use-tasks";

export {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
  useUncompleteTask,
  useTaskMutations,
} from "./use-task-mutations";
