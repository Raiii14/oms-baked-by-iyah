# Refactoring Notes — CustomCake.tsx Case Study

> **Purpose:** Capture the decisions, reasoning, pitfalls, and efficiency lessons from the CustomCake.tsx refactoring session so future refactoring tasks can be faster, more structured, and avoid the same mistakes.

---

## 1. What Was Refactored

**File:** `pages/CustomCake.tsx`  
**Starting size:** ~540 lines  
**Problem:** One monolithic page file containing types, constants, utilities, multiple UI sections, and all business logic all in one place.

**End state (after full refactor):**
| File | Role | Approx Lines |
|---|---|---|
| `pages/CustomCake.tsx` | Thin orchestrator | ~80 |
| `components/CustomCakeFormModal.tsx` | Form modal with all form state & logic | ~300 |
| `components/CustomCakeGallery.tsx` | Presentational gallery grid | ~30 |
| `types.ts` | `PastCake`, `FormState`, `TopperType`, `TOPPER_OPTIONS` | added |
| `constants.ts` | `SIZE_OPTIONS`, `PAST_CAKES` | added |
| `utils/customCakeSerializer.ts` | `serializeCustomCakeNotes()` | new file |

---

## 2. Decisions Made and Why

### Decision 1 — Types extracted to `types.ts` before splitting

**Rule:** Never define interfaces/types inside a page file.

`PastCake`, `FormState`, `TopperType`, and the `TOPPER_OPTIONS` union were all defined inline in `CustomCake.tsx`. They were moved to `types.ts` first **before** splitting the page, so all split files could import from a single source of truth without circular dependencies.

**Why this order matters:** If you split first, each new file needs the types — you'd end up either duplicating them or fixing broken imports after the fact. Always extract types **before** splitting.

---

### Decision 2 — Constants extracted to `constants.ts` before splitting

**Rule:** Never define static data arrays in a page file.

`PAST_CAKES` (13 entries) and `SIZE_OPTIONS` were hardcoded arrays inside the page. They were moved to `constants.ts`.

Same sequencing reason as types: do this first so all new component files have a clean import target.

---

### Decision 3 — Serialization logic extracted to `utils/customCakeSerializer.ts`

The `handleSubmit` function had an inline `parts.push(...)` block that built the notes string. This was:
- Not testable in isolation
- Hard to read inside the submit handler
- Reusable if the form is refactored again

Extracted to `serializeCustomCakeNotes(form: FormState): string`.

**When to extract to utils:** If a function takes data in → produces data out → has no side effects → is more than ~5 lines. That's a utility.

---

### Decision 4 — `CustomCakeFormModal` calls `useStore()` directly (no prop drilling)

Instead of passing `user`, `submitCustomInquiry`, and other store values as props from the parent, `CustomCakeFormModal` calls `useStore()` itself.

**Reasoning:** The form modal needs `user` (for name/email prefill, role check, reset after submit) and `submitCustomInquiry`. Passing them as props would require 2+ extra props just to thread data the form already knows how to get. Direct store access is idiomatic for this project.

**Rule of thumb:** If a child component needs more than 2–3 values from global state, let it call `useStore()` directly. Props are for parent-specific data the child cannot look up itself.

---

### Decision 5 — `blankForm` factory moved into `CustomCakeFormModal`

`blankForm(user)` was defined at the top of the page file. After the split, only `CustomCakeFormModal` uses it (initial state + post-submit reset). It was moved inside that component's file.

**Rule:** Co-locate helpers with the only consumer. Don't leave helpers in the page file if they only serve one extracted component.

---

### Decision 6 — Lightbox overlay stayed in `pages/CustomCake.tsx`

The lightbox (clicking a gallery card to see full image) was considered for extraction but left in the page.

**Why:** It's ~20 lines, shares `lightboxCake` state with both the gallery (sets it) and the form (reads it for inspiration). Extracting it would require either: (a) lifting state higher, or (b) passing a setter into `CustomCakeGallery` and a value into a separate `Lightbox` component. The added indirection is not worth it for 20 lines.

**Rule:** Don't extract just to extract. A section needs to be either reusable elsewhere OR large enough to justify its own file (>50 lines of JSX and logic).

---

### Decision 7 — `isClosingForm` animation state stays inside `CustomCakeFormModal`

The parent never needs to know whether the form is in its closing animation. Keeping this state inside the modal keeps the API clean — the parent just calls `onClose()`.

