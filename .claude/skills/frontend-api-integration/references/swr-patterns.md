# SWR Patterns

## Table of Contents
- [Global Configuration](#global-configuration)
- [Custom Hooks](#custom-hooks)
- [Mutations](#mutations)
- [Optimistic Updates](#optimistic-updates)
- [Conditional Fetching](#conditional-fetching)

## Global Configuration

```typescript
// app/providers.tsx
import { SWRConfig } from 'swr';

const swrConfig = {
  fetcher: (url: string) => api.get(url).then(r => r.data),
  revalidateOnFocus: false,
  dedupingInterval: 2000,
  errorRetryCount: 2,
  onError: (error: Error) => {
    console.error('SWR Error:', error);
  }
};

<SWRConfig value={swrConfig}>
  <App />
</SWRConfig>
```

## Custom Hooks

### Generic useGet

```typescript
function useGet<T>(url: string | null, options?: SWRConfiguration<T>) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, options);

  return {
    data,
    error,
    isLoading,
    mutate,
    isEmpty: data && Array.isArray(data) && data.length === 0
  };
}

// Usage
const { data: user, isLoading } = useGet<User>(`/users/${id}`);
```

### With error typing

```typescript
function useApi<T>(key: string | null) {
  return useSWR<T, ApiError>(key, {
    onError: (error) => toast.error(error.message)
  });
}
```

## Mutations

### Using useSWRMutation

```typescript
import useSWRMutation from 'swr/mutation';

function useCreateUser() {
  return useSWRMutation(
    '/users',
    (url, { arg }: { arg: CreateUserDTO }) =>
      api.post<User>(url, arg).then(r => r.data)
  );
}

// Usage
const { trigger, isMutating } = useCreateUser();
await trigger({ name: 'John', email: 'john@example.com' });
```

### Manual mutation with global mutate

```typescript
import { useSWRConfig } from 'swr';

function useDeleteUser() {
  const { mutate } = useSWRConfig();

  return async (id: string) => {
    await api.delete(`/users/${id}`);
    // Revalidate users list
    mutate('/users');
    // Or update cache directly
    mutate('/users', (users: User[] | undefined) =>
      users?.filter(u => u.id !== id)
    );
  };
}
```

## Optimistic Updates

```typescript
function useUpdateUser() {
  const { mutate } = useSWRConfig();

  return async (id: string, updates: Partial<User>) => {
    mutate(
      `/users/${id}`,
      api.patch<User>(`/users/${id}`, updates).then(r => r.data),
      {
        optimisticData: (current: User) => ({ ...current, ...updates }),
        rollbackOnError: true,
        revalidate: false
      }
    );
  };
}
```

### With populateCache

```typescript
useSWRMutation('/todos', updateTodo, {
  populateCache: (updated, todos: Todo[]) =>
    todos.map(t => t.id === updated.id ? updated : t),
  revalidate: false
});
```

## Conditional Fetching

```typescript
// Fetch only when id exists
const { data } = useSWR(id ? `/users/${id}` : null);

// Fetch based on condition
const { data } = useSWR(() => isLoggedIn ? '/profile' : null);
```

## Loading States

```typescript
function UserProfile({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR<User>(`/users/${id}`);

  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;
  if (!data) return null;

  return <Profile user={data} />;
}
```

## Prefetching

```typescript
import { preload } from 'swr';

// Preload on hover
<Link
  href={`/users/${id}`}
  onMouseEnter={() => preload(`/users/${id}`, fetcher)}
>
  View User
</Link>
```
