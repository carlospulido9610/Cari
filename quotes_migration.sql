-- Run this in Supabase SQL Editor to support the new features

-- 1. Add 'items' column to quotes to store the cart details as JSON
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS items JSONB;

-- 2. Ensure the sku column exists (from previous step, just in case)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku TEXT;
