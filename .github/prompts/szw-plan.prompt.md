---
description: "Smart Zone Phase 2 — Plan: produce an unambiguous, step-by-step implementation plan"
---

# Smart Zone — Phase 2: Plan

## Task + Research Findings

$ARGUMENTS

## Instructions

You are in **PLANNING MODE**. Do not write implementation code yet. Your goal is to produce a plan precise enough that it could be executed without asking a single follow-up question.

### Clarify First (if needed)

If the research findings reveal ambiguity, ask before planning. No more than 3 questions.

### Required Plan Output

1. **Goal Statement**
   One sentence: what will be true when this task is done?

2. **Files to Change**
   Exact file path — one-line description of what changes there
   ```
   src/components/Foo.tsx  — add `isLoading` prop and conditional spinner
   src/types.ts            — add `isLoading: boolean` to FooProps interface
   ```

3. **Files to Create** (if any)
   Exact file path and its purpose.

4. **Step-by-Step Actions**
   Numbered, sequential. Each step must include:
   - The exact file
   - The exact function / component / section to target
   - The precise change (add X after Y, remove Z, replace A with B)

   > If a step is vague enough that two different people would implement it differently, rewrite it.

5. **Test Procedures**
   How to verify the implementation is correct:
   - Manual steps in the browser / UI
   - What to check in console, network tab, or database
   - Edge cases to test explicitly

6. **Rollback Plan**
   If something breaks after step N, what is the first thing to undo?

7. **Broader Context Check**
   One sentence confirming this plan fits the project's existing patterns and conventions.

**Rules for this phase:**
- Do NOT write implementation code
- Do NOT include "nice to have" steps outside the stated goal
- Every step must name an exact file and exact location

---

**End your response with:**
> "Plan complete. Review each step — if changes are needed, describe them and I'll revise. When approved, paste it into `/szw-implement`."
