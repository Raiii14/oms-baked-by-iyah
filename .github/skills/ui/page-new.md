---
description: Create a new page for this Vite + React Router v6 project
model: claude-sonnet-4-6
---

Generate a new React page for this project (Vite + React Router v6 + React 18 + TypeScript + Tailwind CSS + Supabase).

## Page Specification

$ARGUMENTS

## Project Stack (NOT Next.js)

- **Vite** (build tool, no SSR)
- **React Router v6** (client-side routing via `<Routes>` in `App.tsx`)
- **React 18** (all components are client-side)
- **TypeScript** with strict mode
- **Tailwind CSS** (utility-first styling)
- **Supabase** (auth + database via `services/db.ts`)
- **Lucide React** (icons)

## File Structure

```
pages/
  NewPage.tsx        # Add route in App.tsx
```

Register in `App.tsx`:
```tsx
<Route path="/new-page" element={<NewPage />} />
```

## Page Component Pattern

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { db } from '../services/db';

const NewPage: React.FC = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [data, setData] = useState<DataType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await db.getSomeData();
        if (!cancelled) setData(result);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (isLoading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* content */}
    </div>
  );
};

export default NewPage;
```

## Auth Guard Pattern

```typescript
// Redirect unauthenticated users
useEffect(() => {
  if (!isLoading && !user) navigate('/auth');
}, [user, isLoading, navigate]);

// Role check
if (user?.role !== UserRole.ADMIN) navigate('/');
```

## Navigation

```typescript
// Programmatic
const navigate = useNavigate();
navigate('/menu');

// Declarative
<Link to="/menu">Menu</Link>
```

## Tailwind Conventions (project patterns)

```tsx
// Page wrapper
<div className="space-y-8">

// Card
<div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">

// Section heading
<h2 className="text-3xl font-bold text-stone-800">

// Primary button
<button className="px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors">

// Loading skeleton
<div className="animate-pulse bg-stone-100 rounded-xl h-48">
```

## What to Generate

1. **Page Component** - `pages/NewPage.tsx` with TypeScript
2. **Route registration** - snippet for `App.tsx`
3. **TypeScript types** - any new shapes (or import from `types.ts`)
4. **Loading and empty states** - inline in the component
5. **Mobile-first responsive layout** - Tailwind breakpoints (`sm:`, `md:`, `lg:`)

## Best Practices

- All components are client-side (no SSR, no `'use client'` directive)
- Use `useStore()` for shared state, local `useState` for UI-only state
- Always use a `cancelled` flag in `useEffect` data fetches to prevent race conditions
- Keep pages under ~200 lines; extract large sections to `components/`
- `useMemo` for expensive list filtering; `useCallback` for handlers passed to children
- Import types from `types.ts`  never use `any`
