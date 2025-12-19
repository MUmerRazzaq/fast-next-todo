"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@/components/layout/user-button";
import { NotificationPrompt } from "@/components/layout/notification-prompt";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { HelpCircle, Menu, X } from "lucide-react";
import { KeyboardShortcutsDialog } from "@/components/layout/keyboard-shortcuts-dialog";

// This is a client component, so metadata should be handled in a parent layout
// or we can remove it if not needed at this level. For now, we comment it out
// as it can cause issues in "use client" files in some Next.js versions.
// export const metadata: Metadata = {
//   title: "Dashboard",
// };

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onCollapse={handleCollapse}
        className="hidden lg:flex"
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
          <Sidebar
            isCollapsed={false}
            onCollapse={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-y-0 left-0 z-50 w-64"
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

