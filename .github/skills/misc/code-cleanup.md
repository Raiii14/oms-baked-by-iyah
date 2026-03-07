---
description: "Use when: refactoring code for better readability, maintainability, and to follow best practices. Apply code smells fixes, modern patterns, and cleanup techniques. Tailored for this Vite + React 18 + TypeScript + Tailwind + Supabase project."
model: claude-sonnet-4-6
---

Refactor and clean up code to improve readability, maintainability, and follow best practices for this project.

## Code to Clean Up

$ARGUMENTS

## Project Stack Context

- **React 18** (client-side only, no SSR, no Server Components)
- **TypeScript** strict mode  types live in `types.ts`
- **Tailwind CSS**  no CSS-in-JS, no CSS Modules
- **Supabase**  data access only via `services/db.ts`
- **React Router v6**  `useNavigate`, `Link`, `useParams`
- **StoreContext**  global state via `useStore()` hook

## Code Smells to Fix

### Naming
- Use descriptive variable/function names
- Consistent conventions: `camelCase` (variables/functions), `PascalCase` (components/types), `UPPER_SNAKE_CASE` (constants)
- Boolean names start with `is/has/can/should`
- Avoid abbreviations unless obvious (`err` ok, `u` not ok)

### Functions
- Single responsibility per function
- Keep functions small (<50 lines)
- Max 3-4 parameters  group related params into an object
- Extract complex logic into named helper functions
- Avoid side effects; prefer pure functions

### DRY (Don't Repeat Yourself)
- Extract repeated patterns to reusable components in `components/`
- Extract repeated logic to custom hooks (`hooks/useXxx.ts`)
- Centralize constants in `constants.ts`
- Use TypeScript generics for type reuse

### Complexity
- Reduce nested `if` statements (max depth 2-3)
- Use early returns to reduce nesting
- Replace long if/else chains with lookup objects (dictionaries)
- Simplify boolean logic

### Type Safety (TypeScript)
- Remove all `any` types  use `unknown` with type narrowing if needed
- Import types from `../types` or `../../types`
- Use utility types: `Pick`, `Omit`, `Partial`, `Record`, `Required`
- Use discriminated unions for variant types (e.g. `type Shape = Square | Circle`)
- Avoid `as` type assertions  narrow types properly instead

## Modern Patterns to Apply

### JavaScript/TypeScript

```typescript
// Optional chaining
const value = obj?.prop?.nested

// Nullish coalescing (prefer over || for falsy-safe defaults)
const result = value ?? defaultValue

// Destructuring
const { name, email } = user
const [first, ...rest] = array

// Array methods (avoid imperative for loops)
const filtered = arr.filter(x => x.active).map(x => x.id)
const found = arr.find(x => x.id === id)
const mapped = arr.reduce<Record<string, Item>>((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

// Discriminated union narrowing (TypeScript)
function area(shape: Shape) {
  switch (shape.kind) {
    case 'square': return shape.size ** 2;
    case 'circle': return Math.PI * shape.radius ** 2;
  }
}
```

### React 18 Patterns

```typescript
// Extract custom hooks for reusable logic
const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    let cancelled = false;
    db.getProducts().then(data => { if (!cancelled) setProducts(data); });
    return () => { cancelled = true; };  // always clean up
  }, []);
  return products;
};

// useCallback for handlers passed to children (prevents re-renders)
const handleDelete = useCallback((id: string) => {
  deleteProduct(id);
}, [deleteProduct]);

// useMemo for expensive derived values
const filteredProducts = useMemo(
  () => products.filter(p => p.category === activeCategory),
  [products, activeCategory]
);

// React.memo for components that render often with same props
const ProductCard = React.memo(({ product, onAdd }: Props) => (
  // ...
));
```

### StoreContext Pattern

```typescript
// Always consume via useStore()  never access context directly
const { user, products, addToCart, addNotification } = useStore();

// Memoize context value to prevent all consumers re-rendering on every state change
const contextValue = useMemo(() => ({
  user, products, addToCart, /* ... */
}), [user, products, addToCart]);
```

## Refactoring Techniques

### Extract Function
Break large functions into smaller, focused ones  especially in `db.ts` and `StoreContext.tsx`.

### Replace Conditional with Lookup Object

```typescript
// Before
if (status === 'pending') return 'bg-yellow-100'
if (status === 'confirmed') return 'bg-green-100'
if (status === 'cancelled') return 'bg-red-100'

// After
const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   'bg-yellow-100',
  confirmed: 'bg-green-100',
  cancelled: 'bg-red-100',
}
return STATUS_COLORS[status] ?? 'bg-stone-100'
```

### Introduce Parameter Object

```typescript
// Before
function placeOrder(method, delivery, date, time, proof, address) {}

// After
interface OrderDetails {
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  scheduledDate: string;
  scheduledTime: string;
  paymentProof?: File | null;
  deliveryAddress?: string;
}
function placeOrder(details: OrderDetails) {}
```

## Common Cleanup Tasks

### Remove Dead Code
- Unused imports (check with TypeScript errors or ESLint)
- Unreachable code (after `return`, `throw`)
- Commented-out code blocks
- Unused `useState` variables

### Fix useEffect Patterns

```typescript
// Always add cleanup to prevent memory leaks / stale state
useEffect(() => {
  let cancelled = false;
  loadData().then(data => {
    if (!cancelled) setData(data);
  });
  return () => { cancelled = true; };
}, [dependency]);

// Unsubscribe Supabase realtime on unmount
useEffect(() => {
  const channel = supabase.channel('...').on(...).subscribe();
  return () => { supabase.removeChannel(channel); };
}, []);
```

### Error Handling

```typescript
// Before
try {
  doSomething()
} catch (e) {
  console.log(e)  // swallowed silently
}

// After
try {
  await doSomething();
} catch (error) {
  console.error('[context] failed:', error);
  addNotification('Something went wrong. Please try again.', 'error');
  // Re-throw if caller needs to handle it
}
```

## Tailwind Cleanup

- Extract repeated class combinations into component variables:
  ```typescript
  const btnPrimary = 'px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors';
  ```
- Keep Tailwind classes sorted: layout  spacing  color  typography  interaction
- Avoid inline `style={{}}`  use Tailwind utilities instead
- Use `clsx` or template literals for conditional classes

## Output Format

For each change:
1. Show **before** and **after** code
2. Name the pattern applied
3. Note any TypeScript type improvements
