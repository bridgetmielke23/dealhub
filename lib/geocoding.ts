/**
 * Free geocoding and location search utilities
 * Uses OpenStreetMap Nominatim (completely free, no API key required)
 */

export interface LocationResult {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  displayName: string;
  placeId?: string;
}

/**
 * Search for store locations using OpenStreetMap Nominatim
 * Completely free, no API key required
 */
export async function searchStoreLocations(
  storeName: string,
  city?: string,
  state?: string
): Promise<LocationResult[]> {
  try {
    // Build search query
    let query = storeName;
    if (city) {
      query += ` ${city}`;
    }
    if (state) {
      query += ` ${state}`;
    }
    query += ', USA';

    // Use Nominatim search API (free, no API key)
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&addressdetails=1` +
      `&limit=20` +
      `&countrycodes=us`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DealHub/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search locations');
    }

    const data = await response.json();

    // Transform results to our format
    const locations: LocationResult[] = data.map((item: any) => {
      const address = item.address || {};
      
      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name.split(',')[0] || address.road || '',
        city: address.city || address.town || address.village || address.municipality || '',
        state: address.state || '',
        zipCode: address.postcode || '',
        displayName: item.display_name,
        placeId: item.place_id?.toString(),
      };
    });

    return locations;
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to get address
 * Uses OpenStreetMap Nominatim (free)
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<LocationResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DealHub/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reverse geocode');
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      lat,
      lng,
      address: address.road || data.display_name.split(',')[0] || '',
      city: address.city || address.town || address.village || address.municipality || '',
      state: address.state || '',
      zipCode: address.postcode || '',
      displayName: data.display_name,
      placeId: data.place_id?.toString(),
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Geocode an address string to coordinates
 * Uses OpenStreetMap Nominatim (free)
 */
export async function geocodeAddress(
  address: string,
  city?: string,
  state?: string
): Promise<LocationResult | null> {
  try {
    let query = address;
    if (city) query += `, ${city}`;
    if (state) query += `, ${state}`;
    query += ', USA';

    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&addressdetails=1` +
      `&limit=1` +
      `&countrycodes=us`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DealHub/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to geocode address');
    }

    const data = await response.json();
    if (data.length === 0) return null;

    const item = data[0];
    const addr = item.address || {};

    return {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: item.display_name.split(',')[0] || addr.road || address,
      city: addr.city || addr.town || addr.village || addr.municipality || city || '',
      state: addr.state || state || '',
      zipCode: addr.postcode || '',
      displayName: item.display_name,
      placeId: item.place_id?.toString(),
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

