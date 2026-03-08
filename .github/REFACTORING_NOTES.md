# Refactoring Notes  CustomCake.tsx Case Study

> Decisions, pitfalls, and lessons from refactoring a 540-line monolithic page across three phases.

---

## File Inventory

| File | Before | After | Phase |
|---|---|---|---|
| `pages/CustomCake.tsx` (~540 lines) | Monolith | Renamed  `Cake.tsx` | 1 |
| `pages/Cake.tsx` |  | ~114 lines, thin orchestrator | 2 & 3 |
| `hooks/useCakePage.ts` |  | ~80 lines, all state/effects/handlers | 2 |
| `components/CakeFormModal.tsx` |  | ~280 lines, props-driven form modal | 3 |
| `components/CakeGallery.tsx` |  | ~30 lines, presentational gallery | 3 |
| `components/skeletons/CakeSkeleton.tsx` | `CustomCakeSkeleton.tsx` | Renamed | 1 |
| `utils/cakeSerializer.ts` | `customCakeSerializer.ts` | Renamed | 1 |
| `App.tsx`, `Layout.tsx` | Referenced `CustomCake` | Updated to `Cake` | 1 |

---

## Decisions

| # | Decision | Rule |
|---|---|---|
| 1 | Types extracted to `types.ts` before splitting | Splitting first breaks all imports  extract shared types first |
| 2 | Constants extracted to `constants.ts` before splitting | Same  shared import target required before new files exist |
| 3 | Serialization extracted to `utils/cakeSerializer.ts` | Data-in  data-out, no side effects, >5 lines = move to `utils/` |
| 4 | `CakeFormModal` is props-driven, no `useStore()` inside | Hook owns all logic; form only renders; easier to test |
| 5 | `blankForm` factory co-located inside form modal | Co-locate helpers with their only consumer |
| 6 | Lightbox stayed inline (~20 lines) | Too small; state shared with siblings  not worth extracting |
| 7 | `isClosingForm` kept inside `CakeFormModal` | Animation state belongs in the animating component, not the parent |
| 8 | Box-drawing comments removed | Appear as `â"â"` in file tools  replace with plain `{/* Label */}` |
| 9 | "Custom" prefix removed from all names | Page is the only of its kind  `CakeFormModal` > `CustomCakeFormModal` |
| 10 | Page logic extracted to `hooks/useCakePage.ts` | >40 lines of state+effects+handlers with no JSX  extract to `hooks/` |

---

## Data Flow

```
Cake.tsx (thin orchestrator)
  calls useCakePage()  all state + handlers
  renders:
    <Modal> login warning / success    (props from hook)
    Lightbox JSX                        (inline ~20 lines)
    <CakeFormModal ... />               (props from hook)
    FAB button                          (inline)
    <CakeGallery onSelectCake={...} />

useCakePage.ts (hook)
  calls useStore() + useNavigate()
  owns: all useState, useEffect, handlers, blankForm
  returns: everything Cake.tsx needs to render
```

---

## Patterns Applied

| Pattern | Where |
|---|---|
| Extract Function | `serializeCakeNotes` from `handleSubmit` |
| Extract Component | `CakeGallery`, `CakeFormModal` from monolith |
| Extract Hook | `useCakePage` from `Cake.tsx` |
| Move to Canonical Location | Types  `types.ts`, constants  `constants.ts` |
| Typed `setField` helper | Replaces 12 repeated `onChange` closures |
| Timer leak fix | `useRef` + cleanup `useEffect` for `closeTimerRef` |
| Named imports | No `React.X` namespace anywhere |
| Body scroll lock | `useEffect` with cleanup in form modal |

---

## Pitfalls

### PowerShell regex fails on nested JSX blocks
`.*?` stops at the first `)}` regardless of bracket depth. JSX always has nested brackets.
**Fix:** Use `replace_string_in_file` with exact literal text  no regex, handles nesting correctly.

### PowerShell backtick-n in single-quoted strings
`'$1`n$2'` writes a literal backtick + `n`, not a newline.

| String type | `` `n `` result |
|---|---|
| `'single-quoted'` | literal backtick-n |
| `"double-quoted"` | newline (LF) |
| `@'here-string'@` | literal backtick-n |
| `@"here-string"@` | newline (LF) |

**Fix:** Use `"double-quoted"` replacement strings. For full file writes, use `[System.IO.File]::WriteAllText()`.

### File corrupted by incremental patches
After two failed patches, stop layering more. Each patch risks new artifacts.
**Fix:** Write the final known-good content atomically via `WriteAllText()`, then run `get_errors`.

### Nested markdown code blocks strip inner fences
Triple-backtick fences cannot be nested inside triple-backtick fences  inner fences are stripped.
**Fix:** Use 4-backtick outer fences when providing paste-ready markdown that contains code blocks.

### Split without an upfront plan
Cleanup spans sessions without a committed split plan  context must rebuild each time.
**Fix:** Commit the cleanup phase before starting the split phase.