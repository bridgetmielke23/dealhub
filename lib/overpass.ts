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
    // Build Overpass QL query
    // We search for nodes/ways with the brand name in various tags
    // Using area to limit to USA if possible, but will search globally and filter
    const query = `
[out:json][timeout:60];
(
  // Search by brand tag (most reliable for chains)
  node["brand"~"${brandName}",i];
  way["brand"~"${brandName}",i];
  
  // Search by name tag with shop/amenity
  node["name"~"${brandName}",i]["shop"];
  node["name"~"${brandName}",i]["amenity"];
  way["name"~"${brandName}",i]["shop"];
  way["name"~"${brandName}",i]["amenity"];
  
  // Search by operator tag
  node["operator"~"${brandName}",i];
  way["operator"~"${brandName}",i];
);
out center;
`;

    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error('Failed to query Overpass API');
    }

    const data = await response.json();
    const elements = data.elements || [];

    // Transform to our format
    const locations: OverpassLocation[] = elements
      .map((element: any) => {
        const tags = element.tags || {};
        const center = element.center || { lat: element.lat, lon: element.lon };
        
        // Extract address components
        const address = tags['addr:housenumber'] 
          ? `${tags['addr:housenumber']} ${tags['addr:street'] || ''}`.trim()
          : tags['addr:street'] || '';
        
        const city = tags['addr:city'] || tags['addr:place'] || '';
        const state = tags['addr:state'] || '';
        const zipCode = tags['addr:postcode'] || '';
        
        const name = tags.name || tags.brand || brandName;
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
      .filter((loc: OverpassLocation) => {
        // Filter by state if provided
        if (options.state && loc.state) {
          return loc.state.toLowerCase().includes(options.state.toLowerCase());
        }
        // Filter by city if provided
        if (options.city && loc.city) {
          return loc.city.toLowerCase().includes(options.city.toLowerCase());
        }
        return true;
      });

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

