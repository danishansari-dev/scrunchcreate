-- ============================================================
-- SQL Schema Migration for ScrunchCreate — Admin Access Control
-- Decouples admin checks into a centralized is_admin() database function.
-- ============================================================

-- 1. Create or replace the is_admin() function
-- Why: Centralizing admin authorization logic makes it easy to migrate from
-- an email allowlist to a database-driven roles table in the future without
-- having to rewrite table-level RLS policies.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the email claim in the user's JWT matches any allowed admin email
  -- Why: Using auth.email() is the standard Supabase helper for retrieving the email claim.
  -- Removing SECURITY DEFINER ensures the function runs as SECURITY INVOKER, retaining
  -- the session JWT claims context during RLS evaluations.
  RETURN auth.email() IN ('user_verified_1730@example.com');
END;
$$ LANGUAGE plpgsql;

-- 2. Configure RLS write policies on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 3. Configure RLS write policies on product_variants table
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage product variants" ON product_variants;
CREATE POLICY "Admins can manage product variants"
  ON product_variants FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 4. Configure RLS update policies on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
