"use client";

import { useEffect } from "react";
import { TASK_SHORTCUTS, formatShortcut } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcutGroups = [
  {
    title: "Navigation",
    shortcuts: [
      { ...TASK_SHORTCUTS.NAVIGATE_UP, handler: () => {} },
      { ...TASK_SHORTCUTS.NAVIGATE_DOWN, handler: () => {} },
      { ...TASK_SHORTCUTS.SEARCH, handler: () => {} },
    ],
  },
  {
    title: "Task Actions",
    shortcuts: [
      { ...TASK_SHORTCUTS.NEW_TASK, handler: () => {} },
      { ...TASK_SHORTCUTS.EDIT_TASK, handler: () => {} },
      { ...TASK_SHORTCUTS.DELETE_TASK, handler: () => {} },
      { ...TASK_SHORTCUTS.COMPLETE_TASK, handler: () => {} },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { ...TASK_SHORTCUTS.SHOW_HELP, handler: () => {} },
      { ...TASK_SHORTCUTS.ESCAPE, handler: () => {} },
    ],
  },
];

export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
}: KeyboardShortcutsHelpProps) {
  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Keyboard Shortcuts
          </h2>
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

        <div className="space-y-6">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-mono">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}
