-- Migration: Create Properties/Real Estate Tables for EcuaCasa
-- Date: 2024-03-01
-- Description: Creates tables for the real estate marketplace feature

-- Enable PostGIS extension for geographic data (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create property_agents table
CREATE TABLE IF NOT EXISTS property_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    photo_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    response_time VARCHAR(50), -- e.g., '< 2 horas', 'Mismo día'
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    bio_es TEXT,
    bio_en TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, pending, inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on agent status
CREATE INDEX idx_property_agents_status ON property_agents(status);
CREATE INDEX idx_property_agents_verified ON property_agents(verified);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,

    -- Localized content
    title_es VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    description_es TEXT NOT NULL,
    description_en TEXT,

    -- Property details
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('terreno', 'casa', 'departamento')),
    price DECIMAL(12, 2) NOT NULL,
    price_per_m2 DECIMAL(10, 2),
    size_m2 INTEGER NOT NULL,

    -- Location
    sector VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326), -- PostGIS point for lat/lng
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),

    -- Utilities
    has_agua BOOLEAN DEFAULT FALSE,
    has_luz BOOLEAN DEFAULT FALSE,
    has_alcantarillado BOOLEAN DEFAULT FALSE,
    has_via BOOLEAN DEFAULT FALSE,

    -- Documents verification
    doc_iprus BOOLEAN DEFAULT FALSE,
    doc_certificado_gravamenes BOOLEAN DEFAULT FALSE,
    doc_escritura BOOLEAN DEFAULT FALSE,
    doc_linea_fabrica BOOLEAN DEFAULT FALSE,
    doc_levantamiento_topografico BOOLEAN DEFAULT FALSE,

    -- Verification status
    verified BOOLEAN DEFAULT FALSE,
    gps_verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,

    -- Agent relationship
    agent_id UUID REFERENCES property_agents(id) ON DELETE SET NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, pending, sold, inactive

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for common queries
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_sector ON properties(sector);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_verified ON properties(verified);
CREATE INDEX idx_properties_featured ON properties(featured);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_slug ON properties(slug);

-- Spatial index for geographic queries
CREATE INDEX idx_properties_coordinates ON properties USING GIST(coordinates);

-- Create property_photos table
CREATE TABLE IF NOT EXISTS property_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    watermarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on property photos
CREATE INDEX idx_property_photos_property ON property_photos(property_id);
CREATE INDEX idx_property_photos_primary ON property_photos(property_id, is_primary);

-- Create property_inquiries table (for tracking contact requests)
CREATE TABLE IF NOT EXISTS property_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES property_agents(id) ON DELETE SET NULL,

    -- Inquiry details
    contact_method VARCHAR(20) DEFAULT 'whatsapp', -- whatsapp, phone, email
    source VARCHAR(50), -- listing_page, map_view, featured, etc.
    referrer TEXT,

    -- User info (optional, for future verified buyer feature)
    user_name VARCHAR(255),
    user_phone VARCHAR(50),
    user_email VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on inquiries
CREATE INDEX idx_property_inquiries_property ON property_inquiries(property_id);
CREATE INDEX idx_property_inquiries_agent ON property_inquiries(agent_id);
CREATE INDEX idx_property_inquiries_created ON property_inquiries(created_at);

-- Create property_favorites table (for future feature)
CREATE TABLE IF NOT EXISTS property_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID, -- Will link to auth.users when Clerk integration is done
    session_id VARCHAR(255), -- For anonymous users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

    -- Ensure unique favorites per user/session
    UNIQUE(property_id, user_id),
    UNIQUE(property_id, session_id)
);

-- Create index on favorites
CREATE INDEX idx_property_favorites_property ON property_favorites(property_id);
CREATE INDEX idx_property_favorites_user ON property_favorites(user_id);

-- Create cuenca_sectors reference table
CREATE TABLE IF NOT EXISTS cuenca_sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    name_en VARCHAR(100),
    description_es TEXT,
    description_en TEXT,
    center_lat DECIMAL(10, 7),
    center_lng DECIMAL(10, 7),
    polygon GEOGRAPHY(POLYGON, 4326), -- Optional: sector boundary
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0
);

-- Insert Cuenca sectors
INSERT INTO cuenca_sectors (name, name_en, center_lat, center_lng, display_order) VALUES
    ('San Joaquín', 'San Joaquín', -2.8789, -79.0490, 1),
    ('Baños', 'Baños', -2.9189, -79.0678, 2),
    ('Ricaurte', 'Ricaurte', -2.8612, -78.9534, 3),
    ('Challuabamba', 'Challuabamba', -2.8695, -78.9201, 4),
    ('Turi', 'Turi', -2.9189, -79.0112, 5),
    ('El Valle', 'El Valle', -2.9367, -78.9789, 6),
    ('Sayausí', 'Sayausí', -2.8678, -79.0789, 7),
    ('Nulti', 'Nulti', -2.8789, -78.8989, 8)
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_agents_updated_at
    BEFORE UPDATE ON property_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate price_per_m2 automatically
CREATE OR REPLACE FUNCTION calculate_price_per_m2()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.size_m2 > 0 THEN
        NEW.price_per_m2 = NEW.price / NEW.size_m2;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for price_per_m2 calculation
CREATE TRIGGER calculate_properties_price_per_m2
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION calculate_price_per_m2();

-- Create function to set coordinates from lat/lng
CREATE OR REPLACE FUNCTION set_coordinates_from_lat_lng()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.coordinates = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for coordinates
CREATE TRIGGER set_properties_coordinates
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION set_coordinates_from_lat_lng();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuenca_sectors ENABLE ROW LEVEL SECURITY;

-- Public read access for active properties
CREATE POLICY "Public can view active properties"
    ON properties FOR SELECT
    USING (status = 'active');

-- Public read access for active agents
CREATE POLICY "Public can view active agents"
    ON property_agents FOR SELECT
    USING (status = 'active');

-- Public read access for property photos
CREATE POLICY "Public can view property photos"
    ON property_photos FOR SELECT
    USING (
        property_id IN (SELECT id FROM properties WHERE status = 'active')
    );

-- Public can insert inquiries
CREATE POLICY "Public can create inquiries"
    ON property_inquiries FOR INSERT
    WITH CHECK (true);

-- Public read access for sectors
CREATE POLICY "Public can view sectors"
    ON cuenca_sectors FOR SELECT
    USING (active = true);

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites"
    ON property_favorites FOR ALL
    USING (
        user_id = auth.uid() OR session_id IS NOT NULL
    );

-- Comments for documentation
COMMENT ON TABLE properties IS 'Real estate listings for EcuaCasa marketplace';
COMMENT ON TABLE property_agents IS 'Verified real estate agents';
COMMENT ON TABLE property_photos IS 'Property listing photos with watermark support';
COMMENT ON TABLE property_inquiries IS 'Contact inquiry tracking for analytics';
COMMENT ON TABLE property_favorites IS 'User saved/favorited properties';
COMMENT ON TABLE cuenca_sectors IS 'Reference table for Cuenca sectors/neighborhoods';

COMMENT ON COLUMN properties.coordinates IS 'PostGIS geography point for lat/lng';
COMMENT ON COLUMN properties.gps_verified IS 'Whether the exact GPS location has been verified on-site';
COMMENT ON COLUMN property_photos.watermarked IS 'Whether the photo has EcuaCasa watermark applied';
