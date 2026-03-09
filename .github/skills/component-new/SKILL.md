---
name: component-new
description: Create a new React component with TypeScript and modern best practices
---

Generate a new React component for this Vite + React Router v6 + React 18 project.

## Component Specification

$ARGUMENTS

## Project Stack (NOT Next.js)

- **React 18** — all components are client-side, no Server Components
- **TypeScript** strict mode
- **Tailwind CSS** for all styling
- **Lucide React** for icons
- Place components in `components/` folder

## Modern React 18 + TypeScript Standards

### 1. **Function Components Only**
- Use function components, never class components
- No `'use client'` directive (this is not Next.js — everything is already client-side)
- No async components (React 18 doesn't support async function components)

### 2. **TypeScript Best Practices**
- Strict typing (`strict: true` in tsconfig)
- `interface` for props
- Proper utility types: `ComponentProps`, `ReactNode`, `Pick`, `Omit`, `Partial`
- NO `any` types
- Import shared types from `../types`

### 3. **Component Pattern**

```typescript
import React, { useState, useCallback } from 'react';
// Import shared types from the project
import { Product } from '../types';

interface Props {
  product: Product;
  onAction?: (id: string) => void;
  className?: string;
}

const MyComponent: React.FC<Props> = ({ product, onAction, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = useCallback(() => {
    onAction?.(product.id);
  }, [onAction, product.id]);

  return (
    <div className={`bg-white rounded-2xl shadow-sm ${className}`}>
      {/* content */}
    </div>
  );
};

export default MyComponent;
```

### 4. **State Management**
- `useState` for local state
- `useReducer` for complex state
- Zustand for global state
- React Context for theme/auth

### 5. **Performance**
- Lazy loading with `React.lazy()`
- Code splitting
- `use memo()` for expensive computations
- `useCallback()` for callback functions

### 6. **Styling Approach** (choose based on project)
- **Tailwind CSS** - Utility-first (recommended)
- **CSS Modules** - Scoped styles
- **Styled Components** - CSS-in-JS

## What to Generate

1. **Component File** - Main component with TypeScript
2. **Props Interface** - Fully typed props
3. **Styles** - Tailwind classes or CSS module
4. **Example Usage** - How to import and use
5. **Storybook Story** (optional) - Component documentation

## Code Quality Standards

**Structure**
-  Feature-based folder organization
-  Co-locate related files
-  Barrel exports (index.ts)
-  Clear file naming conventions

**TypeScript**
-  Explicit prop types via interface
-  Proper generics where needed
-  Utility types (Pick, Omit, Partial)
-  Discriminated unions for variants

**Props**
-  Required vs optional props
-  Default values where appropriate
-  Destructure in function signature
-  Props spread carefully

**Accessibility**
-  Semantic HTML
-  ARIA labels where needed
-  Keyboard navigation
-  Screen reader friendly

**Best Practices**
-  Single Responsibility Principle
-  Composition over inheritance
-  Extract complex logic to hooks
-  Keep components small (<200 lines)

## Component Types to Consider

**Presentational Components**
- Pure UI rendering
- No business logic
- Receive data via props
- Easy to test

**Container Components**
- Data fetching
- Business logic
- State management
- Pass data to presentational components

**Compound Components**
- Related components working together
- Shared context
- Flexible API
- Example: `<Select><Select.Trigger/><Select.Content/></Select>`

## React 19 Features to Use

- **use()** API for reading promises/context
- **useActionState()** for form state
- **useFormStatus()** for form pending state
- **useOptimistic()** for optimistic UI updates
- **Server Actions** for mutations

Generate production-ready, accessible, and performant React components following Next.js 15 and React 19 patterns.

---

## In-Flight Guard Pattern (this project)

Every button that triggers a DB write or email **must** have an in-flight state. Three variants:

**Standard async button:**
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleAction = async () => {
  setIsSubmitting(true);
  try {
    await db.someOperation();
  } finally {
    setIsSubmitting(false);
  }
};

<button disabled={isSubmitting} onClick={handleAction}>
  {isSubmitting ? 'Saving...' : 'Save'}
</button>
```

**Modal variant:** `Modal` component accepts `disabled?: boolean` on `primaryAction` and `secondaryAction`.

**Resend with cooldown:** See `frontend-architect` skill for the countdown timer pattern.