-- =============================================================================
-- Baked by Iyah — OMS Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================================

-- ── 0. IMPORTANT SETUP NOTES ─────────────────────────────────────────────────
-- 1. In Supabase Dashboard → Authentication → Providers → Email:
--    Disable "Confirm email" so users can log in immediately after registering.
-- 2. After running this schema, create the admin account:
--    Dashboard → Authentication → Users → Add User
--    Email: iyah.admin@bakedbyiyah.com  Password: BakedByIyah@2026
--    Then see Section 7 at the bottom to promote them to ADMIN role.
-- 3. Add these to your .env (Vercel env vars too):
--    VITE_SUPABASE_URL=https://xxxx.supabase.co
--    VITE_SUPABASE_ANON_KEY=sb_publishable_...  (new key format) or eyJ... (legacy JWT)
--    NEVER use the service_role key in the frontend.


-- =============================================================================
-- 1. PROFILES (extends auth.users — stores name, role, phone)
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  phone_number  TEXT,
  role          TEXT        NOT NULL DEFAULT 'CUSTOMER',
  last_name_update BIGINT
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Allow the trigger (or service) to insert new profiles on sign-up
CREATE POLICY "Allow profile insert on signup"
  ON profiles FOR INSERT WITH CHECK (true);


-- =============================================================================
-- 1b. AUTO-PROFILE TRIGGER (Tip #2: Auth & User Data Sync)
-- =============================================================================
-- This function fires every time a new row is inserted in auth.users.
-- It creates a matching row in public.profiles using the metadata that was
-- passed during signUp (name, phone_number). This guarantees every user
-- (including those created via the Supabase dashboard) has a profile.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone_number, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER')
  )
  ON CONFLICT (id) DO NOTHING;  -- safe if register() also inserts
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- 2. PRODUCTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
  id          TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL,
  category    TEXT        NOT NULL,
  image       TEXT,
  stock       INTEGER     NOT NULL DEFAULT 0
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can read products
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete (admin enforced client-side)
CREATE POLICY "Authenticated users can modify products"
  ON products FOR ALL USING (auth.role() = 'authenticated');


-- =============================================================================
-- 3. ORDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id                TEXT      PRIMARY KEY,
  user_id           TEXT      NOT NULL,
  customer_name     TEXT,
  items             JSONB     NOT NULL DEFAULT '[]',
  total_amount      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status            TEXT      NOT NULL DEFAULT 'Pending',
  payment_method    TEXT,
  payment_proof     TEXT,
  delivery_method   TEXT,
  scheduled_date    TEXT,
  scheduled_time    TEXT,
  created_at        TEXT,
  customer_email    TEXT,
  customer_phone    TEXT,
  delivery_address  TEXT,
  is_custom_inquiry BOOLEAN   DEFAULT FALSE,
  custom_details    JSONB
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all orders (admin needs to see all; restricted further if needed)
CREATE POLICY "Authenticated users can read all orders"
  ON orders FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE USING (auth.role() = 'authenticated');


-- =============================================================================
-- 4. USER NOTIFICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_notifications (
  id           TEXT    PRIMARY KEY,
  user_id      TEXT    NOT NULL,
  message      TEXT,
  order_id     TEXT,
  order_status TEXT,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TEXT
);

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can read own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Authenticated users can insert notifications (admin writing to customer)
CREATE POLICY "Authenticated users can insert notifications"
  ON user_notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid()::TEXT = user_id);


-- =============================================================================
-- 5. REALTIME — enable live updates for notifications
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;


-- =============================================================================
-- 6. SEED — Initial product catalog
-- =============================================================================
INSERT INTO products (id, name, description, price, category, image, stock) VALUES
  ('p1', 'Classic Brookies',        'The perfect combination of brownies and cookies. A customer favorite!', 180, 'Cookies',  'https://picsum.photos/400/400?random=1', 20),
  ('p2', 'Banana Loaf',             'Moist and not too sweet banana bread, perfect for coffee.',             150, 'Pastries', 'https://picsum.photos/400/400?random=2', 15),
  ('p3', 'Chocolate Moist Cake',    'Rich chocolate cake that melts in your mouth.',                        450, 'Cakes',    'https://picsum.photos/400/400?random=3',  5),
  ('p4', 'Red Velvet Crinkles',     'Soft and chewy crinkles with cream cheese filling.',                   120, 'Cookies',  'https://picsum.photos/400/400?random=4',  0)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 7. ADMIN ACCOUNT PROFILE
-- The trigger above will create the profile row automatically when you create
-- the admin user in Dashboard → Authentication → Users, but it will default
-- to role='CUSTOMER'. Run the UPDATE below to promote them to ADMIN.
-- =============================================================================
-- Step 1: Create user in Dashboard → Authentication → Users
--   Email: iyah.admin@bakedbyiyah.com  |  Password: BakedByIyah@2026
--
-- Step 2: The trigger will auto-insert the profile. Then run this to promote:
--   UPDATE profiles
--   SET role = 'ADMIN', name = 'Iyah'
--   WHERE email = 'iyah.admin@bakedbyiyah.com';