**Rule:** Animation states, loading states, and UI-only states belong inside the component that renders that UI, not the parent.

---

### Decision 8 — Corrupted box-drawing comments removed, not preserved

The file had comments like:
```
{/* ─── Gallery ──────────────────────────────────────── */}
```
These render in source as garbled UTF-8 box-drawing characters (`â"€â"€`). They were removed and replaced with clean short labels like `{/* Gallery */}`.

**This caused a major planning slowdown** — see Section 4.

---

## 3. Data Flow After Split

```
CustomCake (page)
  ├── State: showForm, lightboxCake, inspirationCake, showLoginWarning, showSuccessModal
  ├── <Modal> login warning
  ├── <Modal> success
  ├── Lightbox overlay (inline, ~20 lines)
  │     └── "Use as Inspiration" → openForm(cake)
  ├── FAB button → openForm()
  ├── <CustomCakeGallery onSelectCake={setLightboxCake} />
  └── <CustomCakeFormModal
        isOpen={showForm}
        inspirationCake={inspirationCake}
        onClearInspiration={() => setInspirationCake('')}
        onClose={closeModal}
        onSubmitSuccess={() => { setShowForm(false); setShowSuccessModal(true); }}
        onLoginRequired={() => setShowLoginWarning(true)}
      />
```

---

## 4. Efficiency Issues — What Slowed the Process Down

### 4a. Corrupted UTF-8 Box-Drawing Characters in Comments

**What happened:** The file contained decorative section divider comments using Unicode box-drawing characters (U+2500 `─`). When these were read back through the file-reading tools, they appeared as multi-byte mojibake sequences like `â"€â"€`. The AI had to:
1. Identify whether these were actual code or artifacts
2. Determine they were safe to remove
3. Avoid accidentally treating them as part of a string or identifier

**Time cost:** Significant — the AI had to re-read sections multiple times and add caveats in planning to say "ignore corrupted comments."

**How to avoid in the future:**
- **Do not use Unicode box-drawing characters in code comments.** Plain ASCII separators (`// ---` or `{/* --- */}`) are perfectly fine and never corrupt.
- Run a quick grep before refactoring large files: if you see `â"€`, `â"`, `â"`, or similar — those are box-drawing characters and can be safely deleted.
- Flag this in code review: box-drawing comments are a style anti-pattern in source files.

**Grep to detect before refactoring:**
```
grep -P "[\x{2500}-\x{257F}]" filename.tsx
```
Or in VS Code: search for `─` (literal character) in the file.

---

### 4b. Split Decision Was Not Made Early Enough

The split was planned for the end, but the prep work (type extraction, constants, serializer) happened across multiple sessions with token budget resets in between. Each reset required re-reading the file to rebuild context.

**How to avoid:**
- When a file exceeds ~200 lines, **plan the full split upfront** before doing any cleanup.
- Do all cleanup (types, constants, utils extraction) in one pass, then split in the next pass.
- Don't interleave cleanup and splitting — finish cleanup entirely, commit, then split.

---

### 4c. Large File + Multiple Sessions = Repeated Context Rebuilding

Because CustomCake.tsx was ~540 lines and the work spanned multiple sessions, the AI had to re-read large portions of the file each session to rebuild context.

**How to avoid:**
- For large file refactors, complete the full operation in one session if possible.
- Use session memory notes to record: "file is clean, ready to split; split plan is X."
- Commit between phases (cleanup phase → split phase) so each session starts from a clean, known state.

---

### 4d. Prop Interface Not Defined Before Split

When planning `CustomCakeFormModal`, the prop interface wasn't written out first. This caused back-and-forth between "what does the parent need to pass?" and "what does the child need to expose back up?"

**How to avoid:**
- Before writing any split component, **write the props interface first**:
  ```typescript
  interface CustomCakeFormModalProps {
    isOpen: boolean;
    inspirationCake: string;
    onClearInspiration: () => void;
    onClose: () => void;
    onSubmitSuccess: () => void;
    onLoginRequired: () => void;
  }
  ```
- Validate the interface makes sense (no leaking internal state, no unnecessary props).
- Only then write the component body.

---

## 5. Refactoring Execution Order (The Correct Sequence)

This is the order that minimizes rework and context rebuilding:

