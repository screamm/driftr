import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { NearbyProfile, ConnectionMode } from "@/types/database";

interface UseNearbyProfilesOptions {
  radiusKm?: number;
  mode?: ConnectionMode | "all";
}

export function useNearbyProfiles(options: UseNearbyProfilesOptions = {}) {
  const { radiusKm = 50, mode = "all" } = options;
  const [profiles, setProfiles] = useState<NearbyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearby = useCallback(
    async (latitude: number, longitude: number) => {
      setLoading(true);

      try {
        const { data, error: rpcError } = await supabase.rpc("nearby_profiles", {
          user_lat: latitude,
          user_lng: longitude,
          radius_km: radiusKm,
          filter_mode: mode === "all" ? "friends" : mode,
        });

        if (rpcError) throw rpcError;

        if (data) {
          setProfiles(data as NearbyProfile[]);
          setError(null);
        }
      } catch (err: any) {
        setError(err?.message ?? "Failed to fetch nearby profiles");
      } finally {
        setLoading(false);
      }
    },
    [radiusKm, mode],
  );

  return { profiles, loading, error, fetchNearby };
}
