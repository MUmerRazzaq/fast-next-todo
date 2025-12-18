"use client";

import { useEffect, useState } from "react";
import { useNotificationPrompt } from "@/hooks/use-notifications";

/**
 * Notification permission prompt banner.
 *
 * Shows a banner prompting users to enable notifications.
 * Only appears on first visit and when permission is in default state.
 */
export function NotificationPrompt() {
  const { shouldPrompt, prompt, permission } = useNotificationPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Delay showing the prompt to avoid jarring UX on page load
  useEffect(() => {
    if (shouldPrompt && !dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
    return undefined;
  }, [shouldPrompt, dismissed]);

  // Hide when permission changes
  useEffect(() => {
    if (permission !== "default") {
      setIsVisible(false);
    }
  }, [permission]);

  const handleEnable = async () => {
    await prompt();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-5">
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          {/* Bell Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h4 className="font-medium text-foreground">Enable Notifications</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Get reminders when your tasks are due.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleEnable}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Not now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <svg
              className="h-4 w-4"
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
      </div>
    </div>
  );
}
