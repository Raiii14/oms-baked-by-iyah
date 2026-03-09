---
description: "End-of-chat session wrap — summarize, update memory, extract insights, hand off to next chat"
---

# Session Wrap

Summarize this conversation and update the project memory files. Be concise — no bloated info, only what adds real value.

## Steps

1. **Read current memory files** before writing anything:
   - `/memories/repo/conventions.md`
   - `/memories/repo/plan-*.md` (any relevant plan files)

2. **Update memory files** with anything new, changed, or resolved:
   - Mark completed steps as ✅
   - Add bugs fixed with: cause, fix, rule derived
   - Update test procedure statuses
   - Add new conventions or rules discovered

3. **Extract insights** — categorize by skill file and add to the relevant `.github/skills/` or `.github/agents/` file:
   - `frontend-architect` — UI patterns, auth guards, multi-step flows
   - `component-new` — reusable component patterns, guards, state patterns
   - `api-test` — Supabase gotchas, test isolation rules
   - `new-task` — service layer rules, migration patterns, planning notes
   - `backend-architect.agent.md` — DB/RLS/auth design patterns

4. **Check git state** — verify the repo is in a clean, push-ready state:
   - `git status` — working tree should be clean (no uncommitted changes)
   - `git branch` — HEAD should be on a **local** branch (e.g. `main`), not detached from `origin/main`
   - If there are unpushed commits: `git pull --rebase && git push`
   - If HEAD is detached: `git checkout -b <rescue-branch>` to save work, then merge into `main`
   - Note in the handoff summary if any branch/push action is still pending

5. **Output a handoff summary** with three sections:
   - **Done** — what was completed and verified
   - **Pending** — what still needs action (code or manual steps)
   - **Carry forward** — open questions or decisions deferred to next chat
