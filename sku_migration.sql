-- Run this command in your Supabase SQL Editor to add the SKU column to your products table

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku TEXT;

-- Optional: Create an index for faster searching by SKU
CREATE INDEX IF NOT EXISTS products_sku_idx ON products (sku);
