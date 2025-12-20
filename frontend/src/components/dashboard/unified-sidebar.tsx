"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ListTodo,
  Tags,
  PanelLeftClose,
  PanelRightClose,
  Filter,
} from "lucide-react";
import type { Priority, Tag } from "@/types/api";

// Copied from filter-sidebar.tsx - will be part of this component now
export interface TaskFilters {
  isCompleted?: boolean;
  priorities: Priority[];
  tagIds: string[];
  dueFrom?: string;
  dueTo?: string;
}

export function getDefaultFilters(): TaskFilters {
  return {
    isCompleted: undefined,
    priorities: [],
    tagIds: [],
    dueFrom: undefined,
    dueTo: undefined,
  };
}

export function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    filters.isCompleted !== undefined ||
    filters.priorities.length > 0 ||
    filters.tagIds.length > 0 ||
    filters.dueFrom !== undefined ||
    filters.dueTo !== undefined
  );
}

const STATUS_OPTIONS = [
  { value: undefined, label: "All Tasks" },
  { value: false, label: "Active" },
  { value: true, label: "Completed" },
] as const;

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "bg-red-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "low", label: "Low", color: "bg-green-500" },
];

// New props for the unified sidebar
interface UnifiedSidebarProps {
  isCollapsed: boolean;
  onCollapse: () => void;
  filters?: TaskFilters;
  onFiltersChange?: (filters: TaskFilters) => void;
  filterCounts?: {
    all: number;
    active: number;
    completed: number;
    highPriority: number;
    overdue: number;
  };
  tags?: Tag[];
  className?: string;
}

const navItems = [
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/tags", label: "Tags", icon: Tags },
];

export function UnifiedSidebar({
  isCollapsed,
  onCollapse,
  filters,
  onFiltersChange,
  filterCounts,
  tags = [],
  className,
}: UnifiedSidebarProps) {
  const pathname = usePathname();
  const showFilters = pathname === '/tasks' && filters && onFiltersChange;

  const hasFilters = useMemo(() => (filters ? hasActiveFilters(filters) : false), [filters]);

  const handleStatusChange = (value: boolean | undefined) => {
    if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, isCompleted: value });
    }
  };

  const handlePriorityToggle = (priority: Priority) => {
    if (onFiltersChange && filters) {
      const priorities = filters.priorities.includes(priority)
        ? filters.priorities.filter((p) => p !== priority)
        : [...filters.priorities, priority];
      onFiltersChange({ ...filters, priorities });
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (onFiltersChange && filters) {
      const tagIds = filters.tagIds.includes(tagId)
        ? filters.tagIds.filter((id) => id !== tagId)
        : [...filters.tagIds, tagId];
      onFiltersChange({ ...filters, tagIds });
    }
  };

  const handleClearFilters = () => {
    if (onFiltersChange) {
        onFiltersChange(getDefaultFilters());
    }
  };

  const handleDueFromChange = (date: string) => {
    if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, dueFrom: date || undefined });
    }
  };

  const handleDueToChange = (date: string) => {
    if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, dueTo: date || undefined });
    }
  };

  return (
    <aside
      className={cn(
        "relative flex h-full w-72 flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed && "w-16",
        className
      )}
    >
      {/* App Logo/Title */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/tasks" className="flex items-center gap-2">
          <ListTodo className="h-6 w-6 text-primary" />
          <span
            className={cn(
              "font-semibold text-foreground transition-all duration-300",
              isCollapsed && "w-0 overflow-hidden"
            )}
          >
            Todo App
          </span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {/* Navigation */}
        <div className={cn("flex flex-col gap-1", isCollapsed && "items-center")}>
            <p className={cn("px-3 text-xs font-semibold uppercase text-muted-foreground/80 mb-2 mt-4", isCollapsed && "hidden")}>Navigation</p>
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href === "/tasks" && pathname === "/");
                return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    isActive && "bg-accent text-foreground",
                    isCollapsed && "justify-center"
                    )}
                >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className={cn("overflow-hidden transition-all duration-300", isCollapsed && "w-0")}>
                    {item.label}
                    </span>
                </Link>
                );
            })}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 flex flex-col gap-1 border-t pt-4">
            <div
              className={cn(
                "flex flex-col gap-1",
                isCollapsed && "h-0 overflow-hidden opacity-0"
              )}
            >
              <div className="mb-2 flex items-center justify-between px-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Filters
                </h3>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="px-3 text-xs font-medium text-foreground">
                  Status
                </label>
                {STATUS_OPTIONS.map((option) => {
                  const count =
                    option.value === undefined
                      ? filterCounts?.all
                      : option.value === false
                      ? filterCounts?.active
                      : filterCounts?.completed;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleStatusChange(option.value)}
                      className={cn(
                        "flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors",
                        filters.isCompleted === option.value
                          ? "font-semibold text-primary"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {option.label}
                      {filterCounts && count !== undefined && (
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Priority Filter */}
              <div className="mt-4 space-y-1">
                <label className="px-3 text-xs font-medium text-foreground">
                  Priority
                </label>
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePriorityToggle(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors",
                      filters.priorities.includes(option.value)
                        ? "font-semibold text-primary"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn("h-2 w-2 rounded-full", option.color)}
                      />
                      <span>{option.label}</span>
                    </span>
                    {option.value === "high" &&
                      filterCounts?.highPriority !== undefined &&
                      filterCounts.highPriority > 0 && (
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                          {filterCounts.highPriority}
                        </span>
                      )}
                  </button>
                ))}
              </div>

              {/* Tag Filter */}

              {/* Due Date Filter */}
              <div className="mt-4 space-y-1">
                <label className="px-3 text-xs font-medium text-foreground">
                  Due Date
                </label>
                <div className="flex flex-col gap-2 px-3">
                  <Input
                    type="date"
                    placeholder="Due From"
                    value={filters.dueFrom || ""}
                    onChange={(e) => handleDueFromChange(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input
                    type="date"
                    placeholder="Due To"
                    value={filters.dueTo || ""}
                    onChange={(e) => handleDueToChange(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <label className="px-3 text-xs font-medium text-foreground">
                  Tags
                </label>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={cn(
                        "flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors",
                        filters.tagIds.includes(tag.id)
                          ? "font-semibold text-primary"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {isCollapsed && (
                <div className="flex flex-col items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onCollapse} className="w-full">
                        <Filter className="h-5 w-5" />
                         <span className="sr-only">Show filters</span>
                    </Button>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="icon"
          className={cn("w-full", !isCollapsed && "justify-start")}
          onClick={onCollapse}
        >
          {isCollapsed ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <div className="flex items-center gap-3">
              <PanelLeftClose className="h-5 w-5" />
              <span>Collapse</span>
            </div>
          )}
        </Button>
      </div>
    </aside>
  );
}
