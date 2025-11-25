/**
 * Location utilities for calculating distances and filtering deals
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get user's current location using browser geolocation API
 */
export function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Filter deals by distance from user location
 */
export function filterDealsByDistance(
  deals: Array<{ location: Coordinates }>,
  userLocation: Coordinates,
  maxDistanceKm: number = 50
): Array<{ location: Coordinates; distance: number }> {
  return deals
    .map((deal) => ({
      ...deal,
      distance: calculateDistance(userLocation, deal.location),
    }))
    .filter((deal) => deal.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Get center point from multiple coordinates (for map centering)
 */
export function getCenterPoint(coordinates: Coordinates[]): Coordinates {
  if (coordinates.length === 0) {
    return { lat: 40.7589, lng: -73.9851 }; // Default to NYC
  }

  const avgLat =
    coordinates.reduce((sum, coord) => sum + coord.lat, 0) /
    coordinates.length;
  const avgLng =
    coordinates.reduce((sum, coord) => sum + coord.lng, 0) /
    coordinates.length;

  return { lat: avgLat, lng: avgLng };
}

