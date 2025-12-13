"use client";

import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4">
      <Link href="/" className="font-bold">
        MyApp
      </Link>
      <div className="flex items-center gap-4">
        <SignedOut>
          <Link href="/auth/sign-in" className="text-sm font-medium hover:underline">
            Sign In
          </Link>
          <Link href="/auth/sign-up" className="text-sm font-medium hover:underline">
            Sign Up
          </Link>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
