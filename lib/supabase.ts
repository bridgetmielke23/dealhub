/**
 * Supabase client configuration
 * Uses environment variables for connection
 * Optimized for Vercel serverless environment
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Deal } from '@/types/deal';

// Supabase connection - validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not configured. Some features may not work.');
}

// Client-side Supabase client (for browser)
// Only create if we have the required keys
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Server-side Supabase client (for API routes with admin access)
// Only create if we have all required keys
export const supabaseAdmin: SupabaseClient | null = 
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

/**
 * Database helper functions
 */

// Transform database row to Deal type
function dbRowToDeal(row: any): Deal {
  const location = typeof row.location === 'string' 
    ? JSON.parse(row.location) 
    : row.location;

  return {
    id: row.id,
    storeName: row.store_name,
    storeLogo: row.store_logo,
    category: row.category,
    title: row.title,
    description: row.description || '',
    image: row.image,
    discount: row.discount,
    originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
    discountedPrice: row.discounted_price ? parseFloat(row.discounted_price) : undefined,
    location: {
      lat: location.lat,
      lng: location.lng,
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      zipCode: location.zipCode || location.zip_code || '',
    },
    distance: row.distance,
    badge: row.badge,
    expiresAt: new Date(row.expires_at),
    views: row.views || 0,
    clicks: row.clicks || 0,
    partnerAppUrl: row.partner_app_url,
    partnerAppName: row.partner_app_name,
    deals: row.deals ? (typeof row.deals === 'string' ? JSON.parse(row.deals) : row.deals) : [],
  };
}

// Transform Deal to database row
function dealToDbRow(deal: Partial<Deal>): any {
  return {
    store_name: deal.storeName,
    store_logo: deal.storeLogo,
    category: deal.category,
    title: deal.title,
    description: deal.description,
    image: deal.image,
    discount: deal.discount,
    original_price: deal.originalPrice,
    discounted_price: deal.discountedPrice,
    location: deal.location ? JSON.stringify(deal.location) : null,
    badge: deal.badge,
    expires_at: deal.expiresAt ? new Date(deal.expiresAt).toISOString() : null,
    views: deal.views || 0,
    clicks: deal.clicks || 0,
    partner_app_url: deal.partnerAppUrl,
    partner_app_name: deal.partnerAppName,
    deals: deal.deals ? JSON.stringify(deal.deals) : '[]',
  };
}

/**
 * Get all deals (with optional filters)
 */
export async function getDeals(filters?: {
  category?: string;
  lat?: number;
  lng?: number;
  maxDistance?: number;
  sort?: string;
}): Promise<Deal[]> {
  try {
    // Use admin client if available, otherwise use regular client
    const client = supabaseAdmin || supabase;
    
    if (!client) {
      console.error('Supabase client not initialized. Check environment variables.');
      return [];
    }

    let query = client.from('deals').select('*');

    // Filter by category
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    // Filter by expiration (only show active deals)
    query = query.gte('expires_at', new Date().toISOString());

    // Execute query
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
      return [];
    }

    if (!data) return [];

    // Transform to Deal type
    let deals = data.map(dbRowToDeal);

    // Calculate distances if location provided
    if (filters?.lat && filters?.lng) {
      const { calculateDistance } = await import('./location');
      deals = deals.map((deal) => ({
        ...deal,
        distance: calculateDistance(
          { lat: filters.lat!, lng: filters.lng! },
          deal.location
        ),
      }));

      // Filter by max distance
      if (filters.maxDistance) {
        deals = deals.filter((deal) => (deal.distance || 0) <= filters.maxDistance!);
      }

      // Sort by distance
      if (filters.sort === 'closest') {
        deals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
    }

    // Sort by other criteria
    if (filters?.sort === 'highest-discount') {
      deals.sort((a, b) => b.discount - a.discount);
    } else if (filters?.sort === 'trending') {
      deals.sort((a, b) => b.views - a.views);
    }

    return deals;
  } catch (error) {
    console.error('Error in getDeals:', error);
    return [];
  }
}

/**
 * Get a single deal by ID
 */
export async function getDealById(id: string): Promise<Deal | null> {
  try {
    const client = supabaseAdmin || supabase;
    
    if (!client) {
      console.error('Supabase client not initialized. Check environment variables.');
      return null;
    }

    const { data, error } = await client
      .from('deals')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return dbRowToDeal(data);
  } catch (error) {
    console.error('Error fetching deal:', error);
    return null;
  }
}

/**
 * Create a new deal
 */
export async function createDeal(deal: Partial<Deal>): Promise<Deal | null> {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const dbRow = dealToDbRow(deal);
    const { data, error } = await supabaseAdmin
      .from('deals')
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      console.error('Error creating deal:', error);
      return null;
    }

    return dbRowToDeal(data);
  } catch (error) {
    console.error('Error in createDeal:', error);
    return null;
  }
}

/**
 * Update a deal
 */
export async function updateDeal(id: string, deal: Partial<Deal>): Promise<Deal | null> {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const dbRow = dealToDbRow(deal);
    const { data, error } = await supabaseAdmin
      .from('deals')
      .update(dbRow)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating deal:', error);
      return null;
    }

    return dbRowToDeal(data);
  } catch (error) {
    console.error('Error in updateDeal:', error);
    return null;
  }
}

/**
 * Delete a deal
 */
export async function deleteDeal(id: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured');
    }

    const { error } = await supabaseAdmin
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting deal:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteDeal:', error);
    return false;
  }
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(file: File, path: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin?.storage
      .from('deal-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error || !data) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin?.storage
      .from('deal-images')
      .getPublicUrl(data.path);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
}


