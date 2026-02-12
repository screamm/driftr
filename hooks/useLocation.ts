import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  error: string | null;
  loading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    locationName: null,
    error: null,
    loading: true,
  });

  const requestLocation = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setState((prev) => ({
        ...prev,
        error: "Location permission denied",
        loading: false,
      }));
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationName = geocode
        ? [geocode.city, geocode.region, geocode.country]
            .filter(Boolean)
            .join(", ")
        : null;

      setState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        locationName,
        error: null,
        loading: false,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Failed to get location",
        loading: false,
      }));
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return { ...state, requestLocation };
}
