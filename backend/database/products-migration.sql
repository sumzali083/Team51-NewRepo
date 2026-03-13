-- Add original_price column to support sale pricing on real products.
-- Run this once against cs2team51_db.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2) NULL DEFAULT NULL;

-- Example: mark existing products as on sale
-- UPDATE products SET original_price = price * 1.67 WHERE sku IN ('m-001', 'm-003', 'w-001', 'w-002', 'k-001', 'k-003');
