"use client";

import type { TagInTask } from "@/types/api";

interface TagBadgeProps {
  tag: TagInTask;
  onRemove?: () => void;
  size?: "sm" | "md";
}

/**
 * Tag badge component for displaying individual tags.
 *
 * Features:
 * - Compact display with tag name
 * - Optional remove button
 * - Two size variants
 */
export function TagBadge({ tag, onRemove, size = "sm" }: TagBadgeProps) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-md bg-muted text-muted-foreground
        ${sizeClasses[size]}
      `}
    >
      <span className="max-w-[100px] truncate">{tag.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-sm hover:bg-muted-foreground/20 focus:outline-none"
          aria-label={`Remove ${tag.name} tag`}
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
      )}
    </span>
  );
}

/**
 * Display a list of tags as badges.
 */
interface TagBadgeListProps {
  tags: TagInTask[];
  maxDisplay?: number;
  size?: "sm" | "md";
}

export function TagBadgeList({ tags, maxDisplay = 3, size = "sm" }: TagBadgeListProps) {
  if (tags.length === 0) return null;

  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} size={size} />
      ))}
      {remainingCount > 0 && (
        <span
          className={`
            inline-flex items-center rounded-md bg-muted/50 text-muted-foreground
            ${size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"}
          `}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