```
1. READ the entire file first — don't start editing before you understand the full structure
2. IDENTIFY corrupted characters, dead code, and local defs that belong elsewhere
3. EXTRACT types → types.ts
4. EXTRACT constants → constants.ts
5. EXTRACT utilities → utils/
6. CLEAN inline logic (setField helper, closeTimerRef, named imports)
7. COMMIT (cleanup complete checkpoint)
8. PLAN the split — write all prop interfaces before writing any new file
9. CREATE new component files (bottom-up: smallest/purest first)
10. UPDATE the page to use the new components (thin orchestrator last)
11. DELETE extracted code from the original page file
12. RUN type checker / get_errors
13. COMMIT (split complete checkpoint)
```

**Never** interleave steps 3–6 with steps 9–11. Cleanup first, split second.

---

## 6. Patterns Applied in This Refactor

| Pattern | Applied Where |
|---|---|
| Extract Function | `serializeCustomCakeNotes` from `handleSubmit` |
| Extract Component | `CustomCakeGallery`, `CustomCakeFormModal` from `CustomCake` |
| Move to Canonical Location | Types → `types.ts`, constants → `constants.ts` |
| Typed `setField` helper | Replaces 12× repeated `onChange` closures |
| Timer leak fix (`useRef` + cleanup) | `closeTimerRef` in form modal |
| Named imports (no `React.X` namespace) | Throughout all files |
| Union type for constrained props | `TopperType`, `delay` prop on `FadeIn` |
| Body scroll lock with cleanup | `useEffect` in form modal, cleans up on unmount |

---

## 7. Quick Reference Checklist for Future Large File Refactors

Before touching any file >200 lines, answer these:

- [ ] Are there any corrupted/non-ASCII characters in comments? → Remove them first
- [ ] Are there inline `interface` or `type` definitions? → Move to `types.ts`
- [ ] Are there hardcoded data arrays? → Move to `constants.ts`
- [ ] Is there complex logic in a handler that produces a value? → Move to `utils/`
- [ ] Are there repeated `onChange` or `onClick` patterns? → `setField`-style helper
- [ ] Are there `setTimeout` calls with no cleanup ref? → Add `useRef` + cleanup `useEffect`
- [ ] Are there components defined inside this file that belong in `components/`? → Extract
- [ ] Is any extracted component >50 lines of JSX+logic? → It deserves its own file
- [ ] Have I written all prop interfaces **before** creating new component files?
- [ ] Is my split order: cleanup → commit → split → commit?

---

## 8. Phase 2 — Hook Extraction + Rename (Session 2)

> **Status:** Planned, ready to implement.
> **What triggered this:** After the cleanup phase (types, constants, utils extracted), the file was still ~600 lines because the component split was never completed.

### What changed from the original plan

The original plan (Section 2, Decision 4) had `CustomCakeFormModal` calling `useStore()` directly. This was revised: instead, **all logic is extracted into a custom hook** (`useCakePage.ts`), and the form component receives everything as props. This is a stricter separation — the form becomes a pure presentational component with zero store access.

**Why the revision is better:**
- The hook owns all the thinking; the form only renders
- The form is independently testable with mock props
- Avoids the ambiguity of "which file calls useStore?" — only the hook does

---

### Decision 9 — Naming: remove "Custom" prefix everywhere

**Rule:** Don't add a page-context prefix to a component when that page is the only one of its kind.

`CustomCakeFormModal` → `CakeFormModal`, `CustomCakeGallery` → `CakeGallery`, `CustomCake.tsx` → `Cake.tsx`, `CustomCakeSkeleton.tsx` → `CakeSkeleton.tsx`, `customCakeSerializer.ts` → `cakeSerializer.ts`.

The URL (`/custom-cake`) stays unchanged. Only file and component names are shortened.

---

### Decision 10 — Page logic extracted to a custom hook in `hooks/`

A new `hooks/` folder is created at the project root. `useCakePage.ts` owns:
- All `useState` declarations
- All `useEffect` declarations (user sync, admin redirect, scroll lock, timer cleanup)
- All handlers (`openForm`, `closeForm`, `setField`, `toggleTopper`, `handleImageChange`, `handleSubmit`)
- Calls to `useStore()` and `useNavigate()`
- The `blankForm` factory

**Rule:** When a page file has more than ~40 lines of state + effects + handlers with no JSX, extract to a custom hook in `hooks/`.

**Where hooks live:** `hooks/` at project root — not inside `pages/` — because this is a standard React convention and the folder is reusable for future pages.

---

