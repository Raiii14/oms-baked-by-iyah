---
description: Add authentication, authorization, and security to Supabase data operations
model: claude-sonnet-4-6
---

Add comprehensive security to a Supabase data operation in this Vite + React + Supabase project.

## Target Operation

$ARGUMENTS

## Project Stack

This project uses **Supabase** for auth + database. Security is enforced via:
1. **Supabase Auth** - JWT-based authentication
2. **Row-Level Security (RLS)** - database-level authorization policies
3. **`services/db.ts`** - all data ops (no server-side API routes)

## Implementation Approach

### Authentication - use `getUser()` NOT `getSession()`

```typescript
// CORRECT: verifies JWT against Supabase Auth server (trusted)
const { data: { user }, error } = await supabase.auth.getUser();
if (!user) throw new Error('Not authenticated');

// WARNING (Supabase docs): getSession() loads from storage (localStorage/cookies)
// and the returned user object should NOT be trusted for security-sensitive ops
// because it can be read from tampered storage. Use only for non-sensitive read.
const { data: { session } } = await supabase.auth.getSession();
```

### Authorization - Role-Based Access Control

```typescript
// In db.ts service methods
async adminOnlyOperation(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get role from user metadata or profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Forbidden');
  // ... proceed
}
```

## Security Checklist

**Authentication**
- Use `supabase.auth.getUser()` to verify identity for sensitive operations
- Handle null user (throw or return early before any DB access)
- Let Supabase handle token expiry and refresh automatically

**Authorization**
- Enable RLS on ALL tables in Supabase dashboard
- Write RLS policies for SELECT, INSERT, UPDATE, DELETE
- Check user role in db.ts for app-level RBAC (admin vs customer)
- Never trust client-provided user IDs - use `auth.uid()` in RLS policies

**Input Validation**
- Validate types using TypeScript interfaces before passing to Supabase
- Never build raw SQL strings - use Supabase's query builder
- Supabase client auto-parameterizes queries (prevents SQL injection)

**Error Handling**
- Never expose raw Supabase error messages to the user
- Log errors server-side (console.error in dev); use addNotification() for UI
- Consistent pattern: `if (error) throw error;` in db.ts, catch in StoreContext

**Secure Storage**
- Do NOT manually store session tokens in localStorage
- Supabase client manages session storage automatically
- Do NOT store the `bbi_user` object in localStorage (use Supabase session only)
- Cart data (non-sensitive) may use localStorage but not auth data

## RLS Policy Examples

```sql
-- Users can only read their own orders
CREATE POLICY "Users read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY "Admins read all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can only insert with their own user_id
CREATE POLICY "Users insert own records"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Common Patterns in This Project

**Pattern 1: Auth check before DB op**
```typescript
async createOrder(details: OrderDetails): Promise<Order> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  // RLS on the DB also enforces this
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...details, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

**Pattern 2: Role check**
```typescript
async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  // Role check from StoreContext (already fetched user.role)
  // RLS policy on DB enforces admin-only
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
}
```

Generate secure, production-ready code following the principle of least privilege.
