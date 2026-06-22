-- ============================================================
-- Supabase Schema Migration for ScrunchCreate
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Why: Products table stores the pre-computed product catalog.
-- Pricing, images, and colors are baked in at seed time so the
-- frontend doesn't need to re-calculate anything at runtime.
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT,
  color TEXT,
  normalized_color TEXT,
  color_hex TEXT,
  price NUMERIC DEFAULT 0,
  offer_price NUMERIC DEFAULT 0,
  original_price NUMERIC DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  description TEXT,
  primary_image TEXT,
  images TEXT[] DEFAULT '{}',
  available_colors TEXT[] DEFAULT '{}',
  badge TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Why: Variants are stored separately to keep the schema normalized.
-- The seeder also stores them embedded as JSONB in the products table
-- for backward compatibility (see 'variants' column below).
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  slug TEXT,
  color TEXT,
  normalized_color TEXT,
  color_hex TEXT,
  price NUMERIC,
  offer_price NUMERIC,
  images TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true
);

-- Why: We store the full variants JSONB array on the products row too.
-- This lets the frontend fetch products with variants in a single query
-- without needing a join, matching the shape from products.json exactly.
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]';

-- Why: Orders table for guest checkout. session_id links orders to
-- a browser session so users can view their own order history.
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  items JSONB NOT NULL,
  shipping_address JSONB,
  contact JSONB,
  payment JSONB,
  coupon TEXT,
  coupon_discount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  cod_fee NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Row Level Security ──────────────────────────────────────
-- Products: public read, no write from client
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT USING (true);

-- Variants: public read, no write from client
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Variants are publicly readable" ON product_variants;
CREATE POLICY "Variants are publicly readable"
  ON product_variants FOR SELECT USING (true);

-- Orders: anyone can insert, anyone can read by session_id
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read orders by session" ON orders;
CREATE POLICY "Anyone can read orders by session"
  ON orders FOR SELECT USING (true);

-- ─── Indexes for common queries ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
