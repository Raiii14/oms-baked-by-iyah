---
name: frontend-architect
description: Create accessible, performant user interfaces with focus on user experience and modern frameworks
---

Design and implement accessible, performant UI components and layouts for this Vite + React 18 + TypeScript + Tailwind CSS + Supabase project.

## UI Specification

$ARGUMENTS

## Project Stack (NOT Next.js)

- **React 18** — client-side SPA, no Server Components, no `'use client'` directive
- **TypeScript** strict mode — shared types live in `types.ts`
- **Tailwind CSS** — utility-first styling, **no** CSS Modules or CSS-in-JS
- **React Router v6** — `useNavigate`, `Link`, `useParams`
- **Lucide React** — icons only (no other icon libraries)
- **StoreContext** — global state via `useStore()` hook

---

## Project Color & Design Tokens

This project uses a **rose/stone palette** — always stay within it:

| Role | Tailwind Token |
|---|---|
| Primary action | `bg-rose-500 hover:bg-rose-600 text-rose-500` |
| Page background | `bg-stone-50` |
| Card surface | `bg-white` |
| Border | `border-stone-100` / `border-stone-200` |
| Heading text | `text-stone-800` |
| Body / muted text | `text-stone-600` / `text-stone-500` |
| Danger | `bg-red-50 text-red-600 border-red-200` |
| Success | `bg-green-50 text-green-600` |

---

## Responsive Layout — Mobile-First

Tailwind is **mobile-first**: unprefixed utilities apply to all sizes; variants (`sm:`, `md:`, `lg:`) activate at that breakpoint and up.

```tsx
// Stack on mobile → side-by-side on md+
<div className="flex flex-col md:flex-row gap-4">

// Full-width on mobile → contained on larger screens
<div className="w-full md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6">

// Responsive product grid: 1 → 2 → 3 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive heading scale
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800">

// Sidebar hidden on mobile, visible on desktop
<aside className="hidden lg:block w-64 shrink-0">
```

---

## Project Layout Conventions

```tsx
// Page wrapper — consistent vertical rhythm
<div className="space-y-8">

// Card / panel
<div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">

// Section heading
<h2 className="text-3xl font-bold text-stone-800">

// Primary CTA button
<button className="px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors">

// Secondary / outlined button
<button className="px-6 py-2 border border-stone-200 text-stone-700 rounded-full hover:bg-stone-50 transition-colors">

// Horizontal-scroll table wrapper for mobile
<div className="overflow-x-auto rounded-2xl border border-stone-100">
  <table className="w-full text-sm text-stone-700">
    <thead className="bg-stone-50 text-left">
      <tr>...</tr>
    </thead>
  </table>
</div>

// Loading skeleton (matches project pattern)
<div className="animate-pulse bg-stone-100 rounded-xl h-48">
```

---

## Accessibility (WCAG 2.1 AA)

Every interactive element must be keyboard-operable and screen-reader friendly.

### 1. Semantic HTML First

Prefer semantic elements over generic `<div>` — reach for ARIA only when native semantics fall short.

```tsx
<nav aria-label="Main navigation">
<main>
<section aria-labelledby="orders-heading">
  <h2 id="orders-heading">Your Orders</h2>
</section>

// ✅ — native semantics
<button type="button">Add to cart</button>
<a href="/menu">Browse menu</a>

// ❌ — avoid divs pretending to be interactive
<div onClick={handleClick}>Add to cart</div>
```

### 2. Keyboard Focus — `focus-visible` Always

```tsx
// Keyboard-only focus ring (no ring on mouse click)
<button
  type="button"
  className="px-6 py-2 bg-rose-500 text-white rounded-full
             hover:bg-rose-600 transition-colors
             focus-visible:outline-2 focus-visible:outline-offset-2
             focus-visible:outline-rose-500">
  Place order
</button>

// Focusable card / list row
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(); }}
  className="cursor-pointer rounded-2xl border border-stone-100 p-4
             focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2">
```

### 3. Screen Reader Utilities

```tsx
// Visually hide text that still needs to be read aloud
<span className="sr-only">Remove item</span>

// Icon-only button always needs an accessible name
<button type="button" aria-label="Close modal">
  <X className="w-5 h-5" aria-hidden="true" />
</button>
```

---

## Supabase Auth — Protected Route Pattern

Any page that redirects unauthenticated users **must** wait for `isLoading` before redirecting. Supabase session restore is async — without this guard, logged-in users get bounced to `/login` on every refresh.

```tsx
const { user, isLoading } = useStore();
useEffect(() => {
  if (isLoading) return; // wait for session
  if (!user) navigate('/login');
}, [isLoading, user, navigate]);
```

## Multi-Step Form Pattern (e.g. Register → OTP)

Keep all steps in one component with a `step` state string. Avoids separate routes and keeps shared state (e.g. `email`) in scope.

