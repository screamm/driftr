import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type {
  MatchWithProfile,
  Message,
  ConnectionMode,
} from "@/types/database";

interface MatchState {
  matches: MatchWithProfile[];
  activeChat: MatchWithProfile | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  fetchMatches: () => Promise<void>;
  setActiveChat: (match: MatchWithProfile | null) => void;
  fetchMessages: (matchId: string) => Promise<void>;
  sendMessage: (matchId: string, content: string) => Promise<void>;
  subscribeToMessages: (matchId: string) => () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  activeChat: null,
  messages: [],
  isLoading: false,
  error: null,

  fetchMatches: async () => {
    set({ isLoading: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (matchesError) throw matchesError;

      if (!matches) return;

      const matchesWithProfiles = (await Promise.all(
        matches.map(async (match) => {
          const otherUserId =
            match.user_a === user.id ? match.user_b : match.user_a;

          const { data: otherUser } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", otherUserId)
            .single();

          if (!otherUser) return null;

          const { data: lastMessage } = await supabase
            .from("messages")
            .select("*")
            .eq("match_id", match.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("match_id", match.id)
            .neq("sender_id", user.id)
            .gt("created_at", match.created_at);

          return {
            ...match,
            other_user: otherUser,
            last_message: lastMessage,
            unread_count: unreadCount ?? 0,
          } as MatchWithProfile;
        }),
      )).filter(Boolean) as MatchWithProfile[];

      set({ matches: matchesWithProfiles });
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to fetch matches" });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveChat: (match) => set({ activeChat: match }),

  fetchMessages: async (matchId) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      set({ messages: (data as Message[]) ?? [], error: null });
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to fetch messages" });
    }
  },

  sendMessage: async (matchId, content) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_id: user.id,
        content,
      });

      if (error) throw error;
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to send message" });
    }
  },

  subscribeToMessages: (matchId) => {
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
