-- COMPLETE DATABASE SETUP FOR ECUACASA
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: DROP OLD TABLES
-- ============================================

DROP TABLE IF EXISTS contact_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS registration_requests CASCADE;
DROP TABLE IF EXISTS provider_locations CASCADE;
DROP TABLE IF EXISTS provider_services CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS provider_status CASCADE;
DROP TYPE IF EXISTS registration_status CASCADE;

-- Drop function if exists
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- ============================================
-- STEP 2: CREATE ENUMS
-- ============================================

CREATE TYPE provider_status AS ENUM ('active', 'pending', 'inactive');
CREATE TYPE registration_status AS ENUM ('pending', 'contacted', 'approved', 'rejected');

-- ============================================
-- STEP 3: CREATE TABLES
-- ============================================

-- 1. SERVICES
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LOCATIONS (Neighborhoods in Cuenca)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT, -- Optional English name
  latitude DECIMAL(10, 8), -- For future map feature
  longitude DECIMAL(11, 8),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROVIDERS
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  photo_url TEXT,
  description_es TEXT,
  description_en TEXT,
  price_range TEXT,
  response_time TEXT,
  speaks_english BOOLEAN DEFAULT FALSE,
  years_experience INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status provider_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROVIDER_SERVICES
CREATE TABLE provider_services (
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, service_id)
);

-- 5. PROVIDER_LOCATIONS
CREATE TABLE provider_locations (
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, location_id)
);

-- 6. REGISTRATION_REQUESTS
CREATE TABLE registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  services_interested TEXT[],
  areas_served TEXT[],
  speaks_english BOOLEAN DEFAULT FALSE,
  message TEXT,
  status registration_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  service_type TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADMIN_USERS
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONTACT LOGS
CREATE TABLE contact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  service_type TEXT,
  referrer TEXT,
  contacted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_logs_provider ON contact_logs(provider_id);
CREATE INDEX idx_contact_logs_contacted_at ON contact_logs(contacted_at);

-- ============================================
-- STEP 4: CREATE INDEXES
-- ============================================

CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_featured ON providers(featured, status);
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_provider_services_service ON provider_services(service_id);
CREATE INDEX idx_provider_locations_location ON provider_locations(location_id);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_registration_status ON registration_requests(status, created_at);

-- ============================================
-- STEP 5: ENABLE RLS
-- ============================================

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: CREATE HELPER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 7: CREATE RLS POLICIES
-- ============================================

-- PUBLIC READ POLICIES
CREATE POLICY "public_view_active_providers" ON providers FOR SELECT USING (status = 'active');
CREATE POLICY "public_view_services" ON services FOR SELECT USING (true);
CREATE POLICY "public_view_locations" ON locations FOR SELECT USING (true);
CREATE POLICY "public_view_provider_services" ON provider_services FOR SELECT
  USING (EXISTS (SELECT 1 FROM providers WHERE providers.id = provider_services.provider_id AND providers.status = 'active'));
CREATE POLICY "public_view_provider_locations" ON provider_locations FOR SELECT
  USING (EXISTS (SELECT 1 FROM providers WHERE providers.id = provider_locations.provider_id AND providers.status = 'active'));
CREATE POLICY "public_view_reviews" ON reviews FOR SELECT USING (verified = true);

-- PUBLIC WRITE POLICIES
CREATE POLICY "public_create_registration" ON registration_requests FOR INSERT WITH CHECK (true);

-- ADMIN POLICIES
CREATE POLICY "admin_all_providers" ON providers FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_provider_services" ON provider_services FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_provider_locations" ON provider_locations FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_services" ON services FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_locations" ON locations FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_registrations" ON registration_requests FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_reviews" ON reviews FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_view_admin_users" ON admin_users FOR SELECT USING (is_admin());

-- ============================================
-- STEP 8: SEED DATA
-- ============================================

-- Services
INSERT INTO services (slug, name_es, name_en, icon, display_order) VALUES
('plomeria', 'Plomería', 'Plumbing', 'wrench', 1),
('electricidad', 'Electricidad', 'Electrical', 'zap', 2),
('limpieza', 'Limpieza del Hogar', 'House Cleaning', 'sparkles', 3),
('jardineria', 'Jardinería', 'Gardening', 'leaf', 4),
('pintura', 'Pintura', 'Painting', 'paintbrush', 5),
('carpinteria', 'Carpintería', 'Carpentry', 'hammer', 6),
('cerrajeria', 'Cerrajería', 'Locksmith', 'key', 7),
('aire', 'Aire Acondicionado', 'Air Conditioning', 'wind', 8),
('mudanzas', 'Mudanzas', 'Moving', 'truck', 9),
('handyman', 'Servicios Generales', 'Handyman', 'wrench', 10);

-- Locations
INSERT INTO locations (slug, name, display_order) VALUES
('el-centro', 'El Centro', 1),
('gringolandia', 'Gringolandia', 2),
('yanuncay', 'Yanuncay', 3),
('el-vergel', 'El Vergel', 4),
('totoracocha', 'Totoracocha', 5),
('miraflores', 'Miraflores', 6),
('todos-santos', 'Todos Santos', 7),
('san-blas', 'San Blas', 8),
('ordoñez-laso', 'Ordóñez Laso', 9),
('todas-las-zonas', 'Todas las Zonas', 10);

-- ANALYTICS EVENTS
CREATE TABLE analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  page text,
  provider_slug text,
  service_slug text,
  referrer text,
  user_agent text,
  locale text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

-- Admin User
INSERT INTO admin_users (email) VALUES ('maldonado7@hotmail.com');
