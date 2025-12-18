"use client";

import type { Priority } from "@/types/api";

interface PriorityBadgeProps {
  priority: Priority;
  showLabel?: boolean;
}

/**
 * Priority badge component with color coding and optional animation.
 * - High: Red with animated pulse
 * - Medium: Amber/Yellow
 * - Low: Green
 */
export function PriorityBadge({ priority, showLabel = true }: PriorityBadgeProps) {
  const config = {
    high: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      ring: "ring-red-500/20",
      label: "High",
      animate: true,
    },
    medium: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-400",
      ring: "ring-yellow-500/20",
      label: "Medium",
      animate: false,
    },
    low: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      ring: "ring-green-500/20",
      label: "Low",
      animate: false,
    },
  };

  const { bg, text, ring, label, animate } = config[priority];

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset
        ${bg} ${text} ${ring}
        ${animate ? "animate-pulse" : ""}
      `}
    >
      {/* Priority indicator dot */}
      <span
        className={`
          h-1.5 w-1.5 rounded-full
          ${priority === "high" ? "bg-red-500" : ""}
          ${priority === "medium" ? "bg-yellow-500" : ""}
          ${priority === "low" ? "bg-green-500" : ""}
        `}
      />
      {showLabel && label}
    </span>
  );
}

/**
 * Get priority-specific icon for more visual distinction.
 */
export function PriorityIcon({ priority }: { priority: Priority }) {
  const iconConfig = {
    high: (
      <svg
        className="h-4 w-4 text-red-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
          clipRule="evenodd"
          transform="rotate(180 10 10)"
        />
      </svg>
    ),
    medium: (
      <svg
        className="h-4 w-4 text-yellow-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
          clipRule="evenodd"
        />
      </svg>
    ),
    low: (
      <svg
        className="h-4 w-4 text-green-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return iconConfig[priority];
}
