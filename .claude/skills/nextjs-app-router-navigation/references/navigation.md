# Next.js App Router: Navigation

This document covers the primary ways to navigate between routes in the Next.js App Router: the `<Link>` component, the `useRouter` hook, and the `redirect` function.

## `Link` Component

The `<Link>` component (`next/link`) is the primary way to navigate between routes in Next.js. It enables client-side navigation and prefetches routes in the background for faster page transitions.

### Basic Usage

```tsx
import Link from 'next/link'

export default function Page() {
  return <Link href="/dashboard">Dashboard</Link>
}
```

### Linking to Dynamic Segments

You can use template literals to construct the URL for dynamic segments.

```tsx
import Link from 'next/link'

function PostList({ posts }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  )
}
```

### Checking for Active Links

To style the active link, you can use the `usePathname` hook.

```tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function Navigation({ navLinks }) {
  const pathname = usePathname()

  return (
    <>
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href)

        return (
          <Link
            className={isActive ? 'text-blue-500' : 'text-black'}
            href={link.href}
            key={link.name}
          >
            {link.name}
          </Link>
        )
      })}
    </>
  )
}
```

## `useRouter` Hook

The `useRouter` hook (`next/navigation`) allows you to programmatically trigger navigation from Client Components.

### Usage

The hook provides methods like `push`, `replace`, `refresh`, `back`, and `forward`.

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function MyComponent() {
  const router = useRouter()

  return (
    <button type="button" onClick={() => router.push('/dashboard')}>
      Go to Dashboard
    </button>
  )
}
```

- `router.push(href)`: Navigates to the new URL and adds it to the browser's history stack.
- `router.replace(href)`: Navigates to the new URL without adding it to the history stack.
- `router.refresh()`: Refreshes the current route, re-fetching data and re-rendering Server Components.

## `redirect` Function

The `redirect` function (`next/navigation`) allows you to redirect the user to another URL from a Server Component or Server Action.

- When used, it throws a `NEXT_REDIRECT` error, so it should be called outside of `try/catch` blocks.
- It should be called after any data mutations if you want to redirect based on the result.

### Usage in a Server Component

```tsx
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'

export default async function Profile() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome, {user.name}</div>
}
```

### Usage in a Server Action

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  // ... logic to create a post
  const postId = await savePost(formData)

  revalidatePath('/posts') // Invalidate cache for the posts page
  redirect(`/posts/${postId}`) // Redirect to the new post's page
}
```
