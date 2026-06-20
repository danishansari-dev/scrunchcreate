-- ============================================================
-- SQL Schema Migration for ScrunchCreate — Cart & Wishlist
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Why: Store user cart items securely in the database for logged-in users,
-- enabling cross-device cart persistence.
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- Why: Store user wishlist items securely in the database for logged-in users,
-- enabling cross-device wishlist persistence.
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- ─── Row Level Security ──────────────────────────────────────

-- Enable RLS for cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own cart items" ON cart_items;
CREATE POLICY "Users can manage their own cart items"
  ON cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable RLS for wishlist_items
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own wishlist items" ON wishlist_items;
CREATE POLICY "Users can manage their own wishlist items"
  ON wishlist_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Indexes for common queries ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON wishlist_items(user_id);
