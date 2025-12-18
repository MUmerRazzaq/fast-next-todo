/**
 * API TypeScript types matching backend schemas.
 *
 * These types should be kept in sync with backend/app/schemas/*.py
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Task priority levels.
 */
export type Priority = "low" | "medium" | "high";

/**
 * Task recurrence patterns.
 */
export type Recurrence = "none" | "daily" | "weekly" | "monthly";

// ============================================================================
// Tag Types
// ============================================================================

/**
 * Tag embedded in task responses.
 */
export interface TagInTask {
  id: string;
  name: string;
}

/**
 * Full tag response.
 */
export interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

/**
 * Create tag request.
 */
export interface TagCreate {
  name: string;
}

/**
 * Update tag request.
 */
export interface TagUpdate {
  name?: string;
}

// ============================================================================
// Task Types
// ============================================================================

/**
 * Task response from API.
 */
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  recurrence: Recurrence;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: TagInTask[];
}

/**
 * Create task request.
 */
export interface TaskCreate {
  title: string;
  description?: string | null;
  priority?: Priority;
  due_date?: string | null;
  recurrence?: Recurrence;
  tag_ids?: string[];
}

/**
 * Update task request (partial).
 */
export interface TaskUpdate {
  title?: string;
  description?: string | null;
  priority?: Priority;
  dueDate?: string | null;
  recurrence?: Recurrence;
  tagIds?: string[];
}

/**
 * Complete task response (may include next recurring task).
 */
export interface CompleteTaskResponse extends Task {
  nextTask: Task | null;
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Paginated list response wrapper.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated task list response.
 */
export type TaskListResponse = PaginatedResponse<Task>;

/**
 * Paginated tag list response.
 */
export type TagListResponse = PaginatedResponse<Tag>;

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Task list query parameters.
 */
export interface TaskListParams {
  page?: number;
  pageSize?: number;
  priority?: Priority;
  isCompleted?: boolean;
  search?: string;
  tagIds?: string[];
  dueFrom?: string;
  dueTo?: string;
  sortBy?: "created_at" | "due_date" | "priority" | "title";
  sortOrder?: "asc" | "desc";
}

/**
 * Tag list query parameters.
 */
export interface TagListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// ============================================================================
// Auth Types
// ============================================================================

/**
 * User session from Better Auth.
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Session object from Better Auth.
 */
export interface Session {
  user: User;
  expiresAt: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API error response.
 */
export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

/**
 * Health check response.
 */
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  version: string;
  timestamp: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make certain keys required in a type.
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Convert snake_case API response to camelCase frontend type.
 * Used for type assertions when transforming API responses.
 */
export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>;

/**
 * Helper to check if a task is overdue.
 */
export function isTaskOverdue(task: Task): boolean {
  if (task.dueDate === null || task.isCompleted) {
    return false;
  }
  return new Date() > new Date(task.dueDate);
}

/**
 * Helper to get priority color class.
 */
export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-yellow-500";
    case "low":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
}
