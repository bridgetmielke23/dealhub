'use client';

import { useState, useEffect } from 'react';
import { getUserLocation, Coordinates } from './location';

export function useUserLocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    getUserLocation()
      .then((coords) => {
        setLocation(coords);
        setError(null);
      })
      .catch((err) => {
        console.error('Location error:', err);
        setError(err.message);
        if (err.code === 1) {
          setPermissionDenied(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const requestLocation = () => {
    setLoading(true);
    setError(null);
    getUserLocation()
      .then((coords) => {
        setLocation(coords);
        setError(null);
        setPermissionDenied(false);
      })
      .catch((err) => {
        setError(err.message);
        if (err.code === 1) {
          setPermissionDenied(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { location, loading, error, permissionDenied, requestLocation };
}

