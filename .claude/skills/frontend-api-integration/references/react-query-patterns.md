# React Query Patterns

## Table of Contents
- [Provider Setup](#provider-setup)
- [Custom Query Hooks](#custom-query-hooks)
- [Mutation Patterns](#mutation-patterns)
- [Optimistic Updates](#optimistic-updates)
- [Query Invalidation](#query-invalidation)

## Provider Setup

```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## Custom Query Hooks

### useGet - Generic GET hook

```typescript
function useGet<T>(key: string[], url: string, options?: UseQueryOptions<T>) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => api.get<T>(url).then(r => r.data),
    ...options
  });
}

// Usage
const { data, isLoading } = useGet<User>(['user', id], `/users/${id}`);
```

### usePost - Generic mutation hook

```typescript
function usePost<TData, TVariables>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (data) => api.post<TData>(url, data).then(r => r.data),
    ...options
  });
}

// Usage
const { mutate, isPending } = usePost<User, CreateUserDTO>('/users', {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
});
```

## Mutation Patterns

### With error handling

```typescript
const mutation = useMutation({
  mutationFn: userService.create,
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast.success('User created');
  },
  onError: (error) => {
    toast.error(parseError(error).message);
  }
});
```

### Dependent mutations

```typescript
const createWithProfile = useMutation({
  mutationFn: async (data: CreateUserWithProfile) => {
    const user = await userService.create(data.user);
    await profileService.create({ ...data.profile, userId: user.id });
    return user;
  }
});
```

## Optimistic Updates

```typescript
const updateTodo = useMutation({
  mutationFn: todoService.update,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    const previous = queryClient.getQueryData<Todo[]>(['todos']);

    queryClient.setQueryData<Todo[]>(['todos'], (old) =>
      old?.map(t => t.id === newTodo.id ? { ...t, ...newTodo } : t)
    );

    return { previous };
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  }
});
```

## Query Invalidation

```typescript
// Invalidate single query
queryClient.invalidateQueries({ queryKey: ['todos'] });

// Invalidate with prefix
queryClient.invalidateQueries({ queryKey: ['todos'], exact: false });

// Invalidate multiple
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'todos' || query.queryKey[0] === 'stats'
});

// Remove from cache entirely
queryClient.removeQueries({ queryKey: ['todos', deletedId] });
```

## Loading & Error Components

```typescript
function QueryWrapper<T>({
  query,
  children
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}) {
  if (query.isLoading) return <Spinner />;
  if (query.isError) return <ErrorMessage error={query.error} />;
  if (!query.data) return null;
  return <>{children(query.data)}</>;
}

// Usage
<QueryWrapper query={usersQuery}>
  {(users) => <UserList users={users} />}
</QueryWrapper>
```
