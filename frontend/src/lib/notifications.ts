/**
 * Browser Notifications utility.
 *
 * Provides functions for managing browser notifications including:
 * - Permission requests
 * - Scheduling notifications
 * - Task due date reminders
 */

/**
 * Notification permission states.
 */
export type NotificationPermission = "default" | "granted" | "denied";

/**
 * Scheduled notification info.
 */
interface ScheduledNotification {
  taskId: string;
  timeoutId: ReturnType<typeof setTimeout>;
  scheduledFor: Date;
}

// Store for scheduled notifications
const scheduledNotifications = new Map<string, ScheduledNotification>();

/**
 * Check if browser supports notifications.
 */
export function isNotificationsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

/**
 * Get current notification permission.
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationsSupported()) {
    return "denied";
  }
  return Notification.permission as NotificationPermission;
}

/**
 * Request notification permission from user.
 *
 * @returns Promise resolving to the permission state.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationsSupported()) {
    return "denied";
  }

  // Already granted
  if (Notification.permission === "granted") {
    return "granted";
  }

  // Request permission
  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Show a notification immediately.
 *
 * @param title - Notification title
 * @param options - Notification options
 * @returns The Notification object or null if failed
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (getNotificationPermission() !== "granted") {
    return null;
  }

  try {
    return new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });
  } catch (error) {
    console.error("Error showing notification:", error);
    return null;
  }
}

/**
 * Schedule a notification for a task due date.
 *
 * @param taskId - The task ID
 * @param taskTitle - The task title
 * @param dueDate - When the task is due
 * @param reminderMinutes - Minutes before due date to show notification (default: 15)
 * @returns Whether the notification was scheduled
 */
export function scheduleTaskNotification(
  taskId: string,
  taskTitle: string,
  dueDate: Date,
  reminderMinutes: number = 15
): boolean {
  if (getNotificationPermission() !== "granted") {
    return false;
  }

  // Cancel any existing notification for this task
  cancelTaskNotification(taskId);

  // Calculate when to show the notification
  const notificationTime = new Date(
    dueDate.getTime() - reminderMinutes * 60 * 1000
  );
  const now = new Date();

  // Don't schedule if the notification time has passed
  if (notificationTime <= now) {
    return false;
  }

  // Calculate delay in milliseconds
  const delay = notificationTime.getTime() - now.getTime();

  // Don't schedule if too far in the future (max 24 hours)
  // Browser timers can be unreliable for longer durations
  const maxDelay = 24 * 60 * 60 * 1000;
  if (delay > maxDelay) {
    return false;
  }

  // Schedule the notification
  const timeoutId = setTimeout(() => {
    showNotification(`Task Due: ${taskTitle}`, {
      body: `This task is due in ${reminderMinutes} minutes.`,
      tag: `task-${taskId}`,
      requireInteraction: true,
    });
    scheduledNotifications.delete(taskId);
  }, delay);

  // Store the scheduled notification
  scheduledNotifications.set(taskId, {
    taskId,
    timeoutId,
    scheduledFor: notificationTime,
  });

  return true;
}

/**
 * Cancel a scheduled notification for a task.
 *
 * @param taskId - The task ID
 */
export function cancelTaskNotification(taskId: string): void {
  const scheduled = scheduledNotifications.get(taskId);
  if (scheduled) {
    clearTimeout(scheduled.timeoutId);
    scheduledNotifications.delete(taskId);
  }
}

/**
 * Cancel all scheduled notifications.
 */
export function cancelAllTaskNotifications(): void {
  scheduledNotifications.forEach((scheduled) => {
    clearTimeout(scheduled.timeoutId);
  });
  scheduledNotifications.clear();
}

/**
 * Get count of scheduled notifications.
 */
export function getScheduledNotificationCount(): number {
  return scheduledNotifications.size;
}

/**
 * Check if a task has a scheduled notification.
 */
export function hasScheduledNotification(taskId: string): boolean {
  return scheduledNotifications.has(taskId);
}

/**
 * Storage key for notification settings.
 */
const NOTIFICATION_SETTINGS_KEY = "task-notification-settings";

/**
 * Notification settings.
 */
export interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number;
}

/**
 * Default notification settings.
 */
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  reminderMinutes: 15,
};

/**
 * Get notification settings from local storage.
 */
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }

  return DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Save notification settings to local storage.
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}
