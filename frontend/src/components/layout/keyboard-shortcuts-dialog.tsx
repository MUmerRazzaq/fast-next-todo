"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TASK_SHORTCUTS, formatShortcut } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
    TASK_SHORTCUTS.SHOW_HELP,
    TASK_SHORTCUTS.NEW_TASK,
    TASK_SHORTCUTS.SEARCH,
    TASK_SHORTCUTS.NAVIGATE_DOWN,
    TASK_SHORTCUTS.NAVIGATE_UP,
    TASK_SHORTCUTS.EDIT_TASK,
    TASK_SHORTCUTS.DELETE_TASK,
    TASK_SHORTCUTS.COMPLETE_TASK,
    TASK_SHORTCUTS.ESCAPE,
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <dl className="space-y-4">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.description} className="flex items-center gap-4">
                <dt className="w-24 text-right">
                  <kbd className="pointer-events-none inline-flex h-8 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-sm font-medium text-muted-foreground opacity-100">
                    {formatShortcut(shortcut)}
                  </kbd>
                </dt>
                <dd className="flex-1 text-sm text-muted-foreground">
                  {shortcut.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  );
}
