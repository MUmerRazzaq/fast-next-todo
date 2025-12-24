import type { Metadata } from "next";
import Link from "next/link";
import { ListTodo } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-center border-b px-4">
        <Link href={"/" as const} className="flex items-center gap-2">
          <ListTodo className="h-6 w-6 text-primary" />
          <span className="font-semibold text-foreground">Fast Next Todo</span>
        </Link>
      </header>

      {/* Main Content - Centered */}
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="flex h-14 shrink-0 items-center justify-center border-t px-4">
        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </footer>
    </div>
  );
}
