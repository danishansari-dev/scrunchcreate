-- ============================================================
-- SQL Schema Migration for ScrunchCreate — Product Inventory
-- Adds numerical stock levels to products and product variants,
-- and creates an RPC function to atomically check and decrement
-- stock during checkout.
-- ============================================================

-- 1. Add stock column to products
-- Why: Simple products (without variants) track their stock directly on the products table.
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 20;

-- 2. Add stock column to product_variants
-- Why: Variant products track stock individually per color/style on this table.
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 20;

-- 3. Migrate existing JSONB variants embedded on the products rows
-- Why: The frontend reads nested variants from the variants JSONB column in products table.
-- We must ensure every variant object in that array contains 'stock' and 'inStock' properties.
CREATE OR REPLACE FUNCTION initialize_variants_jsonb_stock()
RETURNS VOID AS $$
DECLARE
  prod_row RECORD;
  var_elem JSONB;
  new_variants JSONB;
BEGIN
  FOR prod_row IN SELECT id, variants FROM products LOOP
    IF prod_row.variants IS NOT NULL AND jsonb_array_length(prod_row.variants) > 0 THEN
      new_variants := '[]'::jsonb;
      FOR var_elem IN SELECT jsonb_array_elements(prod_row.variants) LOOP
        -- Inject stock: 20 and inStock: true into each variant object if 'stock' is not present
        IF NOT (var_elem ? 'stock') THEN
          var_elem := var_elem || '{"stock": 20, "inStock": true}'::jsonb;
        END IF;
        new_variants := new_variants || jsonb_build_array(var_elem);
      END LOOP;
      UPDATE products SET variants = new_variants WHERE id = prod_row.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT initialize_variants_jsonb_stock();
DROP FUNCTION initialize_variants_jsonb_stock();

-- 4. Central atomic stock decrement RPC function
-- Why: Performs atomic validation and updates inside a single database transaction,
-- preventing race conditions / overselling when multiple checkouts occur concurrently.
-- Accepts a JSONB array of items: [{"id": "prod_1", "quantity": 1}, ...]
CREATE OR REPLACE FUNCTION place_order_decrement_stock(order_items JSONB)
RETURNS VOID AS $$
DECLARE
  item RECORD;
  p_stock INTEGER;
  v_stock INTEGER;
  v_prod_id TEXT;
  var_elem JSONB;
  new_variants JSONB;
BEGIN
  -- Iterate through each item in the order
  FOR item IN SELECT * FROM jsonb_to_recordset(order_items) AS x(id TEXT, quantity INTEGER) LOOP
    
    -- Check if it matches a variant in product_variants
    SELECT stock, product_id INTO v_stock, v_prod_id
    FROM product_variants
    WHERE id = item.id;
    
    IF FOUND THEN
      -- Validate variant stock
      IF v_stock < item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for variant %', item.id;
      END IF;
      
      -- Update variant row
      UPDATE product_variants
      SET stock = stock - item.quantity,
          in_stock = CASE WHEN stock - item.quantity <= 0 THEN false ELSE in_stock END
      WHERE id = item.id;
      
      -- Update variants array in parent products row (so getProducts() gets fresh stock)
      SELECT variants INTO new_variants FROM products WHERE id = v_prod_id;
      IF FOUND AND new_variants IS NOT NULL THEN
        DECLARE
          temp_arr JSONB := '[]'::jsonb;
          updated_stock INTEGER;
        BEGIN
          FOR var_elem IN SELECT jsonb_array_elements(new_variants) LOOP
            IF var_elem->>'id' = item.id THEN
              updated_stock := (var_elem->>'stock')::int - item.quantity;
              var_elem := jsonb_set(var_elem, '{stock}', to_jsonb(updated_stock));
              IF updated_stock <= 0 THEN
                var_elem := jsonb_set(var_elem, '{inStock}', 'false'::jsonb);
              END IF;
            END IF;
            temp_arr := temp_arr || jsonb_build_array(var_elem);
          END LOOP;
          new_variants := temp_arr;
        END;
        
        UPDATE products
        SET variants = new_variants
        WHERE id = v_prod_id;
      END IF;
      
    ELSE
      -- Check if it matches a parent product in products table
      SELECT stock INTO p_stock
      FROM products
      WHERE id = item.id;
      
      IF FOUND THEN
        -- Validate parent product stock
        IF p_stock < item.quantity THEN
          RAISE EXCEPTION 'Insufficient stock for product %', item.id;
        END IF;
        
        -- Update products row
        UPDATE products
        SET stock = stock - item.quantity,
            in_stock = CASE WHEN stock - item.quantity <= 0 THEN false ELSE in_stock END
        WHERE id = item.id;
      ELSE
        RAISE EXCEPTION 'Product or variant with ID % not found', item.id;
      END IF;
    END IF;
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;
