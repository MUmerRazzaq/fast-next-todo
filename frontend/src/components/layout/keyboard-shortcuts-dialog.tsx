"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { key: "?", description: "Open this shortcuts help dialog" },
  { key: "n", description: "Create a new task" },
  { key: "/", description: "Focus the search bar (coming soon)" },
  { key: "t", description: "Navigate to the Tags page" },
  { key: "s", description: "Navigate to the Settings page" },
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
              <div key={shortcut.key} className="flex items-center gap-4">
                <dt className="w-12 text-right">
                  <kbd className="pointer-events-none inline-flex h-8 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-sm font-medium text-muted-foreground opacity-100">
                    {shortcut.key}
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
