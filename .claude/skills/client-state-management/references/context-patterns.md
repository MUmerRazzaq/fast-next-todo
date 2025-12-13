# Context API Patterns

## Basic Setup

```typescript
import { createContext, useContext, useState, ReactNode } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

## Split Context (Performance Optimization)

Separate state and dispatch to prevent unnecessary re-renders:

```typescript
const StateContext = createContext<State | undefined>(undefined)
const DispatchContext = createContext<Dispatch | undefined>(undefined)

function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

// Components reading state re-render on state change
const useAppState = () => useContext(StateContext)

// Components only dispatching never re-render from state changes
const useAppDispatch = () => useContext(DispatchContext)
```

## Context with Reducer

```typescript
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET'; payload: number }

interface State { count: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT': return { count: state.count + 1 }
    case 'DECREMENT': return { count: state.count - 1 }
    case 'SET': return { count: action.payload }
    default: return state
  }
}

function CounterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 })
  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  )
}
```

## Memoize Provider Value

Prevent re-renders when provider's parent re-renders:

```typescript
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Memoize to maintain reference stability
  const value = useMemo(() => ({
    user,
    login: (u: User) => setUser(u),
    logout: () => setUser(null)
  }), [user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

## Compound Context Pattern

For complex state with multiple related values:

```typescript
interface CartContextType {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items]
  )

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({ items, total, addItem, removeItem, clearCart }),
    [items, total, addItem, removeItem, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
```

## When NOT to Use Context

- High-frequency updates (use Zustand/Jotai instead)
- Large data that changes often
- State needed in deeply nested components with many intermediate re-renders

Context is best for:
- Low-frequency updates (theme, locale, auth)
- Data that most components need
- Avoiding prop drilling for widely-used state
