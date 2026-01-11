-- Database Migration: Add created_at columns for consistency
-- Author: kelexine (https://github.com/kelexine)
-- Date: 2026-01-11
-- Purpose: Ensure all tables have created_at timestamps for audit trails

-- Add created_at to profiles table (currently only has updated_at)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now());

-- Add created_at to filings table (currently only has submission_date and updated_at)
-- This provides a separate audit trail from the submission_date
ALTER TABLE filings 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now());

-- Add created_at to kyc_requests if missing
ALTER TABLE kyc_requests 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now());

-- Add created_at to signatures if missing
ALTER TABLE signatures 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now());

-- notifications already has created_at in its schema (see 20260102_notifications.sql)

-- Update existing records to set created_at = updated_at for historical data
-- (Only for records where created_at is NULL after adding the column)

-- profiles: has updated_at
UPDATE profiles 
SET created_at = COALESCE(updated_at, timezone('utc'::text, now()))
WHERE created_at IS NULL;

-- filings: has submission_date and updated_at
UPDATE filings 
SET created_at = COALESCE(submission_date, updated_at, timezone('utc'::text, now()))
WHERE created_at IS NULL;

-- kyc_requests: only has created_at (which we just added), no updated_at
-- No update needed since the column has a default value

-- signatures: has signed_at timestamp
UPDATE signatures 
SET created_at = COALESCE(signed_at, timezone('utc'::text, now()))
WHERE created_at IS NULL;

-- notifications: check schema to determine correct timestamp column
-- Skipping update for now - table may not exist or has different structure

-- Verify the changes
SELECT 
    'profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(created_at) as records_with_created_at
FROM profiles
UNION ALL
SELECT 
    'filings',
    COUNT(*),
    COUNT(created_at)
FROM filings
UNION ALL
SELECT 
    'kyc_requests',
    COUNT(*),
    COUNT(created_at)
FROM kyc_requests
UNION ALL
SELECT 
    'signatures',
    COUNT(*),
    COUNT(created_at)
FROM signatures;
