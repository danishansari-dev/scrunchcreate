-- ============================================================
-- SQL Schema Migration for ScrunchCreate — Order Tracking & Realtime
-- Adds tracking columns to the orders table and enables realtime sync.
-- ============================================================

-- 1. Add tracking columns to orders table
-- Why: Allows admins to associate a shipping tracking number and tracking URL with dispatched orders.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- 2. Enable Realtime for orders table
-- Why: Allows clients (like the admin dashboard) to receive instant updates when orders are created or updated.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_publication_rel pr 
      JOIN pg_class c ON pr.prrelid = c.oid 
      WHERE c.relname = 'orders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE orders;
    END IF;
  END IF;
END $$;
