-- Add new vetting fields to registration_requests
ALTER TABLE registration_requests
  ADD COLUMN IF NOT EXISTS cedula_number TEXT,
  ADD COLUMN IF NOT EXISTS cedula_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS reference1_name TEXT,
  ADD COLUMN IF NOT EXISTS reference1_phone TEXT,
  ADD COLUMN IF NOT EXISTS reference2_name TEXT,
  ADD COLUMN IF NOT EXISTS reference2_phone TEXT;

-- The areas_served TEXT[] column already exists but was unused — it will now be populated.

-- Create storage bucket for registration uploads (run via Supabase dashboard if not using CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('registration-uploads', 'registration-uploads', true);
