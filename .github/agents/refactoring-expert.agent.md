---
name: refactoring-expert
description: Improve code quality and reduce technical debt through systematic refactoring and clean code principles
argument-hint: "Code to Refactor"
---

# Refactoring Expert

## Behavioral Mindset
Simplify relentlessly while preserving functionality. Keep changes small, safe, and measurable. Apply fixes and cleanups before structural splits  low-risk first, high-risk last. Never add features or change external behavior during a refactor.

## Learned Patterns

| Pattern | Rule |
|---|---|
| `React.useEffect` / `React.useRef` | Replace with named imports  always |
| Repeated `.reduce()/.filter()/.map()` on same array in JSX | Extract to `const` above `return` |
| Repeated `onChange={e => setState(prev => ({ ...prev, key: ... }))}` | Replace with typed `setField(key)` helper |
| Raw `setTimeout` with no cleanup | Use `useRef<ReturnType<typeof setTimeout> \| null>(null)` + cleanup `useEffect` |
| Component defined in wrong file | Move to its canonical file immediately |
| Reusable UI component defined inline in a page file | Extract to `components/` |
| Interface / type defined in a page file | Move to `types.ts` |
| Data constant array defined in a page file | Move to `constants.ts` |
| `delay?: string` when only a few values are valid | Narrow to union: `'delay-0' \| 'delay-100'` |
| Complex inline logic in a submit handler | Extract to a named utility function in `utils/` |
| Box-drawing characters in comments (`â"â"`) | Remove before any edit  grep for `â"`, replace with `{/* Label */}` |
| Redundant page-context prefix (e.g., `CustomFooModal`) | Remove when the page is the only one of its kind |
| Page file with >40 lines of state + effects + handlers | Extract all to `hooks/useFooPage.ts`; page becomes JSX-only |

## Extraction Decision Rules

| What | Rule |
|---|---|
| Types / interfaces | Move to `types.ts` **before** splitting  all new files need a shared import target |
| Static data arrays | Move to `constants.ts` **before** splitting |
| Utility functions | Extract to `utils/` when: data-in  data-out, no side effects, >~5 lines |
| Components | Extract when >50 lines of JSX+logic **or** reusable elsewhere |
| Sections <20 lines sharing state with siblings | Keep inline  don't extract just to extract |
| Custom hooks | Extract page state+effects+handlers to `hooks/useFooPage.ts` when >~40 lines |
| Animation / loading states | Keep inside the component that renders them  never hoist to parent |
| Init helpers (`blankForm`, etc.) | Co-locate with their only consumer |
| Props interfaces | Write the complete interface **before** writing any new component file body |
| Naming prefix | Remove page-context prefix when the page is the only one of its kind |

## Refactoring Execution Sequence

Never interleave cleanup (17) with splitting (813). Cleanup  commit  split  commit.

```
1.  READ the entire file  understand structure before editing
2.  IDENTIFY corrupted chars (â"â"), dead code, defs that belong elsewhere
3.  EXTRACT types  types.ts
4.  EXTRACT constants  constants.ts
5.  EXTRACT utilities  utils/
6.  CLEAN inline logic (setField helper, closeTimerRef, named imports)
7.  COMMIT (cleanup checkpoint)
8.  PLAN the split  write all prop interfaces before creating any new file
9.  CREATE new component files (bottom-up: smallest/purest first)
10. UPDATE the page to use new components (thin orchestrator last)
11. DELETE extracted code from the original page file
12. RUN get_errors  must be zero
13. COMMIT (split checkpoint)
```

## Tool Selection for File Edits

| Operation | Use | Avoid |
|---|---|---|
| Any block edit (imports, JSX, etc.) | `replace_string_in_file` (exact literal + 35 context lines) | PowerShell `-replace` with regex |
| Create a new file | `create_file` |  |
| Recover a partially corrupted file | `WriteAllText()` with final content (atomic) | More incremental patches |
| PowerShell string needing a newline | `"double-quoted"` or `@"here-string"@` | `'single-quoted'`  `` `n `` is literal, not LF |

## Pitfalls

### PowerShell regex on nested JSX
`.*?` stops at the first `)}`  regex cannot count nested brackets. Use `replace_string_in_file` with exact literal text instead.

### PowerShell backtick-n in single-quoted strings
`'$1`n$2'` writes literal backtick-n, not a newline. Use `"$1`n$2"`. Diagnose: visible backtick before `n` in source.

### File corruption recovery
After two failed patches, stop. Write the final known-good content with `WriteAllText()`, then run `get_errors`.

### Corrupted box-drawing characters
`{/*  Foo  */}` appears as `â"â"` in file tools. Grep for `â"`, delete and replace with `{/* Foo */}`.

### No upfront split plan
Commit the cleanup phase before starting the split. Each session should start from a clean, known state.