# Supabase Image Buckets — Setup Guide

> Branch: `feature/supabase-image-buckets`

Two **private** Storage buckets are added for holding compressed images:

| Bucket | Purpose | Max file size | Path pattern |
|---|---|---|---|
| `payment-receipts` | GCash screenshots from Checkout | 2 MB | `{userId}/{orderId}.jpg` |
| `custom-cake-references` | Reference images from Custom Cake page | 2 MB | `{userId}/{orderId}-ref.jpg` |

---

## Step 1 — Run the SQL

In the **Supabase Dashboard → SQL Editor → New Query**, paste and run [`storage.sql`](./storage.sql).

> Make sure you have already run `schema.sql` first.

This will:
- Create both Storage buckets with a 2 MB limit and allowed MIME types (`image/jpeg`, `image/png`, `image/webp`).
- Set up RLS policies so:
  - Authenticated customers can only upload/read **their own** files.
  - Admins can read and delete **all** files in both buckets.

---

## Step 2 — Verify buckets exist

In the Supabase Dashboard → **Storage** tab, you should see:
- `payment-receipts`
- `custom-cake-references`

Both will show **Private** (not public).

---

## Step 3 — Use in the frontend

The three new methods are available on the `db` service (see [`services/db.ts`](../services/db.ts)):

### Upload a payment receipt

Call this **before** `db.createOrder()` so you can store the signed URL in `order.paymentProof`.

```ts
import { compressImage } from '../utils/imageCompression';
import { db } from '../services/db';

// 1. Compress first (imageFile comes from <input type="file">)
const compressed = await compressImage(imageFile, 0.7, 1024);

// 2. Upload — returns a 1-hour signed URL
const signedUrl = await db.uploadPaymentReceipt(user.id, order.id, compressed);

// 3. Attach to order
order.paymentProof = signedUrl;
await db.createOrder(order);
```

### Upload a custom cake reference image

```ts
const compressed = await compressImage(referenceFile, 0.7, 1024);
const signedUrl = await db.uploadCustomCakeReference(user.id, order.id, compressed);

order.customDetails = {
  size,
  notes,
  referenceImage: signedUrl,
};
await db.createOrder(order);
```

### Refresh an expired signed URL

Signed URLs expire after 1 hour. To show the image later (e.g., in the Admin Dashboard):

```ts
// Parse the storage path from the saved URL — or store it separately.
// The path is the part after /object/sign/{bucket}/ and before the `?token=` query.
const freshUrl = await db.getImageSignedUrl('payment-receipts', `${userId}/${orderId}.jpg`);
```

---

## Step 4 — Environment variables

No new env vars are needed. The existing keys in `.env` already enable Storage:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

---

## RLS policy summary

| Policy | Bucket | Operation | Who |
|---|---|---|---|
| Customers can upload own payment receipts | `payment-receipts` | INSERT | Authenticated, own folder |
| Customers can read own payment receipts | `payment-receipts` | SELECT | Authenticated, own folder |
| Admins can read all payment receipts | `payment-receipts` | SELECT | ADMIN role |
| Admins can delete payment receipts | `payment-receipts` | DELETE | ADMIN role |
| Customers can upload own cake reference images | `custom-cake-references` | INSERT | Authenticated, own folder |
| Customers can read own cake reference images | `custom-cake-references` | SELECT | Authenticated, own folder |
| Admins can read all cake reference images | `custom-cake-references` | SELECT | ADMIN role |
| Admins can delete cake reference images | `custom-cake-references` | DELETE | ADMIN role |

---

## Notes

- **Path-based isolation**: Files are stored as `{userId}/{orderId}.jpg`, so the RLS `foldername` check guarantees users can only touch their own files — no extra filtering needed in application code.
- **Signed URLs**: Images are never publicly accessible. Every viewer gets a fresh signed URL valid for 1 hour. Re-generate with `db.getImageSignedUrl()` when displaying in the Admin Dashboard.
- **Compression happens client-side**: `utils/imageCompression.ts` converts and resizes images to JPEG ≤1024 px wide before upload, keeping Storage costs low.
