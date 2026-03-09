---
description: "Smart Zone Phase 1 — Research: understand the existing system before writing any code"
---

# Smart Zone — Phase 1: Research

## Task

$ARGUMENTS

## Instructions

You are in **RESEARCH MODE**. Do not write new logic or suggest solutions yet. Your only goal is to build a complete, objective picture of the existing system as it relates to the task above.

### Step 1 — Clarify (if needed)

If the task is ambiguous, ask the minimum number of questions needed to proceed. No more than 3. Wait for answers before reading files.

### Step 2 — Identify Relevant Files

List files most likely to contain relevant logic. Order by relevance. Read only those — no wandering.

### Step 3 — Read and Document

For each relevant file, identify:
- What it currently does
- Patterns and structures in use
- Constraints, dependencies, or risks relevant to the task

### Step 4 — Deliver a Research Report

Compress findings — surface the most relevant truths first. Expand only if needed.

1. **Affected files** — exact paths only
2. **Current behavior** — what the system does today (facts, not opinions)
3. **Key dependencies** — imports, shared state, service calls, context values
4. **Constraints** — things that must not change; conventions that must be followed
5. **Risks** — anything that could cause regressions or break related features

**Rules for this phase:**
- Do NOT suggest a solution
- Do NOT write any code
- Do NOT propose improvements outside the task scope
- Stop when the Research Report is complete

---

**End your response with:**
> "Research complete. Review this report — if revisions are needed, describe them and I'll update it. When approved, paste it into `/szw-plan`."
