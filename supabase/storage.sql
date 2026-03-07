-- =============================================================================
-- Baked by Iyah — Supabase Storage Buckets
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Run AFTER schema.sql
-- =============================================================================

-- ── OVERVIEW ──────────────────────────────────────────────────────────────────
-- Two private buckets are created:
--
--   payment-receipts       → compressed GCash screenshots uploaded at Checkout
--                            Path pattern: {userId}/{orderId}.jpg
--
--   custom-cake-references → compressed reference images attached to custom
--                            cake inquiries submitted via the Custom Cake page
--                            Path pattern: {userId}/{orderId}-ref.jpg
--
-- Both buckets are private (not public). Signed URLs (1-hour TTL) are generated
-- server-side and stored as the paymentProof / customDetails.referenceImage
-- value in the orders table. Admins can also read any file via signed URLs.
-- =============================================================================


-- =============================================================================
-- 1. CREATE BUCKETS
--    Run each INSERT separately if you already created one of them.
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'payment-receipts',
    'payment-receipts',
    false,                        -- private bucket
    2097152,                      -- 2 MB max per file (post-compression)
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'custom-cake-references',
    'custom-cake-references',
    false,                        -- private bucket
    2097152,                      -- 2 MB max per file (post-compression)
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 2. ROW-LEVEL SECURITY — payment-receipts
-- =============================================================================

-- Customers can upload their own receipts.
-- Path must start with their own user ID so no one can overwrite another user's files.
CREATE POLICY "Customers can upload own payment receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Customers can read (download / get signed URL for) only their own receipts.
CREATE POLICY "Customers can read own payment receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Admins can read ALL payment receipts (to verify payments).
CREATE POLICY "Admins can read all payment receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can delete payment receipts (cleanup).
CREATE POLICY "Admins can delete payment receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );


-- =============================================================================
-- 3. ROW-LEVEL SECURITY — custom-cake-references
-- =============================================================================

-- Customers can upload their own reference images.
CREATE POLICY "Customers can upload own cake reference images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'custom-cake-references'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Customers can read only their own reference images.
CREATE POLICY "Customers can read own cake reference images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'custom-cake-references'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Admins can read ALL reference images.
CREATE POLICY "Admins can read all cake reference images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'custom-cake-references'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can delete reference images (cleanup).
CREATE POLICY "Admins can delete cake reference images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'custom-cake-references'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
