# Zustand Patterns

## Basic Store Setup

```typescript
import { create } from 'zustand'

interface CounterStore {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}))
```

## Middleware Composition

```typescript
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useStore = create<Store>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          // state and actions
        }))
      ),
      { name: 'store-key' }
    ),
    { name: 'MyStore' }
  )
)
```

## Selectors with Shallow Comparison

```typescript
import { shallow } from 'zustand/shallow'

// Single value - no shallow needed
const count = useStore((s) => s.count)

// Multiple values - use shallow to prevent re-renders when references change
const { name, email } = useStore(
  (s) => ({ name: s.name, email: s.email }),
  shallow
)

// Array selection
const [bears, fish] = useStore((s) => [s.bears, s.fish], shallow)
```

## Computed/Derived State

```typescript
const useStore = create<Store>((set, get) => ({
  items: [],
  // Computed via getter
  get totalPrice() {
    return get().items.reduce((sum, item) => sum + item.price, 0)
  },
  // Or as derived selector outside store
}))

// Prefer external selectors for complex computations
const selectTotalPrice = (state: Store) =>
  state.items.reduce((sum, item) => sum + item.price, 0)
```

## Async Actions

```typescript
const useStore = create<Store>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null })
    try {
      const users = await api.getUsers()
      set({ users, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  }
}))
```

## Slices Pattern (Large Stores)

```typescript
interface UserSlice {
  user: User | null
  setUser: (user: User) => void
}

interface CartSlice {
  items: CartItem[]
  addItem: (item: CartItem) => void
}

const createUserSlice: StateCreator<UserSlice & CartSlice, [], [], UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user })
})

const createCartSlice: StateCreator<UserSlice & CartSlice, [], [], CartSlice> = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] }))
})

const useStore = create<UserSlice & CartSlice>()((...a) => ({
  ...createUserSlice(...a),
  ...createCartSlice(...a)
}))
```

## Subscribe to Changes

```typescript
// Outside React
const unsub = useStore.subscribe(
  (state) => state.count,
  (count, prevCount) => console.log('count changed', prevCount, '->', count)
)

// With subscribeWithSelector middleware
useStore.subscribe(
  (state) => state.count,
  (count) => console.log('new count:', count),
  { fireImmediately: true }
)
```

## Reset Store

```typescript
const initialState = { count: 0, name: '' }

const useStore = create<Store>((set) => ({
  ...initialState,
  increment: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set(initialState)
}))
```

## Persist Options

```typescript
persist(
  (set) => ({ /* state */ }),
  {
    name: 'storage-key',
    storage: createJSONStorage(() => sessionStorage), // default: localStorage
    partialize: (state) => ({ user: state.user }), // only persist specific keys
    version: 1,
    migrate: (persisted, version) => {
      // migration logic between versions
      return persisted as Store
    },
    skipHydration: true // manual hydration control
  }
)
```
