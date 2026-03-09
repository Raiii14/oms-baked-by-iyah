# Feature Reference

Quick reference for implemented features, pending work, and key design decisions in the Baked by Iyah OMS.

## Order Status Model

**4 statuses in `types.ts`:**

| Status | Value | Meaning |
|---|---|---|
| PENDING | `'Pending'` | Waiting for admin to confirm |
| PREPARING | `'Preparing'` | Confirmed, being prepared for delivery |
| COMPLETED | `'Completed'` | Order delivered |
| CANCELLED | `'Cancelled'` | Admin-only manual override for edge cases |

**Business rules:**
- Customers **cannot** cancel orders. `CANCELLED` is admin-only.
- `CONFIRMED` and `BAKING` were merged into `PREPARING` (refactored March 2026).
- Custom cake inquiry cancel/decline flow is not yet decided — out of scope.

**DB migration (run once in Supabase SQL Editor if upgrading existing DB):**

```sql
UPDATE orders SET status = 'Preparing' WHERE status IN ('Confirmed', 'Baking');
ALTER TABLE products ADD COLUMN IF NOT EXISTS admin_only BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS best_seller BOOLEAN NOT NULL DEFAULT FALSE;
```

## Email Notification System

**Infrastructure:** Supabase Edge Function `send-email` (deployed, working). Uses Gmail SMTP via nodemailer. Secrets `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `ADMIN_EMAIL` are set in the Supabase dashboard.

**Trigger map:**

| Event | Recipients | Status |
|---|---|---|
| Signup email confirmation | Customer | ✅ Live (Supabase Auth built-in) |
| Order placed (regular) | Customer + Admin | ✅ Implemented |
| Custom inquiry submitted | Customer + Admin | ✅ Implemented |
| Status → Preparing | Customer only | ✅ Implemented |
| Status → Completed | Customer only | ✅ Implemented |
| Order cancelled by admin | Customer (email + in-app) | ✅ Implemented |

**Rules:**
- `sendEmail` is always fire-and-forget: `.catch(console.error)`, never `await`ed in user flows.
- Always guard before sending: `if (order.customerEmail) { db.sendEmail(...).catch(console.error); }`
- Email failures must never crash order operations.

## Best Seller Feature

**Decision:** Auto-computed — top 3 products by total units sold across all `COMPLETED` orders (all-time). The admin `bestSeller` toggle exists but the Home page reads from sales data, not the flag.

| Area | State |
|---|---|
| `bestSeller` column in DB + `db.ts` mapping | ✅ Done |
| Admin toggle UI (AdminDashboard → Menu tab) | ✅ Done |
| Home page best sellers section | ✅ Done — top 3 by units in COMPLETED orders (fallback: in-stock by stock desc) |

**Pending change:** `Home.tsx` best sellers section should compute top 3 by filtering `orders` for `COMPLETED` status, counting units per product ID, and taking the top 3.

## Admin-Only Products

**Purpose:** Products with `adminOnly = true` are hidden from customers on Menu and Home pages. Used for drafts and items not yet ready for public launch.

**State:** Fully implemented ✅ — DB column, `db.ts` mapping, admin toggle UI, and customer-side filter on `Menu.tsx`.

**If running on a DB created before this feature was added:**

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS admin_only BOOLEAN NOT NULL DEFAULT FALSE;
```

## Pending / Not Yet Done

| Feature | Notes |
|---|---|
| Custom inquiry cancel/decline flow | Intentionally deferred — not yet decided |

---

_Last updated: March 10, 2026_
