"use client";

import { useState } from "react";
import { useCompleteTask, useUncompleteTask, useDeleteTask } from "@/hooks/use-task-mutations";
import { useToast } from "@/hooks/use-toast";
import { EditTaskDialog } from "./edit-task-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskAuditDialog } from "./task-audit-dialog";
import { PriorityBadge } from "./priority-badge";
import { TagBadgeList } from "@/components/tags/tag-badge";
import type { Task } from "@/types/api";
import { isTaskOverdue } from "@/types/api";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { toast } = useToast();

  const { completeTask, isCompleting } = useCompleteTask({
    onSuccess: () => toast({ title: "Task completed!" }),
    onError: () => toast({ title: "Failed to complete task", variant: "destructive" }),
  });
  const { uncompleteTask, isUncompleting } = useUncompleteTask({
    onSuccess: () => toast({ title: "Task marked incomplete" }),
    onError: () => toast({ title: "Failed to update task", variant: "destructive" }),
  });
  const { deleteTask, isDeleting } = useDeleteTask({
    onSuccess: () => toast({ title: "Task deleted" }),
    onError: () => toast({ title: "Failed to delete task", variant: "destructive" }),
  });

  const isLoading = isCompleting || isUncompleting || isDeleting;
  const overdue = isTaskOverdue(task);

  const handleToggleComplete = () => {
    if (task.isCompleted) {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        className={`group relative rounded-lg border bg-card p-4 transition-all hover:shadow-sm focus-within:shadow-sm ${
          task.isCompleted ? "opacity-60" : ""
        } ${overdue ? "border-destructive/50" : ""}`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={isLoading}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 outline-none transition-colors ${
              task.isCompleted
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground hover:border-primary"
            } disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            aria-label={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            {task.isCompleted && (
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={`font-medium text-foreground ${
                  task.isCompleted ? "line-through" : ""
                }`}
              >
                {task.title}
              </h3>
              {task.priority !== "medium" && (
                <PriorityBadge priority={task.priority} />
              )}
              {overdue && (
                <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  Overdue
                </span>
              )}
            </div>

            {task.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              {task.dueDate && (
                <span>
                  Due:{" "}
                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              {task.recurrence !== "none" && (
                <span className="inline-flex items-center gap-1">
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {task.recurrence.charAt(0).toUpperCase() + task.recurrence.slice(1)}
                </span>
              )}
              {task.tags.length > 0 && (
                <TagBadgeList tags={task.tags} maxDisplay={3} />
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="rounded p-1 text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-muted group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Task actions"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-md border bg-popover py-1 shadow-md">
                  <button
                    onClick={() => {
                      setShowActions(false);
                      setShowEditDialog(true);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      setShowAuditDialog(true);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    History
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      setShowDeleteDialog(true);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-destructive hover:bg-accent"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <EditTaskDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      <DeleteTaskDialog
        task={task}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
      <TaskAuditDialog
        task={task}
        open={showAuditDialog}
        onOpenChange={setShowAuditDialog}
      />
    </>
  );
}
