// skills/better-auth/assets/templates/better-auth-nextjs-template/app/page.tsx
import { SignedIn, SignedOut } from "@daveyplate/better-auth-ui";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <SignedIn>
        <p>Welcome! You are signed in.</p>
        <Link href="/dashboard">Go to Dashboard</Link>
      </SignedIn>
      <SignedOut>
        <p>You are not signed in.</p>
        <Link href="/signin">Sign In</Link>
      </SignedOut>
    </div>
  );
}
