"use client";

import { TaskCard } from "./task-card";
import type { Task } from "@/types/api";

interface TaskListProps {
  tasks: Task[];
  selectedTaskIndex: number | null;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({ tasks, selectedTaskIndex, onEdit, onDelete }: TaskListProps) {
  const selectedTaskId = selectedTaskIndex !== null ? tasks[selectedTaskIndex]?.id : null;
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  if (activeTasks.length === 0 && completedTasks.length === 0) {
      return null;
  }

  return (
    <div className="space-y-8">
      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Active
          </h3>
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} isSelected={task.id === selectedTaskId} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3 opacity-70">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} isSelected={task.id === selectedTaskId} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
