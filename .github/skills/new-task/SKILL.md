---
name: new-task
description: Analyze task complexity and create actionable implementation plan
---

Analyze the following task and create a clear, actionable implementation plan.

## Task

$ARGUMENTS

## Analysis Framework

### 1. **Task Breakdown**
- Understand requirements
- Identify dependencies
- List affected files/components
- Estimate complexity (Small/Medium/Large)

### 2. **Time Estimation**
- **Small**: 1-2 hours (simple bug fix, minor feature)
- **Medium**: Half day to 1 day (new component, API endpoint)
- **Large**: 2-5 days (complex feature, multiple integrations)
- **Very Large**: 1+ week (major refactor, new subsystem)

### 3. **Risk Assessment**
Identify potential blockers:
- Unknown dependencies
- API limitations
- Data migration needs
- Breaking changes
- Third-party service issues

### 4. **Implementation Steps**

Create sequential, logical steps:
1. Setup/preparation
2. Backend changes
3. Frontend changes
4. Testing
5. Documentation
6. Deployment

### 5. **Success Criteria**

Define "done":
- Feature works as specified
- Tests pass
- No regressions
- Code reviewed
- Documented

## Output Format

### Task Analysis
- **Type**: [Bug Fix / Feature / Refactor / Infrastructure]
- **Complexity**: [Small / Medium / Large / Very Large]
- **Estimated Time**: X hours/days
- **Priority**: [High / Medium / Low]

### Implementation Plan

**Phase 1: [Name]** (Time estimate)
- [ ] Step 1
- [ ] Step 2

**Phase 2: [Name]** (Time estimate)
- [ ] Step 3
- [ ] Step 4

### Files to Modify/Create
```
app/page.tsx (modify)
components/NewComponent.tsx (create)
lib/utils.ts (modify)
```

### Dependencies
```bash
npm install package-name
```

### Testing Strategy
- Unit tests for X
- Integration tests for Y
- Manual testing steps

### Potential Issues
- Issue 1 and mitigation
- Issue 2 and mitigation

### Next Steps
1. Start with Phase 1, Step 1
2. Test incrementally
3. Commit often

Provide a clear, solo-developer-friendly plan that breaks down complex tasks into manageable steps.

---

## Supabase Architecture Rules (this project)

**Service layer contract**
All DB operations go through `services/db.ts`. The `DatabaseProvider` interface is the contract — add new ops to the interface first, then implement in `SupabaseService`. Never call `supabase` directly from components or context.

**Profile creation**
User profiles are created by the `handle_new_user` SECURITY DEFINER trigger — not by client code. This is the only safe path for any write that must happen before a session exists (signup, OAuth).

**Email sends**
All `sendEmail` calls are fire-and-forget: `db.sendEmail(...).catch(console.error)`. Never `await` them in user-facing flows. Email failure must never crash an order operation.

**Schema migrations**
When adding a column to an existing table, always use `ADD COLUMN IF NOT EXISTS` to make the migration safe to re-run. Document in `schema.sql` as a comment block so it's not missed on fresh installs.