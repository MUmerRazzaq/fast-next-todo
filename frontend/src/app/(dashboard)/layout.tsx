"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@/components/layout/user-button";
import { NotificationPrompt } from "@/components/layout/notification-prompt";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UnifiedSidebar } from "@/components/dashboard/unified-sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HelpCircle, Menu, X } from "lucide-react";
import { KeyboardShortcutsDialog } from "@/components/layout/keyboard-shortcuts-dialog";
import { FilterProvider, useFilters } from "@/context/filter-context";
import { useTags } from "@/hooks/use-tags";
import { useTasks } from "@/hooks/use-tasks";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardClientLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

  // Filters from context
  const { filters, setFilters } = useFilters();
  const { tags, isLoading: tagsLoading } = useTags({ pageSize: 100 });

  // Fetch counts for filters
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { pagination: allTasks } = useTasks({ pageSize: 1 });
  const { pagination: activeTasks } = useTasks({ isCompleted: false, pageSize: 1 });
  const { pagination: completedTasks } = useTasks({ isCompleted: true, pageSize: 1 });
  const { pagination: highPriorityTasks } = useTasks({ priority: "high", isCompleted: false, pageSize: 1 });
  const { pagination: overdueTasks } = useTasks({ dueTo: today, isCompleted: false, pageSize: 1 });

  const filterCounts = {
    all: allTasks?.total ?? 0,
    active: activeTasks?.total ?? 0,
    completed: completedTasks?.total ?? 0,
    highPriority: highPriorityTasks?.total ?? 0,
    overdue: overdueTasks?.total ?? 0,
  };


  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const handleCollapse = () => {
    setIsCollapsed(prevState => !prevState);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <UnifiedSidebar
        isCollapsed={isCollapsed}
        onCollapse={handleCollapse}
        className="hidden lg:flex"
        filters={filters}
        onFiltersChange={setFilters}
        tags={tags}
        filterCounts={filterCounts}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Sidebar */}
          <UnifiedSidebar
            isCollapsed={false}
            onCollapse={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-y-0 left-0 z-50 w-72"
            filters={filters}
            onFiltersChange={setFilters}
            tags={tags}
            filterCounts={filterCounts}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              >
                {isMobileSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
              <h1 className="text-lg font-semibold text-foreground">
                Fast Next Todo
              </h1>
            </div>

            <nav className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShortcutsDialog(true)}
              >
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Help & Keyboard Shortcuts</span>
              </Button>
              <UserButton />
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="container flex-1 px-4 py-6 pb-20 lg:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Notification Permission Prompt */}
        <NotificationPrompt />

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog
          open={showShortcutsDialog}
          onOpenChange={setShowShortcutsDialog}
        />
      </div>
    </div>
  );
}


export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <FilterProvider>
            <DashboardClientLayout>{children}</DashboardClientLayout>
        </FilterProvider>
    )
}
