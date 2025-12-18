/**
 * Audit log types for the frontend.
 */

export type ActionType =
  | "create"
  | "update"
  | "complete"
  | "uncomplete"
  | "delete"
  | "recurring_auto_create";

export interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  userId: string;
  actionType: ActionType;
  fieldChanged: string | null;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
  isSystemAction: boolean;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  total: number;
}

/**
 * Format an action type for display.
 */
export function formatActionType(action: ActionType): string {
  const actionMap: Record<ActionType, string> = {
    create: "Created",
    update: "Updated",
    complete: "Completed",
    uncomplete: "Reopened",
    delete: "Deleted",
    recurring_auto_create: "Auto-created (Recurring)",
  };
  return actionMap[action] || action;
}

/**
 * Get a color class for an action type.
 */
export function getActionColor(action: ActionType): string {
  const colorMap: Record<ActionType, string> = {
    create: "text-green-600 dark:text-green-400",
    update: "text-blue-600 dark:text-blue-400",
    complete: "text-primary",
    uncomplete: "text-amber-600 dark:text-amber-400",
    delete: "text-destructive",
    recurring_auto_create: "text-purple-600 dark:text-purple-400",
  };
  return colorMap[action] || "text-muted-foreground";
}
