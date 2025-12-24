"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { Task } from "@/types/api";
import type { AuditLogEntry, ActionType, AuditLogListResponse } from "@/types/audit";
import { formatActionType, getActionColor } from "@/types/audit";

// Define known action types for more maintainable icon logic
const KNOWN_ACTION_TYPES: ActionType[] = [
  "create",
  "update",
  "complete",
  "uncomplete",
  "delete",
  "recurring_auto_create",
];

interface TaskAuditDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskAuditDialog({
  task,
  open,
  onOpenChange,
}: TaskAuditDialogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // api.get automatically transforms snake_case to camelCase
      const response = await api.get<AuditLogListResponse>(
        `/tasks/${task.id}/audit`
      );
      setLogs(response.items as AuditLogEntry[]);
    } catch {
      setError("Failed to load audit history");
    } finally {
      setIsLoading(false);
    }
  }, [task.id]);

  useEffect(() => {
    if (open) {
      fetchAuditLogs();
    }
  }, [open, task.id, fetchAuditLogs]);

  if (!open) return null;

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatFieldValue = (value: string | null) => {
    if (!value) return "-";
    try {
      // Try to parse JSON and format nicely
      const parsed = JSON.parse(value);
      if (typeof parsed === "boolean") {
        return parsed ? "Yes" : "No";
      }
      return String(parsed);
    } catch {
      return value;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-lg border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Task History
            </h2>
            <p className="text-sm text-muted-foreground">{task.title}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "60vh" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg
                className="h-6 w-6 animate-spin text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No history available
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-4 rounded-lg border p-4"
                >
                  {/* Action icon */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted ${getActionColor(
                      log.actionType
                    )}`}
                  >
                    {log.actionType === "create" && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {log.actionType === "update" && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                    {log.actionType === "complete" && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {log.actionType === "uncomplete" && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {log.actionType === "delete" && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    {log.actionType === "recurring_auto_create" && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {!KNOWN_ACTION_TYPES.includes(log.actionType) && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.174 3.355 1.945 3.355h13.713c1.77 0 2.81-1.855 1.943-3.356L12 2.25 2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getActionColor(log.actionType)}`}>
                        {formatActionType(log.actionType)}
                      </span>
                      {log.isSystemAction && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          System
                        </span>
                      )}
                    </div>

                    {log.fieldChanged && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium">{log.fieldChanged}</span>
                        {log.oldValue && (
                          <>
                            {" changed from "}
                            <span className="text-foreground">
                              {formatFieldValue(log.oldValue)}
                            </span>
                          </>
                        )}
                        {log.newValue && (
                          <>
                            {" to "}
                            <span className="text-foreground">
                              {formatFieldValue(log.newValue)}
                            </span>
                          </>
                        )}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
