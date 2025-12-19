"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ListTodo,
  Tags,
  Settings,
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: () => void;
  className?: string;
}

const navItems = [
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/tags", label: "Tags", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isCollapsed, onCollapse, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex h-full w-64 flex-col border-r bg-background transition-all duration-300 ease-in-out",
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

      {/* Navigation */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === "/tasks" && pathname === "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                isActive && "bg-accent text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isCollapsed && "w-0"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
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
