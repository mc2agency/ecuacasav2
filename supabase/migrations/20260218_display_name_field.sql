-- Add display_name column to registration_requests
-- This is the public-facing name shown on provider cards and profiles
ALTER TABLE registration_requests
  ADD COLUMN IF NOT EXISTS display_name TEXT;
