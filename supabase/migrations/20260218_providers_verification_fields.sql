-- Add verification fields to providers table (mirrors registration_requests)
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS cedula_number TEXT,
  ADD COLUMN IF NOT EXISTS cedula_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS reference1_name TEXT,
  ADD COLUMN IF NOT EXISTS reference1_phone TEXT,
  ADD COLUMN IF NOT EXISTS reference2_name TEXT,
  ADD COLUMN IF NOT EXISTS reference2_phone TEXT,
  ADD COLUMN IF NOT EXISTS areas_served TEXT[];
