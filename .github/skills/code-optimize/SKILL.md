---
name: code-optimize
description: Analyze and optimize code for performance, memory, and efficiency in this Vite + React 18 + Supabase project
model: claude-sonnet-4-6
---

Optimize the following code for performance and efficiency.

## Code to Optimize

$ARGUMENTS

## Project Stack Context

- **React 18** + Vite (client-side SPA, no SSR)
- **Supabase** for all data access via `services/db.ts`
- **React Context** (`StoreContext`) for global state
- **Tailwind CSS** for styling
- **React Router v6** for navigation

## Optimization Priority (highest impact first)

1. Prevent unnecessary React re-renders
2. Optimize Supabase queries (select only needed columns, paginate)
3. Fix useEffect memory leaks
4. Code splitting / lazy loading routes
5. Bundle size (only if measurable)

---

## 1. React Re-render Optimization

### useMemo  cache expensive derived values

```typescript
// Avoid: recalculates on every render
const filtered = products.filter(p => p.category === active);

// Better: only recalculates when deps change
const filtered = useMemo(
  () => products.filter(p => p.category === active),
  [products, active]
);
```

### useCallback  stable function references for children

```typescript
// Avoid: new function on every render -> child always re-renders
<ProductCard onAdd={() => addToCart(product)} />

// Better: stable reference
const handleAdd = useCallback(() => {
  addToCart(product);
}, [addToCart, product]);
<ProductCard onAdd={handleAdd} />
```

### React.memo  skip re-render if props unchanged

```typescript
// Wrap components that render often with the same props
const ProductCard = React.memo(({ product, onAdd }: Props) => {
  return (/* ... */);
});

// memo is only effective if all props are stable references
// (use useMemo/useCallback for objects and functions passed as props)
```

### Memoize Context value  critical for StoreContext

From React docs: every context consumer re-renders when the context value
reference changes. StoreProvider re-renders often, so always memoize:

```typescript
// In StoreContext.tsx
const contextValue = useMemo(() => ({
  user, products, cart, orders,
  addToCart, removeFromCart, login, logout, /* all methods */
}), [user, products, cart, orders, addToCart, removeFromCart, login, logout]);

return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
```

### Move static values outside components

```typescript
// Avoid: recreated on every render
const MyComponent = () => {
  const OPTIONS = ['small', 'medium', 'large']; // recreated every render
  // ...
};

// Better: defined once at module level
const OPTIONS = ['small', 'medium', 'large'] as const;
const MyComponent = () => { /* ... */ };
```

---

## 2. Supabase Query Optimization

From Supabase docs: always select only needed columns (avoid `select('*')`
on large tables), and use `range()` for pagination.

```typescript
// Avoid: fetches all columns from potentially large table
const { data } = await supabase.from('orders').select('*');

// Better: only fetch what you need
const { data } = await supabase
  .from('orders')
  .select('id, status, total, created_at, user_id')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .range(0, 19); // paginate: first 20 rows

// For related data, use joins instead of separate queries (avoid N+1)
const { data } = await supabase
  .from('orders')
  .select('id, status, order_items(product_id, quantity, price)')
  .eq('user_id', user.id);
```

### Authentication  use getUser() for server-verified identity

```typescript
// Secure (verifies JWT with server)
const { data: { user } } = await supabase.auth.getUser();

// Avoid for security-sensitive ops (reads from storage, can be stale)
const { data: { session } } = await supabase.auth.getSession();
```

---

## 3. useEffect Memory Leak Fixes

```typescript
// Pattern 1: cancel async ops on unmount
useEffect(() => {
  let cancelled = false;
  db.getProducts().then(data => {
    if (!cancelled) setProducts(data);
  });
  return () => { cancelled = true; };
}, []);

// Pattern 2: unsubscribe Supabase realtime
useEffect(() => {
  if (!user) return;
  const unsubscribe = db.subscribeToNotifications(user.id, handler);
  return unsubscribe; // cleanup on unmount
}, [user?.id]);

// Pattern 3: clear timers
useEffect(() => {
  const id = setTimeout(() => setVisible(false), 3000);
  return () => clearTimeout(id);
}, []);
```

---

## 4. Code Splitting  Lazy Load Routes

Since this is a Vite SPA with multiple pages, split the bundle by route so
users don't download all page code upfront.

```typescript
// In App.tsx  lazy load page components
import React, { lazy, Suspense } from 'react';

const Home        = lazy(() => import('./pages/Home'));
const Menu        = lazy(() => import('./pages/Menu'));
const AdminDash   = lazy(() => import('./pages/AdminDashboard'));
const Checkout    = lazy(() => import('./pages/Checkout'));

// Wrap routes with Suspense
<Suspense fallback={<div className="text-center py-12">Loading...</div>}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/menu" element={<Menu />} />
    {/* ... */}
  </Routes>
</Suspense>
```

---

## 5. Bundle Size

```typescript
// Use named imports (tree-shakeable)
import { ArrowRight, ShoppingCart } from 'lucide-react'; // good

// Avoid importing entire libraries when only one util is needed
import _ from 'lodash'; // bad - 70KB
import debounce from 'lodash/debounce'; // better - only what you need
```

---

## Optimization Checklist

**React**
- [ ] Context value wrapped in `useMemo`
- [ ] Event handlers in `useCallback` when passed to children
- [ ] Expensive derived values in `useMemo`
- [ ] Frequently-rendered children wrapped in `React.memo`
- [ ] Static values/arrays/objects defined outside component
- [ ] `useEffect` cleanup returns (cancel flag or unsubscribe)
- [ ] Routes lazy loaded with `React.lazy()` + `<Suspense>`

**Supabase**
- [ ] `.select('col1, col2')` instead of `.select('*')` on large tables
- [ ] `.range()` for paginated lists
- [ ] Joined queries instead of separate sequential queries (N+1)
- [ ] `getUser()` used (not `getSession()`) for auth checks

**General**
- [ ] No `var`  use `const`/`let`
- [ ] `Map`/`Set` for O(1) lookups instead of `Array.find` in hot paths
- [ ] Debounce search/filter inputs (`setTimeout` + cleanup)
- [ ] Images have explicit `width`/`height` to prevent layout shift

## Measurement

Profile before and after in Chrome DevTools:
- **React DevTools Profiler**  identify which components re-render unnecessarily
- **Performance tab**  measure main thread blocking time
- **Network tab**  check bundle sizes and waterfall
- **Lighthouse**  overall score (Performance, Accessibility, Best Practices)

Focus on **measurable, user-visible improvements**. Do not over-optimize  premature micro-optimization reduces readability without benefit.
