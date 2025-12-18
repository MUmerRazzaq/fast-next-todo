import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
          Fast Next Todo
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground sm:text-xl">
          Intelligent multi-user task management. Stay organized, track your
          progress, and get things done.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/auth/sign-up"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Get Started
        </Link>
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-base font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Sign In
        </Link>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Task Management
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, organize, and complete tasks with priorities, tags, and due
            dates.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Secure & Private
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your data is private. Each user&apos;s tasks are completely isolated and
            secure.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Smart Reminders
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get browser notifications before tasks are due. Never miss a
            deadline.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Fast Next Todo. All rights reserved.</p>
      </footer>
    </main>
  );
}
