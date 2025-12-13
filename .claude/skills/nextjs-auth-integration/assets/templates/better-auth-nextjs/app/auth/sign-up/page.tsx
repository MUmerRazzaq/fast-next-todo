"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

// This is a basic sign-up form.
// For a real application, you would likely use a form library and UI components
// from a library like shadcn/ui.

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(searchParams.get("error"));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/sign-up/email", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // On success, the user is signed up. You might want to redirect them
      // to a "please verify your email" page or directly to the dashboard
      // if email verification is not required.
      window.location.href = "/dashboard";
    } else {
      const data = await response.json();
      setError(data.message || "An unknown error occurred.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-sm">
        <h1 className="text-center text-2xl font-bold">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full justify-center rounded-md bg-primary py-2 text-primary-foreground"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
