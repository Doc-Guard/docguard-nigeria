-- Migration: Add identifier column and unique constraint to kyc_requests
-- This ensures BVN, RC, TIN numbers are unique per verification type

-- Add identifier column if not exists
ALTER TABLE kyc_requests ADD COLUMN IF NOT EXISTS identifier text;

-- Create unique index on verification_type + identifier (only for Verified status)
-- This ensures the same BVN/RC/TIN can't be verified twice
CREATE UNIQUE INDEX IF NOT EXISTS kyc_unique_verified_identifier 
ON kyc_requests (verification_type, identifier) 
WHERE status = 'Verified';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS kyc_identifier_lookup 
ON kyc_requests (identifier, status);

-- Comment: Each identifier (BVN, RC Number, TIN) can only be verified once.
-- Subsequent attempts to verify the same identifier will be blocked at application level.
