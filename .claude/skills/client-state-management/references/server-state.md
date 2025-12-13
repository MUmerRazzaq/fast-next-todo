# Server State: React Query & SWR

## React Query Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

// Wrap app
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## Basic Query

```typescript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // conditional fetching
  select: (data) => data.name // transform response
})
```

## Mutation with Cache Update

```typescript
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: (newUser) => {
    // Option 1: Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['users'] })

    // Option 2: Update cache directly
    queryClient.setQueryData(['users'], (old) => [...old, newUser])
  }
})
```

## Optimistic Update (Full Pattern)

```typescript
useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // 1. Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 2. Snapshot previous value
    const previous = queryClient.getQueryData(['todos'])

    // 3. Optimistically update
    queryClient.setQueryData(['todos'], (old) =>
      old.map(t => t.id === newTodo.id ? newTodo : t)
    )

    // 4. Return rollback context
    return { previous }
  },
  onError: (err, variables, context) => {
    // 5. Rollback on error
    queryClient.setQueryData(['todos'], context.previous)
  },
  onSettled: () => {
    // 6. Always refetch after
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }
})
```

## Infinite Query (Pagination)

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: 0
})

// Access all pages
const allPosts = data?.pages.flatMap(page => page.posts) ?? []
```

## Prefetching

```typescript
// Prefetch on hover
const prefetchUser = () => {
  queryClient.prefetchQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000
  })
}

<Link onMouseEnter={prefetchUser}>View User</Link>
```

---

## SWR Setup

```typescript
import useSWR, { SWRConfig } from 'swr'

const fetcher = (url) => fetch(url).then(res => res.json())

// Global config
<SWRConfig value={{ fetcher, revalidateOnFocus: false }}>
  <App />
</SWRConfig>
```

## Basic SWR

```typescript
const { data, error, isLoading, mutate } = useSWR('/api/user', fetcher)

// Conditional fetching
const { data } = useSWR(userId ? `/api/user/${userId}` : null, fetcher)
```

## SWR Mutation

```typescript
import useSWRMutation from 'swr/mutation'

async function updateUser(url, { arg }) {
  return fetch(url, { method: 'POST', body: JSON.stringify(arg) })
}

const { trigger, isMutating } = useSWRMutation('/api/user', updateUser)

// Usage
await trigger({ name: 'New Name' })
```

## SWR Optimistic Update

```typescript
const { mutate } = useSWR('/api/todos', fetcher)

mutate(
  updateTodo(newTodo),
  {
    optimisticData: (current) => [...current, newTodo],
    rollbackOnError: true,
    revalidate: false // skip refetch if API returns updated data
  }
)
```

## SWR vs React Query Quick Comparison

| Feature | React Query | SWR |
|---------|-------------|-----|
| Bundle size | ~13kb | ~4kb |
| DevTools | Built-in | Community |
| Infinite queries | Built-in | useSWRInfinite |
| Mutations | useMutation | useSWRMutation |
| Offline support | Built-in | Manual |
| Garbage collection | Configurable | Manual |

**Choose React Query** for: Complex mutations, offline-first, enterprise apps
**Choose SWR** for: Simpler needs, smaller bundle, Vercel/Next.js projects
