# Next.js App Router: UI Patterns

This document covers common UI patterns in the Next.js App Router, including layouts, loading UI, and error handling.

## Layouts

A layout is UI that is shared between multiple pages. On navigation, layouts preserve state, remain interactive, and do not re-render.

### Root Layout

The root layout is defined at the top level of the `app` directory and applies to all routes. This layout is required and must contain `<html>` and `<body>` tags.

**Example `app/layout.tsx`:**
```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### Nested Layouts

Layouts can be nested. A layout in a sub-directory will be nested inside the layout of its parent directory.

**Example `app/dashboard/layout.tsx`:**
```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {/* Include shared UI here, e.g. a dashboard sidebar */}
      <nav>Dashboard Nav</nav>
      {children}
    </section>
  )
}
```
The page at `app/dashboard/settings/page.tsx` would be wrapped by both the root layout and this dashboard layout.

## Loading UI

The special file `loading.js` or `loading.tsx` allows you to create meaningful Loading UI that is automatically shown while the content of a route segment loads.

- It's automatically wrapped in a React Suspense boundary.
- It's rendered on the server.
- It's shown immediately on navigation.

**Example `app/dashboard/loading.tsx`:**
```tsx
export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return <div>Loading dashboard...</div>
}
```
This loading UI will apply to `app/dashboard/page.tsx` and any pages nested under it.

## Error Handling

The `error.js` or `error.tsx` file convention allows you to gracefully handle unexpected runtime errors in nested routes.

- It must be a Client Component (`'use client'`).
- It receives two props: `error` (an `Error` object) and `reset` (a function to re-render the segment).

**Example `app/dashboard/error.tsx`:**
```tsx
'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong in the dashboard!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  )
}
```

## Parallel Routes

Parallel Routes allow you to simultaneously or conditionally render one or more pages within the same layout. They are created using named "slots". Slots are defined with the `@folder` naming convention.

**Example Layout with Slots:**
```tsx
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <>
      {children}
      {team}
      {analytics}
    </>
  )
}
```

**File Structure for Slots:**
```
app/
├── @analytics/
│   └── page.tsx
├── @team/
│   └── page.tsx
├── layout.tsx
└── page.tsx
```
Both `@analytics/page.tsx` and `@team/page.tsx` will be rendered within the root layout.

## Intercepting Routes

Intercepting Routes allows you to load a route from another part of your application within the current layout. This is useful for showing a "modal" experience.

To intercept a route, you use the `(..)` convention, which is similar to the relative path convention `../`.
- `(.)` to match segments on the same level.
- `(..)` to match segments one level above.
- `(..)(..)` to match segments two levels above.
- `(...)` to match segments from the root `app` directory.

**Example: Photo Modal**

Imagine a photo feed at `/feed` and individual photo pages at `/photo/[id]`. When a user clicks a photo in the feed, you want to show the photo in a modal, intercepting the navigation to `/photo/[id]`.

**File Structure:**
```
app/
├── feed/
│   ├── (..)(..)photo/
│   │   └── [id]/
│   │       └── page.tsx  // The modal UI
│   └── page.tsx          // The feed
└── photo/
    └── [id]/
        └── page.tsx      // The actual photo page
```

When the user navigates from `/feed` to `/photo/123`, the modal at `app/feed/(..)(..)photo/[id]/page.tsx` will be displayed over the feed. A direct navigation to `/photo/123` will render the full page at `app/photo/[id]/page.tsx`.
