-- EcuaCasa Database Schema (Fresh Start)
-- Created: 2025-12-30

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE provider_status AS ENUM ('active', 'pending', 'inactive');
CREATE TYPE registration_status AS ENUM ('pending', 'contacted', 'approved', 'rejected');

-- ============================================
-- TABLES
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

-- 2. LOCATIONS
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  coordinates POINT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROVIDERS
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  photo_url TEXT,

  -- Professional Info
  description_es TEXT,
  description_en TEXT,
  price_range TEXT,
  response_time TEXT,
  speaks_english BOOLEAN DEFAULT FALSE,
  years_experience INTEGER,

  -- Trust Signals
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Status
  status provider_status DEFAULT 'pending',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROVIDER_SERVICES (many-to-many)
CREATE TABLE provider_services (
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, service_id)
);

-- 5. PROVIDER_LOCATIONS (many-to-many)
CREATE TABLE provider_locations (
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, location_id)
);

-- 6. REGISTRATION_REQUESTS
CREATE TABLE registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Applicant Info
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,

  -- Details
  services_interested TEXT[],
  areas_served TEXT[],
  speaks_english BOOLEAN DEFAULT FALSE,
  message TEXT,

  -- Admin Fields
  status registration_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REVIEWS (Phase 2 - create now, use later)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,

  -- Review Data
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  service_type TEXT,

  -- Verification
  verified BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADMIN_USERS (for access control)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_featured ON providers(featured, status);
CREATE INDEX idx_providers_slug ON providers(slug);

CREATE INDEX idx_provider_services_service ON provider_services(service_id);
CREATE INDEX idx_provider_locations_location ON provider_locations(location_id);

CREATE INDEX idx_reviews_provider ON reviews(provider_id);

CREATE INDEX idx_registration_status ON registration_requests(status, created_at);

-- CONTACT LOGS
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