### Decision 11 — Lightbox stays inline (conditional extraction rule)

The lightbox (~20 lines) stays inline in `Cake.tsx` **for now**. It will be extracted to `CakeLightbox.tsx` only if the gallery card count or lightbox feature (captions, multiple images, swipe, etc.) grows significantly.

**Rule:** Extraction threshold for a section that shares state with siblings: extract when the section itself exceeds ~50 lines OR when new features make it independent enough to stand alone.

---

### Updated End State Table

| File | Role | Approx Lines |
|---|---|---|
| `pages/Cake.tsx` | Thin orchestrator | ~60 |
| `hooks/useCakePage.ts` | All state, effects, handlers | ~80 |
| `components/CakeFormModal.tsx` | Form modal — pure props-driven JSX | ~280 |
| `components/CakeGallery.tsx` | Gallery grid — pure presentational | ~30 |
| `components/skeletons/CakeSkeleton.tsx` | Loading skeleton | unchanged |
| `types.ts` | FormState, PastCake, TopperType, TOPPER_OPTIONS | unchanged |
| `constants.ts` | SIZE_OPTIONS, PAST_CAKES | unchanged |
| `utils/cakeSerializer.ts` | serializeCakeNotes() | renamed |

---

### Updated Data Flow

```
Cake.tsx (page)
  uses: useCakePage() → all state + handlers
  renders:
    <Modal> login warning   (inline, props from hook)
    <Modal> success         (inline, props from hook)
    Lightbox JSX            (inline ~20 lines, props from hook)
    <CakeFormModal          (props from hook)
      isOpen={showForm}
      isClosing={isClosingForm}
      formData={formData}
      user={user}
      onClose={closeForm}
      onSubmit={handleSubmit}
      setField={setField}
      onSizeChange={(size) => ...}
      toggleTopper={toggleTopper}
      onImageChange={handleImageChange}
      onClearInspiration={clearInspiration}
    />
    FAB button              (inline)
    <CakeGallery onSelectCake={setLightboxCake} />

useCakePage.ts (hook)
  calls: useStore() → user, submitCustomInquiry
  calls: useNavigate()
  owns: all state, all effects, all handlers
  returns: everything Cake.tsx needs to render and wire props
```

### Phase 2 Execution Order

```
Phase 1 — Rename (no logic changes)
  1. Rename CustomCake.tsx → pages/Cake.tsx
  2. Rename CustomCakeSkeleton.tsx → CakeSkeleton.tsx
  3. Rename customCakeSerializer.ts → utils/cakeSerializer.ts
  4. Update App.tsx imports
  5. Update Layout.tsx import path
  6. RUN get_errors — must be clean

Phase 2 — Hook extraction
  7. Create hooks/useCakePage.ts, move all state/effects/handlers/blankForm
  8. Update Cake.tsx to call useCakePage()
  9. RUN get_errors — must be clean

Phase 3 — Component split
  10. Write CakeFormModal props interface first (before any JSX)
  11. Create components/CakeFormModal.tsx — move form JSX
  12. Create components/CakeGallery.tsx — move gallery JSX
  13. Update Cake.tsx to use new components
  14. Remove corrupted box-drawing comments (â"€â"€) → replace with plain {/* Label */}
  15. RUN get_errors — must be zero errors
```

---

### 4e. Nested Markdown Code Blocks Break When Copied from AI Output

**What happened:** The AI wrapped a "paste this into the .md file" block inside a triple-backtick ` ```markdown ``` ` fence. Inside that outer fence were inner triple-backtick code blocks (for the data flow diagram and execution order). Markdown does not allow triple-backtick fences to be nested — the inner ` ``` ` appeared as literal text in the rendered chat output. When pasted into the file, the inner code block fences were missing, leaving the diagrams as raw unformatted prose.

**How to avoid in the future:**

- When the AI provides a block of markdown to paste that **contains inner code blocks**, use **4-backtick outer fences** in the AI response:
inner ```code block``` here works fine

- If the content has no inner code blocks, triple-backtick fences are fine as usual.
- If something looks wrong after pasting, check that all ` ``` ` fences in the pasted content came through as actual backtick characters — not stripped or converted to indented blocks.
```

---

The root cause is worth remembering: **3 inside 3 breaks; 4 outside, 3 inside is fine.** I've noted this in my memory so I'll use 4-backtick outer fences whenever providing paste-ready markdown that contains code blocks. 