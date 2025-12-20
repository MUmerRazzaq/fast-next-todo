"use client";

import { getAuthToken } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { config } from "@/lib/config";

type ExportFormat = "csv" | "json";

interface ExportButtonProps {
  className?: string;
}

export function ExportButton({ className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setShowDropdown(false);

    const token = await getAuthToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please sign in again.",
        variant: "destructive",
      });
      setIsExporting(false);
      return;
    }

    try {
      const response = await fetch(
        `${config.apiUrl}/tasks/export/download?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let errorMessage = `Export failed with status: ${response.status}`;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.detail || errorMessage;
        } catch {
          // Ignore if response is not JSON
        }
        throw new Error(errorMessage);
      }

      // Create download link
      const blob = await response.blob();

      // Frontend check for empty blob (due to potential backend issue)
      if (blob.size === 0) {
        toast({
          title: "Export Failed",
          description: "The exported file is empty. There might be an issue with the backend.",
          variant: "destructive",
        });
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tasks.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Tasks exported to ${format.toUpperCase()}`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast({
        title: "Export Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isExporting ? (
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )}
        Export
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-md border bg-popover py-1 shadow-md">
            <button
              type="button"
              onClick={() => handleExport("csv")}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport("json")}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              Export JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
