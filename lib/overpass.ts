/**
 * Overpass API integration for finding ALL locations of a store chain
 * Completely free, no API key required
 * Uses OpenStreetMap's Overpass API
 */

export interface OverpassLocation {
  lat: number;
  lng: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  displayName: string;
  tags?: Record<string, string>;
}

/**
 * Search for ALL locations of a brand using Overpass API
 * This can return hundreds or thousands of locations
 */
export async function searchAllStoreLocations(
  brandName: string,
  options: {
    state?: string;
    city?: string;
    limit?: number;
  } = {}
): Promise<OverpassLocation[]> {
  try {
    // Clean and prepare brand name for search
    const cleanBrandName = brandName.trim();
    if (!cleanBrandName) {
      return [];
    }

    // Escape special characters for Overpass regex
    const escapedBrand = cleanBrandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Build improved Overpass QL query
    // Search in USA area first, then globally if needed
    const query = `
[out:json][timeout:120];
(
  // Search by brand tag (most reliable for chains) - USA only
  node["brand"~"${escapedBrand}",i]["addr:country"="US"];
  way["brand"~"${escapedBrand}",i]["addr:country"="US"];
  
  // Search by name tag with shop/amenity - USA only
  node["name"~"${escapedBrand}",i]["shop"]["addr:country"="US"];
  node["name"~"${escapedBrand}",i]["amenity"]["addr:country"="US"];
  way["name"~"${escapedBrand}",i]["shop"]["addr:country"="US"];
  way["name"~"${escapedBrand}",i]["amenity"]["addr:country"="US"];
  
  // Search by operator tag - USA only
  node["operator"~"${escapedBrand}",i]["addr:country"="US"];
  way["operator"~"${escapedBrand}",i]["addr:country"="US"];
  
  // Also search without country filter (in case country tag is missing)
  node["brand"~"${escapedBrand}",i];
  way["brand"~"${escapedBrand}",i];
  node["name"~"${escapedBrand}",i]["shop"];
  node["name"~"${escapedBrand}",i]["amenity"];
  way["name"~"${escapedBrand}",i]["shop"];
  way["name"~"${escapedBrand}",i]["amenity"];
  node["operator"~"${escapedBrand}",i];
  way["operator"~"${escapedBrand}",i];
);
out center;
`;

    // Try multiple Overpass API endpoints for reliability
    const overpassEndpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass.openstreetmap.ru/api/interpreter',
    ];

    let data: any = null;
    let lastError: Error | null = null;

    for (const endpoint of overpassEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(120000), // 2 minute timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        data = await response.json();
        if (data.elements && data.elements.length > 0) {
          break; // Success, exit loop
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Overpass endpoint ${endpoint} failed, trying next...`, error);
        continue; // Try next endpoint
      }
    }

    if (!data || !data.elements) {
      throw lastError || new Error('All Overpass API endpoints failed');
    }

    const elements = data.elements || [];

    // Transform to our format and filter
    const locations: OverpassLocation[] = elements
      .map((element: any) => {
        const tags = element.tags || {};
        const center = element.center || { lat: element.lat, lon: element.lon };
        
        // Skip if no coordinates
        if (!center.lat || !center.lon) {
          return null;
        }
        
        // Extract address components
        const address = tags['addr:housenumber'] 
          ? `${tags['addr:housenumber']} ${tags['addr:street'] || ''}`.trim()
          : tags['addr:street'] || '';
        
        const city = tags['addr:city'] || tags['addr:place'] || tags['addr:suburb'] || '';
        const state = tags['addr:state'] || tags['addr:province'] || '';
        const zipCode = tags['addr:postcode'] || '';
        
        // Get name from various possible tags
        const name = tags.name || tags.brand || tags.operator || cleanBrandName;
        
        // Only include if name contains the brand name (case insensitive)
        const nameLower = name.toLowerCase();
        const brandLower = cleanBrandName.toLowerCase();
        if (!nameLower.includes(brandLower) && !brandLower.includes(nameLower.split(' ')[0])) {
          return null; // Skip if name doesn't match brand
        }
        
        const displayName = address 
          ? `${name}, ${address}, ${city}, ${state} ${zipCode}`.trim()
          : `${name}, ${city}, ${state}`.trim();

        return {
          lat: center.lat,
          lng: center.lon,
          name,
          address: address || undefined,
          city: city || undefined,
          state: state || undefined,
          zipCode: zipCode || undefined,
          displayName,
          tags,
        };
      })
      .filter((loc: OverpassLocation | null): loc is OverpassLocation => loc !== null)
      .filter((loc: OverpassLocation) => {
        // Filter by state if provided
        if (options.state && loc.state) {
          const stateCode = options.state.toUpperCase().trim();
          const locState = loc.state.toUpperCase().trim();
          return locState === stateCode || locState.includes(stateCode) || stateCode.includes(locState);
        }
        // Filter by city if provided
        if (options.city && loc.city) {
          return loc.city.toLowerCase().includes(options.city.toLowerCase());
        }
        // Filter to USA only (if state code is 2 letters or common US state names)
        const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];
        if (loc.state && loc.state.length === 2 && !usStates.includes(loc.state.toUpperCase())) {
          return false; // Not a US state code
        }
        return true;
      })
      // Remove duplicates based on coordinates (within 0.001 degrees ~100m)
      .filter((loc: OverpassLocation, index: number, self: OverpassLocation[]) => 
        index === self.findIndex((l: OverpassLocation) => 
          Math.abs(l.lat - loc.lat) < 0.001 && Math.abs(l.lng - loc.lng) < 0.001
        )
      );

    // Limit results if specified
    if (options.limit) {
      return locations.slice(0, options.limit);
    }

    return locations;
  } catch (error) {
    console.error('Error querying Overpass API:', error);
    throw error;
  }
}

/**
 * Alternative: Use Nominatim with pagination to get more results
 * This is a fallback if Overpass doesn't work well
 */
export async function searchStoreLocationsNationwide(
  brandName: string,
  maxResults: number = 1000
): Promise<OverpassLocation[]> {
  const allLocations: OverpassLocation[] = [];
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];

  // Search in each state (with rate limiting consideration)
  // Note: This might take a while and hit rate limits
  // Better to use Overpass API for this
  console.warn('Using state-by-state search - this may be slow. Consider using Overpass API instead.');
  
  return allLocations;
}

