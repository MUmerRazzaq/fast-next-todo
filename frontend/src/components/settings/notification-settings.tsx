"use client";

import { useNotifications } from "@/hooks/use-notifications";

/**
 * Notification settings component.
 *
 * Allows users to:
 * - Enable/disable notifications
 * - Configure reminder time before due date
 * - Request notification permission
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   return <NotificationSettings />;
 * }
 * ```
 */
export function NotificationSettings() {
  const {
    isSupported,
    permission,
    settings,
    requestPermission,
    updateSettings,
  } = useNotifications();

  if (!isSupported) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-medium text-foreground">Notifications</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Browser notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  const handleEnableToggle = () => {
    if (permission !== "granted") {
      requestPermission();
    } else {
      updateSettings({ enabled: !settings.enabled });
    }
  };

  const handleReminderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ reminderMinutes: parseInt(e.target.value, 10) });
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-medium text-foreground">Notifications</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get notified when tasks are about to be due.
      </p>

      <div className="mt-4 space-y-4">
        {/* Permission/Enable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-foreground">
              Enable Notifications
            </label>
            <p className="text-xs text-muted-foreground">
              {permission === "denied"
                ? "Notifications are blocked. Update your browser settings."
                : permission === "default"
                ? "Click to enable browser notifications."
                : settings.enabled
                ? "You will receive task reminders."
                : "Notifications are paused."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleEnableToggle}
            disabled={permission === "denied"}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              permission === "granted" && settings.enabled
                ? "bg-primary"
                : "bg-muted"
            } ${
              permission === "denied" ? "cursor-not-allowed opacity-50" : ""
            }`}
            aria-label={settings.enabled ? "Disable notifications" : "Enable notifications"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                permission === "granted" && settings.enabled
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Reminder Time */}
        {permission === "granted" && settings.enabled && (
          <div>
            <label
              htmlFor="reminder-time"
              className="text-sm font-medium text-foreground"
            >
              Remind me before task is due
            </label>
            <select
              id="reminder-time"
              value={settings.reminderMinutes}
              onChange={handleReminderChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={1440}>1 day</option>
            </select>
          </div>
        )}

        {/* Permission Status */}
        {permission === "denied" && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Notifications Blocked</p>
            <p className="mt-1 text-xs">
              To enable notifications, click the lock icon in your browser&apos;s
              address bar and allow notifications for this site.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
