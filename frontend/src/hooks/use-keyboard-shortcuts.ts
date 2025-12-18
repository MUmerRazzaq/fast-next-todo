"use client";

import { useEffect, useCallback, useRef } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook for handling keyboard shortcuts.
 * Automatically prevents default behavior and handles modifier keys.
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        // Allow some shortcuts even in inputs (like Escape)
        if (event.key !== "Escape") {
          return;
        }
      }

      for (const shortcut of shortcutsRef.current) {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatches = !!shortcut.shift === event.shiftKey;
        const altMatches = !!shortcut.alt === event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Format a keyboard shortcut for display.
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(navigator.platform.includes("Mac") ? "Cmd" : "Ctrl");
  }
  if (shortcut.alt) {
    parts.push(navigator.platform.includes("Mac") ? "Option" : "Alt");
  }
  if (shortcut.shift) {
    parts.push("Shift");
  }

  // Format special keys
  const keyMap: Record<string, string> = {
    arrowup: "\u2191",
    arrowdown: "\u2193",
    arrowleft: "\u2190",
    arrowright: "\u2192",
    enter: "\u21B5",
    escape: "Esc",
    backspace: "\u232B",
    delete: "Del",
    " ": "Space",
  };

  const displayKey = keyMap[shortcut.key.toLowerCase()] || shortcut.key.toUpperCase();
  parts.push(displayKey);

  return parts.join(" + ");
}

/**
 * Common task-related keyboard shortcuts.
 */
export const TASK_SHORTCUTS = {
  NAVIGATE_UP: { key: "k", description: "Move to previous task" },
  NAVIGATE_DOWN: { key: "j", description: "Move to next task" },
  NEW_TASK: { key: "n", description: "Create new task" },
  EDIT_TASK: { key: "e", description: "Edit selected task" },
  DELETE_TASK: { key: "Delete", description: "Delete selected task" },
  COMPLETE_TASK: { key: "Enter", ctrl: true, description: "Toggle task completion" },
  SEARCH: { key: "/", description: "Focus search input" },
  SHOW_HELP: { key: "?", description: "Show keyboard shortcuts" },
  ESCAPE: { key: "Escape", description: "Close dialog / Clear selection" },
} as const;

export type TaskShortcutKey = keyof typeof TASK_SHORTCUTS;
