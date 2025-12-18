"use client";

function TaskCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox skeleton */}
        <div className="mt-0.5 h-5 w-5 shrink-0 animate-pulse rounded border-2 border-muted bg-muted" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="h-5 w-5 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function TaskListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
