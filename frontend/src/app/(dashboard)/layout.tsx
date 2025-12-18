import type { Metadata } from "next";
import { UserButton } from "@/components/layout/user-button";
import { NotificationPrompt } from "@/components/layout/notification-prompt";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              Fast Next Todo
            </h1>
          </div>

          <nav className="flex items-center gap-4">
            <UserButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 pb-20 lg:pb-6">{children}</main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Notification Permission Prompt */}
      <NotificationPrompt />
    </div>
  );
}
