# Next.js App Router: Routing Patterns

This document provides detailed examples of file-based routing, dynamic routes, and route groups in the Next.js App Router.

## File-based Routing

The App Router uses a file-system based router where folders are used to define routes. A special `page.js` or `page.tsx` file is used to make a route segment publicly accessible.

### Basic Routing

- `app/page.tsx` -> `/`
- `app/dashboard/page.tsx` -> `/dashboard`
- `app/dashboard/settings/page.tsx` -> `/dashboard/settings`

**Example `app/dashboard/page.tsx`:**
```tsx
export default function DashboardPage() {
  return <h1>Dashboard</h1>;
}
```

## Dynamic Routes

To create a dynamic route, wrap a folder's name in square brackets: `[folderName]`.

### Dynamic Segments

- `app/blog/[slug]/page.tsx` -> `/blog/:slug` (e.g., `/blog/hello-world`)

The `params` prop in the page component contains the dynamic route parameters.

**Example `app/blog/[slug]/page.tsx`:**
```tsx
export default function Page({ params }: { params: { slug: string } }) {
  return <div>My Post: {params.slug}</div>
}
```

### Catch-all Segments

A catch-all segment, `[...folderName]`, will match any number of subsequent segments.

- `app/shop/[...slug]/page.tsx` -> `/shop/*` (e.g., `/shop/clothes/tops`)

**Example `app/shop/[...slug]/page.tsx`:**
```tsx
export default function Page({ params }: { params: { slug: string[] } }) {
  return <div>Shop segments: {params.slug.join('/')}</div>
}
```

### Optional Catch-all Segments

An optional catch-all segment, `[[...folderName]]`, will match zero or more subsequent segments.

- `app/docs/[[...slug]]/page.tsx` -> `/docs/*` (e.g., `/docs` or `/docs/getting-started/installation`)

**Example `app/docs/[[...slug]]/page.tsx`:**
```tsx
export default function Page({ params }: { params: { slug?: string[] } }) {
  if (!params.slug) {
    return <div>Docs Home</div>
  }
  return <div>Doc path: {params.slug.join('/')}</div>
}
```

## Route Groups

To organize routes without affecting the URL path, you can create a route group by wrapping a folder's name in parenthesis: `(folderName)`.

This is useful for:
- Organizing your project.
- Creating different layouts for different sections of your app.

**Example File Structure:**
```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx
│   └── layout.tsx  // Layout for marketing pages
└── (shop)/
    ├── products/
    │   └── page.tsx
    └── layout.tsx  // Layout for shop pages
```

In this example:
- `app/(marketing)/about/page.tsx` maps to `/about`.
- `app/(shop)/products/page.tsx` maps to `/products`.

Each group can have its own layout file (`layout.tsx`) that applies only to the routes within that group.
