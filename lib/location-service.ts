/**
 * Location service for Workers Connect app
 * Handles geolocation and distance calculations
 */

import * as Location from 'expo-location';
import type { LocationObject } from 'expo-location';
import type { LocationSubscription } from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends LocationCoordinates {
  address?: string;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

/**
 * Request permission to access device location
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[LocationService] Permission request error:', error);
    return false;
  }
}

/**
 * Check if location permission is granted
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[LocationService] Permission check error:', error);
    return false;
  }
}

/**
 * Get current device location
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        console.warn('[LocationService] Location permission denied');
        return null;
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;

    // Try to get address
    let address: string | undefined;
    try {
      const reverseGeocoded = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (reverseGeocoded.length > 0) {
        const { street, city, region } = reverseGeocoded[0];
        address = [street, city, region].filter(Boolean).join(', ');
      }
    } catch (error) {
      console.warn('[LocationService] Reverse geocoding failed:', error);
    }

    return {
      latitude,
      longitude,
      address,
      accuracy: location.coords.accuracy || undefined,
      altitude: location.coords.altitude || undefined,
      heading: location.coords.heading || undefined,
      speed: location.coords.speed || undefined,
    };
  } catch (error) {
    console.error('[LocationService] Get current location error:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates in kilometers
 * Uses Haversine formula
 */
export function calculateDistance(
  coord1: LocationCoordinates,
  coord2: LocationCoordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Watch location changes (for real-time tracking)
 */
export function watchLocation(
  onLocationChange: (location: LocationData) => void,
  onError?: (error: Error) => void
): () => void {
  let subscription: LocationSubscription | null = null;

  const startWatching = async () => {
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or when moved 10 meters
        },
        (location: LocationObject) => {
          const { latitude, longitude } = location.coords;
          onLocationChange({
            latitude,
            longitude,
            accuracy: location.coords.accuracy || undefined,
          });
        }
      );
    } catch (error) {
      console.error('[LocationService] Watch location error:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  startWatching();

  // Return cleanup function
  return () => {
    if (subscription) {
      subscription.remove();
    }
  };
}

/**
 * Geocode address to coordinates
 */
export async function geocodeAddress(address: string): Promise<LocationCoordinates | null> {
  try {
    const results = await Location.geocodeAsync(address);
    if (results.length > 0) {
      const { latitude, longitude } = results[0];
      return { latitude, longitude };
    }
    return null;
  } catch (error) {
    console.error('[LocationService] Geocode address error:', error);
    return null;
  }
}

/**
 * Check if a point is within a radius of another point
 */
export function isWithinRadius(
  point: LocationCoordinates,
  center: LocationCoordinates,
  radiusKm: number
): boolean {
  const distance = calculateDistance(point, center);
  return distance <= radiusKm;
}
