"use client";

import { useEffect, useState, useCallback } from "react";
import {
  isNotificationsSupported,
  getNotificationPermission,
  requestNotificationPermission,
  scheduleTaskNotification,
  cancelTaskNotification,
  cancelAllTaskNotifications,
  getNotificationSettings,
  saveNotificationSettings,
  type NotificationPermission,
  type NotificationSettings,
} from "@/lib/notifications";
import type { Task } from "@/types/api";

/**
 * Hook for managing browser notifications.
 *
 * Handles:
 * - Permission management
 * - Scheduling notifications for tasks
 * - Settings persistence
 *
 * @example
 * ```tsx
 * function TaskDashboard() {
 *   const { permission, requestPermission, scheduleForTasks } = useNotifications();
 *
 *   // Schedule notifications when tasks load
 *   useEffect(() => {
 *     if (tasks.length > 0) {
 *       scheduleForTasks(tasks);
 *     }
 *   }, [tasks, scheduleForTasks]);
 *
 *   return (
 *     <button onClick={requestPermission}>
 *       Enable Notifications
 *     </button>
 *   );
 * }
 * ```
 */
export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    reminderMinutes: 15,
  });

  // Initialize on mount
  useEffect(() => {
    const supported = isNotificationsSupported();
    setIsSupported(supported);

    if (supported) {
      setPermission(getNotificationPermission());
      setSettings(getNotificationSettings());
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) return "denied" as NotificationPermission;

    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<NotificationSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      saveNotificationSettings(updated);
    },
    [settings]
  );

  // Schedule notification for a single task
  const scheduleForTask = useCallback(
    (task: Task) => {
      if (!isSupported || permission !== "granted" || !settings.enabled) {
        return false;
      }

      // Only schedule for incomplete tasks with due dates
      if (task.isCompleted || !task.dueDate) {
        cancelTaskNotification(task.id);
        return false;
      }

      const dueDate = new Date(task.dueDate);
      return scheduleTaskNotification(
        task.id,
        task.title,
        dueDate,
        settings.reminderMinutes
      );
    },
    [isSupported, permission, settings.enabled, settings.reminderMinutes]
  );

  // Schedule notifications for multiple tasks
  const scheduleForTasks = useCallback(
    (tasks: Task[]) => {
      if (!isSupported || permission !== "granted" || !settings.enabled) {
        return;
      }

      tasks.forEach((task) => {
        scheduleForTask(task);
      });
    },
    [isSupported, permission, settings.enabled, scheduleForTask]
  );

  // Cancel notification for a task
  const cancelForTask = useCallback((taskId: string) => {
    cancelTaskNotification(taskId);
  }, []);

  // Cancel all notifications
  const cancelAll = useCallback(() => {
    cancelAllTaskNotifications();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAllTaskNotifications();
    };
  }, []);

  return {
    isSupported,
    permission,
    settings,
    requestPermission,
    updateSettings,
    scheduleForTask,
    scheduleForTasks,
    cancelForTask,
    cancelAll,
  };
}

/**
 * Hook that prompts for notification permission on first visit.
 *
 * Uses local storage to avoid repeated prompts.
 *
 * @example
 * ```tsx
 * function App() {
 *   useNotificationPrompt();
 *   return <Dashboard />;
 * }
 * ```
 */
export function useNotificationPrompt() {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [hasPrompted, setHasPrompted] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if we've already prompted
    const prompted = localStorage.getItem("notification-prompted");
    setHasPrompted(!!prompted);
  }, []);

  const prompt = useCallback(async () => {
    if (!isSupported || permission !== "default" || hasPrompted) {
      return;
    }

    // Mark as prompted
    localStorage.setItem("notification-prompted", "true");
    setHasPrompted(true);

    // Request permission
    return requestPermission();
  }, [isSupported, permission, hasPrompted, requestPermission]);

  const shouldPrompt = isSupported && permission === "default" && !hasPrompted;

  return {
    shouldPrompt,
    prompt,
    hasPrompted,
    permission,
  };
}
