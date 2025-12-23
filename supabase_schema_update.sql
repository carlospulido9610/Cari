-- Run these commands in your Supabase SQL Editor to add the missing columns

-- Add 'attended' column to contact_requests table
ALTER TABLE contact_requests 
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT FALSE;

-- Add 'attended' column to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT FALSE;
