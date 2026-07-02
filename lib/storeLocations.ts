/**
 * Store Locations Database Management
 * Manages a custom database of store locations for reliable nationwide search
 */

import { supabaseAdmin } from './supabase';

export interface StoreLocation {
  id?: string;
  brandName: string;
  storeName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  lat: number;
  lng: number;
  source?: 'manual' | 'overpass' | 'google' | 'other';
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Search for stores in our database by brand name
 */
export async function searchStoresInDatabase(
  brandName: string,
  options: {
    state?: string;
    city?: string;
    limit?: number;
  } = {}
): Promise<StoreLocation[]> {
  if (!supabaseAdmin) {
    console.warn('Supabase not configured');
    return [];
  }

  try {
    let query = supabaseAdmin
      .from('store_locations')
      .select('*')
      .ilike('brand_name', `%${brandName}%`);

    if (options.state) {
      query = query.ilike('state', `%${options.state}%`);
    }

    if (options.city) {
      query = query.ilike('city', `%${options.city}%`);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query.order('brand_name', { ascending: true });

    if (error) {
      console.error('Error searching stores in database:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      brandName: row.brand_name,
      storeName: row.store_name || row.brand_name,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      lat: row.lat,
      lng: row.lng,
      source: row.source,
      verified: row.verified,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    }));
  } catch (error) {
    console.error('Error in searchStoresInDatabase:', error);
    return [];
  }
}

/**
 * Save a store location to the database
 */
export async function saveStoreLocation(store: StoreLocation): Promise<StoreLocation | null> {
  if (!supabaseAdmin) {
    console.warn('Supabase not configured');
    return null;
  }

  try {
    const dbRow: any = {
      brand_name: store.brandName,
      store_name: store.storeName,
      address: store.address || null,
      city: store.city || null,
      state: store.state || null,
      zip_code: store.zipCode || null,
      lat: store.lat,
      lng: store.lng,
      source: store.source || 'manual',
      verified: store.verified || false,
    };

    // Check if store already exists (same brand, lat/lng within 0.001 degrees)
    const { data: existing } = await supabaseAdmin
      .from('store_locations')
      .select('*')
      .ilike('brand_name', store.brandName)
      .gte('lat', store.lat - 0.001)
      .lte('lat', store.lat + 0.001)
      .gte('lng', store.lng - 0.001)
      .lte('lng', store.lng + 0.001)
      .limit(1)
      .single();

    if (existing) {
      // Update existing store
      const { data, error } = await supabaseAdmin
        .from('store_locations')
        .update({
          ...dbRow,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbRowToStoreLocation(data) : null;
    } else {
      // Insert new store
      const { data, error } = await supabaseAdmin
        .from('store_locations')
        .insert(dbRow)
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbRowToStoreLocation(data) : null;
    }
  } catch (error) {
    console.error('Error saving store location:', error);
    return null;
  }
}

/**
 * Bulk save store locations
 */
export async function bulkSaveStoreLocations(
  stores: StoreLocation[],
  brandName: string
): Promise<{ saved: number; skipped: number; errors: number }> {
  if (!supabaseAdmin) {
    return { saved: 0, skipped: 0, errors: stores.length };
  }

  let saved = 0;
  let skipped = 0;
  let errors = 0;

  for (const store of stores) {
    try {
      const result = await saveStoreLocation({
        ...store,
        brandName: store.brandName || brandName,
        source: store.source || 'overpass',
      });
      if (result) {
        saved++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error('Error saving store:', error);
      errors++;
    }
  }

  return { saved, skipped, errors };
}

/**
 * Map database row to StoreLocation
 */
function mapDbRowToStoreLocation(row: any): StoreLocation {
  return {
    id: row.id,
    brandName: row.brand_name,
    storeName: row.store_name || row.brand_name,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    lat: row.lat,
    lng: row.lng,
    source: row.source,
    verified: row.verified,
    createdAt: row.created_at ? new Date(row.created_at) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  };
}

/**
 * Get store count by brand
 */
export async function getStoreCountByBrand(brandName: string): Promise<number> {
  if (!supabaseAdmin) return 0;

  try {
    const { count, error } = await supabaseAdmin
      .from('store_locations')
      .select('*', { count: 'exact', head: true })
      .ilike('brand_name', `%${brandName}%`);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting store count:', error);
    return 0;
  }
}

