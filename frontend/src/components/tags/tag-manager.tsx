"use client";

import { useState } from "react";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/use-tags";
import { useToast } from "@/components/ui/toast";
import type { Tag } from "@/types/api";

interface TagManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Tag manager dialog for CRUD operations on tags.
 *
 * Features:
 * - List all user's tags
 * - Create new tags
 * - Edit tag names
 * - Delete tags (with confirmation)
 */
export function TagManager({ open, onOpenChange }: TagManagerProps) {
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { addToast } = useToast();

  const { tags, isLoading } = useTags({ pageSize: 100 });

  const { createTag, isCreating } = useCreateTag({
    onSuccess: () => {
      setNewTagName("");
      addToast("Tag created!", "success");
    },
    onError: () => addToast("Failed to create tag", "error"),
  });

  const { updateTag, isUpdating } = useUpdateTag({
    onSuccess: () => {
      setEditingTag(null);
      setEditName("");
      addToast("Tag updated!", "success");
    },
    onError: () => addToast("Failed to update tag", "error"),
  });

  const { deleteTag, isDeleting } = useDeleteTag({
    onSuccess: () => {
      setDeleteConfirm(null);
      addToast("Tag deleted!", "success");
    },
    onError: () => addToast("Failed to delete tag", "error"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    // Check for duplicates
    if (tags.some((tag) => tag.name.toLowerCase() === trimmed.toLowerCase())) {
      addToast("Tag already exists", "error");
      return;
    }

    createTag({ name: trimmed });
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
  };

  const handleSaveEdit = () => {
    if (!editingTag) return;
    const trimmed = editName.trim();
    if (!trimmed || trimmed === editingTag.name) {
      setEditingTag(null);
      return;
    }

    // Check for duplicates (excluding current tag)
    if (
      tags.some(
        (tag) =>
          tag.id !== editingTag.id &&
          tag.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      addToast("Tag already exists", "error");
      return;
    }

    updateTag({ id: editingTag.id, data: { name: trimmed } });
  };

  const handleDelete = (tagId: string) => {
    deleteTag(tagId);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Manage Tags</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded p-1 hover:bg-muted"
            aria-label="Close"
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

        {/* Create new tag form */}
        <form onSubmit={handleCreate} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name..."
            maxLength={50}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isCreating || !newTagName.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "..." : "Add"}
          </button>
        </form>

        {/* Tag list */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Loading tags...
            </div>
          ) : tags.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No tags yet. Create your first tag above.
            </div>
          ) : (
            <ul className="space-y-2">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  className="flex items-center gap-2 rounded-md border p-2"
                >
                  {editingTag?.id === tag.id ? (
                    // Edit mode
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={50}
                        className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") setEditingTag(null);
                        }}
                      />
                      <button
                        onClick={handleSaveEdit}
                        disabled={isUpdating}
                        className="rounded p-1 text-primary hover:bg-primary/10"
                        aria-label="Save"
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingTag(null)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted"
                        aria-label="Cancel"
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
                    </>
                  ) : deleteConfirm === tag.id ? (
                    // Delete confirmation
                    <>
                      <span className="flex-1 text-sm text-destructive">
                        Delete "{tag.name}"?
                      </span>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        disabled={isDeleting}
                        className="rounded px-2 py-1 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "..." : "Yes"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded px-2 py-1 text-xs border hover:bg-muted"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    // Display mode
                    <>
                      <span className="flex-1 text-sm">{tag.name}</span>
                      <button
                        onClick={() => handleStartEdit(tag)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Edit ${tag.name}`}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(tag.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${tag.name}`}
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
