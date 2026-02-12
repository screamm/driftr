import { useMatchStore } from "@/stores/match-store";
import {
  createMockQueryBuilder,
  mockSupabaseFrom,
  mockSupabaseAuth,
} from "../setup";

beforeEach(() => {
  useMatchStore.setState({
    matches: [],
    activeChat: null,
    messages: [],
    isLoading: false,
    error: null,
  });
  jest.clearAllMocks();
});

describe("match-store", () => {
  describe("fetchMatches", () => {
    it("sets isLoading true then false", async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const promise = useMatchStore.getState().fetchMatches();
      expect(useMatchStore.getState().isLoading).toBe(true);

      await promise;
      expect(useMatchStore.getState().isLoading).toBe(false);
    });

    it("returns early when no user", async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await useMatchStore.getState().fetchMatches();

      // from() should not be called since user is null
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it("sets error on failure", async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      mockSupabaseFrom.mockReturnValue(
        createMockQueryBuilder({ data: null, error: { message: "Network error" } }),
      );

      await useMatchStore.getState().fetchMatches();

      expect(useMatchStore.getState().error).toBe("Network error");
      expect(useMatchStore.getState().isLoading).toBe(false);
    });
  });

  describe("fetchMessages", () => {
    it("fetches and sets messages", async () => {
      const mockMessages = [
        { id: "m1", content: "Hello", match_id: "match-1", sender_id: "u1", created_at: "2025-01-01" },
        { id: "m2", content: "Hi", match_id: "match-1", sender_id: "u2", created_at: "2025-01-02" },
      ];

      mockSupabaseFrom.mockReturnValue(
        createMockQueryBuilder({ data: mockMessages, error: null }),
      );

      await useMatchStore.getState().fetchMessages("match-1");

      expect(useMatchStore.getState().messages).toEqual(mockMessages);
      expect(useMatchStore.getState().error).toBeNull();
    });

    it("sets error on failure", async () => {
      mockSupabaseFrom.mockReturnValue(
        createMockQueryBuilder({ data: null, error: { message: "Fetch failed" } }),
      );

      await useMatchStore.getState().fetchMessages("match-1");

      expect(useMatchStore.getState().error).toBe("Fetch failed");
    });
  });

  describe("setActiveChat", () => {
    it("sets active chat", () => {
      const match = { id: "match-1", other_user: { name: "Alice" } } as any;

      useMatchStore.getState().setActiveChat(match);

      expect(useMatchStore.getState().activeChat).toBe(match);
    });
  });

  describe("sendMessage", () => {
    it("sets error when insert fails", async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      mockSupabaseFrom.mockReturnValue(
        createMockQueryBuilder({ data: null, error: { message: "Insert failed" } }),
      );

      await useMatchStore.getState().sendMessage("match-1", "Hello");

      expect(useMatchStore.getState().error).toBe("Insert failed");
    });
  });
});
