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

-- Create PRIVATE storage bucket for registration uploads (run via Supabase dashboard if not using CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('registration-uploads', 'registration-uploads', false);
--
-- IMPORTANT: This bucket is PRIVATE. Files are served through /api/admin/storage (admin-only proxy).
-- If the bucket was previously created as public, update it:
-- UPDATE storage.buckets SET public = false WHERE id = 'registration-uploads';
--
-- No public RLS policies should exist on this bucket. Only the service_role key can access files.
