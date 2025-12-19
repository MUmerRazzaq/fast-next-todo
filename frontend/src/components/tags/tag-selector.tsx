"use client";

import { useState } from "react";
import { useTags, useCreateTag } from "@/hooks/use-tags";
import { useToast } from "@/hooks/use-toast";

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  maxTags?: number;
}

/**
 * Multi-select tag selector component.
 *
 * Features:
 * - Search/filter existing tags
 * - Create new tags inline
 * - Maximum tag limit (default 10)
 */
export function TagSelector({
  selectedTagIds,
  onChange,
  maxTags = 10,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { tags, isLoading } = useTags({ search: search || undefined });
  const { createTag } = useCreateTag({
    onSuccess: () => {
      setSearch("");
      setIsCreating(false);
      toast({ title: "Tag created!" });
    },
    onError: () => toast({ title: "Failed to create tag", variant: "destructive" }),
  });

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter((tag) => !selectedTagIds.includes(tag.id));

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else if (selectedTagIds.length < maxTags) {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = () => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;

    // Check if tag already exists
    const exists = tags.some(
      (tag) => tag.name.toLowerCase() === trimmedSearch.toLowerCase()
    );
    if (exists) {
      toast({ title: "Tag already exists", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    createTag({ name: trimmedSearch });
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-foreground mb-1">
        Tags ({selectedTagIds.length}/{maxTags})
      </label>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:text-primary/70"
                aria-label={`Remove ${tag.name}`}
              >
                <svg
                  className="h-3 w-3"
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
            </span>
          ))}
        </div>
      )}

      {/* Search/Select input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search or create tags..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={selectedTagIds.length >= maxTags}
        />

        {/* Dropdown */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-auto">
              {isLoading ? (
                <div className="p-3 text-sm text-muted-foreground">
                  Loading tags...
                </div>
              ) : (
                <>
                  {/* Available tags */}
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        handleToggleTag(tag.id);
                        setSearch("");
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
                      disabled={selectedTagIds.length >= maxTags}
                    >
                      {tag.name}
                      {selectedTagIds.includes(tag.id) && (
                        <svg
                          className="h-4 w-4 text-primary"
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
                      )}
                    </button>
                  ))}

                  {/* Create new tag option */}
                  {search.trim() &&
                    !tags.some(
                      (tag) =>
                        tag.name.toLowerCase() === search.trim().toLowerCase()
                    ) && (
                      <button
                        type="button"
                        onClick={handleCreateTag}
                        disabled={isCreating}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-primary flex items-center gap-2"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        {isCreating ? "Creating..." : `Create "${search.trim()}"`}
                      </button>
                    )}

                  {/* No results */}
                  {availableTags.length === 0 && !search.trim() && (
                    <div className="p-3 text-sm text-muted-foreground">
                      No tags available. Type to create one.
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
