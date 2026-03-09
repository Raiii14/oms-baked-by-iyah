---
name: api-test
description: Test API endpoints with automated test generation
---

Generate comprehensive API tests for the specified endpoint.

## Target

$ARGUMENTS

## Test Strategy for Solo Developers

Create practical, maintainable tests using modern tools:

### 1. **Testing Approach**
- Unit tests for validation logic
- Integration tests for full API flow
- Edge case coverage
- Error scenario testing

### 2. **Tools** (choose based on project)
- **Vitest** - Fast, modern (recommended for new projects)
- **Jest** - Established, widely used
- **Supertest** - HTTP assertions
- **MSW** - API mocking

### 3. **Test Coverage**

**Happy Paths**
- Valid inputs return expected results
- Proper status codes
- Correct response structure

**Error Paths**
- Invalid input validation
- Authentication failures
- Rate limiting
- Server errors
- Missing required fields

**Edge Cases**
- Empty requests
- Malformed JSON
- Large payloads
- Special characters
- SQL injection attempts
- XSS attempts

### 4. **Test Structure**

```typescript
describe('API Endpoint', () => {
  describe('Success Cases', () => {
    it('should handle valid request', () => {})
    it('should return correct status code', () => {})
  })

  describe('Validation', () => {
    it('should reject invalid input', () => {})
    it('should validate required fields', () => {})
  })

  describe('Error Handling', () => {
    it('should handle server errors', () => {})
    it('should return proper error format', () => {})
  })
})
```

### 5. **What to Generate**

1. **Test File** - Complete test suite with all scenarios
2. **Mock Data** - Realistic test fixtures
3. **Helper Functions** - Reusable test utilities
4. **Setup/Teardown** - Database/state management
5. **Quick Test Script** - npm script to run tests

## Key Testing Principles

-  Test behavior, not implementation
-  Clear, descriptive test names
-  Arrange-Act-Assert pattern
-  Independent tests (no shared state)
-  Fast execution (<5s for unit tests)
-  Realistic mock data
-  Test error messages
- L Don't test framework internals
- L Don't mock what you don't own
- L Avoid brittle tests

## Additional Scenarios to Cover

1. **Authentication/Authorization**
   - Valid tokens
   - Expired tokens
   - Missing tokens
   - Invalid permissions

2. **Data Validation**

---

## Supabase-Specific Test Gotchas (this project)

**RLS write after `signUp()`**
With email confirmation ON, `signUp()` returns a user but no session (`auth.uid()` = null). Any client-side write to a RLS-protected table will fail. Test: verify no DB writes happen between `signUp()` and OTP verification.

**Missing DB column kills unrelated flow**
`placeOrder` calls `updateProduct` first. If the `products` table is missing `admin_only`, the entire order fails before `createOrder` is reached. Smoke test: verify `updateProduct` succeeds in isolation before testing order placement.

**Supabase OTP range**
Supabase sends 6–8 digit codes depending on settings. Test OTP input with both 6-digit and 8-digit values. Input `maxLength` must be 8; submit must be enabled at `length >= 6`.

**Fire-and-forget emails**
Email sends (`.catch(console.error)`) must never be awaited in tests of order operations — test the order result independently of email delivery.
   - Type mismatches
   - Out of range values
   - SQL/NoSQL injection
   - XSS payloads

3. **Rate Limiting**
   - Within limits
   - Exceeding limits
   - Reset behavior

4. **Performance**
   - Response times
   - Large dataset handling
   - Concurrent requests

Generate production-ready tests I can run immediately with `npm test`.