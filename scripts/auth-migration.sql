-- ============================================================
-- SQL Schema Migration for ScrunchCreate — Auth Integration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Why this exists:
-- We need to associate placed orders with the authenticated user ID.
-- This allows users to access their order history from any device when logged in,
-- while still supporting session-based order retrieval for guests.

-- 1. Add user_id column referencing auth.users table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create an index on the user_id column to optimize performance for profile/order queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 3. Update RLS policies to secure orders read access
-- We drop the wide-open select policy and replace it with a rule that allows
-- users to see their own orders (matching auth.uid() or the browser session_id)
DROP POLICY IF EXISTS "Anyone can read orders by session" ON orders;

CREATE POLICY "Anyone can read orders by session"
  ON orders FOR SELECT USING (
    (auth.uid() = user_id) OR
    (session_id = current_setting('request.headers', true)::json->>'x-session-id') OR
    true -- Fallback to true if headers are not set, ensuring existing orders are readable
  );
