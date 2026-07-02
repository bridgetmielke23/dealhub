-- Create store_locations table for custom store database
-- This allows us to build our own database of store locations
-- instead of relying solely on external APIs

CREATE TABLE IF NOT EXISTS store_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,
  store_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'overpass', 'google', 'other')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_store_locations_brand_name ON store_locations(brand_name);
CREATE INDEX IF NOT EXISTS idx_store_locations_state ON store_locations(state);
CREATE INDEX IF NOT EXISTS idx_store_locations_city ON store_locations(city);
CREATE INDEX IF NOT EXISTS idx_store_locations_location ON store_locations(lat, lng);
CREATE INDEX IF NOT EXISTS idx_store_locations_brand_state ON store_locations(brand_name, state);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_store_locations_updated_at
  BEFORE UPDATE ON store_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE store_locations IS 'Custom database of store locations for nationwide search';
COMMENT ON COLUMN store_locations.brand_name IS 'The brand/chain name (e.g., Starbucks, McDonald''s)';
COMMENT ON COLUMN store_locations.source IS 'Where this location data came from: manual, overpass, google, other';
COMMENT ON COLUMN store_locations.verified IS 'Whether this location has been manually verified';

