# Store Locations Database Setup

## Overview

This solution creates a custom database of store locations in Supabase, providing a reliable alternative to external APIs like Overpass. The system uses a **database-first approach** with API fallback.

## How It Works

1. **Database First**: Searches our custom database (fast, reliable)
2. **API Fallback**: If no database results, uses Overpass API
3. **Auto-Save**: Optionally saves API results to database for future searches
4. **Manual Entry**: Admins can manually add stores to the database

## Setup Instructions

### Step 1: Create the Database Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create store_locations table
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

-- Create function to update updated_at timestamp
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
```

Or use the migration file: `supabase_migrations/create_store_locations.sql`

### Step 2: Verify Setup

The code will automatically use the database once the table exists. No additional configuration needed!

## Usage in Admin Panel

### Nationwide Search Flow:

1. **Enter Brand Name**: Type the exact brand name (e.g., "Starbucks")
2. **Search**: 
   - First searches database (instant)
   - If no results, searches Overpass API (30-60 seconds)
   - Optionally saves API results to database
3. **Select Locations**: Click to select locations
4. **Manual Entry**: Use "Add Store Manually" to add stores that aren't found

### Features:

- ✅ **Database Search**: Fast, reliable searches from your custom database
- ✅ **API Fallback**: Automatically uses Overpass if database has no results
- ✅ **Auto-Save**: Checkbox to save API results to database
- ✅ **Manual Entry**: Add stores manually with full address details
- ✅ **Bulk Save**: "Save All to DB" button to save all found locations
- ✅ **Deduplication**: Automatically prevents duplicate entries

## Building Your Database

### Option 1: Let It Build Automatically
- Search for stores using Overpass API
- Check "Save API results to database"
- Results are automatically saved for future searches

### Option 2: Manual Entry
- Use "Add Store Manually" section
- Enter store details
- Click "Save Store to Database"

### Option 3: Bulk Import (Future)
- Import CSV files
- Use API to bulk import stores

## Benefits

1. **Reliability**: No dependency on external APIs
2. **Speed**: Database searches are instant
3. **Control**: You own the data
4. **Accuracy**: Manual verification possible
5. **Scalability**: Can grow your database over time

## Troubleshooting

**No results found?**
- Check if the `store_locations` table exists in Supabase
- Verify Supabase connection in environment variables
- Try manual entry to test database connectivity

**API still not working?**
- Database will still work for manually added stores
- Use manual entry for stores you need
- Database grows over time as you add stores

