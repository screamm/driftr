import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { usePremium } from "./usePremium";
import { FREE_WAVE_LIMIT } from "@/lib/constants";

export function useWaveLimit() {
  const { user } = useAuthStore();
  const { isPremium } = usePremium();
  const [wavesUsed, setWavesUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    if (!user || isPremium) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error: fetchError } = await supabase
        .from("daily_wave_count")
        .select("count")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      // PGRST116 = no rows found, which means 0 waves today
      if (fetchError && (fetchError as any).code !== "PGRST116") {
        throw fetchError;
      }

      setWavesUsed(data?.count ?? 0);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch wave count");
    } finally {
      setLoading(false);
    }
  }, [user, isPremium]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const wavesRemaining = isPremium
    ? Infinity
    : Math.max(0, FREE_WAVE_LIMIT - wavesUsed);
  const canWave = isPremium || wavesRemaining > 0;

  const incrementWave = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];

      const { error: rpcError } = await supabase.rpc("increment_wave_count", {
        p_user_id: user.id,
        p_date: today,
      });

      if (rpcError) throw rpcError;

      setWavesUsed((prev) => prev + 1);
    } catch (err: any) {
      setError(err?.message ?? "Failed to increment wave");
      throw err;
    }
  };

  return {
    wavesUsed,
    wavesRemaining,
    canWave,
    isPremium,
    loading,
    error,
    incrementWave,
    FREE_WAVE_LIMIT,
  };
}