```tsx
const [step, setStep] = useState<'form' | 'otp'>('form');

// On register success:
setStep('otp');

// OTP input best practices:
<input
  type="text"
  inputMode="numeric"
  maxLength={8}           // Supabase sends 6–8 digit codes
  autoComplete="one-time-code"
  autoFocus
  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
/>
<button disabled={isVerifying || otp.length < 6}>Verify</button>
```

## Resend Cooldown Pattern

No library needed — local state + `useEffect` tick:

```tsx
const [resendCooldown, setResendCooldown] = useState(0);

// After resend:
setResendCooldown(60);

useEffect(() => {
  if (resendCooldown <= 0) return;
  const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
  return () => clearTimeout(t);
}, [resendCooldown]);

// In JSX:
{resendCooldown > 0 ? (
  <span>Resend in {resendCooldown}s</span>
) : (
  <button onClick={handleResend}>Resend code</button>
)}

// Loading indicator — announced to screen readers
<div role="status" aria-live="polite">
  <span className="sr-only">Loading orders…</span>
  {/* spinner or skeleton */}
</div>

// Always pair <label> with its input via htmlFor / id
<label htmlFor="phone-input" className="text-sm font-medium text-stone-700">
  Phone number
</label>
<input
  id="phone-input"
  type="tel"
  aria-describedby="phone-hint"
  aria-invalid={!!phoneError}
  className="w-full border border-stone-200 rounded-lg px-3 py-2
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
/>
<p id="phone-hint" className="text-xs text-stone-500">e.g. 09171234567</p>
{phoneError && (
  <p role="alert" className="text-sm text-red-600">{phoneError}</p>
)}
```

### 4. ARIA for Dynamic Content

```tsx
// Status changes announced without stealing focus
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusMessage}
</div>

// Modal dialog
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <h2 id="modal-title" className="text-xl font-bold text-stone-800">
    Confirm Order
  </h2>
</div>

// ARIA state on toggle buttons
<button
  type="button"
  aria-pressed={isActive}
  aria-label={`Filter by ${category}`}
  className="px-4 py-1.5 rounded-full text-sm transition-colors
             aria-pressed:bg-rose-500 aria-pressed:text-white
             aria-[pressed=false]:bg-stone-100 aria-[pressed=false]:text-stone-600">
  {category}
</button>
```

---

## Component State Pattern

Every UI feature must gracefully handle all four states:

```tsx
// 1. Loading — use the matching skeleton from components/skeletons/
if (isLoading) return <MenuSkeleton />;

// 2. Error
if (error) return (
  <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
    {error}
  </div>
);

// 3. Empty
if (!items.length) return (
  <div className="text-center py-16 text-stone-400">
    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-40" aria-hidden="true" />
    <p className="text-lg font-medium">Your cart is empty</p>
    <p className="text-sm mt-1">Add something delicious from the <Link to="/menu" className="text-rose-500 hover:underline">menu</Link></p>
  </div>
);

// 4. Content
return <div className="space-y-4">{items.map(/* ... */)}</div>;
```

---

## Performance (Prevent Re-renders)

```typescript
// useMemo — cache derived lists/values
const filteredProducts = useMemo(
  () => products.filter(p => p.category === activeCategory),
  [products, activeCategory]
);

// useCallback — stable handlers for child components
const handleAddToCart = useCallback((product: Product) => {
  addToCart(product);
}, [addToCart]);

// React.memo — skip re-render when props are unchanged
const ProductCard = React.memo(({ product, onAdd }: Props) => (
  <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
    {/* ... */}
  </div>
));

// Lazy-load heavy sections so they don't bloat the initial bundle
const SalesChart = React.lazy(() => import('../components/SalesChart'));
```

---

## TypeScript Component Pattern

```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { Product } from '../types';  // always import from types.ts

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
  className?: string;
}

const ProductGrid: React.FC<Props> = ({ products, onAddToCart, className = '' }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const visible = useMemo(
    () => activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory),
    [products, activeCategory]
  );

  const handleAdd = useCallback((product: Product) => {
    onAddToCart(product);
  }, [onAddToCart]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* content */}
    </div>
  );
};

export default ProductGrid;
```

---

## What to Generate

1. **Component / layout file** — semantic, accessible, mobile-first
2. **TypeScript props interface** — strict typing, no `any`, extend from `types.ts`
3. **All four UI states** — loading (skeleton), error, empty, populated
4. **Responsive breakdown** — behavior at mobile / tablet / desktop
5. **Accessibility checklist** — keyboard navigation, ARIA, color contrast, tap targets

---

## Best Practices

- Semantic HTML before ARIA — only add roles/attributes when native elements can't express the meaning
- Every `<img>` needs a meaningful `alt`; decorative images use `alt=""`
- Color alone must never convey information — pair with text, icon, or pattern
- Minimum tap target: `min-h-[44px] min-w-[44px]` on mobile interactive elements
- Never remove the browser outline without a `focus-visible` replacement
- Keep components under ~200 lines; extract large sections into `components/`
- No `any` types — import shared shapes from `types.ts`
- Never use `as` type assertions — narrow types properly instead
