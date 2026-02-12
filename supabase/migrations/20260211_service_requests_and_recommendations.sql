-- MIGRATION: Add service_requests and recommendations tables
-- For the new concierge matching model

-- ============================================
-- NEW ENUM
-- ============================================

CREATE TYPE service_request_status AS ENUM ('pending', 'assigned', 'completed', 'cancelled');

-- ============================================
-- SERVICE_REQUESTS TABLE
-- ============================================

CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  service_slug TEXT NOT NULL,
  service_other TEXT,
  description TEXT,
  sector TEXT NOT NULL,
  urgency TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_whatsapp TEXT NOT NULL,
  client_email TEXT,
  status service_request_status DEFAULT 'pending',
  assigned_provider_id UUID REFERENCES providers(id),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_requests_status ON service_requests(status, created_at);
CREATE INDEX idx_service_requests_number ON service_requests(request_number);

-- ============================================
-- RECOMMENDATIONS TABLE
-- ============================================

CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_name TEXT NOT NULL,
  pro_service_type TEXT NOT NULL,
  pro_phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  why_recommend TEXT NOT NULL,
  recommender_name TEXT,
  recommender_email TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_status ON recommendations(status, created_at);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Public can insert
CREATE POLICY "public_create_service_request" ON service_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "public_create_recommendation" ON recommendations FOR INSERT WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "admin_all_service_requests" ON service_requests FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_recommendations" ON recommendations FOR ALL USING (is_admin()) WITH CHECK (is_admin());
