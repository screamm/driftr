import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsOnboarded: (value: boolean) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isOnboarded: false,
  error: null,

  setSession: (session) => {
    set({ session, user: session?.user ?? null, isLoading: false });
  },

  setProfile: (profile) => {
    set({ profile, isOnboarded: !!profile?.name && !!profile?.avatar_url });
  },

  setIsOnboarded: (value) => set({ isOnboarded: value }),

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        set({
          profile: data as Profile,
          isOnboarded: !!data.name && !!data.avatar_url,
          error: null,
        });
      }
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to fetch profile" });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({ profile: data as Profile, error: null });
      }
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to update profile" });
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Always clear local state even if server signOut fails
    }
    set({ session: null, user: null, profile: null, isOnboarded: false, error: null });
  },
}));
